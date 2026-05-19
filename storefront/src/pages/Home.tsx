import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'motion/react';
import { Button, buttonVariants } from '@/components/ui/button';
import { useRainbow } from '@/components/RainbowContext';
import {
  BookOpen,
  Palette,
  Sparkles,
  Star,
  ArrowRight,
  Laptop,
  Loader2,
  ShoppingBag,
  PenTool,
  Heart,
  Send,
} from 'lucide-react';
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as any } },
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
  const heroSubtitle = hero?.subtitle ?? 'Cozy learning adventures with Rilo & Rivy for ages 3 to 8.';
  const heroCtaLabel = hero?.cta_label ?? 'Start the Adventure';
  const heroCtaUrl = hero?.cta_url ?? '/library';

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col"
    >
      <SEO
        title="Whimsical Books & Creative Learning for Ages 3-8"
        description="Hand-illustrated children's books, free printable activities, and creative tools for ages 3-8. Meet Rilo and Rivy."
      />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="container-page section-y-lg pt-16 sm:pt-20 lg:pt-24 text-center">
          <motion.div variants={itemVariants} className="flex justify-center mb-5">
            <Badge className="bg-gradient-to-r from-[#FFD93D]/20 to-[#FF9A3C]/20 text-[#0a0a0a] border border-[#FFD93D]/40 rounded-full px-4 py-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-widest">
              ✨ Hand-illustrated · ages 3–8
            </Badge>
          </motion.div>
          <motion.h1
            variants={itemVariants}
            className="fluid-display font-bold text-[#0a0a0a] mb-6 whitespace-pre-line max-w-4xl mx-auto"
          >
            {heroTitle}
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="fluid-lead max-w-2xl mx-auto text-[#525252] mb-8 sm:mb-10"
          >
            {heroSubtitle}
          </motion.p>
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 max-w-md sm:max-w-none mx-auto"
          >
            <NavLink
              to={heroCtaUrl}
              className="group inline-flex items-center justify-center rounded-full bg-[#0a0a0a] text-white px-7 sm:px-9 h-13 sm:h-14 font-semibold text-base sm:text-lg hover:bg-black shadow-[0_10px_30px_-10px_rgba(0,0,0,0.45)] hover:shadow-[0_14px_32px_-10px_rgba(0,0,0,0.55)] transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ height: '3.25rem' }}
            >
              {heroCtaLabel}
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </NavLink>
            <NavLink
              to="/free-activities"
              className="inline-flex items-center justify-center rounded-full bg-white text-[#0a0a0a] border border-black/10 px-7 sm:px-9 font-semibold text-base sm:text-lg hover:bg-black/[0.04] transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ height: '3.25rem' }}
            >
              <Sparkles className="mr-2 w-4 h-4 text-[#FF9A3C]" /> Free Pack
            </NavLink>
          </motion.div>

          {/* Trust strip */}
          <motion.div
            variants={itemVariants}
            className="mt-12 sm:mt-16 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[11px] uppercase tracking-widest font-bold text-[#525252]"
          >
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5BE37D]" /> FSC-certified paper
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FFD93D]" /> Made in Bangladesh
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4DA8FF]" /> Worldwide shipping
            </span>
          </motion.div>
        </div>
      </section>

      {/* QUICK START */}
      <section className="container-page section-y">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
          {[
            { title: 'Meet Rilo & Rivy', desc: 'The curious duo behind our stories.', icon: Star, color: '#FF5F6D', to: '/about' },
            { title: 'Try a Fun Activity', desc: 'Free printables to keep tiny hands busy.', icon: Palette, color: '#FFD93D', to: '/free-activities' },
            { title: 'Explore the Library', desc: 'Browse every book in the catalogue.', icon: BookOpen, color: '#4DA8FF', to: '/library' },
          ].map((item) => (
            <motion.div key={item.title} variants={itemVariants}>
              <NavLink to={item.to} className="block group">
                <Card className="border-black/[0.07] bg-white p-6 sm:p-7 h-full flex flex-row sm:flex-col items-center sm:items-start text-left gap-4 sm:gap-5 hover:border-black/[0.15] hover:shadow-md transition-all">
                  <div
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: item.color + '20' }}
                  >
                    <item.icon className="w-6 h-6 sm:w-7 sm:h-7" style={{ color: item.color }} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="fluid-h3 font-bold text-[#0a0a0a] mb-1">{item.title}</h3>
                    <p className="text-sm text-[#525252] hidden sm:block">{item.desc}</p>
                  </div>
                </Card>
              </NavLink>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FROM THE LIBRARY */}
      <section className="container-page section-y">
        <motion.div variants={itemVariants} className="flex items-end justify-between gap-4 mb-8 sm:mb-12">
          <div>
            <Badge className="bg-[#5BE37D]/15 text-[#0a0a0a] border border-[#5BE37D]/40 rounded-full px-3 py-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest mb-3">
              ✨ From the library
            </Badge>
            <h2 className="fluid-h1 font-bold text-[#0a0a0a]">Explore Our Adventures</h2>
          </div>
          <NavLink
            to="/library"
            className="hidden sm:inline-flex items-center text-sm font-semibold text-[#0a0a0a] hover:text-[#FF5F6D] gap-1 group"
          >
            View all <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </NavLink>
        </motion.div>

        {productsLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-black/[0.06] bg-white overflow-hidden animate-pulse"
              >
                <div className="aspect-[3/4] bg-black/[0.04]" />
                <div className="p-3 sm:p-4 space-y-2">
                  <div className="h-4 w-4/5 bg-black/[0.06] rounded" />
                  <div className="h-5 w-1/3 bg-black/[0.05] rounded mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <p className="text-center text-[#525252] py-12">No books yet — check back soon!</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
            {products.slice(0, 8).map((book) => {
              const price = productPrice(book);
              return (
                <motion.div key={book.id} variants={itemVariants}>
                  <NavLink to={`/shop/${book.handle}`} className="block h-full group">
                    <article className="h-full rounded-2xl border border-black/[0.06] bg-white overflow-hidden flex flex-col transition-all duration-300 group-hover:border-black/[0.12] group-hover:shadow-[0_18px_40px_-22px_rgba(10,10,10,0.18)]">
                      <div className="aspect-[3/4] relative bg-[#fafafa] overflow-hidden">
                        {book.thumbnail ? (
                          <img
                            src={book.thumbnail}
                            alt={book.title}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center px-4 text-center">
                            <span className="text-[#0a0a0a]/30 font-semibold text-sm sm:text-base line-clamp-2 leading-tight">
                              {book.title}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-3 sm:p-4 flex flex-col gap-1.5">
                        <h4 className="text-sm sm:text-[15px] font-semibold text-[#0a0a0a] line-clamp-2 leading-snug group-hover:text-[#FF5F6D] transition-colors">
                          {book.title}
                        </h4>
                        {price > 0 && (
                          <p className="text-base sm:text-lg font-bold text-[#0a0a0a] tracking-tight">
                            {formatPrice(price)}
                          </p>
                        )}
                      </div>
                    </article>
                  </NavLink>
                </motion.div>
              );
            })}
          </div>
        )}

        <div className="mt-10 sm:mt-12 flex justify-center sm:hidden">
          <NavLink
            to="/library"
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'rounded-full border-black/15 text-[#0a0a0a] hover:bg-black/[0.04] px-8 h-11 font-semibold',
            )}
          >
            View Full Library <ArrowRight className="ml-2 w-4 h-4" />
          </NavLink>
        </div>
      </section>

      {/* SHOP PREVIEW */}
      <section className="container-page section-y">
        <motion.div
          variants={itemVariants}
          className="surface-soft rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 lg:p-16 relative overflow-hidden"
        >
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-[#FFD93D]/15 blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-[#B067FF]/15 blur-[100px] pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-10 lg:gap-16 relative z-10">
            <div className="space-y-5 sm:space-y-6 text-center lg:text-left">
              <Badge className="bg-[#4DA8FF]/15 text-[#0a0a0a] border border-[#4DA8FF]/40 rounded-full px-3 py-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest">
                Shop preview
              </Badge>
              <h2 className="fluid-h1 font-bold text-[#0a0a0a]">Featured categories</h2>
              <p className="fluid-lead text-[#525252] max-w-md mx-auto lg:mx-0">
                Carefully selected educational toys, creative tools, and family favourites — all
                designed with little hands in mind.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <NavLink
                  to="/shop"
                  className={cn(
                    buttonVariants(),
                    'rounded-full px-7 h-12 sm:h-13 bg-[#0a0a0a] text-white font-semibold hover:bg-black transition-all',
                  )}
                  style={{ height: '3rem' }}
                >
                  <ShoppingBag className="w-4 h-4 mr-2" /> Explore Shop
                </NavLink>
                <NavLink
                  to="/shop?sort=featured"
                  className={cn(
                    buttonVariants({ variant: 'outline' }),
                    'rounded-full px-7 h-12 sm:h-13 border-black/15 text-[#0a0a0a] hover:bg-black/[0.04] font-semibold',
                  )}
                  style={{ height: '3rem' }}
                >
                  <Star className="w-4 h-4 mr-2 fill-[#FFD93D] text-[#FFD93D]" /> Featured
                </NavLink>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 sm:gap-4">
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
                    whileHover={{ y: -3, scale: 1.02 }}
                    className="aspect-square rounded-2xl bg-white border border-black/[0.06] p-3 sm:p-4 flex flex-col items-center justify-center text-center gap-2 sm:gap-3 cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <div
                      className="w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: cat.color + '20' }}
                    >
                      <div
                        className="w-4 h-4 sm:w-5 sm:h-5 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-bold text-[#0a0a0a] uppercase tracking-wider leading-tight">
                      {cat.name}
                    </span>
                  </motion.div>
                </NavLink>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* LEARNING BENEFITS */}
      <section className="container-page section-y">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {[
            { title: 'Coloring', icon: Palette, color: '#FF5F6D' },
            { title: 'Phonics', icon: BookOpen, color: '#FFD93D' },
            { title: 'Writing', icon: PenTool, color: '#5BE37D' },
            { title: 'Creativity', icon: Sparkles, color: '#B067FF' },
          ].map((item) => (
            <motion.div
              key={item.title}
              variants={itemVariants}
              className="flex flex-col items-center gap-3 sm:gap-4 p-5 sm:p-7 rounded-3xl bg-white border border-black/[0.07] text-center hover:shadow-md transition-shadow"
            >
              <div
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center"
                style={{ backgroundColor: item.color + '20' }}
              >
                <item.icon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: item.color }} />
              </div>
              <span className="text-sm sm:text-lg font-bold text-[#0a0a0a]">{item.title}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FREE SAMPLE (newsletter) */}
      <section className="container-page section-y">
        <Card className="rounded-[2rem] sm:rounded-[3rem] overflow-hidden border border-black/[0.06] bg-gradient-to-br from-[#FF5F6D]/8 via-[#FFD93D]/8 to-[#4DA8FF]/8 p-6 sm:p-10 lg:p-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
            <motion.div variants={itemVariants} className="space-y-5 text-center lg:text-left">
              <Badge className="bg-white text-[#0a0a0a] border border-black/10 rounded-full px-3 py-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest">
                Free welcome pack
              </Badge>
              <h2 className="fluid-h1 font-bold text-[#0a0a0a] leading-tight">
                Start the fun today, on the house.
              </h2>
              <p className="fluid-lead text-[#525252] max-w-md mx-auto lg:mx-0">
                12 premium coloring pages, 3 mini-books, and our alphabet starters — straight to
                your inbox.
              </p>
              <div className="flex items-center justify-center lg:justify-start gap-3 pt-1">
                <div className="flex -space-x-2">
                  {['#FF5F6D', '#FFD93D', '#5BE37D', '#4DA8FF'].map((c) => (
                    <div
                      key={c}
                      className="w-7 h-7 rounded-full border-2 border-white"
                      style={{ backgroundColor: c + '90' }}
                    />
                  ))}
                </div>
                <span className="text-xs text-[#525252] font-semibold">
                  3,400+ families already inside
                </span>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white rounded-2xl sm:rounded-3xl border border-black/[0.07] shadow-sm p-6 sm:p-8">
              <form className="space-y-3" onSubmit={handleNewsletter}>
                <input
                  type="text"
                  placeholder="Your name (optional)"
                  value={newsletterName}
                  onChange={(e) => setNewsletterName(e.target.value)}
                  className="w-full h-12 rounded-xl bg-white border border-black/10 px-4 text-[#0a0a0a] placeholder:text-[#9aa0a6] focus:outline-none focus:border-[#FFD93D] focus:ring-2 focus:ring-[#FFD93D]/30 transition-all"
                />
                <input
                  type="email"
                  required
                  placeholder="Email address"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="w-full h-12 rounded-xl bg-white border border-black/10 px-4 text-[#0a0a0a] placeholder:text-[#9aa0a6] focus:outline-none focus:border-[#FFD93D] focus:ring-2 focus:ring-[#FFD93D]/30 transition-all"
                />
                <Button
                  type="submit"
                  disabled={newsletterStatus === 'sending' || newsletterStatus === 'ok'}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-[#FF5F6D] via-[#FF9A3C] to-[#B067FF] text-white font-semibold hover:opacity-95 transition-all shadow-[0_8px_24px_-8px_rgba(255,95,109,0.5)]"
                >
                  {newsletterStatus === 'sending' ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending…
                    </>
                  ) : newsletterStatus === 'ok' ? (
                    <>✅ Check your inbox</>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" /> Send my free pack
                    </>
                  )}
                </Button>
                {newsletterStatus === 'err' && (
                  <p className="text-xs text-red-600 text-center">Something went wrong. Please try again.</p>
                )}
                <p className="text-[11px] text-[#525252] text-center pt-1">
                  No spam · unsubscribe with one click
                </p>
              </form>
            </motion.div>
          </div>
        </Card>
      </section>

      {/* CHARACTERS */}
      <section className="container-page section-y">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {[
            { name: 'Rilo', role: 'the curious explorer', color: '#FF9A3C', icon: '🦊' },
            { name: 'Rivy', role: 'the supportive guide', color: '#FF5F6D', icon: '🐰' },
          ].map((char) => (
            <motion.div key={char.name} variants={itemVariants} whileHover={{ scale: 1.01 }} className="group">
              <Card className="p-8 sm:p-12 rounded-3xl bg-white border border-black/[0.07] h-full flex flex-col items-center text-center overflow-hidden relative hover:shadow-lg transition-shadow">
                <div className="absolute top-0 left-0 w-full h-1.5" style={{ backgroundColor: char.color }} />
                <div
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center mb-5 sm:mb-6 group-hover:scale-110 transition-transform duration-500 text-5xl"
                  style={{ backgroundColor: char.color + '20' }}
                >
                  {char.icon}
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-[#0a0a0a] mb-1">{char.name}</h3>
                <p className="text-sm sm:text-base text-[#525252] italic">{char.role}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="container-page section-y">
        <motion.div variants={itemVariants} className="text-center mb-10 sm:mb-12">
          <Badge className="bg-[#FF5F6D]/12 text-[#0a0a0a] border border-[#FF5F6D]/30 rounded-full px-3 py-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest mb-3">
            <Heart className="w-3 h-3 mr-1 inline-block fill-[#FF5F6D] text-[#FF5F6D]" /> Loved by families
          </Badge>
          <h2 className="fluid-h1 font-bold text-[#0a0a0a]">Why parents love Hue Whimsy</h2>
        </motion.div>

        {testimonialsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-48 rounded-3xl bg-black/[0.04] animate-pulse" />
            ))}
          </div>
        ) : testimonials.length === 0 ? (
          <p className="text-center text-[#525252]">Customer reviews coming soon.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {testimonials.slice(0, 3).map((t) => (
              <motion.div key={t.id} variants={itemVariants}>
                <Card className="p-6 sm:p-7 rounded-3xl bg-white border border-black/[0.07] h-full hover:shadow-md transition-shadow text-left relative">
                  <div className="absolute top-4 left-5 sm:top-5 sm:left-6 text-5xl sm:text-6xl leading-none text-[#FFD93D]/30 font-serif select-none">
                    &ldquo;
                  </div>
                  <p className="text-[#404040] text-sm sm:text-base leading-relaxed pt-4 mb-5 sm:mb-6 italic">
                    {t.quote}
                  </p>
                  <div className="flex items-center gap-3 pt-3 border-t border-black/[0.06]">
                    {t.avatar ? (
                      <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF5F6D]/20 to-[#B067FF]/20 flex items-center justify-center font-bold text-[#0a0a0a]">
                        {t.name.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-[#0a0a0a] font-bold text-sm truncate">{t.name}</p>
                      {t.role && <p className="text-[11px] text-[#525252] truncate">{t.role}</p>}
                    </div>
                    {t.rating && (
                      <div className="flex gap-0.5 shrink-0">
                        {[...Array(t.rating)].map((_, j) => (
                          <Star key={j} className="w-3 h-3 fill-[#FFD93D] text-[#FFD93D]" />
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* SERVICES PREVIEW */}
      <section className="container-page section-y">
        <div className="surface-soft rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 lg:p-16">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
            <div className="flex-1 space-y-4 sm:space-y-5 text-center lg:text-left">
              <Badge className="bg-[#B067FF]/15 text-[#B067FF] border border-[#B067FF]/30 rounded-full px-3 py-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest">
                For Parents &amp; Creators
              </Badge>
              <h2 className="fluid-h1 font-bold text-[#0a0a0a]">For Parents and Creators</h2>
              <p className="fluid-lead text-[#525252] max-w-md mx-auto lg:mx-0">
                Custom illustration, book design, classroom kits — we help bring your own creative
                dreams to life.
              </p>
              <NavLink
                to="/services"
                className={cn(
                  buttonVariants(),
                  'rounded-full px-7 bg-[#0a0a0a] text-white font-semibold hover:bg-black transition-all',
                )}
                style={{ height: '3rem' }}
              >
                Explore Services <ArrowRight className="ml-2 w-4 h-4" />
              </NavLink>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {[Palette, Laptop, BookOpen, Sparkles].map((Icon, i) => (
                <div
                  key={i}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-white flex items-center justify-center border border-black/[0.07] shadow-sm"
                >
                  <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-[#525252]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="container-page section-y-lg text-center">
        <motion.div variants={itemVariants} className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
          <h2 className="fluid-display font-bold text-[#0a0a0a]">Join the Hue Whimsy world</h2>
          <p className="fluid-lead text-[#525252] max-w-2xl mx-auto">
            Books that feel like a hug, free printables that feel like a gift, and a small studio
            that answers every email.
          </p>
          <NavLink
            to="/library"
            className="inline-flex items-center justify-center rounded-full px-8 sm:px-12 font-semibold text-base sm:text-lg bg-gradient-to-r from-[#FF5F6D] via-[#FF9A3C] to-[#B067FF] text-white hover:opacity-95 transition-all shadow-[0_16px_40px_-12px_rgba(176,103,255,0.55)]"
            style={{ height: '3.5rem' }}
          >
            Start the Adventure <ArrowRight className="ml-2 w-5 h-5" />
          </NavLink>
        </motion.div>
      </section>
    </motion.div>
  );
};
