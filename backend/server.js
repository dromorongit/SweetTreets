/**
 * Sweet Treets Backend Server
 * Main Express application
 * Production-ready for Railway deployment
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/database');

// Import routes
const productRoutes = require('./routes/productRoutes');
const adminRoutes = require('./routes/adminRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

// Initialize app
const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Serve backend assets (logo, favicon, etc.)
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Serve main frontend files (index, cart, checkout, etc.)
const frontendPath = path.join(__dirname, '..');
app.use(express.static(frontendPath));

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);

// Health check endpoint (Railway expects this)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Sweet Treets API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root health check for Railway
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Serve admin dashboard static files
app.use('/admin', express.static(path.join(__dirname, 'admin-dashboard')));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server - Railway sets PORT environment variable
const PORT = process.env.PORT || 3000;

// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

module.exports = app;
