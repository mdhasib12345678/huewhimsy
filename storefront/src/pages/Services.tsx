import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { useRainbow } from '@/components/RainbowContext';
import { listServices, formatPrice, type ServiceOffering } from '@/lib/medusa';
import { SEO } from '@/components/SEO';

const ICON_PALETTE = ['#FF5F6D', '#FF9A3C', '#FFD93D', '#5BE37D', '#4DA8FF', '#6C63FF', '#B067FF'];

export const Services: React.FC = () => {
  const { setIntensity } = useRainbow();
  const [services, setServices] = useState<ServiceOffering[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIntensity(0.5);
    return () => setIntensity(0.7);
  }, []);

  useEffect(() => {
    void listServices()
      .then((res) => setServices(res.services))
      .catch(() => setServices([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container-page section-y">
      <SEO
        title="Services — Custom Books, Illustration, Web Design"
        description="Hire the HueWhimsy team for custom illustration, book design, website design, AI agent setup, and more. For authors, brands, and educators."
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10 sm:mb-14 max-w-3xl mx-auto"
      >
        <Badge className="bg-[#B067FF]/15 text-[#B067FF] border border-[#B067FF]/30 rounded-full px-3 py-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest mb-4">
          For Parents &amp; Creators
        </Badge>
        <h1 className="fluid-h1 font-bold text-[#0a0a0a] mb-4 sm:mb-5">Services We Offer</h1>
        <p className="fluid-lead text-[#525252]">
          We help authors, brands and educators bring their own creative dreams to life — from
          custom illustrations to full website builds.
        </p>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-72 rounded-3xl bg-black/[0.04] animate-pulse" />
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-xl sm:text-2xl text-[#525252] mb-4">🛠️ Services coming soon</p>
          <p className="text-[#525252]">We're polishing our offerings. Reach out via the contact page to discuss custom work.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {services.map((service, i) => {
            const color = ICON_PALETTE[i % ICON_PALETTE.length];
            const tiers = service.pricing_tiers ?? [];
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="border border-black/[0.07] bg-white shadow-sm hover:shadow-md hover:border-black/[0.15] transition-all h-full flex flex-col rounded-3xl">
                  <CardHeader className="p-6 sm:p-7">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                      style={{ backgroundColor: color + '20' }}
                    >
                      <Sparkles className="w-6 h-6" style={{ color }} />
                    </div>
                    <CardTitle className="text-xl sm:text-2xl font-bold text-[#0a0a0a]">{service.name}</CardTitle>
                    {service.short_description && (
                      <CardDescription className="text-[#525252] text-sm leading-relaxed">
                        {service.short_description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col px-6 sm:px-7 pb-6 sm:pb-7">
                    {service.features && service.features.length > 0 && (
                      <ul className="space-y-2 mb-5">
                        {service.features.slice(0, 5).map((f) => (
                          <li key={f} className="flex items-start gap-2 text-sm text-[#525252]">
                            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color }} />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {tiers.length > 0 && (
                      <div className="mt-auto space-y-2 pt-4 border-t border-black/[0.07]">
                        {tiers.map((tier) => (
                          <div key={tier.label} className="flex items-center justify-between text-sm">
                            <span className="text-[#525252]">{tier.label}</span>
                            <span className="font-bold text-[#0a0a0a]">
                              {formatPrice(tier.price_amount, tier.currency ?? 'USD')}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <Button
                      className="mt-5 w-full rounded-full bg-gradient-to-r from-[#FF5F6D] to-[#B067FF] text-white hover:opacity-95 h-11 font-semibold shadow-[0_6px_18px_-6px_rgba(255,95,109,0.5)]"
                      onClick={() => {
                        window.location.href = `/contact?service=${encodeURIComponent(service.slug)}`;
                      }}
                    >
                      Request a quote
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
