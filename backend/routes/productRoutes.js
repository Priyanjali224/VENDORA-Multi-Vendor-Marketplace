const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductBySlug,
  getCategories,
  uploadImage,
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/products', getProducts);
router.get('/products/:slug', getProductBySlug);
router.get('/categories', getCategories);
router.post('/upload', protect, upload.single('image'), uploadImage);

module.exports = router;
