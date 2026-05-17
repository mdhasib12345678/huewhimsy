import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'motion/react';
import { Button, buttonVariants } from '@/components/ui/button';
import { useRainbow } from '@/components/RainbowContext';
import { BookOpen, Palette, Sparkles, Star, ArrowRight, Laptop } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  listProducts,
  listEndorsements,
  getHeroBanner,
  subscribeNewsletter,
  productPrice,
  formatPrice,
  type MedusaProduct,
  type Endorsement,
  type HeroBanner,
} from '@/lib/medusa';
import { SEO } from '@/components/SEO';

const RAINBOW = ['#FF5F6D', '#FF9A3C', '#FFD93D', '#5BE37D', '#4DA8FF', '#6C63FF', '#B067FF'];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as any } },
};

export const Home: React.FC = () => {
  const { setIntensity } = useRainbow();

  const [hero, setHero] = useState<HeroBanner | null>(null);
  const [products, setProducts] = useState<MedusaProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [testimonials, setTestimonials] = useState<Endorsement[]>([]);
  const [testimonialsLoading, setTestimonialsLoading] = useState(true);

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterName, setNewsletterName] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'sending' | 'ok' | 'err'>('idle');

  useEffect(() => {
    setIntensity(1.0);
    return () => setIntensity(0.7);
  }, []);

  useEffect(() => {
    void getHeroBanner('home_hero').then(setHero).catch(() => {});

    void listProducts({ limit: 8 })
      .then((res) => setProducts(res.products))
      .catch(() => setProducts([]))
      .finally(() => setProductsLoading(false));

    void listEndorsements({ limit: 6 })
      .then((res) => setTestimonials(res.endorsements))
      .catch(() => setTestimonials([]))
      .finally(() => setTestimonialsLoading(false));
  }, []);

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterStatus('sending');
    try {
      await subscribeNewsletter({
        email: newsletterEmail,
        name: newsletterName || undefined,
        source: 'home_free_pack',
      });
      setNewsletterStatus('ok');
      setNewsletterEmail('');
      setNewsletterName('');
    } catch {
      setNewsletterStatus('err');
    }
  };

  const heroTitle = hero?.title ?? 'Color Your World,\nShape Your Dreams';
  const heroSubtitle = hero?.subtitle ?? 'Cozy learning adventures with Rilo and Rivy for ages 3 to 8';
  const heroCtaLabel = hero?.cta_label ?? '🚀 Start the Adventure';
  const heroCtaUrl = hero?.cta_url ?? '/library';

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-24 relative"
    >
      <SEO
        title="Whimsical Books & Creative Learning for Ages 3-8"
        description="Hand-illustrated children's books, free printable activities, and creative tools for ages 3-8. Meet Rilo and Rivy."
      />
      {/* 🎨 HERO */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden pt-20">
        <div className="container mx-auto px-4 text-center z-10">
          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-8xl font-bold tracking-tight text-[#0a0a0a] mb-8 leading-[1.1] whitespace-pre-line"
          >
            {heroTitle}
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="max-w-2xl mx-auto text-xl md:text-2xl text-[#525252] mb-12 font-medium"
          >
            {heroSubtitle}
          </motion.p>
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <NavLink to={heroCtaUrl} className={cn(buttonVariants({ size: 'lg' }), 'rounded-full px-10 py-8 text-xl bg-white text-black border border-black/10 hover:bg-[#F5F5F5] shadow-2xl transition-all hover:scale-105 active:scale-95 group font-bold')}>
              {heroCtaLabel} <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </NavLink>
            <NavLink
              to="/free-activities"
              className={cn(buttonVariants({ size: 'lg', variant: 'outline' }), 'rounded-full px-10 py-8 text-xl border-black/20 bg-black/5 backdrop-blur-md text-[#0a0a0a] hover:bg-black/10 shadow-xl transition-all hover:scale-105 active:scale-95 font-bold')}
            >
              🎁 Get Free Pack
            </NavLink>
          </motion.div>
        </div>
      </section>

      {/* 🧭 START SECTION (brand-themed; not from CMS) */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: 'Meet Rilo and Rivy', icon: Star, color: '#FF5F6D', to: '/about' },
            { title: 'Try a Fun Activity', icon: Palette, color: '#FFD93D', to: '/free-activities' },
            { title: 'Explore Books', icon: BookOpen, color: '#4DA8FF', to: '/library' },
          ].map((item, i) => (
            <motion.div key={i} variants={itemVariants} whileHover={{ y: -8 }}>
              <NavLink to={item.to}>
                <Card className="border-black/10 bg-black/5 backdrop-blur-xl p-8 h-full flex flex-col items-center text-center group cursor-pointer">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border border-black/10 group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: item.color + '20' }}
                  >
                    <item.icon className="w-8 h-8" style={{ color: item.color }} />
                  </div>
                  <h3 className="text-2xl font-bold text-[#0a0a0a] group-hover:text-[#FFD93D] transition-colors">{item.title}</h3>
                </Card>
              </NavLink>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 📚 BOOK SECTION (live from Medusa products) */}
      <section className="container mx-auto px-4">
        <motion.div variants={itemVariants} className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold text-[#0a0a0a] mb-4">Explore Our Adventures</h2>
        </motion.div>

        <div className="flex items-center gap-4 mb-8">
          <Badge className="bg-[#5BE37D] text-black text-sm px-4 py-1">✨ FROM THE LIBRARY</Badge>
          <div className="h-px flex-grow bg-gray-200" />
        </div>

        {productsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[0, 1, 2].map((i) => (
              <div key={i} className="aspect-[3/4] rounded-2xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <p className="text-center text-[#525252] py-12">No books yet — check back soon!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {products.slice(0, 6).map((book, i) => {
              const color = RAINBOW[i % RAINBOW.length];
              const price = productPrice(book);
              return (
                <motion.div key={book.id} variants={itemVariants} whileHover={{ y: -10 }}>
                  <NavLink to={`/shop/${book.handle}`}>
                    <Card className="overflow-hidden border-black/10 bg-black/5 backdrop-blur-xl h-full group cursor-pointer border-b-4" style={{ borderBottomColor: color + '60' }}>
                      <CardContent className="p-0">
                        <div className="aspect-[3/4] relative bg-black/5 flex items-center justify-center overflow-hidden">
                          {book.thumbnail ? (
                            <img src={book.thumbnail} alt={book.title} className="w-full h-full object-cover" loading="lazy" />
                          ) : (
                            <>
                              <div className="absolute inset-0 opacity-20" style={{ backgroundColor: color }} />
                              <span className="relative z-10 text-[#0a0a0a]/60 font-bold text-xl px-12 text-center">{book.title}</span>
                            </>
                          )}
                        </div>
                        <div className="p-6">
                          <h4 className="text-xl font-bold text-[#0a0a0a] group-hover:text-[#FFD93D] transition-colors mb-2">{book.title}</h4>
                          {price > 0 && <p className="text-sm text-[#525252] mb-4">{formatPrice(price)}</p>}
                          <Button variant="outline" className="w-full rounded-full border-black/20 text-[#0a0a0a] group-hover:bg-white group-hover:text-black transition-all">
                            Explore Book
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </NavLink>
                </motion.div>
              );
            })}
          </div>
        )}

        <div className="mt-16 text-center">
          <NavLink to="/library" className={cn(buttonVariants({ variant: 'ghost' }), 'text-[#0a0a0a] hover:bg-black/5 rounded-full px-10 py-6 text-lg font-bold')}>
            📖 View Full Library <ArrowRight className="ml-2 w-5 h-5" />
          </NavLink>
        </div>
      </section>

      {/* 🛍️ SHOP PREVIEW SECTION */}
      <section className="container mx-auto px-4 py-12">
        <motion.div variants={itemVariants} className="bg-[#F9FAFB] rounded-[4rem] p-12 md:p-24 border border-black/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFD93D]/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
          <div className="flex flex-col lg:flex-row items-center gap-16 relative z-10">
            <div className="lg:w-1/2 space-y-8 text-center lg:text-left">
              <Badge className="bg-[#4DA8FF] text-white px-4 py-1">SHOP PREVIEW</Badge>
              <h2 className="text-5xl md:text-6xl font-bold text-[#0a0a0a] leading-tight">Featured Categories</h2>
              <p className="text-xl text-[#525252]">
                Bring the magic home with our carefully selected educational toys, creative tools, and family favorites.
              </p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                <NavLink to="/shop" className={cn(buttonVariants({ size: 'lg' }), 'rounded-full px-10 h-14 bg-white text-black border border-black/10 font-bold hover:bg-[#F5F5F5] transition-all hover:scale-105')}>
                  🛍️ Explore Shop
                </NavLink>
                <NavLink to="/shop?sort=featured" className={cn(buttonVariants({ size: 'lg', variant: 'outline' }), 'rounded-full px-10 h-14 border-black/20 text-[#0a0a0a] hover:bg-black/5 font-bold transition-all hover:scale-105')}>
                  ⭐ Featured Favorites
                </NavLink>
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
              ].map((cat) => (
                <NavLink key={cat.name} to={`/shop?category=${encodeURIComponent(cat.name)}`}>
                  <motion.div
                    whileHover={{ y: -5, scale: 1.05 }}
                    className="aspect-square rounded-3xl bg-white border border-black/10 p-4 flex flex-col items-center justify-center text-center gap-3 group cursor-pointer shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: cat.color + '20' }}>
                      <div className="w-6 h-6 rounded-full" style={{ backgroundColor: cat.color }} />
                    </div>
                    <span className="text-[10px] sm:text-xs font-bold text-[#0a0a0a] uppercase tracking-wider">{cat.name}</span>
                  </motion.div>
                </NavLink>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* 🧠 LEARNING BENEFITS (brand promises) */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {[
            { title: 'Coloring', icon: Palette, color: '#FF5F6D' },
            { title: 'Phonics', icon: BookOpen, color: '#FFD93D' },
            { title: 'Writing', icon: Sparkles, color: '#5BE37D' },
            { title: 'Creativity', icon: Star, color: '#B067FF' },
          ].map((item, i) => (
            <motion.div key={i} variants={itemVariants} className="flex flex-col items-center gap-4 p-8 rounded-[2rem] bg-white border border-black/10 shadow-sm">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: item.color + '20' }}>
                <item.icon className="w-8 h-8" style={{ color: item.color }} />
              </div>
              <span className="text-xl font-bold text-[#0a0a0a]">{item.title}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 🎁 FREE SAMPLE SECTION — newsletter form (wired) */}
      <section className="container mx-auto px-4">
        <Card className="rounded-[4rem] overflow-hidden border-black/20 bg-gradient-to-br from-[#FF5F6D]/10 via-[#B067FF]/10 to-[#4DA8FF]/10 p-12 md:p-24 border-2">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div variants={itemVariants}>
              <h2 className="text-4xl md:text-6xl font-bold text-[#0a0a0a] mb-6 leading-tight">Start the Fun Today for Free!</h2>
              <p className="text-xl text-[#525252] mb-8">
                Download our signature "Rilo &amp; Rivy Welcome Pack" with premium coloring pages and alphabet starters.
              </p>
              <div className="text-xs text-[#525252] font-bold uppercase tracking-widest flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-6 h-6 rounded-full border border-[#0a0a0a] bg-black/10" />
                  ))}
                </div>
                Join families subscribing today
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white p-8 md:p-12 rounded-[3rem] border border-black/10 shadow-sm">
              <form className="space-y-4" onSubmit={handleNewsletter}>
                <input
                  type="text"
                  placeholder="Your name (optional)"
                  value={newsletterName}
                  onChange={(e) => setNewsletterName(e.target.value)}
                  className="w-full h-14 rounded-2xl bg-white border border-gray-300 px-6 text-[#0a0a0a] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FFD93D]"
                />
                <input
                  type="email"
                  required
                  placeholder="Email address"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="w-full h-14 rounded-2xl bg-white border border-gray-300 px-6 text-[#0a0a0a] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FFD93D]"
                />
                <Button
                  type="submit"
                  disabled={newsletterStatus === 'sending' || newsletterStatus === 'ok'}
                  className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#FF5F6D] to-[#B067FF] text-white font-bold text-lg hover:opacity-90 transition-all shadow-md"
                >
                  {newsletterStatus === 'sending'
                    ? 'Sending...'
                    : newsletterStatus === 'ok'
                      ? '✅ Check your inbox!'
                      : '📩 Send My Free Pack'}
                </Button>
                {newsletterStatus === 'err' && (
                  <p className="text-sm text-red-600 text-center">Something went wrong. Please try again.</p>
                )}
              </form>
            </motion.div>
          </div>
        </Card>
      </section>

      {/* 👦👧 CHARACTER SECTION (brand identity) */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            { name: 'Rilo', role: 'curious explorer', color: '#FF9A3C' },
            { name: 'Rivy', role: 'supportive guide', color: '#FF5F6D' },
          ].map((char, i) => (
            <motion.div key={i} variants={itemVariants} whileHover={{ scale: 1.02 }} className="group">
              <Card className="p-12 rounded-[3rem] bg-white border border-black/10 shadow-sm h-full flex flex-col items-center text-center overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-2" style={{ backgroundColor: char.color }} />
                <div className="w-32 h-32 rounded-full bg-black/5 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                  <span className="text-4xl font-bold" style={{ color: char.color }}>
                    {char.name[0]}
                  </span>
                </div>
                <h3 className="text-4xl font-bold text-[#0a0a0a] mb-2">{char.name}</h3>
                <p className="text-xl text-[#525252] italic">{char.role}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 💬 TESTIMONIALS (live from /store/endorsements) */}
      <section className="container mx-auto px-4 py-12 text-center">
        <motion.h2 variants={itemVariants} className="text-4xl font-bold text-[#0a0a0a] mb-16">
          Why Parents Love Hue Whimsy
        </motion.h2>

        {testimonialsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-48 rounded-2xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : testimonials.length === 0 ? (
          <p className="text-[#525252]">Customer reviews coming soon.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.slice(0, 3).map((t) => (
              <motion.div key={t.id} variants={itemVariants}>
                <Card className="p-8 rounded-[2rem] bg-white border border-black/10 text-left italic relative shadow-sm">
                  <div className="text-5xl text-[#0a0a0a]/10 absolute top-4 left-4 font-serif">&ldquo;</div>
                  <p className="text-[#525252] mb-6 relative z-10 font-medium">{t.quote}</p>
                  <div className="flex items-center gap-3">
                    {t.avatar ? (
                      <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center font-bold text-[#525252]">
                        {t.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="text-[#0a0a0a] font-bold text-sm">{t.name}</p>
                      {t.role && <p className="text-xs text-[#525252]">{t.role}</p>}
                      {t.rating && (
                        <div className="flex gap-1 mt-1">
                          {[...Array(t.rating)].map((_, j) => (
                            <Star key={j} className="w-3 h-3 fill-[#FFD93D] text-[#FFD93D]" />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* 🧩 SERVICES PREVIEW */}
      <section className="container mx-auto px-4 py-12">
        <div className="bg-[#F9FAFB] rounded-[4rem] p-12 md:p-20 border border-black/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-left">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold text-[#0a0a0a]">For Parents and Creators</h2>
              <p className="text-xl text-[#525252]">We help authors and brands bring their own dreams to life.</p>
              <NavLink to="/services" className={cn(buttonVariants({ size: 'lg' }), 'rounded-full px-10 py-7 bg-white text-black border border-black/10 font-bold h-fit transition-all hover:scale-105')}>
                💼 Explore Services
              </NavLink>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[Palette, Laptop, BookOpen, Sparkles].map((Icon, i) => (
                <div key={i} className="w-20 h-20 rounded-3xl bg-white flex items-center justify-center border border-black/10 shadow-sm">
                  <Icon className="w-8 h-8 text-[#525252]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 📩 FINAL CTA */}
      <section className="container mx-auto px-4 py-24 text-center">
        <motion.div variants={itemVariants} className="max-w-3xl mx-auto space-y-12">
          <h2 className="text-5xl md:text-7xl font-bold text-[#0a0a0a]">Join the Hue Whimsy Learning World</h2>
          <NavLink to="/library" className={cn(buttonVariants({ size: 'lg' }), 'rounded-full px-16 py-10 text-2xl bg-gradient-to-r from-[#FF5F6D] to-[#B067FF] text-white font-bold transition-all hover:scale-105 shadow-[0_0_50px_-12px_rgba(176,103,255,0.5)]')}>
            🚀 Start My Adventure
          </NavLink>
        </motion.div>
      </section>
    </motion.div>
  );
};
