import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import PizzaCustomizer from './components/PizzaCustomizer';
import AdminInventory from './components/AdminInventory';
import Cart from './components/Cart';
import OrderDetails from './components/OrderDetails';
import PizzaCategories from './components/PizzaCategories';
import AdminDashboard from './components/AdminDashboard';
import Navigation from './components/Navigation';
import Orders from './components/Orders';
import Profile from './components/Profile';
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState('');

  useEffect(() => {
    if (token) {
      // Decode role from token or fetch from API
      // For simplicity, assume role is stored in localStorage
      setRole(localStorage.getItem('role'));
    }
  }, [token]);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setToken(null);
    setRole('');
  };

  return (
    <Router>
      <div className="App">
        {token && <Navigation role={role} onLogout={logout} />}
        <Routes>
          <Route path="/login" element={<Login setToken={setToken} setRole={setRole} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={token ? <Dashboard role={role} /> : <Navigate to="/login" />} />
          <Route path="/pizzas" element={token && role === 'user' ? <PizzaCategories /> : <Navigate to="/login" />} />
          <Route path="/customize" element={token && role === 'user' ? <PizzaCustomizer /> : <Navigate to="/login" />} />
          <Route path="/cart" element={token && role === 'user' ? <Cart /> : <Navigate to="/login" />} />
          <Route path="/order-details" element={token && role === 'user' ? <OrderDetails /> : <Navigate to="/login" />} />
          <Route path="/orders" element={token && role === 'user' ? <Orders /> : <Navigate to="/login" />} />
          <Route path="/profile" element={token && role === 'user' ? <Profile /> : <Navigate to="/login" />} />
          <Route path="/admin-dashboard" element={token && role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />} />
          <Route path="/admin-inventory" element={token && role === 'admin' ? <AdminInventory /> : <Navigate to="/login" />} />
          <Route path="/admin-orders" element={token && role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />} />
          <Route path="/" element={<Navigate to={token ? (role === 'admin' ? '/admin-dashboard' : '/dashboard') : '/login'} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
