import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useRainbow } from '@/components/RainbowContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search as SearchIcon, Book, FileText, Palette, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const Search: React.FC = () => {
  const { setIntensity } = useRainbow();
  const [query, setQuery] = useState('');

  useEffect(() => {
    setIntensity(0.5);
    return () => setIntensity(0.7);
  }, []);

  const results = [
    { title: 'Floral Alphabet Fun', type: 'Book', desc: 'Premium coloring book featuring 26 flowers.' },
    { title: 'Phonics Tips for Parents', type: 'Blog', desc: 'How to make alphabet learning stick.' },
    { title: 'Free Welcome Pack', type: 'Activity', desc: '10 free coloring pages and phonics flashcards.' },
    { title: 'Fruity Alphabet Fun', type: 'Book', desc: 'Phonics and writing fun with delicious fruits.' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 py-12 md:py-24"
    >
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-12">Search result</h1>
        
        <div className="relative mb-16">
          <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-[#B8BEC6]" />
          <Input 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search books, activities, or topics..." 
            className="w-full h-20 pl-16 pr-8 text-xl bg-white/5 border-white/10 text-white rounded-[2rem] focus-visible:ring-[#FFD93D] shadow-2xl"
          />
        </div>

        <div className="space-y-6">
          <h2 className="text-[#B8BEC6] text-sm uppercase tracking-widest font-bold mb-4">Results for "{query || 'everything'}"</h2>
          
          {results.map((result, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="border-white/10 bg-white/5 hover:bg-white/10 transition-all cursor-pointer group">
                <CardContent className="p-8 flex flex-col md:flex-row items-center gap-8">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    {result.type === 'Book' && <Book className="w-8 h-8 text-[#FF5F6D]" />}
                    {result.type === 'Blog' && <FileText className="w-8 h-8 text-[#5BE37D]" />}
                    {result.type === 'Activity' && <Palette className="w-8 h-8 text-[#4DA8FF]" />}
                  </div>
                  
                  <div className="flex-grow text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                      <h3 className="text-2xl font-bold text-white group-hover:text-[#FFD93D] transition-colors">{result.title}</h3>
                      <Badge className="bg-white/10 text-[#B8BEC6] border-white/20 uppercase tracking-tighter text-[9px]">{result.type}</Badge>
                    </div>
                    <p className="text-[#B8BEC6]">{result.desc}</p>
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
