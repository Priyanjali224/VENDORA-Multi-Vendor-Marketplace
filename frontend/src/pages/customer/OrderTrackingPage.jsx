import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  Truck,
  Package,
  Store,
  MapPin,
  ArrowLeft,
  Download,
} from 'lucide-react';
import API from '../../services/api';
import { formatPrice, formatDateTime, getStatusBadgeClass } from '../../utils/formatters';

const OrderTrackingPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [subOrders, setSubOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const { data } = await API.get(`/orders/${id}`);
        if (data.success) {
          setOrder(data.order);
          setSubOrders(data.subOrders || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetails();
  }, [id]);

  if (loading) {
    return <div className="max-w-4xl mx-auto py-24 text-center text-xs text-slate-400">Loading order tracking timeline...</div>;
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center">
        <h2 className="text-xl font-bold text-slate-800">Order Not Found</h2>
        <Link to="/my-orders" className="text-xs text-blue-600 font-semibold mt-2 inline-block">
          Return to My Orders
        </Link>
      </div>
    );
  }

  const steps = ['PLACED', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED'];
  const currentStepIdx = steps.indexOf(order.orderStatus);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <Link to="/my-orders" className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1.5">
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </Link>
        <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getStatusBadgeClass(order.orderStatus)}`}>
          Order Status: {order.orderStatus}
        </span>
      </div>

      {/* Main Order Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tracking Order</span>
            <h1 className="text-2xl font-extrabold text-slate-900 font-mono">{order.orderNumber}</h1>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-500 block">Total Amount</span>
            <span className="text-2xl font-extrabold text-blue-700">{formatPrice(order.totalAmount)}</span>
          </div>
        </div>

        {/* Visual Progress Bar (if not cancelled) */}
        {order.orderStatus !== 'CANCELLED' ? (
          <div className="py-6">
            <div className="relative">
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-slate-100">
                <div
                  style={{ width: `${Math.max(10, ((currentStepIdx + 1) / steps.length) * 100)}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600 transition-all duration-700"
                ></div>
              </div>

              <div className="grid grid-cols-5 text-center">
                {steps.map((st, i) => {
                  const isCompleted = i <= currentStepIdx;
                  return (
                    <div key={st} className="space-y-1">
                      <div
                        className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center text-xs font-bold ${
                          isCompleted
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                      </div>
                      <span className={`block text-[11px] font-bold ${isCompleted ? 'text-blue-900' : 'text-slate-400'}`}>
                        {st}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            This order was cancelled. {order.cancellationReason && `Reason: ${order.cancellationReason}`}
          </div>
        )}

        {/* Tracking Logs */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Milestone History</h3>
          <div className="space-y-2">
            {order.trackingHistory && order.trackingHistory.map((step, idx) => (
              <div key={idx} className="flex items-start gap-3 text-xs p-3 rounded-xl bg-slate-50 border border-slate-100">
                <Clock className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{step.status}</span>
                    <span className="text-[11px] text-slate-400">{formatDateTime(step.timestamp)}</span>
                  </div>
                  <p className="text-slate-600 mt-0.5">{step.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Multi-Vendor Packages Breakdown */}
      {subOrders.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Vendor Fulfillment Packages ({subOrders.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {subOrders.map((so) => (
              <div key={so._id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-slate-800">{so.vendor?.storeName || 'Merchant'}</span>
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${getStatusBadgeClass(so.status)}`}>
                    {so.status}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  {so.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between text-slate-700">
                      <span className="truncate max-w-xs">{it.title} x {it.quantity}</span>
                      <span className="font-semibold">{formatPrice(it.subtotal)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delivery Destination */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-start gap-3">
        <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600 space-y-1">
          <h4 className="font-bold text-slate-900">Delivery Address</h4>
          <p className="font-medium text-slate-800">{order.shippingAddress?.fullName} ({order.shippingAddress?.phone})</p>
          <p>{order.shippingAddress?.addressLine1}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.postalCode}</p>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingPage;
