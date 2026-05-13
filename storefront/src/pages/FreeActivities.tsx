import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { useRainbow } from '@/components/RainbowContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Image as ImageIcon, Palette, Star, ArrowRight, Mail } from 'lucide-react';
import { Input } from '@/components/ui/input';

export const FreeActivities: React.FC = () => {
  const { setIntensity } = useRainbow();

  useEffect(() => {
    setIntensity(0.65); // Playful intensity
    return () => setIntensity(0.7);
  }, []);

  const activities = [
    { title: 'Alphabet Coloring Pack', pages: 26, category: 'Coloring', icon: Palette },
    { title: 'Rilo & Rivy Welcome Set', pages: 10, category: 'Activity', icon: Star },
    { title: 'Phonics Flashcards', pages: 52, category: 'Learning', icon: FileText },
    { title: 'Creative Drawing Prompts', pages: 15, category: 'Creativity', icon: ImageIcon },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 py-12 md:py-24"
    >
      <section className="text-center mb-16">
        <Badge className="bg-[#FFD93D] text-black mb-4">Free Printables</Badge>
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">Unleash the Magic</h1>
        <p className="text-[#B8BEC6] text-lg max-w-2xl mx-auto">
          Download our exclusive activity packs to start your Hue Whimsy adventure today. Perfect for home or the classroom.
        </p>
      </section>

      {/* Activities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
        {activities.map((activity, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all group cursor-pointer overflow-hidden">
              <CardContent className="p-0 flex flex-col md:flex-row">
                <div className="w-full md:w-48 bg-white/5 flex items-center justify-center p-8">
                  <activity.icon className="w-16 h-16 text-[#B8BEC6] group-hover:text-[#FFD93D] transition-colors" />
                </div>
                <div className="p-8 flex flex-col justify-center gap-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] uppercase font-bold text-[#B8BEC6] border-white/20">
                      {activity.category}
                    </Badge>
                    <span className="text-xs text-[#B8BEC6]">{activity.pages} Pages</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white">{activity.title}</h3>
                  <Button className="w-fit rounded-full bg-white text-black hover:bg-[#F5F5F5]">
                    <Download className="w-4 h-4 mr-2" /> Download PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Social proof / Signup */}
      <Card className="rounded-[3rem] border-white/10 bg-black/40 backdrop-blur-3xl p-12 text-center max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-white mb-4">Never Miss a Packet</h2>
        <p className="text-[#B8BEC6] mb-8">Join our newsletter to receive new free activities directly in your inbox every month.</p>
        <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
          <Input placeholder="Email address" className="rounded-full bg-white/5 border-white/10 text-white" />
          <Button className="rounded-full bg-gradient-to-r from-[#FF5F6D] to-[#B067FF] text-white px-8">
            Join the Club
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};
