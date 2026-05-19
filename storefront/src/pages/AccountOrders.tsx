import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Package, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRainbow } from '@/components/RainbowContext';
import { listCustomerOrders, formatPrice, type MedusaOrder } from '@/lib/medusa';
import { cn } from '@/lib/utils';

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
      <div className="container-page section-y-lg text-center max-w-md">
        <Package className="w-12 sm:w-14 h-12 sm:h-14 mx-auto text-[#525252] mb-5" />
        <h1 className="text-2xl sm:text-3xl font-bold text-[#0a0a0a] mb-4">Sign in to view orders</h1>
        <NavLink
          to="/account"
          className="inline-block rounded-full bg-[#0a0a0a] text-white px-7 py-3 text-sm font-semibold hover:bg-black transition-colors"
        >
          Sign in
        </NavLink>
      </div>
    );
  }

  return (
    <div className="container-page section-y max-w-4xl">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#0a0a0a] mb-2">Your Orders</h1>
      <p className="text-sm sm:text-base text-[#525252] mb-8 sm:mb-10">All your past purchases and current shipments.</p>

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-24 sm:h-28 bg-black/[0.04] animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <Card className="p-8 sm:p-12 text-center border border-black/[0.07] bg-white shadow-sm rounded-2xl sm:rounded-3xl">
          <Package className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-[#525252] mb-4" />
          <h2 className="text-lg sm:text-xl font-bold text-[#0a0a0a] mb-2">No orders yet</h2>
          <p className="text-sm text-[#525252] mb-5 sm:mb-6">When you make your first purchase, it'll show up here.</p>
          <NavLink
            to="/shop"
            className="inline-flex items-center gap-2 rounded-full bg-[#0a0a0a] text-white px-6 py-3 text-sm font-semibold hover:bg-black transition-colors"
          >
            Browse shop <ArrowRight className="w-4 h-4" />
          </NavLink>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <NavLink key={o.id} to={`/order/${o.id}`} className="block">
              <Card className="p-4 sm:p-5 border border-black/[0.07] bg-white shadow-sm hover:shadow-md hover:border-black/[0.15] transition-all rounded-2xl">
                <div className="flex flex-wrap items-start justify-between gap-3 sm:gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <h3 className="text-base sm:text-lg font-bold text-[#0a0a0a]">
                        #{o.display_id ?? o.id.slice(-8)}
                      </h3>
                      <Badge
                        className={cn(
                          'text-[10px] sm:text-xs',
                          o.payment_status === 'captured' || o.payment_status === 'authorized'
                            ? 'bg-[#5BE37D]/15 text-[#0a8a3f] border border-[#5BE37D]/30'
                            : 'bg-[#FFD93D]/15 text-[#0a0a0a] border border-[#FFD93D]/30',
                        )}
                      >
                        {o.status}
                      </Badge>
                      {o.fulfillment_status && (
                        <Badge variant="secondary" className="text-[10px] sm:text-xs bg-black/[0.04]">
                          {o.fulfillment_status}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-[#525252]">
                      {new Date(o.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg sm:text-xl font-bold text-[#0a0a0a]">
                      {formatPrice(o.total, o.currency_code?.toUpperCase() ?? 'USD')}
                    </p>
                    <p className="text-[11px] text-[#525252] flex items-center gap-1 justify-end mt-1">
                      Details <ArrowRight className="w-3 h-3" />
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
