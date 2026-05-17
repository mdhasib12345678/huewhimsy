import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, Lock, CheckCircle2 } from 'lucide-react';
import { useRainbow } from '@/components/RainbowContext';
import { listActivities, subscribeNewsletter, type FreeActivity } from '@/lib/medusa';
import { SEO } from '@/components/SEO';

export const FreeActivities: React.FC = () => {
  const { setIntensity } = useRainbow();
  const [items, setItems] = useState<FreeActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [subStatus, setSubStatus] = useState<'idle' | 'sending' | 'ok' | 'err'>('idle');

  useEffect(() => {
    setIntensity(0.5);
    return () => setIntensity(0.7);
  }, []);

  useEffect(() => {
    void listActivities({ limit: 30 })
      .then((res) => setItems(res.activities))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubStatus('sending');
    try {
      await subscribeNewsletter({ email, source: 'free_activities' });
      setSubStatus('ok');
      setEmail('');
    } catch {
      setSubStatus('err');
    }
  };

  const handleDownload = (activity: FreeActivity) => {
    if (activity.requires_subscription && !activity.file_url) {
      // Gated — show subscribe gate
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      return;
    }
    if (activity.file_url) {
      window.open(activity.file_url, '_blank');
    }
  };

  return (
    <div className="container mx-auto px-4 py-20">
      <SEO
        title="Free Printable Activities"
        description="Free coloring pages, alphabet flashcards, and drawing prompts for kids aged 3-8. Print at home, anytime."
      />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
        <Badge className="bg-[#FFD93D] text-[#0a0a0a] mb-4">100% FREE PRINTABLES</Badge>
        <h1 className="text-5xl md:text-7xl font-bold text-[#0a0a0a] mb-4">Free Activities</h1>
        <p className="text-xl text-[#525252] max-w-2xl mx-auto">
          Coloring pages, alphabet flashcards, and drawing prompts your kids will love. Print at home, anytime.
        </p>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-80 rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 mb-20">
          <p className="text-2xl text-[#525252] mb-4">🎨 New activities coming soon</p>
          <p className="text-[#525252]">Subscribe below to get notified when we publish new printables.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {items.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="overflow-hidden border-black/10 bg-white shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
                <CardContent className="p-0 flex-1 flex flex-col">
                  <div className="aspect-square bg-gradient-to-br from-[#FF5F6D]/10 via-[#FFD93D]/10 to-[#4DA8FF]/10 flex items-center justify-center overflow-hidden">
                    {a.thumbnail ? (
                      <img src={a.thumbnail} alt={a.title} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <span className="text-6xl">🎨</span>
                    )}
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      {a.category && (
                        <Badge variant="secondary" className="bg-[#F5F5F5] text-[#525252]">
                          {a.category}
                        </Badge>
                      )}
                      {a.age_range && (
                        <Badge variant="secondary" className="bg-[#FFD93D]/20 text-[#0a0a0a]">
                          Age {a.age_range}
                        </Badge>
                      )}
                      {a.requires_subscription && (
                        <Badge className="bg-[#B067FF]/20 text-[#B067FF]">
                          <Lock className="w-3 h-3 mr-1" />
                          Subscribe
                        </Badge>
                      )}
                    </div>
                    <h2 className="text-xl font-bold text-[#0a0a0a] mb-2">{a.title}</h2>
                    {a.description && <p className="text-sm text-[#525252] mb-4 flex-1">{a.description}</p>}
                    {a.pages && <p className="text-xs text-[#525252] mb-4">{a.pages} pages</p>}
                    <Button
                      onClick={() => handleDownload(a)}
                      className="w-full rounded-full bg-gradient-to-r from-[#FF5F6D] to-[#B067FF] text-white font-bold hover:opacity-90"
                    >
                      {a.requires_subscription && !a.file_url ? (
                        <>
                          <Lock className="w-4 h-4 mr-2" /> Subscribe to unlock
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" /> Download
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Subscribe gate / newsletter CTA */}
      <Card className="rounded-[3rem] border-black/10 bg-gradient-to-br from-[#FF5F6D]/10 via-[#FFD93D]/10 to-[#4DA8FF]/10 p-12 max-w-4xl mx-auto text-center">
        {subStatus === 'ok' ? (
          <>
            <CheckCircle2 className="w-16 h-16 mx-auto text-[#5BE37D] mb-4" />
            <h2 className="text-3xl font-bold text-[#0a0a0a] mb-2">You're in!</h2>
            <p className="text-[#525252]">Check your inbox — we'll send the welcome pack and new activities as they go live.</p>
          </>
        ) : (
          <>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0a0a0a] mb-4">
              Get free activities by email
            </h2>
            <p className="text-[#525252] mb-8">
              One email a week. Brand new coloring pages, flashcards, and seasonal printables — never spam.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white border-gray-300 rounded-full px-6 h-14 focus:ring-2 focus:ring-[#FFD93D]"
              />
              <Button
                type="submit"
                disabled={subStatus === 'sending'}
                className="rounded-full bg-gradient-to-r from-[#FF5F6D] to-[#B067FF] text-white px-8 h-14 font-bold whitespace-nowrap shadow-md"
              >
                {subStatus === 'sending' ? 'Joining...' : '🎁 Send My Pack'}
              </Button>
            </form>
            {subStatus === 'err' && (
              <p className="text-sm text-red-600 mt-4">Something went wrong. Please try again.</p>
            )}
          </>
        )}
      </Card>
    </div>
  );
};
