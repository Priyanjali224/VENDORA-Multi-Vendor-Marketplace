const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  sku: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0, // Integer paise: ₹100 = 10000
  },
  discountPrice: {
    type: Number,
    default: 0, // Optional discounted price in paise
    min: 0,
  },
  stock: {
    type: Number,
    required: [true, 'Stock count is required'],
    min: 0,
    default: 0,
  },
  lowStockThreshold: {
    type: Number,
    default: 5,
  },
  images: [{
    type: String,
  }],
  specifications: [{
    key: String,
    value: String,
  }],
  tags: [{
    type: String,
  }],
  ratingsAverage: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  ratingsCount: {
    type: Number,
    default: 0,
  },
  totalSales: {
    type: Number,
    default: 0,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ vendor: 1, category: 1, price: 1, ratingsAverage: -1 });

module.exports = mongoose.model('Product', productSchema);
