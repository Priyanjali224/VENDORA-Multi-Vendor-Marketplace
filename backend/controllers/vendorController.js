const Vendor = require('../models/Vendor');
const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
const VendorOrder = require('../models/VendorOrder');
const Order = require('../models/Order');
const Commission = require('../models/Commission');
const searchService = require('../services/searchService');

// @desc    Get current vendor's profile & stats
// @route   GET /api/vendor/profile
// @access  Private (Vendor)
exports.getVendorProfile = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user._id });
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor profile not found.' });
    }

    res.json({ success: true, vendor });
  } catch (error) {
    next(error);
  }
};

// @desc    Update store profile
// @route   PUT /api/vendor/profile
// @access  Private (Vendor)
exports.updateVendorProfile = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user._id });
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor profile not found.' });
    }

    const { storeName, description, phone, email, taxId, bankAccount, logo, banner } = req.body;

    if (storeName && storeName !== vendor.storeName) {
      const exists = await Vendor.findOne({ storeName });
      if (exists) {
        return res.status(400).json({ success: false, message: 'Store name is already taken.' });
      }
      vendor.storeName = storeName;
      vendor.slug = storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    if (description !== undefined) vendor.description = description;
    if (phone !== undefined) vendor.phone = phone;
    if (email !== undefined) vendor.email = email;
    if (taxId !== undefined) vendor.taxId = taxId;
    if (bankAccount !== undefined) vendor.bankAccount = { ...vendor.bankAccount, ...bankAccount };
    if (logo !== undefined) vendor.logo = logo;
    if (banner !== undefined) vendor.banner = banner;

    await vendor.save();

    res.json({ success: true, vendor, message: 'Store profile updated successfully.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get vendor's products
// @route   GET /api/vendor/products
// @access  Private (Vendor - Approved)
exports.getVendorProducts = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user._id });
    const { page = 1, limit = 10, search = '' } = req.query;

    const query = { vendor: vendor._id };
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(query),
    ]);

    res.json({
      success: true,
      products,
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

// @desc    Create new product
// @route   POST /api/vendor/products
// @access  Private (Vendor - Approved)
exports.createProduct = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user._id });
    const {
      name,
      description,
      category,
      price, // in paise or rupees (frontend sends rupees or paise; we enforce paise)
      discountPrice,
      stock,
      lowStockThreshold = 5,
      sku,
      images = [],
      specifications = [],
      tags = [],
    } = req.body;

    if (!name || !description || !category || price === undefined || stock === undefined) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
    }

    const priceInPaise = Number(price);
    const discountPriceInPaise = discountPrice ? Number(discountPrice) : 0;
    const generatedSku = sku || `SKU-${vendor.storeName.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}`;
    const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const uniqueSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    const product = await Product.create({
      name,
      slug: uniqueSlug,
      sku: generatedSku,
      description,
      vendor: vendor._id,
      category,
      price: priceInPaise,
      discountPrice: discountPriceInPaise,
      stock: Number(stock),
      lowStockThreshold: Number(lowStockThreshold),
      images,
      specifications,
      tags,
    });

    await Inventory.create({
      product: product._id,
      vendor: vendor._id,
      quantity: Number(stock),
      lowStockThreshold: Number(lowStockThreshold),
    });

    // Synchronize search index
    await searchService.syncProductIndex(product);

    res.status(201).json({
      success: true,
      product,
      message: 'Product published successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/vendor/products/:id
// @access  Private (Vendor - Approved)
exports.updateProduct = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user._id });
    const product = await Product.findOne({ _id: req.params.id, vendor: vendor._id });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found or unauthorized.' });
    }

    const {
      name,
      description,
      category,
      price,
      discountPrice,
      stock,
      lowStockThreshold,
      images,
      specifications,
      tags,
      isActive,
    } = req.body;

    if (name) product.name = name;
    if (description) product.description = description;
    if (category) product.category = category;
    if (price !== undefined) product.price = Number(price);
    if (discountPrice !== undefined) product.discountPrice = Number(discountPrice);
    if (stock !== undefined) {
      product.stock = Number(stock);
      await Inventory.findOneAndUpdate(
        { product: product._id },
        { quantity: Number(stock) },
        { upsert: true }
      );
    }
    if (lowStockThreshold !== undefined) product.lowStockThreshold = Number(lowStockThreshold);
    if (images) product.images = images;
    if (specifications) product.specifications = specifications;
    if (tags) product.tags = tags;
    if (isActive !== undefined) product.isActive = isActive;

    await product.save();
    await searchService.syncProductIndex(product);

    res.json({ success: true, product, message: 'Product updated successfully.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/vendor/products/:id
// @access  Private (Vendor - Approved)
exports.deleteProduct = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user._id });
    const product = await Product.findOneAndDelete({ _id: req.params.id, vendor: vendor._id });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found or unauthorized.' });
    }

    await Inventory.findOneAndDelete({ product: product._id });

    res.json({ success: true, message: 'Product deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get vendor's inventory & low stock items
// @route   GET /api/vendor/inventory
// @access  Private (Vendor - Approved)
exports.getVendorInventory = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user._id });
    const inventories = await Inventory.find({ vendor: vendor._id })
      .populate('product', 'name sku price images isActive stock lowStockThreshold')
      .sort({ quantity: 1 });

    const lowStockAlerts = inventories.filter(
      item => item.product && item.quantity <= (item.lowStockThreshold || 5)
    );

    res.json({
      success: true,
      inventories,
      lowStockAlerts,
      totalTrackedProducts: inventories.length,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get vendor incoming orders
// @route   GET /api/vendor/orders
// @access  Private (Vendor - Approved)
exports.getVendorOrders = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user._id });
    const { status, page = 1, limit = 10 } = req.query;

    const query = { vendor: vendor._id };
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
      VendorOrder.find(query)
        .populate('parentOrder', 'orderNumber shippingAddress paymentMethod paymentStatus createdAt')
        .populate('customer', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      VendorOrder.countDocuments(query),
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

// @desc    Update vendor order status
// @route   PUT /api/vendor/orders/:id/status
// @access  Private (Vendor - Approved)
exports.updateVendorOrderStatus = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user._id });
    const { status, note } = req.body;

    const allowedTransitions = ['PLACED', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!allowedTransitions.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid order status specified.' });
    }

    const vendorOrder = await VendorOrder.findOne({ _id: req.params.id, vendor: vendor._id });
    if (!vendorOrder) {
      return res.status(404).json({ success: false, message: 'Vendor order not found or unauthorized.' });
    }

    vendorOrder.status = status;
    vendorOrder.trackingHistory.push({
      status,
      timestamp: new Date(),
      note: note || `Order status updated to ${status} by vendor.`,
    });

    await vendorOrder.save();

    // Check parent order: If all vendor orders are delivered, update parent to DELIVERED
    const parentOrder = await Order.findById(vendorOrder.parentOrder);
    if (parentOrder) {
      const allSubOrders = await VendorOrder.find({ parentOrder: parentOrder._id });
      const allDelivered = allSubOrders.every(so => so.status === 'DELIVERED');
      const anyShipped = allSubOrders.some(so => ['SHIPPED', 'DELIVERED'].includes(so.status));

      if (allDelivered) {
        parentOrder.orderStatus = 'DELIVERED';
        parentOrder.trackingHistory.push({
          status: 'DELIVERED',
          timestamp: new Date(),
          note: 'All marketplace vendors completed fulfillment.',
        });
        await parentOrder.save();
      } else if (anyShipped && parentOrder.orderStatus !== 'SHIPPED') {
        parentOrder.orderStatus = 'SHIPPED';
        parentOrder.trackingHistory.push({
          status: 'SHIPPED',
          timestamp: new Date(),
          note: 'Items dispatched by merchant.',
        });
        await parentOrder.save();
      }
    }

    res.json({
      success: true,
      vendorOrder,
      message: `Order status successfully transitioned to ${status}.`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get vendor analytics & earnings
// @route   GET /api/vendor/analytics
// @access  Private (Vendor - Approved)
exports.getVendorAnalytics = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user._id });
    const vendorId = vendor._id;

    const orders = await VendorOrder.find({ vendor: vendorId });
    const commissions = await Commission.find({ vendor: vendorId }).sort({ createdAt: -1 }).limit(20);

    const totalOrdersCount = orders.length;
    const completedOrders = orders.filter(o => o.status === 'DELIVERED');
    const totalSales = orders.reduce((sum, o) => sum + (o.subtotal || 0), 0);
    const totalCommissionsPaid = orders.reduce((sum, o) => sum + (o.commissionAmount || 0), 0);
    const totalNetEarnings = orders.reduce((sum, o) => sum + (o.vendorEarnings || 0), 0);

    // Group sales by month
    const monthlySales = {};
    orders.forEach(o => {
      const month = new Date(o.createdAt).toLocaleString('default', { month: 'short' });
      monthlySales[month] = (monthlySales[month] || 0) + (o.subtotal / 100);
    });

    const monthlyChartData = Object.keys(monthlySales).map(month => ({
      name: month,
      revenue: Math.round(monthlySales[month]),
    }));

    res.json({
      success: true,
      summary: {
        storeName: vendor.storeName,
        commissionRate: vendor.commissionRate,
        totalOrders: totalOrdersCount,
        completedOrders: completedOrders.length,
        totalSales, // paise
        totalCommissionsPaid, // paise
        totalNetEarnings, // paise
        pendingPayouts: vendor.pendingPayouts || 0,
      },
      recentCommissions: commissions,
      monthlyChartData: monthlyChartData.length ? monthlyChartData : [{ name: 'Current', revenue: totalSales / 100 }],
    });
  } catch (error) {
    next(error);
  }
};
