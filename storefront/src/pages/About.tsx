import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Heart, Star, Sparkles, Smile } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useRainbow } from '@/components/RainbowContext';
import { getPage, type StaticPage } from '@/lib/medusa';

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
    <div className="container mx-auto px-4 py-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-20 max-w-3xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-bold text-[#0a0a0a] mb-8">
          {page?.title ?? 'About Hue Whimsy'}
        </h1>
        {loading ? (
          <div className="h-24 bg-gray-100 animate-pulse rounded" />
        ) : page ? (
          <div
            className="text-xl text-[#525252] leading-relaxed [&_p]:mb-4 [&_a]:text-[#FF5F6D] [&_a]:underline"
            dangerouslySetInnerHTML={{ __html: page.body }}
          />
        ) : (
          <p className="text-xl text-[#525252] leading-relaxed">{fallbackBody}</p>
        )}
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
        {VALUES.map((v, i) => (
          <motion.div
            key={v.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="p-8 text-center border-black/10 bg-white shadow-sm h-full">
              <div
                className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center"
                style={{ backgroundColor: v.color + '20' }}
              >
                <v.icon className="w-8 h-8" style={{ color: v.color }} />
              </div>
              <h3 className="text-xl font-bold text-[#0a0a0a] mb-2">{v.title}</h3>
              <p className="text-sm text-[#525252]">{v.desc}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="rounded-[3rem] p-12 md:p-16 border-black/10 bg-gradient-to-br from-[#FF5F6D]/10 via-[#FFD93D]/10 to-[#4DA8FF]/10 max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-[#0a0a0a] mb-4">Want to work with us?</h2>
        <p className="text-[#525252] mb-8">
          Custom illustrations, licensing inquiries, or just want to say hi — we'd love to hear from you.
        </p>
        <a
          href="/contact"
          className="inline-block rounded-full bg-gradient-to-r from-[#FF5F6D] to-[#B067FF] text-white px-10 py-4 font-bold hover:opacity-90 transition-opacity shadow-md"
        >
          Get in touch
        </a>
      </Card>
    </div>
  );
};
