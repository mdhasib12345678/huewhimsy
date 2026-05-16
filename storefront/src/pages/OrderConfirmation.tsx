import React, { useEffect, useState } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import { CheckCircle2, Package } from 'lucide-react';
import { motion } from 'motion/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRainbow } from '@/components/RainbowContext';

// Lightweight order-status page. Reads order id from URL; full order details
// come from /store/orders/:id (Medusa OOB) — to be wired in Phase 9 when
// Stripe is live and we want richer order data here.
export const OrderConfirmation: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { setIntensity } = useRainbow();
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    setIntensity(0.8);
    const t = setTimeout(() => setShowConfetti(false), 4000);
    return () => {
      clearTimeout(t);
      setIntensity(0.7);
    };
  }, []);

  return (
    <div className="container mx-auto px-4 py-20 max-w-2xl text-center">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', duration: 0.8 }}>
        <div className="w-24 h-24 rounded-full bg-[#5BE37D]/20 flex items-center justify-center mx-auto mb-8">
          <CheckCircle2 className="w-12 h-12 text-[#5BE37D]" />
        </div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-4xl md:text-6xl font-bold text-[#0a0a0a] mb-4"
      >
        Order received! 🎉
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-xl text-[#525252] mb-8"
      >
        Thanks for your purchase! A confirmation email is on its way.
      </motion.p>

      {id && (
        <Card className="p-6 border-black/10 bg-white shadow-sm mb-8 text-left">
          <p className="text-xs uppercase tracking-widest text-[#525252] mb-2">Order ID</p>
          <p className="font-mono text-sm break-all text-[#0a0a0a]">{id}</p>
        </Card>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <NavLink
          to="/account/orders"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#FF5F6D] to-[#B067FF] text-white px-6 py-3 font-bold hover:opacity-90 shadow-md"
        >
          <Package className="w-4 h-4" /> View my orders
        </NavLink>
        <NavLink
          to="/shop"
          className="inline-flex items-center justify-center rounded-full bg-white text-[#0a0a0a] border border-black/10 px-6 py-3 font-bold hover:bg-[#F5F5F5]"
        >
          Keep shopping
        </NavLink>
      </div>
    </div>
  );
};
