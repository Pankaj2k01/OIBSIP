import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

const PizzaCustomizer = ({ onOrder }) => {
  const navigate = useNavigate();
  const [ingredients, setIngredients] = useState({ bases: [], sauces: [], cheeses: [], veggies: [], meats: [] });
  const [customPizza, setCustomPizza] = useState({ base: '', sauce: '', cheese: '', veggies: [], meat: [] });
  const [pizzaType, setPizzaType] = useState('veg');

  useEffect(() => {
    API.get('/user/pizzas').then(res => {
      const data = res.data;
      setIngredients({
        bases: data.filter(i => i.type === 'base'),
        sauces: data.filter(i => i.type === 'sauce'),
        cheeses: data.filter(i => i.type === 'cheese'),
        veggies: data.filter(i => i.type === 'veggie'),
        meats: data.filter(i => i.type === 'meat'),
      });
    }).catch(err => console.error(err.response?.data?.error || err.message));
  }, []);

  const handleSubmit = () => {
    // Calculate price based on selections (dummy logic)
    let price = 200; // Base price
    if (customPizza.base) price += 50;
    if (customPizza.sauce) price += 30;
    if (customPizza.cheese) price += 40;
    price += customPizza.veggies.length * 20;
    price += customPizza.meat.length * 50;

    const selectedPizza = {
      name: 'Custom Pizza',
      price,
      image: 'https://www.google.com/url?sa=i&url=https%3A%2F%2Fpngtree.com%2Fso%2Fpizza&psig=AOvVaw3EOEg2MNnxr22aqdnZzSBw&ust=1762689560462000&source=images&cd=vfe&opi=89978449&ved=0CBIQjRxqFwoTCJjr_LrA4pADFQAAAAAdAAAAABAE',
      ...customPizza
    };

    // Navigate to order details with selected pizza
    navigate('/order-details', { state: { selectedPizza } });
  };

  return (
    <div className="container">
      <header>
        <h1>Customize Your Pizza</h1>
        <img src="/images/pizza.jpg" alt="Pizza" style={{ width: '200px', height: '150px', marginBottom: '20px' }} />
      </header>
      <div className="customizer">
        <div className="option">
          <label>
            <input type="radio" value="veg" checked={pizzaType === 'veg'} onChange={(e) => setPizzaType(e.target.value)} />
            Veg
          </label>
          <label>
            <input type="radio" value="non-veg" checked={pizzaType === 'non-veg'} onChange={(e) => setPizzaType(e.target.value)} />
            Non-Veg
          </label>
        </div>
        <div className="option">
          <img src="/images/base.jpg" alt="Base" />
          <select onChange={(e) => setCustomPizza({ ...customPizza, base: e.target.value })}>
            <option value="">Select Base</option>
            {ingredients.bases.map(b => <option key={b._id} value={b.name}>{b.name}</option>)}
          </select>
        </div>
        <div className="option">
          <img src="/images/sauce.jpg" alt="Sauce" />
          <select onChange={(e) => setCustomPizza({ ...customPizza, sauce: e.target.value })}>
            <option value="">Select Sauce</option>
            {ingredients.sauces.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
          </select>
        </div>
        <div className="option">
          <img src="/images/cheese.jpg" alt="Cheese" />
          <select onChange={(e) => setCustomPizza({ ...customPizza, cheese: e.target.value })}>
            <option value="">Select Cheese</option>
            {ingredients.cheeses.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
          </select>
        </div>
        {pizzaType === 'veg' && (
          <div className="option">
            <img src="/images/veggie.jpg" alt="Veggies" />
            <div className="checkbox-group">
              {ingredients.veggies.map(v => (
                <label key={v._id}>
                  <input type="checkbox" onChange={(e) => {
                    if (e.target.checked) {
                      setCustomPizza({ ...customPizza, veggies: [...customPizza.veggies, v.name] });
                    } else {
                      setCustomPizza({ ...customPizza, veggies: customPizza.veggies.filter(veg => veg !== v.name) });
                    }
                  }} />
                  {v.name}
                </label>
              ))}
            </div>
          </div>
        )}
        {pizzaType === 'non-veg' && (
          <div className="option">
            <img src="/images/meat.jpg" alt="Meat" />
            <div className="checkbox-group">
              {ingredients.meats.map(m => (
                <label key={m._id}>
                  <input type="checkbox" onChange={(e) => {
                    if (e.target.checked) {
                      setCustomPizza({ ...customPizza, meat: [...customPizza.meat, m.name] });
                    } else {
                      setCustomPizza({ ...customPizza, meat: customPizza.meat.filter(meat => meat !== m.name) });
                    }
                  }} />
                  {m.name}
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
      <button onClick={handleSubmit}>Proceed to Order</button>
    </div>
  );
};

export default PizzaCustomizer;
