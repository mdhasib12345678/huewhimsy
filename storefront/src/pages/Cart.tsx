import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { useRainbow } from '@/components/RainbowContext';
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, ArrowRight, CreditCard, Info } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { NavLink } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export const Cart: React.FC = () => {
  const { setIntensity, cartItems, cartCount, updateCartQuantity, removeFromCart } = useRainbow();

  useEffect(() => {
    setIntensity(0.3); // 25-35% for Checkout/Account
  }, []);

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = subtotal > 50 ? 0 : 5.99;
  const total = subtotal + shipping;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container-page section-y max-w-6xl"
    >
      <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-8 sm:mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#0a0a0a] tracking-tight">Your Cart</h1>
        <Badge className="bg-black/[0.05] text-[#0a0a0a] border border-black/10">{cartCount} {cartCount === 1 ? 'item' : 'items'}</Badge>
      </div>

      {cartItems.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
          {/* Item List */}
          <div className="lg:col-span-8 space-y-3 sm:space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id} className="border border-black/[0.07] bg-white overflow-hidden rounded-2xl sm:rounded-3xl">
                <CardContent className="p-4 sm:p-5 grid grid-cols-[auto_1fr] sm:grid-cols-[auto_1fr_auto_auto_auto] items-center gap-3 sm:gap-5">
                  {/* Image */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-black/[0.03] flex items-center justify-center relative overflow-hidden shrink-0">
                    {item.thumbnail ? (
                      <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <div className="absolute inset-0 opacity-15" style={{ backgroundColor: item.color || '#B067FF' }} />
                        <span className="relative z-10 text-[9px] text-[#0a0a0a]/30 font-bold uppercase">{item.type}</span>
                      </>
                    )}
                  </div>

                  {/* Title */}
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-bold text-[#0a0a0a] line-clamp-2 leading-tight">{item.title}</h3>
                    <p className="text-[11px] sm:text-xs text-[#525252] mt-0.5">
                      {item.type === 'book' ? 'Alphabet Fun Series' : 'Creative Studio'}
                    </p>
                    <p className="sm:hidden text-base font-bold text-[#0a0a0a] mt-1.5">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>

                  {/* Mobile actions row */}
                  <div className="col-span-2 sm:col-span-1 flex items-center sm:contents gap-3 mt-1 sm:mt-0">
                    <div className="flex items-center bg-black/[0.04] rounded-full h-10 px-1 border border-black/[0.06]">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => updateCartQuantity(item.id, -1)}
                        className="rounded-full w-8 h-8 text-[#0a0a0a] hover:bg-white"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </Button>
                      <span className="w-8 text-center text-sm text-[#0a0a0a] font-bold">{item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => updateCartQuantity(item.id, 1)}
                        className="rounded-full w-8 h-8 text-[#0a0a0a] hover:bg-white"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                    <div className="hidden sm:block text-right min-w-[80px]">
                      <p className="text-base font-bold text-[#0a0a0a]">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFromCart(item.id)}
                      className="ml-auto sm:ml-0 rounded-full w-10 h-10 text-[#525252] hover:text-[#FF5F6D] hover:bg-[#FF5F6D]/10"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            <NavLink
              to="/shop"
              className={cn(
                buttonVariants({ variant: 'ghost' }),
                'text-[#404040] hover:text-black hover:bg-black/[0.04] group rounded-full px-3 h-10 mt-2',
              )}
            >
              <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" /> Continue Shopping
            </NavLink>
          </div>

          {/* Summary */}
          <div className="lg:col-span-4">
            <Card className="border border-black/[0.07] bg-white p-5 sm:p-6 sticky top-24 rounded-2xl sm:rounded-3xl shadow-sm">
              <h3 className="text-lg sm:text-xl font-bold text-[#0a0a0a] mb-4 sm:mb-5">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm text-[#525252]">
                  <span>Subtotal</span>
                  <span className="text-[#0a0a0a] font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-[#525252]">
                  <span>Shipping</span>
                  <span className={cn('font-medium', shipping === 0 ? 'text-[#0a8a3f]' : 'text-[#0a0a0a]')}>
                    {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-[10px] text-[#525252] italic flex items-center gap-1">
                    <Info className="w-3 h-3 shrink-0" /> Spend ${(50 - subtotal).toFixed(2)} more for free shipping
                  </p>
                )}
                <Separator className="bg-black/[0.06] my-4" />
                <div className="flex justify-between text-xl sm:text-2xl font-bold text-[#0a0a0a]">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>

                <NavLink
                  to="/checkout"
                  className={cn(
                    buttonVariants(),
                    'w-full rounded-full h-12 sm:h-13 bg-[#0a0a0a] text-white font-semibold text-sm sm:text-base hover:bg-black mt-5 group',
                  )}
                  style={{ height: '3rem' }}
                >
                  Secure Checkout
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </NavLink>

                <div className="flex items-center justify-center gap-3 mt-4 pt-4 border-t border-black/[0.06]">
                  <CreditCard className="w-5 h-5 text-[#525252]" />
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#525252]">
                    Secure payments by Stripe
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      ) : (
        <div className="py-20 sm:py-32 text-center space-y-5 sm:space-y-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-black/[0.04] flex items-center justify-center mx-auto mb-6 border border-black/[0.07]">
            <ShoppingCart className="w-9 h-9 sm:w-10 sm:h-10 text-[#0a0a0a]/15" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#0a0a0a]">Your cart is empty</h2>
          <p className="text-sm sm:text-base text-[#525252] max-w-sm mx-auto">
            Time to add some magic to your collection! Explore the shop or library to get started.
          </p>
          <NavLink
            to="/shop"
            className={cn(buttonVariants(), 'rounded-full bg-[#0a0a0a] text-white hover:bg-black font-semibold h-12 px-7')}
          >
            Explore Shop <ArrowRight className="w-4 h-4 ml-2" />
          </NavLink>
        </div>
      )}
    </motion.div>
  );
};
