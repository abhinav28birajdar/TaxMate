'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { IndianRupee, Plus, Trash2, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface IncomeEntry {
  id: string;
  category: string;
  source: string;
  fy: string;
  amount: number;
  tds: number;
}

export default function ClientIncomeManagementPage() {
  const [incomes, setIncomes] = useState<IncomeEntry[]>([]);
  const [onboardingMeta, setOnboardingMeta] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const [category, setCategory] = useState('Salary');
  const [source, setSource] = useState('');
  const [fy, setFy] = useState('FY 2025-26');
  const [amount, setAmount] = useState('');
  const [tds, setTds] = useState('');

  const loadDisclosures = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/onboarding', { credentials: 'include' });
      const json = await res.json();
      if (res.ok) {
        const ob = json?.data?.onboarding || {};
        setOnboardingMeta(ob);
        const list = ob?.preferences?.incomeDisclosures;
        setIncomes(Array.isArray(list) ? list : []);
      }
    } catch {
      toast.error('Unable to load saved income disclosures');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDisclosures();
  }, [loadDisclosures]);

  const persistList = async (nextList: IncomeEntry[]) => {
    setSaving(true);
    try {
      const res = await fetch('/api/v1/onboarding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          step: onboardingMeta?.current_step || 5,
          completed: Boolean(onboardingMeta?.is_completed),
          basicInfo: onboardingMeta?.basic_info || {},
          interests: Array.from(new Set(nextList.map((i) => i.category))),
          preferences: {
            ...(onboardingMeta?.preferences || {}),
            incomeDisclosures: nextList,
          },
        }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.message || 'Failed to save income disclosures');
      }
      setIncomes(nextList);
      return true;
    } catch (err: any) {
      toast.error(err?.message || 'Save failed');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = Number(amount);
    const numericTds = Number(tds || 0);
    if (!source.trim() || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      toast.error('Provide an income source and positive gross amount.');
      return;
    }

    const entry: IncomeEntry = {
      id: `inc_${Date.now()}`,
      category,
      source: source.trim(),
      fy,
      amount: numericAmount,
      tds: Number.isFinite(numericTds) && numericTds >= 0 ? numericTds : 0,
    };

    const ok = await persistList([entry, ...incomes]);
    if (ok) {
      setSource('');
      setAmount('');
      setTds('');
      setShowAdd(false);
      toast.success('Income source added to tax disclosures');
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await persistList(incomes.filter((i) => i.id !== id));
    if (ok) toast.success('Income source removed');
  };

  const totalGross = useMemo(() => incomes.reduce((sum, item) => sum + Number(item.amount || 0), 0), [incomes]);
  const totalTds = useMemo(() => incomes.reduce((sum, item) => sum + Number(item.tds || 0), 0), [incomes]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <IndianRupee className="w-6 h-6 text-lime-600" /> Income Sources &amp; Tax Disclosures
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Declare Salary, Business, Freelance, Rental, and Capital Gains for your assigned CA.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadDisclosures} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Button
            onClick={() => setShowAdd((p) => !p)}
            className="bg-lime-600 hover:bg-lime-500 text-white font-semibold shadow-md shadow-lime-600/20"
          >
            <Plus className="w-4 h-4 mr-2" /> {showAdd ? 'Cancel' : 'Add Income Source'}
          </Button>
        </div>
      </div>

      {showAdd && (
        <form
          onSubmit={handleAdd}
          className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl grid grid-cols-1 sm:grid-cols-5 gap-3 items-end"
        >
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
            >
              <option value="Salary">Salary</option>
              <option value="Freelance / Professional">Freelance / Professional</option>
              <option value="Business Income">Business Income</option>
              <option value="Capital Gains">Capital Gains</option>
              <option value="House Property / Rental">House Property / Rental</option>
              <option value="Interest & Dividend">Interest &amp; Dividend</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Source / Employer *</label>
            <Input required value={source} onChange={(e) => setSource(e.target.value)} placeholder="Employer or broker name" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Financial Year</label>
            <Input value={fy} onChange={(e) => setFy(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Gross Amount (₹) *</label>
            <Input required type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="1200000" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">TDS Deducted (₹)</label>
            <Input type="number" min="0" value={tds} onChange={(e) => setTds(e.target.value)} placeholder="0" />
          </div>
          <div className="sm:col-span-5 flex justify-end">
            <Button type="submit" disabled={saving} className="bg-lime-600 hover:bg-lime-500 text-white font-semibold">
              {saving ? 'Saving...' : 'Save Disclosure'}
            </Button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Gross Total Income</span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            ₹{totalGross.toLocaleString('en-IN')}
          </div>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold text-slate-500">TDS Deducted (Form 26AS)</span>
          <div className="text-2xl font-extrabold text-lime-600 dark:text-lime-400 mt-1">
            ₹{totalTds.toLocaleString('en-IN')}
          </div>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Assessment Year</span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">AY 2026-27</div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto shadow-sm">
        <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-3.5 px-4">Income Category</th>
              <th className="py-3.5 px-4">Source / Employer</th>
              <th className="py-3.5 px-4">Financial Year</th>
              <th className="py-3.5 px-4">Gross Amount</th>
              <th className="py-3.5 px-4">TDS Deducted</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin inline mr-2 text-lime-600" /> Loading income disclosures...
                </td>
              </tr>
            ) : incomes.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  No income sources declared yet. Click &ldquo;Add Income Source&rdquo; to begin.
                </td>
              </tr>
            ) : (
              incomes.map((inc) => (
                <tr key={inc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{inc.category}</td>
                  <td className="py-3.5 px-4">{inc.source}</td>
                  <td className="py-3.5 px-4">{inc.fy}</td>
                  <td className="py-3.5 px-4 font-mono font-extrabold text-slate-900 dark:text-white">
                    ₹{Number(inc.amount || 0).toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-lime-600 dark:text-lime-400 font-bold">
                    ₹{Number(inc.tds || 0).toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={saving}
                      onClick={() => handleDelete(inc.id)}
                      aria-label="Remove income source"
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
