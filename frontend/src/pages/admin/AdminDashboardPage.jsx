import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Users,
  Store,
  Clock,
  Package,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import API from '../../services/api';
import { formatPrice } from '../../utils/formatters';

const AdminDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        setLoading(true);
        const { data } = await API.get('/admin/dashboard-stats');
        if (data.success) {
          setData(data);
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminStats();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-400">Loading marketplace analytics...</div>;
  }

  const stats = data?.stats || {};
  const revenueChart = data?.revenueChart || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Executive Marketplace Overview</h1>
        <p className="text-xs text-slate-500 mt-0.5">High-level aggregates, platform revenue, and merchant compliance</p>
      </div>

      {/* Pending Vendor Alert if any */}
      {stats.pendingVendors > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-xs">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>
              <strong>Action Needed:</strong> {stats.pendingVendors} pending vendor store application(s) awaiting administrative review.
            </span>
          </div>
          <Link
            to="/admin/vendors?status=pending"
            className="px-3.5 py-1.5 bg-amber-600 text-white rounded-xl text-xs font-bold shadow hover:bg-amber-700 transition"
          >
            Review Applications
          </Link>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total GMV Revenue</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-3">
            {formatPrice(stats.totalRevenue || 0)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Gross marketplace merchandise value</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Platform Commissions</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-3">
            {formatPrice(stats.totalPlatformCommissions || 0)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Platform retained net revenue</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-3">
            {stats.totalOrders || 0}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Multi-vendor marketplace orders</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Merchants</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-3">
            {stats.totalVendors || 0}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">{stats.pendingVendors || 0} pending verification</p>
        </div>
      </div>

      {/* Chart Visualizations with Recharts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GMV Growth Chart */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Monthly Platform GMV (₹)</h3>
              <p className="text-xs text-slate-400 mt-0.5">Aggregate customer order value</p>
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Gross</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChart}>
                <defs>
                  <linearGradient id="colorGmv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(val) => [`₹${val}`, 'Gross GMV']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#1d4ed8" strokeWidth={2.5} fillOpacity={1} fill="url(#colorGmv)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Platform Commission Revenue Chart */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Platform Commission Income (₹)</h3>
              <p className="text-xs text-slate-400 mt-0.5">Net platform fees earned from vendor sales</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Net Commission</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueChart}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(val) => [`₹${val}`, 'Platform Fee']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="commission" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Navigation Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/admin/vendors"
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition flex items-center justify-between"
        >
          <div>
            <h4 className="font-bold text-slate-800 text-xs">Manage Merchants</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Approve or suspend vendor stores</p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </Link>

        <Link
          to="/admin/orders"
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition flex items-center justify-between"
        >
          <div>
            <h4 className="font-bold text-slate-800 text-xs">Inspect Orders</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Audit marketplace transactions</p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </Link>

        <Link
          to="/admin/coupons"
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition flex items-center justify-between"
        >
          <div>
            <h4 className="font-bold text-slate-800 text-xs">Create Promo Coupons</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Configure discounts & caps</p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
