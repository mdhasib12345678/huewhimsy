import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Phone, MapPin, MessageCircle, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useRainbow } from '@/components/RainbowContext';
import { submitContactForm } from '@/lib/medusa';
import { SEO } from '@/components/SEO';

export const Contact: React.FC = () => {
  const { setIntensity } = useRainbow();
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'err'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    setIntensity(0.6);
    return () => setIntensity(0.7);
  }, []);

  // Pre-fill subject if coming from /services with ?service= param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const service = params.get('service');
    if (service) {
      setForm((f) => ({ ...f, subject: `Inquiry: ${service}` }));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMessage('');
    try {
      await submitContactForm({
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        subject: form.subject || undefined,
        message: form.message,
        page_url: window.location.href,
      });
      setStatus('ok');
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (e: any) {
      setStatus('err');
      setErrorMessage(e?.message?.includes('400') ? 'Please fill all fields correctly.' : 'Something went wrong. Try again later.');
    }
  };

  const setField = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="container-page section-y">
      <SEO
        title="Contact Us"
        description="Get in touch with the HueWhimsy team — questions, custom projects, partnerships welcome."
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10 sm:mb-14 max-w-3xl mx-auto"
      >
        <h1 className="fluid-h1 font-bold text-[#0a0a0a] mb-4 sm:mb-5">Get in Touch</h1>
        <p className="fluid-lead text-[#525252]">
          Questions, custom projects, partnerships — we'd love to hear from you.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
        {/* Contact info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4">
          {[
            { icon: Mail, label: 'Email', value: 'hello@huewhimsy.com', href: 'mailto:hello@huewhimsy.com', color: '#FF5F6D' },
            { icon: MessageCircle, label: 'Support', value: 'support@huewhimsy.com', href: 'mailto:support@huewhimsy.com', color: '#4DA8FF' },
            { icon: Phone, label: 'Phone', value: '+1 (555) 123-HUEW', href: 'tel:+15551234839', color: '#5BE37D' },
            { icon: MapPin, label: 'Studio', value: 'Dhaka · Bangladesh', href: null, color: '#B067FF' },
          ].map((item) => (
            <Card key={item.label} className="p-4 sm:p-5 border border-black/[0.07] bg-white shadow-sm hover:shadow-md transition-shadow rounded-2xl">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: item.color + '20' }}>
                  <item.icon className="w-5 h-5" style={{ color: item.color }} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#525252] mb-0.5">{item.label}</p>
                  {item.href ? (
                    <a href={item.href} className="text-[#0a0a0a] hover:text-[#FF5F6D] font-medium text-sm sm:text-base break-words">
                      {item.value}
                    </a>
                  ) : (
                    <p className="text-[#0a0a0a] font-medium text-sm sm:text-base">{item.value}</p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Form */}
        <Card className="lg:col-span-2 p-6 sm:p-8 lg:p-10 border border-black/[0.07] bg-white shadow-sm rounded-3xl">
          {status === 'ok' ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 rounded-full bg-[#5BE37D]/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-[#5BE37D]" />
              </div>
              <h2 className="text-3xl font-bold text-[#0a0a0a] mb-4">Message received!</h2>
              <p className="text-[#525252] mb-8">
                Thanks for reaching out. We'll reply within 1-2 business days.
              </p>
              <Button onClick={() => setStatus('idle')} variant="outline" className="rounded-full border-black/20">
                Send another message
              </Button>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-[#0a0a0a] mb-2">Name *</label>
                  <Input
                    required
                    value={form.name}
                    onChange={(e) => setField('name', e.target.value)}
                    placeholder="Your name"
                    className="bg-white border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD93D]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0a0a0a] mb-2">Email *</label>
                  <Input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setField('email', e.target.value)}
                    placeholder="you@example.com"
                    className="bg-white border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD93D]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0a0a0a] mb-2">Phone</label>
                  <Input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setField('phone', e.target.value)}
                    placeholder="Optional"
                    className="bg-white border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD93D]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0a0a0a] mb-2">Subject</label>
                  <Input
                    value={form.subject}
                    onChange={(e) => setField('subject', e.target.value)}
                    placeholder="What's this about?"
                    className="bg-white border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD93D]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0a0a0a] mb-2">Message *</label>
                <Textarea
                  required
                  minLength={10}
                  rows={6}
                  value={form.message}
                  onChange={(e) => setField('message', e.target.value)}
                  placeholder="Tell us more (at least 10 characters)..."
                  className="bg-white border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFD93D]"
                />
                <p className="text-xs text-[#525252] mt-1">{form.message.length}/5000 characters</p>
              </div>

              {status === 'err' && (
                <p className="text-sm text-red-600">{errorMessage}</p>
              )}

              <Button
                type="submit"
                disabled={status === 'sending'}
                className="w-full sm:w-auto rounded-full bg-gradient-to-r from-[#FF5F6D] to-[#B067FF] text-white px-8 sm:px-10 h-12 sm:h-13 text-sm sm:text-base font-semibold hover:opacity-95 transition-all shadow-[0_8px_24px_-8px_rgba(255,95,109,0.5)]"
              >
                {status === 'sending' ? 'Sending…' : '📩 Send Message'}
              </Button>

              <p className="text-xs text-[#525252]">
                We typically reply within 1-2 business days. By submitting you agree to our{' '}
                <a href="/privacy" className="underline">privacy policy</a>.
              </p>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};
