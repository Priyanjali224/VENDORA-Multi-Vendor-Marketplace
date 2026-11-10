import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ShieldCheck, Truck, RefreshCw, Award, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm mt-20 border-t border-slate-800">
      {/* Value Proposition Highlights */}
      <div className="border-b border-slate-800 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">Swift Delivery</h4>
              <p className="text-xs text-slate-400 mt-1">Dispatched directly from verified vendor warehouses across India.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">Secure Checkout</h4>
              <p className="text-xs text-slate-400 mt-1">256-bit encrypted payments with Razorpay & Stripe test integration.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">Verified Merchants</h4>
              <p className="text-xs text-slate-400 mt-1">Every seller is vetted and reviewed by platform administrators.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">Hassle-Free Returns</h4>
              <p className="text-xs text-slate-400 mt-1">7-day buyer protection on eligible marketplace purchases.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-2 md:grid-cols-5 gap-8">
        <div className="col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold text-white tracking-tight">VENDORA</span>
          </div>
          <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
            VENDORA is an enterprise multi-vendor e-commerce marketplace empowering independent vendors, artisans, and retailers to connect with consumers across India.
          </p>
          <p className="text-[11px] text-slate-500 mt-4">
            Built for Nexvia Technologies Full-Stack Internship Capstone.
          </p>
        </div>

        <div>
          <h5 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Shop Marketplace</h5>
          <ul className="space-y-2 text-xs">
            <li><Link to="/products" className="hover:text-white transition">All Products</Link></li>
            <li><Link to="/products?category=electronics" className="hover:text-white transition">Electronics</Link></li>
            <li><Link to="/products?category=fashion" className="hover:text-white transition">Fashion & Apparel</Link></li>
            <li><Link to="/products?category=home-living" className="hover:text-white transition">Home & Living</Link></li>
            <li><Link to="/products?category=beauty" className="hover:text-white transition">Beauty & Care</Link></li>
          </ul>
        </div>

        <div>
          <h5 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">For Vendors</h5>
          <ul className="space-y-2 text-xs">
            <li><Link to="/register-vendor" className="hover:text-white transition">Become a Vendor</Link></li>
            <li><Link to="/vendor/dashboard" className="hover:text-white transition">Vendor Portal</Link></li>
            <li><Link to="/login" className="hover:text-white transition">Merchant Sign-In</Link></li>
            <li><span className="text-slate-500">Commission Policy</span></li>
            <li><span className="text-slate-500">Fulfillment Guide</span></li>
          </ul>
        </div>

        <div>
          <h5 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Customer Care</h5>
          <ul className="space-y-2 text-xs">
            <li><Link to="/my-orders" className="hover:text-white transition">Track Your Order</Link></li>
            <li><Link to="/profile" className="hover:text-white transition">Account Profile</Link></li>
            <li><Link to="/cart" className="hover:text-white transition">Shopping Cart</Link></li>
            <li><span className="text-slate-500">Returns & Refunds</span></li>
            <li><span className="text-slate-500">Privacy Policy</span></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} VENDORA Inc. All rights reserved. Developed for Nexvia Technologies.</p>
          <p className="flex items-center gap-1">
            Engineered with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> by Full-Stack Engineering Team
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
