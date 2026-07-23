'use client';

import { useState } from 'react';
import { Star, Plus, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function ClientReviewsPage() {
  const reviews = [
    { caName: 'CA Rajesh Sharma', rating: 5, date: '18 Oct 2026', comment: 'Excellent tax audit turnaround and prompt replies on TaxMate chat.' },
    { caName: 'CA Ananya Deshmukh', rating: 5, date: '12 Jul 2026', comment: 'Saved me ₹46,800 in deductions under Sec 80C & 80D. Very knowledgeable.' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Star className="w-6 h-6 text-lime-600 fill-lime-600" /> My Feedback & CA Reviews
          </h1>
          <p className="text-xs text-slate-500 mt-1">Review ratings and feedback submitted for your Chartered Accountants.</p>
        </div>
        <Button onClick={() => toast.success('Write review drawer opened!')} className="bg-lime-600 hover:bg-lime-500 text-white font-semibold text-xs shadow-md shadow-lime-600/20">
          <Plus className="w-4 h-4 mr-1.5" /> Rate a CA
        </Button>
      </div>

      <div className="space-y-3">
        {reviews.map((r, i) => (
          <div key={i} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                {r.caName} <ShieldCheck className="w-4 h-4 text-lime-600" />
              </h4>
              <div className="flex text-lime-500">
                {[...Array(r.rating)].map((_, idx) => (
                  <Star key={idx} className="w-3.5 h-3.5 fill-lime-500" />
                ))}
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 italic">&ldquo;{r.comment}&rdquo;</p>
            <span className="text-[10px] text-slate-400 font-semibold block">{r.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
