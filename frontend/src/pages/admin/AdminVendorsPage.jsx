import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Store, CheckCircle2, XCircle, AlertTriangle, Search, ShieldCheck } from 'lucide-react';
import API from '../../services/api';
import { formatDate, getStatusBadgeClass } from '../../utils/formatters';

const AdminVendorsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const status = searchParams.get('status') || '';
  const search = searchParams.get('search') || '';

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      if (search) params.set('search', search);

      const { data } = await API.get(`/admin/vendors?${params.toString()}`);
      if (data.success) {
        setVendors(data.vendors || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, [status, search]);

  const handleStatusUpdate = async (vendorId, newStatus, currentRate) => {
    let rate = currentRate;
    if (newStatus === 'approved') {
      const promptRate = window.prompt(`Confirm commission rate % for this merchant:`, currentRate || '10');
      if (promptRate === null) return;
      rate = Number(promptRate) || currentRate;
    }

    try {
      setUpdatingId(vendorId);
      const { data } = await API.put(`/admin/vendors/${vendorId}/status`, {
        status: newStatus,
        commissionRate: rate,
      });
      if (data.success) {
        await fetchVendors();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update vendor status.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Merchant & Vendor Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">Audit onboarding applications, enforce platform terms, and set custom commission tiers</p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs">
          {['', 'pending', 'approved', 'rejected', 'suspended'].map((st) => (
            <button
              key={st}
              onClick={() => {
                const p = new URLSearchParams(searchParams);
                if (st) p.set('status', st);
                else p.delete('status');
                setSearchParams(p);
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold capitalize transition ${
                status === st ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st || 'All Vendors'}
            </button>
          ))}
        </div>
      </div>

      {/* Vendors Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-100">
              <tr>
                <th className="px-6 py-3">Store Name</th>
                <th className="px-6 py-3">Owner Contact</th>
                <th className="px-6 py-3">Applied Date</th>
                <th className="px-6 py-3">Commission %</th>
                <th className="px-6 py-3">Verification Status</th>
                <th className="px-6 py-3 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">Loading merchant list...</td>
                </tr>
              ) : vendors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No vendors found matching criteria.
                  </td>
                </tr>
              ) : (
                vendors.map((v) => (
                  <tr key={v._id} className="hover:bg-slate-50">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                          {v.storeName.charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{v.storeName}</span>
                          <span className="text-[10px] text-slate-400">{v.slug}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-slate-700">
                      <div>{v.user?.name || 'Owner'}</div>
                      <div className="text-[10px] text-slate-400">{v.email || v.user?.email}</div>
                    </td>
                    <td className="px-6 py-3.5 text-slate-600">{formatDate(v.createdAt)}</td>
                    <td className="px-6 py-3.5">
                      <span className="font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                        {v.commissionRate}%
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadgeClass(v.status)}`}>
                        {v.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {v.status !== 'approved' && (
                          <button
                            onClick={() => handleStatusUpdate(v._id, 'approved', v.commissionRate)}
                            disabled={updatingId === v._id}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold shadow-sm transition"
                          >
                            Approve
                          </button>
                        )}
                        {v.status === 'pending' && (
                          <button
                            onClick={() => handleStatusUpdate(v._id, 'rejected', v.commissionRate)}
                            disabled={updatingId === v._id}
                            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[11px] font-bold shadow-sm transition"
                          >
                            Reject
                          </button>
                        )}
                        {v.status === 'approved' && (
                          <button
                            onClick={() => handleStatusUpdate(v._id, 'suspended', v.commissionRate)}
                            disabled={updatingId === v._id}
                            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[11px] font-bold shadow-sm transition"
                          >
                            Suspend
                          </button>
                        )}
                        {v.status === 'suspended' && (
                          <button
                            onClick={() => handleStatusUpdate(v._id, 'approved', v.commissionRate)}
                            disabled={updatingId === v._id}
                            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold shadow-sm transition"
                          >
                            Reactivate
                          </button>
                        )}
                      </div>
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

export default AdminVendorsPage;
