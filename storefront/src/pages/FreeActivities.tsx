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
    <div className="container-page section-y">
      <SEO
        title="Free Printable Activities"
        description="Free coloring pages, alphabet flashcards, and drawing prompts for kids aged 3-8. Print at home, anytime."
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10 sm:mb-14 max-w-3xl mx-auto"
      >
        <Badge className="bg-[#FFD93D]/20 text-[#0a0a0a] border border-[#FFD93D]/40 rounded-full px-3 py-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest mb-4">
          100% Free Printables
        </Badge>
        <h1 className="fluid-h1 font-bold text-[#0a0a0a] mb-4 sm:mb-5">Free Activities</h1>
        <p className="fluid-lead text-[#525252]">
          Coloring pages, alphabet flashcards, and drawing prompts your kids will love. Print at home, anytime.
        </p>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-16 sm:mb-20">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-72 rounded-3xl bg-black/[0.04] animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 mb-16">
          <p className="text-xl sm:text-2xl text-[#525252] mb-4">🎨 New activities coming soon</p>
          <p className="text-sm text-[#525252]">Subscribe below to get notified when we publish new printables.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-16 sm:mb-20">
          {items.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="overflow-hidden border border-black/[0.07] bg-white shadow-sm hover:shadow-lg hover:border-black/[0.15] transition-all h-full flex flex-col rounded-3xl">
                <CardContent className="p-0 flex-1 flex flex-col">
                  <div className="aspect-square bg-gradient-to-br from-[#FF5F6D]/8 via-[#FFD93D]/8 to-[#4DA8FF]/8 flex items-center justify-center overflow-hidden">
                    {a.thumbnail ? (
                      <img
                        src={a.thumbnail}
                        alt={a.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-5xl sm:text-6xl">🎨</span>
                    )}
                  </div>
                  <div className="p-4 sm:p-5 flex-1 flex flex-col">
                    <div className="flex items-center gap-1.5 mb-2 sm:mb-3 flex-wrap">
                      {a.category && (
                        <Badge variant="secondary" className="bg-black/[0.04] text-[#525252] text-[10px] sm:text-xs">
                          {a.category}
                        </Badge>
                      )}
                      {a.age_range && (
                        <Badge variant="secondary" className="bg-[#FFD93D]/15 text-[#0a0a0a] border border-[#FFD93D]/30 text-[10px] sm:text-xs">
                          Age {a.age_range}
                        </Badge>
                      )}
                      {a.requires_subscription && (
                        <Badge className="bg-[#B067FF]/15 text-[#B067FF] border border-[#B067FF]/30 text-[10px] sm:text-xs">
                          <Lock className="w-3 h-3 mr-1" />
                          Subscribe
                        </Badge>
                      )}
                    </div>
                    <h2 className="text-sm sm:text-base font-bold text-[#0a0a0a] mb-1 sm:mb-2 leading-tight line-clamp-2">{a.title}</h2>
                    {a.description && (
                      <p className="text-xs sm:text-sm text-[#525252] mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3 flex-1">{a.description}</p>
                    )}
                    {a.pages && <p className="text-[10px] sm:text-xs text-[#525252] mb-3">{a.pages} pages</p>}
                    <Button
                      onClick={() => handleDownload(a)}
                      className="w-full rounded-full bg-gradient-to-r from-[#FF5F6D] to-[#B067FF] text-white font-semibold hover:opacity-95 h-10 sm:h-11 text-xs sm:text-sm shadow-[0_4px_16px_-4px_rgba(255,95,109,0.4)]"
                    >
                      {a.requires_subscription && !a.file_url ? (
                        <>
                          <Lock className="w-3.5 h-3.5 mr-1.5" /> Subscribe
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5 mr-1.5" /> Download
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
      <Card className="rounded-[2rem] sm:rounded-[2.5rem] border border-black/[0.07] bg-gradient-to-br from-[#FF5F6D]/8 via-[#FFD93D]/8 to-[#4DA8FF]/8 p-6 sm:p-10 lg:p-14 max-w-4xl mx-auto text-center">
        {subStatus === 'ok' ? (
          <>
            <CheckCircle2 className="w-14 h-14 sm:w-16 sm:h-16 mx-auto text-[#5BE37D] mb-3 sm:mb-4" />
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0a0a0a] mb-2">You're in!</h2>
            <p className="text-sm sm:text-base text-[#525252]">Check your inbox — we'll send the welcome pack and new activities as they go live.</p>
          </>
        ) : (
          <>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0a0a0a] mb-3 sm:mb-4">
              Get free activities by email
            </h2>
            <p className="text-sm sm:text-base text-[#525252] mb-6 sm:mb-8 max-w-md mx-auto">
              One email a week. Brand new coloring pages, flashcards, and seasonal printables — never spam.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 sm:gap-3 max-w-md mx-auto">
              <Input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white border-black/10 rounded-full px-5 sm:px-6 h-12 sm:h-13 focus-visible:ring-2 focus-visible:ring-[#FFD93D]/40 focus-visible:border-[#FFD93D]"
              />
              <Button
                type="submit"
                disabled={subStatus === 'sending'}
                className="rounded-full bg-gradient-to-r from-[#FF5F6D] to-[#B067FF] text-white px-6 sm:px-8 h-12 sm:h-13 font-semibold whitespace-nowrap shadow-[0_8px_24px_-8px_rgba(255,95,109,0.5)]"
              >
                {subStatus === 'sending' ? 'Joining…' : '🎁 Send My Pack'}
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
