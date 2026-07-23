'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Star, MapPin, ShieldCheck, CheckCircle2, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function FindCAPage() {
  const [search, setSearch] = useState('');

  const cas = [
    { id: 'ca_1', name: 'CA Rajesh Sharma', firm: 'Apex Tax & Audit Firm', exp: '14 Years', rating: 4.9, reviews: 48, loc: 'Mumbai, MH', fee: '₹3,500', specs: ['GST Filings', 'Corporate Tax Audit', 'Transfer Pricing'] },
    { id: 'ca_2', name: 'CA Priya Mehta', firm: 'Mehta Consultancy', exp: '9 Years', rating: 4.8, reviews: 36, loc: 'Bengaluru, KA', fee: '₹2,500', specs: ['Startup Tax Registration', 'ITR 1-4', 'NRI Taxation'] },
    { id: 'ca_3', name: 'CA Anish Kumar', firm: 'Kumar & Associates', exp: '11 Years', rating: 4.9, reviews: 52, loc: 'Chennai, TN', fee: '₹3,000', specs: ['TDS & ROC Compliance', 'International Tax', 'GST Appeals'] },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Find & Hire Chartered Accountants</h1>
          <p className="text-xs text-slate-500 mt-1">Browse ICAI verified CAs, review consultation fees, ratings, and hire instantly.</p>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search by CA name, city, GST, ITR, or specialization..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="w-4 h-4 mr-2" /> Filters
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cas.map((ca) => (
          <div key={ca.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 hover:border-lime-600 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-lime-600/10 text-lime-600 font-bold flex items-center justify-center text-base border border-lime-600/20">
                  {ca.name.split(' ')[1]?.charAt(0) || 'C'}
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  <Star className="w-3.5 h-3.5 fill-amber-500" /> {ca.rating} ({ca.reviews})
                </div>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-1.5">
                  {ca.name} <ShieldCheck className="w-4 h-4 text-lime-600" />
                </h3>
                <p className="text-xs text-slate-500">{ca.firm}</p>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {ca.loc}</span>
                <span>• {ca.exp} Exp</span>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-2">
                {ca.specs.map((sp) => (
                  <span key={sp} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-semibold rounded-md">
                    {sp}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block">Consultation Fee</span>
                <span className="text-base font-extrabold text-slate-900 dark:text-white">{ca.fee}</span>
              </div>
              <Link href={`/client/hire/${ca.id}`}>
                <Button size="sm" className="bg-lime-600 hover:bg-lime-500 text-white font-semibold shadow-md shadow-lime-600/20">
                  Hire CA
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
