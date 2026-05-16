import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { useRainbow } from '@/components/RainbowContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, ArrowRight } from 'lucide-react';

export const Blog: React.FC = () => {
  const { setIntensity } = useRainbow();

  useEffect(() => {
    setIntensity(0.4); // Calm intensity
    return () => setIntensity(0.7);
  }, []);

  const posts = [
    { title: 'The Power of Coloring: Why it matters for ages 3-8', category: 'Learning', date: 'May 10, 2024', readTime: '5 min' },
    { title: 'Phonics Fun: Making the alphabet stay', category: 'Phonics', date: 'May 8, 2024', readTime: '7 min' },
    { title: 'Creative Morning Routines for Homeschooling', category: 'Parenting', date: 'May 5, 2024', readTime: '4 min' },
    { title: 'How to use Rilo and Rivy in the classroom', category: 'Teaching', date: 'May 2, 2024', readTime: '6 min' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 py-12 md:py-24"
    >
      <section className="mb-20">
        <h1 className="text-4xl md:text-6xl font-bold text-[#0a0a0a] mb-6">Hue Whimsy Insights</h1>
        <p className="text-[#525252] text-lg max-w-2xl">
          Exploration, education, and creativity tips for parents and teachers.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-black/10 bg-black/5 backdrop-blur-xl hover:bg-black/5 transition-all cursor-pointer h-full flex flex-col group overflow-hidden">
              <div className="aspect-video bg-black/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent group-hover:scale-110 transition-transform duration-500" />
                <Badge className="absolute top-4 left-4 bg-black/5 text-[#0a0a0a] backdrop-blur-md border-black/20">
                  {post.category}
                </Badge>
              </div>
              <CardContent className="p-8 flex flex-col flex-grow">
                <div className="flex items-center gap-4 text-[10px] uppercase font-bold tracking-widest text-[#525252] mb-4">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {post.date}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readTime}</span>
                </div>
                <h3 className="text-2xl font-bold text-[#0a0a0a] mb-6 group-hover:text-[#FFD93D] transition-colors leading-tight">
                  {post.title}
                </h3>
                <div className="mt-auto">
                  <Button variant="ghost" className="p-0 text-[#0a0a0a] hover:bg-transparent hover:text-[#FFD93D] group">
                    Read More <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
