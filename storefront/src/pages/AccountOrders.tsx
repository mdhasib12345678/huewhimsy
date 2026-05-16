import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Package, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRainbow } from '@/components/RainbowContext';
import { listCustomerOrders, formatPrice, type MedusaOrder } from '@/lib/medusa';

export const AccountOrders: React.FC = () => {
  const { user, authLoading } = useRainbow();
  const [orders, setOrders] = useState<MedusaOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    void listCustomerOrders(50)
      .then(setOrders)
      .finally(() => setLoading(false));
  }, [user]);

  if (!authLoading && !user) {
    return (
      <div className="container mx-auto px-4 py-32 text-center max-w-md">
        <Package className="w-16 h-16 mx-auto text-[#525252] mb-6" />
        <h1 className="text-3xl font-bold text-[#0a0a0a] mb-4">Sign in to view orders</h1>
        <NavLink
          to="/account"
          className="inline-block rounded-full bg-gradient-to-r from-[#FF5F6D] to-[#B067FF] text-white px-8 py-3 font-bold hover:opacity-90 transition-opacity shadow-md"
        >
          Sign in
        </NavLink>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-20 max-w-4xl">
      <h1 className="text-4xl md:text-5xl font-bold text-[#0a0a0a] mb-2">Your Orders</h1>
      <p className="text-[#525252] mb-12">All your past purchases and current shipments.</p>

      {loading ? (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <Card className="p-12 text-center border-black/10 bg-white shadow-sm">
          <Package className="w-12 h-12 mx-auto text-[#525252] mb-4" />
          <h2 className="text-xl font-bold text-[#0a0a0a] mb-2">No orders yet</h2>
          <p className="text-[#525252] mb-6">When you make your first purchase, it'll show up here.</p>
          <NavLink
            to="/shop"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#FF5F6D] to-[#B067FF] text-white px-6 py-3 font-bold hover:opacity-90 transition-opacity shadow-md"
          >
            Browse shop <ArrowRight className="w-4 h-4" />
          </NavLink>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <NavLink key={o.id} to={`/order/${o.id}`}>
              <Card className="p-6 border-black/10 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-[#0a0a0a]">
                        Order #{o.display_id ?? o.id.slice(-8)}
                      </h3>
                      <Badge
                        className={
                          o.payment_status === 'captured' || o.payment_status === 'authorized'
                            ? 'bg-[#5BE37D]/20 text-[#0a0a0a]'
                            : 'bg-[#FFD93D]/20 text-[#0a0a0a]'
                        }
                      >
                        {o.status}
                      </Badge>
                      {o.fulfillment_status && (
                        <Badge variant="secondary">{o.fulfillment_status}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-[#525252]">
                      {new Date(o.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-[#0a0a0a]">
                      {formatPrice(o.total, o.currency_code?.toUpperCase() ?? 'USD')}
                    </p>
                    <p className="text-xs text-[#525252] flex items-center gap-1 justify-end mt-1">
                      View details <ArrowRight className="w-3 h-3" />
                    </p>
                  </div>
                </div>
              </Card>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
};
