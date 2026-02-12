/**
 * Sweet Treets Payment Routes
 * Paystack Payment API Routes
 */

const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Initialize a payment transaction
router.post('/initialize', paymentController.initializePayment);

// Verify a payment transaction
router.get('/verify/:reference', paymentController.verifyPayment);

// Handle Paystack webhooks
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook);

// Get available payment methods
router.get('/methods', paymentController.getPaymentMethods);

module.exports = router;
