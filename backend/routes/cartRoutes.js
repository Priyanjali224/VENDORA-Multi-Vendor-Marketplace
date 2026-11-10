const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartQuantity,
  removeFromCart,
  applyCoupon,
} = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getCart);
router.post('/items', addToCart);
router.put('/items/:productId', updateCartQuantity);
router.delete('/items/:productId', removeFromCart);
router.post('/apply-coupon', applyCoupon);

module.exports = router;
