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
      className="container mx-auto px-4 py-12 md:py-20 max-w-6xl"
    >
      <div className="flex items-center gap-4 mb-12">
        <h1 className="text-4xl font-bold text-[#0a0a0a] tracking-tight">Your Magic Cart</h1>
        <Badge className="bg-black/5 text-[#0a0a0a] border-black/20">{cartCount} Items</Badge>
      </div>

      {cartItems.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Item List */}
          <div className="lg:col-span-8 space-y-6">
            {cartItems.map((item) => (
              <Card key={item.id} className="border-black/10 bg-black/5 overflow-hidden backdrop-blur-xl">
                <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
                  <div className="w-24 h-24 rounded-2xl bg-black/5 flex items-center justify-center relative overflow-hidden flex-shrink-0">
                    <div className="absolute inset-0 opacity-10" style={{ backgroundColor: item.color || '#B067FF' }} />
                    <span className="relative z-10 text-[10px] text-[#0a0a0a]/20 font-bold uppercase">{item.type}</span>
                  </div>
                  
                  <div className="flex-grow text-center sm:text-left">
                    <h3 className="text-xl font-bold text-[#0a0a0a]">{item.title}</h3>
                    <p className="text-sm text-[#525252]">{item.type === 'book' ? 'Alphabet Fun Series' : 'Creative Studio'}</p>
                  </div>

                  <div className="flex items-center bg-black/5 rounded-full h-10 px-1 border border-black/10">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => updateCartQuantity(item.id, -1)}
                      className="rounded-full w-8 h-8 text-[#0a0a0a] hover:bg-black/5"
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-8 text-center text-sm text-[#0a0a0a] font-bold">{item.quantity}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => updateCartQuantity(item.id, 1)}
                      className="rounded-full w-8 h-8 text-[#0a0a0a] hover:bg-black/5"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>

                  <div className="text-right min-w-[80px]">
                    <p className="text-xl font-bold text-[#0a0a0a]">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>

                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeFromCart(item.id)}
                    className="rounded-full text-[#525252] hover:text-[#FF5F6D] hover:bg-[#FF5F6D]/10"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </CardContent>
              </Card>
            ))}
            
            <NavLink to="/shop" className={cn(buttonVariants({ variant: "ghost" }), "text-[#525252] hover:text-black group")}>
              <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" /> Continue Shopping
            </NavLink>
          </div>

          {/* Summary */}
          <div className="lg:col-span-4">
            <Card className="border-black/10 bg-black/5 backdrop-blur-3xl p-8 sticky top-32">
              <h3 className="text-2xl font-bold text-[#0a0a0a] mb-6">Order Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between text-[#525252]">
                  <span>Subtotal</span>
                  <span className="text-[#0a0a0a]">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#525252]">
                  <span>Shipping</span>
                  <span className={cn("font-medium", shipping === 0 ? "text-[#5BE37D]" : "text-[#0a0a0a]")}>
                    {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-[10px] text-[#525252] italic flex items-center gap-1">
                    <Info className="w-3 h-3" /> Spend ${(50 - subtotal).toFixed(2)} more for Free Shipping
                  </p>
                )}
                <Separator className="bg-black/5 my-6" />
                <div className="flex justify-between text-2xl font-bold text-[#0a0a0a]">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                
                <NavLink to="/checkout" className={cn(buttonVariants(), "w-full rounded-full h-16 bg-white text-black font-bold text-lg hover:bg-[#F5F5F5] mt-8 group")}>
                  Secure Checkout <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                </NavLink>
                
                <div className="flex items-center justify-center gap-4 mt-6">
                  <CreditCard className="w-6 h-6 text-[#0a0a0a]/20" />
                  <div className="h-4 w-px bg-black/5" />
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#525252]">Secure Payments by Stripe</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      ) : (
        <div className="py-32 text-center space-y-6">
          <div className="w-24 h-24 rounded-full bg-black/5 flex items-center justify-center mx-auto mb-8 border border-black/10">
            <ShoppingCart className="w-10 h-10 text-[#0a0a0a]/10" />
          </div>
          <h2 className="text-2xl font-bold text-[#0a0a0a]">Your cart is feeling a bit light...</h2>
          <p className="text-[#525252] max-w-sm mx-auto">
            Time to add some magic to your collection! Explore our shop or library to get started.
          </p>
          <NavLink to="/shop" className={cn(buttonVariants(), "rounded-full bg-white text-black font-bold h-12 px-8")}>
            Explore Shop <ArrowRight className="w-4 h-4 ml-2" />
          </NavLink>
        </div>
      )}
    </motion.div>
  );
};
