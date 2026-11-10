import React, { useState, useEffect } from 'react';
import { Ticket, Plus, CheckCircle2, Calendar } from 'lucide-react';
import API from '../../services/api';
import { formatPrice, formatDate } from '../../utils/formatters';

const AdminCouponsPage = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '10',
    minOrderAmountRupees: '999',
    maxDiscountAmountRupees: '1500',
    usageLimit: '1000',
    endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/admin/coupons');
      if (data.success) {
        setCoupons(data.coupons || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      const minOrderPaise = Math.round(Number(formData.minOrderAmountRupees || 0) * 100);
      const maxDiscountPaise = Math.round(Number(formData.maxDiscountAmountRupees || 0) * 100);
      const discountVal = formData.discountType === 'percentage'
        ? Number(formData.discountValue)
        : Math.round(Number(formData.discountValue) * 100);

      const { data } = await API.post('/admin/coupons', {
        code: formData.code,
        discountType: formData.discountType,
        discountValue: discountVal,
        minOrderAmount: minOrderPaise,
        maxDiscountAmount: maxDiscountPaise,
        usageLimit: Number(formData.usageLimit),
        endDate: formData.endDate,
      });

      if (data.success) {
        setShowCreateModal(false);
        setFormData({
          code: '',
          discountType: 'percentage',
          discountValue: '10',
          minOrderAmountRupees: '999',
          maxDiscountAmountRupees: '1500',
          usageLimit: '1000',
          endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        });
        await fetchCoupons();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create coupon');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Promotions & Discount Coupons</h1>
          <p className="text-xs text-slate-500 mt-0.5">Configure platform promotional campaigns and cart discounts</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow transition"
        >
          <Plus className="w-4 h-4" /> Create Coupon
        </button>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-100">
              <tr>
                <th className="px-6 py-3">Coupon Code</th>
                <th className="px-6 py-3">Discount Type</th>
                <th className="px-6 py-3">Benefit</th>
                <th className="px-6 py-3">Min Order Amount</th>
                <th className="px-6 py-3">Usage Limit</th>
                <th className="px-6 py-3">Expires On</th>
                <th className="px-6 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400">Loading coupons...</td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-slate-400">No active promotional coupons.</td>
                </tr>
              ) : (
                coupons.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50">
                    <td className="px-6 py-3.5 font-mono font-bold text-indigo-700 bg-indigo-50/50">
                      {c.code}
                    </td>
                    <td className="px-6 py-3.5 text-slate-600 capitalize">{c.discountType}</td>
                    <td className="px-6 py-3.5 font-bold text-slate-900">
                      {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `${formatPrice(c.discountValue)} FLAT`}
                    </td>
                    <td className="px-6 py-3.5 text-slate-600">{formatPrice(c.minOrderAmount)}</td>
                    <td className="px-6 py-3.5 text-slate-600">{c.usedCount || 0} / {c.usageLimit}</td>
                    <td className="px-6 py-3.5 text-slate-500">{formatDate(c.endDate)}</td>
                    <td className="px-6 py-3.5 text-right">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${c.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                        {c.isActive ? 'ACTIVE' : 'EXPIRED'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900">Create Promotional Coupon</h3>

            <form onSubmit={handleCreateCoupon} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FESTIVE20"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono uppercase font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Discount Type</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Discount Value *</label>
                  <input
                    type="number"
                    required
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Min Order (₹)</label>
                  <input
                    type="number"
                    value={formData.minOrderAmountRupees}
                    onChange={(e) => setFormData({ ...formData, minOrderAmountRupees: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Max Cap (₹, for %)</label>
                  <input
                    type="number"
                    value={formData.maxDiscountAmountRupees}
                    onChange={(e) => setFormData({ ...formData, maxDiscountAmountRupees: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Usage Limit</label>
                  <input
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Expiry Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold shadow hover:bg-indigo-700 transition"
                >
                  Create Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCouponsPage;
