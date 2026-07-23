'use client';

import { useState } from 'react';
import { Star, MessageSquare, ShieldCheck, ThumbsUp, UserCheck, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CAReviewsPage() {
  const reviews = [
    {
      id: 'rev-1',
      client: 'Abhinav Birajdar',
      company: 'TechNova Solutions Pvt Ltd',
      rating: 5,
      date: '18 Oct 2026',
      service: 'GSTR-3B & Tax Audit',
      comment: 'CA Rajesh Sharma and the team resolved our complex GST input tax credit discrepancy within 48 hours. Excellent service!',
      verified: true,
    },
    {
      id: 'rev-2',
      client: 'Dr. Vikramaditya Rao',
      company: 'Rao Dental Clinic',
      rating: 5,
      date: '14 Oct 2026',
      service: 'Presumptive ITR-4 Filing',
      comment: 'Very professional handling of medical practice tax deductions under Sec 44ADA. Highly recommended for doctors.',
      verified: true,
    },
    {
      id: 'rev-3',
      client: 'Priya Sundaram',
      company: 'Apex Logistics India LLP',
      rating: 4,
      date: '02 Oct 2026',
      service: 'Corporate Income Tax & Transfer Pricing',
      comment: 'Thorough audit execution. Document collection through the TaxMate Vault was extremely smooth.',
      verified: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Star className="w-6 h-6 text-lime-600 fill-lime-600" /> Client Reviews & ICAI Reputation Ratings
        </h1>
        <p className="text-xs text-slate-500 mt-1">Verified client feedback, net promoter score (NPS), and public marketplace ratings.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-lime-600/10 border border-lime-600/20 rounded-2xl flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-lime-600 text-white font-black flex items-center justify-center text-xl shadow-md shadow-lime-600/30">
            4.9
          </div>
          <div>
            <div className="flex text-lime-600 dark:text-lime-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-lime-500 text-lime-500" />
              ))}
            </div>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Overall Rating (142 Reviews)</span>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Client Retention Rate</span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">98.4%</div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Verified Marketplace Badge</span>
          <div className="text-sm font-extrabold text-lime-600 dark:text-lime-400 flex items-center gap-1.5 mt-2">
            <ShieldCheck className="w-4 h-4" /> ICAI Verified Firm
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Net Promoter Score (NPS)</span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">+84 Excellent</div>
        </div>
      </div>

      <div className="space-y-4">
        {reviews.map((r) => (
          <div key={r.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-lime-600/20 text-lime-600 font-bold flex items-center justify-center text-sm border border-lime-500/30">
                  {r.client.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                    {r.client} {r.verified && <ShieldCheck className="w-4 h-4 text-lime-600" />}
                  </h4>
                  <p className="text-xs text-slate-400">{r.company} • {r.service}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(r.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-lime-500 text-lime-500" />
                  ))}
                </div>
                <span className="text-xs text-slate-400 font-semibold">{r.date}</span>
              </div>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 italic leading-relaxed pl-13">
              &ldquo;{r.comment}&rdquo;
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
