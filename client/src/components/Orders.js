import React, { useEffect, useState } from 'react';
import API from '../services/api';

const Orders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await API.get('/user/orders');
      setOrders(response.data);
    } catch (err) {
      console.error(err.response?.data?.error || err.message);
    }
  };

  return (
    <div className="container">
      <h1>My Orders</h1>
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
                    <div className="order-total">
                  <p><strong>Total: ₹{order.totalPrice}</strong></p>
                </div>
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
                
                {order.customerDetails && (
                  <div className="customer-info">
                    <h4>Customer Details</h4>
                    <p><strong>Name:</strong> {order.customerDetails.name}</p>
                    <p><strong>Address:</strong> {order.customerDetails.address}</p>
                    <p><strong>Mobile:</strong> {order.customerDetails.mobile}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
