import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useRainbow } from '@/components/RainbowContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Filter, BookOpen, Star, Info, ShoppingCart, ExternalLink } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { NavLink } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from '@/lib/utils';

export const Library: React.FC = () => {
  const { setIntensity, addToCart } = useRainbow();
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    setIntensity(0.55); // Reduced intensity for Library
    return () => setIntensity(0.7);
  }, []);

  const books = [
    { id: '1', title: 'Floral Alphabet Fun', age: '3–6', status: 'Available Now', color: '#FF5F6D', price: 12.99 },
    { id: '2', title: 'Fruity Alphabet Fun', age: '4–8', status: 'Available Now', color: '#FF9A3C', price: 12.99 },
    { id: '3', title: 'Veggie Alphabet Fun', age: '3–6', status: 'Available Now', color: '#FFD93D', price: 12.99 },
    { id: '4', title: 'Landmark Alphabet Fun', age: '6–8', status: 'Coming Soon', color: '#5BE37D', price: 0 },
    { id: '5', title: 'Animal Alphabet Fun', age: '3–4', status: 'Coming Soon', color: '#4DA8FF', price: 0 },
    { id: '6', title: 'Dinosaur Alphabet Fun', age: '4–8', status: 'Coming Soon', color: '#B067FF', price: 0 },
  ];

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
          className="text-4xl md:text-6xl font-bold text-white mb-6"
        >
          The Alphabet Fun Adventure
        </motion.h1>
        <motion.p 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-[#B8BEC6] text-lg max-w-2xl mx-auto"
        >
          Explore our collection of premium coloring and learning books. Designed to spark creativity and build early literacy skills with Rilo and Rivy.
        </motion.p>
      </section>

      {/* Filters Bar */}
      <section className="flex flex-col lg:flex-row items-center gap-6 mb-12 p-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
        <div className="relative flex-grow w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B8BEC6]" />
          <Input 
            placeholder="Search books, activities, or topics..." 
            className="pl-11 bg-white/5 border-white/10 text-white rounded-full focus-visible:ring-[#FFD93D]"
          />
        </div>
        
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Tabs defaultValue="all" className="w-auto" onValueChange={setFilter}>
            <TabsList className="bg-white/5 border border-white/10 p-1 h-auto rounded-full">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {books.map((book, i) => (
          <motion.div
            key={book.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -12 }}
            className="group"
          >
            <NavLink to={`/library/${book.id}`} className="block h-full">
              <Card className="h-full border-white/10 bg-white/5 overflow-hidden flex flex-col group-hover:border-white/20 transition-all shadow-xl group-hover:shadow-[#FFD93D]/10 text-left">
                <CardContent className="p-0 flex flex-col h-full">
                {/* Book Cover Preview */}
                <div className="aspect-[3/4.2] relative bg-white/5 overflow-hidden flex items-center justify-center">
                  <div 
                    className="absolute inset-0 opacity-20 transition-opacity group-hover:opacity-30"
                    style={{ backgroundColor: book.color }}
                  />
                  
                  {/* Decorative Elements on Cover */}
                  <div className="absolute top-4 right-4">
                    <Star className="w-5 h-5 text-[#FFD93D] drop-shadow-lg" />
                  </div>

                  <div className="relative z-10 px-8 text-center flex flex-col items-center gap-4 group-hover:scale-105 transition-transform duration-500">
                    <BookOpen className="w-12 h-12 text-white/30" />
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2 leading-tight">{book.title}</h3>
                      <p className="text-xs text-[#B8BEC6] uppercase tracking-widest font-semibold">Alphabet Fun</p>
                    </div>
                  </div>

                  {/* Quick Action Overlay */}
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3">
                    <Button size="icon" className="rounded-full bg-white text-black hover:scale-110 transition-transform">
                      <ShoppingCart className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="outline" className="rounded-full border-white/40 text-white hover:bg-white/20 hover:scale-110 transition-transform">
                      <Info className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Book Info */}
                <div className="p-6 bg-black/20 border-t border-white/10 flex-grow flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <Badge variant={book.status === 'Available Now' ? 'default' : 'secondary'} className={cn(
                      "rounded-full px-3 py-1 text-[10px] uppercase font-bold",
                      book.status === 'Available Now' ? "bg-[#5BE37D] text-black" : "bg-white/10 text-white"
                    )}>
                      {book.status}
                    </Badge>
                    <span className="text-xs text-[#B8BEC6]">Ages {book.age}</span>
                  </div>
                  
                  <h4 className="text-lg font-bold text-white mb-4 line-clamp-1">{book.title}</h4>
                  
                  <div className="mt-auto flex items-center justify-between gap-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-[#B8BEC6] uppercase font-bold tracking-widest leading-none mb-1">Price</span>
                      <span className="text-xl font-bold text-white">
                        {book.price > 0 ? `$${book.price}` : '--'}
                      </span>
                    </div>
                    <Button 
                      disabled={book.status !== 'Available Now'}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        addToCart({ ...book, type: 'book' });
                      }}
                      className={cn(
                        "rounded-full px-6 flex-grow transition-all",
                        book.status === 'Available Now' 
                          ? "bg-white text-black hover:bg-[#F5F5F5]" 
                          : "bg-white/5 text-[#B8BEC6] cursor-not-allowed"
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

      {/* Pagination / Load More */}
      <div className="mt-20 flex justify-center">
        <Button variant="outline" className="rounded-full border-white/20 text-[#B8BEC6] hover:text-white px-8 h-12">
          Coming Soon: More Adventures...
        </Button>
      </div>
    </motion.div>
  );
};
