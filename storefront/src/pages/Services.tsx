import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { useRainbow } from '@/components/RainbowContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, ArrowRight, Laptop, Cpu, Palette, Share2, Flag, Book, BarChart, Shirt, Zap, Globe, Phone, Mail, Clock, CreditCard, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Services: React.FC = () => {
  const { setIntensity } = useRainbow();
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  useEffect(() => {
    setIntensity(0.15); // Minimal intensity for Services
    return () => setIntensity(0.7);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="container mx-auto px-4 py-32 text-center"
      >
         <div className="max-w-xl mx-auto space-y-8 bg-black/5 p-12 rounded-[3rem] border border-black/10 backdrop-blur-3xl">
            <div className="w-20 h-20 rounded-full bg-[#5BE37D]/20 flex items-center justify-center mx-auto mb-8">
               <Check className="w-10 h-10 text-[#5BE37D]" />
            </div>
            <div className="space-y-4 text-[#0a0a0a] text-lg">
              <p>Thank you for contacting Hue Whimsy.</p>
              <p>We have successfully received your project request.</p>
              <p>Our team will review your information and respond within 1–3 business days.</p>
              <p className="font-bold text-[#FFD93D]">We look forward to bringing your ideas to life.</p>
            </div>
            <Button onClick={() => setIsSubmitted(false)} variant="outline" className="rounded-full border-black/20 text-[#0a0a0a]">
              Send Another Request
            </Button>
         </div>
      </motion.div>
    );
  }

  const coreServices = [
    { title: 'Website Design', icon: Laptop, start: '$300', tiers: [{ n: 'Basic', p: '$300' }, { n: 'Standard', p: '$800' }, { n: 'Premium', p: '$1500' }] },
    { title: 'AI Agent & Automation', icon: Cpu, start: '$4,999', tiers: [{ n: 'Starter', p: '$4999' }, { n: 'Professional', p: '$5999' }, { n: 'Premium', p: '$8999' }] },
    { title: 'Custom Illustration', icon: Palette, start: '$120', tiers: [{ n: 'Basic', p: '$120' }, { n: 'Standard', p: '$250' }, { n: 'Premium', p: '$500' }] },
    { title: 'Coloring Page Design', icon: Book, start: '$100', tiers: [{ n: 'Basic', p: '$100' }, { n: 'Standard', p: '$220' }, { n: 'Premium', p: '$450' }] },
    { title: 'Book Design', icon: Book, start: '$300', tiers: [{ n: 'Basic', p: '$300' }, { n: 'Standard', p: '$700' }, { n: 'Premium', p: '$1200' }] },
    { title: 'Logo Design', icon: Zap, start: '$100', tiers: [{ n: 'Basic', p: '$100' }, { n: 'Standard', p: '$250' }, { n: 'Premium', p: '$500' }] },
    { title: 'T-Shirt Design', icon: Shirt, start: '$80', tiers: [{ n: 'Basic', p: '$80' }, { n: 'Standard', p: '$180' }, { n: 'Premium', p: '$350' }] },
    { title: 'Banner Design', icon: Flag, start: '$80', tiers: [{ n: 'Web', p: '$80' }, { n: 'Social', p: '$180' }, { n: 'Event', p: '$400' }] },
  ];

  const aiAgentPlans = [
    { name: 'Starter', price: '$4,999', features: ['Basic AI Integration', 'Custom Persona', 'Email Support', 'Standard Response Time'] },
    { name: 'Professional', price: '$5,999', features: ['Advanced RAG System', 'Multi-channel Support', 'Direct Line Support', 'Priority Training'], highlight: true },
    { name: 'Premium', price: '$8,999', features: ['Full Enterprise Scaling', 'Self-Learning capabilities', '24/7 Monitoring', 'Dedicated Management'] },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-24"
    >
      {/* Hero Section - Corporate Style */}
      <section className="relative overflow-hidden pt-32 pb-20 border-b border-black/5 bg-white/[0.02]">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl">
            <motion.div 
               initial={{ x: -20, opacity: 0 }}
               animate={{ x: 0, opacity: 1 }}
               className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 border border-black/10 mb-8"
            >
              <div className="w-2 h-2 rounded-full bg-[#5BE37D] animate-pulse" />
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#525252]">Premium Creative Agency</span>
            </motion.div>
            
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold text-[#0a0a0a] mb-8 leading-[1.1]"
            >
              Premium Design & <br />
              <span className="text-[#0a0a0a]/50">Next-Gen Automation</span>
            </motion.h1>
            
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-[#525252] max-w-2xl mb-12 leading-relaxed"
            >
              We combine artistic whimsy with high-end technology. From custom character illustrations to sophisticated AI agents, we bring elite creative solutions to your brand.
            </motion.p>
            
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              <Button size="lg" className="rounded-full bg-white text-black hover:bg-[#F5F5F5] px-8 py-7 text-lg font-semibold">
                Start a Project
              </Button>
              <Button size="lg" variant="outline" className="rounded-full border-black/20 text-[#0a0a0a] hover:bg-black/5 px-8 py-7 text-lg font-semibold">
                View Portfolio
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="container mx-auto px-4 py-24">
        <div className="mb-20">
          <h2 className="text-3xl md:text-5xl font-bold text-[#0a0a0a] mb-6">Our Capabilities</h2>
          <div className="w-20 h-1 bg-gradient-to-r from-[#FF9A3C] to-[#B067FF] rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {coreServices.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.02 }}
            >
              <Card className="h-full border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] transition-all cursor-pointer backdrop-blur-xl group">
                <CardContent className="p-8 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-2xl bg-black/5 flex items-center justify-center mb-6 border border-black/10 group-hover:border-[#FFD93D]/30 transition-colors">
                    <s.icon className="w-6 h-6 text-[#525252] group-hover:text-black transition-colors" />
                  </div>
                  <h4 className="text-lg font-bold text-[#0a0a0a] mb-2 leading-tight">{s.title}</h4>
                  <p className="text-xs text-[#525252] uppercase tracking-widest font-bold">Starts at {s.start}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* AI Agent Pricing */}
      <section className="bg-white/[0.02] border-y border-black/5 py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <Badge className="bg-[#B067FF] mb-4">Elite Tech Solutons</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-[#0a0a0a] mb-6">AI Agent & Automation</h2>
            <p className="text-[#525252] max-w-2xl mx-auto">Future-proof your business with custom AI agents designed for efficiency, intelligence, and brand voice.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {aiAgentPlans.map((plan, i) => (
              <Card key={plan.name} className={cn(
                "border-black/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden relative",
                plan.highlight && "border-[#B067FF]/50 ring-1 ring-[#B067FF]/50 scale-105 z-10"
              )}>
                {plan.highlight && (
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#B067FF] to-[#4DA8FF]" />
                )}
                <CardHeader className="p-8 pb-0">
                  <CardTitle className="text-2xl font-bold text-[#0a0a0a]">{plan.name}</CardTitle>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-[#0a0a0a] tracking-tight">{plan.price}</span>
                    <span className="text-[#525252] text-sm font-medium">/ project</span>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <ul className="space-y-4">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-3 text-[#525252] text-sm">
                        <Check className="w-4 h-4 text-[#5BE37D]" /> {f}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="p-8 pt-0">
                  <Button className={cn(
                    "w-full rounded-full h-12 font-bold transition-all",
                    plan.highlight ? "bg-white text-black hover:bg-[#F5F5F5]" : "bg-black/5 text-[#0a0a0a] hover:bg-black/10"
                  )}>
                    Select {plan.name}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Custom Project Form */}
      <section className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#0a0a0a] mb-4">Custom Project Inquiry</h2>
            <p className="text-[#525252]">Have a unique idea? Tell us about your project and we'll bring it to life.</p>
          </div>

          <Card className="border-black/10 bg-white/[0.03] backdrop-blur-3xl overflow-hidden p-8 md:p-12">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-[#0a0a0a]">Full Name</Label>
                  <Input id="name" placeholder="John Doe" className="bg-black/5 border-black/10 text-[#0a0a0a] rounded-xl h-12 outline-none focus:ring-1 focus:ring-[#FFD93D]" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business" className="text-[#0a0a0a]">Business Name</Label>
                  <Input id="business" placeholder="Your Company" className="bg-black/5 border-black/10 text-[#0a0a0a] rounded-xl h-12 outline-none focus:ring-1 focus:ring-[#FFD93D]" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[#0a0a0a]">Email Address</Label>
                  <Input id="email" type="email" placeholder="john@example.com" className="bg-black/5 border-black/10 text-[#0a0a0a] rounded-xl h-12 outline-none focus:ring-1 focus:ring-[#FFD93D]" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-[#0a0a0a]">Customer Mobile Number</Label>
                  <div className="flex gap-2">
                    <Select defaultValue="us">
                       <SelectTrigger className="w-28 bg-black/5 border-black/10 text-[#0a0a0a] rounded-xl h-12">
                         <SelectValue placeholder="Flag" />
                       </SelectTrigger>
                       <SelectContent className="bg-black text-[#0a0a0a] border-black/10">
                         <SelectItem value="us">🇺🇸 +1</SelectItem>
                         <SelectItem value="uk">🇬🇧 +44</SelectItem>
                         <SelectItem value="ca">🇨🇦 +1</SelectItem>
                         <SelectItem value="au">🇦🇺 +61</SelectItem>
                         <SelectItem value="br">🇧🇷 +55</SelectItem>
                         <SelectItem value="eu">🇪🇺 +49</SelectItem>
                       </SelectContent>
                    </Select>
                    <Input id="phone" placeholder="555-0123" className="flex-grow bg-black/5 border-black/10 text-[#0a0a0a] rounded-xl h-12 outline-none focus:ring-1 focus:ring-[#FFD93D]" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone" className="text-[#0a0a0a]">Country / Time Zone</Label>
                  <Input id="timezone" placeholder="e.g. USA / EST" className="bg-black/5 border-black/10 text-[#0a0a0a] rounded-xl h-12 outline-none focus:ring-1 focus:ring-[#FFD93D]" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="service" className="text-[#0a0a0a]">Service Category</Label>
                  <Select>
                    <SelectTrigger className="bg-black/5 border-black/10 text-[#0a0a0a] rounded-xl h-12">
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent className="bg-black text-[#0a0a0a] border-black/10">
                      {coreServices.map(s => (
                        <SelectItem key={s.title} value={s.title.toLowerCase().replace(/ /g, '-')}>{s.title}</SelectItem>
                      ))}
                      <SelectItem value="custom">Other / Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="budget" className="text-[#0a0a0a]">Project Budget</Label>
                  <Select>
                    <SelectTrigger className="bg-black/5 border-black/10 text-[#0a0a0a] rounded-xl h-12">
                      <SelectValue placeholder="Select budget range" />
                    </SelectTrigger>
                    <SelectContent className="bg-black text-[#0a0a0a] border-black/10">
                      <SelectItem value="under-500">Under $500</SelectItem>
                      <SelectItem value="500-1000">$500–$1000</SelectItem>
                      <SelectItem value="1000-3000">$1000–$3000</SelectItem>
                      <SelectItem value="3000-5000">$3000–$5000</SelectItem>
                      <SelectItem value="5000+">$5000+</SelectItem>
                      <SelectItem value="flexible">Flexible / Let's Discuss</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeline" className="text-[#0a0a0a]">Project Timeline</Label>
                  <Input id="timeline" placeholder="e.g., 4 weeks" className="bg-black/5 border-black/10 text-[#0a0a0a] rounded-xl h-12 outline-none focus:ring-1 focus:ring-[#FFD93D]" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website" className="text-[#0a0a0a]">Website URL</Label>
                  <Input id="website" placeholder="https://example.com" className="bg-black/5 border-black/10 text-[#0a0a0a] rounded-xl h-12 outline-none focus:ring-1 focus:ring-[#FFD93D]" />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="social" className="text-[#0a0a0a]">Social Media Links</Label>
                  <Input id="social" placeholder="Instagram, Twitter, etc." className="bg-black/5 border-black/10 text-[#0a0a0a] rounded-xl h-12 outline-none focus:ring-1 focus:ring-[#FFD93D]" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-[#0a0a0a]">Project Description</Label>
                  <Textarea id="description" placeholder="Briefly describe your goals..." className="bg-black/5 border-black/10 text-[#0a0a0a] rounded-xl min-h-[85px] outline-none focus:ring-1 focus:ring-[#FFD93D]" />
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-black/10 space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                 <div className="flex-grow space-y-2">
                   <Label className="text-[#0a0a0a]">Attachments (JPG, PNG, PDF, ZIP)</Label>
                   <div className="border-2 border-dashed border-black/10 rounded-2xl p-6 flex flex-col items-center justify-center hover:bg-black/5 transition-colors cursor-pointer group">
                      <Upload className="w-8 h-8 text-[#525252] mb-2 group-hover:text-black transition-colors" />
                      <span className="text-sm text-[#525252]">Click or drag files to upload</span>
                   </div>
                 </div>
              </div>
              
              <div className="flex flex-col gap-4">
                <Label className="text-[#0a0a0a]">Preferred Contact Method</Label>
                <div className="flex flex-wrap gap-4">
                  {['Email', 'Phone Call', 'WhatsApp', 'Zoom', 'Google Meet'].map(m => (
                    <div key={m} className="flex items-center gap-2">
                      <input type="checkbox" id={m} className="rounded border-black/20 bg-black/5" />
                      <label htmlFor={m} className="text-sm text-[#525252]">{m}</label>
                    </div>
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full rounded-full h-14 text-lg font-bold bg-white text-black hover:bg-[#F5F5F5] transition-all hover:scale-[1.01] active:scale-[0.99] mt-4">
                Send Inquiry <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
            </form>
          </Card>
        </div>
      </section>

      {/* Corporate Features */}
      <section className="container mx-auto px-4 py-24 border-t border-black/5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
           {[
             { icon: Globe, title: 'Global Delivery', text: 'Serving clients worldwide with 24/7 support.' },
             { icon: Clock, title: 'Fast Turnaround', text: 'Proprietary workflows ensure rapid delivery.' },
             { icon: CreditCard, title: 'Secure Payment', text: 'Stripe & PayPal integrated billing systems.' },
             { icon: Mail, title: 'Direct Support', text: 'Dedicated project managers for every client.' },
           ].map((feat, i) => (
             <div key={i} className="flex flex-col gap-4">
                <div className="w-10 h-10 rounded-xl bg-black/5 border border-black/10 flex items-center justify-center">
                  <feat.icon className="w-5 h-5 text-[#525252]" />
                </div>
                <h5 className="text-[#0a0a0a] font-bold">{feat.title}</h5>
                <p className="text-sm text-[#525252] leading-relaxed">{feat.text}</p>
             </div>
           ))}
        </div>
      </section>
    </motion.div>
  );
};
