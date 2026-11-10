import React, { useState, useEffect } from 'react';
import { ShoppingBag, Clock, CheckCircle2, Truck, ArrowRight, Store } from 'lucide-react';
import API from '../../services/api';
import { formatPrice, formatDate, getStatusBadgeClass } from '../../utils/formatters';

const VendorOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const url = statusFilter ? `/vendor/orders?status=${statusFilter}` : '/vendor/orders';
      const { data } = await API.get(url);
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      const { data } = await API.put(`/vendor/orders/${orderId}/status`, {
        status: newStatus,
        note: `Status updated by merchant to ${newStatus}`,
      });
      if (data.success) {
        await fetchOrders();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Customer Fulfillment Orders</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage dispatch and update order progress for your assigned products</p>
        </div>

        {/* Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Fulfillment Statuses</option>
          <option value="PLACED">PLACED</option>
          <option value="CONFIRMED">CONFIRMED</option>
          <option value="PACKED">PACKED</option>
          <option value="SHIPPED">SHIPPED</option>
          <option value="DELIVERED">DELIVERED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading incoming orders...</div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Orders Found</h3>
          <p className="text-xs text-slate-500 mt-1">When customers order your products, they will appear here automatically.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((vOrder) => {
            const parent = vOrder.parentOrder || {};
            const items = vOrder.items || [];

            return (
              <div
                key={vOrder._id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:border-slate-300 transition"
              >
                {/* Header */}
                <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Parent Order #</span>
                      <span className="font-mono font-bold text-slate-900">{parent.orderNumber || 'VEN-ORDER'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Subtotal</span>
                      <span className="font-semibold text-slate-900">{formatPrice(vOrder.subtotal)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Platform Fee ({vOrder.commissionRate}%)</span>
                      <span className="text-rose-600 font-medium">-{formatPrice(vOrder.commissionAmount)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Your Net Earnings</span>
                      <span className="font-bold text-emerald-600">{formatPrice(vOrder.vendorEarnings)}</span>
                    </div>
                  </div>

                  {/* Status Dropdown */}
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-[11px] font-semibold">Update Status:</span>
                    <select
                      value={vOrder.status}
                      disabled={updatingId === vOrder._id || ['DELIVERED', 'CANCELLED'].includes(vOrder.status)}
                      onChange={(e) => handleStatusChange(vOrder._id, e.target.value)}
                      className={`px-3 py-1 text-xs font-bold rounded-lg border focus:ring-2 focus:ring-blue-500 ${getStatusBadgeClass(vOrder.status)}`}
                    >
                      <option value="PLACED">PLACED</option>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="PACKED">PACKED</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </div>
                </div>

                {/* Items and Customer Details */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                  <div className="md:col-span-2 divide-y divide-slate-100">
                    <h4 className="font-bold text-slate-800 mb-2 uppercase text-[10px] tracking-wider">Ordered Products</h4>
                    {items.map((it, idx) => (
                      <div key={idx} className="py-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={it.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100'}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200"
                          />
                          <div>
                            <span className="font-semibold text-slate-900 block">{it.title}</span>
                            <span className="text-[11px] text-slate-400">Qty: {it.quantity} × {formatPrice(it.price)}</span>
                          </div>
                        </div>
                        <span className="font-bold text-slate-900">{formatPrice(it.subtotal)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Customer & Shipping destination */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                    <h4 className="font-bold text-slate-800 uppercase text-[10px] tracking-wider">Buyer & Delivery</h4>
                    <p className="font-semibold text-slate-900">{parent.shippingAddress?.fullName || vOrder.customer?.name}</p>
                    <p className="text-slate-500">{parent.shippingAddress?.phone || vOrder.customer?.phone}</p>
                    <p className="text-slate-600 leading-relaxed">
                      {parent.shippingAddress?.addressLine1}, {parent.shippingAddress?.city}, {parent.shippingAddress?.state} - {parent.shippingAddress?.postalCode}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VendorOrdersPage;
