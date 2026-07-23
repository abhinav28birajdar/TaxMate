'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, ShieldCheck, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function HireCAPage({ params }: { params: { caId: string } }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: 'GSTR-1 & ITR Annual Tax Engagement',
    budget: '15000',
    notes: 'We require monthly GSTR-1, 3B filings and year-end corporate tax audit.',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Proposal request sent to CA!');
    router.push('/client/dashboard');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to CA List
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Send Hire Proposal Request</h1>
          <p className="text-xs text-slate-500">Request consultation or engagement proposal from CA Rajesh Sharma</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="p-4 bg-lime-600/10 border border-lime-600/20 rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-lime-600 text-white font-bold flex items-center justify-center">
            RS
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1">
              CA Rajesh Sharma <ShieldCheck className="w-4 h-4 text-lime-600" />
            </h3>
            <p className="text-xs text-slate-500">Apex Tax & Audit Firm | Fee: ₹3,500 / consultation</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Engagement Title *</label>
            <Input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="bg-slate-50 dark:bg-slate-800 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Estimated Budget (₹)</label>
            <Input
              type="number"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              className="bg-slate-50 dark:bg-slate-800 text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Project Details / Requirements</label>
            <textarea
              rows={4}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime-600"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" className="bg-lime-600 hover:bg-lime-500 text-white font-semibold shadow-md shadow-lime-600/20">
              <Send className="w-4 h-4 mr-2" /> Send Proposal Request
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
