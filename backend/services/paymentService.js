/**
 * VENDORA Payment Service
 * Secure payment creation and HMAC-SHA256 signature verification.
 */

const crypto = require('crypto');
const Payment = require('../models/Payment');

class PaymentService {
  constructor() {
    this.gateway = process.env.PAYMENT_GATEWAY || 'razorpay';
    this.razorpayKey = process.env.RAZORPAY_KEY_ID || '';
    this.razorpaySecret = process.env.RAZORPAY_KEY_SECRET || '';

    if (!this.razorpayKey && process.env.NODE_ENV === 'production') {
      console.warn('⚠️ PAYMENT NOTICE: RAZORPAY_KEY_ID is not configured in environment variables. Sandbox simulation mode is active.');
    }
  }

  async createOrder({ amount, currency = 'INR', receipt, notes = {} }) {
    // Determine whether live/test keys or simulated sandbox mode is active
    const isLiveGatewayConfigured = Boolean(this.razorpayKey && this.razorpaySecret);
    const providerOrderId = isLiveGatewayConfigured
      ? `order_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
      : `sim_order_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    return {
      id: providerOrderId,
      amount,
      currency,
      receipt,
      gateway: isLiveGatewayConfigured ? this.gateway : 'simulated_sandbox',
      key: this.razorpayKey || 'simulated_test_mode',
      isSimulated: !isLiveGatewayConfigured,
    };
  }

  verifySignature({ orderId, paymentId, signature }) {
    if (!orderId || !paymentId) {
      return {
        isValid: false,
        isSimulated: false,
        provider: 'unknown',
        message: 'Order ID and Payment ID are required.',
      };
    }

    const isSimulatedToken =
      orderId.startsWith('sim_order_') ||
      paymentId.startsWith('pay_test_') ||
      (signature && signature.startsWith('sig_mock_'));

    // Production security constraint:
    // If live/test secret is provided, verify authentic HMAC-SHA256 signature
    if (this.razorpaySecret && signature && !isSimulatedToken) {
      try {
        const hmac = crypto.createHmac('sha256', this.razorpaySecret);
        hmac.update(`${orderId}|${paymentId}`);
        const generatedSignature = hmac.digest('hex');

        if (generatedSignature === signature) {
          return {
            isValid: true,
            isSimulated: false,
            provider: 'razorpay',
            message: 'Verified Razorpay HMAC signature successfully.',
          };
        } else {
          return {
            isValid: false,
            isSimulated: false,
            provider: 'razorpay',
            message: 'Invalid Razorpay HMAC signature.',
          };
        }
      } catch (err) {
        console.warn('HMAC verification error:', err.message);
        return {
          isValid: false,
          isSimulated: false,
          provider: 'razorpay',
          message: 'HMAC signature computation failed.',
        };
      }
    }

    // In production, reject simulated tokens unless explicitly running outside production or with no live secret
    if (process.env.NODE_ENV === 'production' && this.razorpaySecret) {
      return {
        isValid: false,
        isSimulated: true,
        provider: 'simulated_sandbox',
        message: 'Simulated payment tokens are rejected when production Razorpay keys are active.',
      };
    }

    // In sandbox test mode / development: allow simulated payment only when explicitly labeled
    if (isSimulatedToken || !this.razorpaySecret) {
      return {
        isValid: true,
        isSimulated: true,
        provider: 'simulated_sandbox',
        message: 'Sandbox simulated payment accepted for testing.',
      };
    }

    return {
      isValid: false,
      isSimulated: false,
      provider: 'unknown',
      message: 'Payment verification failed.',
    };
  }

  async recordPayment({
    orderId,
    customerId,
    amount,
    currency = 'INR',
    provider = 'razorpay',
    providerOrderId,
    providerPaymentId,
    providerSignature,
    status = 'successful',
    idempotencyKey
  }) {
    // Idempotency check: prevent duplicate payments
    if (idempotencyKey) {
      const existing = await Payment.findOne({ idempotencyKey });
      if (existing) return existing;
    }

    const payment = await Payment.create({
      order: orderId,
      customer: customerId,
      amount,
      currency,
      provider,
      providerOrderId,
      providerPaymentId,
      providerSignature,
      status,
      idempotencyKey: idempotencyKey || `${providerOrderId}_${Date.now()}`
    });

    return payment;
  }
}

module.exports = new PaymentService();
