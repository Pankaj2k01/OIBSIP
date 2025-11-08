import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './OrderDetails.css';

const OrderDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedPizza, items: cartItems, total: cartTotal } = location.state || {};

  const items = selectedPizza ? [selectedPizza] : cartItems || [];
  const total = selectedPizza ? selectedPizza.price : cartTotal || 0;

  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    address: '',
    mobile: ''
  });

  const handleInputChange = (e) => {
    setCustomerDetails({
      ...customerDetails,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const orderData = {
        items,
        totalPrice: Number(total),
        customerDetails
      };

      console.log('Order data:', orderData); // Debug log

      const response = await api.post('/user/create-razorpay-order', { totalPrice: Number(total) });
      console.log('Razorpay response:', response.data); // Debug log
      const { order } = response.data;

      const options = {
        key: 'rzp_test_RchtsYaiULfqOl',
        amount: order.amount,
        currency: order.currency,
        name: 'Pizza Palace',
        description: 'Pizza Order',
        order_id: order.id,
        handler: async (response) => {
          console.log('Payment response:', response); // Debug log
          // For test mode, use dummy paymentId if not present
          const paymentId = response.razorpay_payment_id || 'test_payment_' + Date.now();
          try {
            await api.post('/user/order', {
              ...orderData,
              paymentId
            });
            alert('Order placed successfully!');
            localStorage.removeItem('cart');
            navigate('/orders');
          } catch (error) {
            console.error('Order placement failed:', error);
            alert('Order placement failed. Please try again.');
          }
        },
        modal: {
          ondismiss: function() {
            console.log('Payment modal dismissed');
          }
        },
        prefill: {
          name: customerDetails.name,
          email: '', // You can add email if available
          contact: customerDetails.mobile
        },
        theme: {
          color: '#d32f2f'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Failed to create Razorpay order:', error);
      alert('Failed to create order. Please try again. Error: ' + error.message);
    }
  };

  return (
    <div className="order-details-container">
      <h2>Order Details</h2>
      <div className="order-summary">
        <h3>Order Summary</h3>
        {items.map((item, index) => (
          <div key={index} className="order-item">
            <img src={item.image} alt={item.name} className="order-item-image" />
            <div className="order-item-details">
              <h4>{item.name}</h4>
              <p>₹{item.price}</p>
            </div>
          </div>
        ))}
        <div className="order-total">
          <h3>Total: ₹{total}</h3>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="customer-details-form">
        <h3>Customer Details</h3>
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={customerDetails.name}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="address">Address:</label>
          <textarea
            id="address"
            name="address"
            value={customerDetails.address}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="mobile">Mobile:</label>
          <input
            type="tel"
            id="mobile"
            name="mobile"
            value={customerDetails.mobile}
            onChange={handleInputChange}
            required
          />
        </div>
        <button type="submit" className="proceed-payment-btn">Proceed to Payment</button>
      </form>
    </div>
  );
};

export default OrderDetails;
