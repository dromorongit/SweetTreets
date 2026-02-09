/**
 * Admin Controller
 * Handles admin authentication and operations
 */

const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'sweettreets_secret_key_2024', {
    expiresIn: '24h'
  });
};

// Login admin
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username and password'
      });
    }
    
    // Find admin
    const admin = await Admin.findOne({ username }).select('+password');
    
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Check password
    const isMatch = await admin.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Update last login
    admin.lastLogin = new Date();
    await admin.save();
    
    // Generate token
    const token = generateToken(admin._id);
    
    res.json({
      success: true,
      message: 'Login successful',
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Login error',
      error: error.message
    });
  }
};

// Register new admin (superadmin only)
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }
    
    // Check if admin exists
    const existingAdmin = await Admin.findOne({
      $or: [{ username }, { email }]
    });
    
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Username or email already exists'
      });
    }
    
    // Create admin
    const admin = await Admin.create({
      username,
      email,
      password,
      role: 'admin'
    });
    
    const token = generateToken(admin._id);
    
    res.status(201).json({
      success: true,
      message: 'Admin registered successfully',
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Registration error',
      error: error.message
    });
  }
};

// Get admin profile
exports.getProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id);
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        lastLogin: admin.lastLogin
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
};

// Seed initial admin (for development)
exports.seedAdmin = async (req, res) => {
  try {
    // Check if admin exists
    const existingAdmin = await Admin.findOne({ username: 'sweettreetsadmin' });
    
    if (existingAdmin) {
      return res.json({
        success: true,
        message: 'Admin already exists'
      });
    }
    
    // Create default admin
    const admin = await Admin.create({
      username: 'sweettreetsadmin',
      email: 'admin@sweettreets.com',
      password: 'sweettreets123@Alice',
      role: 'superadmin'
    });
    
    res.status(201).json({
      success: true,
      message: 'Default admin created',
      credentials: {
        username: 'sweettreetsadmin',
        password: 'sweettreets123@Alice'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error seeding admin',
      error: error.message
    });
  }
};
