/**
 * Product Model
 * Schema for products in Sweet Treets inventory
 */

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  shortDescription: {
    type: String,
    required: [true, 'Short description is required'],
    trim: true,
    maxlength: [500, 'Short description cannot exceed 500 characters']
  },
  longDescription: {
    type: String,
    required: [true, 'Long description is required'],
    trim: true
  },
  sizes: [{
    type: String,
    trim: true
  }],
  originalPrice: {
    type: Number,
    required: [true, 'Original price is required'],
    min: [0, 'Price cannot be negative']
  },
  salesPrice: {
    type: Number,
    min: [0, 'Sales price cannot be negative'],
    default: null
  },
  stockNumber: {
    type: Number,
    required: [true, 'Stock number is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  categories: [{
    type: String,
    enum: ['Snacks', 'Drinks', 'Groceries'],
    required: true
  }],
  mainImage: {
    type: String,
    default: ''
  },
  additionalImages: [{
    type: String
  }],
  isNewArrival: {
    type: Boolean,
    default: false
  },
  isFastSelling: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Virtual for calculating discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (this.salesPrice && this.salesPrice < this.originalPrice) {
    return Math.round(((this.originalPrice - this.salesPrice) / this.originalPrice) * 100);
  }
  return 0;
});

// Virtual for checking if out of stock
productSchema.virtual('isOutOfStock').get(function() {
  return this.stockNumber <= 0;
});

// Ensure virtuals are included in JSON output
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

// Index for search functionality
productSchema.index({ productName: 'text', shortDescription: 'text' });

module.exports = mongoose.model('Product', productSchema);
