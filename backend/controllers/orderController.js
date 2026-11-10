const Order = require('../models/Order');
const VendorOrder = require('../models/VendorOrder');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
const Vendor = require('../models/Vendor');
const Commission = require('../models/Commission');
const paymentService = require('../services/paymentService');
const invoiceService = require('../services/invoiceService');

// @desc    Checkout cart and create parent Order + split VendorOrders
// @route   POST /api/orders/checkout
// @access  Private
exports.createCheckoutOrder = async (req, res, next) => {
  try {
    const { shippingAddress, paymentMethod = 'razorpay' } = req.body;

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.addressLine1 || !shippingAddress.city) {
      return res.status(400).json({ success: false, message: 'Complete shipping address is required.' });
    }

    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product')
      .populate('items.vendor');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Shopping cart is empty.' });
    }

    // Validate stock availability for all items before reservation
    for (const item of cart.items) {
      if (!item.product || !item.product.isActive) {
        return res.status(400).json({ success: false, message: `Product ${item.product?.name || 'unknown'} is unavailable.` });
      }
      if (item.product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${item.product.name}". Only ${item.product.stock} units available.`,
        });
      }
    }

    // Partition items by vendor
    const vendorMap = new Map();
    let totalSubtotal = 0;

    const orderItems = cart.items.map(item => {
      const p = item.product;
      const vId = item.vendor._id.toString();
      const unitPrice = p.discountPrice > 0 ? p.discountPrice : p.price;
      const itemSubtotal = unitPrice * item.quantity;
      totalSubtotal += itemSubtotal;

      if (!vendorMap.has(vId)) {
        vendorMap.set(vId, {
          vendor: item.vendor,
          items: [],
          subtotal: 0,
        });
      }

      const itemPayload = {
        product: p._id,
        vendor: item.vendor._id,
        title: p.name,
        price: unitPrice,
        quantity: item.quantity,
        subtotal: itemSubtotal,
        image: p.images && p.images[0] ? p.images[0] : '',
      };

      vendorMap.get(vId).items.push(itemPayload);
      vendorMap.get(vId).subtotal += itemSubtotal;

      return itemPayload;
    });

    // Discount & Tax calculations
    let discount = 0;
    if (cart.couponApplied && cart.couponApplied.discountAmount) {
      discount = cart.couponApplied.discountAmount;
    }

    const taxableAmount = Math.max(0, totalSubtotal - discount);
    const tax = Math.round(taxableAmount * 0.18); // 18% GST in paise
    const deliveryFee = totalSubtotal >= 50000 ? 0 : 4900;
    const grandTotal = taxableAmount + tax + deliveryFee;

    const orderNumber = `VEN-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 1. Create Parent Order
    const parentOrder = await Order.create({
      orderNumber,
      customer: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
      orderStatus: 'PLACED',
      subtotal: totalSubtotal,
      discount,
      tax,
      deliveryFee,
      totalAmount: grandTotal,
      couponApplied: cart.couponApplied,
      trackingHistory: [{
        status: 'PLACED',
        timestamp: new Date(),
        note: 'Order submitted by customer.',
      }],
    });

    // 2. Create VendorOrder partitions and Commission records
    const vendorOrdersCreated = [];
    for (const [vendorId, vData] of vendorMap.entries()) {
      const v = vData.vendor;
      const commissionRate = v.commissionRate !== undefined ? v.commissionRate : 10;
      const commissionAmount = Math.floor((vData.subtotal * commissionRate) / 100);
      const vendorEarnings = vData.subtotal - commissionAmount;

      const vOrder = await VendorOrder.create({
        parentOrder: parentOrder._id,
        vendor: v._id,
        customer: req.user._id,
        items: vData.items,
        subtotal: vData.subtotal,
        commissionRate,
        commissionAmount,
        vendorEarnings,
        status: 'PLACED',
        trackingHistory: [{
          status: 'PLACED',
          timestamp: new Date(),
          note: 'Vendor order assigned to merchant.',
        }],
      });

      // Record platform commission ledger
      await Commission.create({
        vendor: v._id,
        order: parentOrder._id,
        vendorOrder: vOrder._id,
        subtotal: vData.subtotal,
        commissionRate,
        commissionAmount,
        vendorEarnings,
        status: 'accrued',
      });

      // Update Vendor stats
      await Vendor.findByIdAndUpdate(v._id, {
        $inc: {
          totalSales: vData.subtotal,
          totalEarnings: vendorEarnings,
          pendingPayouts: vendorEarnings,
        },
      });

      vendorOrdersCreated.push(vOrder);
    }

    // 3. Decrement Inventory & Product Stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity, totalSales: item.quantity },
      });

      await Inventory.findOneAndUpdate(
        { product: item.product._id },
        { $inc: { quantity: -item.quantity } }
      );
    }

    // 4. Empty Cart
    await Cart.findOneAndUpdate(
      { user: req.user._id },
      { items: [], couponApplied: { code: null, discountPercentage: 0, discountAmount: 0 } }
    );

    // 5. Initialize payment order with payment gateway
    const paymentOrder = await paymentService.createOrder({
      amount: grandTotal,
      currency: 'INR',
      receipt: orderNumber,
    });

    res.status(201).json({
      success: true,
      order: parentOrder,
      vendorOrdersCount: vendorOrdersCreated.length,
      paymentData: {
        providerOrderId: paymentOrder.id,
        amount: grandTotal,
        currency: 'INR',
        gateway: paymentOrder.gateway,
        key: paymentOrder.key,
      },
      message: 'Order created successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify payment signature and complete order
// @route   POST /api/orders/:id/verify-payment
// @access  Private
exports.verifyPayment = async (req, res, next) => {
  try {
    const { providerOrderId, providerPaymentId, providerSignature } = req.body;
    const order = await Order.findOne({ _id: req.params.id, customer: req.user._id });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const verification = paymentService.verifySignature({
      orderId: providerOrderId,
      paymentId: providerPaymentId,
      signature: providerSignature,
    });

    if (!verification.isValid) {
      return res.status(400).json({
        success: false,
        message: verification.message || 'Payment verification failed. Invalid signature.'
      });
    }

    const recordedProvider = verification.isSimulated
      ? 'simulated_sandbox'
      : (order.paymentMethod || 'razorpay');

    // Record payment ledger
    await paymentService.recordPayment({
      orderId: order._id,
      customerId: req.user._id,
      amount: order.totalAmount,
      currency: 'INR',
      provider: recordedProvider,
      providerOrderId,
      providerPaymentId,
      providerSignature,
      status: 'successful',
      idempotencyKey: `${order.orderNumber}_${providerPaymentId}`,
    });

    order.paymentStatus = 'paid';
    order.orderStatus = 'CONFIRMED';
    order.trackingHistory.push({
      status: 'CONFIRMED',
      timestamp: new Date(),
      note: verification.isSimulated
        ? `Simulated test payment captured. Sandbox ID: ${providerPaymentId}`
        : `Verified Razorpay payment captured. Transaction ID: ${providerPaymentId}`,
    });

    await order.save();

    // Update vendor sub-orders to CONFIRMED
    await VendorOrder.updateMany(
      { parentOrder: order._id },
      {
        status: 'CONFIRMED',
        $push: {
          trackingHistory: {
            status: 'CONFIRMED',
            timestamp: new Date(),
            note: 'Payment captured successfully.',
          },
        },
      }
    );

    res.json({
      success: true,
      order,
      message: 'Payment verified and order confirmed.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get customer's orders
// @route   GET /api/orders/my-orders
// @access  Private
exports.getMyOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
      Order.find({ customer: req.user._id })
        .populate('items.vendor', 'storeName slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Order.countDocuments({ customer: req.user._id }),
    ]);

    res.json({
      success: true,
      orders,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order details & tracking by order ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderDetails = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name slug images')
      .populate('items.vendor', 'storeName slug phone logo');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Access control: customer who placed it or admin
    if (order.customer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this order.' });
    }

    const subOrders = await VendorOrder.find({ parentOrder: order._id })
      .populate('vendor', 'storeName slug logo phone');

    res.json({
      success: true,
      order,
      subOrders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order (if eligible)
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const order = await Order.findOne({ _id: req.params.id, customer: req.user._id });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const eligibleStatuses = ['PLACED', 'CONFIRMED'];
    if (!eligibleStatuses.includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled in '${order.orderStatus}' status as it may already be packed or shipped.`,
      });
    }

    order.orderStatus = 'CANCELLED';
    order.cancellationReason = reason || 'Cancelled by customer';
    order.trackingHistory.push({
      status: 'CANCELLED',
      timestamp: new Date(),
      note: `Cancelled by customer: ${reason || 'No reason provided'}`,
    });

    await order.save();

    // Restock inventory
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity, totalSales: -item.quantity },
      });
      await Inventory.findOneAndUpdate(
        { product: item.product },
        { $inc: { quantity: item.quantity } }
      );
    }

    // Cancel vendor sub-orders
    await VendorOrder.updateMany(
      { parentOrder: order._id },
      {
        status: 'CANCELLED',
        $push: {
          trackingHistory: {
            status: 'CANCELLED',
            timestamp: new Date(),
            note: 'Parent order cancelled by buyer.',
          },
        },
      }
    );

    res.json({
      success: true,
      order,
      message: 'Order cancelled successfully and inventory restored.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download PDF invoice for order
// @route   GET /api/orders/:id/invoice
// @access  Private
exports.downloadInvoice = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.vendor', 'storeName slug');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (order.customer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to download invoice.' });
    }

    invoiceService.generateInvoice(order, res);
  } catch (error) {
    next(error);
  }
};
