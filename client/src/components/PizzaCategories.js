import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PizzaCategories.css';

const addToCart = (pizza) => {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  cart.push(pizza);
  localStorage.setItem('cart', JSON.stringify(cart));
  alert(`${pizza.name} added to cart!`);
};

const PizzaCategories = () => {
  const navigate = useNavigate();

  const categories = [
    {
      name: 'Margherita',
      image: 'https://media.istockphoto.com/id/686957124/photo/pizza-margherita.jpg?s=612x612&w=0&k=20&c=STQALvMIjcgXPIvpXXUXItAl05QtbmEUQ_PfwSato48=',
      description: 'Classic cheese pizza with tomato sauce and mozzarella',
      category: 'veg',
      price: 299
    },
    {
      name: 'Pepperoni',
      image: 'https://as2.ftcdn.net/jpg/02/35/74/75/1000_F_235747502_DfW2l9ybEL7Bo87JAqvP76hIuVPdxto0.jpg',
      description: 'Spicy pepperoni with cheese and tomato sauce',
      category: 'non-veg',
      price: 399
    },
    {
      name: 'Veggie Supreme',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDnv6RDZxWWt7gIUVXZXfuaWDHTnI2HtcKfw&s',
      description: 'Loaded with fresh vegetables and cheese',
      category: 'veg',
      price: 349
    },
    {
      name: 'Meat Lovers',
      image: 'https://media.istockphoto.com/id/483367738/photo/homemade-meat-loves-pizza.jpg?s=612x612&w=0&k=20&c=NCrwrMA8vuUR5ABRZKTtIaOvAC96RAPjnxXi5fFG8RQ=',
      description: 'Ultimate meat pizza with various meats',
      category: 'non-veg',
      price: 449
    },
    {
      name: 'BBQ Chicken',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRknofa_9Vpomis8CZcooxiIe6afdQnVB6HXw&s',
      description: 'BBQ sauce with chicken and cheese',
      category: 'non-veg',
      price: 419
    },
    {
      name: 'Paneer Tikka',
      image: 'https://cdn.indiaphile.info/wp-content/uploads/2012/10/tandooripizza-2349.jpg?width=1200&crop_gravity=center&aspect_ratio=auto&q=75',
      description: 'Indian style paneer tikka pizza',
      category: 'veg',
      price: 379
    }
  ];

  const handleOrderNow = (category) => {
    navigate('/order-details', { state: { selectedPizza: category } });
  };

  return (
    <div className="pizza-categories-container">
      <h2>Choose Your Pizza</h2>
      <div className="categories-grid">
        {categories.map((category, index) => (
          <div key={index} className="category-card">
            <img src={category.image} alt={category.name} className="category-image" />
            <div className="category-info">
              <h3>{category.name}</h3>
              <p>{category.description}</p>
              <p className="price">₹{category.price}</p>
              <span className={`category-tag ${category.category}`}>{category.category}</span>
              <div className="card-buttons">
                <button onClick={() => addToCart(category)} className="add-to-cart-btn">Add to Cart</button>
                <button onClick={() => handleOrderNow(category)} className="order-now-btn">Order Now</button>
                <button onClick={() => navigate('/customize')} className="customize-btn">Customize Pizza</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PizzaCategories;
