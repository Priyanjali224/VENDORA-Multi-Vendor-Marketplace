const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getVendors,
  updateVendorStatus,
  getCustomers,
  toggleCustomerActive,
  getAllOrders,
  createCategory,
  getCoupons,
  createCoupon,
  getCommissionsLedger,
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard-stats', getDashboardStats);
router.get('/vendors', getVendors);
router.put('/vendors/:id/status', updateVendorStatus);
router.get('/customers', getCustomers);
router.put('/customers/:id/toggle-active', toggleCustomerActive);
router.get('/orders', getAllOrders);
router.post('/categories', createCategory);
router.get('/coupons', getCoupons);
router.post('/coupons', createCoupon);
router.get('/commissions', getCommissionsLedger);

module.exports = router;
