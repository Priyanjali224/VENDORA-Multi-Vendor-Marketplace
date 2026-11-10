import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Download, Eye, XCircle, ArrowRight, Store } from 'lucide-react';
import API from '../../services/api';
import { formatPrice, formatDate, getStatusBadgeClass } from '../../utils/formatters';

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/orders/my-orders');
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
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order? Stock will be restored.')) return;
    try {
      setCancellingId(orderId);
      const { data } = await API.put(`/orders/${orderId}/cancel`, {
        reason: 'Buyer requested cancellation',
      });
      if (data.success) {
        await fetchOrders();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Could not cancel order.');
    } finally {
      setCancellingId(null);
    }
  };

  const handleDownloadInvoice = (orderId, orderNumber) => {
    const token = localStorage.getItem('vendora_token');
    fetch(`/api/orders/${orderId}/invoice`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Invoice-${orderNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch((err) => console.error(err));
  };

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-20 text-center text-xs text-slate-400">Loading your purchase history...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Purchase History</h1>
        <p className="text-xs text-slate-500 mt-1">Track fulfillments and download invoices for your purchases</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">You haven't placed any orders yet</h3>
          <p className="text-xs text-slate-500 mt-1">Explore our verified merchant catalog.</p>
          <Link
            to="/products"
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold"
          >
            Start Shopping <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const canCancel = ['PLACED', 'CONFIRMED'].includes(order.orderStatus);

            return (
              <div
                key={order._id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:border-slate-300 transition"
              >
                {/* Header */}
                <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Order Placed</span>
                      <span className="font-semibold text-slate-800">{formatDate(order.createdAt)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Total</span>
                      <span className="font-bold text-blue-700">{formatPrice(order.totalAmount)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Order #</span>
                      <span className="font-mono font-bold text-slate-800">{order.orderNumber}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full border ${getStatusBadgeClass(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                    <button
                      onClick={() => handleDownloadInvoice(order._id, order.orderNumber)}
                      className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-200"
                      title="Download Invoice PDF"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <Link
                      to={`/orders/${order._id}/tracking`}
                      className="px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                    >
                      <Eye className="w-3.5 h-3.5" /> Track
                    </Link>
                  </div>
                </div>

                {/* Items */}
                <div className="p-6 divide-y divide-slate-100">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4 text-xs">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100'}
                          alt=""
                          className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                        />
                        <div>
                          <h4 className="font-semibold text-slate-900">{item.title}</h4>
                          <span className="text-[11px] text-slate-400">Qty: {item.quantity}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-bold text-slate-800">{formatPrice(item.subtotal)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer cancel action */}
                {canCancel && (
                  <div className="px-6 py-2.5 bg-slate-50/50 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={() => handleCancelOrder(order._id)}
                      disabled={cancellingId === order._id}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" /> {cancellingId === order._id ? 'Cancelling...' : 'Cancel Order'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyOrdersPage;
