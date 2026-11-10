import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Store,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import { formatPrice } from '../../utils/formatters';

const CheckoutPage = () => {
  const { cart, clearCartState } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    addressLine1: user?.address?.addressLine1 || '',
    city: user?.address?.city || '',
    state: user?.address?.state || 'Maharashtra',
    postalCode: user?.address?.postalCode || '',
    country: 'India',
  });

  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (e) => {
    setShippingAddress({
      ...shippingAddress,
      [e.target.name]: e.target.value,
    });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setProcessing(true);

    try {
      // 1. Submit checkout to backend: creates parent Order & vendor partitions
      const { data } = await API.post('/orders/checkout', {
        shippingAddress,
        paymentMethod,
      });

      if (!data.success) {
        throw new Error(data.message || 'Checkout failed');
      }

      const order = data.order;
      const paymentData = data.paymentData;

      // 2. If test mode Razorpay or Stripe: simulate payment verification
      if (paymentMethod === 'razorpay' || paymentMethod === 'stripe') {
        const verifyRes = await API.post(`/orders/${order._id}/verify-payment`, {
          providerOrderId: paymentData.providerOrderId,
          providerPaymentId: `pay_test_${Date.now()}`,
          providerSignature: `sig_mock_${Math.random().toString(36).substring(2)}`,
        });

        if (!verifyRes.data.success) {
          throw new Error('Payment verification failed.');
        }
      }

      clearCartState();
      navigate(`/payment-result/${order._id}`);
    } catch (err) {
      console.error(err);
      setErrorMessage(err.response?.data?.message || err.message || 'Error processing checkout.');
      setProcessing(false);
    }
  };

  if (!cart.items || cart.items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Checkout & Payment</h1>
        <p className="text-xs text-slate-500 mt-1">Safe & Encrypted 256-bit Multi-Vendor Checkout</p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Shipping & Payment Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Address */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-600" /> Shipping & Delivery Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={shippingAddress.fullName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Phone Number *</label>
                <input
                  type="text"
                  name="phone"
                  value={shippingAddress.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-600 font-semibold mb-1">Street Address Line *</label>
                <input
                  type="text"
                  name="addressLine1"
                  value={shippingAddress.addressLine1}
                  onChange={handleInputChange}
                  required
                  placeholder="Apartment, suite, unit, building, floor, etc."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">City *</label>
                <input
                  type="text"
                  name="city"
                  value={shippingAddress.city}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">State *</label>
                <input
                  type="text"
                  name="state"
                  value={shippingAddress.state}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Postal Code (PIN) *</label>
                <input
                  type="text"
                  name="postalCode"
                  value={shippingAddress.postalCode}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Country</label>
                <input
                  type="text"
                  value="India"
                  disabled
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-500"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-600" /> Payment Method
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <label
                className={`p-4 rounded-2xl border-2 cursor-pointer flex flex-col justify-between transition ${
                  paymentMethod === 'razorpay'
                    ? 'border-blue-600 bg-blue-50/50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Razorpay (Test)</span>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="razorpay"
                    checked={paymentMethod === 'razorpay'}
                    onChange={() => setPaymentMethod('razorpay')}
                    className="text-blue-600"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-2">UPI, Cards, NetBanking Sandbox</p>
              </label>

              <label
                className={`p-4 rounded-2xl border-2 cursor-pointer flex flex-col justify-between transition ${
                  paymentMethod === 'stripe'
                    ? 'border-blue-600 bg-blue-50/50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Stripe (Test)</span>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="stripe"
                    checked={paymentMethod === 'stripe'}
                    onChange={() => setPaymentMethod('stripe')}
                    className="text-blue-600"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-2">International Card Sandbox</p>
              </label>

              <label
                className={`p-4 rounded-2xl border-2 cursor-pointer flex flex-col justify-between transition ${
                  paymentMethod === 'cod'
                    ? 'border-blue-600 bg-blue-50/50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Cash on Delivery</span>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="text-blue-600"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-2">Pay upon home delivery</p>
              </label>
            </div>
          </div>
        </div>

        {/* Order Review & Pay Column */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Review Order</h3>

            {/* Quick item list */}
            <div className="max-h-60 overflow-y-auto space-y-3 pr-1 text-xs">
              {cart.items.map((item) => (
                <div key={item._id} className="flex items-center justify-between gap-3">
                  <div className="truncate">
                    <span className="font-semibold text-slate-800 truncate block">{item.product?.name}</span>
                    <span className="text-[10px] text-slate-400">Qty: {item.quantity}</span>
                  </div>
                  <span className="font-bold text-slate-900 flex-shrink-0">
                    {formatPrice(item.priceAtAddition * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-200 space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-800">{formatPrice(cart.subtotal)}</span>
              </div>
              {cart.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Coupon Discount</span>
                  <span>-{formatPrice(cart.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Tax (GST 18%)</span>
                <span className="font-semibold text-slate-800">{formatPrice(cart.tax)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery</span>
                <span className="font-semibold text-slate-800">
                  {cart.deliveryFee === 0 ? 'FREE' : formatPrice(cart.deliveryFee)}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-baseline justify-between">
              <div>
                <span className="text-sm font-extrabold text-slate-900 block">Total Due</span>
                <span className="text-[10px] text-slate-400">Instant test confirmation</span>
              </div>
              <span className="text-2xl font-extrabold text-blue-700">
                {formatPrice(cart.totalAmount)}
              </span>
            </div>

            <button
              type="submit"
              disabled={processing}
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {processing ? (
                'Processing Payment...'
              ) : (
                <>
                  <Lock className="w-4 h-4" /> Complete Payment ({formatPrice(cart.totalAmount)})
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
