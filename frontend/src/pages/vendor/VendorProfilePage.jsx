import React, { useState, useEffect } from 'react';
import { Store, CreditCard, Building2, CheckCircle2 } from 'lucide-react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const VendorProfilePage = () => {
  const { vendor, setVendor } = useAuth();
  const [storeName, setStoreName] = useState(vendor?.storeName || '');
  const [description, setDescription] = useState(vendor?.description || '');
  const [phone, setPhone] = useState(vendor?.phone || '');
  const [taxId, setTaxId] = useState(vendor?.taxId || '');
  const [logo, setLogo] = useState(vendor?.logo || '');
  const [banner, setBanner] = useState(vendor?.banner || '');
  const [bankAccount, setBankAccount] = useState({
    accountHolder: vendor?.bankAccount?.accountHolder || '',
    accountNumber: vendor?.bankAccount?.accountNumber || '',
    bankName: vendor?.bankAccount?.bankName || '',
    ifscCode: vendor?.bankAccount?.ifscCode || '',
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    try {
      const { data } = await API.put('/vendor/profile', {
        storeName,
        description,
        phone,
        taxId,
        logo,
        banner,
        bankAccount,
      });
      if (data.success) {
        setVendor(data.vendor);
        setSuccessMsg('Store information and payout bank details saved successfully!');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update store');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Store Profile & Payout Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">Manage public store branding, legal identifiers, and banking coordinates</p>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {successMsg}
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 text-xs">
        {/* Store Info */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
            <Store className="w-4 h-4 text-blue-600" /> Public Merchant Branding
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Store Name *</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Business Support Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">About the Store</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
              ></textarea>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Store Logo URL</label>
              <input
                type="text"
                value={logo}
                onChange={(e) => setLogo(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Store Banner URL</label>
              <input
                type="text"
                value={banner}
                onChange={(e) => setBanner(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">GSTIN / Tax ID</label>
              <input
                type="text"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                placeholder="27ABCDE1234F1Z5"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl uppercase font-mono"
              />
            </div>
          </div>
        </div>

        {/* Bank Details for Commission Payouts */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building2 className="w-4 h-4 text-emerald-600" /> Bank Payout Coordinates
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Account Holder Legal Name</label>
              <input
                type="text"
                value={bankAccount.accountHolder}
                onChange={(e) => setBankAccount({ ...bankAccount, accountHolder: e.target.value })}
                placeholder="As per bank passbook"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Bank Name</label>
              <input
                type="text"
                value={bankAccount.bankName}
                onChange={(e) => setBankAccount({ ...bankAccount, bankName: e.target.value })}
                placeholder="e.g. HDFC Bank Ltd"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Account Number</label>
              <input
                type="text"
                value={bankAccount.accountNumber}
                onChange={(e) => setBankAccount({ ...bankAccount, accountNumber: e.target.value })}
                placeholder="e.g. 50100234567890"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">IFSC Code</label>
              <input
                type="text"
                value={bankAccount.ifscCode}
                onChange={(e) => setBankAccount({ ...bankAccount, ifscCode: e.target.value.toUpperCase() })}
                placeholder="e.g. HDFC0001234"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono uppercase"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow transition disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VendorProfilePage;
