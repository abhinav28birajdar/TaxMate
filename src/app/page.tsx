'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  ChevronRight,
  Shield,
  MessageSquare,
  Video,
  FileText,
  CheckCircle2,
  TrendingUp,
  Menu,
  X,
  Globe,
  Lock,
  Zap,
  Cpu,
  ArrowRight,
  PieChart,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Updated to Purple Accents
const CyberCorner = ({ position }: { position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' }) => {
  const positions = {
    'top-left': 'top-0 left-0 border-t-2 border-l-2',
    'top-right': 'top-0 right-0 border-t-2 border-r-2',
    'bottom-left': 'bottom-0 left-0 border-b-2 border-l-2',
    'bottom-right': 'bottom-0 right-0 border-b-2 border-r-2',
  };

  return (
    <div className={`absolute w-3 h-3 ${positions[position]} border-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.5)]`} />
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-zinc-950/90 backdrop-blur-xl border-b border-violet-500/20 py-3' : 'bg-transparent py-6'
        }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 bg-violet-500/10 rounded-lg flex items-center justify-center border border-violet-500/40 group-hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all">
            <Briefcase className="w-5 h-5 text-violet-400" />
          </div>
          <span className="font-bold text-2xl tracking-tighter text-foreground uppercase italic">TaxMate</span>
        </Link>

        <div className="hidden md:flex items-center gap-10">
          {['Features', 'Practice', 'Security', 'Pricing'].map((item) => (
            <Link
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-xs uppercase tracking-widest font-bold text-zinc-400 hover:text-violet-400 transition-colors relative group"
            >
              {item}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-violet-500 transition-all group-hover:w-full" />
            </Link>
          ))}
          <div className="h-6 w-[1px] bg-zinc-800 mx-2" />
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-xs uppercase tracking-widest font-bold text-zinc-300 hover:text-white">Log In</Button>
          </Link>
          <Link href="/register">
            <Button size="sm" className="bg-violet-600 text-white hover:bg-violet-500 rounded-md border border-violet-400/50 shadow-[0_0_15px_rgba(139,92,246,0.2)] px-6 text-xs uppercase tracking-widest font-bold transition-all">
              Join Force
            </Button>
          </Link>
        </div>

        <button className="md:hidden text-violet-400" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>
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
    <Card className="relative p-8 bg-zinc-900/40 border-zinc-800 hover:border-violet-500/50 transition-all duration-500 rounded-xl group overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity">
        <Icon className="w-24 h-24 rotate-12 text-violet-500" />
      </div>
      <div className="relative z-10">
        <div className="w-14 h-14 bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-6 group-hover:bg-violet-600 group-hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all rounded-lg">
          <Icon className="w-6 h-6 text-violet-400 group-hover:text-white transition-colors" />
        </div>
        <h3 className="text-xl font-bold mb-4 uppercase tracking-tighter italic text-zinc-100">{title}</h3>
        <p className="text-sm text-zinc-400 leading-relaxed font-medium">{description}</p>
        <div className="mt-8 flex items-center gap-2 text-violet-400 font-bold text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
          Learn More <ArrowRight className="w-3 h-3" />
        </div>
      </div>
    </Card>
  </motion.div>
);

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-foreground selection:bg-violet-500 selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-zinc-950" />
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `radial-gradient(circle, #7c3aed 0.5px, transparent 0.5px)`,
            backgroundSize: '40px 40px'
          }} />

          {/* Peerlist-style subtle glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/10 blur-[120px] rounded-full" />
          
          <div className="absolute inset-0 flex items-center justify-center opacity-5 blur-[2px]">
            <Globe className="w-[800px] h-[800px] text-violet-500" strokeWidth={0.5} />
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
                <Badge variant="outline" className="border-violet-500/30 text-violet-400 rounded-full px-4 py-1.5 uppercase tracking-widest text-[10px] font-bold bg-violet-500/5">
                  <span className="w-1.5 h-1.5 bg-violet-500 rounded-full mr-2 animate-pulse" />
                  Operational: Phase 4
                </Badge>

                <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic leading-[0.9] text-white">
                  Tax <br />
                  <span className="text-violet-500 drop-shadow-[0_0_25px_rgba(139,92,246,0.4)]">Intelligence.</span>
                </h1>

                <p className="text-lg md:text-xl text-zinc-400 max-w-xl font-medium leading-relaxed">
                  The fastest and most secure platform for modern
                  Chartered Accountants. Experience lightning-fast
                  audits and robust security.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-6 pt-6">
                  <Link href="/register" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full h-14 bg-violet-600 text-white hover:bg-violet-500 rounded-xl px-10 text-sm font-black uppercase tracking-widest group shadow-[0_0_30px_rgba(139,92,246,0.2)] border border-violet-400/20">
                      Get TAXMATE <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="/about" className="w-full sm:w-auto">
                    <Button size="lg" variant="outline" className="w-full h-14 rounded-xl border-zinc-800 text-xs uppercase tracking-widest font-bold px-10 hover:bg-zinc-900 text-zinc-300">
                      Explore Tech Stack
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
                  { label: 'Uptime', val: '99.9%+', icon: Zap },
                  { label: 'Security', val: 'Military', icon: Shield },
                  { label: 'Latency', val: '<20ms', icon: Cpu }
                ].map((stat, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center gap-2 text-violet-400 font-black uppercase italic tracking-tighter">
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
                <div className="absolute inset-0 border-[40px] border-violet-500/5 rounded-full animate-[spin_20s_linear_infinite]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-72 h-72 bg-zinc-950 border border-violet-500/20 rotate-45 flex items-center justify-center overflow-hidden shadow-[0_0_50px_rgba(139,92,246,0.1)] rounded-3xl">
                    <div className="-rotate-45 flex flex-col items-center gap-4">
                      <Lock className="w-16 h-16 text-violet-500" />
                      <span className="text-violet-400 font-black uppercase tracking-widest text-sm italic">Secured</span>
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
            { label: 'Active Sessions', val: '24K+', icon: Users },
            { label: 'Data Protected', val: '5.2TB', icon: Shield },
            { label: 'Success Rate', val: '99.8%', icon: CheckCircle2 },
            { label: 'Revenue Analyzed', val: '₹85B', icon: PieChart }
          ].map((item, i) => (
            <div key={i} className="flex gap-4 items-center">
              <div className="p-2 border border-zinc-800 text-violet-400 rounded-lg bg-zinc-950">
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

      {/* Features Grid */}
      <section id="features" className="py-32 px-6 relative overflow-hidden">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-20">
            <div className="max-w-xl space-y-4">
              <Badge variant="outline" className="border-violet-500/30 text-violet-400 rounded-full px-3 py-1 uppercase tracking-widest text-[10px] font-black bg-violet-500/5">
                System Capabilities
              </Badge>
              <h2 className="text-5xl font-black uppercase italic tracking-tighter leading-none text-white">
                Integrated Practice <br />
                <span className="text-violet-500">Ecosystem.</span>
              </h2>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard icon={MessageSquare} title="Secure Chat" description="End-to-end encrypted protocol for client communication." delay={0.1} />
            <FeatureCard icon={Video} title="Virtual Board" description="Ultra-low latency HD video meetings with integrated audit trail." delay={0.2} />
            <FeatureCard icon={FileText} title="Vault Storage" description="Quantum-resistant encrypted storage for critical returns." delay={0.3} />
            <FeatureCard icon={TrendingUp} title="Live Tracker" description="Real-time compliance monitoring and automated filing status pulse." delay={0.4} />
            <FeatureCard icon={Briefcase} title="CRM Matrix" description="Sophisticated client management interface with predictive automation." delay={0.5} />
            <FeatureCard icon={Shield} title="Compliance Engine" description="AI-powered regulatory validation checks for error-free submission." delay={0.6} />
          </div>
        </div>
      </section>

      {/* Security Section / Social Proof */}
      <section id="security" className="py-20 border-t border-zinc-900 bg-zinc-950/50 relative">
        <div className="container mx-auto px-6 text-center">
          <h3 className="text-xs uppercase tracking-[0.4em] font-black text-violet-500/60 mb-12">Hardened Security Infrastructure</h3>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-30 grayscale contrast-125">
            <div className="text-2xl font-black italic tracking-tighter text-white">RAZORPAY</div>
            <div className="text-2xl font-black italic tracking-tighter text-white">STRIPE</div>
            <div className="text-2xl font-black italic tracking-tighter text-white">ICAI READY</div>
            <div className="text-2xl font-black italic tracking-tighter text-white">SSL-SECURE</div>
          </div>
        </div>
      </section>

      {/* CTA Section - Purple Gradient */}
      <section className="pb-32 px-6">
        <div className="container mx-auto max-w-5xl relative">
          <div className="relative p-12 md:p-24 bg-gradient-to-br from-violet-600 to-indigo-700 text-white flex flex-col items-center text-center group rounded-[2rem] overflow-hidden shadow-2xl shadow-violet-500/20">
            <div className="relative z-10 space-y-8">
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-none">
                Upgrade Your <br />
                <span className="text-zinc-900/40">Practice Today.</span>
              </h2>
              <p className="max-w-xl mx-auto text-lg font-bold uppercase tracking-tight italic opacity-90">
                Join 12,000+ professionals modernizing their tax workflow.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-6 pt-6">
                <Link href="/register">
                  <Button size="lg" className="h-16 px-12 bg-white text-violet-700 hover:bg-zinc-100 rounded-xl text-sm font-black uppercase tracking-widest border-none shadow-xl">
                    Establish Connection
                  </Button>
                </Link>
              </div>
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
                <div className="w-8 h-8 bg-violet-600 rounded flex items-center justify-center">
                  <Briefcase className="w-4 h-4 text-white" />
                </div>
                <span className="font-black text-xl tracking-tighter uppercase italic text-white">TaxMate</span>
              </Link>
              <p className="text-xs text-zinc-500 font-medium leading-relaxed uppercase tracking-widest">
                The leading infrastructure for professional financial practice.
              </p>
            </div>
            {['Platform', 'Connect', 'Resources', 'Legal'].map((col) => (
              <div key={col} className="space-y-6">
                <h4 className="text-[10px] uppercase tracking-[0.4em] font-black text-violet-500">{col}</h4>
                <div className="flex flex-col gap-4">
                  {col === 'Platform' && ['Features', 'Security', 'Compliance'].map(item => <Link key={item} href="#" className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-violet-400 transition-colors">{item}</Link>)}
                  {col === 'Connect' && ['Twitter', 'LinkedIn', 'Support'].map(item => <Link key={item} href="#" className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-violet-400 transition-colors">{item}</Link>)}
                  {col === 'Resources' && ['Blog', 'API Docs', 'Community'].map(item => <Link key={item} href="#" className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-violet-400 transition-colors">{item}</Link>)}
                  {col === 'Legal' && ['Privacy', 'Terms', 'Security'].map(item => <Link key={item} href="#" className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-violet-400 transition-colors">{item}</Link>)}
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-10 border-t border-zinc-900">
            <div className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.2em]">
              &copy; {new Date().getFullYear()} TAXMATE SYSTEMS.
            </div>
            <div className="flex gap-8 text-zinc-600">
              <Globe className="w-4 h-4 hover:text-violet-500 cursor-pointer transition-colors" />
              <Shield className="w-4 h-4 hover:text-violet-500 cursor-pointer transition-colors" />
              <Lock className="w-4 h-4 hover:text-violet-500 cursor-pointer transition-colors" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}