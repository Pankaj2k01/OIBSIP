import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Cart.css';

const Cart = () => {
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(savedCart);
    calculateTotal(savedCart);
  }, []);

  const calculateTotal = (cartItems) => {
    const totalPrice = cartItems.reduce((sum, item) => sum + item.price, 0);
    setTotal(totalPrice);
  };

  const removeFromCart = (index) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    calculateTotal(newCart);
  };

  const proceedToCheckout = () => {
    navigate('/order-details', { state: { items: cart, total } });
  };

  return (
    <div className="cart-container">
      <h2>Your Cart</h2>
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <div className="cart-items">
            {cart.map((item, index) => (
              <div key={index} className="cart-item">
                <img src={item.image} alt={item.name} className="cart-item-image" />
                <div className="cart-item-details">
                  <h3>{item.name}</h3>
                  {item.base ? (
                    <>
                      <p>Base: {item.base}</p>
                      <p>Sauce: {item.sauce}</p>
                      <p>Cheese: {item.cheese}</p>
                      <p>Veggies: {item.veggies?.join(', ') || 'None'}</p>
                      <p>Meat: {item.meat?.join(', ') || 'None'}</p>
                    </>
                  ) : (
                    <p>{item.description}</p>
                  )}
                  <p className="price">₹{item.price}</p>
                </div>
                <button onClick={() => removeFromCart(index)} className="remove-btn">Remove</button>
              </div>
            ))}
          </div>
          <div className="cart-total">
            <h3>Total: ₹{total}</h3>
            <button onClick={proceedToCheckout} className="checkout-btn">Proceed to Checkout</button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
