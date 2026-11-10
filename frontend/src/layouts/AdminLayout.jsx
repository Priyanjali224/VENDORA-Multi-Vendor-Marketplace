import React from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import {
  ShieldCheck,
  Store,
  Users,
  ShoppingBag,
  Ticket,
  FileSpreadsheet,
  ArrowLeft,
  Activity,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
  const { user, isAdmin } = useAuth();
  const location = useLocation();

  if (!user || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  const navLinks = [
    { name: 'Platform Overview', path: '/admin/dashboard', icon: ShieldCheck },
    { name: 'Vendors & Approvals', path: '/admin/vendors', icon: Store },
    { name: 'Customer Accounts', path: '/admin/customers', icon: Users },
    { name: 'Marketplace Orders', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Promotions & Coupons', path: '/admin/coupons', icon: Ticket },
    { name: 'Commission Ledger', path: '/admin/commissions', icon: FileSpreadsheet },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-slate-950 text-slate-300 flex flex-col flex-shrink-0">
        <div className="p-5 border-b border-slate-800">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-extrabold text-white tracking-tight">VENDORA</span>
              <span className="block text-[10px] uppercase font-bold text-indigo-400">Admin Console</span>
            </div>
          </Link>
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
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
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
            <ArrowLeft className="w-4 h-4" /> Back to Storefront
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-800">Marketplace Administration</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-medium">
              <Activity className="w-3.5 h-3.5 text-emerald-500" /> Platform Healthy
            </span>
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-800 font-bold flex items-center justify-center text-xs">
              A
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

export default AdminLayout;
