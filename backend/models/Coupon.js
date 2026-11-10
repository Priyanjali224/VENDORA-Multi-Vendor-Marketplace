const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    default: 'percentage',
  },
  discountValue: {
    type: Number,
    required: true, // percentage (e.g. 15) or flat paise (e.g. 50000 = ₹500)
    min: 1,
  },
  minOrderAmount: {
    type: Number,
    default: 0, // in paise
  },
  maxDiscountAmount: {
    type: Number,
    default: 0, // in paise, 0 means no cap
  },
  usageLimit: {
    type: Number,
    default: 1000,
  },
  usedCount: {
    type: Number,
    default: 0,
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: {
    type: Date,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Coupon', couponSchema);
