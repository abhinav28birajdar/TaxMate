'use client';

import { useState } from 'react';
import { User, Save, ShieldCheck, Building2, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function ClientProfilePage() {
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Client tax profile updated successfully!');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <User className="w-6 h-6 text-lime-600" /> Client Tax Profile & KYC
        </h1>
        <p className="text-xs text-slate-500 mt-1">Personal, PAN, Aadhaar, GSTIN, and primary bank details for annual tax returns.</p>
      </div>

      <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm border-b border-slate-100 dark:border-slate-800 pb-3">
            Personal & Identification Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Legal Name (as per PAN) *</label>
              <Input defaultValue="Abhinav Birajdar" className="text-xs" />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">PAN Number *</label>
              <Input defaultValue="AAACT1234F" className="text-xs font-mono uppercase" />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Aadhaar Number</label>
              <Input defaultValue="**** **** 8912" className="text-xs font-mono" />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Date of Birth / Incorporation</label>
              <Input type="date" defaultValue="1994-05-15" className="text-xs" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm border-b border-slate-100 dark:border-slate-800 pb-3">
            Business & Primary Bank Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Business Entity Name</label>
              <Input defaultValue="TechNova Solutions Pvt Ltd" className="text-xs" />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">GSTIN Number</label>
              <Input defaultValue="27AAACT1234F1Z5" className="text-xs font-mono uppercase" />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Bank Name & A/C Number</label>
              <Input defaultValue="HDFC Bank (A/C ****4091)" className="text-xs font-mono" />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">IFSC Code</label>
              <Input defaultValue="HDFC0001234" className="text-xs font-mono uppercase" />
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end border-t border-slate-100 dark:border-slate-800">
          <Button type="submit" className="bg-lime-600 hover:bg-lime-500 text-white font-semibold text-xs shadow-md shadow-lime-600/20">
            <Save className="w-4 h-4 mr-1.5" /> Save Tax Profile
          </Button>
        </div>
      </form>
    </div>
  );
}
