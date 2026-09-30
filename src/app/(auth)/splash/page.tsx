"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldCheck, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/login");
    }, 2800);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col items-center justify-center relative overflow-hidden">
      {/* Dark grid & glowing orbs matching HeroSection */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-20" />
      <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-emerald-600/15 rounded-full blur-[140px] pointer-events-none -z-10" />

      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center space-y-6 z-10 text-center max-w-sm px-4"
      >
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-[0_0_40px_rgba(5,150,105,0.4)] border border-emerald-400/30">
            <span className="text-3xl font-black text-white">T</span>
          </div>
          <span className="absolute -bottom-1 -right-1 bg-[#0A0A0A] p-1 rounded-full border border-emerald-500/40 text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
          </span>
        </div>

        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white">
            Tax<span className="text-emerald-500">Mate</span>
          </h1>
          <p className="text-gray-400 text-xs mt-1.5 uppercase tracking-widest font-mono">
            The Operating System for Indian CAs
          </p>
        </div>

        <div className="flex space-x-2 mt-4">
          <motion.div
            className="w-2.5 h-2.5 rounded-full bg-emerald-500"
            animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 1, delay: 0 }}
          />
          <motion.div
            className="w-2.5 h-2.5 rounded-full bg-emerald-500"
            animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
          />
          <motion.div
            className="w-2.5 h-2.5 rounded-full bg-emerald-500"
            animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
          />
        </div>

        <div className="pt-6">
          <Link href="/login">
            <Button variant="ghost" className="text-xs text-gray-400 hover:text-white flex items-center gap-1.5">
              Skip splash <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
