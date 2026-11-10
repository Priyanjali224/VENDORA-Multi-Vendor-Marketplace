const User = require('../models/User');
const Vendor = require('../models/Vendor');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Order = require('../models/Order');
const VendorOrder = require('../models/VendorOrder');
const Commission = require('../models/Commission');
const Payment = require('../models/Payment');
const Coupon = require('../models/Coupon');

// @desc    Get aggregate platform statistics
// @route   GET /api/admin/dashboard-stats
// @access  Private (Admin)
exports.getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalOrders,
      totalCustomers,
      totalVendors,
      pendingVendors,
      activeProducts,
      orders,
      commissions,
    ] = await Promise.all([
      Order.countDocuments(),
      User.countDocuments({ role: 'customer' }),
      Vendor.countDocuments(),
      Vendor.countDocuments({ status: 'pending' }),
      Product.countDocuments({ isActive: true }),
      Order.find({ paymentStatus: 'paid' }).select('totalAmount createdAt'),
      Commission.find().select('commissionAmount createdAt'),
    ]);

    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const totalPlatformCommissions = commissions.reduce((sum, c) => sum + (c.commissionAmount || 0), 0);

    // Group revenue by month for Recharts
    const monthlyData = {};
    orders.forEach(order => {
      const month = new Date(order.createdAt).toLocaleString('default', { month: 'short' });
      monthlyData[month] = (monthlyData[month] || 0) + (order.totalAmount / 100);
    });

    const revenueChart = Object.keys(monthlyData).map(month => ({
      name: month,
      revenue: Math.round(monthlyData[month]),
      commission: Math.round(monthlyData[month] * 0.1),
    }));

    res.json({
      success: true,
      stats: {
        totalRevenue, // in paise
        totalRevenueRupees: (totalRevenue / 100).toFixed(2),
        totalOrders,
        totalCustomers,
        totalVendors,
        pendingVendors,
        activeProducts,
        totalPlatformCommissions, // in paise
        totalPlatformCommissionsRupees: (totalPlatformCommissions / 100).toFixed(2),
      },
      revenueChart: revenueChart.length ? revenueChart : [
        { name: 'Jan', revenue: 45000, commission: 4500 },
        { name: 'Feb', revenue: 62000, commission: 6200 },
        { name: 'Mar', revenue: 89000, commission: 8900 },
        { name: 'Apr', revenue: 120000, commission: 12000 },
      ],
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all vendors with filtering
// @route   GET /api/admin/vendors
// @access  Private (Admin)
exports.getVendors = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 15 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (search) {
      query.$or = [
        { storeName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [vendors, total] = await Promise.all([
      Vendor.find(query).populate('user', 'name email phone createdAt').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Vendor.countDocuments(query),
    ]);

    res.json({
      success: true,
      vendors,
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

// @desc    Approve / reject / suspend vendor
// @route   PUT /api/admin/vendors/:id/status
// @access  Private (Admin)
exports.updateVendorStatus = async (req, res, next) => {
  try {
    const { status, commissionRate } = req.body;
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found.' });
    }

    if (status) {
      const allowed = ['pending', 'approved', 'rejected', 'suspended'];
      if (!allowed.includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid vendor status.' });
      }
      vendor.status = status;
    }

    if (commissionRate !== undefined) {
      vendor.commissionRate = Number(commissionRate);
    }

    await vendor.save();

    res.json({
      success: true,
      vendor,
      message: `Vendor '${vendor.storeName}' status updated to '${vendor.status}'.`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all customers
// @route   GET /api/admin/customers
// @access  Private (Admin)
exports.getCustomers = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 15 } = req.query;
    const query = { role: 'customer' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [customers, total] = await Promise.all([
      User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      User.countDocuments(query),
    ]);

    res.json({
      success: true,
      customers,
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

// @desc    Toggle customer active state
// @route   PUT /api/admin/customers/:id/toggle-active
// @access  Private (Admin)
exports.toggleCustomerActive = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      user,
      message: `Customer account ${user.isActive ? 'activated' : 'deactivated'}.`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all marketplace orders
// @route   GET /api/admin/orders
// @access  Private (Admin)
exports.getAllOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 15 } = req.query;
    const query = {};
    if (status) query.orderStatus = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('customer', 'name email phone')
        .populate('items.vendor', 'storeName slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Order.countDocuments(query),
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

// @desc    Manage platform categories
// @route   POST /api/admin/categories
// @access  Private (Admin)
exports.createCategory = async (req, res, next) => {
  try {
    const { name, description, image } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required.' });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const category = await Category.create({ name, slug, description, image });

    res.status(201).json({ success: true, category, message: 'Category created.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Manage coupons (List & Create)
// @route   GET /api/admin/coupons, POST /api/admin/coupons
// @access  Private (Admin)
exports.getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, coupons });
  } catch (error) {
    next(error);
  }
};

exports.createCoupon = async (req, res, next) => {
  try {
    const {
      code,
      discountType = 'percentage',
      discountValue,
      minOrderAmount = 0,
      maxDiscountAmount = 0,
      usageLimit = 500,
      endDate,
    } = req.body;

    if (!code || !discountValue || !endDate) {
      return res.status(400).json({ success: false, message: 'Please provide code, discount value and end date.' });
    }

    const coupon = await Coupon.create({
      code: code.trim().toUpperCase(),
      discountType,
      discountValue: Number(discountValue),
      minOrderAmount: Number(minOrderAmount),
      maxDiscountAmount: Number(maxDiscountAmount),
      usageLimit: Number(usageLimit),
      endDate: new Date(endDate),
    });

    res.status(201).json({ success: true, coupon, message: 'Coupon created.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get commissions ledger
// @route   GET /api/admin/commissions
// @access  Private (Admin)
exports.getCommissionsLedger = async (req, res, next) => {
  try {
    const commissions = await Commission.find()
      .populate('vendor', 'storeName slug')
      .populate('order', 'orderNumber paymentStatus')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, commissions });
  } catch (error) {
    next(error);
  }
};
