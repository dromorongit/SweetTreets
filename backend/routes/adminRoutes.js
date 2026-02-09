/**
 * Admin Routes
 * API routes for admin authentication
 */

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/auth');

// Public routes
router.post('/login', adminController.login);
router.post('/register', adminController.register);
router.post('/seed', adminController.seedAdmin);
router.get('/seed', adminController.seedAdmin);

// Protected routes
router.get('/profile', authMiddleware, adminController.getProfile);

module.exports = router;
