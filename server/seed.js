const mongoose = require('mongoose');
const Ingredient = require('./models/Ingredient');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

const seedIngredients = async () => {
  const ingredients = [
    // Bases
    { type: 'base', name: 'Thin Crust', stock: 50 },
    { type: 'base', name: 'Thick Crust', stock: 50 },
    { type: 'base', name: 'Stuffed Crust', stock: 50 },
    { type: 'base', name: 'Gluten-Free', stock: 50 },
    { type: 'base', name: 'Whole Wheat', stock: 50 },

    // Sauces
    { type: 'sauce', name: 'Tomato', stock: 100 },
    { type: 'sauce', name: 'Pesto', stock: 100 },
    { type: 'sauce', name: 'Alfredo', stock: 100 },
    { type: 'sauce', name: 'BBQ', stock: 100 },
    { type: 'sauce', name: 'Garlic', stock: 100 },

    // Cheeses
    { type: 'cheese', name: 'Mozzarella', stock: 100 },
    { type: 'cheese', name: 'Cheddar', stock: 100 },
    { type: 'cheese', name: 'Parmesan', stock: 100 },

    // Veggies
    { type: 'veggie', name: 'Onions', stock: 100 },
    { type: 'veggie', name: 'Bell Peppers', stock: 100 },
    { type: 'veggie', name: 'Mushrooms', stock: 100 },
    { type: 'veggie', name: 'Olives', stock: 100 },
    { type: 'veggie', name: 'Tomatoes', stock: 100 },
    { type: 'veggie', name: 'Spinach', stock: 100 },
    { type: 'veggie', name: 'Jalapenos', stock: 100 },

    // Meats
    { type: 'meat', name: 'Pepperoni', stock: 100 },
    { type: 'meat', name: 'Sausage', stock: 100 },
    { type: 'meat', name: 'Chicken', stock: 100 },
    { type: 'meat', name: 'Bacon', stock: 100 },
    { type: 'meat', name: 'Ham', stock: 100 },
  ];

  await Ingredient.insertMany(ingredients);
  console.log('Ingredients seeded');
  process.exit();
};

seedIngredients();
