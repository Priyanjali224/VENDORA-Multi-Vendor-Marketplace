import React, { useState, useEffect } from 'react';
import { ShoppingBag, Eye, Store, Download } from 'lucide-react';
import API from '../../services/api';
import { formatPrice, formatDate, getStatusBadgeClass } from '../../utils/formatters';

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllOrders = async () => {
      try {
        setLoading(true);
        const { data } = await API.get('/admin/orders');
        if (data.success) {
          setOrders(data.orders || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllOrders();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Marketplace-Wide Orders Audit</h1>
        <p className="text-xs text-slate-500 mt-0.5">Real-time log of customer checkout transactions across all merchant stores</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-100">
              <tr>
                <th className="px-6 py-3">Order #</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Merchants</th>
                <th className="px-6 py-3">Total Amount</th>
                <th className="px-6 py-3">Payment</th>
                <th className="px-6 py-3">Fulfillment</th>
                <th className="px-6 py-3">Placed Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400">Loading marketplace orders...</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-slate-400">No marketplace orders recorded yet.</td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o._id} className="hover:bg-slate-50">
                    <td className="px-6 py-3.5 font-mono font-bold text-slate-900">{o.orderNumber}</td>
                    <td className="px-6 py-3.5 text-slate-700">
                      <div>{o.customer?.name || 'Customer'}</div>
                      <div className="text-[10px] text-slate-400">{o.customer?.email}</div>
                    </td>
                    <td className="px-6 py-3.5 text-slate-600">
                      {o.items?.length} item(s) from {new Set(o.items?.map(i => i.vendor?._id || i.vendor)).size} vendor(s)
                    </td>
                    <td className="px-6 py-3.5 font-bold text-slate-900">{formatPrice(o.totalAmount)}</td>
                    <td className="px-6 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${o.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                        {o.paymentStatus.toUpperCase()} ({o.paymentMethod.toUpperCase()})
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadgeClass(o.orderStatus)}`}>
                        {o.orderStatus}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-slate-500">{formatDate(o.createdAt)}</td>
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

export default AdminOrdersPage;
