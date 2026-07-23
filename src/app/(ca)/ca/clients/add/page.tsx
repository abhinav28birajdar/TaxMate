'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Building, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function AddClientPage() {
  const router = useRouter();
  const [clientType, setClientType] = useState<'business' | 'individual'>('business');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    pan: '',
    gstin: '',
    companyType: 'Private Limited',
    turnover: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.pan) {
      toast.error('Please fill in required fields (Name, Email, PAN)');
      return;
    }
    toast.success('Client registered successfully!');
    router.push('/ca/clients');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Add New Client</h1>
          <p className="text-xs text-slate-500">Register business entity or individual taxpayer</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex gap-4 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl max-w-md">
          <button
            type="button"
            onClick={() => setClientType('business')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              clientType === 'business'
                ? 'bg-lime-600 text-white shadow'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Building className="w-4 h-4" /> Business Entity
          </button>
          <button
            type="button"
            onClick={() => setClientType('individual')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              clientType === 'individual'
                ? 'bg-lime-600 text-white shadow'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4" /> Individual Taxpayer
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                {clientType === 'business' ? 'Company Name *' : 'Full Name *'}
              </label>
              <Input
                type="text"
                placeholder={clientType === 'business' ? 'Acme Corp Pvt Ltd' : 'Ananya Deshmukh'}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address *</label>
              <Input
                type="email"
                placeholder="client@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
              <Input
                type="text"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">PAN Number *</label>
              <Input
                type="text"
                placeholder="ABCDE1234F"
                value={formData.pan}
                onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 uppercase font-mono"
              />
            </div>

            {clientType === 'business' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">GSTIN</label>
                  <Input
                    type="text"
                    placeholder="27ABCDE1234F1Z5"
                    value={formData.gstin}
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                    className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 uppercase font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Annual Turnover</label>
                  <Input
                    type="text"
                    placeholder="e.g. ₹1.5 Cr"
                    value={formData.turnover}
                    onChange={(e) => setFormData({ ...formData, turnover: e.target.value })}
                    className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  />
                </div>
              </>
            )}
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" className="bg-lime-600 hover:bg-lime-500 text-white font-semibold shadow-md shadow-lime-600/20">
              <Save className="w-4 h-4 mr-2" /> Save Client Profile
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
