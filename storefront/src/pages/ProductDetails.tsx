import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, NavLink } from 'react-router-dom';
import { motion } from 'motion/react';
import { useRainbow } from '@/components/RainbowContext';
import {
  ShoppingCart,
  Heart,
  Share2,
  Star,
  CheckCircle2,
  Truck,
  ShieldCheck,
  ArrowLeft,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  getProduct,
  productPrice,
  formatPrice,
  listReviews,
  submitReview,
  markReviewHelpful,
  type MedusaProduct,
  type ProductReview,
  type ReviewSummary,
} from '@/lib/medusa';

const PALETTE = ['#FF5F6D', '#4DA8FF', '#FFD93D', '#5BE37D', '#FF9A3C', '#B067FF'];

type UiProduct = {
  id: string;
  handle: string;
  title: string;
  price: number;
  category: string;
  rating: number;
  reviews: number;
  status: string;
  color: string;
  desc: string;
  thumbnail?: string | null;
  images: string[];
  variantId?: string;
};

function colorFromHandle(handle: string): string {
  let h = 0;
  for (let i = 0; i < handle.length; i++) h = (h * 31 + handle.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

function mapProduct(p: MedusaProduct): UiProduct {
  const images = (p.images ?? []).map((img) => img.url).filter(Boolean);
  if (p.thumbnail && !images.includes(p.thumbnail)) images.unshift(p.thumbnail);
  return {
    id: p.id,
    handle: p.handle,
    title: p.title,
    price: productPrice(p),
    category:
      (p.type?.value as string | undefined) ??
      (p.collection?.title as string | undefined) ??
      (p.tags?.[0]?.value as string | undefined) ??
      'Featured',
    rating: 5,
    reviews: 24,
    status: 'New',
    color: colorFromHandle(p.handle),
    desc: p.description ?? '',
    thumbnail: p.thumbnail,
    images,
    variantId: p.variants?.[0]?.id,
  };
}

const FEATURES = [
  'Non-toxic & child-safe materials',
  'Vibrant pigments for joyful art',
  'Ergonomic design for small hands',
  'Eco-friendly recyclable packaging',
];

export const ProductDetails: React.FC = () => {
  const { id: handle = '' } = useParams();
  const navigate = useNavigate();
  const { setIntensity, addToCart, toggleWishlist, wishlistItems } = useRainbow();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [product, setProduct] = useState<UiProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIntensity(0.5);
    window.scrollTo(0, 0);
  }, [handle]);

  useEffect(() => {
    if (!handle) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setActiveImage(0);
    setProduct(null);
    getProduct(handle)
      .then((p) => {
        if (cancelled) return;
        if (!p) {
          setError('Product not found');
          return;
        }
        setProduct(mapProduct(p));
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : String(e));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [handle]);

  const gallery = useMemo(() => {
    if (!product) return [];
    const imgs = product.images.slice(0, 4);
    while (imgs.length < 4) imgs.push(''); // pad to 4 slots
    return imgs;
  }, [product]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          <div className="aspect-square rounded-[3rem] bg-black/5 border border-black/10 animate-pulse" />
          <div className="space-y-6">
            <div className="h-8 w-2/3 bg-black/5 rounded animate-pulse" />
            <div className="h-12 w-full bg-black/5 rounded animate-pulse" />
            <div className="h-32 w-full bg-black/5 rounded animate-pulse" />
            <div className="h-14 w-full bg-black/5 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <h1 className="text-3xl font-bold text-[#0a0a0a] mb-4">Product not found</h1>
        <p className="text-[#525252] mb-8">
          {error ? `Reason: ${error}` : "We couldn't find that product."}
        </p>
        <NavLink to="/shop">
          <Button className="rounded-full bg-white text-black hover:bg-[#F5F5F5] font-bold">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Shop
          </Button>
        </NavLink>
      </div>
    );
  }

  const currentImage = gallery[activeImage] || product.thumbnail || '';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 py-12 md:py-20"
    >
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-8 text-[#404040] hover:text-black group"
      >
        <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" /> Back to Shop
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        {/* Gallery */}
        <div className="space-y-6">
          <motion.div
            className="aspect-square rounded-[3rem] bg-black/5 border border-black/10 overflow-hidden relative flex items-center justify-center group"
            whileHover={{ scale: 1.02 }}
          >
            <div className="absolute inset-0 opacity-10" style={{ backgroundColor: product.color }} />
            {currentImage ? (
              <img
                src={currentImage}
                alt={product.title}
                className="relative z-10 w-full h-full object-cover"
              />
            ) : (
              <div className="relative z-10 w-48 h-48 rounded-[2.5rem] bg-black/5 border border-black/10 flex items-center justify-center">
                <span className="text-[#0a0a0a]/20 font-bold text-5xl">Image {activeImage + 1}</span>
              </div>
            )}

            <Badge className="absolute top-8 left-8 bg-black/5 backdrop-blur-md text-[#0a0a0a] border-black/20 px-4 py-1">
              {product.status}
            </Badge>
          </motion.div>

          <div className="grid grid-cols-4 gap-4">
            {gallery.map((imgUrl, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(idx)}
                className={cn(
                  'aspect-square rounded-2xl bg-black/5 border transition-all overflow-hidden relative flex items-center justify-center group',
                  activeImage === idx
                    ? 'border-[#FFD93D] ring-2 ring-[#FFD93D]/20'
                    : 'border-black/10 hover:border-black/30',
                )}
              >
                <div className="absolute inset-0 opacity-10" style={{ backgroundColor: product.color }} />
                {imgUrl ? (
                  <img
                    src={imgUrl}
                    alt={`${product.title} thumbnail ${idx + 1}`}
                    className="relative z-10 w-full h-full object-cover"
                  />
                ) : (
                  <span className="relative z-10 text-[10px] text-[#0a0a0a]/20 font-bold uppercase">
                    View {idx + 1}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[#FFD93D] border-[#FFD93D]/30">{product.category}</Badge>
              <div className="flex items-center gap-1 ml-auto">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={cn('w-4 h-4', s <= product.rating ? 'fill-[#FFD93D] text-[#FFD93D]' : 'text-[#0a0a0a]/10')} />
                  ))}
                </div>
                <span className="text-sm text-[#525252] ml-1">({product.reviews} reviews)</span>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-[#0a0a0a] tracking-tight leading-tight">
              {product.title}
            </h1>

            <div className="flex items-baseline gap-4">
              <span className="text-4xl font-bold text-[#0a0a0a]">{formatPrice(product.price)}</span>
              <span className="text-sm text-green-400 font-medium bg-green-400/10 px-2 py-0.5 rounded-full">In Stock</span>
            </div>

            <p className="text-lg text-[#525252] leading-relaxed">
              {product.desc || 'Lovingly designed for tiny hands and big imaginations.'}
            </p>
          </div>

          <div className="space-y-6 pt-6 border-t border-black/10">
            <div className="space-y-4">
              <Button
                onClick={() => addToCart({ ...product, quantity, type: 'product' } as any)}
                className="w-full rounded-full h-16 bg-white text-black hover:bg-[#F5F5F5] font-bold text-xl shadow-xl hover:shadow-white/5 transition-all"
              >
                <ShoppingCart className="w-6 h-6 mr-3" /> Add to Cart
              </Button>

              <div className="flex gap-4">
                <Button variant="outline" className="flex-1 rounded-full h-14 border-black/10 text-[#0a0a0a] hover:bg-black/5 transition-all">
                  <ExternalLink className="w-4 h-4 mr-2" /> Buy on Amazon
                </Button>
                <Button variant="outline" className="flex-1 rounded-full h-14 border-black/10 text-[#0a0a0a] hover:bg-black/5 transition-all">
                  <ExternalLink className="w-4 h-4 mr-2" /> Buy on Walmart
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center bg-black/5 rounded-full h-14 px-2 border border-black/10">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="rounded-full text-[#0a0a0a] hover:bg-black/5"
                >
                  -
                </Button>
                <span className="w-12 text-center text-[#0a0a0a] font-bold">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="rounded-full text-[#0a0a0a] hover:bg-black/5"
                >
                  +
                </Button>
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={() => toggleWishlist(product.id)}
                className={cn(
                  'h-14 w-14 rounded-full border-black/10 transition-all',
                  wishlistItems.includes(product.id) ? 'text-[#FF5F6D] bg-[#FF5F6D]/10 border-[#FF5F6D]/30' : 'text-[#0a0a0a] hover:bg-black/5',
                )}
              >
                <Heart className={cn('w-6 h-6', wishlistItems.includes(product.id) && 'fill-current')} />
              </Button>
              <Button variant="outline" size="icon" className="h-14 w-14 rounded-full border-black/10 text-[#0a0a0a] hover:bg-black/5">
                <Share2 className="w-6 h-6" />
              </Button>
            </div>
          </div>

          {/* Trust Points */}
          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-black/5 border border-black/10">
              <Truck className="w-5 h-5 text-[#4DA8FF]" />
              <div className="text-xs">
                <div className="font-bold text-[#0a0a0a]">Free Shipping</div>
                <div className="text-[#525252]">On orders over $50</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-black/5 border border-black/10">
              <ShieldCheck className="w-5 h-5 text-[#5BE37D]" />
              <div className="text-xs">
                <div className="font-bold text-[#0a0a0a]">Secure Payment</div>
                <div className="text-[#525252]">100% Protected</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="features" className="mt-20">
        <TabsList className="bg-transparent border-b border-black/10 w-full justify-start rounded-none h-auto p-0 gap-8">
          <TabsTrigger value="features" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#FFD93D] data-[state=active]:bg-transparent text-lg font-bold pb-4 transition-all">Features</TabsTrigger>
          <TabsTrigger value="specs" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#FF9A3C] data-[state=active]:bg-transparent text-lg font-bold pb-4 transition-all">Specifications</TabsTrigger>
          <TabsTrigger value="reviews" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#FF5F6D] data-[state=active]:bg-transparent text-lg font-bold pb-4 transition-all">Reviews</TabsTrigger>
          <TabsTrigger value="shipping" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#B067FF] data-[state=active]:bg-transparent text-lg font-bold pb-4 transition-all">Shipping &amp; Returns</TabsTrigger>
        </TabsList>
        <TabsContent value="features" className="mt-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-[#0a0a0a]">Why kids love it</h3>
              <p className="text-[#525252] leading-relaxed">
                Designed to inspire. Vibrant pigments flow smoothly and blend like magic — just like the rainbow background of our world.
              </p>
              <ul className="space-y-2">
                {FEATURES.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-[#0a0a0a]">
                    <CheckCircle2 className="w-4 h-4 text-[#5BE37D]" /> {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-8 rounded-[2.5rem] bg-black/5 border border-black/10">
              <h3 className="text-xl font-bold text-[#0a0a0a] mb-4">Educational Value</h3>
              <p className="text-[#525252]">
                Crafted with educators to promote fine motor skills and color recognition for ages 3–8.
              </p>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="specs" className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[#525252]">
            <div className="flex justify-between border-b border-black/10 pb-3">
              <span>SKU</span><span className="text-[#0a0a0a] font-mono text-xs">{product.id}</span>
            </div>
            <div className="flex justify-between border-b border-black/10 pb-3">
              <span>Category</span><span className="text-[#0a0a0a]">{product.category}</span>
            </div>
            <div className="flex justify-between border-b border-black/10 pb-3">
              <span>Handle</span><span className="text-[#0a0a0a] font-mono text-xs">{product.handle}</span>
            </div>
            <div className="flex justify-between border-b border-black/10 pb-3">
              <span>Status</span><span className="text-[#0a0a0a]">{product.status}</span>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="reviews" className="mt-8">
          <ReviewsTab productId={product.id} />
        </TabsContent>
        <TabsContent value="shipping" className="mt-8 space-y-4 text-[#525252]">
          <p>Free standard shipping on orders over $50. Most orders ship within 1–2 business days.</p>
          <p>Returns accepted within 30 days of delivery in original condition.</p>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

// ---------------------------------------------------------------------------
// Reviews tab — fetches live reviews + summary from /store/reviews, allows
// visitors to submit a new review (goes to "pending" until admin approves).
// ---------------------------------------------------------------------------

interface ReviewsTabProps {
  productId: string;
}

const ReviewsTab: React.FC<ReviewsTabProps> = ({ productId }) => {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    author_name: '',
    author_email: '',
    rating: 5,
    title: '',
    body: '',
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'err'>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await listReviews(productId, { limit: 20 });
      setReviews(res.reviews);
      setSummary(res.summary);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, [productId]);

  const handleHelpful = async (id: string) => {
    try {
      const res = await markReviewHelpful(id);
      setReviews((rs) => rs.map((r) => (r.id === id ? { ...r, helpful_count: res.helpful_count } : r)));
    } catch {
      /* noop */
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.author_name || !form.body || form.body.length < 10) {
      setErrorMsg('Name and review (10+ chars) required.');
      setStatus('err');
      return;
    }
    setStatus('sending');
    setErrorMsg('');
    try {
      await submitReview({
        product_id: productId,
        author_name: form.author_name,
        author_email: form.author_email || undefined,
        rating: Number(form.rating),
        title: form.title || undefined,
        body: form.body,
      });
      setStatus('ok');
      setForm({ author_name: '', author_email: '', rating: 5, title: '', body: '' });
      // Don't refresh — review is pending moderation and won't appear yet.
    } catch (e: any) {
      setStatus('err');
      setErrorMsg(e?.message?.includes('409') ? 'You already reviewed this product.' : 'Failed to submit. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Summary */}
      {summary && summary.count > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-[#F9FAFB] rounded-2xl border border-black/10">
          <div className="md:col-span-1 text-center md:border-r md:border-black/10 md:pr-6">
            <div className="text-5xl font-bold text-[#0a0a0a] mb-2">{summary.average}</div>
            <div className="flex justify-center gap-1 mb-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={cn(
                    'w-4 h-4',
                    s <= Math.round(summary.average) ? 'fill-[#FFD93D] text-[#FFD93D]' : 'text-gray-300',
                  )}
                />
              ))}
            </div>
            <p className="text-sm text-[#525252]">{summary.count} review{summary.count === 1 ? '' : 's'}</p>
          </div>
          <div className="md:col-span-2 space-y-1">
            {[5, 4, 3, 2, 1].map((star) => {
              const n = summary.distribution[String(star)] ?? 0;
              const pct = summary.count ? Math.round((n / summary.count) * 100) : 0;
              return (
                <div key={star} className="flex items-center gap-3 text-sm">
                  <span className="w-12 text-[#525252]">{star} star</span>
                  <div className="flex-1 h-2 bg-white rounded-full overflow-hidden border border-black/5">
                    <div className="h-full bg-[#FFD93D]" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-8 text-right text-[#525252]">{n}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* List */}
      {reviews.length === 0 ? (
        <div className="py-12 text-center text-[#525252]">
          <p className="text-lg mb-4">No reviews yet — be the first!</p>
          {!showForm && (
            <Button onClick={() => setShowForm(true)} className="rounded-full bg-gradient-to-r from-[#FF5F6D] to-[#B067FF] text-white">
              Write a review
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-[#0a0a0a]">Customer reviews</h3>
            {!showForm && (
              <Button onClick={() => setShowForm(true)} size="sm" className="rounded-full bg-gradient-to-r from-[#FF5F6D] to-[#B067FF] text-white">
                Write a review
              </Button>
            )}
          </div>
          {reviews.map((r) => (
            <div key={r.id} className="p-6 bg-white border border-black/10 rounded-2xl">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-bold text-[#0a0a0a]">{r.author_name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={cn('w-3 h-3', s <= r.rating ? 'fill-[#FFD93D] text-[#FFD93D]' : 'text-gray-300')} />
                    ))}
                    <span className="text-xs text-[#525252] ml-2">{new Date(r.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              {r.title && <h4 className="font-bold text-[#0a0a0a] mb-2">{r.title}</h4>}
              <p className="text-[#525252] whitespace-pre-wrap">{r.body}</p>
              {r.reply && (
                <div className="mt-4 p-4 bg-[#F9FAFB] rounded-xl border-l-4 border-[#FF5F6D]">
                  <p className="text-xs font-bold text-[#FF5F6D] uppercase tracking-widest mb-1">HueWhimsy team replied</p>
                  <p className="text-sm text-[#525252]">{r.reply}</p>
                </div>
              )}
              <button
                onClick={() => handleHelpful(r.id)}
                className="mt-4 text-xs text-[#525252] hover:text-[#0a0a0a]"
              >
                👍 Helpful ({r.helpful_count})
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="p-6 bg-[#F9FAFB] border border-black/10 rounded-2xl">
          {status === 'ok' ? (
            <div className="text-center py-6">
              <CheckCircle2 className="w-12 h-12 mx-auto text-[#5BE37D] mb-3" />
              <h4 className="font-bold text-[#0a0a0a] mb-1">Thanks for your review!</h4>
              <p className="text-sm text-[#525252] mb-4">It'll appear here after admin approval.</p>
              <Button onClick={() => { setShowForm(false); setStatus('idle'); }} variant="outline" className="rounded-full">
                Close
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h4 className="font-bold text-lg text-[#0a0a0a]">Write a review</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  required
                  placeholder="Your name *"
                  value={form.author_name}
                  onChange={(e) => setForm({ ...form, author_name: e.target.value })}
                  className="h-11 px-4 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD93D] focus:outline-none"
                />
                <input
                  type="email"
                  placeholder="Email (optional, not published)"
                  value={form.author_email}
                  onChange={(e) => setForm({ ...form, author_email: e.target.value })}
                  className="h-11 px-4 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD93D] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0a0a0a] mb-2">Rating *</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setForm({ ...form, rating: s })}
                      className="text-2xl"
                      aria-label={`${s} star${s === 1 ? '' : 's'}`}
                    >
                      <Star className={cn('w-7 h-7', s <= form.rating ? 'fill-[#FFD93D] text-[#FFD93D]' : 'text-gray-300')} />
                    </button>
                  ))}
                </div>
              </div>

              <input
                placeholder="Title (optional)"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full h-11 px-4 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD93D] focus:outline-none"
              />

              <textarea
                required
                minLength={10}
                rows={5}
                placeholder="Your review * (10+ characters)"
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD93D] focus:outline-none"
              />

              {status === 'err' && <p className="text-sm text-red-600">{errorMsg}</p>}

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={status === 'sending'}
                  className="rounded-full bg-gradient-to-r from-[#FF5F6D] to-[#B067FF] text-white font-bold"
                >
                  {status === 'sending' ? 'Submitting...' : 'Submit review'}
                </Button>
                <Button type="button" onClick={() => setShowForm(false)} variant="outline" className="rounded-full">
                  Cancel
                </Button>
              </div>

              <p className="text-xs text-[#525252]">Reviews are moderated before appearing publicly. We'll never publish your email.</p>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
