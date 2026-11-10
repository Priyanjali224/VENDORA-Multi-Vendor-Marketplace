const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const cacheService = require('../services/cacheService');

// Helper to compute subtotal, tax and delivery charges
const calculateCartTotals = (items, couponApplied = null) => {
  const subtotal = items.reduce((sum, item) => sum + (item.priceAtAddition * item.quantity), 0);
  
  let discount = 0;
  if (couponApplied && couponApplied.discountAmount) {
    discount = couponApplied.discountAmount;
  }

  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = Math.round(taxableAmount * 0.18); // 18% GST in paise
  const deliveryFee = subtotal >= 50000 ? 0 : 4900; // Free delivery over ₹500, else ₹49
  const totalAmount = taxableAmount + tax + deliveryFee;

  return { subtotal, discount, tax, deliveryFee, totalAmount };
};

// @desc    Get user's shopping cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res, next) => {
  try {
    const cacheKey = `cart_${req.user._id}`;
    let cart = await Cart.findOne({ user: req.user._id })
      .populate({
        path: 'items.product',
        select: 'name slug price discountPrice images stock isActive',
      })
      .populate('items.vendor', 'storeName slug rating');

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    const totals = calculateCartTotals(cart.items, cart.couponApplied);

    res.json({
      success: true,
      cart: {
        id: cart._id,
        items: cart.items,
        couponApplied: cart.couponApplied,
        ...totals,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/items
// @access  Private
exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: 'Product is unavailable.' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ success: false, message: `Only ${product.stock} units available in stock.` });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const price = product.discountPrice > 0 ? product.discountPrice : product.price;
    const existingIndex = cart.items.findIndex(i => i.product.toString() === productId);

    if (existingIndex > -1) {
      const newQty = cart.items[existingIndex].quantity + Number(quantity);
      if (newQty > product.stock) {
        return res.status(400).json({ success: false, message: `Cannot exceed available stock of ${product.stock}.` });
      }
      cart.items[existingIndex].quantity = newQty;
      cart.items[existingIndex].priceAtAddition = price;
    } else {
      cart.items.push({
        product: product._id,
        vendor: product.vendor,
        quantity: Number(quantity),
        priceAtAddition: price,
      });
    }

    await cart.save();
    await cacheService.del(`cart_${req.user._id}`);

    // Populate and return updated cart
    const updatedCart = await Cart.findById(cart._id)
      .populate('items.product', 'name slug price discountPrice images stock')
      .populate('items.vendor', 'storeName slug');

    const totals = calculateCartTotals(updatedCart.items, updatedCart.couponApplied);

    res.json({
      success: true,
      cart: {
        id: updatedCart._id,
        items: updatedCart.items,
        couponApplied: updatedCart.couponApplied,
        ...totals,
      },
      message: 'Item added to cart.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update item quantity
// @route   PUT /api/cart/items/:productId
// @access  Private
exports.updateCartQuantity = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const { productId } = req.params;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ success: false, message: 'Quantity must be at least 1.' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ success: false, message: `Cannot exceed available stock of ${product.stock}.` });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found.' });
    }

    const itemIndex = cart.items.findIndex(i => i.product.toString() === productId);
    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: 'Item not in cart.' });
    }

    cart.items[itemIndex].quantity = Number(quantity);
    await cart.save();
    await cacheService.del(`cart_${req.user._id}`);

    const updatedCart = await Cart.findById(cart._id)
      .populate('items.product', 'name slug price discountPrice images stock')
      .populate('items.vendor', 'storeName slug');

    const totals = calculateCartTotals(updatedCart.items, updatedCart.couponApplied);

    res.json({
      success: true,
      cart: {
        id: updatedCart._id,
        items: updatedCart.items,
        couponApplied: updatedCart.couponApplied,
        ...totals,
      },
      message: 'Cart updated.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/items/:productId
// @access  Private
exports.removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found.' });
    }

    cart.items = cart.items.filter(i => i.product.toString() !== productId);
    await cart.save();
    await cacheService.del(`cart_${req.user._id}`);

    const updatedCart = await Cart.findById(cart._id)
      .populate('items.product', 'name slug price discountPrice images stock')
      .populate('items.vendor', 'storeName slug');

    const totals = calculateCartTotals(updatedCart.items, updatedCart.couponApplied);

    res.json({
      success: true,
      cart: {
        id: updatedCart._id,
        items: updatedCart.items,
        couponApplied: updatedCart.couponApplied,
        ...totals,
      },
      message: 'Item removed from cart.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Apply promo coupon to cart
// @route   POST /api/cart/apply-coupon
// @access  Private
exports.applyCoupon = async (req, res, next) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Please provide a coupon code.' });
    }

    const coupon = await Coupon.findOne({
      code: code.trim().toUpperCase(),
      isActive: true,
      endDate: { $gte: new Date() },
    });

    if (!coupon) {
      return res.status(400).json({ success: false, message: 'Invalid or expired coupon code.' });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty.' });
    }

    const subtotal = cart.items.reduce((sum, item) => sum + (item.priceAtAddition * item.quantity), 0);

    if (coupon.minOrderAmount > 0 && subtotal < coupon.minOrderAmount) {
      const minInRupees = (coupon.minOrderAmount / 100).toFixed(0);
      return res.status(400).json({
        success: false,
        message: `Coupon requires a minimum purchase amount of ₹${minInRupees}.`,
      });
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = Math.round((subtotal * coupon.discountValue) / 100);
      if (coupon.maxDiscountAmount > 0 && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    cart.couponApplied = {
      code: coupon.code,
      discountPercentage: coupon.discountType === 'percentage' ? coupon.discountValue : 0,
      discountAmount,
    };

    await cart.save();
    await cacheService.del(`cart_${req.user._id}`);

    const totals = calculateCartTotals(cart.items, cart.couponApplied);

    res.json({
      success: true,
      couponApplied: cart.couponApplied,
      totals,
      message: `Coupon ${coupon.code} applied! Saved ₹${(discountAmount / 100).toFixed(2)}.`,
    });
  } catch (error) {
    next(error);
  }
};
