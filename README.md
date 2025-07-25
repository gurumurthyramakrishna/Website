# Eco Collect - Waste Management System

A comprehensive waste management system with booking functionality, admin panel, and pricing management.

## Features

- **User Registration & Authentication**: Secure user signup and login
- **Waste Pickup Booking**: Schedule waste collection with photo uploads
- **Contact System**: Contact form for customer inquiries
- **Admin Panel**: Manage bookings, pricing, and view messages
- **Pricing Management**: Dynamic pricing for different waste categories
- **Photo Upload**: Image upload for waste verification
- **Status Tracking**: Track booking status (pending, completing, completed)

## Tech Stack

### Backend
- **Node.js** with **Express.js**
- **SQLite** database
- **JWT** authentication
- **Multer** for file uploads
- **bcryptjs** for password hashing
- **Helmet** for security
- **CORS** enabled
- **Rate limiting**
- **Input validation**

### Frontend
- **HTML5** with **Bootstrap 5**
- **Vanilla JavaScript**
- **Responsive design**

## Installation

1. **Clone and setup**:
   ```bash
   cd /workspace
   npm install
   ```

2. **Environment setup**:
   - Copy `.env` file and modify if needed
   - Default admin password: `admin123`
   - Change JWT_SECRET and ADMIN_PASSWORD in production!

3. **Start the server**:
   ```bash
   npm start
   # For development with auto-restart:
   npm run dev
   ```

4. **Access the application**:
   - Frontend: `http://localhost:3000`
   - API: `http://localhost:3000/api`

## API Endpoints

### Authentication
- `POST /api/admin/login` - Admin login
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login

### Bookings
- `POST /api/bookings` - Create booking (with photo upload)
- `GET /api/bookings` - Get all bookings (admin only)
- `PUT /api/bookings/:id/status` - Update booking status (admin only)

### Contact
- `POST /api/contact` - Submit contact message
- `GET /api/contact` - Get all messages (admin only)

### Pricing
- `GET /api/pricing` - Get all pricing items
- `POST /api/pricing` - Add pricing item (admin only)
- `PUT /api/pricing/:id` - Update pricing item (admin only)
- `DELETE /api/pricing/:id` - Delete pricing item (admin only)

## File Structure

```
/workspace/
├── server.js              # Main server file
├── database.js            # Database operations
├── package.json           # Dependencies
├── .env                   # Environment variables
├── eco_collect.db         # SQLite database (auto-created)
├── uploads/               # Photo uploads (auto-created)
└── src/                   # Frontend files
    ├── index.html         # Homepage
    ├── booking.html       # Booking form
    ├── admin.html         # Admin panel
    ├── contact.html       # Contact form
    ├── signup.html        # User registration
    └── pricing.html       # Pricing page
```

## Usage

### For Users
1. **Register**: Sign up with name, email, and password
2. **Book Pickup**: Fill booking form with waste photo
3. **Contact**: Send messages through contact form
4. **View Pricing**: Check current rates for different waste types

### For Admins
1. **Login**: Use admin credentials (default: `admin123`)
2. **Manage Bookings**: View, update status of all bookings
3. **Pricing Control**: Add, edit, delete pricing items
4. **View Messages**: Read customer contact messages
5. **Photo Review**: View uploaded waste photos

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation and sanitization
- Rate limiting (100 requests per 15 minutes)
- File upload restrictions (images only, 5MB max)
- CORS configuration
- Helmet security headers
- SQL injection prevention

## Database Schema

### Users
- id, name, email, password, created_at

### Admin
- id, username, password, created_at

### Bookings
- id, name, email, address, date, time, photo, status, created_at

### Contact Messages
- id, name, email, message, created_at

### Pricing Items
- id, name, description, price, created_at, updated_at

## Development

1. **Install dev dependencies**:
   ```bash
   npm install --save-dev nodemon
   ```

2. **Run in development mode**:
   ```bash
   npm run dev
   ```

3. **Database operations**:
   - Database auto-initializes on startup
   - Default admin and pricing items created automatically
   - SQLite file: `eco_collect.db`

## Production Deployment

1. **Security checklist**:
   - Change `JWT_SECRET` in `.env`
   - Change `ADMIN_PASSWORD` in `.env`
   - Set `NODE_ENV=production`
   - Use HTTPS in production
   - Configure proper CORS origins

2. **Database**:
   - SQLite is included for simplicity
   - For production, consider PostgreSQL or MySQL

3. **File uploads**:
   - Ensure `uploads/` directory permissions
   - Consider cloud storage for scalability

## Troubleshooting

- **Cannot connect**: Check if port 3000 is available
- **Database errors**: Delete `eco_collect.db` to reset
- **File upload issues**: Check `uploads/` directory permissions
- **Admin login**: Default password is `admin123`

## License

ISC License