import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NavLink } from 'react-router-dom';
import { X } from 'lucide-react';

const STORAGE_KEY = 'huewhimsy_cookie_consent';

type Consent = 'accepted' | 'declined' | null;

export const CookieBanner: React.FC = () => {
  const [consent, setConsent] = useState<Consent>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Consent | null;
      setConsent(stored);
    } catch {
      setConsent(null);
    }
    setMounted(true);
  }, []);

  const persist = (v: Exclude<Consent, null>) => {
    try {
      localStorage.setItem(STORAGE_KEY, v);
    } catch {
      /* noop */
    }
    setConsent(v);
  };

  if (!mounted || consent !== null) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:max-w-md z-50 bg-white border border-black/10 rounded-2xl shadow-2xl p-6"
        role="dialog"
        aria-label="Cookie consent"
      >
        <button
          onClick={() => persist('declined')}
          className="absolute top-3 right-3 text-[#525252] hover:text-[#0a0a0a] p-1"
          aria-label="Decline cookies"
        >
          <X className="w-4 h-4" />
        </button>
        <h3 className="font-bold text-[#0a0a0a] mb-2">🍪 Cookie preferences</h3>
        <p className="text-sm text-[#525252] mb-4">
          We use a few cookies to keep your cart, sign-in, and language working. No tracking,
          no ads. Read our{' '}
          <NavLink to="/privacy" className="underline text-[#FF5F6D]">
            privacy policy
          </NavLink>
          .
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => persist('accepted')}
            className="flex-1 rounded-full bg-gradient-to-r from-[#FF5F6D] to-[#B067FF] text-white font-bold py-2 hover:opacity-90 transition-opacity"
          >
            Accept
          </button>
          <button
            onClick={() => persist('declined')}
            className="rounded-full bg-white border border-black/10 text-[#0a0a0a] font-bold px-4 py-2 hover:bg-gray-50 transition-colors"
          >
            Decline
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
