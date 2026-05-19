import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { NavLink } from 'react-router-dom';
import { useRainbow } from '@/components/RainbowContext';
import { ShoppingCart, Heart, Trash2, ArrowRight } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  listProducts,
  getCustomerWishlist,
  removeFromWishlist,
  productPrice,
  formatPrice,
  type MedusaProduct,
} from '@/lib/medusa';

export const Wishlist: React.FC = () => {
  const { setIntensity, user, wishlistItems, toggleWishlist, addToCart } = useRainbow();
  const [products, setProducts] = useState<MedusaProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIntensity(0.7);
    return () => setIntensity(0.7);
  }, []);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        // Resolve product IDs from EITHER backend wishlist (if logged in) OR
        // localStorage context array.
        let ids: string[] = [];
        if (user) {
          const items = await getCustomerWishlist();
          ids = items.map((i) => i.product_id);
        } else {
          ids = wishlistItems;
        }

        if (ids.length === 0) {
          setProducts([]);
          return;
        }

        // Fetch a batch of products and filter to wishlist ones. For larger
        // catalogs we'd want a /store/products?ids=... endpoint.
        const res = await listProducts({ limit: 200 });
        setProducts(res.products.filter((p) => ids.includes(p.id)));
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [user, wishlistItems]);

  const handleRemove = async (productId: string) => {
    toggleWishlist(productId);
    if (user) {
      try {
        await removeFromWishlist(productId);
      } catch {
        /* noop: localStorage already updated */
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container-page section-y max-w-5xl"
    >
      <div className="flex items-center justify-between mb-8 sm:mb-10 gap-3">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#0a0a0a] tracking-tight">Your Wishlist</h1>
        <span className="text-xs sm:text-sm text-[#525252] shrink-0">
          {products.length} item{products.length === 1 ? '' : 's'}
        </span>
      </div>

      {loading ? (
        <div className="space-y-3 sm:space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-28 sm:h-32 bg-black/[0.04] animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:gap-4">
          {products.map((item) => {
            const price = productPrice(item);
            const firstVariant = item.variants?.[0];
            return (
              <motion.div
                key={item.id}
                layout
                initial={{ scale: 0.97, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <Card className="border border-black/[0.07] bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow rounded-2xl sm:rounded-3xl">
                  <CardContent className="p-4 sm:p-5 grid grid-cols-[auto_1fr] sm:grid-cols-[auto_1fr_auto] items-center gap-3 sm:gap-5">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-black/[0.03] flex items-center justify-center overflow-hidden shrink-0">
                      {item.thumbnail ? (
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <span className="text-[10px] text-[#525252] font-bold uppercase">{item.title.charAt(0)}</span>
                      )}
                    </div>

                    <div className="flex-grow min-w-0">
                      {item.collection?.title && (
                        <div className="text-[10px] font-bold text-[#FF9A3C] uppercase tracking-widest mb-0.5 truncate">
                          {item.collection.title}
                        </div>
                      )}
                      <NavLink to={`/shop/${item.handle}`} className="text-sm sm:text-base font-bold text-[#0a0a0a] hover:text-[#FF5F6D] line-clamp-2">
                        {item.title}
                      </NavLink>
                      {price > 0 && (
                        <p className="text-base sm:text-lg font-bold text-[#0a0a0a] mt-1 sm:mt-1.5">{formatPrice(price)}</p>
                      )}
                    </div>

                    {/* Actions — wraps to new row on mobile */}
                    <div className="col-span-2 sm:col-span-1 flex items-center gap-2 mt-2 sm:mt-0">
                      <Button
                        onClick={() =>
                          addToCart({
                            id: item.id,
                            title: item.title,
                            price,
                            color: '#FF5F6D',
                            type: 'product',
                            variantId: firstVariant?.id,
                          } as any)
                        }
                        className="flex-1 sm:flex-none rounded-full bg-[#0a0a0a] text-white hover:bg-black font-semibold h-10 px-4 text-xs sm:text-sm"
                      >
                        <ShoppingCart className="w-3.5 h-3.5 sm:mr-1.5" />
                        <span className="hidden sm:inline">Add to Cart</span>
                        <span className="sm:hidden">Add</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemove(item.id)}
                        className="rounded-full text-[#525252] hover:text-[#FF5F6D] hover:bg-[#FF5F6D]/10 w-10 h-10"
                        aria-label="Remove from wishlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="py-20 sm:py-32 text-center space-y-5 sm:space-y-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-black/[0.04] flex items-center justify-center mx-auto mb-6 border border-black/[0.07]">
            <Heart className="w-9 h-9 sm:w-10 sm:h-10 text-[#0a0a0a]/15" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#0a0a0a]">Your wishlist is empty</h2>
          <p className="text-sm sm:text-base text-[#525252] max-w-sm mx-auto">
            Tap the heart on any product to save it here for later.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
            <NavLink
              to="/shop"
              className={cn(
                buttonVariants(),
                'rounded-full bg-[#0a0a0a] text-white hover:bg-black font-semibold h-12 px-7',
              )}
            >
              Explore Shop <ArrowRight className="ml-2 w-4 h-4" />
            </NavLink>
            <NavLink
              to="/library"
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'rounded-full text-[#0a0a0a] border-black/15 hover:bg-black/[0.04] font-semibold h-12 px-7',
              )}
            >
              View Library
            </NavLink>
          </div>
        </div>
      )}
    </motion.div>
  );
};
