import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Filter,
  Search,
  Star,
  ShoppingBag,
  SlidersHorizontal,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import API from '../../services/api';
import { formatPrice } from '../../utils/formatters';
import { useCart } from '../../context/CartContext';

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [addedItem, setAddedItem] = useState(null);

  const { addToCart } = useCart();

  // Filter States
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'newest';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const rating = searchParams.get('rating') || '';
  const page = searchParams.get('page') || '1';

  // Load Categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await API.get('/categories');
        if (data.success) setCategories(data.categories);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch Products whenever query params change
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams(searchParams);
        const { data } = await API.get(`/products?${params.toString()}`);
        if (data.success) {
          setProducts(data.products);
          setPagination(data.pagination);
        }
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [searchParams]);

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1'); // reset to page 1 on filter change
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const handleQuickAdd = async (e, productId) => {
    e.preventDefault();
    const res = await addToCart(productId, 1);
    if (res.success) {
      setAddedItem(productId);
      setTimeout(() => setAddedItem(null), 2000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Marketplace Catalog</h1>
          <p className="text-xs text-slate-500 mt-1">
            Showing {pagination.total} products from independent verified vendors
          </p>
        </div>

        {/* Sort & Mobile Filter Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg"
          >
            <Filter className="w-4 h-4" /> Filters
          </button>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 hidden sm:inline">Sort by:</span>
            <select
              value={sort}
              onChange={(e) => updateFilter('sort', e.target.value)}
              className="px-3 py-2 text-xs font-medium bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex gap-8 pt-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block w-64 flex-shrink-0 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-blue-600" /> Filters
            </h3>
            {(category || minPrice || maxPrice || rating || search) && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold"
              >
                Reset All
              </button>
            )}
          </div>

          {/* Categories Filter */}
          <div className="space-y-2 border-t border-slate-200 pt-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Categories</h4>
            <div className="space-y-1">
              <button
                onClick={() => updateFilter('category', '')}
                className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg transition ${
                  !category ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => updateFilter('category', cat.slug)}
                  className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg transition ${
                    category === cat.slug ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter (Paise conversion: ₹100 = 10000 paise) */}
          <div className="space-y-3 border-t border-slate-200 pt-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Price Range (₹)</h4>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min ₹"
                defaultValue={minPrice ? Number(minPrice) / 100 : ''}
                onBlur={(e) => updateFilter('minPrice', e.target.value ? Number(e.target.value) * 100 : '')}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg"
              />
              <span className="text-slate-400 text-xs">to</span>
              <input
                type="number"
                placeholder="Max ₹"
                defaultValue={maxPrice ? Number(maxPrice) / 100 : ''}
                onBlur={(e) => updateFilter('maxPrice', e.target.value ? Number(e.target.value) * 100 : '')}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          {/* Rating Filter */}
          <div className="space-y-2 border-t border-slate-200 pt-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Customer Rating</h4>
            <div className="space-y-1">
              {[4, 3, 2].map((stars) => (
                <button
                  key={stars}
                  onClick={() => updateFilter('rating', rating === stars.toString() ? '' : stars.toString())}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg transition ${
                    rating === stars.toString() ? 'bg-amber-50 text-amber-900 font-bold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{stars} Stars & Above</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <main className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="bg-white rounded-2xl h-80 animate-pulse border border-slate-200"></div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 p-8">
              <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-800">No products match your criteria</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Try loosening your filters, removing search terms, or checking back soon as vendors add new items daily.
              </p>
              <button
                onClick={clearAllFilters}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => {
                  const displayPrice = product.discountPrice > 0 ? product.discountPrice : product.price;
                  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;

                  return (
                    <div
                      key={product._id}
                      className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-blue-200 transition-all duration-300 flex flex-col"
                    >
                      <Link to={`/products/${product.slug}`} className="block relative aspect-square bg-slate-50 overflow-hidden">
                        <img
                          src={product.images && product.images[0] ? product.images[0] : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                        {hasDiscount && (
                          <span className="absolute top-2.5 left-2.5 bg-rose-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow">
                            SAVE {Math.round(((product.price - product.discountPrice) / product.price) * 100)}%
                          </span>
                        )}
                      </Link>

                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                            <span className="font-medium text-blue-600 truncate max-w-[130px]">
                              {product.vendor?.storeName || 'Verified Vendor'}
                            </span>
                            <div className="flex items-center gap-1 text-amber-500 font-semibold">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              <span>{product.ratingsAverage || '4.8'}</span>
                            </div>
                          </div>

                          <Link to={`/products/${product.slug}`}>
                            <h3 className="font-semibold text-slate-900 text-sm line-clamp-2 hover:text-blue-600 transition">
                              {product.name}
                            </h3>
                          </Link>
                        </div>

                        <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between">
                          <div>
                            <div className="text-base font-extrabold text-slate-900">
                              {formatPrice(displayPrice)}
                            </div>
                            {hasDiscount && (
                              <div className="text-xs text-slate-400 line-through">
                                {formatPrice(product.price)}
                              </div>
                            )}
                          </div>

                          <button
                            onClick={(e) => handleQuickAdd(e, product._id)}
                            className={`p-2.5 rounded-xl text-xs font-semibold transition ${
                              addedItem === product._id
                                ? 'bg-emerald-600 text-white'
                                : 'bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white'
                            }`}
                            title="Add to Cart"
                          >
                            {addedItem === product._id ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-10">
                  <button
                    disabled={pagination.page <= 1}
                    onClick={() => handlePageChange(pagination.page - 1)}
                    className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition ${
                        pagination.page === p
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    disabled={pagination.page >= pagination.pages}
                    onClick={() => handlePageChange(pagination.page + 1)}
                    className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProductsPage;
