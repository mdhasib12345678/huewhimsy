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
  medusaConfig,
  type MedusaProduct,
  type ProductReview,
  type ReviewSummary,
} from '@/lib/medusa';

// Lightweight summary fetch used by the product header so the rating reflects
// real moderation-approved reviews without pulling the full review list.
async function fetchSummary(productId: string): Promise<ReviewSummary | null> {
  try {
    const res = await fetch(
      `${(medusaConfig.baseUrl ?? '').replace(/\/$/, '')}/store/reviews?product_id=${encodeURIComponent(productId)}&limit=1`,
      {
        headers: {
          'x-publishable-api-key': medusaConfig.publishableKey,
        },
      },
    );
    if (!res.ok) return null;
    const json = (await res.json()) as { summary: ReviewSummary };
    return json.summary ?? null;
  } catch {
    return null;
  }
}

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
      p.categories?.[0]?.name ??
      (p.metadata?.category_name as string | undefined) ??
      p.type?.value ??
      p.collection?.title ??
      p.tags?.[0]?.value ??
      'Featured',
    rating: 0,
    reviews: 0,
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
      .then(async (p) => {
        if (cancelled) return;
        if (!p) {
          setError('Product not found');
          return;
        }
        const ui = mapProduct(p);
        setProduct(ui);
        // Update rating once the live reviews summary lands.
        const summary = await fetchSummary(p.id);
        if (!cancelled && summary && summary.count > 0) {
          setProduct((prev) => prev ? { ...prev, rating: Math.round(summary.average), reviews: summary.count } : prev);
        }
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
      <div className="container-page section-y">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          <div className="aspect-square rounded-3xl bg-black/[0.04] animate-pulse" />
          <div className="space-y-6">
            <div className="h-6 w-2/3 bg-black/[0.04] rounded animate-pulse" />
            <div className="h-10 w-full bg-black/[0.04] rounded animate-pulse" />
            <div className="h-24 w-full bg-black/[0.04] rounded animate-pulse" />
            <div className="h-12 w-full bg-black/[0.04] rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container-page section-y-lg text-center">
        <h1 className="text-3xl font-bold text-[#0a0a0a] mb-4">Product not found</h1>
        <p className="text-[#525252] mb-8">
          {error ? `Reason: ${error}` : "We couldn't find that product."}
        </p>
        <NavLink to="/shop">
          <Button className="rounded-full bg-[#0a0a0a] text-white hover:bg-black font-semibold h-12 px-7">
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
      className="container-page section-y"
    >
      {/* Back + breadcrumb row */}
      <div className="flex items-center justify-between gap-4 mb-6 sm:mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="-ml-2 text-[#404040] hover:text-black hover:bg-black/[0.04] group rounded-full px-3 h-10"
        >
          <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" /> Back
        </Button>
        <nav aria-label="Breadcrumb" className="hidden md:flex items-center gap-1.5 text-xs text-[#525252] min-w-0">
          <NavLink to="/shop" className="hover:text-[#0a0a0a]">Shop</NavLink>
          <span aria-hidden>/</span>
          <span className="text-[#0a0a0a] font-medium truncate max-w-[40ch]">{product.title}</span>
        </nav>
      </div>

      {/* Main grid: gallery on the left (sticky on lg+), info on the right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16">
        {/* Gallery — sticky on desktop so the image follows you while you read */}
        <div className="lg:col-span-7 xl:col-span-7">
          <div className="lg:sticky lg:top-24 space-y-4">
            <div className="aspect-square rounded-2xl sm:rounded-3xl bg-[#fafafa] border border-black/[0.06] overflow-hidden relative shadow-[0_20px_60px_-30px_rgba(10,10,10,0.15)]">
              {currentImage ? (
                <img
                  src={currentImage}
                  alt={product.title}
                  loading="eager"
                  fetchPriority="high"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[#0a0a0a]/15 font-display font-bold text-6xl sm:text-8xl">
                    {product.title.charAt(0)}
                  </span>
                </div>
              )}

              {product.status && (
                <Badge className="absolute top-4 left-4 sm:top-5 sm:left-5 bg-white/95 backdrop-blur-sm text-[#0a0a0a] border border-black/[0.06] px-3 py-1 text-[10px] sm:text-xs rounded-full font-semibold tracking-wide shadow-sm">
                  {product.status}
                </Badge>
              )}
            </div>

            {/* Thumbnails — only show ones that have a real image */}
            <div className="grid grid-cols-4 gap-2 sm:gap-3">
              {gallery.map((imgUrl, idx) => {
                const empty = !imgUrl;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => !empty && setActiveImage(idx)}
                    disabled={empty}
                    aria-label={`View image ${idx + 1}`}
                    aria-current={activeImage === idx ? 'true' : undefined}
                    className={cn(
                      'aspect-square rounded-xl sm:rounded-2xl bg-[#fafafa] border transition-all overflow-hidden relative',
                      activeImage === idx && !empty
                        ? 'border-[#0a0a0a] ring-2 ring-[#0a0a0a]/10 shadow-sm'
                        : 'border-black/[0.06] hover:border-black/15',
                      empty && 'opacity-40 cursor-not-allowed',
                    )}
                  >
                    {imgUrl ? (
                      <img
                        src={imgUrl}
                        alt={`${product.title} thumbnail ${idx + 1}`}
                        className="absolute inset-0 w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center text-[9px] sm:text-[10px] text-[#0a0a0a]/20 font-bold uppercase">
                        {idx + 1}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Info column */}
        <div className="lg:col-span-5 xl:col-span-5 flex flex-col">
          {/* Category + rating row */}
          <div className="flex items-center gap-3 flex-wrap mb-3 sm:mb-4">
            <span className="text-[10px] sm:text-[11px] font-semibold text-[#525252] uppercase tracking-[0.2em]">
              {product.category}
            </span>
            {product.reviews > 0 && (
              <>
                <span aria-hidden className="text-[#0a0a0a]/15">·</span>
                <div className="flex items-center gap-1.5">
                  <div className="flex" aria-label={`Rated ${product.rating} out of 5`}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={cn(
                          'w-3.5 h-3.5',
                          s <= product.rating ? 'fill-[#FFD93D] text-[#FFD93D]' : 'text-[#0a0a0a]/15',
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] sm:text-xs text-[#525252]">
                    {product.rating.toFixed(1)} ({product.reviews})
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Title */}
          <h1 className="fluid-h1 font-bold text-[#0a0a0a] tracking-tight leading-[1.08] mb-4 sm:mb-5">
            {product.title}
          </h1>

          {/* Price + stock pill */}
          <div className="flex flex-wrap items-baseline gap-3 sm:gap-4 mb-5 sm:mb-6">
            <span className="text-[1.875rem] sm:text-[2.5rem] font-bold text-[#0a0a0a] tracking-tight leading-none">
              {formatPrice(product.price)}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-[#0a8a3f] font-semibold bg-[#5BE37D]/12 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5BE37D]" /> In Stock
            </span>
          </div>

          {/* Description */}
          <p className="text-base sm:text-[1.0625rem] text-[#525252] leading-relaxed mb-6 sm:mb-8 max-w-prose">
            {product.desc || 'Lovingly designed for tiny hands and big imaginations.'}
          </p>

          {/* Buy-box: quantity + wishlist + share + CTA */}
          <div className="space-y-4 sm:space-y-5 pt-6 sm:pt-7 border-t border-black/[0.08]">
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Quantity stepper */}
              <div className="flex items-center bg-black/[0.04] rounded-full h-12 px-1 border border-black/[0.07] shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="rounded-full text-[#0a0a0a] hover:bg-white w-10 h-10 text-lg"
                  aria-label="Decrease quantity"
                >
                  −
                </Button>
                <span className="w-10 text-center text-[#0a0a0a] font-semibold tabular-nums">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="rounded-full text-[#0a0a0a] hover:bg-white w-10 h-10 text-lg"
                  aria-label="Increase quantity"
                >
                  +
                </Button>
              </div>

              {/* Spacer that pushes wishlist/share to the right on wide screens */}
              <div className="flex-1 hidden sm:block" />

              <Button
                variant="outline"
                size="icon"
                onClick={() => toggleWishlist(product.id)}
                aria-label={wishlistItems.includes(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                aria-pressed={wishlistItems.includes(product.id)}
                className={cn(
                  'h-12 w-12 rounded-full border-black/[0.07] transition-all shrink-0',
                  wishlistItems.includes(product.id)
                    ? 'text-[#FF5F6D] bg-[#FF5F6D]/10 border-[#FF5F6D]/30'
                    : 'text-[#0a0a0a] hover:bg-black/[0.04]',
                )}
              >
                <Heart className={cn('w-5 h-5', wishlistItems.includes(product.id) && 'fill-current')} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={async () => {
                  try {
                    if (navigator.share) {
                      await navigator.share({ title: product.title, url: window.location.href });
                    } else if (navigator.clipboard) {
                      await navigator.clipboard.writeText(window.location.href);
                    }
                  } catch {
                    /* user cancelled */
                  }
                }}
                aria-label="Share"
                className="h-12 w-12 rounded-full border-black/[0.07] text-[#0a0a0a] hover:bg-black/[0.04] shrink-0"
              >
                <Share2 className="w-5 h-5" />
              </Button>
            </div>

            <Button
              onClick={() => addToCart({ ...product, quantity, type: 'product' } as any)}
              className="w-full rounded-full bg-[#0a0a0a] text-white hover:bg-black font-semibold text-base sm:text-lg shadow-[0_10px_30px_-10px_rgba(10,10,10,0.4)] transition-all hover:scale-[1.01] active:scale-[0.99] h-13"
              style={{ height: '3.25rem' }}
            >
              <ShoppingCart className="w-5 h-5 mr-2.5" />
              <span className="truncate">
                Add to Cart · {formatPrice(product.price * quantity)}
              </span>
            </Button>

            <p className="text-[11px] sm:text-xs text-center text-[#525252] leading-relaxed">
              <span className="text-[#0a0a0a] font-semibold">Free shipping</span> over $50 · 30-day returns · Secure Stripe checkout
            </p>
          </div>

          {/* Trust strip */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-6 sm:mt-8">
            <div className="flex flex-col items-center gap-1.5 sm:gap-2 px-2 py-3 sm:p-4 rounded-2xl bg-white border border-black/[0.06] text-center">
              <Truck className="w-5 h-5 text-[#4DA8FF]" />
              <div className="text-[10px] sm:text-[11px] font-semibold text-[#0a0a0a] leading-tight">Free shipping</div>
            </div>
            <div className="flex flex-col items-center gap-1.5 sm:gap-2 px-2 py-3 sm:p-4 rounded-2xl bg-white border border-black/[0.06] text-center">
              <ShieldCheck className="w-5 h-5 text-[#5BE37D]" />
              <div className="text-[10px] sm:text-[11px] font-semibold text-[#0a0a0a] leading-tight">Secure pay</div>
            </div>
            <div className="flex flex-col items-center gap-1.5 sm:gap-2 px-2 py-3 sm:p-4 rounded-2xl bg-white border border-black/[0.06] text-center">
              <ExternalLink className="w-5 h-5 text-[#B067FF]" />
              <div className="text-[10px] sm:text-[11px] font-semibold text-[#0a0a0a] leading-tight">30-day return</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs — full-width section below the gallery/info pair */}
      <Tabs defaultValue="features" className="mt-16 sm:mt-24">
        <div className="border-b border-black/[0.07] overflow-x-auto scrollbar-hidden -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="bg-transparent border-0 w-full justify-start rounded-none h-auto p-0 gap-6 sm:gap-10 inline-flex">
            <TabsTrigger
              value="features"
              className="relative rounded-none border-b-2 border-transparent data-active:border-[#FFD93D] data-active:bg-transparent text-sm sm:text-base font-semibold pb-3 sm:pb-4 transition-all whitespace-nowrap text-[#525252] data-active:text-[#0a0a0a] flex-none"
            >
              Features
            </TabsTrigger>
            <TabsTrigger
              value="specs"
              className="relative rounded-none border-b-2 border-transparent data-active:border-[#FF9A3C] data-active:bg-transparent text-sm sm:text-base font-semibold pb-3 sm:pb-4 transition-all whitespace-nowrap text-[#525252] data-active:text-[#0a0a0a] flex-none"
            >
              Specifications
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="relative rounded-none border-b-2 border-transparent data-active:border-[#FF5F6D] data-active:bg-transparent text-sm sm:text-base font-semibold pb-3 sm:pb-4 transition-all whitespace-nowrap text-[#525252] data-active:text-[#0a0a0a] flex-none"
            >
              Reviews{product.reviews > 0 ? ` · ${product.reviews}` : ''}
            </TabsTrigger>
            <TabsTrigger
              value="shipping"
              className="relative rounded-none border-b-2 border-transparent data-active:border-[#B067FF] data-active:bg-transparent text-sm sm:text-base font-semibold pb-3 sm:pb-4 transition-all whitespace-nowrap text-[#525252] data-active:text-[#0a0a0a] flex-none"
            >
              Shipping &amp; Returns
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="features" className="mt-8 sm:mt-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 lg:gap-14">
            <div className="space-y-4 sm:space-y-5">
              <h3 className="text-xl sm:text-2xl font-bold text-[#0a0a0a]">Why kids love it</h3>
              <p className="text-[#525252] leading-relaxed">
                Designed to inspire. Vibrant pigments flow smoothly and blend like magic — just like the rainbow background of our world.
              </p>
              <ul className="space-y-2.5">
                {FEATURES.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm sm:text-base text-[#0a0a0a]">
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#5BE37D] shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-black/[0.03] to-black/[0.07] border border-black/[0.08]">
              <h3 className="text-lg sm:text-xl font-bold text-[#0a0a0a] mb-3 sm:mb-4">Educational Value</h3>
              <p className="text-sm sm:text-base text-[#525252] leading-relaxed">
                Crafted with educators to promote fine motor skills and color recognition for ages 3–8.
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="specs" className="mt-8 sm:mt-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-3 max-w-3xl">
            <div className="flex justify-between gap-4 border-b border-black/[0.08] py-3">
              <span className="text-[#525252] text-sm sm:text-base">SKU</span>
              <span className="text-[#0a0a0a] font-mono text-xs sm:text-sm truncate" title={product.id}>{product.id}</span>
            </div>
            <div className="flex justify-between gap-4 border-b border-black/[0.08] py-3">
              <span className="text-[#525252] text-sm sm:text-base">Category</span>
              <span className="text-[#0a0a0a] text-sm sm:text-base">{product.category}</span>
            </div>
            <div className="flex justify-between gap-4 border-b border-black/[0.08] py-3">
              <span className="text-[#525252] text-sm sm:text-base">Handle</span>
              <span className="text-[#0a0a0a] font-mono text-xs sm:text-sm truncate" title={product.handle}>{product.handle}</span>
            </div>
            <div className="flex justify-between gap-4 border-b border-black/[0.08] py-3">
              <span className="text-[#525252] text-sm sm:text-base">Status</span>
              <span className="text-[#0a0a0a] text-sm sm:text-base">{product.status}</span>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="mt-8 sm:mt-10">
          <ReviewsTab productId={product.id} />
        </TabsContent>

        <TabsContent value="shipping" className="mt-8 sm:mt-10">
          <div className="max-w-3xl space-y-4 text-sm sm:text-base text-[#525252] leading-relaxed">
            <p>Free standard shipping on orders over $50. Most orders ship within 1–2 business days.</p>
            <p>Returns accepted within 30 days of delivery in original condition.</p>
          </div>
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
