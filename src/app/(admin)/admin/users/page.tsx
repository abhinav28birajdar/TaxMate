'use client';

import { useState } from 'react';
import { Users, Search, Shield, Ban, CheckCircle2, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AdminUsersPage() {
  const users = [
    { id: 'u1', name: 'CA Rajesh Sharma', email: 'rajesh@apextax.in', role: 'CA Firm Admin', firm: 'Apex Tax & Audit', status: 'Active', verified: true },
    { id: 'u2', name: 'TechNova Solutions', email: 'accounts@technova.com', role: 'Client (Business)', firm: 'Apex Tax & Audit', status: 'Active', verified: true },
    { id: 'u3', name: 'Ananya Deshmukh', email: 'ananya@gmail.com', role: 'Client (Individual)', firm: 'Mehta Consultancy', status: 'Active', verified: true },
    { id: 'u4', name: 'Super Admin', email: 'admin@taxmate.in', role: 'Super Admin', firm: 'TaxMate SaaS Platform', status: 'Active', verified: true },
  ];

  return (
    <div className="space-y-6 text-slate-100">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Users className="w-6 h-6 text-lime-400" /> Platform User Management
        </h1>
        <p className="text-xs text-slate-400 mt-1">Manage platform accounts, role permissions, suspension states, and verification status.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-200 font-semibold border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4">User Name</th>
              <th className="py-3.5 px-4">Email</th>
              <th className="py-3.5 px-4">Role</th>
              <th className="py-3.5 px-4">Associated Firm</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-lime-600/20 text-lime-400 font-bold flex items-center justify-center text-xs">
                    {u.name.charAt(0)}
                  </div>
                  {u.name}
                </td>
                <td className="py-3.5 px-4">{u.email}</td>
                <td className="py-3.5 px-4 font-semibold text-lime-400">{u.role}</td>
                <td className="py-3.5 px-4 text-slate-400">{u.firm}</td>
                <td className="py-3.5 px-4">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-lime-600/20 text-lime-400 border border-lime-500/30">
                    {u.status}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white text-xs">
                    Manage
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
