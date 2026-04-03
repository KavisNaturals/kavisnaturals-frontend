"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Star, ZoomIn, X, ShoppingCart, Heart, Eye } from "lucide-react";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { productsApi, reviewsApi, API_BASE_URL, normalizeUrl, type Product, type Review } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";

function getImage(p: any) {
  const url = p?.imageUrl || p?.image_url || p?.imagePath || p?.image_path;
  if (!url) return '/images/shop-cart/img-1.png';
  if (url.startsWith('/')) return url;
  if (url.startsWith('http')) return normalizeUrl(url);
  return `${API_BASE_URL}/uploads/${url}`;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  const { addItem } = useCart();
  const { toggle: toggleWishlist, isInWishlist } = useWishlist();
  const { isLoggedIn } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [fbtProducts, setFbtProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [featuredReviews, setFeaturedReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<{ label: string; price: number } | null>(null);
  const [mainImage, setMainImage] = useState('');
  const [zoomOpen, setZoomOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({ description: true, benefits: false, ingredients: false, direction: false });
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewData, setReviewData] = useState({ review: '', name: '', email: '', place: '' });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setZoomOpen(false); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      productsApi.getById(productId),
      reviewsApi.getForProduct(productId),
      productsApi.getAll(),
      reviewsApi.getFeatured(6),
    ]).then(([prod, revs, allProds, featured]) => {
      setProduct(prod);
      setMainImage(getImage(prod));
      setReviews(Array.isArray(revs) ? revs : []);
      setFeaturedReviews(Array.isArray(featured) ? featured : []);
      const allProdsList = Array.isArray(allProds) ? allProds : [];
      const fbtIds: string[] = Array.isArray((prod as any).frequently_bought_together)
        ? (prod as any).frequently_bought_together
        : [];
      setFbtProducts(allProdsList.filter(p => fbtIds.includes(String(p.id))));
      setRelatedProducts(allProdsList.filter((p: Product) => String(p.id) !== productId).slice(0, 6));
    }).catch(() => {}).finally(() => setLoading(false));
  }, [productId]);

  const toggleSection = (section: keyof typeof expandedSections) =>
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));

  const handleAddToCart = () => {
    if (!product) return;
    if (hasVariants && !selectedVariant) return; // require variant selection
    const cartPrice = selectedVariant ? selectedVariant.price : Number((product as any).sale_price || product.price || 0);
    const cartName = selectedVariant ? `${product.name} (${selectedVariant.label})` : product.name;
    const cartMaxStock = hasVariants && selectedVariant
      ? Number(productVariants.find(v => v.label === selectedVariant.label)?.stock ?? 0)
      : Number(product.stock ?? 0);
    addItem({ id: product.id, name: cartName, price: cartPrice, imageUrl: getImage(product), quantity, variant_label: selectedVariant?.label, maxStock: cartMaxStock });
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) return;
    setReviewLoading(true);
    try {
      await reviewsApi.addReview(productId, { rating, comment: reviewData.review, user_name: reviewData.name, place: reviewData.place });
      setReviewSuccess(true);
      setTimeout(() => { setShowReviewModal(false); setReviewSuccess(false); setRating(0); setReviewData({ review: '', name: '', email: '', place: '' }); }, 1500);
    } catch { /* silent */ } finally { setReviewLoading(false); }
  };

  const handleAddFbtToCart = () => {
    if (!product) return;
    fbtProducts.forEach(p => {
      const cartPrice = Number((p as any).sale_price || p.price || 0);
      addItem({ id: p.id, name: p.name, price: cartPrice, imageUrl: getImage(p), quantity: 1, maxStock: Number(p.stock ?? 99) });
    });
  };

  const renderStars = (r: number, size = 20) => (
    <div className="flex items-center space-x-1">
      {[1,2,3,4,5].map(star => (
        <Star key={star} size={size} className={star <= Math.floor(r) ? "text-yellow-400 fill-current" : "text-gray-300"} />
      ))}
    </div>
  );

  const avgRating = reviews.length ? reviews.reduce((a, r) => a + Number(r.rating || 0), 0) / reviews.length : Number((product as any)?.average_rating || 0);
  const ratingDist = [5,4,3,2,1].map(s => ({ stars: s, percentage: reviews.length ? Math.round(reviews.filter(r => Math.floor(Number(r.rating)) === s).length / reviews.length * 100) : (s === 5 ? 80 : s === 4 ? 12 : s === 3 ? 5 : s === 2 ? 2 : 1) }));

  if (loading) return (
    <main className="min-h-screen bg-white"><Header />
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div><Footer /></main>
  );

  if (!product) return (
    <main className="min-h-screen bg-white"><Header />
      <div className="flex flex-col justify-center items-center min-h-96 space-y-4">
        <p className="text-xl text-gray-500">Product not found.</p>
        <Link href="/shop" className="px-8 py-3 bg-primary rounded-xl font-bold">Browse Shop</Link>
      </div><Footer /></main>
  );

  const salePrice = selectedVariant ? selectedVariant.price : Number((product as any).sale_price || product.price || 0);
  const origPrice = Number(product.original_price || product.price || 0);
  const images = product.images || [];
  const productVariants: { label: string; price: number; stock?: number }[] = Array.isArray((product as any).options) ? (product as any).options : [];
  const hasVariants = productVariants.length > 0;
  const variantStock = selectedVariant
    ? Number(productVariants.find(v => v.label === selectedVariant.label)?.stock ?? 0)
    : null;
  const stockCount = hasVariants
    ? (variantStock !== null ? variantStock : -1) // -1 means no variant selected yet
    : Number(product.stock ?? 0);
  const isOutOfStock = hasVariants
    ? (selectedVariant ? stockCount <= 0 : false) // only show OOS if variant selected
    : stockCount <= 0;

  return (
    <main className="min-h-screen bg-white">
      <Header />

      <section className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <p className="text-sm text-gray-600">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/shop" className="hover:text-primary">Shop</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-800 font-medium">{product.name}</span>
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              {/* Main image with zoom */}
              <div
                onClick={() => setZoomOpen(true)}
                className="relative bg-gray-50 rounded-2xl p-8 mb-6 aspect-square flex items-center justify-center overflow-hidden border-4 cursor-zoom-in group"
              >
                <Image
                  src={mainImage || getImage(product)}
                  alt={product.name}
                  width={400}
                  height={400}
                  className="object-contain w-full h-full transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute bottom-3 right-3 bg-black/40 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ZoomIn size={16} />
                </div>
              </div>
              <div className="grid grid-cols-5 gap-2">
                <div onClick={() => setMainImage(getImage(product))} className={`bg-gray-50 rounded-lg p-2 cursor-pointer hover:shadow-md transition-all ${mainImage === getImage(product) ? 'border-4 border-primary' : 'border-2 border-gray-200'}`}>
                  <Image src={getImage(product)} alt="Main" width={100} height={100} className="object-contain w-full h-full" />
                </div>
                {images.map((img: string, idx: number) => (
                  <div key={idx} onClick={() => setMainImage(img)} className={`bg-gray-50 rounded-lg p-2 cursor-pointer hover:shadow-md transition-all ${mainImage === img ? 'border-4 border-primary' : 'border-2 border-gray-200'}`}>
                    <Image src={img} alt={`View ${idx + 1}`} width={100} height={100} className="object-contain w-full h-full" />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">{product.name}</h1>
              {product.size && <p className="text-lg text-gray-500 mb-1">({product.size})</p>}
              {(product as any).tagline && (
                <p className="text-base text-gray-600 italic mb-4">{(product as any).tagline}</p>
              )}
              {!(product as any).tagline && (product as any).short_description && (
                <p className="text-gray-600 mb-4">{(product as any).short_description}</p>
              )}

              <div className="flex items-center space-x-4 mb-4">
                {renderStars(avgRating)}
                <span className="text-sm text-gray-600">{avgRating.toFixed(1)} ({reviews.length.toLocaleString()} Reviews)</span>
              </div>

              <div className="flex items-center space-x-4 mb-4">
                <span className="text-3xl font-bold text-gray-800">₹{salePrice.toFixed(0)}</span>
                {!selectedVariant && origPrice > salePrice && <span className="text-lg text-gray-400 line-through">₹{origPrice.toFixed(0)}</span>}
                {isOutOfStock ? (
                  <span className="px-3 py-1 bg-red-100 text-red-600 text-sm font-semibold rounded-full border border-red-200">Out of Stock</span>
                ) : stockCount >= 0 && stockCount <= 10 ? (
                  <span className="px-3 py-1 bg-orange-100 text-orange-600 text-sm font-semibold rounded-full border border-orange-200">Only {stockCount} left</span>
                ) : null}
              </div>

              {productVariants.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-3">Select Options</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {productVariants.map((variant, i) => {
                      const vStock = Number((variant as any).stock ?? -1);
                      const vOutOfStock = vStock === 0;
                      const variantImg = (variant as any).image || getImage(product);
                      const isSelected = selectedVariant?.label === variant.label;
                      return (
                        <button
                          key={i}
                          disabled={vOutOfStock}
                          onClick={() => !vOutOfStock && setSelectedVariant(isSelected ? null : variant)}
                          className={`relative border-2 rounded-xl p-3 text-left transition-all ${
                            vOutOfStock
                              ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                              : isSelected
                              ? 'border-primary bg-primary/5 shadow-sm'
                              : 'border-gray-800 hover:border-black bg-white'
                          }`}
                        >
                          <div className="aspect-square rounded-lg overflow-hidden bg-gray-50 mb-2">
                            <Image
                              src={variantImg}
                              alt={variant.label}
                              width={120}
                              height={120}
                              className="object-contain w-full h-full"
                              unoptimized
                            />
                          </div>
                          <p className="text-xs font-medium text-gray-700 leading-tight mb-1">{product.name} ({variant.label})</p>
                          <p className="text-sm font-bold text-gray-900">₹{Number(variant.price).toFixed(0)}</p>
                          {(variant as any).unit_price_label && (
                            <p className="text-xs text-gray-500">{(variant as any).unit_price_label}</p>
                          )}
                          {vOutOfStock && <span className="text-xs text-red-500">Out of Stock</span>}
                          {!vOutOfStock && vStock > 0 && vStock <= 10 && (
                            <span className="text-xs text-orange-500">({vStock} left)</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {isOutOfStock ? (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-center">
                  <p className="text-red-600 font-semibold text-lg">This product is currently out of stock.</p>
                  <p className="text-sm text-red-400 mt-1">Check back soon or explore similar products below.</p>
                </div>
              ) : (
                <>
                  {hasVariants && !selectedVariant && (
                    <p className="mb-3 text-sm text-orange-600 font-medium">Please select a variant to add to cart.</p>
                  )}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center border-2 border-primary rounded-xl overflow-hidden flex-shrink-0">
                      <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-3 bg-primary text-black font-bold text-lg hover:bg-primary/80">−</button>
                      <input type="number" value={quantity} onChange={e => {
                        const val = Math.max(1, parseInt(e.target.value) || 1);
                        const limit = stockCount > 0 ? Math.min(val, stockCount) : val;
                        setQuantity(limit);
                      }} className="w-12 text-center border-l border-r border-primary focus:outline-none py-3 bg-white font-semibold text-gray-800" />
                      <button onClick={() => setQuantity(q => stockCount > 0 ? Math.min(q + 1, stockCount) : q + 1)} className="px-4 py-3 bg-primary text-black font-bold text-lg hover:bg-primary/80">+</button>
                    </div>
                    <button
                      onClick={handleAddToCart}
                      disabled={hasVariants && !selectedVariant}
                      className="flex-1 bg-primary text-black font-bold py-3.5 rounded-xl hover:bg-primary/80 transition-colors text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add to Cart
                    </button>
                  </div>
                  <button
                    disabled={hasVariants && !selectedVariant}
                    onClick={() => { if (!(hasVariants && !selectedVariant)) { handleAddToCart(); router.push('/checkout'); } }}
                    className="w-full mb-3 bg-primary text-black font-bold py-4 rounded-xl hover:bg-primary/80 transition-colors text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Checkout Now
                  </button>
                </>
              )}

              <div>
                <button onClick={() => toggleWishlist(productId)} className={`w-full py-3 border-2 rounded-lg font-semibold transition-colors ${isInWishlist(productId) ? 'border-red-400 text-red-500 bg-red-50' : 'border-gray-300 text-gray-700 hover:border-primary'}`}>
                  {isInWishlist(productId) ? '♥ Remove from Wishlist' : '♡ Add to Wishlist'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Bought Together */}
      {fbtProducts.length > 0 && product && (
        <section className="py-10 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="border-2 border-primary rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Frequently Bought Together</h2>
              <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                {/* Products row — current product FIRST */}
                <div className="flex flex-wrap items-end justify-center gap-4">
                  {[product as any, ...fbtProducts].map((p, i) => (
                    <React.Fragment key={p.id}>
                      {i > 0 && (
                        <span className="text-3xl font-bold text-gray-500 pb-8">+</span>
                      )}
                      <Link href={`/product/${p.id}`} className="flex flex-col items-center text-center group w-32 md:w-40">
                        <div className="bg-gray-50 rounded-2xl p-3 mb-2 w-full aspect-square flex items-center justify-center overflow-hidden group-hover:shadow-md transition-shadow">
                          <Image src={getImage(p)} alt={p.name} width={140} height={140} className="object-contain w-full h-full" unoptimized />
                        </div>
                        <p className="text-xs font-semibold text-gray-700 leading-tight mb-1 line-clamp-2">{p.name}{p.size ? ` ( ${p.size} )` : ''}</p>
                        <p className="text-sm font-bold text-gray-900">₹{Number((p as any).sale_price || p.price || 0).toFixed(0)}</p>
                      </Link>
                    </React.Fragment>
                  ))}
                </div>
                {/* Total + CTA */}
                <div className="flex flex-col items-center lg:items-start gap-3 min-w-[160px]">
                  <p className="text-base font-semibold text-gray-700">Total Price :</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gray-900">
                      ₹{[product as any, ...fbtProducts].reduce((sum, p) => sum + Number((p as any).sale_price || p.price || 0), 0).toFixed(0)}
                    </span>
                    {[product as any, ...fbtProducts].some(p => Number((p as any).original_price) > Number((p as any).sale_price || p.price || 0)) && (
                      <span className="text-base text-gray-400 line-through">
                        ₹{[product as any, ...fbtProducts].reduce((sum, p) => sum + Number((p as any).original_price || (p as any).sale_price || p.price || 0), 0).toFixed(0)}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={handleAddFbtToCart}
                    className="w-full px-8 py-3 bg-primary text-black font-bold rounded-xl hover:bg-primary/80 transition-colors text-base"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Product Details */}
      <section className="py-12" style={{ backgroundColor: 'rgba(233, 249, 217, 0.6)' }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              {[
                { key: 'description' as const, label: 'Description', content: <p className="text-gray-700 leading-relaxed text-sm">{(product as any).product_description || product.description}</p> },
                { key: 'benefits' as const, label: 'Benefits', content: product.benefits ? <ul className="space-y-2">{(Array.isArray(product.benefits) ? product.benefits : String(product.benefits).split('\n')).map((b: string, i: number) => <li key={i} className="flex items-start space-x-3"><span className="text-primary text-lg">✓</span><span className="text-gray-700 text-sm">{b}</span></li>)}</ul> : null },
                { key: 'ingredients' as const, label: 'Ingredients', content: product.ingredients ? <ul className="grid grid-cols-2 gap-3">{(Array.isArray(product.ingredients) ? product.ingredients : String(product.ingredients).split(',').map((s: string) => s.trim())).map((ing: string, i: number) => <li key={i} className="text-gray-700 text-sm">• {ing}</li>)}</ul> : null },
                { key: 'direction' as const, label: 'Direction To Use', content: product.direction ? <ol className="space-y-2 list-none">{(Array.isArray(product.direction) ? product.direction : String(product.direction).split('\n').map((s: string) => s.trim()).filter(Boolean)).map((step: string, i: number) => <li key={i} className="flex items-start space-x-3"><span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-black text-xs font-bold flex items-center justify-center">{i + 1}</span><span className="text-gray-700 text-sm pt-0.5">{step}</span></li>)}</ol> : null },
              ].filter(s => s.content).map(({ key, label, content }) => (
                <div key={key}>
                  <div className="flex items-center justify-between mb-4 pb-3 border-b-4 border-primary">
                    <h3 className="text-2xl font-bold text-gray-800">{label}</h3>
                    <button onClick={() => toggleSection(key)} className="text-2xl text-gray-400 font-light hover:text-gray-600">
                      {expandedSections[key] ? '−' : '+'}
                    </button>
                  </div>
                  {expandedSections[key] && content}
                </div>
              ))}
            </div>
            <div>
              {product.before_after_image && (
                <div className="relative rounded-2xl overflow-hidden">
                  <Image
                    src={product.before_after_image.startsWith('http') ? product.before_after_image : `${API_BASE_URL}/uploads/${product.before_after_image}`}
                    alt="Before & After"
                    width={500}
                    height={350}
                    className="object-cover w-full"
                  />
                  {/* Before / After labels */}
                  <div className="absolute bottom-4 left-0 w-1/2 flex justify-center pointer-events-none">
                    <span className="bg-black/70 text-white text-sm font-bold px-4 py-1.5 rounded-full">Before</span>
                  </div>
                  <div className="absolute bottom-4 right-0 w-1/2 flex justify-center pointer-events-none">
                    <span className="bg-primary text-black text-sm font-bold px-4 py-1.5 rounded-full">After</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedProducts.map((p) => {
                const hasVariants = Array.isArray((p as any).options) && (p as any).options.length > 0;
                const allVariantsOOS = hasVariants && (p as any).options.every((v: any) => Number(v.stock ?? -1) === 0);
                const isOOS = hasVariants ? allVariantsOOS : Number(p.stock ?? 0) <= 0;
                const actionAddToCart = () => {
                  if (hasVariants) {
                    window.location.href = `/product/${p.id}`;
                  } else {
                    addItem({
                      id: p.id,
                      name: p.name,
                      price: Number((p as any).sale_price || p.price || 0),
                      imageUrl: getImage(p),
                      maxStock: Number(p.stock ?? 0),
                    });
                  }
                };

                return (
                  <div key={p.id} className="bg-gray-50 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group relative">
                    <div className="relative aspect-square overflow-hidden">
                      <Link href={`/product/${p.id}`} className="block w-full h-full">
                        <Image
                          src={getImage(p)}
                          alt={p.name}
                          fill
                          className={`object-contain ${isOOS ? 'opacity-50' : ''}`}
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      </Link>
                      {isOOS && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <span className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">OUT OF STOCK</span>
                        </div>
                      )}
                      {!isOOS && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/10 pointer-events-none">
                          <div className="flex space-x-3 pointer-events-auto">
                            <button
                              type="button"
                              onClick={actionAddToCart}
                              className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-primary hover:text-white transition-colors"
                              title={hasVariants ? 'Select variant' : 'Add to Cart'}
                            >
                              <ShoppingCart size={18} />
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleWishlist(p.id)}
                              className={`w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-primary hover:text-white transition-colors ${isInWishlist(p.id) ? 'text-red-500' : ''}`}
                              title="Wishlist"
                            >
                              <Heart size={18} />
                            </button>
                            <Link
                              href={`/product/${p.id}`}
                              className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-primary hover:text-white transition-colors"
                              title="View Product"
                            >
                              <Eye size={18} />
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-6 text-center">
                      <div className="flex items-center justify-center space-x-2 mb-3">
                        {renderStars(Number((p as any).rating || 0))}
                        <span className="text-sm text-gray-600">({Number((p as any).reviews_count || 0).toLocaleString()})</span>
                      </div>
                      <Link href={`/product/${p.id}`} className="block">
                        <h3 className="font-bold text-gray-800 mb-3 text-lg hover:text-primary transition-colors line-clamp-2">{p.name}</h3>
                      </Link>
                      {((p as any).short_description || (p as any).description) && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{(p as any).short_description || (p as any).description}</p>
                      )}
                      {isOOS ? (
                        <p className="text-sm font-semibold text-red-500 mb-2">Out of Stock</p>
                      ) : (
                        <>
                          <div className="flex items-center justify-center space-x-2 mb-2">
                            <span className="text-xl font-bold text-gray-800">₹{Number((p as any).sale_price || p.price || 0).toFixed(0)}</span>
                            {(p as any).original_price && (
                              <span className="text-sm text-gray-400 line-through">₹{Number((p as any).original_price).toFixed(0)}</span>
                            )}
                          </div>
                          {(p as any).original_price && (
                            <p className="text-xs font-semibold text-primary">
                              You&apos;ll Save ₹{(Number((p as any).original_price) - Number((p as any).sale_price || p.price || 0)).toFixed(0)}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Reviews Section */}
      <section className="py-8 bg-primary bg-opacity-15">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-primary bg-opacity-20 rounded-2xl p-8 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Reviews</h2>
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              <div className="flex items-start lg:items-center space-x-6 w-full lg:w-4/5">
                <div className="flex-shrink-0">
                  {renderStars(avgRating)}
                  <p className="text-2xl font-bold text-gray-900">{avgRating.toFixed(1)}</p>
                  <p className="text-sm text-gray-700">({reviews.length.toLocaleString()} Reviews)</p>
                </div>
                <div className="space-y-2">
                  {ratingDist.map(item => (
                    <div key={item.stars} className="flex items-center space-x-2">
                      {renderStars(item.stars, 14)}
                      <div className="w-40 h-2 bg-gray-300 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500" style={{ width: `${item.percentage}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={() => setShowReviewModal(true)} className="bg-black text-white font-semibold py-3 px-6 rounded-full hover:bg-gray-800 transition-colors whitespace-nowrap w-full lg:w-1/5">
                📝 Write a Review
              </button>
            </div>
          </div>
</div>
</section>
          {/* Always show Happy Clients Saying — product reviews first, fallback to featured */}
         <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          {(() => {
            const displayReviews = reviews.length > 0 ? reviews : featuredReviews;
            if (displayReviews.length === 0) return null;
            return (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Happy Clients Saying</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayReviews.slice(0, 6).map((rev, i) => (
                    <div key={i} className="bg-white rounded-2xl p-6 shadow-sm">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden border-2 border-primary/30">
                          {(rev as any).reviewer_image ? (
                            <img src={(rev as any).reviewer_image} alt={rev.user_name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-primary font-bold text-lg">{(rev.user_name || 'C')[0].toUpperCase()}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">{rev.user_name || 'Customer'}</p>
                          {rev.place && <p className="text-xs text-gray-500">{rev.place}</p>}
                        </div>
                      </div>
                      {renderStars(Number(rev.rating), 16)}
                      <p className="text-gray-700 text-sm mt-3">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-10 max-w-xl w-full relative">
            <button onClick={() => setShowReviewModal(false)} className="absolute top-6 right-6 text-gray-700 hover:text-gray-900 text-2xl">✕</button>
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Your Rating For Kavi's Naturals</h2>
            {reviewSuccess ? (
              <p className="text-center text-green-600 font-semibold text-lg py-8">Thank you for your review!</p>
            ) : (
              <form onSubmit={handleReviewSubmit}>
                <div className="flex justify-center space-x-6 mb-8">
                  {[1,2,3,4,5].map(star => (
                    <button key={star} type="button" onClick={() => setRating(star)} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)}>
                      <Star size={48} className={`${star <= (hoverRating || rating) ? 'text-yellow-400 fill-current' : 'text-yellow-300'} transition-colors cursor-pointer`} strokeWidth={1} />
                    </button>
                  ))}
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-800 mb-3">Your Review</label>
                  <textarea value={reviewData.review} onChange={e => setReviewData({ ...reviewData, review: e.target.value })} placeholder="Share Details of Your Own Experiences" className="w-full p-4 border-2 border-gray-300 rounded-2xl focus:outline-none focus:border-primary resize-none h-32 bg-white text-gray-700" required />
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">Name (Required)</label>
                    <input type="text" value={reviewData.name} onChange={e => setReviewData({ ...reviewData, name: e.target.value })} placeholder="Your Name" className="w-full p-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary bg-white" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">Email (Required)</label>
                    <input type="email" value={reviewData.email} onChange={e => setReviewData({ ...reviewData, email: e.target.value })} placeholder="Your Email" className="w-full p-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary bg-white" required />
                  </div>
                </div>
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-800 mb-2">Place</label>
                  <input type="text" value={reviewData.place} onChange={e => setReviewData({ ...reviewData, place: e.target.value })} placeholder="Place" className="w-full p-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary bg-white" />
                </div>
                <div className="flex space-x-4">
                  <button type="button" onClick={() => setShowReviewModal(false)} className="flex-1 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-800 hover:bg-gray-50 transition-colors">Cancel</button>
                  <button type="submit" disabled={reviewLoading || !rating} className="flex-1 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors disabled:opacity-60">
                    {reviewLoading ? 'Posting...' : 'Post'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <Footer />

      {/* Image Zoom Lightbox */}
      {zoomOpen && (
        <div
          className="fixed inset-0 z-[999] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setZoomOpen(false)}
        >
          <button
            onClick={() => setZoomOpen(false)}
            className="absolute top-4 right-4 text-white bg-white/20 hover:bg-white/40 rounded-full p-2 transition-colors z-10"
          >
            <X size={24} />
          </button>
          <div
            className="relative max-w-3xl max-h-[90vh] w-full h-full flex items-center justify-center"
            onClick={e => e.stopPropagation()}
          >
            <img
              src={mainImage || getImage(product)}
              alt={product.name}
              className="max-w-full max-h-[90vh] object-contain rounded-lg select-none"
              style={{ userSelect: 'none' }}
            />
          </div>
          {/* Thumbnail strip */}
          {images.length > 0 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              <button
                onClick={e => { e.stopPropagation(); setMainImage(getImage(product)); }}
                className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${mainImage === getImage(product) ? 'border-white' : 'border-white/30 hover:border-white/70'}`}
              >
                <img src={getImage(product)} alt="Main" className="w-full h-full object-cover" />
              </button>
              {images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={e => { e.stopPropagation(); setMainImage(img); }}
                  className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${mainImage === img ? 'border-white' : 'border-white/30 hover:border-white/70'}`}
                >
                  <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}