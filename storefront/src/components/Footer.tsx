import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Instagram,
  Pin as Pinterest,
  Twitter,
  Linkedin,
  Youtube,
  Mail,
  Check,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { subscribeNewsletter } from '@/lib/medusa';
import { cn } from '@/lib/utils';

const FOOTER_LINKS = {
  explore: [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Blog', path: '/blog' },
    { name: 'Contact', path: '/contact' },
  ],
  shop: [
    { name: 'Library', path: '/library' },
    { name: 'Shop', path: '/shop' },
    { name: 'Free Activities', path: '/free-activities' },
    { name: 'Services', path: '/services' },
    { name: 'My Account', path: '/account' },
  ],
  legal: [
    { name: 'Privacy', path: '/privacy' },
    { name: 'Terms', path: '/terms' },
    { name: 'Refund', path: '/refund' },
    { name: 'Shipping', path: '/shipping' },
  ],
};

const SOCIAL = [
  { icon: Instagram, url: 'https://instagram.com/huewhimsy', label: 'Instagram' },
  { icon: Pinterest, url: 'https://pinterest.com/huewhimsy', label: 'Pinterest' },
  { icon: Twitter, url: 'https://x.com/huewhimsy', label: 'Twitter / X' },
  { icon: Linkedin, url: 'https://linkedin.com/in/huewhimsy', label: 'LinkedIn' },
  { icon: Youtube, url: 'https://youtube.com/@huewhimsy', label: 'YouTube' },
];

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'err'>('idle');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('sending');
    try {
      await subscribeNewsletter({ email, source: 'footer' });
      setStatus('ok');
      setEmail('');
    } catch {
      setStatus('err');
    }
  };

  return (
    <footer className="mt-auto border-t border-black/[0.06] bg-white">
      {/* Top gradient accent bar */}
      <div className="h-[3px] bg-gradient-to-r from-[#FF5F6D] via-[#FF9A3C] via-[#FFD93D] via-[#5BE37D] via-[#4DA8FF] to-[#B067FF]" />

      <div className="container-page section-y">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12">
          {/* Brand col — spans wider on lg */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            <NavLink to="/" className="inline-flex items-center gap-2.5 self-start group">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#FF5F6D] via-[#FF9A3C] to-[#B067FF] shadow-[0_4px_14px_-4px_rgba(255,95,109,0.5)] group-hover:scale-110 transition-transform" />
              <span className="text-xl font-semibold tracking-tight">
                Hue<span className="text-[#FF5F6D]">·</span>Whimsy
              </span>
            </NavLink>
            <p className="text-[#525252] text-sm leading-relaxed max-w-sm">
              Color your world, shape your dreams. Hand-illustrated children's books, art kits, and
              free printables for curious minds ages 3 to 8.
            </p>
            <div className="flex items-center gap-1.5 pt-1">
              {SOCIAL.map((s) => (
                <a
                  key={s.label}
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.label}
                  className="inline-flex items-center justify-center w-10 h-10 rounded-full text-[#525252] hover:text-[#0a0a0a] hover:bg-black/[0.05] transition-colors"
                >
                  <s.icon className="w-[18px] h-[18px]" />
                </a>
              ))}
            </div>
          </div>

          {/* Explore links */}
          <div className="lg:col-span-2">
            <h4 className="text-[#0a0a0a] text-sm font-bold uppercase tracking-widest mb-5">
              Explore
            </h4>
            <ul className="flex flex-col gap-3.5">
              {FOOTER_LINKS.explore.map((link) => (
                <li key={link.name}>
                  <NavLink
                    to={link.path}
                    className="text-[#525252] hover:text-[#0a0a0a] text-sm transition-colors"
                  >
                    {link.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Shop links */}
          <div className="lg:col-span-2">
            <h4 className="text-[#0a0a0a] text-sm font-bold uppercase tracking-widest mb-5">
              Shop &amp; Play
            </h4>
            <ul className="flex flex-col gap-3.5">
              {FOOTER_LINKS.shop.map((link) => (
                <li key={link.name}>
                  <NavLink
                    to={link.path}
                    className="text-[#525252] hover:text-[#0a0a0a] text-sm transition-colors"
                  >
                    {link.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter col */}
          <div className="sm:col-span-2 lg:col-span-4 flex flex-col gap-4">
            <h4 className="text-[#0a0a0a] text-sm font-bold uppercase tracking-widest">
              Join the adventure
            </h4>
            <p className="text-[#525252] text-sm leading-relaxed">
              One email a week. Free printables, new books, no spam — unsubscribe any time.
            </p>
            <form
              onSubmit={handleSubscribe}
              className={cn(
                'flex flex-col sm:flex-row gap-2 mt-1',
                status === 'ok' && 'opacity-70',
              )}
            >
              <div className="relative flex-grow">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#525252] pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status === 'sending' || status === 'ok'}
                  className="w-full h-11 sm:h-12 pl-11 pr-4 rounded-full bg-white border border-black/10 focus:border-[#FFD93D] focus:ring-2 focus:ring-[#FFD93D]/30 outline-none transition-all text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={status === 'sending' || status === 'ok'}
                className="inline-flex items-center justify-center h-11 sm:h-12 px-5 rounded-full bg-gradient-to-r from-[#FF5F6D] via-[#FF9A3C] to-[#B067FF] text-white text-sm font-semibold hover:opacity-95 disabled:opacity-60 transition-all shadow-[0_6px_18px_-6px_rgba(255,95,109,0.5)]"
              >
                {status === 'sending' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : status === 'ok' ? (
                  <>
                    <Check className="w-4 h-4 mr-1.5" /> Subscribed
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-1.5" /> Subscribe
                  </>
                )}
              </button>
            </form>
            {status === 'ok' && (
              <p className="text-xs text-[#5BE37D] font-medium">
                ✓ Welcome! Check your inbox for the welcome pack.
              </p>
            )}
            {status === 'err' && (
              <p className="text-xs text-red-600 font-medium">
                Something went wrong. Please try again in a moment.
              </p>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 sm:mt-16 pt-6 border-t border-black/[0.06] flex flex-col-reverse md:flex-row items-center justify-between gap-4">
          <p className="text-[#525252] text-[11px] uppercase tracking-widest">
            © {new Date().getFullYear()} Hue Whimsy · Made with love in Dhaka
          </p>
          <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
            {FOOTER_LINKS.legal.map((link) => (
              <li key={link.name}>
                <NavLink
                  to={link.path}
                  className="text-[#525252] hover:text-[#0a0a0a] text-[11px] uppercase tracking-widest font-medium transition-colors"
                >
                  {link.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
};
