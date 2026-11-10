import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  ShoppingBag,
  Heart,
  Truck,
  ShieldCheck,
  Store,
  CheckCircle2,
  AlertCircle,
  Share2,
  MessageSquare,
} from 'lucide-react';
import API from '../../services/api';
import { formatPrice, formatDate } from '../../utils/formatters';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const ProductDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Review Form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data } = await API.get(`/products/${slug}`);
        if (data.success) {
          setProduct(data.product);
          setReviews(data.reviews || []);
          setRelatedProducts(data.relatedProducts || []);
          setSelectedImage(0);
          setQuantity(1);
        }
      } catch (err) {
        console.error('Failed to load product:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  const handleAddToCart = async () => {
    if (!product) return;
    const res = await addToCart(product._id, quantity);
    if (res.success) {
      setToastMessage(`Added ${quantity} unit(s) to your shopping cart!`);
      setTimeout(() => setToastMessage(''), 3000);
    } else {
      setToastMessage(res.message || 'Could not add to cart.');
      setTimeout(() => setToastMessage(''), 3000);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    navigate('/checkout');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      setSubmittingReview(true);
      const { data } = await API.post('/reviews', {
        productId: product._id,
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment,
      });
      if (data.success) {
        setReviews([data.review, ...reviews]);
        setReviewTitle('');
        setReviewComment('');
        setToastMessage('Review submitted successfully!');
        setTimeout(() => setToastMessage(''), 3000);
      }
    } catch (err) {
      setToastMessage(err.response?.data?.message || 'Failed to submit review.');
      setTimeout(() => setToastMessage(''), 3000);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-pulse">
          <div className="bg-white rounded-3xl h-96 border border-slate-200"></div>
          <div className="space-y-4">
            <div className="h-6 bg-slate-200 rounded w-1/3"></div>
            <div className="h-10 bg-slate-200 rounded w-3/4"></div>
            <div className="h-24 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-800">Product Not Found</h2>
        <Link to="/products" className="mt-4 inline-block text-blue-600 hover:underline text-sm font-semibold">
          Return to Marketplace Catalog
        </Link>
      </div>
    );
  }

  const displayPrice = product.discountPrice > 0 ? product.discountPrice : product.price;
  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;
  const images = product.images && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {toastMessage}
        </div>
      )}

      {/* Breadcrumb */}
      <nav className="text-xs text-slate-400 flex items-center gap-2">
        <Link to="/" className="hover:text-slate-700">Home</Link>
        <span>/</span>
        <Link to={`/products?category=${product.category?.slug}`} className="hover:text-slate-700">
          {product.category?.name || 'Catalog'}
        </Link>
        <span>/</span>
        <span className="text-slate-700 font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm">
        {/* Images Column */}
        <div className="space-y-4">
          <div className="aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 relative">
            <img
              src={images[selectedImage]}
              alt={product.name}
              className="w-full h-full object-cover transition duration-300"
            />
            {hasDiscount && (
              <span className="absolute top-4 left-4 bg-rose-600 text-white text-xs font-extrabold px-3 py-1 rounded-full shadow">
                SAVE {Math.round(((product.price - product.discountPrice) / product.price) * 100)}%
              </span>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition ${
                    selectedImage === idx ? 'border-blue-600 ring-2 ring-blue-500/20' : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details Column */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Vendor & Rating header */}
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
                SKU: {product.sku}
              </span>
              <div className="flex items-center gap-1.5 text-amber-500 font-bold">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-slate-800">{product.ratingsAverage || '4.8'}</span>
                <span className="text-slate-400">({reviews.length} reviews)</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
              {product.name}
            </h1>

            {/* Price section */}
            <div className="flex items-baseline gap-3 pt-2">
              <span className="text-3xl font-extrabold text-slate-900">
                {formatPrice(displayPrice)}
              </span>
              {hasDiscount && (
                <span className="text-base text-slate-400 line-through">
                  {formatPrice(product.price)}
                </span>
              )}
              <span className="text-xs text-slate-500">Inclusive of all taxes (GST 18%)</span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-2">
              {product.description}
            </p>

            {/* Stock status */}
            <div className="pt-2">
              {product.stock > 0 ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> In Stock ({product.stock} units available)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" /> Currently Out of Stock
                </span>
              )}
            </div>

            {/* Quantity Picker & Action Buttons */}
            {product.stock > 0 && (
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Quantity:</span>
                  <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-slate-50">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-200 text-sm font-bold"
                    >
                      -
                    </button>
                    <span className="px-4 py-1.5 text-xs font-bold text-slate-900">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-200 text-sm font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition"
                  >
                    <ShoppingBag className="w-4 h-4" /> Add to Cart
                  </button>
                  <button
                    onClick={handleBuyNow}
                    className="flex-1 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Verified Vendor Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center">
                {product.vendor?.logo ? (
                  <img src={product.vendor.logo} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Store className="w-5 h-5 text-blue-600" />
                )}
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Sold & Shipped By</span>
                <h4 className="text-xs font-bold text-slate-900">{product.vendor?.storeName || 'Verified Merchant'}</h4>
                <div className="flex items-center gap-1 text-[11px] text-amber-600">
                  <Star className="w-3 h-3 fill-amber-400" />
                  <span>{product.vendor?.rating || '4.8'} Seller Rating</span>
                </div>
              </div>
            </div>

            <Link
              to={`/products?vendor=${product.vendor?._id}`}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm"
            >
              Visit Store
            </Link>
          </div>
        </div>
      </div>

      {/* Product Specifications & Verified Customer Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Specifications Table */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm lg:col-span-1 space-y-4">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Technical Specs</h3>
          {product.specifications && product.specifications.length > 0 ? (
            <dl className="divide-y divide-slate-100 text-xs">
              {product.specifications.map((spec, i) => (
                <div key={i} className="py-2.5 flex justify-between">
                  <dt className="text-slate-500 font-medium">{spec.key}</dt>
                  <dd className="text-slate-800 font-semibold">{spec.value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-xs text-slate-400">Standard specifications provided by vendor.</p>
          )}
        </div>

        {/* Customer Reviews Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Verified Customer Reviews</h3>
              <p className="text-xs text-slate-500 mt-0.5">Real feedback from authenticated marketplace buyers</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-extrabold text-slate-900">{product.ratingsAverage || '4.8'}</span>
              <span className="text-xs text-slate-400 block">out of 5 stars</span>
            </div>
          </div>

          {/* Submit Review Form */}
          <form onSubmit={handleReviewSubmit} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Leave a Review</h4>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Your Rating:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setReviewRating(star)}
                    className="p-1 text-amber-400 hover:scale-110 transition"
                  >
                    <Star className={`w-4 h-4 ${star <= reviewRating ? 'fill-amber-400' : 'text-slate-300'}`} />
                  </button>
                ))}
              </div>
            </div>

            <input
              type="text"
              placeholder="Headline / Summary (e.g. Incredible sound quality!)"
              value={reviewTitle}
              onChange={(e) => setReviewTitle(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <textarea
              placeholder="Write your honest review for this vendor product..."
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              required
              rows={3}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>

            <button
              type="submit"
              disabled={submittingReview}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow transition disabled:opacity-50"
            >
              {submittingReview ? 'Submitting...' : 'Post Verified Review'}
            </button>
          </form>

          {/* Reviews List */}
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No customer reviews yet. Be the first to review!</p>
            ) : (
              reviews.map((rev) => (
                <div key={rev._id} className="p-4 rounded-xl border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px]">
                        {rev.customer?.name ? rev.customer.name.charAt(0) : 'U'}
                      </div>
                      <span className="font-semibold text-slate-800">{rev.customer?.name || 'Customer'}</span>
                      {rev.isVerifiedPurchase && (
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                          Verified Buyer
                        </span>
                      )}
                    </div>
                    <span className="text-slate-400">{formatDate(rev.createdAt)}</span>
                  </div>

                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                    ))}
                  </div>

                  <h5 className="text-xs font-bold text-slate-900">{rev.title}</h5>
                  <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>

                  {rev.vendorReply?.message && (
                    <div className="mt-2 p-2.5 rounded-lg bg-blue-50/60 border border-blue-100 text-[11px] text-blue-900">
                      <strong>Vendor Response:</strong> {rev.vendorReply.message}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
