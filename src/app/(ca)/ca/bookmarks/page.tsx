"use client";

import React from 'react';
import { Bookmark, FileText, User, Star } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function CABookmarksPage() {
  const bookmarks = [
    { id: '1', title: 'Acme Solutions - Tax Clearance Certificate 2025', category: 'Document', date: 'Saved 2 days ago' },
    { id: '2', title: 'Pooja Verma (Individual Client)', category: 'Client Profile', date: 'Saved 1 week ago' },
    { id: '3', title: 'CBIC Circular on ITC Reversal under Rule 42', category: 'Tax Circular', date: 'Saved 2 weeks ago' }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Bookmark className="w-6 h-6 text-lime-500" /> Bookmarked & Saved Items
        </h1>
        <p className="text-sm text-slate-400">Quick access to pinned clients, key documents, and tax circulars</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {bookmarks.map(b => (
          <Card key={b.id} className="bg-slate-900 border-slate-800 p-5 space-y-3 hover:border-lime-500/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-lime-400 bg-lime-600/10 border border-lime-500/20 px-2.5 py-1 rounded-full">{b.category}</span>
              <span className="text-xs text-slate-500">{b.date}</span>
            </div>
            <h3 className="font-semibold text-slate-100 text-sm">{b.title}</h3>
          </Card>
        ))}
      </div>
    </div>
  );
}
