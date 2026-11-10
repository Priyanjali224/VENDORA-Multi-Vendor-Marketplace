import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  Heart,
  User,
  Store,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  Package,
  Layers,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const Navbar = () => {
  const { user, vendor, logout, isVendor, isAdmin } = useAuth();
  const { totalItemCount } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      {/* Top promotional bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <p className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Multi-Vendor Marketplace • Free shipping on orders over ₹500 • Use code <span className="font-semibold text-white">VENDORA10</span> for 10% off
          </p>
          <div className="hidden sm:flex items-center gap-4 text-xs font-medium">
            {!user ? (
              <Link to="/register-vendor" className="text-amber-400 hover:text-amber-300 flex items-center gap-1">
                <Store className="w-3.5 h-3.5" /> Sell on VENDORA
              </Link>
            ) : isVendor ? (
              <Link to="/vendor/dashboard" className="text-amber-400 hover:text-amber-300 flex items-center gap-1">
                <Store className="w-3.5 h-3.5" /> Vendor Portal
              </Link>
            ) : null}
            {isAdmin && (
              <Link to="/admin/dashboard" className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Admin Console
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-blue-700 via-indigo-600 to-slate-900 bg-clip-text text-transparent">
                VENDORA
              </span>
              <span className="hidden sm:block text-[9px] uppercase tracking-wider font-bold text-slate-400 -mt-1">
                Multi-Vendor Marketplace
              </span>
            </div>
          </Link>

          {/* Search Input */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden md:block">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products, brands, and verified vendors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-24 py-2 text-sm bg-slate-50 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <button
                type="submit"
                className="absolute right-1 top-1 bottom-1 px-4 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-full transition"
              >
                Search
              </button>
            </div>
          </form>

          {/* Nav Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              to="/products"
              className="hidden lg:flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-blue-600 transition px-2 py-1"
            >
              <Layers className="w-4 h-4" /> Browse
            </Link>

            <Link
              to="/wishlist"
              className="p-2 text-slate-700 hover:text-rose-600 hover:bg-slate-100 rounded-full transition relative"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
            </Link>

            <Link
              to="/cart"
              className="p-2 text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-full transition relative flex items-center"
              title="Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow">
                  {totalItemCount}
                </span>
              )}
            </Link>

            {/* User Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-100 transition border border-slate-200"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold text-slate-700 hidden sm:inline max-w-[100px] truncate">
                    {user.name}
                  </span>
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs text-slate-400 font-medium">Signed in as</p>
                      <p className="text-sm font-semibold text-slate-800 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-blue-50 text-blue-700">
                        {user.role}
                      </span>
                    </div>

                    <Link to="/my-orders" className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">
                      <Package className="w-4 h-4 text-slate-400" /> My Orders
                    </Link>

                    <Link to="/profile" className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">
                      <User className="w-4 h-4 text-slate-400" /> Account Profile
                    </Link>

                    {isVendor && (
                      <Link to="/vendor/dashboard" className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-50">
                        <Store className="w-4 h-4 text-amber-500" /> Vendor Dashboard
                      </Link>
                    )}

                    {isAdmin && (
                      <Link to="/admin/dashboard" className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-50">
                        <ShieldCheck className="w-4 h-4 text-indigo-500" /> Admin Console
                      </Link>
                    )}

                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 text-left"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-slate-700 hover:text-blue-600 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3.5 py-1.5 rounded-lg shadow-sm transition"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 md:hidden"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <form onSubmit={handleSearch} className="mb-3">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg"
            />
          </form>
          <Link
            to="/products"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
          >
            All Products
          </Link>
          <Link
            to="/register-vendor"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-50 rounded-lg"
          >
            Sell on VENDORA
          </Link>
        </div>
      )}
    </header>
  );
};

export default Navbar;
