'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Receipt,
  ChevronRight,
  Shield,
  BarChart3,
  Bell,
  FileText,
  TrendingUp,
  Menu,
  X,
  Globe,
  Lock,
  Zap,
  CheckCircle,
  ArrowRight,
  DollarSign,
  Users,
  Clock,
  ArrowUpRight,
  Calculator,
  PieChart,
  AlertCircle,
  Download,
  Star,
  Code,
  GitBranch
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const PurpleCorner = ({ position }: { position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' }) => {
  const positions = {
    'top-left': 'top-0 left-0 border-t-2 border-l-2',
    'top-right': 'top-0 right-0 border-t-2 border-r-2',
    'bottom-left': 'bottom-0 left-0 border-b-2 border-l-2',
    'bottom-right': 'bottom-0 right-0 border-b-2 border-r-2',
  };

  return (
    <div className={`absolute w-3 h-3 ${positions[position]} border-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]`} />
  );
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-zinc-950/90 backdrop-blur-xl border-b border-purple-500/20 py-3' : 'bg-transparent py-6'
        }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center border border-purple-500/40 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all">
            <Calculator className="w-5 h-5 text-purple-400" />
          </div>
          <span className="font-bold text-2xl tracking-tighter text-foreground uppercase italic">TaxMate</span>
        </Link>

        <div className="hidden md:flex items-center gap-10">
          {['Features', 'Pricing', 'Security', 'Docs'].map((item) => (
            <Link
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-xs uppercase tracking-widest font-bold text-zinc-400 hover:text-purple-400 transition-colors relative group"
            >
              {item}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-500 transition-all group-hover:w-full" />
            </Link>
          ))}
          <div className="h-6 w-[1px] bg-zinc-800 mx-2" />
          <Link href="/auth/login">
            <Button variant="ghost" size="sm" className="text-xs uppercase tracking-widest font-bold text-zinc-300 hover:text-white">Log In</Button>
          </Link>
          <Link href="/auth/signup">
            <Button size="sm" className="bg-purple-600 text-white hover:bg-purple-500 rounded-md border border-purple-400/50 shadow-[0_0_15px_rgba(168,85,247,0.2)] px-6 text-xs uppercase tracking-widest font-bold transition-all">
              Sign Up
            </Button>
          </Link>
        </div>

        <button className="md:hidden text-purple-400" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-zinc-900/95 backdrop-blur-xl border-b border-purple-500/20"
          >
            <div className="container mx-auto px-6 py-6 flex flex-col gap-6">
              {['Features', 'Pricing', 'Security', 'Docs'].map((item) => (
                <Link
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  onClick={() => setIsOpen(false)}
                  className="text-sm uppercase tracking-widest font-bold text-zinc-400 hover:text-purple-400 transition-colors"
                >
                  {item}
                </Link>
              ))}
              <div className="h-[1px] bg-zinc-800 my-2" />
              <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full text-xs uppercase tracking-widest font-bold">Log In</Button>
              </Link>
              <Link href="/auth/signup" onClick={() => setIsOpen(false)}>
                <Button size="sm" className="w-full bg-purple-600 text-white hover:bg-purple-500">Sign Up</Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

const FeatureCardDuplicate = ({ icon: Icon, title, description, delay }: { icon: any, title: string, description: string, delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    viewport={{ once: true }}
  >
    <Card className="relative p-8 bg-zinc-900/40 border-zinc-800 hover:border-purple-500/50 transition-all duration-500 rounded-xl group overflow-hidden h-full">
      <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity">
        <Icon className="w-24 h-24 rotate-12 text-purple-500" />
      </div>
      <div className="relative z-10 flex flex-col h-full">
        <div className="w-14 h-14 bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6 group-hover:bg-purple-600 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all rounded-lg">
          <Icon className="w-6 h-6 text-purple-400 group-hover:text-white transition-colors" />
        </div>
        <h3 className="text-xl font-bold mb-4 uppercase tracking-tighter italic text-zinc-100">{title}</h3>
        <p className="text-sm text-zinc-400 leading-relaxed font-medium flex-grow">{description}</p>
        <div className="mt-8 flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
          Learn More <ArrowRight className="w-3 h-3" />
        </div>
      </div>
    </Card>
  </motion.div>
);

const TestimonialCard = ({ quote, author, role, delay }: { quote: string, author: string, role: string, delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    viewport={{ once: true }}
  >
    <Card className="p-8 bg-zinc-900/40 border-zinc-800 hover:border-purple-500/50 transition-all rounded-xl">
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-purple-400 text-purple-400" />
        ))}
      </div>
      <p className="text-sm text-zinc-300 leading-relaxed mb-6 italic">&quot;{quote}&quot;</p>
      <div className="flex items-center gap-3 pt-4 border-t border-zinc-800">
        <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
          <Users className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <p className="text-xs font-bold text-white uppercase tracking-widest">{author}</p>
          <p className="text-xs text-zinc-500 uppercase tracking-widest">{role}</p>
        </div>
      </div>
    </Card>
  </motion.div>
);

function LandingPageDuplicate() {
  return (
    <div className="min-h-screen bg-zinc-950 text-foreground selection:bg-purple-500 selection:text-white overflow-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 pb-10 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-zinc-950" />
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `radial-gradient(circle, #a855f7 0.5px, transparent 0.5px)`,
            backgroundSize: '40px 40px'
          }} />
          {/* Animated orbs */}
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-600/5 blur-[150px] rounded-full animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-600/5 blur-[120px] rounded-full" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <Badge variant="outline" className="border-purple-500/30 text-purple-400 rounded-full px-4 py-1.5 uppercase tracking-widest text-[10px] font-bold bg-purple-500/5 mx-auto w-fit inline-block">
                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2 animate-pulse inline-block" />
                The Future of Tax Management
              </Badge>

              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter uppercase italic leading-[1] text-white drop-shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                Tax Management<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">Simplified</span>
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto font-medium leading-relaxed">
                Powerful tools for automated tax calculations, real-time insights, and expert guidance. Trusted by 10,000+ businesses worldwide.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
                <Link href="/auth/signup" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full h-14 bg-purple-600 text-white hover:bg-purple-500 rounded-xl px-10 text-sm font-black uppercase tracking-widest group shadow-[0_0_30px_rgba(168,85,247,0.3)] border border-purple-400/30 transition-all hover:shadow-[0_0_50px_rgba(168,85,247,0.4)]">
                    Start Free Trial <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="#features" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full h-14 rounded-xl border-zinc-800 text-xs uppercase tracking-widest font-bold px-10 hover:bg-zinc-900 text-zinc-300 hover:text-white transition-colors">
                    See Features
                  </Button>
                </Link>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="flex items-center justify-center gap-2 text-sm text-zinc-500 font-medium pt-4"
              >
                <CheckCircle className="w-4 h-4 text-green-500" />
                No credit card required • 14-day free trial
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Quickbar - Enhanced */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-gradient-to-r from-purple-600/10 via-purple-500/5 to-purple-600/10 border-y border-purple-500/20 py-12 relative overflow-hidden backdrop-blur-sm"
      >
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `linear-gradient(45deg, #a855f7 0.5px, transparent 0.5px, transparent 40px, #a855f7 40px, #a855f7 40.5px, transparent 40.5px, transparent 80px)`,
          backgroundSize: '56px 56px'
        }} />
        <div className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10 relative z-10">
          {[
            { label: 'Active Users', val: '10K+', icon: Users, color: 'from-blue-500 to-cyan-500' },
            { label: 'Returns Filed', val: '50K+', icon: FileText, color: 'from-green-500 to-emerald-500' },
            { label: 'Time Saved', val: '40hrs/yr', icon: Clock, color: 'from-orange-500 to-yellow-500' },
            { label: 'Compliance', val: '100%', icon: CheckCircle, color: 'from-purple-500 to-pink-500' }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center group"
            >
              <div className={`p-3 border border-zinc-700 text-white rounded-lg bg-gradient-to-br ${item.color} mb-4 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all`}>
                <item.icon className="w-6 h-6" />
              </div>
              <div className="text-2xl sm:text-3xl md:text-4xl font-black italic tracking-tighter text-white group-hover:text-purple-300 transition-colors">{item.val}</div>
              <div className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mt-2">{item.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Features Section */}
      <section id="features" className="py-32 px-6 relative">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 space-y-4">
            <Badge variant="outline" className="border-purple-500/30 text-purple-400 rounded-full px-4 py-1.5 uppercase tracking-widest text-[10px] font-bold bg-purple-500/5 mx-auto w-fit inline-block">
              Features
            </Badge>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase italic tracking-tighter leading-tight text-white">
              Everything You Need
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto text-center">Comprehensive tools designed to make tax management effortless and accurate</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCardDuplicate icon={Calculator} title="Smart Calculations" description="Real-time tax calculations with automatic updates as your data changes." delay={0.1} />
            <FeatureCardDuplicate icon={BarChart3} title="Advanced Analytics" description="Deep insights into your tax position with predictive reporting." delay={0.2} />
            <FeatureCardDuplicate icon={FileText} title="Document Management" description="Organize and store all tax documents in one secure location." delay={0.3} />
            <FeatureCardDuplicate icon={Bell} title="Compliance Alerts" description="Get notified of important deadlines and compliance requirements." delay={0.4} />
            <FeatureCardDuplicate icon={Download} title="Easy Export" description="Export documents in formats ready for e-filing or review." delay={0.5} />
            <FeatureCardDuplicate icon={Shield} title="Bank-Level Security" description="Enterprise-grade encryption protecting your financial data." delay={0.6} />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-32 px-6 bg-purple-600/5 relative border-y border-purple-500/20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 space-y-4">
            <Badge variant="outline" className="border-purple-500/30 text-purple-400 rounded-full px-4 py-1.5 uppercase tracking-widest text-[10px] font-bold bg-purple-500/5 mx-auto w-fit inline-block">
              Testimonials
            </Badge>
            <h2 className="text-5xl font-black uppercase italic tracking-tighter text-white">
              Loved by accountants
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">See what our users say about TaxMate</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <TestimonialCard
              quote="This tool has completely transformed how we manage taxes. What used to take hours now takes minutes."
              author="Sarah Johnson"
              role="Tax Consultant"
              delay={0.1}
            />
            <TestimonialCard
              quote="The automation features alone have saved us hundreds of hours per year. Absolutely worth it."
              author="Michael Chen"
              role="CFO, TechCorp"
              delay={0.2}
            />
            <TestimonialCard
              quote="Finally, a tax management tool that actually works! The support team is incredible too."
              author="Emily Rodriguez"
              role="Accounting Manager"
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 px-6 relative">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16 space-y-4">
            <Badge variant="outline" className="border-purple-500/30 text-purple-400 rounded-full px-4 py-1.5 uppercase tracking-widest text-[10px] font-bold bg-purple-500/5 mx-auto w-fit inline-block">
              Pricing
            </Badge>
            <h2 className="text-5xl font-black uppercase italic tracking-tighter text-white">
              Simple, Transparent Pricing
            </h2>
            <p className="text-zinc-400">Choose the perfect plan for your business. All plans include professional support.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                name: 'Starter',
                price: '9',
                desc: 'Perfect for individuals',
                features: ['Basic tax calculations', 'Document storage (1GB)', 'Email support', 'Monthly reports'],
                cta: 'Get Started'
              },
              {
                name: 'Professional',
                price: '29',
                desc: 'For accountants & businesses',
                features: ['Advanced calculations', 'Unlimited storage', 'Real-time analytics', 'Priority support', 'API access'],
                popular: true,
                cta: 'Start Free Trial'
              }
            ].map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative p-10 md:p-12 rounded-2xl ${plan.popular
                  ? 'bg-gradient-to-br from-purple-600 to-purple-800 text-white shadow-2xl shadow-purple-500/20 ring-2 ring-purple-400'
                  : 'bg-zinc-900 border border-zinc-800 text-foreground'
                  }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-black mb-2 uppercase tracking-tighter italic">{plan.name}</h3>
                <p className={`text-sm mb-8 ${plan.popular ? 'text-white/80' : 'text-zinc-400'}`}>{plan.desc}</p>
                <div className="mb-10">
                  <span className="text-5xl font-black tracking-tighter">${plan.price}</span>
                  <span className={plan.popular ? 'text-white/80' : 'text-zinc-400'}>/month</span>
                </div>
                <Link href="/auth/signup" className="block mb-10">
                  <Button
                    size="lg"
                    className={`w-full font-black uppercase tracking-widest ${plan.popular
                      ? 'bg-white text-purple-600 hover:bg-zinc-100'
                      : 'bg-purple-600 text-white hover:bg-purple-500'
                      }`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
                <ul className="space-y-4">
                  {plan.features.map((feature, fi) => (
                    <li key={fi} className="flex items-center gap-3 text-sm font-medium">
                      <CheckCircle className="w-5 h-5 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-16 space-y-3">
            <p className="text-zinc-400 font-medium">All plans include 14-day free trial. No credit card required.</p>
            <Link href="/pricing" className="text-purple-400 font-bold hover:text-purple-300 inline-flex items-center gap-2 text-sm uppercase tracking-widest">
              View all plans and features <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-32 px-6 bg-zinc-900/50 relative border-y border-zinc-800">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16 space-y-4">
            <Badge variant="outline" className="border-purple-500/30 text-purple-400 rounded-full px-4 py-1.5 uppercase tracking-widest text-[10px] font-bold bg-purple-500/5 mx-auto w-fit inline-block">
              Security
            </Badge>
            <h2 className="text-5xl font-black uppercase italic tracking-tighter text-white">
              Enterprise Security
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">Your data is protected with bank-level encryption and compliance standards</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Lock, title: 'End-to-End Encryption', desc: 'Army-grade AES-256 encryption for all data' },
              { icon: Shield, title: 'GDPR Compliant', desc: 'Full compliance with GDPR and data protection laws' },
              { icon: CheckCircle, title: 'SOC 2 Certified', desc: 'Independently audited and certified' },
              { icon: Zap, title: '99.9% Uptime', desc: 'Enterprise-grade infrastructure and redundancy' },
              { icon: Lock, title: 'Multi-Factor Auth', desc: '2FA and SSO support for all accounts' },
              { icon: Globe, title: 'Data Residency', desc: 'Choose where your data is stored' }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="p-8 bg-zinc-900/40 border border-zinc-800 rounded-xl hover:border-purple-500/30 transition-all group"
              >
                <div className="p-3 w-fit bg-purple-500/10 border border-purple-500/20 rounded-lg mb-4 group-hover:bg-purple-500/20 transition-all">
                  <item.icon className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="font-bold text-white mb-2 uppercase tracking-tight italic">{item.title}</h3>
                <p className="text-sm text-zinc-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 relative">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative p-12 md:p-20 bg-gradient-to-br from-purple-600 via-purple-600 to-purple-800 text-white flex flex-col items-center text-center rounded-3xl overflow-hidden shadow-2xl shadow-purple-500/40 border border-purple-400/30"
          >
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/5 rounded-full blur-3xl" />

            <div className="relative z-10 space-y-8">
              <h2 className="text-5xl md:text-6xl font-black tracking-tighter uppercase italic leading-tight">
                Ready to Transform Your Tax Management?
              </h2>
              <p className="max-w-xl mx-auto text-lg font-bold leading-relaxed text-white/90">
                Join 10,000+ businesses and accounting professionals who are saving time and reducing errors with TaxMate.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link href="/auth/signup">
                  <Button size="lg" className="bg-white text-purple-600 hover:bg-zinc-100 font-black px-10 rounded-lg h-14 uppercase tracking-widest">
                    Start Your Free Trial
                  </Button>
                </Link>
                <Link href="#features">
                  <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 font-black h-14 rounded-lg uppercase tracking-widest">
                    See Demo
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-white/70 font-medium">✓ 14-day free trial • ✓ No credit card • ✓ 24/7 support</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-zinc-900 px-6 bg-zinc-950">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-5 gap-12 mb-20">
            <div className="md:col-span-1 space-y-6">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Calculator className="w-5 h-5 text-white" />
                </div>
                <span className="font-black text-xl tracking-tighter uppercase italic text-white">TaxMate</span>
              </Link>
              <p className="text-xs text-zinc-500 font-medium leading-relaxed uppercase tracking-widest">
                Simplify tax compliance with smart tools built for modern businesses.
              </p>
              <div className="flex gap-4 pt-2">
                <a href="#" className="text-zinc-500 hover:text-purple-400 transition-colors">
                  <Globe className="w-5 h-5" />
                </a>
                <a href="#" className="text-zinc-500 hover:text-purple-400 transition-colors">
                  <Users className="w-5 h-5" />
                </a>
              </div>
            </div>

            {[
              {
                title: 'Product',
                items: ['Features', 'Pricing', 'Security', 'Roadmap']
              },
              {
                title: 'Company',
                items: ['About', 'Blog', 'Careers', 'Press']
              },
              {
                title: 'Resources',
                items: ['Documentation', 'API Docs', 'Community', 'Support']
              },
              {
                title: 'Legal',
                items: ['Privacy', 'Terms', 'Cookies', 'Compliance']
              }
            ].map((col) => (
              <div key={col.title} className="space-y-6">
                <h4 className="text-[10px] uppercase tracking-[0.3em] font-black text-white">{col.title}</h4>
                <div className="flex flex-col gap-3">
                  {col.items.map(item => (
                    <Link key={item} href="#" className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-purple-400 transition-colors">
                      {item}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-10 border-t border-zinc-900">
            <div className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.2em]">
              &copy; {new Date().getFullYear()} TAXMATE INC. ALL RIGHTS RESERVED.
            </div>
            <div className="flex gap-6 text-zinc-600 text-xs font-bold uppercase tracking-widest">
              <a href="#" className="hover:text-purple-500 transition-colors">Status</a>
              <a href="#" className="hover:text-purple-500 transition-colors">Contact</a>
              <a href="#" className="hover:text-purple-500 transition-colors">Sitemap</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Purple accent theme
const PurpleCornerDuplicate = ({ position }: { position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' }) => {
  const positions = {
    'top-left': 'top-0 left-0 border-t-2 border-l-2',
    'top-right': 'top-0 right-0 border-t-2 border-r-2',
    'bottom-left': 'bottom-0 left-0 border-b-2 border-l-2',
    'bottom-right': 'bottom-0 right-0 border-b-2 border-r-2',
  };

  return (
    <div className={`absolute w-3 h-3 ${positions[position]} border-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]`} />
  );
};

const NavbarDuplicate = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-zinc-950/90 backdrop-blur-xl border-b border-purple-500/20 py-3' : 'bg-transparent py-6'
        }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center border border-purple-500/40 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all">
            <Calculator className="w-5 h-5 text-purple-400" />
          </div>
          <span className="font-bold text-2xl tracking-tighter text-foreground uppercase italic">TaxMate</span>
        </Link>

        <div className="hidden md:flex items-center gap-10">
          {['Features', 'Pricing', 'Compliance', 'Resources'].map((item) => (
            <Link
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-xs uppercase tracking-widest font-bold text-zinc-400 hover:text-purple-400 transition-colors relative group"
            >
              {item}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-500 transition-all group-hover:w-full" />
            </Link>
          ))}
          <div className="h-6 w-[1px] bg-zinc-800 mx-2" />
          <Link href="/auth/login">
            <Button variant="ghost" size="sm" className="text-xs uppercase tracking-widest font-bold text-zinc-300 hover:text-white">Log In</Button>
          </Link>
          <Link href="/auth/register">
            <Button size="sm" className="bg-purple-600 text-white hover:bg-purple-500 rounded-md border border-purple-400/50 shadow-[0_0_15px_rgba(168,85,247,0.2)] px-6 text-xs uppercase tracking-widest font-bold transition-all">
              Sign Up Free
            </Button>
          </Link>
        </div>

        <button className="md:hidden text-purple-400" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-zinc-900/95 backdrop-blur-xl border-b border-purple-500/20"
          >
            <div className="container mx-auto px-6 py-6 flex flex-col gap-6">
              {['Features', 'Pricing', 'Compliance', 'Resources'].map((item) => (
                <Link
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  onClick={() => setIsOpen(false)}
                  className="text-sm uppercase tracking-widest font-bold text-zinc-400 hover:text-purple-400 transition-colors"
                >
                  {item}
                </Link>
              ))}
              <div className="h-[1px] bg-zinc-800 my-2" />
              <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full text-xs uppercase tracking-widest font-bold">Log In</Button>
              </Link>
              <Link href="/auth/register" onClick={() => setIsOpen(false)}>
                <Button size="sm" className="w-full bg-purple-600 text-white hover:bg-purple-500">Sign Up Free</Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

const FeatureCard = ({ icon: Icon, title, description, delay }: { icon: any, title: string, description: string, delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    viewport={{ once: true }}
  >
    <Card className="relative p-8 bg-zinc-900/40 border-zinc-800 hover:border-purple-500/50 transition-all duration-500 rounded-xl group overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity">
        <Icon className="w-24 h-24 rotate-12 text-purple-500" />
      </div>
      <div className="relative z-10">
        <div className="w-14 h-14 bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6 group-hover:bg-purple-600 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all rounded-lg">
          <Icon className="w-6 h-6 text-purple-400 group-hover:text-white transition-colors" />
        </div>
        <h3 className="text-xl font-bold mb-4 uppercase tracking-tighter italic text-zinc-100">{title}</h3>
        <p className="text-sm text-zinc-400 leading-relaxed font-medium">{description}</p>
        <div className="mt-8 flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
          Learn More <ArrowRight className="w-3 h-3" />
        </div>
      </div>
    </Card>
  </motion.div>
);

export default function LandingPageMain() {
  return (
    <div className="min-h-screen bg-zinc-950 text-foreground selection:bg-purple-500 selection:text-white">
      <NavbarDuplicate />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-zinc-950" />
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `radial-gradient(circle, #a855f7 0.5px, transparent 0.5px)`,
            backgroundSize: '40px 40px'
          }} />

          {/* Subtle glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 blur-[120px] rounded-full" />
          
          <div className="absolute inset-0 flex items-center justify-center opacity-5 blur-[2px]">
            <PieChart className="w-[800px] h-[800px] text-purple-500" strokeWidth={0.5} />
          </div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-10">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-6"
              >
                <Badge variant="outline" className="border-purple-500/30 text-purple-400 rounded-full px-4 py-1.5 uppercase tracking-widest text-[10px] font-bold bg-purple-500/5">
                  <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2 animate-pulse" />
                  Smart Tax Management Made Simple
                </Badge>

                <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic leading-[0.9] text-white">
                  Tax Done <br />
                  <span className="text-purple-500 drop-shadow-[0_0_25px_rgba(168,85,247,0.4)]">Right. Every Time.</span>
                </h1>

                <p className="text-lg md:text-xl text-zinc-400 max-w-xl font-medium leading-relaxed">
                  Simplify tax compliance with automated calculations, real-time insights, and expert guidance—all designed for modern businesses.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-6 pt-6">
                  <Link href="/auth/register" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full h-14 bg-purple-600 text-white hover:bg-purple-500 rounded-xl px-10 text-sm font-black uppercase tracking-widest group shadow-[0_0_30px_rgba(168,85,247,0.2)] border border-purple-400/20">
                      Start Free Trial <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="#features" className="w-full sm:w-auto">
                    <Button size="lg" variant="outline" className="w-full h-14 rounded-xl border-zinc-800 text-xs uppercase tracking-widest font-bold px-10 hover:bg-zinc-900 text-zinc-300">
                      Learn More
                    </Button>
                  </Link>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="grid grid-cols-3 gap-8 pt-8 border-t border-zinc-800"
              >
                {[
                  { label: 'Accuracy', val: '99.9%', icon: CheckCircle },
                  { label: 'Setup Time', val: '<5min', icon: Clock },
                  { label: 'Compliance', val: 'Latest', icon: Shield }
                ].map((stat, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center gap-2 text-purple-400 font-black uppercase italic tracking-tighter">
                      <stat.icon className="w-3 h-3" />
                      {stat.val}
                    </div>
                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 1 }}
              className="relative hidden lg:block"
            >
              <div className="relative aspect-square max-w-md mx-auto">
                <div className="absolute inset-0 border-[40px] border-purple-500/5 rounded-full animate-[spin_20s_linear_infinite]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-72 h-72 bg-zinc-950 border border-purple-500/20 rotate-45 flex items-center justify-center overflow-hidden shadow-[0_0_50px_rgba(168,85,247,0.1)] rounded-3xl">
                    <div className="-rotate-45 flex flex-col items-center gap-4">
                      <Receipt className="w-16 h-16 text-purple-500" />
                      <span className="text-purple-400 font-black uppercase tracking-widest text-sm italic">Tax Ready</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Quickbar */}
      <div className="bg-zinc-900/30 border-y border-zinc-800 py-10 relative overflow-hidden">
        <div className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-10 relative z-10">
          {[
            { label: 'Active Users', val: '10K+', icon: Users },
            { label: 'Returns Filed', val: '50K+', icon: FileText },
            { label: 'Time Saved', val: '40hrs/yr', icon: Clock },
            { label: 'Compliance', val: '100%', icon: CheckCircle }
          ].map((item, i) => (
            <div key={i} className="flex gap-4 items-center">
              <div className="p-2 border border-zinc-800 text-purple-400 rounded-lg bg-zinc-950">
                <item.icon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-black italic tracking-tighter text-white">{item.val}</div>
                <div className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">{item.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tax Features Grid */}
      <section id="features" className="py-32 px-6 relative overflow-hidden">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-20">
            <div className="max-w-xl space-y-4">
              <Badge variant="outline" className="border-purple-500/30 text-purple-400 rounded-full px-3 py-1 uppercase tracking-widest text-[10px] font-black bg-purple-500/5">
                Features
              </Badge>
              <h2 className="text-5xl font-black uppercase italic tracking-tighter leading-none text-white">
                Powerful Tax <br />
                <span className="text-purple-500">Management Tools.</span>
              </h2>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <FeatureCardDuplicate icon={Calculator} title="Automated Calculations" description="Real-time tax calculations with automatic updates as your data changes." delay={0.1} />
            <FeatureCardDuplicate icon={BarChart3} title="Advanced Analytics" description="Deep insights into your tax position with predictive reporting." delay={0.2} />
            <FeatureCardDuplicate icon={FileText} title="Document Management" description="Organize and store all tax documents in one secure location." delay={0.3} />
            <FeatureCardDuplicate icon={AlertCircle} title="Compliance Alerts" description="Get notified of important deadlines and compliance requirements." delay={0.4} />
            <FeatureCardDuplicate icon={Download} title="Easy Filing" description="Export documents in formats ready for e-filing or professional review." delay={0.5} />
            <FeatureCardDuplicate icon={Shield} title="Bank-Level Security" description="Enterprise-grade encryption and security for your financial data." delay={0.6} />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 border-t border-zinc-900 bg-zinc-950/50 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge variant="outline" className="border-purple-500/30 text-purple-400 rounded-full px-4 py-1.5 uppercase tracking-widest text-[10px] font-black bg-purple-500/5 mx-auto mb-6">
              Pricing
            </Badge>
            <h2 className="text-5xl font-black uppercase italic tracking-tighter leading-none text-white mb-4">
              Simple, Transparent <br />
              <span className="text-purple-500">Pricing</span>
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">Choose the plan that fits your needs. All plans include professional support.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-purple-600 rounded-2xl p-12 text-white"
            >
              <h3 className="text-3xl font-black mb-2">Starter</h3>
              <p className="text-white/80 mb-6 text-sm">Perfect for individuals</p>
              <div className="mb-8">
                <span className="text-5xl font-black">$9</span>
                <span className="text-white/80">/month</span>
              </div>
              <Button className="bg-white text-purple-600 hover:bg-zinc-100 w-full font-bold mb-8">
                Get Started
              </Button>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Basic tax calculations
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Document storage (1GB)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Email support
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-zinc-900 border border-purple-500/30 rounded-2xl p-12 relative"
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase">Popular</div>
              <h3 className="text-3xl font-black text-white mb-2">Professional</h3>
              <p className="text-zinc-400 mb-6 text-sm">For accountants & small businesses</p>
              <div className="mb-8">
                <span className="text-5xl font-black text-white">$29</span>
                <span className="text-zinc-400">/month</span>
              </div>
              <Button className="bg-purple-600 hover:bg-purple-500 w-full font-bold text-white mb-8">
                Start Free Trial
              </Button>
              <ul className="space-y-3 text-sm text-zinc-300">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-400" />
                  Advanced calculations
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-400" />
                  Unlimited storage
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-400" />
                  Real-time analytics
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-400" />
                  Priority support
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Compliance Section */}
      <section id="compliance" className="py-32 px-6 relative overflow-hidden">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <Badge variant="outline" className="border-purple-500/30 text-purple-400 rounded-full px-4 py-1.5 uppercase tracking-widest text-[10px] font-black bg-purple-500/5 mx-auto mb-6">
              Compliance
            </Badge>
            <h2 className="text-5xl font-black uppercase italic tracking-tighter leading-none text-white mb-6">
              Always Compliant. <br />
              <span className="text-purple-500">Always Ready.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: 'SSL Encryption', desc: 'Enterprise-grade security for all data' },
              { icon: CheckCircle, title: 'GDPR Ready', desc: 'Full compliance with GDPR regulations' },
              { icon: Lock, title: '2FA Support', desc: 'Multi-factor authentication included' }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 bg-zinc-900/40 border border-zinc-800 rounded-xl hover:border-purple-500/50 transition-all"
              >
                <item.icon className="w-8 h-8 text-purple-400 mb-4" />
                <h3 className="font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-zinc-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Purple Gradient */}
      <section className="pb-32 px-6">
        <div className="container mx-auto max-w-5xl relative">
          <div className="relative p-12 md:p-24 bg-gradient-to-br from-purple-600 to-purple-800 text-white flex flex-col items-center text-center group rounded-[2rem] overflow-hidden shadow-2xl shadow-purple-500/20">
            <div className="relative z-10 space-y-8">
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-none">
                Ready to Simplify <br />
                <span className="text-zinc-300/40">Your Tax Management?</span>
              </h2>
              <p className="max-w-xl mx-auto text-lg font-bold uppercase tracking-tight italic opacity-90">
                Join thousands of businesses already saving time and money with TaxMate.
              </p>
              <Link href="/auth/register">
                <Button size="lg" className="bg-white text-purple-600 hover:bg-zinc-100 font-black px-12 rounded-lg">
                  Start Your Free Trial
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-zinc-900 px-6 bg-zinc-950">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-12 mb-20">
            <div className="md:col-span-1 space-y-6">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center">
                  <Calculator className="w-4 h-4 text-white" />
                </div>
                <span className="font-black text-xl tracking-tighter uppercase italic text-white">TaxMate</span>
              </Link>
              <p className="text-xs text-zinc-500 font-medium leading-relaxed uppercase tracking-widest">
                Simplify tax compliance with smart tools built for modern businesses.
              </p>
            </div>
            {['Product', 'Connect', 'Resources', 'Legal'].map((col) => (
              <div key={col} className="space-y-6">
                <h4 className="text-[10px] uppercase tracking-[0.4em] font-black text-purple-500">{col}</h4>
                <div className="flex flex-col gap-4">
                  {col === 'Product' && ['Features', 'Pricing', 'Compliance'].map(item => <Link key={item} href="#" className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-purple-400 transition-colors">{item}</Link>)}
                  {col === 'Connect' && ['Twitter', 'LinkedIn', 'Support'].map(item => <Link key={item} href="#" className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-purple-400 transition-colors">{item}</Link>)}
                  {col === 'Resources' && ['Blog', 'Docs', 'Community'].map(item => <Link key={item} href="#" className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-purple-400 transition-colors">{item}</Link>)}
                  {col === 'Legal' && ['Privacy', 'Terms', 'Security'].map(item => <Link key={item} href="#" className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-purple-400 transition-colors">{item}</Link>)}
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-10 border-t border-zinc-900">
            <div className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.2em]">
              &copy; {new Date().getFullYear()} TAXMATE INC. ALL RIGHTS RESERVED.
            </div>
            <div className="flex gap-8 text-zinc-600">
              <Shield className="w-4 h-4 hover:text-purple-500 cursor-pointer transition-colors" />
              <Lock className="w-4 h-4 hover:text-purple-500 cursor-pointer transition-colors" />
              <CheckCircle className="w-4 h-4 hover:text-purple-500 cursor-pointer transition-colors" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
