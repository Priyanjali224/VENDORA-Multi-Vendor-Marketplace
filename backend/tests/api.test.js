const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/db');

// Models
const User = require('../models/User');
const Vendor = require('../models/Vendor');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const VendorOrder = require('../models/VendorOrder');
const Commission = require('../models/Commission');
const Coupon = require('../models/Coupon');
const Payment = require('../models/Payment');
const Review = require('../models/Review');

const searchService = require('../services/searchService');
const paymentService = require('../services/paymentService');

test.before(async () => {
  // Connect to embedded test database
  process.env.MONGODB_URI = '';
  await connectDB();
});

test.after(async () => {
  await disconnectDB();
});

test('1. Authentication: Customer Registration & Password Hashing', async () => {
  const customer = await User.create({
    name: 'Test Customer',
    email: 'testcustomer@example.com',
    password: 'securePassword123',
    role: 'customer',
  });

  assert.equal(customer.name, 'Test Customer');
  assert.equal(customer.role, 'customer');
  // Password must be hashed with bcrypt
  assert.notEqual(customer.password, 'securePassword123');

  const isMatch = await customer.matchPassword('securePassword123');
  assert.equal(isMatch, true);
});

test('2. Multi-Vendor Onboarding & Admin Approval Workflow', async () => {
  // Vendor User
  const vendorUser = await User.create({
    name: 'Electronics Merchant',
    email: 'merchant@example.com',
    password: 'merchantPassword123',
    role: 'vendor',
  });

  // Initial vendor profile should be "pending"
  const vendor = await Vendor.create({
    user: vendorUser._id,
    storeName: 'ElectroHub Online',
    slug: 'electrohub-online',
    description: 'Premier electronics and sound gear.',
    status: 'pending',
    commissionRate: 10,
  });

  assert.equal(vendor.status, 'pending');

  // Admin approves vendor
  vendor.status = 'approved';
  vendor.commissionRate = 12; // Custom 12% commission
  await vendor.save();

  const updated = await Vendor.findById(vendor._id);
  assert.equal(updated.status, 'approved');
  assert.equal(updated.commissionRate, 12);
});

test('3. Product Creation & Integer Paise Price Safety', async () => {
  const vendor = await Vendor.findOne({ slug: 'electrohub-online' });
  const category = await Category.create({
    name: 'Audio Gear',
    slug: 'audio-gear',
    description: 'Headphones and speakers',
  });

  // Price stored in integer paise: ₹2,499 = 249900 paise
  const product = await Product.create({
    name: 'Noise Cancelling Headphones X1',
    slug: 'noise-cancelling-headphones-x1',
    sku: 'EH-NC-001',
    description: 'Superior ANC audio gear.',
    vendor: vendor._id,
    category: category._id,
    price: 249900,
    discountPrice: 199900,
    stock: 25,
    lowStockThreshold: 5,
  });

  assert.equal(product.price, 249900);
  assert.equal(product.discountPrice, 199900);
  assert.equal(product.stock, 25);
});

test('4. Full-Text Search and Category Filtering', async () => {
  const result = await searchService.searchProducts({
    query: 'Noise Cancelling',
    minPrice: 100000,
    maxPrice: 300000,
  });

  assert.equal(result.products.length >= 1, true);
  assert.equal(result.products[0].name.includes('Noise Cancelling'), true);
});

test('5. Multi-Vendor Shopping Cart & Coupon Application', async () => {
  const customer = await User.findOne({ email: 'testcustomer@example.com' });
  const product = await Product.findOne({ slug: 'noise-cancelling-headphones-x1' });

  // Add to cart
  const cart = await Cart.create({
    user: customer._id,
    items: [{
      product: product._id,
      vendor: product.vendor,
      quantity: 2,
      priceAtAddition: product.discountPrice,
    }],
  });

  assert.equal(cart.items.length, 1);
  assert.equal(cart.items[0].quantity, 2);

  // Apply Coupon: 10% discount
  const subtotal = cart.items[0].priceAtAddition * cart.items[0].quantity; // 199900 * 2 = 399800 paise (₹3,998)
  const discountAmount = Math.round(subtotal * 0.10); // 39980 paise (₹399.80)

  cart.couponApplied = {
    code: 'SAVE10',
    discountPercentage: 10,
    discountAmount,
  };
  await cart.save();

  assert.equal(cart.couponApplied.discountAmount, 39980);
});

test('6. Multi-Vendor Order Splitting & Exact Platform Commission Calculation', async () => {
  const customer = await User.findOne({ email: 'testcustomer@example.com' });
  const product = await Product.findOne({ slug: 'noise-cancelling-headphones-x1' });
  const vendor = await Vendor.findById(product.vendor);

  const subtotal = 199900 * 2; // 399800 paise
  const discount = 39980;
  const taxable = subtotal - discount; // 359820 paise
  const tax = Math.round(taxable * 0.18); // 64768 paise (18% GST)
  const deliveryFee = 0; // Free over ₹500
  const grandTotal = taxable + tax + deliveryFee;

  // 1. Master Parent Order
  const parentOrder = await Order.create({
    orderNumber: 'VEN-TEST-9001',
    customer: customer._id,
    items: [{
      product: product._id,
      vendor: vendor._id,
      title: product.name,
      price: product.discountPrice,
      quantity: 2,
      subtotal,
    }],
    shippingAddress: {
      fullName: 'Test Buyer',
      phone: '+91 99999 88888',
      addressLine1: 'Test Avenue',
      city: 'Bangalore',
      state: 'Karnataka',
      postalCode: '560001',
    },
    paymentMethod: 'razorpay',
    paymentStatus: 'pending',
    orderStatus: 'PLACED',
    subtotal,
    discount,
    tax,
    deliveryFee,
    totalAmount: grandTotal,
  });

  assert.equal(parentOrder.orderNumber, 'VEN-TEST-9001');

  // 2. VendorOrder Partition & Commission
  // Vendor commission rate: 12%
  const commissionRate = vendor.commissionRate; // 12
  const commissionAmount = Math.floor((subtotal * commissionRate) / 100); // 47976 paise (₹479.76)
  const vendorEarnings = subtotal - commissionAmount; // 351824 paise (₹3,518.24)

  const vendorOrder = await VendorOrder.create({
    parentOrder: parentOrder._id,
    vendor: vendor._id,
    customer: customer._id,
    items: parentOrder.items,
    subtotal,
    commissionRate,
    commissionAmount,
    vendorEarnings,
    status: 'PLACED',
  });

  assert.equal(vendorOrder.subtotal, 399800);
  assert.equal(vendorOrder.commissionRate, 12);
  assert.equal(vendorOrder.commissionAmount, 47976);
  assert.equal(vendorOrder.vendorEarnings, 351824);
  assert.equal(vendorOrder.commissionAmount + vendorOrder.vendorEarnings, vendorOrder.subtotal);

  // Commission Ledger Entry
  const commissionEntry = await Commission.create({
    vendor: vendor._id,
    order: parentOrder._id,
    vendorOrder: vendorOrder._id,
    subtotal,
    commissionRate,
    commissionAmount,
    vendorEarnings,
    status: 'accrued',
  });

  assert.equal(commissionEntry.status, 'accrued');
});

test('7. Payment Verification & Idempotency Protection', async () => {
  const parentOrder = await Order.findOne({ orderNumber: 'VEN-TEST-9001' });

  // Record payment with unique idempotencyKey
  const payment = await paymentService.recordPayment({
    orderId: parentOrder._id,
    customerId: parentOrder.customer,
    amount: parentOrder.totalAmount,
    provider: 'razorpay',
    providerOrderId: 'order_rzp_mock_123',
    providerPaymentId: 'pay_rzp_mock_456',
    status: 'successful',
    idempotencyKey: 'IDEMP_KEY_VEN_9001_1',
  });

  assert.equal(payment.status, 'successful');

  // Attempt duplicate payment with same idempotencyKey - must return existing without duplicate insert
  const duplicatePayment = await paymentService.recordPayment({
    orderId: parentOrder._id,
    customerId: parentOrder.customer,
    amount: parentOrder.totalAmount,
    provider: 'razorpay',
    providerOrderId: 'order_rzp_mock_123',
    providerPaymentId: 'pay_rzp_mock_456',
    status: 'successful',
    idempotencyKey: 'IDEMP_KEY_VEN_9001_1',
  });

  assert.equal(duplicatePayment._id.toString(), payment._id.toString());
});

test('8. Verified Purchase Product Review', async () => {
  const customer = await User.findOne({ email: 'testcustomer@example.com' });
  const product = await Product.findOne({ slug: 'noise-cancelling-headphones-x1' });

  const review = await Review.create({
    product: product._id,
    customer: customer._id,
    rating: 5,
    title: 'Flawless sound!',
    comment: 'Crystal clear highs and deep bass.',
    isVerifiedPurchase: true,
    status: 'approved',
  });

  assert.equal(review.rating, 5);
  assert.equal(review.isVerifiedPurchase, true);
});
