import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { useRainbow } from '@/components/RainbowContext';
import { ShoppingCart, Heart, Trash2, ArrowRight } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

// Simplified product list for matching
const allItems = [
  { id: 'p1', title: 'Creative Watercolor Set', price: 24.99, category: 'Coloring Supplies', color: '#FF5F6D' },
  { id: 'p2', title: 'Eco-Friendly Writing Pad', price: 12.50, category: 'Writing Supplies', color: '#4DA8FF' },
  { id: 'p3', title: 'Alphabet Letter Blocks', price: 34.99, category: 'Educational Toys', color: '#FFD93D' },
  { id: 'b1', title: 'Floral Alphabet Fun', price: 19.99, category: 'Books', color: '#FF5F6D' },
  { id: 'b2', title: 'Fruity Alphabet Fun', price: 19.99, category: 'Books', color: '#FF9A3C' },
  { id: 'b3', title: 'Veggie Alphabet Fun', price: 19.99, category: 'Books', color: '#FFD93D' },
];

export const Wishlist: React.FC = () => {
  const { setIntensity, wishlistItems, toggleWishlist, addToCart } = useRainbow();

  useEffect(() => {
    setIntensity(0.7); // 60-70% for playful/organized pages
  }, []);

  const favoriteItems = allItems.filter(item => wishlistItems.includes(item.id));

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 py-12 md:py-20 max-w-5xl"
    >
      <div className="flex items-center justify-between mb-12">
        <h1 className="text-4xl font-bold text-[#0a0a0a] tracking-tight">Your Magic Wishlist</h1>
        <span className="text-[#525252]">{favoriteItems.length} items saved</span>
      </div>

      {favoriteItems.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {favoriteItems.map((item) => (
            <motion.div 
              key={item.id}
              layout
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <Card className="border-black/10 bg-black/5 overflow-hidden backdrop-blur-xl group">
                <CardContent className="p-6 flex items-center gap-6">
                  <div className="w-24 h-24 rounded-2xl bg-black/5 flex items-center justify-center relative overflow-hidden flex-shrink-0">
                    <div className="absolute inset-0 opacity-10" style={{ backgroundColor: item.color }} />
                    <span className="relative z-10 text-[10px] text-[#0a0a0a]/20 font-bold uppercase">Item</span>
                  </div>
                  
                  <div className="flex-grow">
                    <div className="text-[10px] font-bold text-[#FF9A3C] uppercase tracking-widest mb-1">{item.category}</div>
                    <h3 className="text-xl font-bold text-[#0a0a0a]">{item.title}</h3>
                    <p className="text-2xl font-bold text-[#0a0a0a] mt-2 font-mono">${item.price}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button 
                      onClick={() => addToCart({ ...item, type: item.id.startsWith('b') ? 'book' : 'product' })}
                      className="rounded-full bg-white text-black hover:bg-[#F5F5F5] font-bold"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" /> Add to Cart
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => toggleWishlist(item.id)}
                      className="rounded-full text-[#525252] hover:text-[#FF5F6D] hover:bg-[#FF5F6D]/10"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="py-32 text-center space-y-6">
          <div className="w-24 h-24 rounded-full bg-black/5 flex items-center justify-center mx-auto mb-8 border border-black/10">
            <Heart className="w-10 h-10 text-[#0a0a0a]/10" />
          </div>
          <h2 className="text-2xl font-bold text-[#0a0a0a]">Your wishlist is empty</h2>
          <p className="text-[#525252] max-w-sm mx-auto">
            Travel through our library and shop to find magical items to save for later!
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <NavLink to="/shop" className={cn(buttonVariants(), "rounded-full bg-white text-black font-bold h-12 px-8")}>
              Explore Shop <ArrowRight className="ml-2 w-4 h-4 ml-2" />
            </NavLink>
            <NavLink to="/library" className={cn(buttonVariants({ variant: "outline" }), "rounded-full text-[#0a0a0a] border-black/20 font-bold h-12 px-8")}>
              View Library
            </NavLink>
          </div>
        </div>
      )}
    </motion.div>
  );
};
