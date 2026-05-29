'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
    HelpCircle,
    Book,
    MessageSquare,
    Video,
    Phone,
    ArrowRight,
    Search,
    Zap,
    ShieldCheck,
    MessageCircle,
    FileQuestion,
    LifeBuoy,
    ChevronRight
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const SupportCard = ({ icon: Icon, title, description, badge, delay }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        whileHover={{ y: -4 }}
    >
        <Card className="p-8 glass border-none shadow-xl hover:shadow-2xl transition-all duration-500 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150 duration-700" />

            <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Icon className="w-7 h-7 text-blue-600" />
            </div>

            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black tracking-tight text-gray-900 dark:text-white uppercase">{title}</h3>
                    {badge && <Badge className="bg-green-100 text-green-700 border-none font-black text-[8px] h-4">{badge}</Badge>}
                </div>
                <p className="text-sm font-medium opacity-60 leading-relaxed">{description}</p>
            </div>

            <div className="pt-6">
                <Button variant="ghost" className="h-10 gap-2 font-black text-[10px] uppercase tracking-widest text-blue-600 p-0 hover:bg-transparent hover:translate-x-1 transition-all">
                    Explore Now
                    <ArrowRight className="w-4 h-4" />
                </Button>
            </div>
        </Card>
    </motion.div>
);

export default function SupportPage() {
    return (
        <div className="space-y-12 pb-20">
            {/* Search Hero */}
            <div className="relative p-12 lg:p-20 glass rounded-[40px] border-none shadow-3xl overflow-hidden bg-gradient-to-br from-blue-600 to-purple-800 text-white">
                <div className="relative z-10 text-center space-y-8 max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-4"
                    >
                        <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-tight italic">How can we <span className="underline underline-offset-8 decoration-blue-400">empower</span> you today?</h1>
                        <p className="text-lg font-medium opacity-80">Search our knowledge base or connect with an enterprise support specialist.</p>
                    </motion.div>

                    <div className="relative max-w-2xl mx-auto group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-blue-600 group-focus-within:scale-110 transition-transform" />
                        <Input
                            placeholder="Search for documentation, tutorials, or system status..."
                            className="w-full h-18 pl-16 pr-8 rounded-3xl bg-white text-gray-900 font-bold text-lg border-none shadow-2xl focus:ring-4 focus:ring-blue-400/20 transition-all"
                        />
                    </div>

                    <div className="flex flex-wrap justify-center gap-4">
                        <span className="text-xs font-black uppercase opacity-60 tracking-widest">Popular:</span>
                        {['Invoicing Help', 'ICAI Verification', 'Document Security', 'Video API Setup'].map(tag => (
                            <Badge key={tag} className="bg-white/10 hover:bg-white/20 border-white/20 cursor-pointer text-[10px] font-bold py-1 px-3 transition-all">{tag}</Badge>
                        ))}
                    </div>
                </div>

                {/* Abstract Shapes */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 blur-[100px] rounded-full -mr-48 -mt-48 animate-pulse-slow" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/10 blur-[100px] rounded-full -ml-48 -mb-48 animate-pulse-slow" />
            </div>

            {/* Primary Support Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <SupportCard
                    icon={Book}
                    title="Documentation"
                    description="Comprehensive guides on using the TaxMate enterprise ecosystem, from API integration to firm management."
                    delay={0.1}
                />
                <SupportCard
                    icon={MessageCircle}
                    title="Live Chat"
                    description="Connect with our global support team in under 60 seconds. Available 24/7 for Enterprise Plan members."
                    badge="24/7 LIVE"
                    delay={0.2}
                />
                <SupportCard
                    icon={Video}
                    title="Concierge Call"
                    description="Schedule a 1-on-1 walkthrough with a Product Specialist to optimize your professional workspace."
                    delay={0.3}
                />
            </div>

            {/* FAQ Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-10">
                <div className="space-y-8">
                    <h3 className="text-3xl font-black uppercase tracking-tight italic">Frequently Asked <span className="text-blue-600">Questions</span></h3>
                    <div className="space-y-4">
                        {[
                            "How does the E2E encryption work for documents?",
                            "Can I migrate my existing client pool from another platform?",
                            "What are the ICAI compliance guidelines for the platform?",
                            "How do I set up custom domain white-labeling?"
                        ].map((q, i) => (
                            <Card key={i} className="p-6 glass border-none hover:bg-white/50 transition-all group flex items-center justify-between cursor-pointer">
                                <p className="font-bold text-sm">{q}</p>
                                <ChevronRight className="w-5 h-5 opacity-40 group-hover:translate-x-1 transition-all" />
                            </Card>
                        ))}
                    </div>
                </div>

                <Card className="p-10 glass border-none bg-blue-600/5 shadow-none relative overflow-hidden group">
                    <div className="relative z-10 space-y-6">
                        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-600/20 group-hover:rotate-12 transition-transform">
                            <LifeBuoy className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-3xl font-black tracking-tight leading-tight">Need dedicated <br />enterprise support?</h3>
                        <p className="text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
                            Enterprise plan members get a dedicated account manager and priority engineering support
                            for custom integrations.
                        </p>
                        <Button className="bg-blue-600 text-white font-black px-10 h-14 rounded-2xl shadow-xl shadow-blue-500/30">Contact Account Manager</Button>
                    </div>
                    <Zap className="absolute -bottom-10 -right-10 w-48 h-48 opacity-5 text-blue-600" />
                </Card>
            </div>
        </div>
    );
}
