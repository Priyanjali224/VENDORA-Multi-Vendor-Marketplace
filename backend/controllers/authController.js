const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Vendor = require('../models/Vendor');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'vendora_super_secure_jwt_secret_key_2026_nexvia_internship', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// @desc    Register new customer
// @route   POST /api/auth/register
// @access  Public
exports.registerCustomer = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email and password.' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email address is already registered.' });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: 'customer',
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
      message: 'Customer account created successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register new vendor
// @route   POST /api/auth/register-vendor
// @access  Public
exports.registerVendor = async (req, res, next) => {
  try {
    const { name, email, password, phone, storeName, description } = req.body;

    if (!name || !email || !password || !storeName) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, password, and store name.' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email address is already registered.' });
    }

    const slug = storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const storeExists = await Vendor.findOne({ $or: [{ storeName }, { slug }] });
    if (storeExists) {
      return res.status(400).json({ success: false, message: 'Store name is already taken. Please choose another.' });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: 'vendor',
    });

    const vendor = await Vendor.create({
      user: user._id,
      storeName,
      slug,
      description: description || '',
      email,
      phone,
      status: 'pending', // Requires admin approval workflow
      commissionRate: Number(process.env.DEFAULT_COMMISSION_PERCENTAGE) || 10,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      vendor: {
        id: vendor._id,
        storeName: vendor.storeName,
        slug: vendor.slug,
        status: vendor.status,
      },
      message: 'Vendor registered successfully. Your store application is pending administrator approval.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account deactivated. Please contact support.' });
    }

    let vendorProfile = null;
    if (user.role === 'vendor') {
      vendorProfile = await Vendor.findOne({ user: user._id });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        address: user.address,
      },
      vendor: vendorProfile ? {
        id: vendorProfile._id,
        storeName: vendorProfile.storeName,
        slug: vendorProfile.slug,
        status: vendorProfile.status,
        commissionRate: vendorProfile.commissionRate,
      } : null,
      message: 'Logged in successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    let vendor = null;
    if (user.role === 'vendor') {
      vendor = await Vendor.findOne({ user: user._id });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        address: user.address,
      },
      vendor,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address, avatar } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (avatar) user.avatar = avatar;
    if (address) user.address = { ...user.address, ...address };

    await user.save();

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        address: user.address,
      },
      message: 'Profile updated successfully.',
    });
  } catch (error) {
    next(error);
  }
};
