import React, { useState, useEffect } from 'react';
import { Boxes, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';
import API from '../../services/api';
import { formatPrice } from '../../utils/formatters';

const VendorInventoryPage = () => {
  const [inventories, setInventories] = useState([]);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [newStockValues, setNewStockValues] = useState({});

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/vendor/inventory');
      if (data.success) {
        setInventories(data.inventories || []);
        setLowStockAlerts(data.lowStockAlerts || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleStockUpdate = async (productId, currentStock) => {
    const qty = newStockValues[productId];
    if (qty === undefined || qty === '') return;

    try {
      setUpdatingId(productId);
      const { data } = await API.put(`/vendor/products/${productId}`, {
        stock: Number(qty),
      });
      if (data.success) {
        await fetchInventory();
        setNewStockValues({ ...newStockValues, [productId]: '' });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update stock');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Real-Time Inventory & Stock Management</h1>
        <p className="text-xs text-slate-500 mt-0.5">Track warehouse levels and prevent stockouts with automated threshold triggers</p>
      </div>

      {lowStockAlerts.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>
              <strong>Attention:</strong> {lowStockAlerts.length} product(s) are below safety stock thresholds. Restock immediately to prevent lost sales.
            </span>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-100">
              <tr>
                <th className="px-6 py-3">Product Name</th>
                <th className="px-6 py-3">SKU</th>
                <th className="px-6 py-3">Current Stock</th>
                <th className="px-6 py-3">Low-Stock Alert Level</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Quick Restock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">Loading inventory...</td>
                </tr>
              ) : inventories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-400">No inventory tracked yet.</td>
                </tr>
              ) : (
                inventories.map((inv) => {
                  const product = inv.product;
                  if (!product) return null;
                  const isLow = inv.quantity <= (inv.lowStockThreshold || 5);

                  return (
                    <tr key={inv._id} className="hover:bg-slate-50">
                      <td className="px-6 py-3.5 font-semibold text-slate-900">{product.name}</td>
                      <td className="px-6 py-3.5 font-mono text-[11px] text-slate-600">{product.sku}</td>
                      <td className="px-6 py-3.5 font-bold text-slate-900">{inv.quantity} units</td>
                      <td className="px-6 py-3.5 text-slate-500">≤ {inv.lowStockThreshold || 5} units</td>
                      <td className="px-6 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            inv.quantity === 0
                              ? 'bg-rose-100 text-rose-800'
                              : isLow
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {inv.quantity === 0 ? 'Out of Stock' : isLow ? 'Low Stock' : 'Healthy Stock'}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <input
                            type="number"
                            placeholder="New qty"
                            value={newStockValues[product._id] ?? ''}
                            onChange={(e) => setNewStockValues({ ...newStockValues, [product._id]: e.target.value })}
                            className="w-20 px-2 py-1 text-xs border border-slate-300 rounded-lg"
                          />
                          <button
                            onClick={() => handleStockUpdate(product._id, inv.quantity)}
                            disabled={updatingId === product._id}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow transition disabled:opacity-50"
                          >
                            {updatingId === product._id ? '...' : 'Update'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VendorInventoryPage;
