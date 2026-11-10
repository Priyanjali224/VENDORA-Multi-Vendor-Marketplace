import React, { useState, useEffect } from 'react';
import { Users, CheckCircle2, XCircle, Search } from 'lucide-react';
import API from '../../services/api';
import { formatDate } from '../../utils/formatters';

const AdminCustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const { data } = await API.get(`/admin/customers?search=${encodeURIComponent(search)}`);
      if (data.success) {
        setCustomers(data.customers || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  const handleToggleActive = async (id) => {
    try {
      const { data } = await API.put(`/admin/customers/${id}/toggle-active`);
      if (data.success) {
        await fetchCustomers();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update customer status');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Customer Accounts Directory</h1>
        <p className="text-xs text-slate-500 mt-0.5">Manage registered consumers, contact information, and access control</p>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by customer name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 text-xs bg-transparent focus:outline-none"
        />
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-100">
              <tr>
                <th className="px-6 py-3">Customer Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Phone</th>
                <th className="px-6 py-3">Member Since</th>
                <th className="px-6 py-3">Account State</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">Loading customers...</td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-400">No customers found.</td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50">
                    <td className="px-6 py-3.5 font-semibold text-slate-900">{c.name}</td>
                    <td className="px-6 py-3.5 text-slate-700">{c.email}</td>
                    <td className="px-6 py-3.5 text-slate-500">{c.phone || 'N/A'}</td>
                    <td className="px-6 py-3.5 text-slate-500">{formatDate(c.createdAt)}</td>
                    <td className="px-6 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${c.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                        {c.isActive ? 'ACTIVE' : 'DEACTIVATED'}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <button
                        onClick={() => handleToggleActive(c._id)}
                        className={`text-xs font-semibold ${c.isActive ? 'text-rose-600 hover:underline' : 'text-emerald-600 hover:underline'}`}
                      >
                        {c.isActive ? 'Deactivate' : 'Activate'}
                      </button>
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

export default AdminCustomersPage;
