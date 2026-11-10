const Vendor = require('../models/Vendor');

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: User role '${req.user ? req.user.role : 'anonymous'}' is not authorized to access this resource.`
      });
    }
    next();
  };
};

const ensureApprovedVendor = async (req, res, next) => {
  try {
    if (req.user.role === 'admin') {
      return next(); // Platform admins bypass vendor approval check
    }

    if (req.user.role !== 'vendor') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Vendor account required.'
      });
    }

    const vendor = await Vendor.findOne({ user: req.user._id });
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found. Please complete store onboarding.'
      });
    }

    if (vendor.status !== 'approved') {
      return res.status(403).json({
        success: false,
        message: `Vendor store is currently '${vendor.status}'. Active approval is required to sell products.`,
        vendorStatus: vendor.status
      });
    }

    req.vendor = vendor;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error verifying vendor approval status.',
      error: error.message
    });
  }
};

module.exports = { authorize, ensureApprovedVendor };
