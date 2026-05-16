import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { useRainbow } from '@/components/RainbowContext';
import { Heart, Star, Sparkles, Smile } from 'lucide-react';

export const About: React.FC = () => {
  const { setIntensity } = useRainbow();

  useEffect(() => {
    setIntensity(0.5);
    return () => setIntensity(0.7);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 py-12 md:py-24"
    >
      <div className="max-w-4xl mx-auto space-y-20">
        <section className="text-center space-y-6">
          <h1 className="text-5xl md:text-7xl font-bold text-[#0a0a0a] tracking-tight">The Hue Whimsy Story</h1>
          <p className="text-xl text-[#525252] leading-relaxed">
            Hue Whimsy was born from a simple belief: that learning should feel like a warm hug. 
            We created Rilo and Rivy to be more than just characters on a page—they are companions for your child's 
            most important developmental years.
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-[#0a0a0a]">Our Mission</h2>
            <p className="text-[#525252] leading-relaxed">
              We aim to bridge the gap between education and imagination. By combining structured alphabet learning with 
              free-form creative coloring, we help children aged 3 to 8 develop essential literacy skills while 
              nurturing their artistic soul.
            </p>
          </div>
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-[#0a0a0a]">The Creators</h2>
            <p className="text-[#525252] leading-relaxed">
              Our team consists of early childhood educators, professional illustrators, and parents who wanted 
              something better for their own families. Every book and activity we release is vetted for 
              quality, warmth, and educational value.
            </p>
          </div>
        </div>

        <section className="bg-black/5 border border-black/10 rounded-[3rem] p-12 text-center">
            <h3 className="text-2xl font-bold text-[#0a0a0a] mb-8">Why Rilo & Rivy?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: Heart, t: 'Warmth', d: 'Emotional connection first' },
                { icon: Star, t: 'Magic', d: 'Wonder in every lesson' },
                { icon: Sparkles, t: 'Creative', d: 'Colors that tell stories' },
                { icon: Smile, t: 'Trusted', d: 'Safe, premium quality' },
              ].map((v, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <v.icon className="w-8 h-8 text-[#FFD93D] mb-2" />
                  <h4 className="font-bold text-[#0a0a0a]">{v.t}</h4>
                  <p className="text-xs text-[#525252]">{v.d}</p>
                </div>
              ))}
            </div>
        </section>
      </div>
    </motion.div>
  );
};
