const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
exports.getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id })
      .populate({
        path: 'products',
        populate: { path: 'vendor', select: 'storeName slug' },
      });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }

    res.json({ success: true, wishlist: wishlist.products });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle product in wishlist
// @route   POST /api/wishlist/toggle
// @access  Private
exports.toggleWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: 'ProductId is required.' });
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }

    const existsIndex = wishlist.products.findIndex(id => id.toString() === productId);
    let added = false;

    if (existsIndex > -1) {
      wishlist.products.splice(existsIndex, 1);
      added = false;
    } else {
      wishlist.products.push(productId);
      added = true;
    }

    await wishlist.save();

    const populated = await Wishlist.findById(wishlist._id).populate({
      path: 'products',
      populate: { path: 'vendor', select: 'storeName slug' },
    });

    res.json({
      success: true,
      added,
      wishlist: populated.products,
      message: added ? 'Added to wishlist.' : 'Removed from wishlist.',
    });
  } catch (error) {
    next(error);
  }
};
