import React, { useEffect, useState } from 'react';
import API from '../services/api';

const AdminInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const invRes = await API.get('/admin/inventory');
      setInventory(invRes.data);
      const ordRes = await API.get('/admin/orders');
      setOrders(ordRes.data);
    } catch (err) {
      console.error(err.response?.data?.error || err.message);
    }
  };

  const updateStock = async (id, stock) => {
    try {
      await API.put(`/admin/inventory/${id}`, { stock: parseInt(stock) });
      setInventory(inventory.map(i => i._id === id ? { ...i, stock: parseInt(stock) } : i));
    } catch (err) {
      alert(err.response?.data?.error || 'Error updating stock');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/admin/orders/${id}`, { status });
      setOrders(orders.map(o => o._id === id ? { ...o, status } : o));
    } catch (err) {
      alert(err.response?.data?.error || 'Error updating status');
    }
  };

  return (
    <div className="container">
      <header>
        <h1>Admin Dashboard</h1>
        <img src="/images/pizza.jpg" alt="Pizza" style={{ width: '200px', height: '150px', marginBottom: '20px' }} />
      </header>
      <div className="admin-dashboard">
        <div className="inventory">
          <h2>Inventory Management</h2>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Stock</th>
                <th>Threshold</th>
                <th>Update Stock</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map(item => (
                <tr key={item._id}>
                  <td>{item.name}</td>
                  <td>{item.type}</td>
                  <td>{item.stock}</td>
                  <td>{item.threshold}</td>
                  <td>
                    <input type="number" defaultValue={item.stock} onBlur={(e) => updateStock(item._id, e.target.value)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="orders-admin">
          <h2>Order Management</h2>
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Items</th>
                <th>Total Price</th>
                <th>Status</th>
                <th>Update Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order._id}>
                  <td>{order.user?.email || 'N/A'}</td>
                  <td>{order.items.map(item => `${item.base || ''} ${item.sauce || ''} ${item.cheese || ''} ${item.veggies?.join(', ') || ''} ${item.meat?.join(', ') || ''}`.trim()).join('; ')}</td>
                  <td>₹{order.totalPrice}</td>
                  <td>{order.status}</td>
                  <td>
                    <select value={order.status} onChange={(e) => updateStatus(order._id, e.target.value)}>
                      <option value="order received">Order Received</option>
                      <option value="in the kitchen">In the Kitchen</option>
                      <option value="sent to delivery">Sent to Delivery</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminInventory;
