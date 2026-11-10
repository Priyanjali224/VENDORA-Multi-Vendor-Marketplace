import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import API from '../../services/api';
import { formatPrice } from '../../utils/formatters';
import { useCart } from '../../context/CartContext';

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const { data } = await API.get('/wishlist');
        if (data.success) setWishlist(data.wishlist || []);
      } catch (err) {
        console.error('Failed to load wishlist:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, []);

  const handleRemove = async (productId) => {
    try {
      const { data } = await API.post('/wishlist/toggle', { productId });
      if (data.success) {
        setWishlist(wishlist.filter(p => p._id !== productId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMoveToCart = async (productId) => {
    await addToCart(productId, 1);
    await handleRemove(productId);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-xs text-slate-400">
        Loading saved wishlist...
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <Heart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Your Wishlist is Empty</h2>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Save items you love from various vendors and revisit them anytime.
        </p>
        <Link
          to="/products"
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white text-xs font-bold shadow transition"
        >
          Browse Catalog <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Saved Wishlist</h1>
        <p className="text-xs text-slate-500 mt-1">{wishlist.length} item(s) saved in your collection</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {wishlist.map((product) => {
          const displayPrice = product.discountPrice > 0 ? product.discountPrice : product.price;

          return (
            <div key={product._id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between">
              <div className="aspect-square bg-slate-50 relative">
                <img
                  src={product.images && product.images[0] ? product.images[0] : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-blue-600 truncate block">
                    {product.vendor?.storeName || 'Merchant'}
                  </span>
                  <Link to={`/products/${product.slug}`} className="font-semibold text-xs text-slate-800 hover:text-blue-600 line-clamp-2 mt-1">
                    {product.name}
                  </Link>
                </div>

                <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between">
                  <div className="font-extrabold text-sm text-slate-900">{formatPrice(displayPrice)}</div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRemove(product._id)}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg text-xs"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleMoveToCart(product._id)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" /> Move
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WishlistPage;
