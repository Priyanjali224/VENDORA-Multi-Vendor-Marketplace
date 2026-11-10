import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, TrendingUp, Store } from 'lucide-react';
import API from '../../services/api';
import { formatPrice, formatDate } from '../../utils/formatters';

const AdminCommissionsPage = () => {
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLedger = async () => {
      try {
        setLoading(true);
        const { data } = await API.get('/admin/commissions');
        if (data.success) {
          setCommissions(data.commissions || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLedger();
  }, []);

  const totalCommissionEarned = commissions.reduce((sum, c) => sum + (c.commissionAmount || 0), 0);
  const totalVendorPayouts = commissions.reduce((sum, c) => sum + (c.vendorEarnings || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Platform Commission & Payout Audit</h1>
        <p className="text-xs text-slate-500 mt-0.5">Accurate ledger records calculating marketplace commission splits and merchant entitlements</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Platform Revenue</span>
          <div className="text-2xl font-extrabold text-emerald-600 mt-2">
            {formatPrice(totalCommissionEarned)}
          </div>
          <span className="text-[10px] text-slate-400">Sum of all platform commission retained</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Merchant Payouts Due</span>
          <div className="text-2xl font-extrabold text-blue-700 mt-2">
            {formatPrice(totalVendorPayouts)}
          </div>
          <span className="text-[10px] text-slate-400">Disbursable to merchants</span>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-100">
              <tr>
                <th className="px-6 py-3">Transaction Date</th>
                <th className="px-6 py-3">Merchant</th>
                <th className="px-6 py-3">Parent Order #</th>
                <th className="px-6 py-3">Order Subtotal</th>
                <th className="px-6 py-3">Commission %</th>
                <th className="px-6 py-3">Platform Retained</th>
                <th className="px-6 py-3 text-right">Vendor Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400">Loading commission ledger...</td>
                </tr>
              ) : commissions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-slate-400">No commission records accrued yet.</td>
                </tr>
              ) : (
                commissions.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50">
                    <td className="px-6 py-3.5 text-slate-700">{formatDate(c.createdAt)}</td>
                    <td className="px-6 py-3.5 font-bold text-slate-900">{c.vendor?.storeName || 'Merchant'}</td>
                    <td className="px-6 py-3.5 font-mono text-[11px] text-slate-600">
                      {c.order?.orderNumber || 'VEN-ORDER'}
                    </td>
                    <td className="px-6 py-3.5 font-semibold text-slate-900">{formatPrice(c.subtotal)}</td>
                    <td className="px-6 py-3.5 text-slate-500 font-semibold">{c.commissionRate}%</td>
                    <td className="px-6 py-3.5 font-bold text-emerald-600">+{formatPrice(c.commissionAmount)}</td>
                    <td className="px-6 py-3.5 text-right font-bold text-blue-700">{formatPrice(c.vendorEarnings)}</td>
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

export default AdminCommissionsPage;
