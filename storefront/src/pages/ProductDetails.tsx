import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useRainbow } from '@/components/RainbowContext';
import { ShoppingCart, Heart, Share2, Star, CheckCircle2, Truck, RotateCcw, ShieldCheck, ArrowLeft, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

const products = [
  { id: 'p1', title: 'Creative Watercolor Set', price: 24.99, category: 'Coloring Supplies', rating: 4.8, status: 'Best Seller', color: '#FF5F6D', reviews: 128, desc: 'Premium 24-color watercolor set designed specifically for budding young artists. Our non-toxic, highly pigmented formula ensures vibrant results on any paper.' },
  // ... other products would be here
];

export const ProductDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setIntensity, addToCart, toggleWishlist, wishlistItems } = useRainbow();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  // In a real app, we'd fetch this. For now, find it or use a default
  const product = products.find(p => p.id === id) || products[0];

  useEffect(() => {
    setIntensity(0.5);
    window.scrollTo(0, 0);
  }, []);

  const features = [
    'Non-toxic & Child-Safe materials',
    'Highly pigmented colors for vibrant art',
    'Ergonomic design for small hands',
    'Eco-friendly packaging'
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 py-12 md:py-20"
    >
      <Button 
        variant="ghost" 
        onClick={() => navigate(-1)} 
        className="mb-8 text-[#B8BEC6] hover:text-white group"
      >
        <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" /> Back to Shop
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        {/* Gallery */}
        <div className="space-y-6">
          <motion.div 
            className="aspect-square rounded-[3rem] bg-white/5 border border-white/10 overflow-hidden relative flex items-center justify-center group"
            whileHover={{ scale: 1.02 }}
          >
            <div className="absolute inset-0 opacity-10" style={{ backgroundColor: product.color }} />
            <div className="relative z-10 w-48 h-48 rounded-[2.5rem] bg-white/5 border border-white/10 flex items-center justify-center">
               <span className="text-white/20 font-bold text-5xl">Image {activeImage + 1}</span>
            </div>
            
            <Badge className="absolute top-8 left-8 bg-white/10 backdrop-blur-md text-white border-white/20 px-4 py-1">
              {product.status}
            </Badge>
          </motion.div>

          <div className="grid grid-cols-4 gap-4">
            {[0, 1, 2, 3].map((idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(idx)}
                className={cn(
                  "aspect-square rounded-2xl bg-white/5 border transition-all overflow-hidden relative flex items-center justify-center group",
                  activeImage === idx ? "border-[#FFD93D] ring-2 ring-[#FFD93D]/20" : "border-white/10 hover:border-white/30"
                )}
              >
                <div className="absolute inset-0 opacity-10" style={{ backgroundColor: product.color }} />
                <span className="relative z-10 text-[10px] text-white/20 font-bold uppercase">View {idx + 1}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[#FFD93D] border-[#FFD93D]/30">{product.category}</Badge>
              <div className="flex items-center gap-1 ml-auto">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={cn("w-4 h-4", s <= product.rating ? "fill-[#FFD93D] text-[#FFD93D]" : "text-white/10")} />
                  ))}
                </div>
                <span className="text-sm text-[#B8BEC6] ml-1">({product.reviews} reviews)</span>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
              {product.title}
            </h1>

            <div className="flex items-baseline gap-4">
              <span className="text-4xl font-bold text-white">${product.price}</span>
              <span className="text-sm text-green-400 font-medium bg-green-400/10 px-2 py-0.5 rounded-full">In Stock</span>
            </div>

            <p className="text-lg text-[#B8BEC6] leading-relaxed">
              {product.desc}
            </p>
          </div>

          <div className="space-y-6 pt-6 border-t border-white/10">
            {/* Multi-Platform Purchase System */}
            <div className="space-y-4">
              <Button 
                onClick={() => addToCart({ ...product, quantity, type: 'product' })}
                className="w-full rounded-full h-16 bg-white text-black hover:bg-[#F5F5F5] font-bold text-xl shadow-xl hover:shadow-white/5 transition-all"
              >
                <ShoppingCart className="w-6 h-6 mr-3" /> Buy on Hue Whimsy
              </Button>
              
              <div className="flex gap-4">
                <Button variant="outline" className="flex-1 rounded-full h-14 border-white/10 text-white hover:bg-white/5 transition-all">
                  <ExternalLink className="w-4 h-4 mr-2" /> Buy on Amazon
                </Button>
                <Button variant="outline" className="flex-1 rounded-full h-14 border-white/10 text-white hover:bg-white/5 transition-all">
                  <ExternalLink className="w-4 h-4 mr-2" /> Buy on Walmart
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center bg-white/5 rounded-full h-14 px-2 border border-white/10">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="rounded-full text-white hover:bg-white/10"
                >
                  -
                </Button>
                <span className="w-12 text-center text-white font-bold">{quantity}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setQuantity(q => q + 1)}
                  className="rounded-full text-white hover:bg-white/10"
                >
                  +
                </Button>
              </div>

              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => toggleWishlist(product.id)}
                className={cn(
                  "h-14 w-14 rounded-full border-white/10 transition-all",
                  wishlistItems.includes(product.id) ? "text-[#FF5F6D] bg-[#FF5F6D]/10 border-[#FF5F6D]/30" : "text-white hover:bg-white/10"
                )}
              >
                <Heart className={cn("w-6 h-6", wishlistItems.includes(product.id) && "fill-current")} />
              </Button>
              <Button variant="outline" size="icon" className="h-14 w-14 rounded-full border-white/10 text-white hover:bg-white/10">
                <Share2 className="w-6 h-6" />
              </Button>
            </div>
          </div>

          {/* Trust Points */}
          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
              <Truck className="w-5 h-5 text-[#4DA8FF]" />
              <div className="text-xs">
                <div className="font-bold text-white">Free Shipping</div>
                <div className="text-[#B8BEC6]">On orders over $50</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
              <ShieldCheck className="w-5 h-5 text-[#5BE37D]" />
              <div className="text-xs">
                <div className="font-bold text-white">Secure Payment</div>
                <div className="text-[#B8BEC6]">100% Protected</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="features" className="mt-20">
        <TabsList className="bg-transparent border-b border-white/10 w-full justify-start rounded-none h-auto p-0 gap-8">
          <TabsTrigger value="features" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#FFD93D] data-[state=active]:bg-transparent text-lg font-bold pb-4 transition-all">Features</TabsTrigger>
          <TabsTrigger value="specs" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#FF9A3C] data-[state=active]:bg-transparent text-lg font-bold pb-4 transition-all">Specifications</TabsTrigger>
          <TabsTrigger value="shipping" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#B067FF] data-[state=active]:bg-transparent text-lg font-bold pb-4 transition-all">Shipping & Returns</TabsTrigger>
        </TabsList>
        <TabsContent value="features" className="mt-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-white">Why kids love it</h3>
              <p className="text-[#B8BEC6] leading-relaxed">
                Our watercolor set is designed to inspire. The colors flow smoothly and blend like magic, just like the rainbow background of our world.
              </p>
              <ul className="space-y-2">
                {features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-[#F5F5F5]">
                    <CheckCircle2 className="w-4 h-4 text-[#5BE37D]" /> {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10">
               <h3 className="text-xl font-bold text-white mb-4">Educational Value</h3>
               <p className="text-[#B8BEC6]">
                 Developed in collaboration with educational experts to promote fine motor skills and color recognition in children aged 3-8.
               </p>
            </div>
          </div>
        </TabsContent>
        {/* ... Other TabsContent ... */}
      </Tabs>
    </motion.div>
  );
};
