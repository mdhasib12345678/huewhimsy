import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { useRainbow } from '@/components/RainbowContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, MessageCircle, Phone, MapPin, Send } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export const Contact: React.FC = () => {
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
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="space-y-12">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">Let's Connect</h1>
              <p className="text-xl text-[#B8BEC6] leading-relaxed">
                Whether you have a question about our books, a suggestion for Rilo and Rivy, 
                or just want to say hi—we'd love to hear from you.
              </p>
            </div>

            <div className="space-y-8">
              {[
                { icon: Mail, label: 'Email', val: 'hello@huewhimsy.com' },
                { icon: Phone, label: 'Phone', val: '+1 (555) HUE-WHIMSY' },
                { icon: MessageCircle, label: 'Support', val: 'Available 24/7' },
                { icon: MapPin, label: 'Location', val: 'Global Studio' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-6 group">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <item.icon className="w-5 h-5 text-[#FFD93D]" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest font-bold text-[#B8BEC6]">{item.label}</p>
                    <p className="text-lg text-white font-medium">{item.val}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Card className="border-white/10 bg-white/5 backdrop-blur-3xl overflow-hidden p-8 md:p-12">
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-white">Your Name</Label>
                  <Input placeholder="Riffy Panda" className="bg-white/5 border-white/10 text-white h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Email Address</Label>
                  <Input type="email" placeholder="riffy@magic.com" className="bg-white/5 border-white/10 text-white h-12 rounded-xl" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-white">How can we help?</Label>
                <Input placeholder="General Inquiry" className="bg-white/5 border-white/10 text-white h-12 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Message</Label>
                <Textarea placeholder="Tell us your story..." className="bg-white/5 border-white/10 text-white min-h-[150px] rounded-xl" />
              </div>
              <Button className="w-full rounded-full h-14 text-lg font-bold bg-white text-black hover:bg-[#F5F5F5] transition-all hover:scale-[1.01] active:scale-[0.99]">
                Send Message <Send className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};
