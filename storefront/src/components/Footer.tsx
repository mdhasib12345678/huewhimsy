import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Instagram, Scissors, Laptop as Pinterest, Twitter, Linkedin, Youtube, Mail, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { subscribeNewsletter } from '@/lib/medusa';

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

  const footerLinks = {
    company: [
      { name: 'Home', path: '/' },
      { name: 'About', path: '/about' },
      { name: 'Blog', path: '/blog' },
      { name: 'Contact', path: '/contact' },
    ],
    shop: [
      { name: 'Library', path: '/library' },
      { name: 'Free Activities', path: '/free-activities' },
      { name: 'Services', path: '/services' },
      { name: 'My Account', path: '/account' },
    ],
    support: [
      { name: 'Privacy Policy', path: '/privacy' },
      { name: 'Terms of Service', path: '/terms' },
      { name: 'Refund Policy', path: '/refund' },
    ],
  };

  const socialLinks = [
    { icon: Instagram, url: 'https://instagram.com/huewhimsy' },
    { icon: Pinterest, url: 'https://pinterest.com/huewhimsy' },
    { icon: Twitter, url: 'https://x.com/huewhimsy' },
    { icon: Linkedin, url: 'https://linkedin.com/in/huewhimsy' },
    { icon: Youtube, url: 'https://youtube.com/@huewhimsy' },
  ];

  return (
    <footer className="mt-auto border-t border-black/10 bg-white">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-8">
          
          {/* Brand Col */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FF5F6D] to-[#B067FF]" />
              <span className="text-xl font-bold tracking-tight text-[#0a0a0a]">Hue Whimsy</span>
            </div>
            <p className="text-[#525252] text-sm leading-relaxed max-w-xs">
              Color Your World, Shape Your Dreams. Cozy learning adventures for creative minds aged 3 to 8.
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map((social, i) => (
                <a
                  key={i}
                  href={social.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#525252] hover:text-black transition-colors"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Col 1 */}
          <div>
            <h4 className="text-[#0a0a0a] font-semibold mb-6">Explore</h4>
            <ul className="flex flex-col gap-4">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <NavLink to={link.path} className="text-[#525252] hover:text-black text-sm">
                    {link.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Links Col 2 */}
          <div>
            <h4 className="text-[#0a0a0a] font-semibold mb-6">Shop & Play</h4>
            <ul className="flex flex-col gap-4">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <NavLink to={link.path} className="text-[#525252] hover:text-black text-sm">
                    {link.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Col */}
          <div className="flex flex-col gap-6">
            <h4 className="text-[#0a0a0a] font-semibold mb-2">Join the Adventure</h4>
            <p className="text-[#525252] text-sm">
              Subscribe to get free activity packs and updates.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <Input
                type="email"
                required
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === 'ok'}
                className="bg-white border-gray-300 text-[#0a0a0a] placeholder:text-gray-400 rounded-full px-4 focus:ring-2 focus:ring-[#FFD93D]"
              />
              <Button
                type="submit"
                size="icon"
                disabled={status === 'sending' || status === 'ok'}
                className="shrink-0 bg-gradient-to-r from-[#FF5F6D] to-[#B067FF] text-white hover:opacity-90 rounded-full"
                aria-label="Subscribe"
              >
                {status === 'ok' ? <Check className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
              </Button>
            </form>
            {status === 'ok' && (
              <p className="text-xs text-[#5BE37D] mt-2">✓ You're subscribed!</p>
            )}
            {status === 'err' && (
              <p className="text-xs text-red-600 mt-2">Something went wrong. Try again.</p>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-black/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[#525252] text-[11px] uppercase tracking-widest">
            © {new Date().getFullYear()} Hue Whimsy. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {footerLinks.support.map((link) => (
              <NavLink key={link.name} to={link.path} className="text-[#525252] hover:text-black text-[11px] uppercase tracking-widest">
                {link.name}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
