const express = require('express');
const router = express.Router();
const {
  createCheckoutOrder,
  verifyPayment,
  getMyOrders,
  getOrderDetails,
  cancelOrder,
  downloadInvoice,
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/checkout', createCheckoutOrder);
router.post('/:id/verify-payment', verifyPayment);
router.get('/my-orders', getMyOrders);
router.get('/:id', getOrderDetails);
router.put('/:id/cancel', cancelOrder);
router.get('/:id/invoice', downloadInvoice);

module.exports = router;
