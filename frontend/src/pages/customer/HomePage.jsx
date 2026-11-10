import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Star,
  ShoppingBag,
  Store,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  ChevronRight,
  Check,
} from 'lucide-react';
import API from '../../services/api';
import { formatPrice } from '../../utils/formatters';
import { useCart } from '../../context/CartContext';

const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedItem, setAddedItem] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          API.get('/categories'),
          API.get('/products?limit=8'),
        ]);
        if (catRes.data.success) setCategories(catRes.data.categories);
        if (prodRes.data.success) setFeaturedProducts(prodRes.data.products);
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, []);

  const handleQuickAdd = async (e, productId) => {
    e.preventDefault();
    const res = await addToCart(productId, 1);
    if (res.success) {
      setAddedItem(productId);
      setTimeout(() => setAddedItem(null), 2000);
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white overflow-hidden py-20 lg:py-28">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" /> Next-Gen Multi-Vendor Commerce Platform
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
              One Marketplace.<br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-300 bg-clip-text text-transparent">
                Multiple Vendors.
              </span><br />
              Endless Possibilities.
            </h1>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
              Shop directly from top verified merchants across electronics, luxury fashion, artisan homeware, and organic lifestyle with single unified cart & multi-vendor checkout.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link
                to="/products"
                className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-lg shadow-blue-600/30 flex items-center gap-2 transition"
              >
                Browse Marketplace <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/register-vendor"
                className="px-6 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 text-sm font-semibold flex items-center gap-2 transition"
              >
                <Store className="w-4 h-4 text-amber-400" /> Start Selling Today
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Explore Top Categories</h2>
            <p className="text-xs text-slate-500 mt-1">Discover thousands of verified products categorized for you</p>
          </div>
          <Link to="/products" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/products?category=${cat.slug}`}
              className="group relative rounded-2xl overflow-hidden border border-slate-200 bg-white hover:shadow-xl transition-all duration-300"
            >
              <div className="h-40 overflow-hidden bg-slate-100">
                <img
                  src={cat.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition">{cat.name}</h3>
                <p className="text-[11px] text-slate-500 line-clamp-1 mt-1">{cat.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs uppercase font-bold text-blue-600 tracking-wider">Handpicked Selections</span>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Trending Multi-Vendor Products</h2>
          </div>
          <Link to="/products" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
            See All Products <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="bg-white rounded-2xl h-80 animate-pulse border border-slate-200"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => {
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
                          {product.vendor?.storeName || 'Verified Merchant'}
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
        )}
      </section>

      {/* Multi-Vendor Business Model Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-2xl">
          <div className="max-w-2xl space-y-4">
            <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider">
              Earn With Us
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight">Are You a Brand, Manufacturer or Merchant?</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Join thousands of vendors selling across India. Take advantage of automated multi-vendor order routing, transparent commission payouts, dedicated merchant dashboard, and millions of active shoppers.
            </p>
            <div className="pt-2">
              <Link
                to="/register-vendor"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-900 hover:bg-blue-50 rounded-xl font-bold text-xs shadow-md transition"
              >
                Apply for Vendor Store <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
