const mongoose = require('mongoose');

const vendorOrderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true, // in paise
  },
  quantity: {
    type: Number,
    required: true,
  },
  subtotal: {
    type: Number,
    required: true, // in paise
  },
  image: {
    type: String,
    default: '',
  },
});

const vendorOrderSchema = new mongoose.Schema({
  parentOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [vendorOrderItemSchema],
  subtotal: {
    type: Number,
    required: true, // in paise
  },
  commissionRate: {
    type: Number,
    required: true, // e.g. 10 (%)
  },
  commissionAmount: {
    type: Number,
    required: true, // in paise: Math.floor((subtotal * commissionRate) / 100)
  },
  vendorEarnings: {
    type: Number,
    required: true, // in paise: subtotal - commissionAmount
  },
  status: {
    type: String,
    enum: ['PLACED', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'],
    default: 'PLACED',
  },
  trackingHistory: [{
    status: {
      type: String,
      enum: ['PLACED', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'],
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    note: String,
  }],
  payoutSettled: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

vendorOrderSchema.index({ vendor: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('VendorOrder', vendorOrderSchema);
