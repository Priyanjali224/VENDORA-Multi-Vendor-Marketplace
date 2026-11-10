const mongoose = require('mongoose');

const commissionSchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  vendorOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VendorOrder',
    required: true,
  },
  subtotal: {
    type: Number,
    required: true, // in paise
  },
  commissionRate: {
    type: Number,
    required: true,
  },
  commissionAmount: {
    type: Number,
    required: true, // in paise
  },
  vendorEarnings: {
    type: Number,
    required: true, // in paise
  },
  status: {
    type: String,
    enum: ['accrued', 'paid', 'reversed'],
    default: 'accrued',
  },
  payoutDate: {
    type: Date,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Commission', commissionSchema);
