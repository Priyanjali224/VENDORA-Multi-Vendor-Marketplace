import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Upload, Plus, Trash2, CheckCircle2, ShieldAlert } from 'lucide-react';
import API from '../../services/api';

const VendorAddEditProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    sku: '',
    priceRupees: '',
    discountPriceRupees: '',
    stock: '20',
    lowStockThreshold: '5',
    images: [],
    tags: '',
  });

  const [specifications, setSpecifications] = useState([
    { key: 'Brand', value: '' },
    { key: 'Color / Material', value: '' },
  ]);

  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await API.get('/categories');
        if (data.success && data.categories.length > 0) {
          setCategories(data.categories);
          if (!isEdit) {
            setFormData((prev) => ({ ...prev, category: data.categories[0]._id }));
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, [isEdit]);

  useEffect(() => {
    if (isEdit) {
      const fetchProductData = async () => {
        try {
          const { data } = await API.get(`/products`); // Or product by id
          const p = data.products.find(item => item._id === id);
          if (p) {
            setFormData({
              name: p.name,
              description: p.description,
              category: p.category?._id || p.category,
              sku: p.sku,
              priceRupees: (p.price / 100).toString(),
              discountPriceRupees: p.discountPrice ? (p.discountPrice / 100).toString() : '',
              stock: p.stock.toString(),
              lowStockThreshold: (p.lowStockThreshold || 5).toString(),
              images: p.images || [],
              tags: p.tags ? p.tags.join(', ') : '',
            });
            if (p.specifications && p.specifications.length > 0) {
              setSpecifications(p.specifications);
            }
          }
        } catch (err) {
          console.error(err);
        }
      };
      fetchProductData();
    }
  }, [id, isEdit]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append('image', file);

    setUploadingImage(true);
    try {
      const res = await API.post('/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, res.data.url],
        }));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload image.');
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSpecChange = (index, field, value) => {
    const updated = [...specifications];
    updated[index][field] = value;
    setSpecifications(updated);
  };

  const addSpecRow = () => {
    setSpecifications([...specifications, { key: '', value: '' }]);
  };

  const removeSpecRow = (index) => {
    setSpecifications(specifications.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    try {
      const pricePaise = Math.round(Number(formData.priceRupees) * 100);
      const discountPricePaise = formData.discountPriceRupees
        ? Math.round(Number(formData.discountPriceRupees) * 100)
        : 0;

      const payload = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        sku: formData.sku,
        price: pricePaise,
        discountPrice: discountPricePaise,
        stock: Number(formData.stock),
        lowStockThreshold: Number(formData.lowStockThreshold),
        images: formData.images.length > 0 ? formData.images : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'],
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
        specifications: specifications.filter(s => s.key && s.value),
      };

      if (isEdit) {
        await API.put(`/vendor/products/${id}`, payload);
      } else {
        await API.post('/vendor/products', payload);
      }

      navigate('/vendor/products');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save product.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/vendor/products" className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-200">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {isEdit ? 'Edit Product Details' : 'Add New Product Listing'}
          </h1>
          <p className="text-xs text-slate-500">Provide accurate product details, pricing, and high-resolution images</p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 text-xs">
        {/* Images Upload Section */}
        <div className="space-y-3">
          <label className="block text-slate-800 font-bold uppercase tracking-wider text-[11px]">
            Product Images
          </label>
          <div className="flex flex-wrap gap-3 items-center">
            {formData.images.map((img, i) => (
              <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border border-slate-200 group">
                <img src={img} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 bg-rose-600 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            <label className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-500 flex flex-col items-center justify-center cursor-pointer text-slate-400 hover:text-blue-600 transition bg-slate-50">
              <Upload className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-semibold">{uploadingImage ? '...' : '+ Upload'}</span>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* Product Basic Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-slate-700 font-semibold mb-1">Product Title *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="e.g. Wireless Noise-Cancelling Over-Ear Headphones"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Category *</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            >
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">SKU (Stock Keeping Unit)</label>
            <input
              type="text"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
              placeholder="Leave blank to auto-generate"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono uppercase"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Selling Price (₹) *</label>
            <input
              type="number"
              step="any"
              value={formData.priceRupees}
              onChange={(e) => setFormData({ ...formData, priceRupees: e.target.value })}
              required
              placeholder="1999"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Discount Price (₹, optional)</label>
            <input
              type="number"
              step="any"
              value={formData.discountPriceRupees}
              onChange={(e) => setFormData({ ...formData, discountPriceRupees: e.target.value })}
              placeholder="1499"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-rose-600"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Initial Stock Count *</label>
            <input
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Low-Stock Alert Threshold</label>
            <input
              type="number"
              value={formData.lowStockThreshold}
              onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-slate-700 font-semibold mb-1">Product Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={4}
              placeholder="Detailed product highlights, warranty, and features..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
            ></textarea>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-slate-700 font-semibold mb-1">Search Tags (comma separated)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="wireless, audio, anc, bluetooth"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
            />
          </div>
        </div>

        {/* Specifications Section */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <label className="block text-slate-800 font-bold uppercase tracking-wider text-[11px]">
              Technical Specifications
            </label>
            <button
              type="button"
              onClick={addSpecRow}
              className="text-blue-600 font-bold hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Field
            </button>
          </div>

          <div className="space-y-2">
            {specifications.map((spec, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Property (e.g. Battery Life)"
                  value={spec.key}
                  onChange={(e) => handleSpecChange(i, 'key', e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Value (e.g. 40 Hours)"
                  value={spec.value}
                  onChange={(e) => handleSpecChange(i, 'value', e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeSpecRow(i)}
                  className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
          <Link
            to="/vendor/products"
            className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-500/20 disabled:opacity-50"
          >
            {submitting ? 'Saving Listing...' : isEdit ? 'Update Product' : 'Publish Product Listing'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VendorAddEditProductPage;
