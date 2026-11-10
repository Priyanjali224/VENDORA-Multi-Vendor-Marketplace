import React from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  Boxes,
  ShoppingBag,
  TrendingUp,
  Store,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const VendorLayout = () => {
  const { user, vendor, isVendor } = useAuth();
  const location = useLocation();

  if (!user || (!isVendor && user.role !== 'admin')) {
    return <Navigate to="/login" replace />;
  }

  const navLinks = [
    { name: 'Dashboard', path: '/vendor/dashboard', icon: LayoutDashboard },
    { name: 'My Products', path: '/vendor/products', icon: Package },
    { name: 'Add Product', path: '/vendor/products/new', icon: PlusCircle },
    { name: 'Inventory & Stock', path: '/vendor/inventory', icon: Boxes },
    { name: 'Customer Orders', path: '/vendor/orders', icon: ShoppingBag },
    { name: 'Earnings & Payouts', path: '/vendor/earnings', icon: TrendingUp },
    { name: 'Store Profile', path: '/vendor/profile', icon: Store },
  ];

  const getStatusBadge = () => {
    const status = vendor?.status || 'pending';
    if (status === 'approved') {
      return (
        <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          <CheckCircle2 className="w-3 h-3" /> Store Approved
        </span>
      );
    }
    if (status === 'pending') {
      return (
        <span className="flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
          <Clock className="w-3 h-3" /> Pending Admin Review
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
        <AlertCircle className="w-3 h-3" /> {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col flex-shrink-0">
        <div className="p-5 border-b border-slate-800">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
              V
            </div>
            <span className="text-xl font-extrabold text-white tracking-tight">VENDORA</span>
          </Link>
          <div className="mt-4 pt-3 border-t border-slate-800">
            <p className="text-xs text-slate-400">Vendor Management</p>
            <h3 className="text-sm font-bold text-white truncate">{vendor?.storeName || 'My Store'}</h3>
            <div className="mt-2">{getStatusBadge()}</div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <Link
            to="/"
            className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition px-2 py-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Marketplace
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-800">Vendor Control Portal</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500">
              Commission Rate: <strong className="text-slate-800">{vendor?.commissionRate || 10}%</strong>
            </span>
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-xs">
              {user.name.charAt(0)}
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default VendorLayout;
