'use client';

import { useState } from 'react';
import { Bookmark, Star, ShieldCheck, Phone, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ClientBookmarksPage() {
  const bookmarks = [
    { caId: 'ca_1', name: 'CA Rajesh Sharma', firm: 'Apex Tax & Audit Firm', exp: '14+ Years', rating: 4.9, spec: 'Corporate Tax & GST' },
    { caId: 'ca_2', name: 'CA Ananya Deshmukh', firm: 'Mehta Consultancy', exp: '9+ Years', rating: 4.8, spec: 'Individual ITR & Sec 44ADA' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Bookmark className="w-6 h-6 text-lime-600" /> Bookmarked Chartered Accountants
        </h1>
        <p className="text-xs text-slate-500 mt-1">Saved CA profiles for quick consultation booking and tax advisory requests.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {bookmarks.map((b) => (
          <div key={b.caId} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-1.5">
                  {b.name} <ShieldCheck className="w-4 h-4 text-lime-600" />
                </h3>
                <p className="text-xs text-slate-400">{b.firm} • {b.exp}</p>
              </div>
              <div className="flex items-center text-xs font-bold text-slate-900 dark:text-white">
                <Star className="w-4 h-4 fill-lime-500 text-lime-500 mr-1" /> {b.rating}
              </div>
            </div>

            <div className="text-xs font-semibold text-lime-600 dark:text-lime-400">
              Specialization: {b.spec}
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <Link href={`/client/hire/${b.caId}`}>
                <Button size="sm" className="bg-lime-600 hover:bg-lime-500 text-white font-semibold text-xs">
                  Hire / Send Proposal <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
