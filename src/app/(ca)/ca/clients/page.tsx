'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Plus, UserCheck, ShieldCheck, Mail, Phone, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ClientsPage() {
  const [search, setSearch] = useState('');

  const clients = [
    { id: 'cli_1', name: 'TechNova Solutions Pvt Ltd', type: 'Business', pan: 'AAACT1234F', gstin: '27AAACT1234F1Z5', turnover: '₹1.5 Cr', status: 'Active', assignedCA: 'CA Rajesh Sharma' },
    { id: 'cli_2', name: 'Ananya Deshmukh', type: 'Individual', pan: 'BKPD19876K', gstin: 'N/A', turnover: '₹24 L', status: 'Active', assignedCA: 'CA Rajesh Sharma' },
    { id: 'cli_3', name: 'Apex Logistics India', type: 'Business', pan: 'BBBCA5678G', gstin: '27BBBCA5678G2Z1', turnover: '₹4.2 Cr', status: 'Active', assignedCA: 'CA Priya Mehta' },
    { id: 'cli_4', name: 'Dr. Vikramaditya Rao', type: 'Individual', pan: 'CHIPR4321M', gstin: 'N/A', turnover: '₹45 L', status: 'Active', assignedCA: 'CA Rajesh Sharma' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Clients CRM</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Manage client profiles, GSTINs, turnover, and filing status.</p>
        </div>
        <Link href="/ca/clients/add">
          <Button className="bg-lime-600 hover:bg-lime-500 text-white font-semibold shadow-md shadow-lime-600/20">
            <Plus className="w-4 h-4 mr-2" /> Add New Client
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search by client name, PAN, GSTIN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Client Name</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">PAN / GSTIN</th>
                <th className="py-3.5 px-4">Turnover</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {clients.map((cli) => (
                <tr key={cli.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-lime-600/10 text-lime-600 font-bold flex items-center justify-center text-xs border border-lime-600/20">
                      {cli.name.charAt(0)}
                    </div>
                    <div>
                      <Link href={`/ca/clients/${cli.id}`} className="hover:text-lime-600 dark:hover:text-lime-400">
                        {cli.name}
                      </Link>
                      <p className="text-[10px] text-slate-400 font-normal">{cli.assignedCA}</p>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-medium">{cli.type}</td>
                  <td className="py-3.5 px-4 font-mono text-[11px]">
                    <div>PAN: {cli.pan}</div>
                    <div className="text-slate-400">{cli.gstin}</div>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100">{cli.turnover}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-lime-600/10 text-lime-600 dark:text-lime-400 border border-lime-600/20">
                      {cli.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link href={`/ca/clients/${cli.id}`}>
                      <Button variant="ghost" size="sm" className="text-slate-600 dark:text-slate-300 hover:text-lime-600">
                        View Details
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
