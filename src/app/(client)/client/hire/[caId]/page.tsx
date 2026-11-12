'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Send, ShieldCheck, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function HireCAPage() {
  const params = useParams<{ caId: string }>();
  const caId = params?.caId || '';
  const router = useRouter();

  const [caInfo, setCaInfo] = useState<{
    id: string;
    name: string;
    firm: string;
    fee: string;
  } | null>(null);
  const [loadingCa, setLoadingCa] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    serviceCategory: 'tax_filing',
    budget: '',
    financialYear: '2026-27',
    notes: '',
  });

  useEffect(() => {
    if (!caId) return;
    (async () => {
      try {
        setLoadingCa(true);
        const res = await fetch(`/api/cas?id=${encodeURIComponent(caId)}`, {
          credentials: 'include',
        });
        const json = await res.json();
        if (res.ok && json.ca) {
          setCaInfo({
            id: json.ca.id,
            name: json.ca.name,
            firm: json.ca.firm,
            fee: json.ca.fee,
          });
        }
      } catch {
        // Handled cleanly below
      } finally {
        setLoadingCa(false);
      }
    })();
  }, [caId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Please enter an engagement title.');
      return;
    }

    setSubmitting(true);
    try {
      const targetCaId = caInfo?.id || caId;
      const res = await fetch('/api/ca-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          caId: targetCaId,
          requestType: 'hire',
          title: formData.title.trim(),
          serviceCategory: formData.serviceCategory,
          proposedBudget: formData.budget ? Number(formData.budget) : undefined,
          financialYear: formData.financialYear,
          message: formData.notes.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to submit engagement request');
      }

      toast.success('Engagement request sent to the CA!');
      router.push('/client/ca');
    } catch (err: any) {
      toast.error(err.message || 'Could not submit engagement request');
    } finally {
      setSubmitting(false);
    }
  };

  const initials = (caInfo?.name || 'CA')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('');

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to CA List
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Send Hire Proposal Request
          </h1>
          <p className="text-xs text-slate-500">
            Request consultation or ongoing engagement with {caInfo?.name || 'your chosen CA'}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
        {loadingCa ? (
          <div className="p-4 flex items-center text-xs text-slate-400">
            <RefreshCw className="w-4 h-4 animate-spin mr-2" /> Loading CA details...
          </div>
        ) : (
          <div className="p-4 bg-lime-600/10 border border-lime-600/20 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-lime-600 text-white font-bold flex items-center justify-center">
              {initials || 'CA'}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1">
                {caInfo?.name || 'Chartered Accountant'}{' '}
                <ShieldCheck className="w-4 h-4 text-lime-600" />
              </h3>
              <p className="text-xs text-slate-500">
                {caInfo?.firm || 'Verified Practice'} | {caInfo?.fee || 'Consultation Available'}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Engagement Title *
            </label>
            <Input
              type="text"
              required
              placeholder="E.g. Annual ITR-3 & Monthly GST Retainer"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="bg-slate-50 dark:bg-slate-800 text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Service Category
              </label>
              <select
                value={formData.serviceCategory}
                onChange={(e) => setFormData({ ...formData, serviceCategory: e.target.value })}
                className="w-full h-10 px-3 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              >
                <option value="tax_filing">Income Tax Filing (ITR)</option>
                <option value="gst">GST Registration & Filings</option>
                <option value="audit">Statutory / Tax Audit</option>
                <option value="advisory">Tax Planning & Notice Reply</option>
                <option value="general">Full Retainer Advisory</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Financial Year
              </label>
              <select
                value={formData.financialYear}
                onChange={(e) => setFormData({ ...formData, financialYear: e.target.value })}
                className="w-full h-10 px-3 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              >
                <option value="2026-27">FY 2026-27</option>
                <option value="2025-26">FY 2025-26</option>
                <option value="2024-25">FY 2024-25</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Proposed Budget (₹)
            </label>
            <Input
              type="number"
              min="0"
              placeholder="e.g. 15000"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              className="bg-slate-50 dark:bg-slate-800 text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Project Details / Requirements
            </label>
            <textarea
              rows={4}
              placeholder="Describe your filings, turnover, income streams, or notice deadlines..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime-600"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-lime-600 hover:bg-lime-500 text-white font-semibold shadow-md shadow-lime-600/20"
            >
              <Send className="w-4 h-4 mr-2" />
              {submitting ? 'Sending...' : 'Send Proposal Request'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
