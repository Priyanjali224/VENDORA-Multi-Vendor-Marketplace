import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2,
  ShoppingBag,
  ArrowRight,
  Store,
  ShieldCheck,
  Tag,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatPrice } from '../../utils/formatters';

const CartPage = () => {
  const { cart, updateQuantity, removeFromCart, applyCoupon, loading } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState('');
  const [couponFeedback, setCouponFeedback] = useState(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    setCouponFeedback(null);
    const res = await applyCoupon(couponCode.trim());
    setApplyingCoupon(false);
    setCouponFeedback({
      type: res.success ? 'success' : 'error',
      message: res.message,
    });
    if (res.success) setCouponCode('');
  };

  const handleProceedToCheckout = () => {
    if (!user) {
      navigate('/login?redirect=/checkout');
    } else {
      navigate('/checkout');
    }
  };

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Your Shopping Cart is Empty</h2>
        <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto">
          Explore products from independent verified merchants and add them to your cart.
        </p>
        <Link
          to="/products"
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition"
        >
          Explore Catalog <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  // Group items by vendor
  const vendorGroups = cart.items.reduce((acc, item) => {
    const vendorId = item.vendor?._id || 'unknown';
    const vendorName = item.vendor?.storeName || 'Merchant Partner';
    if (!acc[vendorId]) {
      acc[vendorId] = {
        name: vendorName,
        items: [],
      };
    }
    acc[vendorId].items.push(item);
    return acc;
  }, {});

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Multi-Vendor Shopping Cart</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review your selected items from {Object.keys(vendorGroups).length} independent merchant(s)
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-6">
          {Object.entries(vendorGroups).map(([vId, group]) => (
            <div key={vId} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              {/* Vendor Store Header */}
              <div className="px-6 py-3.5 bg-slate-50/80 border-b border-slate-200 flex items-center gap-2">
                <Store className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-800">Fulfilled by: {group.name}</span>
              </div>

              {/* Items List */}
              <div className="divide-y divide-slate-100 p-6 space-y-4">
                {group.items.map((item) => {
                  const product = item.product || {};
                  const lineTotal = item.priceAtAddition * item.quantity;
                  const image = product.images && product.images[0]
                    ? product.images[0]
                    : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200';

                  return (
                    <div key={product._id || item._id} className="pt-4 first:pt-0 flex items-center gap-4">
                      <img
                        src={image}
                        alt=""
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                      />

                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/products/${product.slug}`}
                          className="text-xs sm:text-sm font-semibold text-slate-900 hover:text-blue-600 line-clamp-2"
                        >
                          {product.name}
                        </Link>
                        <div className="text-xs font-extrabold text-slate-800 mt-1">
                          {formatPrice(item.priceAtAddition)}
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                        <button
                          onClick={() => updateQuantity(product._id, Math.max(1, item.quantity - 1))}
                          className="px-2.5 py-1 text-slate-600 hover:bg-slate-200 text-xs font-bold"
                        >
                          -
                        </button>
                        <span className="px-2.5 py-1 text-xs font-bold text-slate-800">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(product._id, item.quantity + 1)}
                          className="px-2.5 py-1 text-slate-600 hover:bg-slate-200 text-xs font-bold"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right min-w-[70px]">
                        <div className="text-xs font-bold text-slate-900">{formatPrice(lineTotal)}</div>
                        <button
                          onClick={() => removeFromCart(product._id)}
                          className="text-[11px] text-rose-500 hover:text-rose-700 flex items-center gap-0.5 ml-auto mt-1"
                        >
                          <Trash2 className="w-3 h-3" /> Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary & Coupon Column */}
        <div className="space-y-6">
          {/* Coupon Box */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-blue-600" /> Apply Promo Coupon
            </h3>
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter code (e.g. VENDORA10)"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="flex-1 px-3 py-2 text-xs uppercase bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
              />
              <button
                type="submit"
                disabled={applyingCoupon}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow transition disabled:opacity-50"
              >
                {applyingCoupon ? '...' : 'Apply'}
              </button>
            </form>

            {couponFeedback && (
              <p
                className={`text-[11px] font-semibold flex items-center gap-1 ${
                  couponFeedback.type === 'success' ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {couponFeedback.type === 'success' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                {couponFeedback.message}
              </p>
            )}

            {cart.couponApplied?.code && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-800">{cart.couponApplied.code} Applied</span>
                <span className="font-bold text-emerald-700">-{formatPrice(cart.couponApplied.discountAmount)}</span>
              </div>
            )}
          </div>

          {/* Price Breakdown */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Order Summary</h3>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal ({cart.items.length} items)</span>
                <span className="font-semibold text-slate-800">{formatPrice(cart.subtotal)}</span>
              </div>

              {cart.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Coupon Discount</span>
                  <span>-{formatPrice(cart.discount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Estimated Tax (GST 18%)</span>
                <span className="font-semibold text-slate-800">{formatPrice(cart.tax)}</span>
              </div>

              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span className="font-semibold text-slate-800">
                  {cart.deliveryFee === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : formatPrice(cart.deliveryFee)}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-baseline justify-between">
              <div>
                <span className="text-sm font-extrabold text-slate-900 block">Grand Total</span>
                <span className="text-[10px] text-slate-400">All applicable taxes included</span>
              </div>
              <span className="text-2xl font-extrabold text-blue-700">
                {formatPrice(cart.totalAmount)}
              </span>
            </div>

            <button
              onClick={handleProceedToCheckout}
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
