# Pizza Ordering System

A full-stack pizza ordering application built with React, Node.js, and MongoDB.

## Features

- **User Authentication**: Complete registration, login, email verification, and forgot password system
- **Admin Panel**: Separate admin login with inventory management
- **Pizza Customization**: Step-by-step pizza builder with multiple options
- **Payment Integration**: Razorpay payment gateway integration
- **Order Tracking**: Real-time order status updates
- **Inventory Management**: Admin dashboard for stock management
- **Email Notifications**: Automated stock alerts for admins

## Tech Stack

### Frontend
- React.js
- React Router
- Axios
- Bootstrap/Material-UI

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Nodemailer
- Razorpay SDK

## Project Structure

```
pizza-ordering-system/
├── frontend/          # React application
├── backend/           # Node.js API server
├── README.md
└── package.json
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Git

### Installation

1. Clone the repository
```bash
git clone https://github.com/Pankaj2k01/OIBSIP.git
cd pizza-ordering-system
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Install frontend dependencies
```bash
cd ../frontend
npm install
```

4. Set up environment variables
- Copy `.env.example` to `.env` in both frontend and backend directories
- Update the values according to your setup

5. Start the application
```bash
# Start backend (from backend directory)
npm start

# Start frontend (from frontend directory)
npm start
```

## API Documentation

The API documentation will be available at `http://localhost:5000/api-docs` when the server is running.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.