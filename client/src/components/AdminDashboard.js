import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0, lowStockItems: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ordersRes, inventoryRes] = await Promise.all([
        api.get('/admin/orders'),
        api.get('/admin/inventory')
      ]);

      setOrders(ordersRes.data);
      setInventory(inventoryRes.data);

      // Calculate stats
      const totalOrders = ordersRes.data.length;
      const totalRevenue = ordersRes.data.reduce((sum, order) => sum + order.totalPrice, 0);
      const lowStockItems = inventoryRes.data.filter(item => item.stock <= item.threshold).length;

      setStats({ totalOrders, totalRevenue, lowStockItems });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await api.put(`/admin/orders/${orderId}`, { status });
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-content">
        <h1>Admin Dashboard</h1>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Orders</h3>
            <p className="stat-number">{stats.totalOrders}</p>
          </div>
          <div className="stat-card">
            <h3>Total Revenue</h3>
            <p className="stat-number">₹{stats.totalRevenue}</p>
          </div>
          <div className="stat-card">
            <h3>Low Stock Items</h3>
            <p className="stat-number">{stats.lowStockItems}</p>
          </div>
        </div>

        <div className="dashboard-section">
          <h2>Recent Orders</h2>
          <div className="orders-table">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 10).map(order => (
                  <tr key={order._id}>
                    <td>{order._id.slice(-8)}</td>
                    <td>{order.customerDetails?.name || 'N/A'}</td>
                    <td>{order.items?.length || 0} items</td>
                    <td>₹{order.totalPrice}</td>
                    <td>
                      <span className={`status ${order.status?.toLowerCase().replace(' ', '-')}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                        className="status-select"
                      >
                        <option value="Order Received">Order Received</option>
                        <option value="In the Kitchen">In the Kitchen</option>
                        <option value="Sent to Delivery">Sent to Delivery</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="dashboard-section">
          <h2>Low Stock Alert</h2>
          <div className="low-stock-list">
            {inventory.filter(item => item.stock <= item.threshold).map(item => (
              <div key={item._id} className="low-stock-item">
                <span>{item.name}</span>
                <span className="stock-count">Stock: {item.stock}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
