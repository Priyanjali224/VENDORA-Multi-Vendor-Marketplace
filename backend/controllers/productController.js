const Product = require('../models/Product');
const Category = require('../models/Category');
const Review = require('../models/Review');
const searchService = require('../services/searchService');
const storageService = require('../services/storageService');
const cacheService = require('../services/cacheService');

// @desc    Get all products with full-text search, filters, sort & pagination
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res, next) => {
  try {
    const {
      q,
      search,
      category,
      minPrice,
      maxPrice,
      rating,
      vendor,
      sort = 'newest',
      page = 1,
      limit = 12,
    } = req.query;

    const queryTerm = q || search || '';

    // Cache key for popular product queries
    const cacheKey = `products_${queryTerm}_${category || 'all'}_${minPrice || '0'}_${maxPrice || 'max'}_${rating || '0'}_${sort}_${page}_${limit}`;
    const cachedResult = await cacheService.get(cacheKey);
    if (cachedResult) {
      return res.json({ success: true, ...cachedResult, fromCache: true });
    }

    const result = await searchService.searchProducts({
      query: queryTerm,
      category,
      minPrice,
      maxPrice,
      minRating: rating,
      vendorId: vendor,
      sortBy: sort,
      page,
      limit,
    });

    // Cache successful search results for 120 seconds
    await cacheService.set(cacheKey, result, 120);

    res.json({
      success: true,
      ...result,
      fromCache: false,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get product details by slug
// @route   GET /api/products/:slug
// @access  Public
exports.getProductBySlug = async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true })
      .populate('vendor', 'storeName slug logo description rating numReviews status')
      .populate('category', 'name slug');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const reviews = await Review.find({ product: product._id, status: 'approved' })
      .populate('customer', 'name avatar')
      .sort({ createdAt: -1 });

    // Related products in the same category
    const relatedProducts = await Product.find({
      category: product.category._id,
      _id: { $ne: product._id },
      isActive: true,
    })
      .populate('vendor', 'storeName')
      .limit(4)
      .lean();

    res.json({
      success: true,
      product,
      reviews,
      relatedProducts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    res.json({ success: true, categories });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload product or vendor media image
// @route   POST /api/upload
// @access  Private (Vendor / Admin)
exports.uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file uploaded.' });
    }

    const url = await storageService.uploadFile(req.file);

    res.json({
      success: true,
      url,
      filename: req.file.filename,
      message: 'Image uploaded successfully.',
    });
  } catch (error) {
    next(error);
  }
};
