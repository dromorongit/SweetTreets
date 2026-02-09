/**
 * Product Routes
 * API routes for product management
 */

const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

// Public routes
router.get('/', productController.getAllProducts);
router.get('/category/:category', productController.getProductsByCategory);
router.get('/new-arrivals', productController.getNewArrivals);
router.get('/fast-selling', productController.getFastSelling);
router.get('/low-stock', authMiddleware, productController.getLowStock);
router.get('/all', authMiddleware, productController.getAllProductsAdmin);
router.get('/:id', productController.getProduct);

// Protected routes
router.post('/', authMiddleware, upload.fields([
  { name: 'mainImage', maxCount: 1 },
  { name: 'additionalImages', maxCount: 10 }
]), productController.createProduct);

router.put('/:id', authMiddleware, upload.fields([
  { name: 'mainImage', maxCount: 1 },
  { name: 'additionalImages', maxCount: 10 }
]), productController.updateProduct);

router.delete('/:id', authMiddleware, productController.deleteProduct);
router.put('/deduct-stock/:id', productController.deductStock);

module.exports = router;
