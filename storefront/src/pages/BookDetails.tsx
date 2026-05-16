import React, { useEffect, useState } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import { motion } from 'motion/react';
import { useRainbow } from '@/components/RainbowContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Star, 
  CheckCircle2, 
  ArrowRight, 
  Download, 
  ShoppingCart, 
  BookOpen, 
  Palette, 
  Languages, 
  ShieldCheck,
  ChevronLeft,
  Share2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

export const BookDetails: React.FC = () => {
  const { id } = useParams();
  const { setIntensity, addToCart } = useRainbow();
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    setIntensity(0.5); // Calm intensity for details
    window.scrollTo(0, 0);
    return () => setIntensity(0.7);
  }, []);

  // Mock data for the book
  const book = {
    id: id || '1',
    title: 'Floral Alphabet Fun',
    tagline: 'Phonics, Writing & Coloring Adventure with Rilo & Rivy',
    price: 12.99,
    ageRange: '3–6 Years',
    status: 'Available Now',
    color: '#FF5F6D',
    description: 'Enter a garden of learning where every petal holds a secret sound! "Floral Alphabet Fun" combines the magic of nature with the foundational building blocks of literacy. Join Rilo the Rabbit as he explores 26 unique flowers, each representing a letter of the alphabet.',
    features: [
      '26 Hand-drawn Floral Illustrations',
      'Large Letter Tracing Guides',
      'Phonics-based Learning Exercises',
      'Premium 100lb Acid-Free Paper (Physical)',
      'Digital Download Compatibility (Procreate/iPad)'
    ],
    previews: [1, 2, 3, 4],
    learningBenefits: [
      { title: 'Phonics', desc: 'Connect sounds to floral shapes', icon: BookOpen },
      { title: 'Fine Motor', desc: 'Intricate coloring for steady hands', icon: Palette },
      { title: 'Confidence', desc: 'Positive reinforcement with Rivy', icon: ShieldCheck },
    ]
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 py-8 md:py-16"
    >
      {/* Breadcrumbs */}
      <NavLink to="/library" className="inline-flex items-center text-sm text-[#404040] hover:text-black mb-8 transition-colors group">
        <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" /> Back to Library
      </NavLink>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20">
        
        {/* Left: Images */}
        <div className="lg:col-span-5 space-y-6">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="aspect-[3/4] relative rounded-[2rem] overflow-hidden border border-black/10 bg-black/5 shadow-2xl"
          >
            <div 
              className="absolute inset-0 opacity-20"
              style={{ backgroundColor: book.color }}
            />
            <div className="absolute inset-0 flex items-center justify-center p-12 text-center text-[#0a0a0a]/40 font-bold text-3xl italic">
              {book.title} <br /> Cover Preview
            </div>
            <div className="absolute top-6 left-6">
               <Badge className="bg-black/5 backdrop-blur-md border-black/20 text-[#0a0a0a] uppercase tracking-widest text-[10px] py-1 px-3">Premium Edition</Badge>
            </div>
          </motion.div>

          <div className="grid grid-cols-4 gap-4">
            {book.previews.map((p) => (
              <div key={p} className="aspect-square rounded-2xl border border-black/10 bg-black/5 hover:border-black/30 transition-all cursor-pointer overflow-hidden">
                 <div className="w-full h-full bg-black/5 opacity-50 flex items-center justify-center text-[10px] text-[#0a0a0a]/50">Page {p}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Info */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge className="bg-[#5BE37D] text-black rounded-full px-3 py-1 text-[10px] uppercase font-bold tracking-widest">
                {book.status}
              </Badge>
              <span className="text-[#525252] text-sm font-medium">Ages {book.ageRange}</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#0a0a0a] leading-tight">
              {book.title}
            </h1>
            <p className="text-xl text-[#FFD93D] font-medium italic">
              {book.tagline}
            </p>
          </div>

          <div className="flex items-center gap-12">
            <div className="flex flex-col">
              <span className="text-4xl font-bold text-[#0a0a0a]">${book.price}</span>
              <span className="text-xs text-[#525252] uppercase tracking-widest font-bold">Standard Price</span>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-4 h-4 fill-[#FFD93D] text-[#FFD93D]" />
              ))}
              <span className="ml-2 text-sm text-[#525252]">(124 Reviews)</span>
            </div>
          </div>

          <p className="text-lg text-[#525252] leading-relaxed max-w-2xl">
            {book.description}
          </p>

          <div className="flex flex-col gap-4 py-4">
            <Button 
              size="lg" 
              onClick={() => addToCart({ ...book, type: 'book' })}
              className="w-full rounded-full h-16 bg-white text-black hover:bg-[#F5F5F5] font-bold text-xl shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
              <ShoppingCart className="w-6 h-6 mr-3" /> Buy on Hue Whimsy
            </Button>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="outline" className="flex-1 rounded-full h-14 border-black/10 text-[#0a0a0a] hover:bg-black/5 transition-all font-bold">
                🛍️ Buy on Amazon
              </Button>
              <Button variant="outline" className="flex-1 rounded-full h-14 border-black/10 text-[#0a0a0a] hover:bg-black/5 transition-all font-bold">
                🛍️ Buy on Walmart
              </Button>
            </div>

            <Button variant="ghost" size="lg" className="w-full rounded-full h-14 border-black/5 text-[#525252] hover:bg-black/5 font-bold transition-all">
              <Download className="w-5 h-5 mr-2" /> Get Free Sample
            </Button>
          </div>

          <Separator className="bg-black/5" />

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: BookOpen, label: 'Pages', val: '64 Premium' },
              { icon: Palette, label: 'Style', val: 'Watercolor' },
              { icon: Languages, label: 'Langs', val: 'Multi-lingual' },
              { icon: Share2, label: 'Format', val: 'Print + Digital' },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col gap-2">
                 <stat.icon className="w-5 h-5 text-[#FFD93D]" />
                 <span className="text-[10px] uppercase tracking-widest font-bold text-[#525252]">{stat.label}</span>
                 <span className="text-sm text-[#0a0a0a] font-semibold">{stat.val}</span>
              </div>
            ))}
          </div>

          {/* Features Column */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
            {book.features.map((f, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-[#525252]">
                <CheckCircle2 className="w-4 h-4 text-[#5BE37D] shrink-0 mt-0.5" />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <section className="mt-32">
        <div className="flex border-b border-black/10 mb-12 overflow-x-auto no-scrollbar">
          {['description', 'what-is-inside', 'learning-benefits', 'reviews'].map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={cn(
                "px-8 py-4 text-sm font-bold uppercase tracking-widest transition-all whitespace-nowrap",
                activeTab === t ? "text-[#0a0a0a] border-b-2 border-[#FFD93D]" : "text-[#404040] hover:text-black"
              )}
            >
              {t.replace(/-/g, ' ')}
            </button>
          ))}
        </div>

        <div className="min-h-[400px]">
          {activeTab === 'learning-benefits' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {book.learningBenefits.map((b, i) => (
                <Card key={i} className="border-black/10 bg-black/5 p-8 flex flex-col gap-4 text-center items-center">
                  <div className="w-16 h-16 rounded-full bg-black/5 flex items-center justify-center border border-black/10">
                    <b.icon className="w-8 h-8 text-[#FF9A3C]" />
                  </div>
                  <h4 className="text-2xl font-bold text-[#0a0a0a]">{b.title}</h4>
                  <p className="text-[#525252]">{b.desc}</p>
                </Card>
              ))}
            </div>
          )}
          {activeTab === 'description' && (
            <div className="max-w-4xl space-y-6 text-lg text-[#525252] leading-relaxed">
              <p>
                Every page of <strong>Floral Alphabet Fun</strong> has been meticulously crafted to engage young minds both visually and conceptually. Rilo and Rivy act as the playful instructors, pointing out details in the flowers that mirror the shape of the letters.
              </p>
              <p>
                For example, the letter 'C' is discovered in the curling vine of a Clematis, while 'S' slithers through the stems of a Snapdragon. This visual association helps children retain letter shapes longer than traditional flashcards.
              </p>
              <Button variant="outline" className="rounded-full border-black/20 text-[#0a0a0a] mt-4">
                Download Curriculum Guide (PDF)
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Relational Products / Up-selling */}
      <section className="mt-32">
        <h2 className="text-3xl font-bold text-[#0a0a0a] mb-12">You Might Also Love</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {['Fruity Alphabet Fun', 'Veggie Alphabet Fun', 'Animal Alphabet Fun'].map((other, i) => (
             <Card key={i} className="border-black/10 bg-black/5 overflow-hidden group cursor-pointer hover:bg-black/5 transition-all">
                <div className="aspect-[4/3] bg-black/5 flex items-center justify-center text-[#0a0a0a]/20 font-bold">{other} Preview</div>
                <div className="p-6">
                  <h4 className="text-lg font-bold text-[#0a0a0a] group-hover:text-[#FFD93D] transition-colors">{other}</h4>
                  <p className="text-sm text-[#525252] mt-2">Alphabet Learning Adventure</p>
                </div>
             </Card>
          ))}
        </div>
      </section>
    </motion.div>
  );
};
