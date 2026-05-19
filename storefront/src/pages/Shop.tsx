import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { useRainbow } from '@/components/RainbowContext';
import { ShoppingCart, Heart, Star, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { NavLink } from 'react-router-dom';
import {
  listProducts,
  productPrice,
  formatPrice,
  type MedusaProduct,
} from '@/lib/medusa';
import { cn } from '@/lib/utils';

// Local UI shape — kept identical to the original mock data so the card render is unchanged.
type UiProduct = {
  id: string;
  title: string;
  price: number;
  category: string;
  rating: number;
  status: string;
  color: string;
  desc: string;
  thumbnail?: string | null;
  handle: string;
  productId?: string;
  variantId?: string;
};

const PALETTE = ['#FF5F6D', '#4DA8FF', '#FFD93D', '#5BE37D', '#FF9A3C', '#B067FF'];
const STATUSES = ['New', 'Best Seller', 'Popular', 'Limited'];

const FALLBACK: UiProduct[] = [
  { id: 'p1', handle: 'creative-watercolor-set', title: 'Creative Watercolor Set', price: 24.99, category: 'Coloring Supplies', rating: 4.8, status: 'Best Seller', color: '#FF5F6D', desc: 'Premium 24-color watercolor set for little artists.' },
  { id: 'p2', handle: 'eco-friendly-writing-pad', title: 'Eco-Friendly Writing Pad', price: 12.50, category: 'Writing Supplies', rating: 4.5, status: 'Popular', color: '#4DA8FF', desc: 'Sustainable paper and recycled cover.' },
  { id: 'p3', handle: 'alphabet-letter-blocks', title: 'Alphabet Letter Blocks', price: 34.99, category: 'Educational Toys', rating: 4.9, status: 'New', color: '#FFD93D', desc: 'Handcrafted wooden blocks for early learning.' },
  { id: 'p4', handle: 'giant-floor-coloring-map', title: 'Giant Floor Coloring Map', price: 19.99, category: 'Coloring Supplies', rating: 4.7, status: 'Best Seller', color: '#5BE37D', desc: '5-foot wide interactive world map coloring sheet.' },
  { id: 'p5', handle: 'rilo-plush-explorer', title: 'Rilo Plush Explorer', price: 29.00, category: 'Educational Toys', rating: 5.0, status: 'Limited', color: '#FF9A3C', desc: 'Soft and cuddly Rilo the Rabbit companion.' },
  { id: 'p6', handle: 'magic-erasable-pens', title: 'Magic Erasable Pens', price: 15.99, category: 'Writing Supplies', rating: 4.6, status: 'New', color: '#B067FF', desc: 'Pack of 12 vibrant pens that erase with a swipe.' },
];

const categories = [
  'All Products',
  'Books',
  'Educational Toys',
  'Coloring Supplies',
  'Creative Tools',
  'Writing Supplies',
  'Arts & Crafts',
  'Family Favorites',
];

function mapMedusaToUi(p: MedusaProduct, idx: number): UiProduct {
  const category =
    p.categories?.[0]?.name ??
    (p.metadata?.category_name as string | undefined) ??
    p.type?.value ??
    p.collection?.title ??
    p.tags?.[0]?.value ??
    'Educational Toys';
  return {
    id: p.id,
    handle: p.handle,
    title: p.title,
    price: productPrice(p),
    category,
    rating: 4.7,
    status: STATUSES[idx % STATUSES.length],
    color: PALETTE[idx % PALETTE.length],
    desc: p.description ?? '',
    thumbnail: p.thumbnail,
    productId: p.id,
    variantId: p.variants?.[0]?.id,
  };
}

export const Shop: React.FC = () => {
  const { setIntensity, addToCart, toggleWishlist, wishlistItems } = useRainbow();
  const [filter, setFilter] = useState('All Products');
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<UiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIntensity(0.5); // 45%–55% rainbow intensity for Shop
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    listProducts({ limit: 50 })
      .then((res) => {
        if (cancelled) return;
        const mapped = res.products.map(mapMedusaToUi);
        setProducts(mapped.length > 0 ? mapped : FALLBACK);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        console.warn('Medusa products fetch failed, using fallback:', e);
        setError(e instanceof Error ? e.message : String(e));
        setProducts(FALLBACK);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredProducts = useMemo(
    () =>
      products.filter((p) => {
        const matchesFilter = filter === 'All Products' || p.category === filter;
        const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
      }),
    [products, filter, search],
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="container-page section-y"
    >
      {/* Shop Hero */}
      <div className="text-center mb-10 sm:mb-14 max-w-3xl mx-auto space-y-3 sm:space-y-4">
        <motion.h1 variants={itemVariants} className="fluid-h1 font-bold text-[#0a0a0a] tracking-tight">
          Explore the Hue Whimsy Shop
        </motion.h1>
        <motion.p variants={itemVariants} className="fluid-lead text-[#525252]">
          Carefully selected educational and creative products for children, families, and
          learning adventures.
        </motion.p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8 sm:mb-12 bg-white p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-black/[0.07] shadow-sm">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#525252]" />
          <Input
            placeholder="Search products…"
            className="pl-10 bg-white border-black/10 rounded-full h-11 text-[#0a0a0a] focus-visible:ring-2 focus-visible:ring-[#FFD93D]/40 focus-visible:border-[#FFD93D]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full sm:w-60 bg-white border-black/10 rounded-full h-11 text-[#0a0a0a]">
            <div className="flex items-center gap-2 min-w-0">
              <Filter className="w-4 h-4 text-[#525252] shrink-0" />
              <SelectValue placeholder="Category" />
            </div>
          </SelectTrigger>
          <SelectContent className="bg-white text-[#0a0a0a] border-black/10">
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Loading shimmer */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-black/[0.06] bg-white overflow-hidden animate-pulse"
            >
              <div className="aspect-square bg-black/[0.04]" />
              <div className="p-3 sm:p-4 space-y-2">
                <div className="h-2 w-1/3 bg-black/[0.05] rounded-full" />
                <div className="h-4 w-4/5 bg-black/[0.06] rounded" />
                <div className="h-6 w-1/3 bg-black/[0.05] rounded mt-2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product Grid */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
          {filteredProducts.map((p) => {
            const inWishlist = wishlistItems.includes(p.id);
            return (
              <motion.div key={p.id} variants={itemVariants}>
                <NavLink to={`/shop/${p.handle}`} className="block h-full group">
                  <article className="h-full rounded-2xl border border-black/[0.06] bg-white overflow-hidden flex flex-col transition-all duration-300 group-hover:border-black/[0.12] group-hover:shadow-[0_18px_40px_-22px_rgba(10,10,10,0.18)]">
                    {/* Image */}
                    <div className="relative aspect-square bg-[#fafafa] overflow-hidden">
                      {p.thumbnail ? (
                        <img
                          src={p.thumbnail}
                          alt={p.title}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-[#0a0a0a]/15 font-display font-bold text-4xl sm:text-5xl">
                            {p.title.charAt(0)}
                          </span>
                        </div>
                      )}

                      {/* Wishlist */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleWishlist(p.id);
                        }}
                        aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                        className={cn(
                          'absolute top-2 right-2 sm:top-2.5 sm:right-2.5 w-8 h-8 sm:w-9 sm:h-9 inline-flex items-center justify-center rounded-full bg-white/95 backdrop-blur-sm shadow-sm transition-all hover:scale-110',
                          inWishlist ? 'text-[#FF5F6D]' : 'text-[#525252] hover:text-[#0a0a0a]',
                        )}
                      >
                        <Heart className={cn('w-4 h-4', inWishlist && 'fill-current')} />
                      </button>

                      {p.status && (
                        <Badge className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 bg-white/95 backdrop-blur-sm text-[#0a0a0a] border border-black/[0.06] text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full font-semibold tracking-wide">
                          {p.status}
                        </Badge>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-3 sm:p-4 flex-grow flex flex-col gap-1.5 sm:gap-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[9px] sm:text-[10px] font-semibold text-[#525252] uppercase tracking-widest truncate">
                          {p.category}
                        </span>
                        <span className="flex items-center gap-1 shrink-0 text-[10px] sm:text-xs text-[#525252]">
                          <Star className="w-3 h-3 fill-[#FFD93D] text-[#FFD93D]" />
                          <span className="font-semibold text-[#0a0a0a]">{p.rating}</span>
                        </span>
                      </div>

                      <h3 className="text-sm sm:text-[15px] font-semibold text-[#0a0a0a] leading-snug line-clamp-2 group-hover:text-[#FF5F6D] transition-colors">
                        {p.title}
                      </h3>

                      <div className="mt-auto pt-2 sm:pt-3 flex items-center justify-between gap-2">
                        <span className="text-base sm:text-lg font-bold text-[#0a0a0a] tracking-tight">
                          {formatPrice(p.price)}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            addToCart({ ...p, type: 'product' });
                          }}
                          aria-label={`Add ${p.title} to cart`}
                          className="inline-flex items-center justify-center w-9 h-9 sm:w-auto sm:h-9 sm:px-3.5 rounded-full bg-[#0a0a0a] text-white text-xs font-semibold hover:bg-black transition-colors shadow-sm active:scale-95"
                        >
                          <ShoppingCart className="w-4 h-4 sm:mr-1.5" />
                          <span className="hidden sm:inline">Add</span>
                        </button>
                      </div>
                    </div>
                  </article>
                </NavLink>
              </motion.div>
            );
          })}
        </div>
      )}

      {!loading && filteredProducts.length === 0 && (
        <div className="py-24 text-center">
          <p className="text-[#525252] text-lg sm:text-xl">No products found for "{search}"</p>
          <Button
            variant="link"
            className="text-[#FF5F6D]"
            onClick={() => {
              setSearch('');
              setFilter('All Products');
            }}
          >
            Clear all filters
          </Button>
        </div>
      )}

      {error && (
        <div className="mt-8 text-center text-xs text-[#525252]/60">
          showing fallback catalog (API: {error})
        </div>
      )}
    </motion.div>
  );
};
