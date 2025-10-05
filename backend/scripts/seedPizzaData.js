require('dotenv').config();
const mongoose = require('mongoose');
const PizzaBase = require('../models/PizzaBase');
const PizzaSauce = require('../models/PizzaSauce');
const PizzaCheese = require('../models/PizzaCheese');
const PizzaVeggie = require('../models/PizzaVeggie');
const PizzaMeat = require('../models/PizzaMeat');

const seedPizzaData = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      PizzaBase.deleteMany({}),
      PizzaSauce.deleteMany({}),
      PizzaCheese.deleteMany({}),
      PizzaVeggie.deleteMany({}),
      PizzaMeat.deleteMany({})
    ]);
    console.log('Cleared existing pizza data');

    // Seed Pizza Bases
    const pizzaBases = await PizzaBase.create([
      {
        name: 'Thin Crust',
        description: 'Crispy and light traditional thin crust',
        price: 8.99,
        stock: 50,
        threshold: 10,
        nutritionalInfo: {
          calories: 150,
          protein: 5,
          carbs: 28,
          fat: 2
        }
      },
      {
        name: 'Thick Crust',
        description: 'Fluffy and hearty thick crust pizza base',
        price: 10.99,
        stock: 45,
        threshold: 10,
        nutritionalInfo: {
          calories: 220,
          protein: 8,
          carbs: 40,
          fat: 4
        }
      },
      {
        name: 'Stuffed Crust',
        description: 'Thick crust stuffed with mozzarella cheese',
        price: 13.99,
        stock: 30,
        threshold: 8,
        nutritionalInfo: {
          calories: 280,
          protein: 12,
          carbs: 38,
          fat: 8
        }
      },
      {
        name: 'Gluten-Free',
        description: 'Crispy gluten-free crust made with rice flour',
        price: 12.99,
        stock: 25,
        threshold: 5,
        nutritionalInfo: {
          calories: 180,
          protein: 4,
          carbs: 32,
          fat: 3
        }
      },
      {
        name: 'Whole Wheat',
        description: 'Healthy whole wheat crust with extra fiber',
        price: 11.99,
        stock: 35,
        threshold: 8,
        nutritionalInfo: {
          calories: 190,
          protein: 7,
          carbs: 35,
          fat: 3
        }
      }
    ]);

    // Seed Pizza Sauces
    const pizzaSauces = await PizzaSauce.create([
      {
        name: 'Classic Marinara',
        description: 'Traditional tomato sauce with Italian herbs',
        price: 2.99,
        spiceLevel: 'Mild',
        stock: 100,
        threshold: 20,
        ingredients: ['Tomatoes', 'Basil', 'Oregano', 'Garlic']
      },
      {
        name: 'Spicy Arrabbiata',
        description: 'Fiery tomato sauce with red peppers and chili',
        price: 3.49,
        spiceLevel: 'Hot',
        stock: 80,
        threshold: 15,
        ingredients: ['Tomatoes', 'Red Peppers', 'Chili', 'Garlic']
      },
      {
        name: 'Creamy White Sauce',
        description: 'Rich and creamy garlic white sauce',
        price: 3.99,
        spiceLevel: 'Mild',
        stock: 70,
        threshold: 15,
        ingredients: ['Cream', 'Garlic', 'Parmesan', 'Herbs']
      },
      {
        name: 'BBQ Sauce',
        description: 'Smoky and tangy barbecue sauce',
        price: 3.29,
        spiceLevel: 'Medium',
        stock: 90,
        threshold: 18,
        ingredients: ['Tomatoes', 'Brown Sugar', 'Vinegar', 'Spices']
      },
      {
        name: 'Pesto',
        description: 'Fresh basil pesto with pine nuts',
        price: 4.49,
        spiceLevel: 'Mild',
        stock: 60,
        threshold: 12,
        ingredients: ['Basil', 'Pine Nuts', 'Parmesan', 'Olive Oil']
      }
    ]);

    // Seed Pizza Cheeses
    const pizzaCheeses = await PizzaCheese.create([
      {
        name: 'Mozzarella',
        description: 'Classic stretchy mozzarella cheese',
        price: 2.49,
        type: 'Fresh',
        stock: 80,
        threshold: 15,
        origin: 'Italy',
        nutritionalInfo: {
          calories: 85,
          protein: 6,
          fat: 6,
          calcium: 183
        }
      },
      {
        name: 'Cheddar',
        description: 'Sharp aged cheddar cheese',
        price: 2.99,
        type: 'Aged',
        stock: 70,
        threshold: 12,
        origin: 'England',
        nutritionalInfo: {
          calories: 113,
          protein: 7,
          fat: 9,
          calcium: 200
        }
      },
      {
        name: 'Parmesan',
        description: 'Aged Italian parmesan cheese',
        price: 3.49,
        type: 'Aged',
        stock: 60,
        threshold: 10,
        origin: 'Italy',
        nutritionalInfo: {
          calories: 108,
          protein: 10,
          fat: 7,
          calcium: 331
        }
      },
      {
        name: 'Goat Cheese',
        description: 'Creamy and tangy goat cheese',
        price: 4.29,
        type: 'Fresh',
        stock: 40,
        threshold: 8,
        origin: 'France',
        nutritionalInfo: {
          calories: 103,
          protein: 6,
          fat: 8,
          calcium: 40
        }
      },
      {
        name: 'Vegan Cheese',
        description: 'Plant-based cheese alternative',
        price: 3.99,
        type: 'Processed',
        stock: 35,
        threshold: 8,
        origin: 'USA',
        nutritionalInfo: {
          calories: 70,
          protein: 1,
          fat: 6,
          calcium: 200
        }
      }
    ]);

    // Seed Pizza Veggies
    const pizzaVeggies = await PizzaVeggie.create([
      {
        name: 'Bell Peppers',
        description: 'Fresh colorful bell peppers',
        price: 1.49,
        category: 'Peppers',
        stock: 60,
        threshold: 15,
        isOrganic: false,
        seasonality: ['Year-round'],
        nutritionalInfo: {
          calories: 24,
          fiber: 2,
          vitamins: ['Vitamin C', 'Vitamin A']
        }
      },
      {
        name: 'Mushrooms',
        description: 'Fresh button mushrooms',
        price: 1.99,
        category: 'Mushrooms',
        stock: 55,
        threshold: 15,
        isOrganic: true,
        seasonality: ['Year-round'],
        nutritionalInfo: {
          calories: 15,
          fiber: 1,
          vitamins: ['Vitamin D', 'B Vitamins']
        }
      },
      {
        name: 'Red Onions',
        description: 'Sweet and mild red onions',
        price: 1.29,
        category: 'Onions',
        stock: 70,
        threshold: 18,
        isOrganic: false,
        seasonality: ['Year-round'],
        nutritionalInfo: {
          calories: 32,
          fiber: 1.4,
          vitamins: ['Vitamin C', 'Folate']
        }
      },
      {
        name: 'Cherry Tomatoes',
        description: 'Sweet and juicy cherry tomatoes',
        price: 2.29,
        category: 'Tomatoes',
        stock: 45,
        threshold: 12,
        isOrganic: true,
        seasonality: ['Summer', 'Fall'],
        nutritionalInfo: {
          calories: 27,
          fiber: 1.6,
          vitamins: ['Vitamin C', 'Vitamin K', 'Lycopene']
        }
      },
      {
        name: 'Spinach',
        description: 'Fresh baby spinach leaves',
        price: 1.79,
        category: 'Leafy Greens',
        stock: 40,
        threshold: 10,
        isOrganic: true,
        seasonality: ['Spring', 'Fall', 'Winter'],
        nutritionalInfo: {
          calories: 23,
          fiber: 2.2,
          vitamins: ['Iron', 'Vitamin K', 'Folate']
        }
      },
      {
        name: 'Black Olives',
        description: 'Mediterranean black olives',
        price: 2.49,
        category: 'Other',
        stock: 50,
        threshold: 12,
        isOrganic: false,
        seasonality: ['Year-round'],
        nutritionalInfo: {
          calories: 115,
          fiber: 3.2,
          vitamins: ['Vitamin E', 'Healthy Fats']
        }
      }
    ]);

    // Seed Pizza Meats
    const pizzaMeats = await PizzaMeat.create([
      {
        name: 'Pepperoni',
        description: 'Classic spicy pepperoni slices',
        price: 3.49,
        type: 'Processed',
        stock: 40,
        threshold: 10,
        isHalal: false,
        spiceLevel: 'Medium',
        cookingMethod: 'Cured',
        nutritionalInfo: {
          calories: 141,
          protein: 6,
          fat: 13,
          sodium: 529
        }
      },
      {
        name: 'Italian Sausage',
        description: 'Seasoned Italian pork sausage',
        price: 3.99,
        type: 'Pork',
        stock: 35,
        threshold: 8,
        isHalal: false,
        spiceLevel: 'Medium',
        cookingMethod: 'Grilled',
        nutritionalInfo: {
          calories: 286,
          protein: 16,
          fat: 23,
          sodium: 765
        }
      },
      {
        name: 'Grilled Chicken',
        description: 'Tender grilled chicken breast strips',
        price: 4.29,
        type: 'Poultry',
        stock: 30,
        threshold: 8,
        isHalal: true,
        spiceLevel: 'None',
        cookingMethod: 'Grilled',
        nutritionalInfo: {
          calories: 231,
          protein: 43,
          fat: 5,
          sodium: 104
        }
      },
      {
        name: 'Canadian Bacon',
        description: 'Lean Canadian back bacon',
        price: 3.79,
        type: 'Pork',
        stock: 32,
        threshold: 8,
        isHalal: false,
        spiceLevel: 'None',
        cookingMethod: 'Smoked',
        nutritionalInfo: {
          calories: 147,
          protein: 19,
          fat: 7,
          sodium: 719
        }
      },
      {
        name: 'Beef Ground',
        description: 'Seasoned ground beef topping',
        price: 4.49,
        type: 'Beef',
        stock: 28,
        threshold: 6,
        isHalal: true,
        spiceLevel: 'Mild',
        cookingMethod: 'Grilled',
        nutritionalInfo: {
          calories: 293,
          protein: 26,
          fat: 20,
          sodium: 82
        }
      }
    ]);

    console.log('Pizza data seeded successfully:');
    console.log(`- ${pizzaBases.length} pizza bases`);
    console.log(`- ${pizzaSauces.length} pizza sauces`);
    console.log(`- ${pizzaCheeses.length} pizza cheeses`);
    console.log(`- ${pizzaVeggies.length} pizza veggies`);
    console.log(`- ${pizzaMeats.length} pizza meats`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding pizza data:', error);
    process.exit(1);
  }
};

seedPizzaData();