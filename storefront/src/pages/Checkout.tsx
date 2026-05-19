import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useRainbow } from '@/components/RainbowContext';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  ChevronRight,
  CheckCircle2,
  Loader2,
  Banknote,
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
import {
  updateCart,
  attachCustomerToCart,
  formatPrice,
  listCartShippingOptions,
  addShippingMethodToCart,
  listPaymentProviders,
  createPaymentCollection,
  initPaymentSession,
  completeCart,
  getCart,
  type CartAddress,
  type ShippingOption,
  type PaymentProviderInfo,
} from '@/lib/medusa';

// Country picker drives both phone code and shipping country_code, so that
// the cart lands in a region/zone that has shipping options + tax + payment.
const COUNTRIES: { code: string; label: string; phone: string; flag: string }[] = [
  { code: 'us', label: 'United States', phone: '+1', flag: '🇺🇸' },
  { code: 'gb', label: 'United Kingdom', phone: '+44', flag: '🇬🇧' },
  { code: 'ca', label: 'Canada', phone: '+1', flag: '🇨🇦' },
  { code: 'au', label: 'Australia', phone: '+61', flag: '🇦🇺' },
  { code: 'bd', label: 'Bangladesh', phone: '+880', flag: '🇧🇩' },
  { code: 'in', label: 'India', phone: '+91', flag: '🇮🇳' },
];

// Friendly label for known Medusa provider ids.
function paymentLabel(id: string): { title: string; sub: string } {
  if (id === 'pp_stripe_stripe' || id === 'stripe' || id.startsWith('pp_stripe'))
    return { title: 'Credit / Debit Card', sub: 'Powered by Stripe — secured end-to-end' };
  if (id === 'pp_system_default' || id === 'system_default' || id === 'manual')
    return { title: 'Pay on delivery / bank transfer', sub: 'We will contact you to finalise payment' };
  return { title: id.replace(/^pp_/, '').replace(/_/g, ' '), sub: 'Alternate payment method' };
}

export const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { setIntensity, cartItems, cartCount, cartId, clearCart, user } = useRainbow();
  const [phase, setPhase] = useState<'form' | 'review' | 'placing'>('form');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('us');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [postal, setPostal] = useState('');

  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [shippingOptionId, setShippingOptionId] = useState<string>('');
  const [shippingLoading, setShippingLoading] = useState(false);

  const [providers, setProviders] = useState<PaymentProviderInfo[]>([]);
  const [providerId, setProviderId] = useState<string>('');

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIntensity(0.3);
  }, [setIntensity]);

  useEffect(() => {
    if (user) {
      setName(user.name || `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim());
      setEmail(user.email);
    }
  }, [user]);

  // Pre-fetch available providers once — they don't depend on the cart's
  // region in most setups and let us render the payment list while the user
  // is still filling the address form.
  useEffect(() => {
    void listPaymentProviders().then((rows) => {
      const enabled = rows.filter((r) => r.is_enabled);
      setProviders(enabled);
      if (enabled[0]) setProviderId(enabled[0].id);
    });
  }, []);

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const selectedShipping = useMemo(
    () => shippingOptions.find((o) => o.id === shippingOptionId) ?? null,
    [shippingOptions, shippingOptionId],
  );
  const shipping = selectedShipping?.amount ?? (subtotal > 50 ? 0 : 5.99);
  const total = subtotal + shipping;

  const goReview = async (e: React.FormEvent) => {
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
      const country_code = country.toLowerCase();
      const shipping_address: CartAddress = {
        first_name,
        last_name,
        phone,
        address_1: street,
        city,
        province,
        postal_code: postal,
        country_code,
      };

      await updateCart(cartId, { email, shipping_address, billing_address: shipping_address });
      if (user) {
        try { await attachCustomerToCart(cartId); } catch { /* non-fatal */ }
      }

      setShippingLoading(true);
      const options = await listCartShippingOptions(cartId);
      setShippingOptions(options);
      if (options[0]) setShippingOptionId(options[0].id);
      setShippingLoading(false);

      setPhase('review');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save your details');
    } finally {
      setBusy(false);
    }
  };

  const placeOrder = async () => {
    if (!cartId) return;
    setBusy(true);
    setError(null);
    setPhase('placing');
    try {
      // 1. Attach the chosen shipping method (if any options exist).
      if (shippingOptionId) {
        try { await addShippingMethodToCart(cartId, shippingOptionId); }
        catch (e) { console.warn('addShippingMethodToCart failed:', e); }
      }

      // 2. Make sure a payment collection exists for this cart.
      let cart = await getCart(cartId);
      const existingCollectionId = (cart as any)?.payment_collection?.id as string | undefined;
      let collectionId = existingCollectionId;
      if (!collectionId) {
        const pc = await createPaymentCollection(cartId);
        collectionId = pc?.id;
      }
      if (!collectionId) {
        // Re-read the cart in case the collection was created by a parallel call.
        cart = await getCart(cartId);
        collectionId = (cart as any)?.payment_collection?.id;
      }

      // 3. Initialise a payment session with the chosen provider.
      if (collectionId && providerId) {
        try { await initPaymentSession(collectionId, providerId); }
        catch (e) {
          console.warn('initPaymentSession failed:', e);
          // For Stripe, payment confirmation happens client-side before
          // complete-cart; for manual/system_default this is enough.
        }
      }

      // 4. Complete the cart → real order.
      const result = await completeCart(cartId);
      if (result.type === 'order') {
        await clearCart();
        navigate(`/order/${result.order.id}`);
      } else {
        const msg = result.error || 'Order could not be completed. Please retry.';
        setError(msg);
        setPhase('review');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed');
      setPhase('review');
    } finally {
      setBusy(false);
    }
  };

  if (cartItems.length === 0 && phase !== 'placing') {
    return (
      <div className="container-page section-y-lg text-center max-w-2xl">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#0a0a0a] mb-4 sm:mb-6">Your cart is empty</h1>
        <p className="text-[#525252] mb-6 sm:mb-8 text-sm sm:text-base">Add an item before checking out.</p>
        <NavLink to="/shop" className={cn(buttonVariants(), 'rounded-full bg-[#0a0a0a] text-white hover:bg-black font-semibold h-12 px-7')}>
          Go to Shop
        </NavLink>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container-page section-y max-w-6xl"
    >
      <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-8 sm:mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#0a0a0a] tracking-tight">Checkout</h1>
        <div className="flex items-center gap-1.5 text-[#525252] text-xs sm:text-sm" aria-label="checkout breadcrumb">
          <span className={phase === 'form' ? 'text-[#0a0a0a] font-medium' : ''}>1. Details</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className={phase !== 'form' ? 'text-[#0a0a0a] font-medium' : ''}>2. Review &amp; Pay</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* LEFT */}
        <div className="lg:col-span-8">
          {phase === 'form' && (
            <form id="checkout-form" onSubmit={goReview} className="space-y-8 sm:space-y-10">
              <section className="space-y-5">
                <h2 className="text-xl sm:text-2xl font-bold text-[#0a0a0a]">Contact Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="co-name" className="text-[#525252] text-xs">Full Name</Label>
                    <Input
                      id="co-name"
                      placeholder="Jane Doe"
                      required
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-white border-black/10 rounded-xl h-12 text-[#0a0a0a] focus-visible:ring-2 focus-visible:ring-[#FFD93D]/40 focus-visible:border-[#FFD93D]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="co-email" className="text-[#525252] text-xs">Email Address</Label>
                    <Input
                      id="co-email"
                      type="email"
                      placeholder="jane@example.com"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-white border-black/10 rounded-xl h-12 text-[#0a0a0a] focus-visible:ring-2 focus-visible:ring-[#FFD93D]/40 focus-visible:border-[#FFD93D]"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="co-phone" className="text-[#525252] text-xs">Phone Number</Label>
                    <div className="flex gap-2">
                      <Select value={country} onValueChange={setCountry}>
                        <SelectTrigger className="w-28 sm:w-32 bg-white border-black/10 rounded-xl h-12 text-[#0a0a0a]" aria-label="Country">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white text-[#0a0a0a] border-black/10">
                          {COUNTRIES.map((c) => (
                            <SelectItem key={c.code} value={c.code}>
                              {c.flag} {c.phone}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        id="co-phone"
                        type="tel"
                        inputMode="tel"
                        placeholder="555-0123"
                        required
                        autoComplete="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="flex-grow bg-white border-black/10 rounded-xl h-12 text-[#0a0a0a] focus-visible:ring-2 focus-visible:ring-[#FFD93D]/40 focus-visible:border-[#FFD93D]"
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-5">
                <h2 className="text-xl sm:text-2xl font-bold text-[#0a0a0a]">Shipping Address</h2>
                <div className="space-y-4 sm:space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="co-street" className="text-[#525252] text-xs">Street Address</Label>
                    <Input
                      id="co-street"
                      placeholder="123 Magic Lane"
                      required
                      autoComplete="street-address"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="bg-white border-black/10 rounded-xl h-12 text-[#0a0a0a] focus-visible:ring-2 focus-visible:ring-[#FFD93D]/40 focus-visible:border-[#FFD93D]"
                    />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5">
                    <div className="space-y-2 col-span-2 md:col-span-1">
                      <Label htmlFor="co-city" className="text-[#525252] text-xs">City</Label>
                      <Input
                        id="co-city"
                        placeholder="Whimsytown"
                        required
                        autoComplete="address-level2"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="bg-white border-black/10 rounded-xl h-12 text-[#0a0a0a] focus-visible:ring-2 focus-visible:ring-[#FFD93D]/40 focus-visible:border-[#FFD93D]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="co-province" className="text-[#525252] text-xs">State / Prov.</Label>
                      <Input
                        id="co-province"
                        placeholder="CA"
                        required
                        autoComplete="address-level1"
                        value={province}
                        onChange={(e) => setProvince(e.target.value)}
                        className="bg-white border-black/10 rounded-xl h-12 text-[#0a0a0a] focus-visible:ring-2 focus-visible:ring-[#FFD93D]/40 focus-visible:border-[#FFD93D]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="co-postal" className="text-[#525252] text-xs">Postal Code</Label>
                      <Input
                        id="co-postal"
                        placeholder="12345"
                        required
                        autoComplete="postal-code"
                        value={postal}
                        onChange={(e) => setPostal(e.target.value)}
                        className="bg-white border-black/10 rounded-xl h-12 text-[#0a0a0a] focus-visible:ring-2 focus-visible:ring-[#FFD93D]/40 focus-visible:border-[#FFD93D]"
                      />
                    </div>
                  </div>
                </div>
              </section>
            </form>
          )}

          {phase !== 'form' && (
            <div className="space-y-8 sm:space-y-10">
              <section className="space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl sm:text-2xl font-bold text-[#0a0a0a]">Shipping Method</h2>
                  <button
                    type="button"
                    onClick={() => setPhase('form')}
                    className="text-xs text-[#525252] hover:text-[#0a0a0a] underline underline-offset-2"
                  >
                    Edit address
                  </button>
                </div>
                {shippingLoading ? (
                  <div className="flex items-center gap-2 text-sm text-[#525252]">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading shipping options…
                  </div>
                ) : shippingOptions.length === 0 ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 text-amber-900 text-sm p-3">
                    No shipping options are available for this address. We'll arrange shipping after the order is placed.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {shippingOptions.map((opt) => (
                      <label
                        key={opt.id}
                        className={cn(
                          'flex items-center justify-between gap-3 rounded-2xl border-2 p-4 cursor-pointer transition',
                          shippingOptionId === opt.id
                            ? 'border-[#FFD93D] bg-[#FFD93D]/10'
                            : 'border-black/5 hover:bg-black/[0.02]',
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="shipping-option"
                            value={opt.id}
                            checked={shippingOptionId === opt.id}
                            onChange={() => setShippingOptionId(opt.id)}
                            className="accent-[#FFD93D]"
                          />
                          <div>
                            <div className="font-semibold text-sm text-[#0a0a0a]">{opt.name}</div>
                            {opt.price_type === 'calculated' && (
                              <div className="text-xs text-[#525252]">Calculated at fulfilment</div>
                            )}
                          </div>
                        </div>
                        <div className="font-semibold text-sm text-[#0a0a0a]">
                          {opt.amount === 0 ? 'FREE' : formatPrice(opt.amount)}
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </section>

              <section className="space-y-5">
                <h2 className="text-xl sm:text-2xl font-bold text-[#0a0a0a]">Payment Method</h2>
                {providers.length === 0 ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 text-amber-900 text-sm p-3">
                    No online payment providers are configured. Your order will be marked
                    "pending payment" and we'll contact you to settle it.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {providers.map((p) => {
                      const label = paymentLabel(p.id);
                      const active = providerId === p.id;
                      const isCard = /stripe/i.test(p.id);
                      return (
                        <label
                          key={p.id}
                          className={cn(
                            'p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition flex flex-col gap-1',
                            active
                              ? 'border-[#FFD93D] bg-[#FFD93D]/10'
                              : 'border-black/5 bg-black/[0.02] hover:bg-black/[0.04]',
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {isCard ? (
                                <CreditCard className="w-5 h-5 text-[#FF9A3C]" />
                              ) : (
                                <Banknote className="w-5 h-5 text-[#4DA8FF]" />
                              )}
                              <span className="font-semibold text-sm sm:text-base text-[#0a0a0a]">
                                {label.title}
                              </span>
                            </div>
                            <input
                              type="radio"
                              name="payment-provider"
                              value={p.id}
                              checked={active}
                              onChange={() => setProviderId(p.id)}
                              className="accent-[#FFD93D]"
                              aria-label={label.title}
                            />
                          </div>
                          <p className="text-xs text-[#525252] pl-8">{label.sub}</p>
                        </label>
                      );
                    })}
                  </div>
                )}
                <p className="text-xs text-[#525252]">
                  Card payments are processed by Stripe and never touch our servers. Manual options are settled after the order is placed.
                </p>
              </section>
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="lg:col-span-4">
          <Card className="border border-black/[0.07] bg-white p-5 sm:p-6 sticky top-24 rounded-2xl sm:rounded-3xl shadow-sm">
            <h3 className="text-lg sm:text-xl font-bold text-[#0a0a0a] mb-4 sm:mb-5">In Your Cart ({cartCount})</h3>
            <div className="space-y-2.5 mb-4">
              {cartItems.slice(0, 3).map((item) => (
                <div key={item.id} className="flex justify-between text-sm gap-2">
                  <span className="text-[#525252] leading-tight line-clamp-1">
                    {item.title} × {item.quantity}
                  </span>
                  <span className="text-[#0a0a0a] font-medium whitespace-nowrap">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
              {cartItems.length > 3 && (
                <p className="text-[11px] text-center text-[#525252]">+ {cartItems.length - 3} more items</p>
              )}
            </div>

            <Separator className="bg-black/[0.06] my-4" />

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[#525252]">Subtotal</span>
                <span className="text-[#0a0a0a] font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#525252]">Shipping</span>
                <span className={cn('font-medium', shipping === 0 ? 'text-[#0a8a3f]' : 'text-[#0a0a0a]')}>
                  {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                </span>
              </div>
              <Separator className="bg-black/[0.06] my-3" />
              <div className="flex justify-between text-xl sm:text-2xl font-bold text-[#0a0a0a]">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                  {error}
                </div>
              )}

              {phase === 'form' ? (
                <Button
                  type="submit"
                  form="checkout-form"
                  disabled={busy}
                  className="w-full rounded-full h-12 sm:h-13 bg-[#0a0a0a] text-white hover:bg-black font-semibold text-sm sm:text-base mt-4 transition-all"
                  style={{ height: '3rem' }}
                >
                  {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Continue to review <ChevronRight className="w-4 h-4 ml-1" /></>}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={placeOrder}
                  disabled={busy || phase === 'placing'}
                  className="w-full rounded-full h-12 sm:h-13 bg-[#0a0a0a] text-white hover:bg-black font-semibold text-sm sm:text-base mt-4 transition-all"
                  style={{ height: '3rem' }}
                >
                  {busy || phase === 'placing' ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>Place order · {formatPrice(total)} <CheckCircle2 className="w-4 h-4 ml-2" /></>
                  )}
                </Button>
              )}

              <div className="flex flex-col gap-2 mt-5 pt-4 border-t border-black/[0.06]">
                <div className="flex items-center gap-2 text-[11px] text-[#525252]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#5BE37D]" /> 256-bit SSL secure payment
                </div>
                <div className="flex items-center gap-2 text-[11px] text-[#525252]">
                  <Truck className="w-3.5 h-3.5 text-[#4DA8FF]" /> Fast global fulfillment
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};
