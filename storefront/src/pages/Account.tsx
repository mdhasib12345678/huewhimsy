import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { useRainbow } from '@/components/RainbowContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Package, 
  Download, 
  Heart, 
  Settings, 
  Globe, 
  Bell, 
  LifeBuoy, 
  LogOut, 
  ChevronRight,
  ShieldCheck,
  CreditCard,
  MapPin
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';

export const Account: React.FC = () => {
  const { setIntensity, user, logout } = useRainbow();

  // Mock user for demo if context is empty
  const activeUser = user || {
    name: 'Sarah Explorer',
    username: 'sarahfamily',
    customerId: 'HW-04825',
    email: 'sarah@example.com'
  };

  useEffect(() => {
    setIntensity(0.35); // Minimal intensity for Account
    return () => setIntensity(0.7);
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
      <section className="flex flex-col md:flex-row items-center gap-10 mb-20 bg-white/5 border border-white/10 rounded-[3rem] p-12 backdrop-blur-xl">
        <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-[#FF5F6D] to-[#B067FF] flex items-center justify-center border-4 border-white/10 shadow-2xl relative group">
           <User className="w-16 h-16 text-white" />
           <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
              <span className="text-[10px] uppercase font-bold text-white">Edit</span>
           </div>
        </div>
        
        <div className="flex-grow text-center md:text-left space-y-2">
          <div className="flex flex-col sm:flex-row items-baseline gap-4">
             <h1 className="text-4xl font-bold text-white tracking-tight">Welcome Back, {activeUser.name.split(' ')[0]}</h1>
             <Badge className="bg-[#FFD93D] text-black">Member since 2024</Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mt-4">
             <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold tracking-widest text-[#B8BEC6]">Username</p>
                <p className="text-white font-mono">{activeUser.username}</p>
             </div>
             <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold tracking-widest text-[#B8BEC6]">Customer ID</p>
                <p className="text-[#FF9A3C] font-mono font-bold">{activeUser.customerId}</p>
             </div>
             <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold tracking-widest text-[#B8BEC6]">Email Address</p>
                <p className="text-[#B8BEC6]">{activeUser.email}</p>
             </div>
          </div>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-8">
             <Button variant="outline" size="sm" className="rounded-full border-white/10 hover:bg-white/5 text-white">
                Edit Profile
             </Button>
             <Button onClick={logout} variant="outline" size="sm" className="rounded-full border-red-500/20 hover:bg-red-500/10 text-red-400">
                <LogOut className="w-4 h-4 mr-2" /> Logout
             </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
           <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-center w-32">
              <p className="text-3xl font-bold text-white">12</p>
              <p className="text-[10px] uppercase font-bold tracking-widest text-[#B8BEC6]">Orders</p>
           </div>
           <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-center w-32">
              <p className="text-3xl font-bold text-[#5BE37D]">4</p>
              <p className="text-[10px] uppercase font-bold tracking-widest text-[#B8BEC6]">Downloads</p>
           </div>
        </div>
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
            <Card className="h-full border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer group">
              <CardContent className="p-8 flex flex-col items-center text-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-[#FFD93D]/10 group-hover:border-[#FFD93D]/30 transition-all">
                  <item.icon className="w-6 h-6 text-[#B8BEC6] group-hover:text-[#FFD93D] transition-colors" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white mb-2">{item.label}</h4>
                  <p className="text-xs text-[#B8BEC6] leading-relaxed">{item.desc}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Security Banner */}
      <section className="mt-20">
         <Card className="border-white/10 bg-black/40 backdrop-blur-3xl p-12 rounded-[3rem] flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-8">
               <div className="w-20 h-20 rounded-full bg-[#5BE37D]/10 flex items-center justify-center">
                  <ShieldCheck className="w-10 h-10 text-[#5BE37D]" />
               </div>
               <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Your Data is Secure</h3>
                  <p className="text-[#B8BEC6] max-w-md">We use industry-leading encryption to keep your magic adventures and personal details safe at all times.</p>
               </div>
            </div>
            <Button size="lg" variant="outline" className="rounded-full border-white/20 text-white px-8">
               View Privacy Policy
            </Button>
         </Card>
      </section>
    </motion.div>
  );
};
