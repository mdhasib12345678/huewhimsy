import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { useRainbow } from '@/components/RainbowContext';
import { ShoppingCart, Heart, Eye, Star, Filter, Search } from 'lucide-react';
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
  'Educational Toys',
  'Coloring Supplies',
  'Creative Tools',
  'Learning Activities',
  'Classroom Essentials',
  'Arts & Crafts',
  'Writing Tools',
  'Family Favorites',
];

function mapMedusaToUi(p: MedusaProduct, idx: number): UiProduct {
  const category =
    (p.type?.value as string | undefined) ??
    (p.collection?.title as string | undefined) ??
    (p.tags?.[0]?.value as string | undefined) ??
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
      className="container mx-auto px-4 py-12 md:py-20"
    >
      {/* 🏠 SHOP HERO */}
      <div className="text-center mb-16 space-y-4">
        <motion.h1 variants={itemVariants} className="text-4xl md:text-6xl font-bold text-[#0a0a0a] tracking-tight">
          Explore the Hue Whimsy Shop
        </motion.h1>
        <motion.p variants={itemVariants} className="max-w-2xl mx-auto text-[#525252] text-lg">
          Carefully selected educational and creative products for children, families, and learning adventures.
        </motion.p>
        <motion.div variants={itemVariants} className="flex justify-center gap-4 pt-4">
          <Button className="rounded-full px-8 bg-white text-black font-bold hover:bg-[#F5F5F5] h-12">
            🛍️ Explore Products
          </Button>
          <Button variant="outline" className="rounded-full px-8 border-black/20 text-[#0a0a0a] hover:bg-black/5 h-12">
            🎁 Featured Favorites
          </Button>
        </motion.div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-12 items-center justify-between bg-black/5 p-4 rounded-[2rem] border border-black/10 backdrop-blur-xl">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#525252]" />
          <Input
            placeholder="Search products..."
            className="pl-12 bg-black/5 border-black/10 rounded-full h-12 text-[#0a0a0a] focus:ring-[#FFD93D]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full md:w-64 bg-black/5 border-black/10 rounded-full h-12 text-[#0a0a0a]">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#525252]" />
                <SelectValue placeholder="Category" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-white text-[#0a0a0a] border-black/10">
              {categories.map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Loading shimmer (kept minimal so layout doesn't shift) */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[420px] rounded-[2rem] bg-black/5 border border-black/10 animate-pulse" />
          ))}
        </div>
      )}

      {/* Product Grid */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((p) => (
            <motion.div key={p.id} variants={itemVariants} whileHover={{ y: -10 }}>
              <NavLink to={`/shop/${p.handle}`} className="block h-full">
                <Card className="h-full border-black/10 bg-black/5 overflow-hidden flex flex-col group cursor-pointer border-b-2 hover:border-[#FFD93D]/50 transition-all">
                  <CardContent className="p-0 flex flex-col h-full">
                    {/* Product Image Area */}
                    <div className="aspect-square relative bg-black/5 overflow-hidden flex items-center justify-center">
                      <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity" style={{ backgroundColor: p.color }} />
                      {p.thumbnail ? (
                        <img
                          src={p.thumbnail}
                          alt={p.title}
                          loading="lazy"
                          className="relative z-10 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="relative z-10 w-32 h-32 rounded-3xl bg-black/5 flex items-center justify-center border border-black/10 group-hover:scale-110 transition-transform duration-500">
                          <span className="text-[#0a0a0a]/20 font-bold text-4xl">Image</span>
                        </div>
                      )}

                      {/* Overlay Actions */}
                      <div className="absolute top-4 right-4 flex flex-col gap-2 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                        <Button
                          variant="secondary"
                          size="icon"
                          onClick={(e) => { e.preventDefault(); toggleWishlist(p.id); }}
                          className={cn("rounded-full shadow-lg", wishlistItems.includes(p.id) ? "text-[#FF5F6D]" : "text-black")}
                        >
                          <Heart className={cn("w-4 h-4", wishlistItems.includes(p.id) && "fill-current")} />
                        </Button>
                        <Button variant="secondary" size="icon" className="rounded-full shadow-lg text-black">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>

                      {p.status && (
                        <Badge className="absolute top-4 left-4 bg-black/5 backdrop-blur-md text-[#0a0a0a] border-black/20">
                          {p.status}
                        </Badge>
                      )}
                    </div>

                    {/* Info Area */}
                    <div className="p-6 space-y-3 flex-grow flex flex-col">
                      <div className="flex justify-between items-start">
                        <div className="text-xs font-bold text-[#FFD93D] uppercase tracking-widest">{p.category}</div>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-[#FFD93D] text-[#FFD93D]" />
                          <span className="text-xs text-[#0a0a0a] font-bold">{p.rating}</span>
                        </div>
                      </div>

                      <h3 className="text-xl font-bold text-[#0a0a0a] transition-colors">{p.title}</h3>
                      <p className="text-[#525252] text-sm line-clamp-2">{p.desc}</p>

                      <div className="mt-auto pt-4 flex items-center justify-between">
                        <span className="text-2xl font-bold text-[#0a0a0a]">{formatPrice(p.price)}</span>
                        <Button
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart({ ...p, type: 'product' }); }}
                          className="rounded-full bg-white text-black hover:bg-[#F5F5F5] font-bold"
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" /> Add
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </NavLink>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && filteredProducts.length === 0 && (
        <div className="py-32 text-center">
          <p className="text-[#525252] text-xl">No products found for "{search}"</p>
          <Button variant="link" className="text-[#FFD93D]" onClick={() => { setSearch(''); setFilter('All Products'); }}>
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
