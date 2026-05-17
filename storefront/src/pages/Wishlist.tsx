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
      className="container mx-auto px-4 py-12 md:py-20 max-w-5xl"
    >
      <div className="flex items-center justify-between mb-12">
        <h1 className="text-4xl font-bold text-[#0a0a0a] tracking-tight">Your Wishlist</h1>
        <span className="text-[#525252]">{products.length} item{products.length === 1 ? '' : 's'} saved</span>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {products.map((item) => {
            const price = productPrice(item);
            const firstVariant = item.variants?.[0];
            return (
              <motion.div
                key={item.id}
                layout
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <Card className="border-black/10 bg-white overflow-hidden shadow-sm">
                  <CardContent className="p-6 flex items-center gap-6">
                    <div className="w-24 h-24 rounded-2xl bg-black/5 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {item.thumbnail ? (
                        <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <span className="text-[10px] text-[#525252] font-bold uppercase">No image</span>
                      )}
                    </div>

                    <div className="flex-grow">
                      {item.collection?.title && (
                        <div className="text-[10px] font-bold text-[#FF9A3C] uppercase tracking-widest mb-1">
                          {item.collection.title}
                        </div>
                      )}
                      <NavLink to={`/shop/${item.handle}`} className="text-xl font-bold text-[#0a0a0a] hover:text-[#FF5F6D]">
                        {item.title}
                      </NavLink>
                      {price > 0 && (
                        <p className="text-2xl font-bold text-[#0a0a0a] mt-2 font-mono">{formatPrice(price)}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
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
                        className="rounded-full bg-gradient-to-r from-[#FF5F6D] to-[#B067FF] text-white hover:opacity-90 font-bold"
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" /> Add to Cart
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemove(item.id)}
                        className="rounded-full text-[#525252] hover:text-[#FF5F6D] hover:bg-[#FF5F6D]/10"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="py-32 text-center space-y-6">
          <div className="w-24 h-24 rounded-full bg-black/5 flex items-center justify-center mx-auto mb-8 border border-black/10">
            <Heart className="w-10 h-10 text-[#0a0a0a]/20" />
          </div>
          <h2 className="text-2xl font-bold text-[#0a0a0a]">Your wishlist is empty</h2>
          <p className="text-[#525252] max-w-sm mx-auto">
            Tap the heart on any product to save it here for later.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <NavLink
              to="/shop"
              className={cn(buttonVariants(), 'rounded-full bg-gradient-to-r from-[#FF5F6D] to-[#B067FF] text-white font-bold h-12 px-8 shadow-md')}
            >
              Explore Shop <ArrowRight className="ml-2 w-4 h-4" />
            </NavLink>
            <NavLink
              to="/library"
              className={cn(buttonVariants({ variant: 'outline' }), 'rounded-full text-[#0a0a0a] border-black/20 font-bold h-12 px-8')}
            >
              View Library
            </NavLink>
          </div>
        </div>
      )}
    </motion.div>
  );
};
