import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useRainbow } from '@/components/RainbowContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  User,
  Package,
  Download,
  Heart,
  Settings,
  Globe,
  LifeBuoy,
  LogOut,
  ShieldCheck,
  CreditCard,
  MapPin,
  LogIn,
  UserPlus,
  Loader2,
} from 'lucide-react';
import { listCustomerOrders, formatPrice, type MedusaOrder } from '@/lib/medusa';

export const Account: React.FC = () => {
  const { setIntensity, user, authLoading, login, register, logout } = useRainbow();

  useEffect(() => {
    setIntensity(0.35);
    return () => setIntensity(0.7);
  }, []);

  if (authLoading) {
    return (
      <div className="container-page section-y-lg flex flex-col items-center gap-5 text-[#525252]">
        <Loader2 className="w-9 h-9 animate-spin text-[#FF9A3C]" />
        <p className="text-sm">Checking your credentials…</p>
      </div>
    );
  }

  if (!user) {
    return <AuthForms login={login} register={register} />;
  }

  return <SignedInDashboard user={user} logout={logout} />;
};

// ============== Signed-Out: Login / Register Forms ==============

const AuthForms: React.FC<{
  login: (email: string, password: string) => Promise<void>;
  register: (p: { email: string; password: string; first_name?: string; last_name?: string }) => Promise<void>;
}> = ({ login, register }) => {
  // Allow ?mode=register URL hint (used by Header "Register" link)
  const initialTab: 'login' | 'register' =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('mode') === 'register'
      ? 'register'
      : 'login';
  const [tab, setTab] = useState<'login' | 'register'>(initialTab);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regFirst, setRegFirst] = useState('');
  const [regLast, setRegLast] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(loginEmail.trim(), loginPassword);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  const onRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await register({
        email: regEmail.trim(),
        password: regPassword,
        first_name: regFirst.trim() || undefined,
        last_name: regLast.trim() || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container-page section-y max-w-xl"
    >
      <div className="text-center mb-8 sm:mb-10 space-y-2">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#0a0a0a] tracking-tight">Welcome to HueWhimsy</h1>
        <p className="text-sm sm:text-base text-[#525252]">Sign in to track orders, save favorites, and pick up where you left off.</p>
      </div>

      <Card className="border border-black/[0.07] bg-white p-6 sm:p-8 rounded-3xl shadow-sm">
        <Tabs value={tab} onValueChange={(v) => setTab(v as 'login' | 'register')}>
          <TabsList className="w-full grid grid-cols-2 bg-black/[0.04] rounded-full h-12 p-1 mb-6 sm:mb-8">
            <TabsTrigger
              value="login"
              className="rounded-full data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm text-sm font-semibold text-[#525252]"
            >
              <LogIn className="w-4 h-4 mr-2" /> Sign In
            </TabsTrigger>
            <TabsTrigger
              value="register"
              className="rounded-full data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm text-sm font-semibold text-[#525252]"
            >
              <UserPlus className="w-4 h-4 mr-2" /> Create Account
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={onLogin} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[#525252]">Email</Label>
                <Input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="bg-white border-black/10 rounded-xl h-12 text-[#0a0a0a] focus-visible:ring-2 focus-visible:ring-[#FFD93D]/40 focus-visible:border-[#FFD93D]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[#525252]">Password</Label>
                <Input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-white border-black/10 rounded-xl h-12 text-[#0a0a0a] focus-visible:ring-2 focus-visible:ring-[#FFD93D]/40 focus-visible:border-[#FFD93D]"
                />
              </div>
              {error && (
                <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
                  {error}
                </div>
              )}
              <Button
                type="submit"
                disabled={busy}
                className="w-full rounded-full h-12 bg-[#0a0a0a] text-white hover:bg-black font-semibold"
              >
                {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form onSubmit={onRegister} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[#525252]">First name</Label>
                  <Input
                    value={regFirst}
                    onChange={(e) => setRegFirst(e.target.value)}
                    placeholder="Sarah"
                    className="bg-white border-black/10 rounded-xl h-12 text-[#0a0a0a] focus-visible:ring-2 focus-visible:ring-[#FFD93D]/40 focus-visible:border-[#FFD93D]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#525252]">Last name</Label>
                  <Input
                    value={regLast}
                    onChange={(e) => setRegLast(e.target.value)}
                    placeholder="Explorer"
                    className="bg-white border-black/10 rounded-xl h-12 text-[#0a0a0a] focus-visible:ring-2 focus-visible:ring-[#FFD93D]/40 focus-visible:border-[#FFD93D]"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[#525252]">Email</Label>
                <Input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="bg-white border-black/10 rounded-xl h-12 text-[#0a0a0a] focus-visible:ring-2 focus-visible:ring-[#FFD93D]/40 focus-visible:border-[#FFD93D]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[#525252]">Password</Label>
                <Input
                  type="password"
                  required
                  minLength={8}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="bg-white border-black/10 rounded-xl h-12 text-[#0a0a0a] focus-visible:ring-2 focus-visible:ring-[#FFD93D]/40 focus-visible:border-[#FFD93D]"
                />
              </div>
              {error && (
                <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
                  {error}
                </div>
              )}
              <Button
                type="submit"
                disabled={busy}
                className="w-full rounded-full h-12 bg-[#0a0a0a] text-white hover:bg-black font-semibold"
              >
                {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </motion.div>
  );
};

// ============== Signed-In: Profile + Orders ==============

const SignedInDashboard: React.FC<{
  user: NonNullable<ReturnType<typeof useRainbow>['user']>;
  logout: () => Promise<void>;
}> = ({ user, logout }) => {
  const [orders, setOrders] = useState<MedusaOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setOrdersLoading(true);
    listCustomerOrders(20)
      .then((o) => {
        if (!cancelled) setOrders(o);
      })
      .finally(() => {
        if (!cancelled) setOrdersLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const menuItems = [
    { icon: Package, label: 'Orders', desc: 'Track, view, and return orders' },
    { icon: Download, label: 'Downloads', desc: 'Access your digital activity packs' },
    { icon: Heart, label: 'Wishlist', desc: 'Books you want for the future' },
    { icon: Globe, label: 'Language Settings', desc: 'Change your preferred language' },
    { icon: Settings, label: 'Account Settings', desc: 'Update profile and security' },
    { icon: CreditCard, label: 'Payment Methods', desc: 'Manage your cards and billing' },
    { icon: MapPin, label: 'Addresses', desc: 'Manage shipping/billing locations' },
    { icon: LifeBuoy, label: 'Support', desc: 'Get help with your adventures' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container-page section-y"
    >
      {/* Profile Header */}
      <section className="bg-white border border-black/[0.07] rounded-2xl sm:rounded-3xl p-5 sm:p-8 lg:p-10 mb-10 sm:mb-14 shadow-sm">
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 lg:gap-8">
          {/* Avatar */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 shrink-0 rounded-full bg-gradient-to-tr from-[#FF5F6D] via-[#FF9A3C] to-[#B067FF] flex items-center justify-center shadow-[0_10px_30px_-10px_rgba(255,95,109,0.5)]">
            <span className="text-2xl sm:text-3xl font-bold text-white">
              {(user.firstName?.[0] || user.email[0]).toUpperCase()}
            </span>
          </div>

          {/* Identity */}
          <div className="flex-grow text-center lg:text-left min-w-0 w-full">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-center lg:justify-start gap-2 sm:gap-3 mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#0a0a0a] tracking-tight truncate">
                Welcome back, {(user.firstName || user.name).split(' ')[0]}
              </h1>
              <Badge className="bg-[#FFD93D]/20 text-[#0a0a0a] border border-[#FFD93D]/40 self-center sm:self-auto">
                Verified Member
              </Badge>
            </div>
            <p className="text-sm text-[#525252] mb-4 break-all">{user.email}</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-5">
              <div className="bg-black/[0.03] p-3 rounded-xl border border-black/[0.05] text-center">
                <p className="text-xl sm:text-2xl font-bold text-[#0a0a0a]">{orders.length}</p>
                <p className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-[#525252]">Orders</p>
              </div>
              <div className="bg-black/[0.03] p-3 rounded-xl border border-black/[0.05] text-center">
                <p className="text-xl sm:text-2xl font-bold text-[#5BE37D]">0</p>
                <p className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-[#525252]">Downloads</p>
              </div>
              <div className="bg-black/[0.03] p-3 rounded-xl border border-black/[0.05] text-center hidden sm:block">
                <p className="text-xl sm:text-2xl font-bold text-[#4DA8FF]">0</p>
                <p className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-[#525252]">Wishlist</p>
              </div>
              <div className="bg-black/[0.03] p-3 rounded-xl border border-black/[0.05] text-center hidden sm:block">
                <p className="text-xl sm:text-2xl font-bold text-[#B067FF] font-mono">
                  {user.customerId.slice(-6).toUpperCase()}
                </p>
                <p className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-[#525252]">ID</p>
              </div>
            </div>

            <div className="flex flex-wrap justify-center lg:justify-start gap-2 mt-5 sm:mt-6">
              <Button variant="outline" size="sm" className="rounded-full border-black/10 hover:bg-black/[0.04] text-[#0a0a0a] h-9 text-xs">
                Edit Profile
              </Button>
              <Button
                onClick={() => logout()}
                variant="outline"
                size="sm"
                className="rounded-full border-red-200 hover:bg-red-50 text-red-500 h-9 text-xs"
              >
                <LogOut className="w-3.5 h-3.5 mr-1.5" /> Logout
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Orders */}
      <section className="mb-10 sm:mb-14">
        <h2 className="text-xl sm:text-2xl font-bold text-[#0a0a0a] mb-4 sm:mb-5">Your Orders</h2>
        {ordersLoading ? (
          <div className="text-[#525252] flex items-center gap-2 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading orders…
          </div>
        ) : orders.length === 0 ? (
          <Card className="border border-black/[0.07] bg-white p-8 sm:p-10 text-center rounded-2xl sm:rounded-3xl">
            <Package className="w-10 h-10 sm:w-12 sm:h-12 text-[#0a0a0a]/15 mx-auto mb-3 sm:mb-4" />
            <p className="text-sm sm:text-base text-[#525252]">No orders yet — explore the shop to start your first adventure.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <Card key={o.id} className="border border-black/[0.07] bg-white rounded-2xl">
                <CardContent className="p-4 sm:p-5 flex flex-wrap items-center gap-3 sm:gap-4">
                  <div className="flex-grow min-w-0">
                    <p className="text-[#0a0a0a] font-bold text-sm sm:text-base">
                      Order #{o.display_id ?? o.id.slice(-8)}
                    </p>
                    <p className="text-xs text-[#525252]">
                      {new Date(o.created_at).toLocaleDateString()} · {o.status}
                    </p>
                  </div>
                  <Badge className="bg-black/[0.04] text-[#0a0a0a] border border-black/[0.06] text-[10px]">
                    {o.payment_status ?? 'pending'}
                  </Badge>
                  <span className="text-[#0a0a0a] font-bold text-base sm:text-lg">
                    {formatPrice(o.total, o.currency_code?.toUpperCase() || 'USD')}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Account Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {menuItems.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="h-full border border-black/[0.07] bg-white hover:border-black/[0.15] hover:shadow-md transition-all cursor-pointer group rounded-2xl">
              <CardContent className="p-4 sm:p-6 flex flex-col items-center text-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-black/[0.04] flex items-center justify-center group-hover:bg-[#FFD93D]/10 transition-all">
                  <item.icon className="w-5 h-5 sm:w-6 sm:h-6 text-[#525252] group-hover:text-[#FF9A3C] transition-colors" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-[#0a0a0a] mb-1 sm:mb-1.5">{item.label}</h4>
                  <p className="text-[11px] sm:text-xs text-[#525252] leading-relaxed hidden sm:block">{item.desc}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Security Banner */}
      <section className="mt-10 sm:mt-14">
        <Card className="border border-black/[0.07] bg-gradient-to-br from-[#5BE37D]/8 to-[#4DA8FF]/8 shadow-sm p-6 sm:p-10 rounded-2xl sm:rounded-3xl flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-6 text-center sm:text-left">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white border border-black/[0.07] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-7 sm:w-8 h-7 sm:h-8 text-[#5BE37D]" />
            </div>
            <div className="text-center sm:text-left">
              <h3 className="text-lg sm:text-xl font-bold text-[#0a0a0a] mb-1">Your data is secure</h3>
              <p className="text-xs sm:text-sm text-[#525252] max-w-md">
                Industry-leading encryption keeps your adventures and personal details safe.
              </p>
            </div>
          </div>
          <Button variant="outline" className="rounded-full border-black/15 text-[#0a0a0a] hover:bg-black/[0.04] px-6 h-11 text-sm font-semibold shrink-0">
            View Privacy Policy
          </Button>
        </Card>
      </section>
    </motion.div>
  );
};
