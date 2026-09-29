'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Share2, 
  Bookmark, 
  Sparkles, 
  CheckCircle2, 
  ShieldAlert, 
  FileText,
  UserCheck,
  Twitter,
  Linkedin,
  Facebook
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function BlogPostPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    toast.success('Article link copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Back Link */}
        <Link 
          href="/blog" 
          className="inline-flex items-center text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-lime-600 dark:hover:text-lime-400 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to all articles
        </Link>

        {/* Article Header */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Badge className="bg-lime-600/10 text-lime-700 dark:text-lime-400 border-lime-600/20 text-xs font-bold px-3 py-1">
              Direct Tax & Budget 2026
            </Badge>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> August 10, 2026
            </span>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> 6 min read
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-display text-slate-900 dark:text-white leading-tight">
            Union Budget 2026: Comprehensive Direct & Indirect Tax Key Amendments Explained
          </h1>

          {/* Author Card */}
          <div className="flex items-center justify-between py-4 border-y border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop"
                alt="CA Rajesh Sharma"
                className="w-11 h-11 rounded-full object-cover border border-lime-600"
              />
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  CA Rajesh Sharma, FCA <UserCheck className="w-4 h-4 text-lime-600" />
                </div>
                <div className="text-xs text-slate-500">Partner, Sharma & Associates • ICAI Reg. #402918</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleShare} className="rounded-xl text-xs gap-1.5 border-slate-200 dark:border-slate-800">
                <Share2 className="w-3.5 h-3.5" /> Share
              </Button>
            </div>
          </div>
        </div>

        {/* Article Body */}
        <article className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-slate-700 dark:text-slate-300 text-base leading-relaxed bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-lg font-medium text-slate-900 dark:text-slate-100 leading-relaxed border-l-4 border-lime-600 pl-4">
            The Union Budget 2026 presents pivotal amendments aimed at simplifying compliance for individual taxpayers, easing tax dispute litigation, and providing targeted incentives to manufacturing and technology MSMEs.
          </p>

          <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white pt-4">
            1. Slabs & Rate Restructuring Under Section 115BAC
          </h2>
          <p>
            The New Tax Regime under Section 115BAC continues as the default tax regime for individuals and HUFs. Key adjustments include:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Standard Deduction for Salaried Employees:</strong> Maintained at ₹75,000.</li>
            <li><strong>Zero Tax Threshold:</strong> Rebate under Section 87A ensures zero tax liability for income up to ₹7,00,000.</li>
            <li><strong>Highest Surcharge Cap:</strong> Surcharge on high net-worth individuals (income exceeding ₹5 Crores) capped at 25%, reducing the effective top tax rate to 39%.</li>
          </ul>

          <div className="my-6 p-4 rounded-2xl bg-lime-600/10 border border-lime-600/30 text-slate-900 dark:text-slate-100 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-lime-600 shrink-0 mt-0.5" />
            <div className="text-sm">
              <strong className="font-semibold text-lime-700 dark:text-lime-400 block mb-1">TaxMate Expert Tip:</strong>
              If your total allowable deductions under Chapter VI-A (80C, 80D, 24(b) Home Loan Interest) exceed ₹3.75 Lakhs, evaluate the Old Tax Regime using the TaxMate Interactive Tax Calculator before submitting Form 10-IEA.
            </div>
          </div>

          <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white pt-4">
            2. GST Invoice Matching & ITC Rationalization
          </h2>
          <p>
            Under Section 16(4) of the CGST Act, amendments formalize strict real-time verification of supplier e-invoices with GSTR-2B. Key compliance items include:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Strict blocking of Input Tax Credit if GSTR-1 is not filed by the supplying vendor.</li>
            <li>Extended timeline for annual ITC reversal reconciliations under Rule 42 and Rule 43.</li>
          </ul>

          <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white pt-4">
            3. Corporate Minimum Alternate Tax (MAT) Updates
          </h2>
          <p>
            The MAT rate under Section 115JB remains at 15%. However, startups opting for concessional tax rates under Section 115BAA are completely exempt from MAT provisions.
          </p>

          {/* CTA Box */}
          <div className="mt-10 p-6 rounded-2xl bg-slate-900 text-white border border-slate-800 text-center space-y-4">
            <h3 className="text-xl font-bold font-display">Need Custom Tax Advisory for Your Business?</h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
              Schedule a 1-on-1 consultation with verified Chartered Accountants on TaxMate to optimize your tax planning and compliance.
            </p>
            <div className="flex justify-center gap-3">
              <Link href="/client/find-ca">
                <Button className="bg-lime-600 hover:bg-lime-500 text-white font-bold text-xs rounded-xl shadow-md shadow-lime-600/30">
                  Find Verified CAs
                </Button>
              </Link>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
