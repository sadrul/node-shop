import mongoose from 'mongoose';
import Product from './models/Product';

const products = [
  {
    name: 'Smartphone X',
    description: 'Latest smartphone with advanced features',
    price: 699.99,
    image: 'https://picsum.photos/400/400?random=1'
  },
  {
    name: 'Laptop Pro',
    description: 'High-performance laptop for professionals',
    price: 1299.99,
    image: 'https://picsum.photos/400/400?random=2'
  },
  {
    name: 'Wireless Headphones',
    description: 'Noise-cancelling wireless headphones',
    price: 199.99,
    image: 'https://picsum.photos/400/400?random=3'
  },
  {
    name: 'Smart Watch',
    description: 'Fitness and health tracking smartwatch',
    price: 249.99,
    image: 'https://picsum.photos/400/400?random=4'
  },
  {
    name: 'Tablet Ultra',
    description: 'Thin and light tablet with high-resolution display',
    price: 499.99,
    image: 'https://picsum.photos/400/400?random=5'
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/node-shop');
    console.log('Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert new products
    await Product.insertMany(products);
    console.log('Added sample products');

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase(); 