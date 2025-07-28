const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'eco_collect.db');

class Database {
  constructor() {
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
          console.error('Error opening database:', err);
          reject(err);
        } else {
          console.log('Connected to SQLite database');
          this.createTables().then(resolve).catch(reject);
        }
      });
    });
  }

  async createTables() {
    const queries = [
      // Users table
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Admin table
      `CREATE TABLE IF NOT EXISTS admin (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL DEFAULT 'admin',
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Bookings table
      `CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        address TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        photo TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`,

      // Contact messages table
      `CREATE TABLE IF NOT EXISTS contact_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Pricing items table
      `CREATE TABLE IF NOT EXISTS pricing_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        price REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    ];

    for (const query of queries) {
      await this.run(query);
    }

    // Run migrations
    await this.runMigrations();
    
    // Create default admin user if not exists
    await this.createDefaultAdmin();
    
    // Create default pricing items if table is empty
    await this.createDefaultPricingItems();
    
    console.log('Database tables created/verified');
  }

  async runMigrations() {
    try {
      // Check if user_id column exists in bookings table
      const tableInfo = await this.all("PRAGMA table_info(bookings)");
      const hasUserIdColumn = tableInfo.some(column => column.name === 'user_id');
      
      if (!hasUserIdColumn) {
        console.log('Adding user_id column to bookings table...');
        await this.run('ALTER TABLE bookings ADD COLUMN user_id INTEGER');
        console.log('Migration completed: Added user_id column to bookings table');
      }
    } catch (error) {
      console.error('Migration error:', error);
    }
  }

  async createDefaultAdmin() {
    try {
      const admin = await this.get('SELECT * FROM admin WHERE username = ?', ['admin']);
      
      if (!admin) {
        const defaultPassword = process.env.ADMIN_PASSWORD || 'admin123';
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);
        
        await this.run(
          'INSERT INTO admin (username, password) VALUES (?, ?)',
          ['admin', hashedPassword]
        );
        
        console.log(`Default admin created with password: ${defaultPassword}`);
        console.log('⚠️  IMPORTANT: Change the admin password in production!');
      }
    } catch (error) {
      console.error('Error creating default admin:', error);
    }
  }

  async createDefaultPricingItems() {
    try {
      const count = await this.get('SELECT COUNT(*) as count FROM pricing_items');
      
      if (count.count === 0) {
        const defaultItems = [
          { name: 'Plastic Bottles', description: 'Clean plastic bottles and containers', price: 5 },
          { name: 'Paper & Cardboard', description: 'Newspapers, magazines, cardboard boxes', price: 3 },
          { name: 'Metal Cans', description: 'Aluminum and steel cans', price: 8 },
          { name: 'Glass Bottles', description: 'Glass bottles and jars', price: 4 },
          { name: 'Electronic Waste', description: 'Old phones, computers, batteries', price: 15 },
          { name: 'Organic Waste', description: 'Kitchen scraps, garden waste', price: 2 }
        ];

        for (const item of defaultItems) {
          await this.run(
            'INSERT INTO pricing_items (name, description, price) VALUES (?, ?, ?)',
            [item.name, item.description, item.price]
          );
        }
        
        console.log('Default pricing items created');
      }
    } catch (error) {
      console.error('Error creating default pricing items:', error);
    }
  }

  // Helper methods for database operations
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // User methods
  async createUser(userData) {
    const { name, email, password } = userData;
    const result = await this.run(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, password]
    );
    return result.id;
  }

  async getUserByEmail(email) {
    return await this.get('SELECT * FROM users WHERE email = ?', [email]);
  }

  async getUserById(id) {
    return await this.get('SELECT * FROM users WHERE id = ?', [id]);
  }

  // Admin methods
  async getAdmin() {
    return await this.get('SELECT * FROM admin WHERE username = ?', ['admin']);
  }

  // Booking methods
  async createBooking(bookingData) {
    const { name, email, address, date, time, photo, status, user_id } = bookingData;
    const result = await this.run(
      'INSERT INTO bookings (user_id, name, email, address, date, time, photo, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [user_id || null, name, email, address, date, time, photo, status]
    );
    return result.id;
  }

  async getAllBookings() {
    return await this.all('SELECT * FROM bookings ORDER BY created_at DESC');
  }

  async getBookingById(id) {
    return await this.get('SELECT * FROM bookings WHERE id = ?', [id]);
  }

  async getBookingsByUserId(userId) {
    return await this.all('SELECT * FROM bookings WHERE user_id = ? ORDER BY created_at DESC', [userId]);
  }

  async updateBookingStatus(id, status) {
    return await this.run(
      'UPDATE bookings SET status = ? WHERE id = ?',
      [status, id]
    );
  }

  // Contact message methods
  async createContactMessage(messageData) {
    const { name, email, message } = messageData;
    const result = await this.run(
      'INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)',
      [name, email, message]
    );
    return result.id;
  }

  async getAllContactMessages() {
    return await this.all('SELECT * FROM contact_messages ORDER BY created_at DESC');
  }

  // Pricing methods
  async getAllPricingItems() {
    return await this.all('SELECT * FROM pricing_items ORDER BY name');
  }

  async getPricingItemById(id) {
    return await this.get('SELECT * FROM pricing_items WHERE id = ?', [id]);
  }

  async createPricingItem(itemData) {
    const { name, description, price } = itemData;
    const result = await this.run(
      'INSERT INTO pricing_items (name, description, price) VALUES (?, ?, ?)',
      [name, description, price]
    );
    return result.id;
  }

  async updatePricingItem(id, itemData) {
    const { name, description, price } = itemData;
    return await this.run(
      'UPDATE pricing_items SET name = ?, description = ?, price = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, description, price, id]
    );
  }

  async deletePricingItem(id) {
    return await this.run('DELETE FROM pricing_items WHERE id = ?', [id]);
  }

  // Close database connection
  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          reject(err);
        } else {
          console.log('Database connection closed');
          resolve();
        }
      });
    });
  }
}

module.exports = new Database();