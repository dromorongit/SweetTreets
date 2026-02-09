/**
 * Product Controller
 * Handles all product-related operations
 */

const Product = require('../models/Product');

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;
    
    // Build query
    const query = { isActive: true };
    
    if (category) {
      query.categories = { $in: [category] };
    }
    
    if (search) {
      query.$or = [
        { productName: { $regex: search, $options: 'i' } },
        { shortDescription: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Product.countDocuments(query);
    
    res.json({
      success: true,
      data: products,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
};

// Get products by category
exports.getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    const products = await Product.find({
      categories: { $in: [category] },
      isActive: true
    }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: products,
      category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching products by category',
      error: error.message
    });
  }
};

// Get new arrivals
exports.getNewArrivals = async (req, res) => {
  try {
    const products = await Product.find({
      isNewArrival: true,
      isActive: true
    }).sort({ createdAt: -1 }).limit(10);
    
    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching new arrivals',
      error: error.message
    });
  }
};

// Get fast selling products
exports.getFastSelling = async (req, res) => {
  try {
    const products = await Product.find({
      isFastSelling: true,
      isActive: true
    }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching fast selling products',
      error: error.message
    });
  }
};

// Get single product
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message
    });
  }
};

// Create product
exports.createProduct = async (req, res) => {
  try {
    const productData = {
      productName: req.body.productName,
      shortDescription: req.body.shortDescription,
      longDescription: req.body.longDescription,
      sizes: req.body.sizes ? (Array.isArray(req.body.sizes) ? req.body.sizes : [req.body.sizes]) : [],
      originalPrice: parseFloat(req.body.originalPrice),
      salesPrice: req.body.salesPrice ? parseFloat(req.body.salesPrice) : null,
      stockNumber: parseInt(req.body.stockNumber),
      categories: req.body.categories ? (Array.isArray(req.body.categories) ? req.body.categories : [req.body.categories]) : [],
      isNewArrival: req.body.isNewArrival === 'true' || req.body.isNewArrival === true,
      isFastSelling: req.body.isFastSelling === 'true' || req.body.isFastSelling === true
    };
    
    // Handle main image
    if (req.files && req.files.mainImage) {
      productData.mainImage = `/uploads/${req.files.mainImage[0].filename}`;
    }
    
    // Handle additional images
    if (req.files && req.files.additionalImages) {
      productData.additionalImages = req.files.additionalImages.map(
        file => `/uploads/${file.filename}`
      );
    }
    
    const product = await Product.create(productData);
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message
    });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    
    const updateData = {
      productName: req.body.productName,
      shortDescription: req.body.shortDescription,
      longDescription: req.body.longDescription,
      sizes: req.body.sizes ? (Array.isArray(req.body.sizes) ? req.body.sizes : [req.body.sizes]) : [],
      originalPrice: parseFloat(req.body.originalPrice),
      salesPrice: req.body.salesPrice ? parseFloat(req.body.salesPrice) : null,
      stockNumber: parseInt(req.body.stockNumber),
      categories: req.body.categories ? (Array.isArray(req.body.categories) ? req.body.categories : [req.body.categories]) : [],
      isNewArrival: req.body.isNewArrival === 'true' || req.body.isNewArrival === true,
      isFastSelling: req.body.isFastSelling === 'true' || req.body.isFastSelling === true
    };
    
    // Handle main image update
    if (req.files && req.files.mainImage) {
      updateData.mainImage = `/uploads/${req.files.mainImage[0].filename}`;
    }
    
    // Handle additional images update
    if (req.files && req.files.additionalImages) {
      const newImages = req.files.additionalImages.map(
        file => `/uploads/${file.filename}`
      );
      updateData.additionalImages = [...newImages];
    }
    
    const product = await Product.findByIdAndUpdate(
      productId,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating product',
      error: error.message
    });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error.message
    });
  }
};

// Deduct stock after order
exports.deductStock = async (req, res) => {
  try {
    const { quantity } = req.body;
    const productId = req.params.id;
    
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Check if enough stock
    if (product.stockNumber < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock'
      });
    }
    
    // Deduct stock
    product.stockNumber -= quantity;
    
    // Mark as out of stock if needed
    if (product.stockNumber === 0) {
      product.isActive = false;
    }
    
    await product.save();
    
    res.json({
      success: true,
      message: 'Stock deducted successfully',
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deducting stock',
      error: error.message
    });
  }
};

// Get low stock products
exports.getLowStock = async (req, res) => {
  try {
    const products = await Product.find({
      stockNumber: { $lt: 5 },
      isActive: true
    }).sort({ stockNumber: 1 });
    
    res.json({
      success: true,
      data: products,
      count: products.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching low stock products',
      error: error.message
    });
  }
};

// Get all products (admin - includes inactive)
exports.getAllProductsAdmin = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
};
