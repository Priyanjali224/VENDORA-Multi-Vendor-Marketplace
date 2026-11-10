const express = require('express');
const router = express.Router();
const {
  getVendorProfile,
  updateVendorProfile,
  getVendorProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getVendorInventory,
  getVendorOrders,
  updateVendorOrderStatus,
  getVendorAnalytics,
} = require('../controllers/vendorController');
const { protect } = require('../middleware/auth');
const { authorize, ensureApprovedVendor } = require('../middleware/roles');

router.use(protect);
router.use(authorize('vendor', 'admin'));

// Profile onboarding & view (pending vendors can access this)
router.get('/profile', getVendorProfile);
router.put('/profile', updateVendorProfile);

// Operations requiring approval
router.use(ensureApprovedVendor);
router.get('/products', getVendorProducts);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

router.get('/inventory', getVendorInventory);
router.get('/orders', getVendorOrders);
router.put('/orders/:id/status', updateVendorOrderStatus);
router.get('/analytics', getVendorAnalytics);

module.exports = router;
