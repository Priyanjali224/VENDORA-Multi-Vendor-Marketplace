import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Download, Package, ArrowRight, Store } from 'lucide-react';
import API from '../../services/api';
import { formatPrice } from '../../utils/formatters';

const PaymentResultPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await API.get(`/orders/${orderId}`);
        if (data.success) {
          setOrder(data.order);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  const handleDownloadInvoice = async () => {
    try {
      const response = await API.get(`/orders/${orderId}/invoice`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice-${order?.orderNumber || orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error('Failed to download invoice:', err);
    }
  };

  if (loading) {
    return <div className="max-w-xl mx-auto py-24 text-center text-xs text-slate-400">Finalizing order...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Payment Verified</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Thank You for Your Order!</h1>
          <p className="text-xs text-slate-500 mt-2">
            Your payment has been captured and orders have been dispatched to merchant vendors for packaging.
          </p>
        </div>

        {order && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Order Number:</span>
              <span className="font-bold text-slate-900">{order.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Amount Paid:</span>
              <span className="font-bold text-blue-700">{formatPrice(order.totalAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Payment Status:</span>
              <span className="font-bold text-emerald-600 uppercase">{order.paymentStatus}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Delivery Address:</span>
              <span className="font-medium text-slate-800 text-right truncate max-w-xs">
                {order.shippingAddress?.city}, {order.shippingAddress?.state}
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleDownloadInvoice}
            className="flex-1 py-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-bold shadow-sm flex items-center justify-center gap-2 transition"
          >
            <Download className="w-4 h-4 text-blue-600" /> Download PDF Invoice
          </button>
          <Link
            to={`/orders/${orderId}/tracking`}
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition"
          >
            <Package className="w-4 h-4" /> Live Tracking
          </Link>
        </div>

        <div className="pt-2">
          <Link to="/products" className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1">
            Continue Shopping on VENDORA <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentResultPage;
