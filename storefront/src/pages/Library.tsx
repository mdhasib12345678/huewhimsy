import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { useRainbow } from '@/components/RainbowContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search as SearchIcon, BookOpen, Star, ShoppingCart } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { NavLink } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { listProducts, productPrice, formatPrice, type MedusaProduct } from '@/lib/medusa';

const PALETTE = ['#FF5F6D', '#FF9A3C', '#FFD93D', '#5BE37D', '#4DA8FF', '#B067FF'];

type UiBook = {
  id: string;
  handle: string;
  title: string;
  age: string;
  status: 'Available Now' | 'Coming Soon';
  color: string;
  price: number;
  desc: string;
  thumbnail?: string | null;
  variantId?: string;
};

function pickAge(p: MedusaProduct, idx: number): string {
  const tag = (p.tags ?? []).find((t) => /\d+\s*[-–]\s*\d+/.test(t.value || ''));
  if (tag?.value) return tag.value.replace(/\s*-\s*/, '–');
  const buckets = ['3–4', '3–6', '4–6', '4–8', '5–7', '6–8'];
  return buckets[idx % buckets.length];
}

function mapBook(p: MedusaProduct, idx: number): UiBook {
  return {
    id: p.id,
    handle: p.handle,
    title: p.title,
    age: pickAge(p, idx),
    status: p.variants?.[0] ? 'Available Now' : 'Coming Soon',
    color: PALETTE[idx % PALETTE.length],
    price: productPrice(p),
    desc: p.description ?? '',
    thumbnail: p.thumbnail,
    variantId: p.variants?.[0]?.id,
  };
}

const FALLBACK: UiBook[] = [
  { id: '1', handle: 'floral', title: 'Floral Alphabet Fun', age: '3–6', status: 'Available Now', color: '#FF5F6D', price: 12.99, desc: '' },
  { id: '2', handle: 'fruity', title: 'Fruity Alphabet Fun', age: '4–8', status: 'Available Now', color: '#FF9A3C', price: 12.99, desc: '' },
  { id: '3', handle: 'veggie', title: 'Veggie Alphabet Fun', age: '3–6', status: 'Available Now', color: '#FFD93D', price: 12.99, desc: '' },
];

export const Library: React.FC = () => {
  const { setIntensity, addToCart } = useRainbow();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [books, setBooks] = useState<UiBook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIntensity(0.55);
    return () => setIntensity(0.7);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listProducts({ limit: 50 })
      .then((res) => {
        if (cancelled) return;
        const mapped = res.products.map(mapBook);
        setBooks(mapped.length > 0 ? mapped : FALLBACK);
      })
      .catch((e) => {
        console.warn('Library products fetch failed:', e);
        if (!cancelled) setBooks(FALLBACK);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(
    () =>
      books.filter((b) => {
        const matchesSearch =
          !search.trim() || b.title.toLowerCase().includes(search.toLowerCase());
        let matchesFilter = true;
        if (filter === 'available') matchesFilter = b.status === 'Available Now';
        else if (filter === 'coming-soon') matchesFilter = b.status === 'Coming Soon';
        else if (filter === 'age 3-4') matchesFilter = b.age.startsWith('3');
        else if (filter === 'age 4-6') matchesFilter = b.age.includes('4–6') || b.age.includes('4-6');
        else if (filter === 'age 6-8') matchesFilter = b.age.includes('6–8') || b.age.includes('6-8');
        return matchesSearch && matchesFilter;
      }),
    [books, search, filter],
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container-page section-y"
    >
      {/* Hero */}
      <section className="text-center mb-10 sm:mb-14 max-w-3xl mx-auto">
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fluid-h1 font-bold text-[#0a0a0a] mb-4 sm:mb-5"
        >
          The Alphabet Fun Adventure
        </motion.h1>
        <motion.p
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="fluid-lead text-[#525252]"
        >
          Premium coloring and learning books designed to spark creativity and build early
          literacy with Rilo and Rivy.
        </motion.p>
      </section>

      {/* Filters Bar */}
      <section className="flex flex-col gap-3 sm:gap-4 mb-8 sm:mb-12 p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-white border border-black/[0.07] shadow-sm">
        <div className="relative w-full">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#525252]" />
          <Input
            placeholder="Search books, activities, or topics…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white border-black/10 text-[#0a0a0a] rounded-full h-11 focus-visible:ring-2 focus-visible:ring-[#FFD93D]/40 focus-visible:border-[#FFD93D]"
          />
        </div>

        <div className="overflow-x-auto scrollbar-hidden -mx-1 px-1">
          <Tabs value={filter} onValueChange={setFilter} className="w-auto">
            <TabsList className="bg-black/[0.04] border border-black/[0.06] p-1 h-auto rounded-full inline-flex w-max">
              {['all', 'age 3-4', 'age 4-6', 'age 6-8', 'available', 'coming-soon'].map((t) => (
                <TabsTrigger
                  key={t}
                  value={t}
                  className="rounded-full px-3 sm:px-4 py-1.5 capitalize data-active:bg-white data-active:text-black data-active:shadow-sm text-xs sm:text-sm whitespace-nowrap"
                >
                  {t.replace('-', ' ')}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </section>

      {/* Book Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-black/[0.06] bg-white overflow-hidden animate-pulse"
            >
              <div className="aspect-[3/4] bg-black/[0.04]" />
              <div className="p-3 sm:p-4 space-y-2">
                <div className="h-2 w-1/3 bg-black/[0.05] rounded-full" />
                <div className="h-4 w-4/5 bg-black/[0.06] rounded" />
                <div className="h-6 w-1/3 bg-black/[0.05] rounded mt-2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
          {filtered.map((book, i) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: Math.min(i * 0.04, 0.3) }}
            >
              <NavLink to={`/library/${book.handle}`} className="block h-full group">
                <article className="h-full rounded-2xl border border-black/[0.06] bg-white overflow-hidden flex flex-col transition-all duration-300 group-hover:border-black/[0.12] group-hover:shadow-[0_18px_40px_-22px_rgba(10,10,10,0.18)]">
                  {/* Cover */}
                  <div className="aspect-[3/4] relative bg-[#fafafa] overflow-hidden">
                    {book.thumbnail ? (
                      <img
                        src={book.thumbnail}
                        alt={book.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
                        <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-[#0a0a0a]/20 mb-2" />
                        <span className="text-xs sm:text-sm font-semibold text-[#0a0a0a]/40 line-clamp-2 leading-tight">
                          {book.title}
                        </span>
                      </div>
                    )}

                    {/* Status pill — top-left */}
                    <Badge
                      className={cn(
                        'absolute top-2 left-2 sm:top-2.5 sm:left-2.5 rounded-full px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold tracking-wide bg-white/95 backdrop-blur-sm border border-black/[0.06]',
                        book.status === 'Available Now' ? 'text-[#0a8a3f]' : 'text-[#525252]',
                      )}
                    >
                      {book.status === 'Available Now' ? 'In Stock' : 'Soon'}
                    </Badge>

                    {/* Star — top-right */}
                    <div className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-sm">
                      <Star className="w-3.5 h-3.5 fill-[#FFD93D] text-[#FFD93D]" />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-3 sm:p-4 flex-grow flex flex-col gap-1.5 sm:gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[9px] sm:text-[10px] font-semibold text-[#525252] uppercase tracking-widest">
                        Ages {book.age}
                      </span>
                    </div>

                    <h4 className="text-sm sm:text-[15px] font-semibold text-[#0a0a0a] line-clamp-2 leading-snug group-hover:text-[#FF5F6D] transition-colors">
                      {book.title}
                    </h4>

                    <div className="mt-auto pt-2 sm:pt-3 flex items-center justify-between gap-2">
                      <span className="text-base sm:text-lg font-bold text-[#0a0a0a] tracking-tight">
                        {book.price > 0 ? formatPrice(book.price) : '—'}
                      </span>
                      <button
                        type="button"
                        disabled={book.status !== 'Available Now'}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          addToCart({
                            id: book.id,
                            productId: book.id,
                            variantId: book.variantId,
                            title: book.title,
                            price: book.price,
                            color: book.color,
                            type: 'book',
                            thumbnail: book.thumbnail,
                            handle: book.handle,
                          });
                        }}
                        aria-label={`Add ${book.title} to cart`}
                        className={cn(
                          'inline-flex items-center justify-center w-9 h-9 sm:w-auto sm:h-9 sm:px-3.5 rounded-full text-xs font-semibold transition-colors shadow-sm active:scale-95',
                          book.status === 'Available Now'
                            ? 'bg-[#0a0a0a] text-white hover:bg-black'
                            : 'bg-black/[0.05] text-[#525252] cursor-not-allowed',
                        )}
                      >
                        <ShoppingCart className="w-4 h-4 sm:mr-1.5" />
                        <span className="hidden sm:inline">
                          {book.status === 'Available Now' ? 'Buy' : 'Soon'}
                        </span>
                      </button>
                    </div>
                  </div>
                </article>
              </NavLink>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="py-24 text-center text-[#525252]">No books match your search.</div>
      )}

      <div className="mt-12 sm:mt-16 flex justify-center">
        <NavLink to="/shop">
          <Button variant="outline" className="rounded-full border-black/15 text-[#404040] hover:text-black hover:bg-black/[0.04] px-7 h-11 font-semibold">
            Browse the full shop →
          </Button>
        </NavLink>
      </div>
    </motion.div>
  );
};
