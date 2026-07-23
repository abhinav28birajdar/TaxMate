'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/login');
    }, 2500);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-lime-600/20 via-slate-900 to-slate-950 pointer-events-none" />
      
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="flex flex-col items-center space-y-6 z-10"
      >
        <div className="w-20 h-20 rounded-2xl bg-lime-600 flex items-center justify-center shadow-lg shadow-lime-600/30">
          <ShieldCheck className="w-12 h-12 text-white" />
        </div>
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-white">
            Tax<span className="text-lime-500">Mate</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Enterprise CA & Client SaaS Management</p>
        </div>

        <div className="flex space-x-2 mt-8">
          <motion.div
            className="w-3 h-3 rounded-full bg-lime-500"
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1, delay: 0 }}
          />
          <motion.div
            className="w-3 h-3 rounded-full bg-lime-500"
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
          />
          <motion.div
            className="w-3 h-3 rounded-full bg-lime-500"
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
          />
        </div>
      </motion.div>
    </div>
  );
}
