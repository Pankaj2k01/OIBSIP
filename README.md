# Pizza Ordering App

A full-stack pizza ordering application built with React, Node.js, Express, and MongoDB.

## Features

### User Features
- User registration and login with email verification
- Forgot password functionality
- Browse available pizza varieties
- Custom pizza builder (base, sauce, cheese, veggies, meat)
- Razorpay payment integration (test mode)
- Order history and status tracking
- Profile management

### Admin Features
- Admin login and dashboard
- Inventory management (bases, sauces, cheeses, veggies, meats)
- Order management with status updates
- Low stock email notifications
- Stock tracking and updates

## Tech Stack

### Frontend
- React.js
- React Router for navigation
- Axios for API calls
- CSS for styling

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcrypt for password hashing
- Nodemailer for emails
- Razorpay for payments

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   npm run install-all
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with:
   ```
   PORT=5001
   MONGO_URI=your_mongodb_connection_string
   EMAIL_FROM=no-reply@pizzaapp.test
   SMTP_HOST=sandbox.smtp.mailtrap.io
   SMTP_PORT=2525
   SMTP_USER=your_smtp_user
   SMTP_PASS=your_smtp_pass
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   ADMIN_EMAIL=admin@example.com
   STOCK_THRESHOLD=20
   FRONTEND_URL=http://localhost:3001
   ```

4. Start MongoDB locally or update MONGO_URI for cloud database

5. Seed the database:
   ```bash
   cd server && node seed.js
   ```

6. Start the application:
   ```bash
   npm run dev
   ```

   Or start separately:
   ```bash
   npm run start-server
   npm run start-client
   ```

## Test Credentials

For testing purposes, you can use the following login details:

- **Admin Login:**
  - Email: admin@example.com
  - Password: admin123

- **User Login:**
  - Email: user@example.com
  - Password: password123

## Usage

### User Flow
1. Register/Login as user
2. Browse pizzas or customize your own
3. Add to cart and checkout with Razorpay
4. Track order status in dashboard

### Admin Flow
1. Login as admin
2. Manage inventory stocks
3. Update order statuses
4. Receive low stock notifications

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User/Admin login
- `POST /api/auth/verify` - Email verification
- `POST /api/auth/forgot-password` - Forgot password
- `POST /api/auth/reset-password` - Reset password

### User
- `GET /api/user/pizzas` - Get available pizzas
- `POST /api/user/order` - Place order
- `GET /api/user/orders` - Get user orders

### Admin
- `GET /api/admin/inventory` - Get inventory
- `PUT /api/admin/inventory/:id` - Update stock
- `GET /api/admin/orders` - Get all orders
- `PUT /api/admin/orders/:id` - Update order status
- `PUT /api/admin/order/:id/payment` - Update payment ID

## Database Models

### User
- email, password, role, verified, verificationToken, resetPasswordToken

### Ingredient
- type, name, stock, threshold

### Order
- user, items, totalPrice, status, paymentId

## Payment Integration

Uses Razorpay test mode. For production, update keys and set to live mode.

## Email Notifications

Configured with Mailtrap for testing. Update SMTP settings for production.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to branch
5. Create a Pull Request
