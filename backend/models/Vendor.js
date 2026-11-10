const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  storeName: {
    type: String,
    required: [true, 'Please provide a store name'],
    unique: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  description: {
    type: String,
    default: '',
  },
  logo: {
    type: String,
    default: '',
  },
  banner: {
    type: String,
    default: '',
  },
  phone: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
  },
  taxId: {
    type: String,
    trim: true,
  },
  bankAccount: {
    accountHolder: String,
    accountNumber: String,
    bankName: String,
    ifscCode: String,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'suspended'],
    default: 'pending',
  },
  commissionRate: {
    type: Number,
    default: 10, // Platform default 10%
    min: 0,
    max: 100,
  },
  totalSales: {
    type: Number,
    default: 0, // In integer paise
  },
  totalEarnings: {
    type: Number,
    default: 0, // In integer paise
  },
  pendingPayouts: {
    type: Number,
    default: 0, // In integer paise
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  numReviews: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Vendor', vendorSchema);
