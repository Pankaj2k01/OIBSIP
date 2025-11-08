import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';

const Dashboard = ({ role }) => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (role === 'user') {
      fetchData();
    }
  }, [role]);

  const fetchData = async () => {
    try {
      const ordersRes = await API.get('/user/orders');
      setOrders(ordersRes.data);
    } catch (err) {
      console.error(err.response?.data?.error || err.message);
    }
  };



  return (
    <div className="container">
      <header>
        <h1>{role === 'user' ? 'User Dashboard' : 'Admin Dashboard'}</h1>
        <p>Welcome to Pizza Palace! Enjoy our delicious pizzas made with fresh ingredients.</p>
      </header>
      {role === 'user' && (
        <>
          <div className="dashboard-links">
            <Link to="/pizzas" className="dashboard-link">Browse Pizzas</Link>
            <Link to="/cart" className="dashboard-link">View Cart</Link>
            <Link to="/profile" className="dashboard-link">My Profile</Link>
          </div>
          <h2>Your Orders</h2>
          {orders.length === 0 ? (
            <p>You haven't placed any orders yet.</p>
          ) : (
            <div className="orders">
              {orders.map(order => (
                <div key={order._id} className="order-item">
                  <div className="order-header">
                    <h3>Order #{order._id.slice(-8)}</h3>
                    <span className={`status ${order.status?.toLowerCase().replace(' ', '-')}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="order-details">
                    {order.items && order.items.length > 0 && (
                      <div className="pizza-summary">
                        
                        <div className="pizza-info">
                          <h4>{order.items[0].name || 'Custom Pizza'}</h4>
                          <p><strong>Base:</strong> {order.items[0].base || 'N/A'}</p>
                          <p><strong>Sauce:</strong> {order.items[0].sauce || 'N/A'}</p>
                          <p><strong>Cheese:</strong> {order.items[0].cheese || 'N/A'}</p>
                          {order.items[0].veggies && order.items[0].veggies.length > 0 && (
                            <p><strong>Veggies:</strong> {order.items[0].veggies.join(', ')}</p>
                          )}
                          {order.items[0].meat && order.items[0].meat.length > 0 && (
                            <p><strong>Meat:</strong> {order.items[0].meat.join(', ')}</p>
                          )}
                        </div>
                      </div>
                    )}
                    <div className="order-total">
                      <p><strong>Total: ₹{order.totalPrice}</strong></p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
      {role === 'admin' && (
        <>
          <Link to="/admin-dashboard">Manage Inventory and Orders</Link>
        </>
      )}
    </div>
  );
};

export default Dashboard;
