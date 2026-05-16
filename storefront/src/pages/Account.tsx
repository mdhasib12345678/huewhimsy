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
      <div className="container mx-auto px-4 py-32 flex flex-col items-center gap-6 text-[#525252]">
        <Loader2 className="w-10 h-10 animate-spin text-[#FFD93D]" />
        <p>Checking your magic credentials…</p>
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
  const [tab, setTab] = useState<'login' | 'register'>('login');
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
      className="container mx-auto px-4 py-12 md:py-20 max-w-xl"
    >
      <div className="text-center mb-12 space-y-3">
        <h1 className="text-4xl font-bold text-[#0a0a0a] tracking-tight">Welcome to HueWhimsy</h1>
        <p className="text-[#525252]">Sign in to track orders, save favorites, and pick up where you left off.</p>
      </div>

      <Card className="border-black/10 bg-black/5 backdrop-blur-xl p-8 rounded-[2.5rem]">
        <Tabs value={tab} onValueChange={(v) => setTab(v as 'login' | 'register')}>
          <TabsList className="w-full grid grid-cols-2 bg-black/5 rounded-full h-12 p-1 mb-8">
            <TabsTrigger
              value="login"
              className="rounded-full data-[state=active]:bg-white data-[state=active]:text-black text-[#0a0a0a]"
            >
              <LogIn className="w-4 h-4 mr-2" /> Sign In
            </TabsTrigger>
            <TabsTrigger
              value="register"
              className="rounded-full data-[state=active]:bg-white data-[state=active]:text-black text-[#0a0a0a]"
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
                  className="bg-black/5 border-black/10 rounded-xl h-12 text-[#0a0a0a] focus:ring-[#FFD93D]"
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
                  className="bg-black/5 border-black/10 rounded-xl h-12 text-[#0a0a0a] focus:ring-[#FFD93D]"
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
                className="w-full rounded-full h-12 bg-white text-black font-bold hover:bg-[#F5F5F5]"
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
                    className="bg-black/5 border-black/10 rounded-xl h-12 text-[#0a0a0a] focus:ring-[#FFD93D]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#525252]">Last name</Label>
                  <Input
                    value={regLast}
                    onChange={(e) => setRegLast(e.target.value)}
                    placeholder="Explorer"
                    className="bg-black/5 border-black/10 rounded-xl h-12 text-[#0a0a0a] focus:ring-[#FFD93D]"
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
                  className="bg-black/5 border-black/10 rounded-xl h-12 text-[#0a0a0a] focus:ring-[#FFD93D]"
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
                  className="bg-black/5 border-black/10 rounded-xl h-12 text-[#0a0a0a] focus:ring-[#FFD93D]"
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
                className="w-full rounded-full h-12 bg-white text-black font-bold hover:bg-[#F5F5F5]"
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
      className="container mx-auto px-4 py-12 md:py-24"
    >
      {/* Profile Header */}
      <section className="flex flex-col md:flex-row items-center gap-10 mb-20 bg-black/5 border border-black/10 rounded-[3rem] p-12 backdrop-blur-xl">
        <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-[#FF5F6D] to-[#B067FF] flex items-center justify-center border-4 border-black/10 shadow-2xl">
          <User className="w-16 h-16 text-[#0a0a0a]" />
        </div>

        <div className="flex-grow text-center md:text-left space-y-2">
          <div className="flex flex-col sm:flex-row items-baseline gap-4">
            <h1 className="text-4xl font-bold text-[#0a0a0a] tracking-tight">
              Welcome Back, {(user.firstName || user.name).split(' ')[0]}
            </h1>
            <Badge className="bg-[#FFD93D] text-black">Verified Member</Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mt-4">
            <div className="space-y-1">
              <p className="text-[10px] uppercase font-bold tracking-widest text-[#525252]">Username</p>
              <p className="text-[#0a0a0a] font-mono">{user.username}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] uppercase font-bold tracking-widest text-[#525252]">Customer ID</p>
              <p className="text-[#FF9A3C] font-mono font-bold">{user.customerId.slice(-10)}</p>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <p className="text-[10px] uppercase font-bold tracking-widest text-[#525252]">Email Address</p>
              <p className="text-[#525252]">{user.email}</p>
            </div>
          </div>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-8">
            <Button variant="outline" size="sm" className="rounded-full border-black/10 hover:bg-black/5 text-[#0a0a0a]">
              Edit Profile
            </Button>
            <Button onClick={() => logout()} variant="outline" size="sm" className="rounded-full border-red-500/20 hover:bg-red-500/10 text-red-400">
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-black/5 p-4 rounded-2xl border border-black/10 text-center w-32">
            <p className="text-3xl font-bold text-[#0a0a0a]">{orders.length}</p>
            <p className="text-[10px] uppercase font-bold tracking-widest text-[#525252]">Orders</p>
          </div>
          <div className="bg-black/5 p-4 rounded-2xl border border-black/10 text-center w-32">
            <p className="text-3xl font-bold text-[#5BE37D]">0</p>
            <p className="text-[10px] uppercase font-bold tracking-widest text-[#525252]">Downloads</p>
          </div>
        </div>
      </section>

      {/* Orders */}
      <section className="mb-20">
        <h2 className="text-2xl font-bold text-[#0a0a0a] mb-6">Your Orders</h2>
        {ordersLoading ? (
          <div className="text-[#525252] flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading orders…
          </div>
        ) : orders.length === 0 ? (
          <Card className="border-black/10 bg-black/5 backdrop-blur-xl p-10 text-center">
            <Package className="w-12 h-12 text-[#0a0a0a]/10 mx-auto mb-4" />
            <p className="text-[#525252]">No orders yet — explore the shop to start a magic adventure.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => (
              <Card key={o.id} className="border-black/10 bg-black/5 backdrop-blur-xl">
                <CardContent className="p-6 flex flex-wrap items-center gap-4">
                  <div className="flex-grow">
                    <p className="text-[#0a0a0a] font-bold">
                      Order #{o.display_id ?? o.id.slice(-8)}
                    </p>
                    <p className="text-xs text-[#525252]">
                      {new Date(o.created_at).toLocaleDateString()} · {o.status}
                    </p>
                  </div>
                  <Badge className="bg-black/5 text-[#0a0a0a] border-black/20">
                    {o.payment_status ?? 'pending'}
                  </Badge>
                  <span className="text-[#0a0a0a] font-bold text-lg">
                    {formatPrice(o.total, o.currency_code?.toUpperCase() || 'USD')}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Account Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {menuItems.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="h-full border-black/10 bg-black/5 hover:bg-black/5 hover:border-black/20 transition-all cursor-pointer group">
              <CardContent className="p-8 flex flex-col items-center text-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-black/5 flex items-center justify-center border border-black/10 group-hover:bg-[#FFD93D]/10 group-hover:border-[#FFD93D]/30 transition-all">
                  <item.icon className="w-6 h-6 text-[#525252] group-hover:text-[#FFD93D] transition-colors" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-[#0a0a0a] mb-2">{item.label}</h4>
                  <p className="text-xs text-[#525252] leading-relaxed">{item.desc}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Security Banner */}
      <section className="mt-20">
        <Card className="border-black/10 bg-white shadow-sm p-12 rounded-[3rem] flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-8">
            <div className="w-20 h-20 rounded-full bg-[#5BE37D]/10 flex items-center justify-center">
              <ShieldCheck className="w-10 h-10 text-[#5BE37D]" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-[#0a0a0a] mb-2">Your Data is Secure</h3>
              <p className="text-[#525252] max-w-md">
                We use industry-leading encryption to keep your magic adventures and personal details safe at all times.
              </p>
            </div>
          </div>
          <Button size="lg" variant="outline" className="rounded-full border-black/20 text-[#0a0a0a] px-8">
            View Privacy Policy
          </Button>
        </Card>
      </section>
    </motion.div>
  );
};
