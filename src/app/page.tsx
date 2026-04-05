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

const CyberCorner = ({ position }: { position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' }) => {
  const positions = {
    'top-left': 'top-0 left-0 border-t-2 border-l-2',
    'top-right': 'top-0 right-0 border-t-2 border-r-2',
    'bottom-left': 'bottom-0 left-0 border-b-2 border-l-2',
    'bottom-right': 'bottom-0 right-0 border-b-2 border-r-2',
  };

  return (
    <div className={`absolute w-3 h-3 ${positions[position]} border-primary shadow-[0_0_8px_rgba(34,197,94,0.5)]`} />
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-black/90 backdrop-blur-xl border-b border-primary/20 py-3' : 'bg-transparent py-6'
        }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center border border-primary/50 group-hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all">
            <Briefcase className="w-5 h-5 text-primary" />
            <div className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-primary" />
            <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-primary" />
          </div>
          <span className="font-bold text-2xl tracking-tighter text-foreground uppercase italic">TaxMate</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-10">
          {['Features', 'Practice', 'Security', 'Pricing'].map((item) => (
            <Link
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-xs uppercase tracking-widest font-bold text-muted-foreground hover:text-primary transition-colors relative group"
            >
              {item}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
            </Link>
          ))}
          <div className="h-6 w-[1px] bg-primary/20 mx-2" />
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-xs uppercase tracking-widest font-bold">Log In</Button>
          </Link>
          <Link href="/register">
            <Button size="sm" className="bg-primary text-black hover:bg-primary/90 rounded-none border border-primary shadow-[0_0_15px_rgba(34,197,94,0.3)] px-6 text-xs uppercase tracking-widest font-bold">
              Join Force
            </Button>
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-primary" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-black border-b border-primary/20 p-6 flex flex-col gap-6"
          >
            {['Features', 'Practice', 'Security', 'Pricing'].map((item) => (
              <Link key={item} href={`#${item.toLowerCase()}`} className="text-sm font-bold uppercase tracking-widest" onClick={() => setIsOpen(false)}>
                {item}
              </Link>
            ))}
            <div className="flex gap-4">
              <Link href="/login" className="flex-1">
                <Button variant="outline" className="w-full rounded-none border-primary/50 text-xs uppercase tracking-widest font-bold">Log In</Button>
              </Link>
              <Link href="/register" className="flex-1">
                <Button className="w-full rounded-none bg-primary text-black text-xs uppercase tracking-widest font-bold">Join Force</Button>
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
    <Card className="relative p-8 bg-zinc-950/50 border-primary/10 hover:border-primary/40 transition-all duration-500 rounded-none group overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Icon className="w-24 h-24 rotate-12" />
      </div>
      <div className="relative z-10">
        <div className="w-14 h-14 bg-primary/10 border border-primary/30 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all">
          <Icon className="w-6 h-6 text-primary group-hover:text-black transition-colors" />
        </div>
        <h3 className="text-xl font-bold mb-4 uppercase tracking-tighter italic">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed font-medium">{description}</p>
        <div className="mt-8 flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
          Learn More <ArrowRight className="w-3 h-3" />
        </div>
      </div>
      <CyberCorner position="top-left" />
      <CyberCorner position="bottom-right" />
    </Card>
  </motion.div>
);

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-foreground selection:bg-primary selection:text-black">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black" />
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: `radial-gradient(rgb(139, 93, 255) 0.5px, transparent 0.5px)`,
            backgroundSize: '40px 40px'
          }} />

          <div className="absolute inset-0 flex items-center justify-center opacity-10 blur-[1px]">
            <Globe className="w-[800px] h-[800px] text-primary" strokeWidth={0.5} />
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
                <Badge variant="outline" className="border-primary/50 text-primary rounded-none px-4 py-1.5 uppercase tracking-widest text-[10px] font-bold bg-primary/5">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2 animate-pulse" />
                  Operational: Phase 4
                </Badge>

                <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic leading-[0.9]">
                  Tax <br />
                  <span className="text-primary drop-shadow-[0_0_15px_rgba(34,197,94,0.3)]">Intelligence.</span>
                </h1>

                <p className="text-lg md:text-xl text-muted-foreground max-w-xl font-medium leading-relaxed">
                  The fastest and most secure platform for modern
                  Chartered Accountants. Experience lightning-fast
                  audits and robust security for a seamless journey.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-6 pt-6">
                  <Link href="/register" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full h-14 bg-primary text-black hover:bg-primary/90 rounded-none px-10 text-sm font-black uppercase tracking-widest group shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                      Get TAXMATE <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="/about" className="w-full sm:w-auto">
                    <Button size="lg" variant="outline" className="w-full h-14 rounded-none border-primary/30 text-xs uppercase tracking-widest font-bold px-10 hover:bg-primary/5">
                      Explore Tech Stack
                    </Button>
                  </Link>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="grid grid-cols-3 gap-8 pt-8 border-t border-primary/10"
              >
                {[
                  { label: 'Uptime', val: '99.9%+', icon: Zap },
                  { label: 'Security', val: 'Military', icon: Shield },
                  { label: 'Latency', val: '<20ms', icon: Cpu }
                ].map((stat, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center gap-2 text-primary font-black uppercase italic tracking-tighter">
                      <stat.icon className="w-3 h-3" />
                      {stat.val}
                    </div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">{stat.label}</div>
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
                <div className="absolute inset-0 border-[40px] border-primary/5 rounded-full animate-[spin_20s_linear_infinite]" />
                <div className="absolute inset-10 border-[1px] border-primary/20 rounded-full animate-[spin_10s_linear_infinite_reverse]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-72 h-72 bg-zinc-950 border border-primary/30 rotate-45 flex items-center justify-center overflow-hidden shadow-[0_0_50px_rgba(34,197,94,0.1)] group transition-all duration-700">
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(139,93,255,0.03)_50%,transparent_75%)] bg-[length:250%_250%] animate-[shimmer_5s_infinite]" />
                    <div className="-rotate-45 flex flex-col items-center gap-4">
                      <div className="relative">
                        <Lock className="w-16 h-16 text-primary" />
                        <div className="absolute -top-4 -left-4 w-6 h-6 border-t-2 border-l-2 border-primary" />
                        <div className="absolute -bottom-4 -right-4 w-6 h-6 border-b-2 border-r-2 border-primary" />
                      </div>
                      <span className="text-primary font-black uppercase tracking-widest text-sm italic">Secured</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute top-0 right-10 bg-zinc-900 border border-primary/50 p-4 text-xs font-bold uppercase tracking-widest italic shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-ping" />
                  Live Node: Mumbai
                </div>
                <div className="text-muted-foreground text-[10px]">TDS Filing in progress...</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Quickbar */}
      <div className="bg-primary/5 border-y border-primary/10 py-10 relative overflow-hidden">
        <div className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-10 relative z-10">
          {[
            { label: 'Active Sessions', val: '24K+', icon: Users },
            { label: 'Data Protected', val: '5.2TB', icon: Shield },
            { label: 'Success Rate', val: '99.8%', icon: CheckCircle2 },
            { label: 'Revenue Analyzed', val: '₹85B', icon: PieChart }
          ].map((item, i) => (
            <div key={i} className="flex gap-4 items-center">
              <div className="p-2 border border-primary/20 text-primary">
                <item.icon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-black italic tracking-tighter text-primary">{item.val}</div>
                <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">{item.label}</div>
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
              <Badge variant="outline" className="border-primary/50 text-primary rounded-none px-3 py-1 uppercase tracking-widest text-[10px] font-black">
                System Capabilities
              </Badge>
              <h2 className="text-5xl font-black uppercase italic tracking-tighter leading-none">
                Integrated Practice <br />
                <span className="text-primary">Ecosystem.</span>
              </h2>
            </div>
            <p className="text-muted-foreground max-w-sm text-sm font-medium">
              A comprehensive suite of tools built for high-performance financial firms that demand precision and speed.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-1">
            <FeatureCard
              icon={MessageSquare}
              title="Secure Chat"
              description="End-to-end encrypted protocol for client communication and sensitive data transfer."
              delay={0.1}
            />
            <FeatureCard
              icon={Video}
              title="Virtual Board"
              description="Ultra-low latency HD video meetings with integrated audit trail and recording."
              delay={0.2}
            />
            <FeatureCard
              icon={FileText}
              title="Vault Storage"
              description="Quantum-resistant encrypted storage for critical returns, receipts and ledgers."
              delay={0.3}
            />
            <FeatureCard
              icon={TrendingUp}
              title="Live Tracker"
              description="Real-time compliance monitoring and automated filing status pulse."
              delay={0.4}
            />
            <FeatureCard
              icon={Briefcase}
              title="CRM Matrix"
              description="Sophisticated client management interface with predictive task automation."
              delay={0.5}
            />
            <FeatureCard
              icon={Shield}
              title="Compliance Engine"
              description="AI-powered regulatory validation checks for error-free GST and ITR submission."
              delay={0.6}
            />
          </div>
        </div>
      </section>

      {/* Security Section / Social Proof */}
      <section id="security" className="py-32 border-t border-primary/10 relative">
        <div className="container mx-auto px-6 text-center">
          <h3 className="text-xs uppercase tracking-[0.4em] font-black text-primary mb-12">Hardened Security Infrastructure</h3>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-40 grayscale hover:grayscale-0 transition-all">
            <div className="text-2xl font-black italic tracking-tighter">RAZORPAY</div>
            <div className="text-2xl font-black italic tracking-tighter">STRIPE</div>
            <div className="text-2xl font-black italic tracking-tighter">ICAI READY</div>
            <div className="text-2xl font-black italic tracking-tighter">SSL-SECURE</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="pb-32 px-6">
        <div className="container mx-auto max-w-5xl relative">
          <div className="relative p-12 md:p-24 bg-primary text-black flex flex-col items-center text-center group">
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-5 transition-opacity" />
            <div className="relative z-10 space-y-8">
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-none">
                Upgrade Your <br />
                <span className="text-zinc-900">Practice Today.</span>
              </h2>
              <p className="max-w-xl mx-auto text-lg font-bold uppercase tracking-tight italic">
                Join 12,000+ professionals modernizing their tax workflow with TaxMate.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-6 pt-6">
                <Link href="/register">
                  <Button size="lg" variant="secondary" className="h-16 px-12 bg-black text-primary hover:bg-zinc-900 rounded-none text-sm font-black uppercase tracking-widest border-2 border-black">
                    Establish Connection
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline" className="h-16 px-12 border-black/20 text-black hover:bg-black/5 rounded-none text-xs uppercase tracking-widest font-black">
                    Contact Command
                  </Button>
                </Link>
              </div>
            </div>

            <CyberCorner position="top-left" />
            <CyberCorner position="top-right" />
            <CyberCorner position="bottom-left" />
            <CyberCorner position="bottom-right" />

            <div className="absolute bottom-0 right-0 p-8 opacity-20 hidden md:block">
              <Briefcase className="w-48 h-48 -rotate-12" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-primary/10 px-6 font-sans">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-12 mb-20">
            <div className="md:col-span-1 space-y-6">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                  <Briefcase className="w-4 h-4 text-black" />
                </div>
                <span className="font-black text-xl tracking-tighter uppercase italic">TaxMate</span>
              </Link>
              <p className="text-xs text-muted-foreground font-medium leading-relaxed uppercase tracking-widest">
                The leading infrastructure for professional financial practice and seamless client management.
              </p>
            </div>
            {['Platform', 'Connect', 'Resources', 'Legal'].map((col) => (
              <div key={col} className="space-y-6">
                <h4 className="text-[10px] uppercase tracking-[0.4em] font-black text-primary">{col}</h4>
                <div className="flex flex-col gap-4">
                  {col === 'Platform' && ['Features', 'Security', 'Compliance'].map(item => <Link key={item} href="#" className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground">{item}</Link>)}
                  {col === 'Connect' && ['Twitter', 'LinkedIn', 'Support'].map(item => <Link key={item} href="#" className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground">{item}</Link>)}
                  {col === 'Resources' && ['Blog', 'API Docs', 'Community'].map(item => <Link key={item} href="#" className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground">{item}</Link>)}
                  {col === 'Legal' && ['Privacy', 'Terms', 'Security'].map(item => <Link key={item} href="#" className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground">{item}</Link>)}
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-10 border-t border-primary/5">
            <div className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">
              &copy; {new Date().getFullYear()} TAXMATE SYSTEMS. ALL OPERATIONS SECURED.
            </div>
            <div className="flex gap-8">
              <Globe className="w-4 h-4 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
              <Shield className="w-4 h-4 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
              <Lock className="w-4 h-4 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
