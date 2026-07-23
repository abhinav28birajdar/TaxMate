'use client';

import { useState } from 'react';
import { FileText, Upload, Download, Search, Filter, Sparkles, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

export default function ClientDocumentsPage() {
  const [search, setSearch] = useState('');

  const documents = [
    { name: 'Form 26AS FY2025-26.pdf', category: 'Tax Documents', date: '18 Oct 2026', size: '2.4 MB', status: 'Extracted' },
    { name: 'HDFC Bank Statement Q2.pdf', category: 'Bank Statements', date: '15 Oct 2026', size: '4.1 MB', status: 'OCR Verified' },
    { name: 'Health Insurance Policy 80D.pdf', category: 'Investment Proofs', date: '10 Oct 2026', size: '1.2 MB', status: 'Verified' },
    { name: 'PAN Card Copy.pdf', category: 'KYC Documents', date: '01 Jan 2026', size: '0.8 MB', status: 'Verified' },
  ];

  const filteredDocs = documents.filter((d) => d.name.toLowerCase().includes(search.toLowerCase()) || d.category.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-lime-600" /> Secure Document Vault
          </h1>
          <p className="text-xs text-slate-500 mt-1">256-bit encrypted storage for Form 16, Bank Statements, and Investment Proofs.</p>
        </div>
        <Link href="/client/documents/upload">
          <Button className="bg-lime-600 hover:bg-lime-500 text-white font-semibold text-xs shadow-md shadow-lime-600/20">
            <Upload className="w-4 h-4 mr-1.5" /> Upload New File
          </Button>
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 flex gap-3 shadow-sm">
        <Input placeholder="Search document name or category..." value={search} onChange={(e) => setSearch(e.target.value)} className="text-xs" />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-3.5 px-4">Document Title</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Date Uploaded</th>
              <th className="py-3.5 px-4">File Size</th>
              <th className="py-3.5 px-4">OCR Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {filteredDocs.map((d, i) => (
              <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-lime-600" />
                  {d.name}
                </td>
                <td className="py-3.5 px-4">{d.category}</td>
                <td className="py-3.5 px-4">{d.date}</td>
                <td className="py-3.5 px-4 font-mono">{d.size}</td>
                <td className="py-3.5 px-4">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-lime-600/20 text-lime-600 dark:text-lime-400 border border-lime-500/30">
                    <Sparkles className="w-3 h-3 inline mr-1" /> {d.status}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <Button size="sm" variant="ghost" className="text-lime-600">
                    <Download className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
