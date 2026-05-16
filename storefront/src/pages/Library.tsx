import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { useRainbow } from '@/components/RainbowContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search as SearchIcon, BookOpen, Star, Info, ShoppingCart } from 'lucide-react';
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
      className="container mx-auto px-4 py-12 md:py-24"
    >
      {/* Hero */}
      <section className="text-center mb-16">
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-4xl md:text-6xl font-bold text-[#0a0a0a] mb-6"
        >
          The Alphabet Fun Adventure
        </motion.h1>
        <motion.p
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-[#525252] text-lg max-w-2xl mx-auto"
        >
          Explore our collection of premium coloring and learning books. Designed to spark creativity and build early literacy skills with Rilo and Rivy.
        </motion.p>
      </section>

      {/* Filters Bar */}
      <section className="flex flex-col lg:flex-row items-center gap-6 mb-12 p-4 rounded-3xl bg-black/5 border border-black/10 backdrop-blur-xl">
        <div className="relative flex-grow w-full">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#525252]" />
          <Input
            placeholder="Search books, activities, or topics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11 bg-black/5 border-black/10 text-[#0a0a0a] rounded-full focus-visible:ring-[#FFD93D]"
          />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <Tabs value={filter} onValueChange={setFilter} className="w-auto">
            <TabsList className="bg-black/5 border border-black/10 p-1 h-auto rounded-full">
              {['all', 'age 3-4', 'age 4-6', 'age 6-8', 'available', 'coming-soon'].map((t) => (
                <TabsTrigger
                  key={t}
                  value={t}
                  className="rounded-full px-4 py-2 capitalize data-active:bg-white data-active:text-black text-xs md:text-sm"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-[3/5] rounded-3xl bg-black/5 border border-black/10 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filtered.map((book, i) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -12 }}
              className="group"
            >
              <NavLink to={`/library/${book.handle}`} className="block h-full">
                <Card className="h-full border-black/10 bg-black/5 overflow-hidden flex flex-col group-hover:border-black/20 transition-all shadow-xl group-hover:shadow-[#FFD93D]/10 text-left">
                  <CardContent className="p-0 flex flex-col h-full">
                    <div className="aspect-[3/4.2] relative bg-black/5 overflow-hidden flex items-center justify-center">
                      <div
                        className="absolute inset-0 opacity-20 transition-opacity group-hover:opacity-30"
                        style={{ backgroundColor: book.color }}
                      />
                      {book.thumbnail ? (
                        <img
                          src={book.thumbnail}
                          alt={book.title}
                          className="relative z-10 w-full h-full object-cover"
                        />
                      ) : (
                        <div className="relative z-10 px-8 text-center flex flex-col items-center gap-4 group-hover:scale-105 transition-transform duration-500">
                          <BookOpen className="w-12 h-12 text-[#0a0a0a]/30" />
                          <div>
                            <h3 className="text-xl font-bold text-[#0a0a0a] mb-2 leading-tight">{book.title}</h3>
                            <p className="text-xs text-[#525252] uppercase tracking-widest font-semibold">Alphabet Fun</p>
                          </div>
                        </div>
                      )}

                      <div className="absolute top-4 right-4">
                        <Star className="w-5 h-5 text-[#FFD93D] drop-shadow-lg" />
                      </div>

                      <div className="absolute inset-0 bg-white/95 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3">
                        <Button
                          size="icon"
                          className="rounded-full bg-white text-black hover:scale-110 transition-transform"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (book.status === 'Available Now') {
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
                            }
                          }}
                        >
                          <ShoppingCart className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="outline" className="rounded-full border-black/40 text-[#0a0a0a] hover:bg-black/10 hover:scale-110 transition-transform">
                          <Info className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="p-6 bg-black/20 border-t border-black/10 flex-grow flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <Badge
                          variant={book.status === 'Available Now' ? 'default' : 'secondary'}
                          className={cn(
                            'rounded-full px-3 py-1 text-[10px] uppercase font-bold',
                            book.status === 'Available Now'
                              ? 'bg-[#5BE37D] text-black'
                              : 'bg-black/5 text-[#0a0a0a]',
                          )}
                        >
                          {book.status}
                        </Badge>
                        <span className="text-xs text-[#525252]">Ages {book.age}</span>
                      </div>

                      <h4 className="text-lg font-bold text-[#0a0a0a] mb-4 line-clamp-1">{book.title}</h4>

                      <div className="mt-auto flex items-center justify-between gap-4">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-[#525252] uppercase font-bold tracking-widest leading-none mb-1">
                            Price
                          </span>
                          <span className="text-xl font-bold text-[#0a0a0a]">
                            {book.price > 0 ? formatPrice(book.price) : '--'}
                          </span>
                        </div>
                        <Button
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
                          className={cn(
                            'rounded-full px-6 flex-grow transition-all',
                            book.status === 'Available Now'
                              ? 'bg-white text-black hover:bg-[#F5F5F5]'
                              : 'bg-black/5 text-[#525252] cursor-not-allowed',
                          )}
                        >
                          {book.status === 'Available Now' ? 'Buy Now' : 'Join Waitlist'}
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

      {!loading && filtered.length === 0 && (
        <div className="py-24 text-center text-[#525252]">No books match your search.</div>
      )}

      <div className="mt-20 flex justify-center">
        <NavLink to="/shop">
          <Button variant="outline" className="rounded-full border-black/20 text-[#525252] hover:text-black px-8 h-12">
            Browse the full shop →
          </Button>
        </NavLink>
      </div>
    </motion.div>
  );
};
