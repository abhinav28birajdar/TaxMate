"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ChevronRight,
  Users,
  CheckCircle,
  FileText,
  Shield,
  Clock,
  Calculator,
  BarChart3,
  Download,
  Lock,
  Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header aria-label="Main navigation">
      <motion.nav
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
          scrolled ? 'backdrop-blur bg-zinc-900/80 border-b border-zinc-800 py-3' : 'py-6'
        }`}
      >
        <div className="container mx-auto px-6 flex items-center justify-between">
          <Link href="/" aria-label="TaxMate home" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center text-white">
              <Calculator className="w-5 h-5" aria-hidden />
            </div>
            <span className="font-bold text-lg tracking-tight uppercase">TaxMate</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8" aria-label="Primary">
            <Link href="#features" className="text-sm font-medium text-zinc-400 hover:text-purple-400">Features</Link>
            <Link href="#pricing" className="text-sm font-medium text-zinc-400 hover:text-purple-400">Pricing</Link>
            <Link href="#security" className="text-sm font-medium text-zinc-400 hover:text-purple-400">Security</Link>
            <div className="ml-2 h-6 w-px bg-zinc-800" />
            <Link href="/auth/login"><Button variant="ghost" size="sm">Log In</Button></Link>
            <Link href="/auth/register"><Button size="sm" className="bg-purple-600 text-white">Get Started</Button></Link>
          </nav>

          <button className="md:hidden" aria-label="Open menu" onClick={() => setIsOpen(!isOpen)}>
            <svg className="w-6 h-6 text-purple-400" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-zinc-900/95 backdrop-blur border-t border-zinc-800"
            >
              <div className="container mx-auto px-6 py-4 flex flex-col gap-4">
                {['Features', 'Pricing', 'Security'].map((item) => (
                  <Link key={item} href={`#${item.toLowerCase()}`} onClick={() => setIsOpen(false)} className="text-sm font-medium text-zinc-300">{item}</Link>
                ))}
                <div className="flex gap-2 mt-2">
                  <Link href="/auth/login" className="w-full"><Button variant="ghost" size="sm">Log In</Button></Link>
                  <Link href="/auth/register" className="w-full"><Button size="sm" className="bg-purple-600 text-white">Get Started</Button></Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </header>
  );
};

const FeatureCard: React.FC<{ icon: any; title: string; description: string; delay?: number }> = ({ icon: Icon, title, description, delay = 0 }) => (
  <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.5 }} viewport={{ once: true }}>
    <Card className="p-6 bg-zinc-900/40 border border-zinc-800 rounded-xl hover:border-purple-500/30 transition-all">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-lg bg-purple-600/10 text-purple-400"><Icon className="w-5 h-5" /></div>
        <div>
          <h3 className="font-bold text-white text-lg">{title}</h3>
          <p className="text-sm text-zinc-400 mt-2">{description}</p>
        </div>
      </div>
    </Card>
  </motion.div>
);

const TestimonialCard: React.FC<{ quote: string; author: string; role: string; delay?: number }> = ({ quote, author, role, delay = 0 }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.5 }} viewport={{ once: true }}>
    <Card className="p-6 bg-zinc-900/40 border border-zinc-800 rounded-xl">
      <p className="text-sm text-zinc-300 italic">“{quote}”</p>
      <div className="flex items-center gap-3 mt-4">
        <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
          <Users className="w-4 h-4" />
        </div>
        <div>
          <div className="text-sm font-bold text-white">{author}</div>
          <div className="text-xs text-zinc-500">{role}</div>
        </div>
      </div>
    </Card>
  </motion.div>
);

export default function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-foreground selection:bg-purple-500 selection:text-white">
      <Navbar />

      <main>
        <section aria-label="Hero" className="min-h-screen flex items-center py-24">
          <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="outline" className="mb-6">The Future of Tax Management</Badge>
              <h1 className="text-5xl md:text-6xl font-black leading-tight">Tax Management <span className="text-purple-500">Simplified</span></h1>
              <p className="mt-4 text-zinc-400 max-w-xl">Automated calculations, secure storage, and real-time insights built for accountants and modern businesses.</p>
              <div className="mt-8 flex gap-4">
                <Link href="/auth/register"><Button size="lg" className="bg-purple-600">Start Free Trial <ChevronRight className="ml-2 w-4 h-4" /></Button></Link>
                <Link href="#features"><Button variant="outline" size="lg">See Features</Button></Link>
              </div>
            </div>

            <div aria-hidden className="hidden lg:block">
              <div className="w-full max-w-md h-64 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-800 shadow-xl" />
            </div>
          </div>
        </section>

        <section aria-label="Stats" className="py-10 bg-zinc-900/30 border-y border-zinc-800">
          <div className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[{ label: 'Active Users', value: '10K+' }, { label: 'Returns Filed', value: '50K+' }, { label: 'Time Saved', value: '40hrs/yr' }, { label: 'Compliance', value: '100%' }].map((s, i) => (
              <div key={i}>
                <div className="text-2xl font-black">{s.value}</div>
                <div className="text-xs uppercase text-zinc-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section id="features" aria-label="Features" className="py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h2 className="text-3xl font-black">Everything You Need</h2>
              <p className="mt-2 text-zinc-400">Comprehensive tools designed to make tax management effortless and accurate.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <FeatureCard icon={Calculator} title="Smart Calculations" description="Real-time tax calculations with automatic updates." delay={0.05} />
              <FeatureCard icon={BarChart3} title="Advanced Analytics" description="Insights and forecasting to guide decisions." delay={0.1} />
              <FeatureCard icon={FileText} title="Document Management" description="Securely store and retrieve all tax documents." delay={0.15} />
            </div>
          </div>
        </section>

        <section aria-label="Testimonials" className="py-20 bg-zinc-900/40">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center mb-8">
              <h3 className="text-2xl font-bold">Loved by accountants</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <TestimonialCard quote="Saved us hundreds of hours." author="Sarah J." role="Tax Consultant" delay={0.05} />
              <TestimonialCard quote="Automation we actually use." author="Michael C." role="CFO" delay={0.1} />
              <TestimonialCard quote="Incredible support and reliability." author="Emily R." role="Accounting Manager" delay={0.15} />
            </div>
          </div>
        </section>

      </main>

      <footer className="py-12 border-t border-zinc-900">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-purple-600 flex items-center justify-center text-white"><Calculator className="w-4 h-4" /></div>
            <div className="font-bold">TaxMate</div>
          </div>
          <div className="text-sm text-zinc-500">© {new Date().getFullYear()} TaxMate, Inc.</div>
        </div>
      </footer>
    </div>
  );
}
