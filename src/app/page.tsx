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
          scrolled ? 'backdrop-blur bg-slate-900/80 border-b border-slate-800 py-3' : 'py-6'
        }`}
      >
        <div className="container mx-auto px-6 flex items-center justify-between">
          <Link href="/" aria-label="TaxMate home" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-lime-600 to-lime-700 flex items-center justify-center text-black">
              <Calculator className="w-5 h-5" aria-hidden />
            </div>
            <span className="font-bold text-lg tracking-tight uppercase text-white">TaxMate</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8" aria-label="Primary">
            <Link href="#features" className="text-sm font-medium text-slate-400 hover:text-lime-600 transition-colors">Features</Link>
            <Link href="#pricing" className="text-sm font-medium text-slate-400 hover:text-lime-600 transition-colors">Pricing</Link>
            <Link href="#security" className="text-sm font-medium text-slate-400 hover:text-lime-600 transition-colors">Security</Link>
            <div className="ml-2 h-6 w-px bg-slate-800" />
            <Link href="/login"><Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-800">Log In</Button></Link>
            <Link href="/register"><Button size="sm" className="bg-lime-600 text-black hover:bg-lime-500 font-bold">Get Started</Button></Link>
          </nav>

          <button className="md:hidden" aria-label="Open menu" onClick={() => setIsOpen(!isOpen)}>
            <svg className="w-6 h-6 text-lime-600" viewBox="0 0 24 24" fill="none" aria-hidden>
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
              className="md:hidden bg-slate-900/95 backdrop-blur border-t border-slate-800"
            >
              <div className="container mx-auto px-6 py-4 flex flex-col gap-4">
                {['Features', 'Pricing', 'Security'].map((item) => (
                  <Link key={item} href={`#${item.toLowerCase()}`} onClick={() => setIsOpen(false)} className="text-sm font-medium text-slate-300 hover:text-lime-600 transition-colors">{item}</Link>
                ))}
                <div className="flex gap-2 mt-2">
                  <Link href="/login" className="w-full"><Button variant="ghost" size="sm" className="w-full text-slate-300 hover:text-white">Log In</Button></Link>
                  <Link href="/register" className="w-full"><Button size="sm" className="w-full bg-lime-600 text-black hover:bg-lime-500 font-bold">Get Started</Button></Link>
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
    <Card className="p-6 bg-slate-900 border border-slate-800 rounded-xl hover:border-lime-600/30 transition-all">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-lg bg-lime-600/10 text-lime-500"><Icon className="w-5 h-5" /></div>
        <div>
          <h3 className="font-bold text-white text-lg">{title}</h3>
          <p className="text-sm text-slate-400 mt-2">{description}</p>
        </div>
      </div>
    </Card>
  </motion.div>
);

const TestimonialCard: React.FC<{ quote: string; author: string; role: string; delay?: number }> = ({ quote, author, role, delay = 0 }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.5 }} viewport={{ once: true }}>
    <Card className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
      <p className="text-sm text-slate-300 italic">“{quote}”</p>
      <div className="flex items-center gap-3 mt-4">
        <div className="w-10 h-10 rounded-full bg-lime-600/10 flex items-center justify-center text-lime-500">
          <Users className="w-4 h-4" />
        </div>
        <div>
          <div className="text-sm font-bold text-white">{author}</div>
          <div className="text-xs text-slate-500">{role}</div>
        </div>
      </div>
    </Card>
  </motion.div>
);

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-lime-600 selection:text-black">
      <Navbar />

      <main>
        <section aria-label="Hero" className="min-h-screen flex items-center py-24">
          <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="outline" className="mb-6 border-lime-600/50 text-lime-500 bg-lime-600/5">The Future of Tax Practice</Badge>
              <h1 className="text-5xl md:text-6xl font-black leading-tight text-white">
                Tax Management <span className="text-lime-600">Redefined</span>
              </h1>
              <p className="mt-4 text-slate-400 max-w-xl">
                Automated computations, secure client collaboration, and real-time compliance tracking built for Chartered Accountants and businesses.
              </p>
              <div className="mt-8 flex gap-4">
                <Link href="/register"><Button size="lg" className="bg-lime-600 text-black hover:bg-lime-500 font-bold">Start Free Trial <ChevronRight className="ml-2 w-4 h-4" /></Button></Link>
                <Link href="#features"><Button variant="outline" size="lg" className="border-slate-700 text-slate-300 hover:bg-slate-800">See Features</Button></Link>
              </div>
            </div>

            <div aria-hidden className="hidden lg:block">
              <div className="w-full max-w-md h-64 rounded-2xl bg-gradient-to-br from-lime-600 to-lime-800 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute bottom-6 left-6 text-black font-black uppercase tracking-widest text-lg">TAXMATE ENTERPRISE</div>
              </div>
            </div>
          </div>
        </section>

        <section aria-label="Stats" className="py-10 bg-slate-900/50 border-y border-slate-800">
          <div className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { label: 'Active Users', value: '10K+' },
              { label: 'Returns Filed', value: '50K+' },
              { label: 'Time Saved', value: '40hrs/yr' },
              { label: 'Compliance Rate', value: '100%' }
            ].map((s, i) => (
              <div key={i}>
                <div className="text-2xl font-black text-lime-600">{s.value}</div>
                <div className="text-xs uppercase text-slate-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section id="features" aria-label="Features" className="py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h2 className="text-3xl font-black text-white">Full Practice Automation</h2>
              <p className="mt-2 text-slate-400">Comprehensive tools designed to make tax operations effortless and accurate.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <FeatureCard icon={Calculator} title="Real-time GST filing" description="Verify outward supplies, compile invoice registries, and record payments." delay={0.05} />
              <FeatureCard icon={BarChart3} title="Business Intelligence" description="Consolidated metrics tracking collections efficiency and revenue growth." delay={0.1} />
              <FeatureCard icon={FileText} title="Secure Document Vault" description="Drag-drop uploads, shared workspaces, and access control logs." delay={0.15} />
            </div>
          </div>
        </section>

        <section aria-label="Testimonials" className="py-20 bg-slate-900/40">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center mb-8">
              <h3 className="text-2xl font-bold text-white">Trusted by Top Practitioners</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <TestimonialCard quote="Saved our firm hundreds of hours in client document follow-ups." author="Sarah J." role="Senior Partner" delay={0.05} />
              <TestimonialCard quote="Automations we actually use daily. The client portal is a game changer." author="Michael C." role="Managing Director" delay={0.1} />
              <TestimonialCard quote="Incredible dashboard responsiveness. The transition from legacy system was seamless." author="Emily R." role="Associate Director" delay={0.15} />
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-slate-900">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-lime-600 flex items-center justify-center text-black"><Calculator className="w-4 h-4" /></div>
            <div className="font-bold text-white">TaxMate</div>
          </div>
          <div className="text-sm text-slate-500">© {new Date().getFullYear()} TaxMate. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
