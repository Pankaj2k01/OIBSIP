# 🍕 Pizza Ordering System

A comprehensive full-stack pizza ordering system built with Node.js, Express, MongoDB Atlas, and featuring complete order management, payment integration, and admin dashboard.

## 🚀 Features

### 🔐 Authentication & Authorization
- JWT-based user authentication
- Role-based access control (User/Admin)
- Email verification system
- Password reset functionality

### 🍕 Pizza Customization
- Multiple pizza bases (Thin Crust, Thick Crust, etc.)
- Variety of sauces (Tomato, Pesto, BBQ, White Sauce)
- Cheese options (Mozzarella, Cheddar, Parmesan, Goat Cheese)
- Vegetarian toppings (Mushrooms, Bell Peppers, Onions, etc.)
- Meat options (Pepperoni, Sausage, Chicken, Ham)
- Size selection (Small, Medium, Large, Extra Large)
- Custom instructions support

### 💳 Payment Integration
- Razorpay payment gateway integration
- Secure payment processing
- Payment verification and order confirmation
- Multiple payment methods support

### 📋 Order Management
- Complete order lifecycle tracking
- Real-time order status updates
- Order history and details
- Order cancellation (before preparation)
- Order rating and review system

### 🛠 Admin Dashboard
- Inventory management with stock tracking
- Low stock alerts and monitoring
- Order status management
- Sales analytics and reporting
- User management
- Automated email notifications

### 📧 Email Notifications
- Order confirmation emails
- Order status update notifications
- Low stock alerts for admins
- Welcome emails for new users

### 📊 Monitoring & Analytics
- Health check endpoints
- Automated inventory monitoring
- Sales and revenue analytics
- Order statistics and insights

## 🛠 Technology Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB Atlas
- **Authentication:** JWT (JSON Web Tokens)
- **Payment:** Razorpay Integration
- **Email:** Nodemailer with Ethereal Email
- **Testing:** Jest + Supertest
- **Deployment:** PM2 Process Manager

### Security & Middleware
- **Security:** Helmet.js
- **CORS:** Configurable CORS policy
- **Rate Limiting:** Express Rate Limit
- **Validation:** Express Validator
- **Encryption:** bcryptjs for password hashing

## 🏗 Project Structure

```
OIBSIP/
├── backend/
│   ├── config/
│   │   ├── database.js         # MongoDB connection
│   │   └── razorpay.js         # Payment gateway config
│   ├── controllers/
│   │   ├── authController.js   # Authentication logic
│   │   ├── orderController.js  # Order management
│   │   ├── pizzaController.js  # Pizza ingredients
│   │   └── adminController.js  # Admin operations
│   ├── middleware/
│   │   ├── auth.js            # Authentication middleware
│   │   ├── validation.js      # Input validation
│   │   └── errorHandler.js    # Error handling
│   ├── models/
│   │   ├── User.js            # User schema
│   │   ├── Order.js           # Order schema
│   │   ├── PizzaBase.js       # Pizza base schema
│   │   ├── PizzaSauce.js      # Sauce schema
│   │   ├── PizzaCheese.js     # Cheese schema
│   │   ├── PizzaVeggie.js     # Vegetables schema
│   │   └── PizzaMeat.js       # Meat schema
│   ├── routes/
│   │   ├── auth.js            # Authentication routes
│   │   ├── orders.js          # Order management routes
│   │   ├── pizza.js           # Pizza ingredient routes
│   │   ├── admin.js           # Admin routes
│   │   └── health.js          # Health check routes
│   ├── services/
│   │   ├── emailService.js    # Email functionality
│   │   └── inventoryMonitor.js # Stock monitoring
│   ├── scripts/
│   │   ├── seedDatabase.js    # Database seeding
│   │   └── deploy.sh          # Deployment script
│   ├── tests/
│   │   ├── integration/
│   │   ├── setup.js
│   │   └── health.test.js
│   ├── utils/
│   │   └── asyncHandler.js    # Async error handling
│   ├── server.js              # Main server file
│   ├── package.json
│   └── .env                   # Environment variables
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- Razorpay account (for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Pankaj2k01/OIBSIP.git
   cd OIBSIP
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Update the `.env` file with your configuration:
   ```env
   NODE_ENV=development
   PORT=5000
   
   
   # Razorpay
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_secret
   
   # Email Configuration
   FROM_NAME=Pizza Order System
   FROM_EMAIL=noreply@pizzaorder.com
   
   # Client URL
   CLIENT_URL=http://localhost:3000
   ```

4. **Seed the database**
   ```bash
   npm run seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:5000`

### Testing

```bash
# Run all tests
npm test

# Run specific test file
npm test tests/health.test.js

# Run tests with coverage
npm run test:coverage
```

### Production Deployment

```bash
# Install dependencies
npm install --production

# Run deployment script
chmod +x scripts/deploy.sh
./scripts/deploy.sh

# Start with PM2
npm run pm2:start
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Password reset
- `GET /api/auth/verify-email/:token` - Email verification

### Pizza Management
- `GET /api/pizza/bases` - Get pizza bases
- `GET /api/pizza/sauces` - Get available sauces
- `GET /api/pizza/cheese` - Get cheese options
- `GET /api/pizza/veggies` - Get vegetable toppings
- `GET /api/pizza/meats` - Get meat options

### Orders
- `POST /api/orders/create-payment-order` - Create payment order
- `POST /api/orders/verify-payment` - Verify payment
- `GET /api/orders/user` - Get user orders
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/cancel` - Cancel order
- `POST /api/orders/:id/rate` - Rate order

### Admin
- `GET /api/admin/dashboard` - Admin dashboard data
- `GET /api/admin/orders` - All orders (admin)
- `PUT /api/admin/orders/:id/status` - Update order status
- `GET /api/admin/inventory` - Inventory overview
- `PUT /api/admin/inventory/:type/:id` - Update inventory

### Health Check
- `GET /health` - Server health status
- `GET /api/health/ready` - Readiness probe
- `GET /api/health/live` - Liveness probe

## 🧪 Test Accounts

After running the seed script, you can use these test accounts:

**Admin Account:**
- Email: `admin@pizzaorder.com`
- Password: `admin123456`

**User Account:**
- Email: `user@pizzaorder.com`
- Password: `user123456`

## 🛡 Security Features

- **Helmet.js:** Security headers
- **Rate Limiting:** API request throttling
- **CORS:** Cross-origin resource sharing control
- **JWT:** Secure token-based authentication
- **bcrypt:** Password hashing
- **Input Validation:** Request data validation
- **Error Handling:** Secure error responses

## 📈 Monitoring & Logging

- Health check endpoints for container orchestration
- Automated inventory monitoring with email alerts
- Error logging and handling
- Performance monitoring ready
- PM2 process management for production

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- MongoDB Atlas for database hosting
- Razorpay for payment processing
- Nodemailer for email functionality
- All the amazing open-source packages used in this project


---

**Built with ❤️ for pizza lovers everywhere! 🍕**
