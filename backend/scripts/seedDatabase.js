require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models
const User = require('../models/User');
const PizzaBase = require('../models/PizzaBase');
const PizzaSauce = require('../models/PizzaSauce');
const PizzaCheese = require('../models/PizzaCheese');
const PizzaVeggie = require('../models/PizzaVeggie');
const PizzaMeat = require('../models/PizzaMeat');

// Database connection
const connectDB = require('../config/database');

/**
 * Seeding script for initial database setup
 * This script will populate the database with sample data for testing and development
 */

// Sample data
const sampleBases = [
  {
    name: "Thin Crust",
    description: "Classic thin and crispy base with perfect balance",
    price: 150,
    category: "Classic",
    size: "12 inch",
    thickness: "Thin",
    calories: 180,
    protein: 8,
    carbs: 30,
    fat: 4,
    fiber: 2,
    imageUrl: "https://example.com/thin-crust.jpg",
    ingredients: ["Wheat flour", "Yeast", "Olive oil", "Salt"],
    isVegan: true,
    isGlutenFree: false,
    stock: 100,
    threshold: 20,
    isAvailable: true
  },
  {
    name: "Thick Crust",
    description: "Fluffy and hearty thick crust for pizza lovers",
    price: 180,
    category: "Premium",
    size: "12 inch",
    thickness: "Thick",
    calories: 250,
    protein: 12,
    carbs: 42,
    fat: 6,
    fiber: 3,
    imageUrl: "https://example.com/thick-crust.jpg",
    ingredients: ["Wheat flour", "Yeast", "Butter", "Salt", "Sugar"],
    isVegan: false,
    isGlutenFree: false,
    stock: 80,
    threshold: 15,
    isAvailable: true
  },
  {
    name: "Stuffed Crust",
    description: "Cheese-stuffed crust for extra indulgence",
    price: 220,
    category: "Premium",
    size: "12 inch",
    thickness: "Thick",
    calories: 320,
    protein: 18,
    carbs: 38,
    fat: 12,
    fiber: 2,
    imageUrl: "https://example.com/stuffed-crust.jpg",
    ingredients: ["Wheat flour", "Mozzarella cheese", "Butter", "Herbs"],
    isVegan: false,
    isGlutenFree: false,
    stock: 60,
    threshold: 10,
    isAvailable: true
  },
  {
    name: "Gluten-Free Base",
    description: "Healthy gluten-free option made with rice flour",
    price: 200,
    category: "Healthy",
    size: "12 inch",
    thickness: "Medium",
    calories: 200,
    protein: 6,
    carbs: 35,
    fat: 5,
    fiber: 4,
    imageUrl: "https://example.com/gluten-free.jpg",
    ingredients: ["Rice flour", "Almond flour", "Xanthan gum", "Olive oil"],
    isVegan: true,
    isGlutenFree: true,
    stock: 40,
    threshold: 8,
    isAvailable: true
  }
];

const sampleSauces = [
  {
    name: "Classic Marinara",
    description: "Traditional Italian tomato sauce with herbs",
    price: 80,
    category: "Classic",
    color: "Red",
    spiceLevel: "Mild",
    calories: 35,
    protein: 2,
    carbs: 8,
    fat: 0,
    fiber: 2,
    imageUrl: "https://example.com/marinara.jpg",
    ingredients: ["Tomatoes", "Garlic", "Basil", "Oregano"],
    isVegan: true,
    isGlutenFree: true,
    stock: 120,
    threshold: 25,
    isAvailable: true
  },
  {
    name: "BBQ Sauce",
    description: "Smoky and tangy BBQ sauce",
    price: 90,
    category: "Bold",
    color: "Brown",
    spiceLevel: "Medium",
    calories: 45,
    protein: 1,
    carbs: 11,
    fat: 0,
    fiber: 0,
    imageUrl: "https://example.com/bbq-sauce.jpg",
    ingredients: ["Tomatoes", "Vinegar", "Molasses", "Spices"],
    isVegan: true,
    isGlutenFree: true,
    stock: 90,
    threshold: 20,
    isAvailable: true
  },
  {
    name: "White Garlic Sauce",
    description: "Creamy garlic and herb white sauce",
    price: 100,
    category: "Gourmet",
    color: "White",
    spiceLevel: "Mild",
    calories: 80,
    protein: 3,
    carbs: 5,
    fat: 7,
    fiber: 0,
    imageUrl: "https://example.com/white-garlic.jpg",
    ingredients: ["Cream", "Garlic", "Parmesan", "Herbs"],
    isVegan: false,
    isGlutenFree: true,
    stock: 70,
    threshold: 15,
    isAvailable: true
  },
  {
    name: "Pesto Sauce",
    description: "Fresh basil pesto with pine nuts",
    price: 120,
    category: "Gourmet",
    color: "Green",
    spiceLevel: "Mild",
    calories: 90,
    protein: 4,
    carbs: 3,
    fat: 8,
    fiber: 1,
    imageUrl: "https://example.com/pesto.jpg",
    ingredients: ["Basil", "Pine nuts", "Olive oil", "Parmesan"],
    isVegan: false,
    isGlutenFree: true,
    stock: 50,
    threshold: 10,
    isAvailable: true
  }
];

const sampleCheeses = [
  {
    name: "Mozzarella",
    description: "Classic stretchy mozzarella cheese",
    price: 120,
    category: "Classic",
    type: "Fresh",
    fat: 22,
    protein: 22,
    calcium: 505,
    calories: 280,
    carbs: 2,
    fiber: 0,
    imageUrl: "https://example.com/mozzarella.jpg",
    origin: "Italy",
    meltingPoint: "Medium",
    aging: "Fresh",
    texture: "Smooth",
    isVegan: false,
    isLactoseFree: false,
    stock: 150,
    threshold: 30,
    isAvailable: true
  },
  {
    name: "Cheddar",
    description: "Sharp and tangy cheddar cheese",
    price: 140,
    category: "Premium",
    type: "Aged",
    fat: 33,
    protein: 25,
    calcium: 721,
    calories: 403,
    carbs: 1,
    fiber: 0,
    imageUrl: "https://example.com/cheddar.jpg",
    origin: "England",
    meltingPoint: "High",
    aging: "6 months",
    texture: "Crumbly",
    isVegan: false,
    isLactoseFree: false,
    stock: 100,
    threshold: 20,
    isAvailable: true
  },
  {
    name: "Parmesan",
    description: "Aged Italian parmesan with rich flavor",
    price: 160,
    category: "Gourmet",
    type: "Aged",
    fat: 29,
    protein: 35,
    calcium: 1184,
    calories: 431,
    carbs: 4,
    fiber: 0,
    imageUrl: "https://example.com/parmesan.jpg",
    origin: "Italy",
    meltingPoint: "High",
    aging: "24 months",
    texture: "Granular",
    isVegan: false,
    isLactoseFree: false,
    stock: 80,
    threshold: 15,
    isAvailable: true
  },
  {
    name: "Vegan Cheese",
    description: "Plant-based cheese alternative",
    price: 180,
    category: "Vegan",
    type: "Processed",
    fat: 20,
    protein: 1,
    calcium: 200,
    calories: 270,
    carbs: 8,
    fiber: 2,
    imageUrl: "https://example.com/vegan-cheese.jpg",
    origin: "Various",
    meltingPoint: "Medium",
    aging: "None",
    texture: "Smooth",
    isVegan: true,
    isLactoseFree: true,
    stock: 60,
    threshold: 12,
    isAvailable: true
  }
];

const sampleVeggies = [
  {
    name: "Bell Peppers",
    description: "Fresh colorful bell peppers",
    price: 60,
    category: "Peppers",
    color: "Mixed",
    season: "All year",
    calories: 20,
    protein: 1,
    carbs: 5,
    fat: 0,
    fiber: 2,
    vitaminC: 120,
    imageUrl: "https://example.com/bell-peppers.jpg",
    origin: "Local farms",
    isOrganic: false,
    prepMethod: "Sliced",
    isVegan: true,
    isGlutenFree: true,
    stock: 200,
    threshold: 40,
    isAvailable: true
  },
  {
    name: "Mushrooms",
    description: "Fresh button mushrooms",
    price: 80,
    category: "Mushrooms",
    color: "White",
    season: "All year",
    calories: 15,
    protein: 2,
    carbs: 2,
    fat: 0,
    fiber: 1,
    vitaminC: 0,
    imageUrl: "https://example.com/mushrooms.jpg",
    origin: "Local farms",
    isOrganic: true,
    prepMethod: "Sliced",
    isVegan: true,
    isGlutenFree: true,
    stock: 150,
    threshold: 30,
    isAvailable: true
  },
  {
    name: "Red Onions",
    description: "Sweet red onions",
    price: 40,
    category: "Onions",
    color: "Red",
    season: "All year",
    calories: 25,
    protein: 1,
    carbs: 6,
    fat: 0,
    fiber: 1,
    vitaminC: 15,
    imageUrl: "https://example.com/red-onions.jpg",
    origin: "Local farms",
    isOrganic: false,
    prepMethod: "Sliced",
    isVegan: true,
    isGlutenFree: true,
    stock: 180,
    threshold: 35,
    isAvailable: true
  },
  {
    name: "Olives",
    description: "Mediterranean black olives",
    price: 100,
    category: "Other",
    color: "Black",
    season: "All year",
    calories: 115,
    protein: 1,
    carbs: 6,
    fat: 11,
    fiber: 3,
    vitaminC: 0,
    imageUrl: "https://example.com/olives.jpg",
    origin: "Mediterranean",
    isOrganic: false,
    prepMethod: "Whole",
    isVegan: true,
    isGlutenFree: true,
    stock: 100,
    threshold: 20,
    isAvailable: true
  },
  {
    name: "Spinach",
    description: "Fresh baby spinach leaves",
    price: 70,
    category: "Leafy Greens",
    color: "Green",
    season: "All year",
    calories: 7,
    protein: 1,
    carbs: 1,
    fat: 0,
    fiber: 1,
    vitaminC: 28,
    imageUrl: "https://example.com/spinach.jpg",
    origin: "Local farms",
    isOrganic: true,
    prepMethod: "Fresh leaves",
    isVegan: true,
    isGlutenFree: true,
    stock: 120,
    threshold: 25,
    isAvailable: true
  }
];

const sampleMeats = [
  {
    name: "Pepperoni",
    description: "Classic spicy pepperoni",
    price: 150,
    category: "Processed",
    type: "Pork",
    cut: "Sliced",
    spiceLevel: "Medium",
    calories: 494,
    protein: 23,
    carbs: 2,
    fat: 44,
    cholesterol: 79,
    sodium: 1800,
    imageUrl: "https://example.com/pepperoni.jpg",
    origin: "Italy",
    curing: "Dry cured",
    thickness: "Thin",
    diameter: "Small",
    isProcessed: true,
    isHalal: false,
    stock: 120,
    threshold: 25,
    isAvailable: true
  },
  {
    name: "Chicken Tikka",
    description: "Marinated grilled chicken pieces",
    price: 180,
    category: "Grilled",
    type: "Poultry",
    cut: "Cubes",
    spiceLevel: "Medium",
    calories: 239,
    protein: 27,
    carbs: 0,
    fat: 14,
    cholesterol: 85,
    sodium: 400,
    imageUrl: "https://example.com/chicken-tikka.jpg",
    origin: "India",
    curing: "Marinated",
    thickness: "Chunks",
    diameter: "Medium",
    isProcessed: false,
    isHalal: true,
    stock: 100,
    threshold: 20,
    isAvailable: true
  },
  {
    name: "Italian Sausage",
    description: "Seasoned Italian pork sausage",
    price: 160,
    category: "Fresh",
    type: "Pork",
    cut: "Crumbled",
    spiceLevel: "Medium",
    calories: 346,
    protein: 19,
    carbs: 4,
    fat: 28,
    cholesterol: 65,
    sodium: 1207,
    imageUrl: "https://example.com/italian-sausage.jpg",
    origin: "Italy",
    curing: "Fresh",
    thickness: "Crumbles",
    diameter: "Small",
    isProcessed: true,
    isHalal: false,
    stock: 80,
    threshold: 15,
    isAvailable: true
  },
  {
    name: "Bacon",
    description: "Crispy smoked bacon strips",
    price: 170,
    category: "Processed",
    type: "Pork",
    cut: "Strips",
    spiceLevel: "Mild",
    calories: 541,
    protein: 37,
    carbs: 1,
    fat: 42,
    cholesterol: 110,
    sodium: 1717,
    imageUrl: "https://example.com/bacon.jpg",
    origin: "Local",
    curing: "Smoked",
    thickness: "Strips",
    diameter: "Long",
    isProcessed: true,
    isHalal: false,
    stock: 90,
    threshold: 18,
    isAvailable: true
  }
];

// Admin user data
const adminUser = {
  name: "Admin User",
  email: "admin@pizzaorder.com",
  password: "admin123456",
  phone: "+1234567890",
  role: "admin",
  address: {
    street: "123 Admin Street",
    city: "Admin City",
    state: "Admin State",
    zipCode: "12345"
  },
  isEmailVerified: true
};

// Regular user data
const regularUser = {
  name: "Test User",
  email: "user@pizzaorder.com",
  password: "user123456",
  phone: "+0987654321",
  role: "user",
  address: {
    street: "456 User Avenue",
    city: "User City",
    state: "User State",
    zipCode: "67890"
  },
  isEmailVerified: true
};

async function seedDatabase() {
  try {
    console.log('🚀 Starting database seeding...');
    
    // Connect to database
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      PizzaBase.deleteMany({}),
      PizzaSauce.deleteMany({}),
      PizzaCheese.deleteMany({}),
      PizzaVeggie.deleteMany({}),
      PizzaMeat.deleteMany({})
    ]);
    console.log('✅ Existing data cleared');

    // Hash passwords
    const adminHashedPassword = await bcrypt.hash(adminUser.password, 12);
    const userHashedPassword = await bcrypt.hash(regularUser.password, 12);

    // Seed users
    console.log('👥 Seeding users...');
    await User.create([
      { ...adminUser, password: adminHashedPassword },
      { ...regularUser, password: userHashedPassword }
    ]);
    console.log('✅ Users seeded');

    // Seed pizza ingredients
    console.log('🍕 Seeding pizza bases...');
    await PizzaBase.create(sampleBases);
    console.log('✅ Pizza bases seeded');

    console.log('🥫 Seeding pizza sauces...');
    await PizzaSauce.create(sampleSauces);
    console.log('✅ Pizza sauces seeded');

    console.log('🧀 Seeding cheeses...');
    await PizzaCheese.create(sampleCheeses);
    console.log('✅ Cheeses seeded');

    console.log('🥬 Seeding vegetables...');
    await PizzaVeggie.create(sampleVeggies);
    console.log('✅ Vegetables seeded');

    console.log('🥓 Seeding meats...');
    await PizzaMeat.create(sampleMeats);
    console.log('✅ Meats seeded');

    // Summary
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Seeded data summary:');
    console.log(`👥 Users: ${await User.countDocuments()}`);
    console.log(`🍕 Pizza Bases: ${await PizzaBase.countDocuments()}`);
    console.log(`🥫 Sauces: ${await PizzaSauce.countDocuments()}`);
    console.log(`🧀 Cheeses: ${await PizzaCheese.countDocuments()}`);
    console.log(`🥬 Vegetables: ${await PizzaVeggie.countDocuments()}`);
    console.log(`🥓 Meats: ${await PizzaMeat.countDocuments()}`);

    console.log('\n🔐 Test Accounts:');
    console.log('Admin: admin@pizzaorder.com / admin123456');
    console.log('User: user@pizzaorder.com / user123456');

    console.log('\n🚀 You can now start the application!');

  } catch (error) {
    console.error('❌ Database seeding failed:', error);
  } finally {
    process.exit(0);
  }
}

// Run seeding
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };