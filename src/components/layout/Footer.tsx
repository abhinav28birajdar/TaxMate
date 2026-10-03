"use client";

import Link from "next/link";
import { Mail, Phone, MapPin, ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-12 text-slate-600 dark:text-slate-400">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-3">
          <Link href="/" className="font-display font-extrabold text-xl tracking-tight flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-lime-600 flex items-center justify-center text-white text-sm font-black shadow-md shadow-lime-600/30">
              T
            </span>
            <span className="text-slate-900 dark:text-white">Tax<span className="text-lime-600 dark:text-lime-500">Mate</span></span>
          </Link>
          <p className="text-xs leading-relaxed">
            Enterprise-grade Chartered Accountant & Client Tax Management SaaS Platform. ICAI Compliant & 256-bit AES Encrypted.
          </p>
          <div className="flex items-center gap-1.5 text-xs text-lime-600 font-semibold">
            <ShieldCheck className="w-4 h-4" /> ICAI Verified Partner Network
          </div>
        </div>
        
        <div>
          <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-3">Platform Navigation</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/about" className="hover:text-lime-600 dark:hover:text-lime-400">About Us</Link></li>
            <li><Link href="/pricing" className="hover:text-lime-600 dark:hover:text-lime-400">Pricing & Plans</Link></li>
            <li><Link href="/faq" className="hover:text-lime-600 dark:hover:text-lime-400">Frequently Asked Questions</Link></li>
            <li><Link href="/talk-sales" className="hover:text-lime-600 dark:hover:text-lime-400">Talk to Sales</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-3">Legal & Compliance</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/privacy-policy" className="hover:text-lime-600 dark:hover:text-lime-400">Privacy Policy</Link></li>
            <li><Link href="/terms-of-service" className="hover:text-lime-600 dark:hover:text-lime-400">Terms of Service</Link></li>
            <li><Link href="/refund-policy" className="hover:text-lime-600 dark:hover:text-lime-400">Refund Policy</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-3">Support & Contact</h4>
          <ul className="space-y-2 text-xs">
            <li className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-lime-600 shrink-0" />
              <a href="mailto:support@taxmate.app" className="hover:text-lime-600 dark:hover:text-lime-400 font-bold text-slate-900 dark:text-white">
                support@taxmate.app
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-lime-600 shrink-0" />
              <span>+91 1800-TAX-MATE (Toll Free)</span>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-lime-600 shrink-0 mt-0.5" />
              <span>Cyber City, Bandra Kurla Complex, Mumbai, MH 400051</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8 pt-6 border-t border-slate-200 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
        <div>
          &copy; {new Date().getFullYear()} TaxMate SaaS Platform Inc. All rights reserved.
        </div>
        <div className="flex gap-4">
          <Link href="/privacy-policy" className="hover:underline">Privacy</Link>
          <Link href="/terms-of-service" className="hover:underline">Terms</Link>
          <Link href="/contact" className="hover:underline">Support</Link>
        </div>
      </div>
    </footer>
  );
}
