import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Package,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import API from '../../services/api';
import { formatPrice, formatDate, getStatusBadgeClass } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

const VendorDashboardPage = () => {
  const { vendor } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [inventoryAlerts, setInventoryAlerts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        setLoading(true);
        const [anaRes, invRes, ordRes] = await Promise.all([
          API.get('/vendor/analytics'),
          API.get('/vendor/inventory'),
          API.get('/vendor/orders?limit=5'),
        ]);

        if (anaRes.data.success) setAnalytics(anaRes.data);
        if (invRes.data.success) setInventoryAlerts(invRes.data.lowStockAlerts || []);
        if (ordRes.data.success) setRecentOrders(ordRes.data.orders || []);
      } catch (err) {
        console.error('Failed to load vendor dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVendorData();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-400">Loading vendor metrics...</div>;
  }

  const isPending = vendor?.status === 'pending';

  return (
    <div className="space-y-8">
      {/* Approval Status Banner */}
      {isPending ? (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
          <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-bold">Store Under Administrator Review</h4>
            <p className="mt-0.5 text-amber-700">
              Your store application has been received. Products and customer orders will become active once an administrator approves your account in the Admin Console.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Store Approved • Platform Commission Rate: <strong>{analytics?.summary?.commissionRate || 10}%</strong></span>
          </div>
          <Link to="/vendor/products/new" className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold shadow hover:bg-emerald-700 transition">
            + Add New Product
          </Link>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Gross Sales</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-3">
            {formatPrice(analytics?.summary?.totalSales || 0)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Total revenue generated</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Net Earnings</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-3">
            {formatPrice(analytics?.summary?.totalNetEarnings || 0)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">After platform fee deductions</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Commissions Paid</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-3">
            {formatPrice(analytics?.summary?.totalCommissionsPaid || 0)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Platform fee (10-12%)</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-3">
            {analytics?.summary?.totalOrders || 0}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {analytics?.summary?.completedOrders || 0} fulfilled successfully
          </p>
        </div>
      </div>

      {/* Monthly Sales Analytics Chart using Recharts */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Monthly Revenue Trend (₹)</h3>
            <p className="text-xs text-slate-400 mt-0.5">Real-time revenue visualization</p>
          </div>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
            Live Analytics
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analytics?.monthlyChartData || []}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(val) => [`₹${val}`, 'Revenue']}
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Low Stock Warnings */}
      {inventoryAlerts.length > 0 && (
        <div className="bg-rose-50/50 rounded-2xl p-5 border border-rose-200 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-rose-800 flex items-center gap-1.5 uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-rose-600" /> Low Stock Inventory Alerts ({inventoryAlerts.length})
            </h4>
            <Link to="/vendor/inventory" className="text-xs font-semibold text-rose-600 hover:underline">
              Manage Inventory
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {inventoryAlerts.slice(0, 3).map((item) => (
              <div key={item._id} className="p-3 rounded-xl bg-white border border-rose-200 text-xs flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-800 block truncate max-w-[140px]">{item.product?.name}</span>
                  <span className="text-[10px] text-slate-400">SKU: {item.product?.sku}</span>
                </div>
                <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                  {item.quantity} left
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm space-y-2">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">Recent Customer Orders</h3>
          <Link to="/vendor/orders" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
            View All Orders <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-100">
              <tr>
                <th className="px-6 py-3">Order Number</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Subtotal</th>
                <th className="px-6 py-3">Net Earnings</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    No orders placed yet.
                  </td>
                </tr>
              ) : (
                recentOrders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-slate-50">
                    <td className="px-6 py-3.5 font-mono font-bold text-slate-900">
                      {ord.parentOrder?.orderNumber || 'VEN-ORDER'}
                    </td>
                    <td className="px-6 py-3.5 text-slate-700">{ord.customer?.name || 'Customer'}</td>
                    <td className="px-6 py-3.5 font-semibold text-slate-900">{formatPrice(ord.subtotal)}</td>
                    <td className="px-6 py-3.5 font-bold text-emerald-600">{formatPrice(ord.vendorEarnings)}</td>
                    <td className="px-6 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadgeClass(ord.status)}`}>
                        {ord.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <Link to="/vendor/orders" className="text-blue-600 font-semibold hover:underline">
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboardPage;
