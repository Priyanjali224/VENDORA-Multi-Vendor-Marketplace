const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true, // in paise
  },
  currency: {
    type: String,
    default: 'INR',
  },
  provider: {
    type: String,
    enum: ['razorpay', 'stripe', 'cod', 'simulated_sandbox'],
    required: true,
  },
  providerOrderId: {
    type: String,
  },
  providerPaymentId: {
    type: String,
  },
  providerSignature: {
    type: String,
  },
  status: {
    type: String,
    enum: ['pending', 'successful', 'failed', 'refunded'],
    default: 'pending',
  },
  idempotencyKey: {
    type: String,
    unique: true,
    sparse: true,
  },
  refundAmount: {
    type: Number,
    default: 0,
  },
  refundReason: {
    type: String,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Payment', paymentSchema);
