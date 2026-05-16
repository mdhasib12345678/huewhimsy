import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { useRainbow } from '@/components/RainbowContext';
import { listServices, formatPrice, type ServiceOffering } from '@/lib/medusa';

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
    <div className="container mx-auto px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <Badge className="bg-[#B067FF] text-white mb-4">FOR PARENTS &amp; CREATORS</Badge>
        <h1 className="text-5xl md:text-7xl font-bold text-[#0a0a0a] mb-6">Services We Offer</h1>
        <p className="text-xl text-[#525252] max-w-3xl mx-auto">
          We help authors, brands and educators bring their own creative dreams to life — from
          custom illustrations to full website builds.
        </p>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-72 rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-2xl text-[#525252] mb-4">🛠️ Services coming soon</p>
          <p className="text-[#525252]">We're polishing our offerings. Reach out via the contact page to discuss custom work.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <Card className="border-black/10 bg-white shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
                  <CardHeader>
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                      style={{ backgroundColor: color + '20' }}
                    >
                      <Sparkles className="w-6 h-6" style={{ color }} />
                    </div>
                    <CardTitle className="text-2xl text-[#0a0a0a]">{service.name}</CardTitle>
                    {service.short_description && (
                      <CardDescription className="text-[#525252]">
                        {service.short_description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    {service.features && service.features.length > 0 && (
                      <ul className="space-y-2 mb-6">
                        {service.features.slice(0, 5).map((f) => (
                          <li key={f} className="flex items-start gap-2 text-sm text-[#525252]">
                            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color }} />
                            {f}
                          </li>
                        ))}
                      </ul>
                    )}

                    {tiers.length > 0 && (
                      <div className="mt-auto space-y-2 pt-4 border-t border-black/10">
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
                      className="mt-6 w-full rounded-full bg-gradient-to-r from-[#FF5F6D] to-[#B067FF] text-white hover:opacity-90"
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
