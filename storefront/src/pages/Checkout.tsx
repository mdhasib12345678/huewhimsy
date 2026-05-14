import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useRainbow } from '@/components/RainbowContext';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  ChevronRight,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { NavLink } from 'react-router-dom';
import {
  updateCart,
  attachCustomerToCart,
  formatPrice,
  type CartAddress,
} from '@/lib/medusa';

export const Checkout: React.FC = () => {
  const { setIntensity, cartItems, cartCount, cartId, clearCart, user } = useRainbow();
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [orderRef, setOrderRef] = useState<string>('');

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneCountry, setPhoneCountry] = useState('us');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [postal, setPostal] = useState('');

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIntensity(0.3);
  }, []);

  useEffect(() => {
    if (user) {
      setName(user.name || `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim());
      setEmail(user.email);
    }
  }, [user]);

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = subtotal > 50 ? 0 : 5.99;
  const total = subtotal + shipping;

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cartId) {
      setError('No cart found. Add an item to your cart first.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const [first_name, ...rest] = name.trim().split(/\s+/);
      const last_name = rest.join(' ') || first_name;
      const shipping_address: CartAddress = {
        first_name,
        last_name,
        phone,
        address_1: street,
        city,
        province,
        postal_code: postal,
        country_code: 'us',
      };

      await updateCart(cartId, { email, shipping_address, billing_address: shipping_address });
      if (user) {
        try {
          await attachCustomerToCart(cartId);
        } catch (err) {
          console.warn('attachCustomerToCart failed (non-fatal):', err);
        }
      }
      setOrderRef(cartId.slice(-8).toUpperCase());
      await clearCart();
      setStep('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed');
    } finally {
      setBusy(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="container mx-auto px-4 py-32 text-center max-w-2xl">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div className="w-24 h-24 rounded-full bg-[#5BE37D]/20 flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="w-12 h-12 text-[#5BE37D]" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Magic Order Confirmed!</h1>
          <p className="text-[#B8BEC6] text-xl mb-4">
            Your adventure is on its way.
          </p>
          <p className="text-[#FFD93D] text-2xl font-mono font-bold mb-12">
            Order #HW-{orderRef}
          </p>
          <p className="text-[#B8BEC6] mb-12">
            We&apos;ve sent the details to <span className="text-white">{email}</span>.
          </p>
          <div className="flex gap-4 justify-center">
            <NavLink to="/" className={cn(buttonVariants(), 'rounded-full bg-white text-black font-bold h-14 px-12')}>
              Return Home
            </NavLink>
            {user && (
              <NavLink to="/account" className={cn(buttonVariants({ variant: 'outline' }), 'rounded-full border-white/10 text-white font-bold h-14 px-12')}>
                View My Orders
              </NavLink>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-32 text-center max-w-2xl">
        <h1 className="text-3xl font-bold text-white mb-6">Your cart is empty</h1>
        <p className="text-[#B8BEC6] mb-8">Add an item before checking out.</p>
        <NavLink to="/shop" className={cn(buttonVariants(), 'rounded-full bg-white text-black font-bold h-12 px-8')}>
          Go to Shop
        </NavLink>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 py-12 md:py-20 max-w-6xl"
    >
      <div className="flex items-center gap-4 mb-12">
        <h1 className="text-4xl font-bold text-white tracking-tight">Checkout</h1>
        <div className="flex items-center gap-2 text-[#B8BEC6] text-sm">
          <span>Cart</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-white">Shipping &amp; Payment</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Form */}
        <div className="lg:col-span-8">
          <form id="checkout-form" onSubmit={handleOrder} className="space-y-12">
            <section className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[#B8BEC6]">Full Name</Label>
                  <Input
                    placeholder="John Doe"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-white/5 border-white/10 rounded-xl h-12 text-white focus:ring-[#FFD93D]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#B8BEC6]">Email Address</Label>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white/5 border-white/10 rounded-xl h-12 text-white focus:ring-[#FFD93D]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#B8BEC6]">Phone Number</Label>
                  <div className="flex gap-2">
                    <Select value={phoneCountry} onValueChange={setPhoneCountry}>
                      <SelectTrigger className="w-28 bg-white/5 border-white/10 rounded-xl h-12 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1a1a] text-white border-white/10">
                        <SelectItem value="us">🇺🇸 +1</SelectItem>
                        <SelectItem value="uk">🇬🇧 +44</SelectItem>
                        <SelectItem value="ca">🇨🇦 +1</SelectItem>
                        <SelectItem value="au">🇦🇺 +61</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="555-0123"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="flex-grow bg-white/5 border-white/10 rounded-xl h-12 text-white focus:ring-[#FFD93D]"
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Shipping Address</h2>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[#B8BEC6]">Street Address</Label>
                  <Input
                    placeholder="123 Magic Lane"
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="bg-white/5 border-white/10 rounded-xl h-12 text-white focus:ring-[#FFD93D]"
                  />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[#B8BEC6]">City</Label>
                    <Input
                      placeholder="Whimsytown"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="bg-white/5 border-white/10 rounded-xl h-12 text-white focus:ring-[#FFD93D]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[#B8BEC6]">State/Province</Label>
                    <Input
                      placeholder="CA"
                      required
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      className="bg-white/5 border-white/10 rounded-xl h-12 text-white focus:ring-[#FFD93D]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[#B8BEC6]">Postal Code</Label>
                    <Input
                      placeholder="12345"
                      required
                      value={postal}
                      onChange={(e) => setPostal(e.target.value)}
                      className="bg-white/5 border-white/10 rounded-xl h-12 text-white focus:ring-[#FFD93D]"
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Payment Method</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl border-2 border-[#FFD93D] bg-[#FFD93D]/10 flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-4">
                    <CreditCard className="w-6 h-6 text-[#FFD93D]" />
                    <span className="font-bold text-white">Credit Card</span>
                  </div>
                  <div className="w-5 h-5 rounded-full border-2 border-[#FFD93D] flex items-center justify-center p-1">
                    <div className="w-full h-full bg-[#FFD93D] rounded-full" />
                  </div>
                </div>
                <div className="p-6 rounded-2xl border-2 border-white/5 bg-white/5 flex items-center justify-between cursor-pointer hover:bg-white/10 transition-all opacity-50">
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-white">Paypal</span>
                  </div>
                  <div className="w-5 h-5 rounded-full border-2 border-white/20" />
                </div>
              </div>
            </section>
          </form>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4">
          <Card className="border-white/10 bg-white/5 backdrop-blur-3xl p-8 sticky top-32">
            <h3 className="text-xl font-bold text-white mb-6">In Your Cart ({cartCount})</h3>
            <div className="space-y-4 mb-6">
              {cartItems.slice(0, 3).map((item) => (
                <div key={item.id} className="flex justify-between text-sm gap-2">
                  <span className="text-[#B8BEC6] italic leading-tight">
                    {item.title} (x{item.quantity})
                  </span>
                  <span className="text-white whitespace-nowrap">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
              {cartItems.length > 3 && (
                <p className="text-[10px] text-center text-[#B8BEC6]">
                  + {cartItems.length - 3} more items
                </p>
              )}
            </div>

            <Separator className="bg-white/10 my-6" />

            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-[#B8BEC6]">Subtotal</span>
                <span className="text-white">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#B8BEC6]">Shipping</span>
                <span className={cn('font-medium', shipping === 0 ? 'text-[#5BE37D]' : 'text-white')}>
                  {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                </span>
              </div>
              <Separator className="bg-white/10 my-4" />
              <div className="flex justify-between text-2xl font-bold text-white">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>

              {error && (
                <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                form="checkout-form"
                disabled={busy}
                className="w-full rounded-full h-16 bg-white text-black font-bold text-lg hover:bg-[#F5F5F5] mt-8 transition-all"
              >
                {busy ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>Complete Order <CheckCircle2 className="w-5 h-5 ml-2" /></>
                )}
              </Button>

              <div className="flex flex-col gap-3 mt-8">
                <div className="flex items-center gap-3 text-xs text-[#B8BEC6]">
                  <ShieldCheck className="w-4 h-4 text-[#5BE37D]" /> 256-bit SSL Secure Payment
                </div>
                <div className="flex items-center gap-3 text-xs text-[#B8BEC6]">
                  <Truck className="w-4 h-4 text-[#4DA8FF]" /> Fast Global Fulfillment
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};
