const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Vendor = require('../models/Vendor');

// @desc    Submit review for product
// @route   POST /api/reviews
// @access  Private (Customer)
exports.createReview = async (req, res, next) => {
  try {
    const { productId, rating, title, comment } = req.body;

    if (!productId || !rating || !title || !comment) {
      return res.status(400).json({ success: false, message: 'Please provide all review fields.' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Check for existing review by this user
    const existing = await Review.findOne({ product: productId, customer: req.user._id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this product.' });
    }

    // Check verified purchase
    const hasPurchased = await Order.findOne({
      customer: req.user._id,
      'items.product': productId,
      orderStatus: { $in: ['DELIVERED', 'CONFIRMED', 'SHIPPED', 'PACKED', 'PLACED'] },
    });

    const review = await Review.create({
      product: productId,
      customer: req.user._id,
      rating: Number(rating),
      title,
      comment,
      isVerifiedPurchase: !!hasPurchased,
      status: 'approved',
    });

    // Recalculate Product average rating
    const allReviews = await Review.find({ product: productId, status: 'approved' });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    product.ratingsAverage = Number(avgRating.toFixed(1));
    product.ratingsCount = allReviews.length;
    await product.save();

    res.status(201).json({
      success: true,
      review,
      ratingsAverage: product.ratingsAverage,
      ratingsCount: product.ratingsCount,
      message: 'Review submitted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Vendor replies to customer review
// @route   POST /api/reviews/:id/reply
// @access  Private (Vendor)
exports.vendorReplyReview = async (req, res, next) => {
  try {
    const { message } = req.body;
    const review = await Review.findById(req.params.id).populate('product');

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    const vendor = await Vendor.findOne({ user: req.user._id });
    if (!vendor || review.product.vendor.toString() !== vendor._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized: You can only reply to reviews on your products.' });
    }

    review.vendorReply = {
      message,
      repliedAt: new Date(),
    };

    await review.save();

    res.json({
      success: true,
      review,
      message: 'Vendor reply posted.',
    });
  } catch (error) {
    next(error);
  }
};
