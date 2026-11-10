import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import API from '../../services/api';
import { formatPrice, formatDate } from '../../utils/formatters';

const VendorEarningsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        setLoading(true);
        const res = await API.get('/vendor/analytics');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEarnings();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-400">Loading commission ledger...</div>;
  }

  const summary = data?.summary || {};
  const commissions = data?.recentCommissions || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Earnings & Commission Ledgers</h1>
        <p className="text-xs text-slate-500 mt-0.5">Transparent financial accounting of all sales and platform commission deductions</p>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gross Sales</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">
            {formatPrice(summary.totalSales || 0)}
          </div>
          <span className="text-[10px] text-slate-400">100% of product GMV</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Platform Commission ({summary.commissionRate}%)</span>
          <div className="text-2xl font-extrabold text-rose-600 mt-2">
            {formatPrice(summary.totalCommissionsPaid || 0)}
          </div>
          <span className="text-[10px] text-slate-400">Platform marketplace fee</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Net Vendor Earnings</span>
          <div className="text-2xl font-extrabold text-emerald-600 mt-2">
            {formatPrice(summary.totalNetEarnings || 0)}
          </div>
          <span className="text-[10px] text-slate-400">Your total take-home entitlement</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Payouts</span>
          <div className="text-2xl font-extrabold text-blue-700 mt-2">
            {formatPrice(summary.pendingPayouts || 0)}
          </div>
          <span className="text-[10px] text-slate-400">Scheduled for bank transfer</span>
        </div>
      </div>

      {/* Commission Ledger Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm space-y-2">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-blue-600" /> Commission Deduction Audit Records
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">Real-time ledger entries</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-100">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Gross Subtotal</th>
                <th className="px-6 py-3">Platform Rate</th>
                <th className="px-6 py-3">Commission Deducted</th>
                <th className="px-6 py-3">Net Vendor Earning</th>
                <th className="px-6 py-3 text-right">Settlement Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {commissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    No ledger entries found yet.
                  </td>
                </tr>
              ) : (
                commissions.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50">
                    <td className="px-6 py-3.5 text-slate-700">{formatDate(c.createdAt)}</td>
                    <td className="px-6 py-3.5 font-semibold text-slate-900">{formatPrice(c.subtotal)}</td>
                    <td className="px-6 py-3.5 text-slate-500">{c.commissionRate}%</td>
                    <td className="px-6 py-3.5 font-semibold text-rose-600">-{formatPrice(c.commissionAmount)}</td>
                    <td className="px-6 py-3.5 font-bold text-emerald-600">{formatPrice(c.vendorEarnings)}</td>
                    <td className="px-6 py-3.5 text-right">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {c.status.toUpperCase()}
                      </span>
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

export default VendorEarningsPage;
