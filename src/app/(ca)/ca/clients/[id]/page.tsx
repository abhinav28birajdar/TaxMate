'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Building2, 
  User, 
  FileText, 
  Receipt, 
  CheckSquare, 
  Calendar, 
  ShieldCheck, 
  ArrowLeft, 
  Plus, 
  Mail, 
  Phone,
  Sparkles,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CAClientWorkspacePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'profile' | 'returns' | 'documents' | 'invoices' | 'tasks'>('profile');

  const clientInfo = {
    id: params.id || 'cli_1',
    name: 'TechNova Solutions Pvt Ltd',
    contactPerson: 'Abhinav Birajdar (Director)',
    email: 'accounts@technova.com',
    phone: '+91 98765 43210',
    type: 'Business (Private Limited)',
    pan: 'AAACT1234F',
    gstin: '27AAACT1234F1Z5',
    turnover: '₹1.50 Crore',
    regDate: '15 March 2021',
    status: 'Active',
    assignedCA: 'CA Rajesh Sharma',
  };

  return (
    <div className="space-y-6">
      {/* Client Workspace Active Banner */}
      <div className="p-4 bg-gradient-to-r from-lime-900/40 via-slate-900 to-slate-900 border border-lime-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-white shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-lime-600 flex items-center justify-center font-bold text-white shadow-md shadow-lime-600/30">
            {clientInfo.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">{clientInfo.name}</h2>
              <span className="px-2 py-0.5 bg-lime-600/20 text-lime-400 border border-lime-500/30 text-[10px] font-bold rounded">
                Active Client Workspace
              </span>
            </div>
            <p className="text-xs text-slate-300">PAN: {clientInfo.pan} | GSTIN: {clientInfo.gstin}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push('/ca/clients')} className="border-slate-700 text-slate-300 text-xs">
            <ArrowLeft className="w-4 h-4 mr-1" /> All Clients
          </Button>
          <Button size="sm" className="bg-lime-600 hover:bg-lime-500 text-white font-semibold text-xs shadow-md shadow-lime-600/20">
            <Plus className="w-4 h-4 mr-1" /> Request Document
          </Button>
        </div>
      </div>

      {/* Workspace Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
        {[
          { key: 'profile', label: 'Client Profile & Tax Details', icon: User },
          { key: 'returns', label: 'Tax Returns & Filings', icon: ShieldCheck },
          { key: 'documents', label: 'Documents Vault', icon: FileText },
          { key: 'invoices', label: 'Invoices & Ledger', icon: Receipt },
          { key: 'tasks', label: 'Assigned Tasks', icon: CheckSquare },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`pb-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === tab.key
                ? 'border-lime-600 text-lime-600 dark:text-lime-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm border-b border-slate-100 dark:border-slate-800 pb-3">
              Entity & Contact Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block">Company Name</span>
                <span className="font-semibold text-slate-900 dark:text-white">{clientInfo.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Contact Person</span>
                <span className="font-semibold text-slate-900 dark:text-white">{clientInfo.contactPerson}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Email Address</span>
                <span className="font-semibold text-slate-900 dark:text-white">{clientInfo.email}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Phone Number</span>
                <span className="font-semibold text-slate-900 dark:text-white">{clientInfo.phone}</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm border-b border-slate-100 dark:border-slate-800 pb-3">
              Tax Registration Details
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block">PAN Number</span>
                <span className="font-mono font-bold text-lime-600 dark:text-lime-400">{clientInfo.pan}</span>
              </div>
              <div>
                <span className="text-slate-400 block">GSTIN</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{clientInfo.gstin}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Annual Turnover</span>
                <span className="font-semibold text-slate-900 dark:text-white">{clientInfo.turnover}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Assigned Partner</span>
                <span className="font-semibold text-slate-900 dark:text-white">{clientInfo.assignedCA}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'returns' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Filing Type</th>
                <th className="py-3.5 px-4">Period / AY</th>
                <th className="py-3.5 px-4">Due Date</th>
                <th className="py-3.5 px-4">Tax Amount</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">GSTR-3B Return</td>
                <td className="py-3.5 px-4">September 2026</td>
                <td className="py-3.5 px-4">20 Oct 2026</td>
                <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">₹82,400</td>
                <td className="py-3.5 px-4">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                    Pending
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">ITR-6 Corporate Return</td>
                <td className="py-3.5 px-4">AY 2026-27</td>
                <td className="py-3.5 px-4">31 Oct 2026</td>
                <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">₹37,50,000</td>
                <td className="py-3.5 px-4">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-lime-600/10 text-lime-600 border border-lime-600/20">
                    Under Review
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Client Document Files</h3>
            <Button size="sm" className="bg-lime-600 hover:bg-lime-500 text-white font-semibold">
              <Plus className="w-4 h-4 mr-1" /> Request New File
            </Button>
          </div>
          <div className="space-y-3">
            {[
              { name: 'Form 26AS FY2025-26.pdf', date: '18 Oct 2026', size: '2.4 MB', ocr: 'Extracted' },
              { name: 'HDFC Bank Statement Q2.pdf', date: '15 Oct 2026', size: '4.1 MB', ocr: 'Verified' },
            ].map((d, i) => (
              <div key={i} className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-lime-600" />
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">{d.name}</div>
                    <div className="text-slate-400 text-[10px]">{d.date} • {d.size}</div>
                  </div>
                </div>
                <Button size="sm" variant="ghost" className="text-lime-600">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
