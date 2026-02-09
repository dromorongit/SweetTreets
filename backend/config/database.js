/**
 * Database Configuration
 * MongoDB connection for Sweet Treets
 * Production-ready for Railway deployment
 */

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }
    
    // Set up mongoose connection options for production
    const options = {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    };
    
    await mongoose.connect(mongoURI, options);
    console.log('✅ MongoDB connected successfully');
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    
    // In production, don't continue if DB connection fails
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    
    // In development, continue in demo mode
    console.log('📝 Running in demo mode (limited functionality)');
  }
};

module.exports = connectDB;
