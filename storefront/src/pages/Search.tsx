import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { useRainbow } from '@/components/RainbowContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search as SearchIcon, Book, FileText, Palette, ArrowRight, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { listProducts, productPrice, formatPrice, type MedusaProduct } from '@/lib/medusa';

type Result = {
  id: string;
  title: string;
  type: 'Book' | 'Blog' | 'Activity';
  desc: string;
  href: string;
  price?: number;
};

function productToResult(p: MedusaProduct): Result {
  return {
    id: p.id,
    title: p.title,
    type: 'Book',
    desc: p.description ?? 'A magical addition to your collection.',
    href: `/shop/${p.handle}`,
    price: productPrice(p),
  };
}

const STATIC: Result[] = [
  { id: 'blog-phonics', title: 'Phonics Tips for Parents', type: 'Blog', desc: 'How to make alphabet learning stick.', href: '/blog' },
  { id: 'activity-welcome', title: 'Free Welcome Pack', type: 'Activity', desc: '10 free coloring pages and phonics flashcards.', href: '/free-activities' },
];

export const Search: React.FC = () => {
  const { setIntensity } = useRainbow();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState(params.get('q') ?? '');
  const [debounced, setDebounced] = useState(query);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setIntensity(0.5);
    return () => setIntensity(0.7);
  }, []);

  // Debounce query
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebounced(query), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Persist query in URL
  useEffect(() => {
    const next = new URLSearchParams(params);
    if (debounced) next.set('q', debounced);
    else next.delete('q');
    setParams(next, { replace: true });
  }, [debounced]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listProducts({ q: debounced || undefined, limit: 20 })
      .then((res) => {
        if (cancelled) return;
        setResults(res.products.map(productToResult));
      })
      .catch((e) => {
        console.warn('Search failed:', e);
        if (!cancelled) setResults([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debounced]);

  const merged = useMemo(() => {
    const staticMatches = debounced
      ? STATIC.filter(
          (s) =>
            s.title.toLowerCase().includes(debounced.toLowerCase()) ||
            s.desc.toLowerCase().includes(debounced.toLowerCase()),
        )
      : STATIC;
    return [...results, ...staticMatches];
  }, [results, debounced]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 py-12 md:py-24"
    >
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-12">Search</h1>

        <div className="relative mb-16">
          <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-[#B8BEC6]" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search books, activities, or topics..."
            className="w-full h-20 pl-16 pr-8 text-xl bg-white/5 border-white/10 text-white rounded-[2rem] focus-visible:ring-[#FFD93D] shadow-2xl"
          />
          {loading && (
            <Loader2 className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-[#FFD93D]" />
          )}
        </div>

        <div className="space-y-6">
          <h2 className="text-[#B8BEC6] text-sm uppercase tracking-widest font-bold mb-4">
            {debounced ? `Results for "${debounced}"` : 'Browse everything'}
          </h2>

          {merged.length === 0 && !loading && (
            <div className="py-16 text-center text-[#B8BEC6]">
              Nothing matched <span className="text-white">"{debounced}"</span>.
            </div>
          )}

          {merged.map((result, i) => (
            <motion.div
              key={result.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(i * 0.05, 0.4) }}
            >
              <Card
                onClick={() => navigate(result.href)}
                className="border-white/10 bg-white/5 hover:bg-white/10 transition-all cursor-pointer group"
              >
                <CardContent className="p-8 flex flex-col md:flex-row items-center gap-8">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    {result.type === 'Book' && <Book className="w-8 h-8 text-[#FF5F6D]" />}
                    {result.type === 'Blog' && <FileText className="w-8 h-8 text-[#5BE37D]" />}
                    {result.type === 'Activity' && <Palette className="w-8 h-8 text-[#4DA8FF]" />}
                  </div>

                  <div className="flex-grow text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                      <h3 className="text-2xl font-bold text-white group-hover:text-[#FFD93D] transition-colors">
                        {result.title}
                      </h3>
                      <Badge className="bg-white/10 text-[#B8BEC6] border-white/20 uppercase tracking-tighter text-[9px]">
                        {result.type}
                      </Badge>
                    </div>
                    <p className="text-[#B8BEC6] line-clamp-2">{result.desc}</p>
                    {typeof result.price === 'number' && result.price > 0 && (
                      <p className="text-white font-bold mt-2">{formatPrice(result.price)}</p>
                    )}
                  </div>

                  <Button variant="ghost" className="rounded-full text-white hover:bg-white/10 group">
                    View <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
