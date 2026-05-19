import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Heart, Star, Sparkles, Smile } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useRainbow } from '@/components/RainbowContext';
import { getPage, type StaticPage } from '@/lib/medusa';
import { SEO } from '@/components/SEO';

const VALUES = [
  { icon: Heart, title: 'Made with Love', desc: 'Hand-illustrated by our small team, never AI-generated art.', color: '#FF5F6D' },
  { icon: Star, title: 'Kid-First', desc: 'Designed by parents, tested by kids aged 3-8.', color: '#FFD93D' },
  { icon: Sparkles, title: 'Always Whimsical', desc: 'Curiosity and joy in every page — phonics that feels like play.', color: '#B067FF' },
  { icon: Smile, title: 'Cozy Learning', desc: 'No screens needed. Books, crayons, and imagination — the trio that works.', color: '#5BE37D' },
];

export const About: React.FC = () => {
  const { setIntensity } = useRainbow();
  const [page, setPage] = useState<StaticPage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIntensity(0.4);
    return () => setIntensity(0.7);
  }, []);

  useEffect(() => {
    void getPage('about')
      .then(setPage)
      .finally(() => setLoading(false));
  }, []);

  const fallbackBody =
    'Hue Whimsy is a small studio crafting whimsical books, free printables, and cozy creative supplies for children aged 3 to 8. Every illustration is hand-drawn, every story is told from a place of curiosity, and every product is something we would proudly hand to our own kids.';

  return (
    <div className="container-page section-y">
      <SEO
        title="About HueWhimsy — Whimsical Books for Children"
        description="A small studio crafting whimsical children's books, free printables, and creative supplies. Hand-illustrated, kid-first, cozy learning."
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12 sm:mb-16 max-w-3xl mx-auto"
      >
        <h1 className="fluid-h1 font-bold text-[#0a0a0a] mb-5 sm:mb-7">
          {page?.title ?? 'About Hue Whimsy'}
        </h1>
        {loading ? (
          <div className="h-24 bg-black/[0.04] animate-pulse rounded" />
        ) : page ? (
          <div
            className="fluid-lead text-[#525252] leading-relaxed [&_p]:mb-4 [&_a]:text-[#FF5F6D] [&_a]:underline [&_h2]:fluid-h2 [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-4 [&_h2]:text-[#0a0a0a] [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:text-left [&_ul]:max-w-md [&_ul]:mx-auto"
            dangerouslySetInnerHTML={{ __html: page.body }}
          />
        ) : (
          <p className="fluid-lead text-[#525252] leading-relaxed">{fallbackBody}</p>
        )}
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-12 sm:mb-16">
        {VALUES.map((v, i) => (
          <motion.div
            key={v.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="p-5 sm:p-7 text-center border border-black/[0.07] bg-white shadow-sm hover:shadow-md transition-shadow h-full rounded-3xl">
              <div
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl mx-auto mb-4 sm:mb-5 flex items-center justify-center"
                style={{ backgroundColor: v.color + '20' }}
              >
                <v.icon className="w-6 h-6 sm:w-7 sm:h-7" style={{ color: v.color }} />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#0a0a0a] mb-1.5 sm:mb-2">{v.title}</h3>
              <p className="text-xs sm:text-sm text-[#525252] leading-relaxed">{v.desc}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="rounded-[2rem] sm:rounded-[2.5rem] p-8 sm:p-12 lg:p-16 border border-black/[0.07] bg-gradient-to-br from-[#FF5F6D]/8 via-[#FFD93D]/8 to-[#4DA8FF]/8 max-w-4xl mx-auto text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0a0a0a] mb-3 sm:mb-4">Want to work with us?</h2>
        <p className="text-sm sm:text-base text-[#525252] mb-6 sm:mb-8 max-w-md mx-auto">
          Custom illustrations, licensing inquiries, or just want to say hi — we'd love to hear from you.
        </p>
        <a
          href="/contact"
          className="inline-block rounded-full bg-gradient-to-r from-[#FF5F6D] to-[#B067FF] text-white px-8 sm:px-10 py-3 sm:py-4 text-sm sm:text-base font-semibold hover:opacity-95 transition-opacity shadow-[0_8px_24px_-8px_rgba(255,95,109,0.5)]"
        >
          Get in touch
        </a>
      </Card>
    </div>
  );
};
