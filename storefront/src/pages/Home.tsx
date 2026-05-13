import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'motion/react';
import { Button, buttonVariants } from '@/components/ui/button';
import { useRainbow } from '@/components/RainbowContext';
import { BookOpen, Palette, Sparkles, Star, ArrowRight, Download, CheckCircle2, Laptop } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export const Home: React.FC = () => {
  const { setIntensity } = useRainbow();

  useEffect(() => {
    setIntensity(1.0); // Full intensity for Home
    return () => setIntensity(0.7); // Default reset
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  };

  const books = [
    { title: 'Floral Alphabet Fun', status: 'Available Now', color: '#FF5F6D' },
    { title: 'Fruity Alphabet Fun', status: 'Available Now', color: '#FF9A3C' },
    { title: 'Veggie Alphabet Fun', status: 'Available Now', color: '#FFD93D' },
  ];

  const comingSoon = [
    { title: 'Landmark Alphabet Fun', status: 'Coming Soon', color: '#5BE37D' },
    { title: 'Animal Alphabet Fun', status: 'Coming Soon', color: '#4DA8FF' },
    { title: 'Dinosaur Alphabet Fun', status: 'Coming Soon', color: '#B067FF' },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-24 relative"
    >
      {/* 🎨 HERO */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden pt-20">
        <div className="container mx-auto px-4 text-center z-10">
          <motion.h1 
            variants={itemVariants}
            className="text-5xl md:text-8xl font-bold tracking-tight text-white mb-8 leading-[1.1]"
          >
            Color Your World, <br />
            <span className="text-[#FFD93D]">Shape Your Dreams</span>
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            className="max-w-2xl mx-auto text-xl md:text-2xl text-[#B8BEC6] mb-12 font-medium"
          >
            Cozy learning adventures with Rilo and Rivy for ages 3 to 8
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <NavLink to="/library" className={cn(buttonVariants({ size: "lg" }), "rounded-full px-10 py-8 text-xl bg-white text-black hover:bg-[#F5F5F5] shadow-2xl transition-all hover:scale-105 active:scale-95 group font-bold")}>
              🚀 Start the Adventure <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </NavLink>
            <Button size="lg" variant="outline" className="rounded-full px-10 py-8 text-xl border-white/20 bg-white/5 backdrop-blur-md text-white hover:bg-white/10 shadow-xl transition-all hover:scale-105 active:scale-95 font-bold">
              🎁 Get Free Pack
            </Button>
          </motion.div>
        </div>
      </section>

      {/* 🧭 START SECTION */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: 'Meet Rilo and Rivy', icon: Star, color: '#FF5F6D' },
            { title: 'Try a Fun Activity', icon: Palette, color: '#FFD93D' },
            { title: 'Explore Books', icon: BookOpen, color: '#4DA8FF' },
          ].map((item, i) => (
            <motion.div key={i} variants={itemVariants} whileHover={{ y: -8 }}>
              <Card className="border-white/10 bg-white/5 backdrop-blur-xl p-8 h-full flex flex-col items-center text-center group cursor-pointer">
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border border-white/10 group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: item.color + '20' }}
                >
                  <item.icon className="w-8 h-8" style={{ color: item.color }} />
                </div>
                <h3 className="text-2xl font-bold text-white group-hover:text-[#FFD93D] transition-colors">{item.title}</h3>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 📚 BOOK SECTION */}
      <section className="container mx-auto px-4">
        <motion.div variants={itemVariants} className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">Explore Our Adventures</h2>
        </motion.div>

        <div className="space-y-12">
          <div>
            <div className="flex items-center gap-4 mb-8">
              <Badge className="bg-[#5BE37D] text-black text-sm px-4 py-1">✅ AVAILABLE NOW</Badge>
              <div className="h-px flex-grow bg-white/10" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {books.map((book, i) => (
                <motion.div key={i} variants={itemVariants} whileHover={{ y: -10 }}>
                  <Card className="overflow-hidden border-white/10 bg-white/5 backdrop-blur-xl h-full group cursor-pointer border-b-4 border-b-[#5BE37D]/30">
                    <CardContent className="p-0">
                      <div className="aspect-[3/4] relative bg-white/5 flex items-center justify-center">
                        <div className="absolute inset-0 opacity-20" style={{ backgroundColor: book.color }} />
                        <span className="relative z-10 text-white/50 font-bold text-xl px-12 text-center">{book.title}</span>
                      </div>
                      <div className="p-6">
                        <h4 className="text-xl font-bold text-white group-hover:text-[#FFD93D] transition-colors mb-4">{book.title}</h4>
                        <Button variant="outline" className="w-full rounded-full border-white/20 text-white group-hover:bg-white group-hover:text-black transition-all">
                          Explore Book
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          <div>
             <div className="flex items-center gap-4 mb-8">
              <Badge className="bg-white/10 text-[#B8BEC6] text-sm px-4 py-1">🚧 COMING SOON</Badge>
              <div className="h-px flex-grow bg-white/10" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {comingSoon.map((book, i) => (
                <motion.div key={i} variants={itemVariants} className="opacity-60 grayscale-[0.5]">
                  <Card className="overflow-hidden border-white/5 bg-white/[0.02] backdrop-blur-xl h-full">
                    <CardContent className="p-0">
                      <div className="aspect-[3/4] relative bg-black/20 flex items-center justify-center">
                         <div className="absolute top-4 right-4 bg-black/60 px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-widest border border-white/10">Coming Soon</div>
                         <span className="text-white/20 font-bold text-xl px-12 text-center">{book.title}</span>
                      </div>
                      <div className="p-6">
                        <h4 className="text-xl font-bold text-white mb-2">{book.title}</h4>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <NavLink to="/library" className={cn(buttonVariants({ variant: "ghost" }), "text-white hover:bg-white/10 rounded-full px-10 py-6 text-lg font-bold")}>
            📖 View Full Library <ArrowRight className="ml-2 w-5 h-5" />
          </NavLink>
        </div>
      </section>

      {/* 🛍️ SHOP PREVIEW SECTION */}
      <section className="container mx-auto px-4 py-12">
        <motion.div variants={itemVariants} className="bg-white/[0.02] rounded-[4rem] p-12 md:p-24 border border-white/10 backdrop-blur-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFD93D]/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
          
          <div className="flex flex-col lg:flex-row items-center gap-16 relative z-10">
            <div className="lg:w-1/2 space-y-8 text-center lg:text-left">
              <Badge className="bg-[#4DA8FF] text-white px-4 py-1">SHOP PREVIEW</Badge>
              <h2 className="text-5xl md:text-6xl font-bold text-white leading-tight">Featured Categories</h2>
              <p className="text-xl text-[#B8BEC6]">
                Bring the magic home with our carefully selected educational toys, creative tools, and family favorites.
              </p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                <NavLink to="/shop" className={cn(buttonVariants({ size: "lg" }), "rounded-full px-10 h-14 bg-white text-black font-bold hover:bg-[#F5F5F5] transition-all hover:scale-105")}>
                  🛍️ Explore Shop
                </NavLink>
                <Button size="lg" variant="outline" className="rounded-full px-10 h-14 border-white/20 text-white hover:bg-white/10 font-bold transition-all hover:scale-105">
                  ⭐ Featured Favorites
                </Button>
              </div>
            </div>

            <div className="lg:w-1/2 grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { name: 'Educational Toys', color: '#FF5F6D' },
                { name: 'Coloring Supplies', color: '#FF9A3C' },
                { name: 'Creative Tools', color: '#FFD93D' },
                { name: 'Writing Supplies', color: '#5BE37D' },
                { name: 'Arts & Crafts', color: '#4DA8FF' },
                { name: 'Family Favorites', color: '#B067FF' },
              ].map((cat, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -5, scale: 1.05 }}
                  className="aspect-square rounded-3xl bg-white/5 border border-white/10 p-4 flex flex-col items-center justify-center text-center gap-3 group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: cat.color + '20' }}>
                    <div className="w-6 h-6 rounded-full" style={{ backgroundColor: cat.color }} />
                  </div>
                  <span className="text-[10px] sm:text-xs font-bold text-white uppercase tracking-wider">{cat.name}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* 🧠 LEARNING BENEFITS */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
           {[
             { title: 'Coloring', icon: Palette, color: '#FF5F6D' },
             { title: 'Phonics', icon: BookOpen, color: '#FFD93D' },
             { title: 'Writing', icon: Sparkles, color: '#5BE37D' },
             { title: 'Creativity', icon: Star, color: '#B067FF' },
           ].map((item, i) => (
             <motion.div key={i} variants={itemVariants} className="flex flex-col items-center gap-4 p-8 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-3xl">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: item.color + '20' }}>
                   <item.icon className="w-8 h-8" style={{ color: item.color }} />
                </div>
                <span className="text-xl font-bold text-white">{item.title}</span>
             </motion.div>
           ))}
        </div>
      </section>

      {/* 🎁 FREE SAMPLE SECTION */}
      <section className="container mx-auto px-4">
        <Card className="rounded-[4rem] overflow-hidden border-white/20 bg-gradient-to-br from-[#FF5F6D]/10 via-[#B067FF]/10 to-[#4DA8FF]/10 backdrop-blur-3xl p-12 md:p-24 border-2">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div variants={itemVariants}>
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">Start the Fun Today for Free!</h2>
              <p className="text-xl text-[#B8BEC6] mb-8">
                Download our signature "Rilo & Rivy Welcome Pack" with premium coloring pages and alphabet starters.
              </p>
              <div className="text-xs text-[#B8BEC6] font-bold uppercase tracking-widest flex items-center gap-2">
                 <div className="flex -space-x-2">
                    {[1,2,3,4].map(i => <div key={i} className="w-6 h-6 rounded-full border border-[#0a0a0a] bg-white/20" />)}
                 </div>
                 Join 5,000+ happy parents today
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="bg-black/20 p-8 md:p-12 rounded-[3rem] border border-white/10 backdrop-blur-3xl">
              <form className="space-y-4">
                <input type="text" placeholder="Name" className="w-full h-14 rounded-2xl bg-white/5 border border-white/10 px-6 text-white placeholder:text-white/30 focus:outline-none focus:border-[#FFD93D]/50 transition-colors" />
                <input type="email" placeholder="Email" className="w-full h-14 rounded-2xl bg-white/5 border border-white/10 px-6 text-white placeholder:text-white/30 focus:outline-none focus:border-[#FFD93D]/50 transition-colors" />
                <Button className="w-full h-14 rounded-2xl bg-white text-black font-bold text-lg hover:bg-[#F5F5F5] transition-all">
                  📩 Send My Free Pack
                </Button>
              </form>
            </motion.div>
          </div>
        </Card>
      </section>

      {/* 👦👧 CHARACTER SECTION */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {[
             { name: 'Rilo', role: 'curious explorer', color: '#FF9A3C' },
             { name: 'Rivy', role: 'supportive guide', color: '#FF5F6D' },
           ].map((char, i) => (
             <motion.div key={i} variants={itemVariants} whileHover={{ scale: 1.02 }} className="group">
               <Card className="p-12 rounded-[3rem] bg-white/5 border border-white/10 backdrop-blur-3xl h-full flex flex-col items-center text-center overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-full h-2" style={{ backgroundColor: char.color }} />
                  <div className="w-32 h-32 rounded-full bg-white/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                     <span className="text-4xl font-bold" style={{ color: char.color }}>{char.name[0]}</span>
                  </div>
                  <h3 className="text-4xl font-bold text-white mb-2">{char.name}</h3>
                  <p className="text-xl text-[#B8BEC6] italic">{char.role}</p>
               </Card>
             </motion.div>
           ))}
        </div>
      </section>

      {/* 💬 TRUST SECTION */}
      <section className="container mx-auto px-4 py-12 text-center">
        <motion.h2 variants={itemVariants} className="text-4xl font-bold text-white mb-16">Why Parents Love Hue Whimsy</motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {[1,2,3].map(i => (
             <motion.div key={i} variants={itemVariants}>
               <Card className="p-8 rounded-[2rem] bg-white/5 border border-white/10 text-left italic relative">
                  <div className="text-5xl text-white/10 absolute top-4 left-4 font-serif">"</div>
                  <p className="text-[#B8BEC6] mb-6 relative z-10 font-medium">My daughter absolutely loves Rilo and Rivy! The coloring pages are so beautiful and the quality of the books is premium. It's our favorite cozy afternoon activity.</p>
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-white/20" />
                     <div>
                        <p className="text-white font-bold text-sm">Happy Parent</p>
                        <div className="flex gap-1">
                           {[1,2,3,4,5].map(j => <Star key={j} className="w-3 h-3 fill-[#FFD93D] text-[#FFD93D]" />)}
                        </div>
                     </div>
                  </div>
               </Card>
             </motion.div>
           ))}
        </div>
      </section>

      {/* 🧩 SERVICES PREVIEW */}
      <section className="container mx-auto px-4 py-12">
        <div className="bg-white/[0.03] rounded-[4rem] p-12 md:p-20 border border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-left">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold text-white">For Parents and Creators</h2>
              <p className="text-xl text-[#B8BEC6]">We help authors and brands bring their own dreams to life.</p>
              <Button size="lg" className="rounded-full px-10 py-7 bg-white text-black font-bold h-fit transition-all hover:scale-105">
                💼 Explore Services
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[Palette, Laptop, BookOpen, Sparkles].map((Icon, i) => (
                <div key={i} className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center border border-white/10">
                  <Icon className="w-8 h-8 text-[#B8BEC6]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 📩 FINAL CTA */}
      <section className="container mx-auto px-4 py-24 text-center">
        <motion.div variants={itemVariants} className="max-w-3xl mx-auto space-y-12">
          <h2 className="text-5xl md:text-7xl font-bold text-white">Join the Hue Whimsy Learning World</h2>
          <Button size="lg" className="rounded-full px-16 py-10 text-2xl bg-gradient-to-r from-[#FF5F6D] to-[#B067FF] text-white font-bold transition-all hover:scale-105 shadow-[0_0_50px_-12px_rgba(176,103,255,0.5)]">
            🚀 Start My Adventure
          </Button>
        </motion.div>
      </section>
    </motion.div>
  );
};
