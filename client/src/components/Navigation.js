import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navigation.css';

const Navigation = ({ role, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    onLogout();
    navigate('/');
  };

  if (role === 'admin') {
    return (
      <nav className="navbar">
        <div className="navbar-brand">
          <Link to="/admin-dashboard">Pizza Admin</Link>
        </div>
        <ul className="navbar-nav">
          <li><Link to="/admin-dashboard">Dashboard</Link></li>
          <li><Link to="/admin-inventory">Inventory</Link></li>
          <li><Link to="/admin-orders">Orders</Link></li>
          <li><button onClick={handleLogout} className="logout-btn">Logout</button></li>
        </ul>
      </nav>
    );
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/dashboard">Pizza Palace</Link>
      </div>
      <ul className="navbar-nav">
        <li><Link to="/dashboard">Home</Link></li>
        <li><Link to="/pizzas">Pizzas</Link></li>
        <li><Link to="/cart">Cart</Link></li>
        <li><Link to="/orders">Orders</Link></li>
        <li><Link to="/profile">Profile</Link></li>
        <li><button onClick={handleLogout} className="logout-btn">Logout</button></li>
      </ul>
    </nav>
  );
};

export default Navigation;
