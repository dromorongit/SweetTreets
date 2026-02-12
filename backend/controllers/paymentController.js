/**
 * Sweet Treets Payment Controller
 * Paystack Integration for Payment Processing
 */

const crypto = require('crypto');
const axios = require('axios');

// Paystack configuration
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

/**
 * Initialize a Paystack payment transaction
 * POST /api/payments/initialize
 */
exports.initializePayment = async (req, res) => {
  try {
    const { 
      email, 
      amount, 
      currency = 'GHS', 
      reference, 
      customerName,
      items,
      deliveryInfo 
    } = req.body;

    if (!email || !amount || !reference) {
      return res.status(400).json({
        success: false,
        message: 'Email, amount, and reference are required'
      });
    }

    // Convert amount to kobo (Paystack uses smallest currency unit)
    const amountInKobo = Math.round(amount * 100);

    // Generate order ID
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const orderId = `ST-${timestamp}-${random}`;

    // Prepare metadata for Paystack
    const metadata = {
      orderId,
      customerName,
      items: items || [],
      deliveryInfo: deliveryInfo || {},
      cancel_action: {
        url: `${process.env.FRONTEND_URL || 'https://sweettreets.com'}/checkout.html?canceled=true`
      }
    };

    // Make request to Paystack API
    const response = await axios.post(
      `${PAYSTACK_BASE_URL}/transaction/initialize`,
      {
        email,
        amount: amountInKobo,
        currency,
        reference,
        metadata,
        callback_url: `${process.env.FRONTEND_URL || 'https://sweettreets.com'}/payment-success.html`
      },
      {
        headers: {
          'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.status) {
      res.json({
        success: true,
        data: {
          authorizationUrl: response.data.data.authorization_url,
          accessCode: response.data.data.access_code,
          reference: response.data.data.reference,
          orderId
        }
      });
    } else {
      throw new Error(response.data.message || 'Payment initialization failed');
    }
  } catch (error) {
    console.error('Paystack initialization error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to initialize payment',
      error: error.response?.data?.message || error.message
    });
  }
};

/**
 * Verify a Paystack payment transaction
 * GET /api/payments/verify/:reference
 */
exports.verifyPayment = async (req, res) => {
  try {
    const { reference } = req.params;

    if (!reference) {
      return res.status(400).json({
        success: false,
        message: 'Payment reference is required'
      });
    }

    const response = await axios.get(
      `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
      {
        headers: {
          'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`
        }
      }
    );

    if (response.data.status && response.data.data.status === 'success') {
      // Payment successful
      const transactionData = response.data.data;
      
      res.json({
        success: true,
        data: {
          verified: true,
          reference: transactionData.reference,
          amount: transactionData.amount / 100, // Convert from kobo
          currency: transactionData.currency,
          status: transactionData.status,
          customer: transactionData.customer,
          metadata: transactionData.metadata,
          paidAt: transactionData.paid_at
        }
      });
    } else {
      res.json({
        success: true,
        data: {
          verified: false,
          status: response.data.data?.status || 'failed'
        }
      });
    }
  } catch (error) {
    console.error('Paystack verification error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: error.response?.data?.message || error.message
    });
  }
};

/**
 * Handle Paystack webhook events
 * POST /api/payments/webhook
 */
exports.handleWebhook = async (req, res) => {
  try {
    // Get the signature from the header
    const signature = req.headers['x-paystack-signature'];

    if (!signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing Paystack signature'
      });
    }

    // Verify the webhook signature
    const hash = crypto
      .createHmac('sha512', PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (hash !== signature) {
      console.error('Invalid Paystack webhook signature');
      return res.status(401).json({
        success: false,
        message: 'Invalid signature'
      });
    }

    const event = req.body;

    // Handle different event types
    switch (event.event) {
      case 'charge.success':
        // Payment was successful
        console.log('Payment successful:', event.data);
        // Here you would typically:
        // 1. Update order status in database
        // 2. Send confirmation email
        // 3. Notify admin via WhatsApp
        break;

      case 'charge.failed':
        // Payment failed
        console.log('Payment failed:', event.data);
        break;

      case 'invoice.created':
        // Invoice created
        console.log('Invoice created:', event.data);
        break;

      case 'invoice.payment_failed':
        // Invoice payment failed
        console.log('Invoice payment failed:', event.data);
        break;

      default:
        console.log('Unhandled Paystack event:', event.event);
    }

    // Always respond with 200 to acknowledge receipt
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed'
    });
  }
};

/**
 * Get payment methods available for a transaction
 * GET /api/payments/methods
 */
exports.getPaymentMethods = async (req, res) => {
  try {
    // Paystack supports various payment methods in Ghana
    const paymentMethods = [
      {
        id: 'card',
        name: 'Credit/Debit Card',
        description: 'Visa, Mastercard, etc.',
        icon: '💳'
      },
      {
        id: 'momo',
        name: 'Mobile Money',
        description: 'MTN, AirtelTigo, Vodafone',
        icon: '📱'
      },
      {
        id: 'bank',
        name: 'Bank Transfer',
        description: 'Direct bank payments',
        icon: '🏦'
      }
    ];

    res.json({
      success: true,
      data: paymentMethods
    });
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment methods'
    });
  }
};
