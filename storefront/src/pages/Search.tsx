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
      className="container-page section-y"
    >
      <div className="max-w-3xl mx-auto">
        <h1 className="fluid-h1 font-bold text-[#0a0a0a] mb-6 sm:mb-10 text-center">Search</h1>

        <div className="relative mb-10 sm:mb-12">
          <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#525252]" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search books, activities, or topics…"
            className="w-full h-14 sm:h-16 pl-13 pr-6 text-base sm:text-lg bg-white border-black/10 text-[#0a0a0a] rounded-full focus-visible:ring-2 focus-visible:ring-[#FFD93D]/40 focus-visible:border-[#FFD93D] shadow-sm"
            style={{ paddingLeft: '3.25rem' }}
          />
          {loading && (
            <Loader2 className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-[#FF9A3C]" />
          )}
        </div>

        <div className="space-y-4 sm:space-y-5">
          <h2 className="text-[#525252] text-xs uppercase tracking-widest font-bold mb-3 sm:mb-4">
            {debounced ? `Results for "${debounced}"` : 'Browse everything'}
          </h2>

          {merged.length === 0 && !loading && (
            <div className="py-16 text-center text-[#525252]">
              Nothing matched <span className="text-[#0a0a0a]">"{debounced}"</span>.
            </div>
          )}

          {merged.map((result, i) => (
            <motion.div
              key={result.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.3) }}
            >
              <Card
                onClick={() => navigate(result.href)}
                className="border border-black/[0.07] bg-white hover:border-black/[0.15] hover:shadow-md transition-all cursor-pointer group rounded-2xl"
              >
                <CardContent className="p-4 sm:p-5 flex items-center gap-3 sm:gap-5">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-black/[0.03] border border-black/[0.07] flex items-center justify-center shrink-0">
                    {result.type === 'Book' && <Book className="w-5 h-5 sm:w-6 sm:h-6 text-[#FF5F6D]" />}
                    {result.type === 'Blog' && <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-[#5BE37D]" />}
                    {result.type === 'Activity' && <Palette className="w-5 h-5 sm:w-6 sm:h-6 text-[#4DA8FF]" />}
                  </div>

                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base sm:text-lg font-bold text-[#0a0a0a] group-hover:text-[#FF5F6D] transition-colors line-clamp-1">
                        {result.title}
                      </h3>
                      <Badge className="bg-black/[0.04] text-[#525252] border border-black/[0.06] uppercase tracking-tighter text-[9px]">
                        {result.type}
                      </Badge>
                    </div>
                    <p className="text-xs sm:text-sm text-[#525252] line-clamp-2">{result.desc}</p>
                    {typeof result.price === 'number' && result.price > 0 && (
                      <p className="text-sm text-[#0a0a0a] font-bold mt-1.5">{formatPrice(result.price)}</p>
                    )}
                  </div>

                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#525252] group-hover:text-[#0a0a0a] group-hover:translate-x-1 transition-all shrink-0" />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
