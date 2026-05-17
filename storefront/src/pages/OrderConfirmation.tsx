import React, { useEffect, useState } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import { CheckCircle2, Package, Mail } from 'lucide-react';
import { motion } from 'motion/react';
import { Card } from '@/components/ui/card';
import { useRainbow } from '@/components/RainbowContext';
import { formatPrice, type MedusaOrder } from '@/lib/medusa';

const MEDUSA_BACKEND_URL = (import.meta.env.VITE_MEDUSA_BACKEND_URL as string) || '';
const PUBLISHABLE_KEY = (import.meta.env.VITE_MEDUSA_PUBLISHABLE_KEY as string) || '';

async function fetchOrder(id: string): Promise<MedusaOrder | null> {
  try {
    const token =
      typeof localStorage !== 'undefined'
        ? localStorage.getItem('huewhimsy_auth_token')
        : null;
    const res = await fetch(
      `${MEDUSA_BACKEND_URL.replace(/\/$/, '')}/store/orders/${id}?fields=id,display_id,status,fulfillment_status,payment_status,total,subtotal,currency_code,created_at,email,*items`,
      {
        headers: {
          'x-publishable-api-key': PUBLISHABLE_KEY,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
      },
    );
    if (!res.ok) return null;
    const json = (await res.json()) as { order: MedusaOrder };
    return json.order;
  } catch {
    return null;
  }
}

export const OrderConfirmation: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { setIntensity } = useRainbow();
  const [order, setOrder] = useState<MedusaOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIntensity(0.8);
    return () => setIntensity(0.7);
  }, []);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    void fetchOrder(id).then((o) => {
      setOrder(o);
      setLoading(false);
    });
  }, [id]);

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

      {loading ? (
        <Card className="p-6 border-black/10 bg-white shadow-sm mb-8">
          <div className="h-6 bg-gray-100 animate-pulse rounded mb-3" />
          <div className="h-4 bg-gray-100 animate-pulse rounded" />
        </Card>
      ) : order ? (
        <Card className="p-6 border-black/10 bg-white shadow-sm mb-8 text-left">
          <div className="flex items-start justify-between mb-4 pb-4 border-b border-black/5">
            <div>
              <p className="text-xs uppercase tracking-widest text-[#525252] mb-1">Order</p>
              <p className="text-xl font-bold text-[#0a0a0a]">#{order.display_id ?? order.id.slice(-8)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-widest text-[#525252] mb-1">Total</p>
              <p className="text-xl font-bold text-[#0a0a0a]">
                {formatPrice(order.total, order.currency_code?.toUpperCase() ?? 'USD')}
              </p>
            </div>
          </div>

          {order.items && order.items.length > 0 && (
            <div className="space-y-2 mb-4 pb-4 border-b border-black/5">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <span className="text-[#0a0a0a]">
                    {item.product_title} × {item.quantity}
                  </span>
                  <span className="text-[#525252]">
                    {formatPrice(
                      (item.total ?? item.unit_price * item.quantity) as number,
                      order.currency_code?.toUpperCase() ?? 'USD',
                    )}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-[#525252]">
            <Mail className="w-4 h-4" />
            <span>Confirmation sent to {(order as any).email ?? 'your email'}</span>
          </div>
        </Card>
      ) : id ? (
        <Card className="p-6 border-black/10 bg-white shadow-sm mb-8 text-left">
          <p className="text-xs uppercase tracking-widest text-[#525252] mb-2">Order ID</p>
          <p className="font-mono text-sm break-all text-[#0a0a0a]">{id}</p>
          <p className="text-xs text-[#525252] mt-2">Full order details will appear once the payment is finalized.</p>
        </Card>
      ) : null}

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
