'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  CreditCard,
  Building2,
  X,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface WalletTx {
  id: string;
  desc: string;
  amount: number;
  date: string;
  type: 'credit' | 'debit';
  status?: string;
}

interface BankAccountOption {
  id: string;
  label: string;
  bank_name?: string | null;
  account_last4?: string | null;
}

export default function CAWalletPage() {
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [selectedBankId, setSelectedBankId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const [summary, setSummary] = useState({
    availableBalance: 0,
    pendingSettlement: 0,
    totalPayouts: 0,
  });
  const [bankAccounts, setBankAccounts] = useState<BankAccountOption[]>([]);
  const [transactions, setTransactions] = useState<WalletTx[]>([]);

  const loadWallet = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/payments/payouts', { credentials: 'include' });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to load wallet');
      }
      setSummary(json.summary || { availableBalance: 0, pendingSettlement: 0, totalPayouts: 0 });
      setBankAccounts(json.bankAccounts || []);
      setTransactions(json.transactions || []);
      if (json.bankAccounts?.length > 0 && !selectedBankId) {
        setSelectedBankId(json.bankAccounts[0].id);
      }
    } catch (err: any) {
      toast.error(err.message || 'Unable to load wallet ledger');
    } finally {
      setLoading(false);
    }
  }, [selectedBankId]);

  useEffect(() => {
    loadWallet();
  }, [loadWallet]);

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(payoutAmount);
    if (!amountNum || amountNum <= 0) {
      toast.error('Please enter a valid payout amount');
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedBank = bankAccounts.find((b) => b.id === selectedBankId);
      const res = await fetch('/api/payments/payouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          amount: amountNum,
          bankMethodId: selectedBankId || undefined,
          bankLabel: selectedBank?.label || 'Registered Practice Bank',
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Payout submission failed');
      }

      toast.success(
        `Payout request of ₹${amountNum.toLocaleString('en-IN')} submitted successfully.`
      );
      setPayoutAmount('');
      setIsPayoutModalOpen(false);
      await loadWallet();
    } catch (err: any) {
      toast.error(err.message || 'Could not submit payout');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Wallet className="w-6 h-6 text-lime-600" /> CA Digital Wallet & Payouts
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage collected client payments, gateway settlements, and bank payouts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadWallet} className="text-xs">
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Button
            onClick={() => setIsPayoutModalOpen(true)}
            className="bg-lime-600 hover:bg-lime-500 text-white font-semibold text-xs shadow-md shadow-lime-600/20"
          >
            <CreditCard className="w-4 h-4 mr-1.5" /> Request Payout to Bank
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 bg-gradient-to-r from-lime-900/40 via-slate-900 to-slate-900 text-white rounded-2xl border border-lime-500/30">
          <span className="text-xs font-semibold text-lime-400">Available Wallet Balance</span>
          <div className="text-3xl font-extrabold text-white mt-2">
            ₹{summary.availableBalance.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Ready for instant bank settlement
          </span>
        </div>
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span className="text-xs font-semibold text-slate-500">Pending Settlement (Processing)</span>
          <div className="text-3xl font-extrabold text-amber-500 mt-2">
            ₹{summary.pendingSettlement.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Awaiting gateway verification</span>
        </div>
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span className="text-xs font-semibold text-slate-500">Total Lifetime Payouts</span>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
            ₹{summary.totalPayouts.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Disbursed to bank account</span>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 font-bold text-sm text-slate-900 dark:text-white">
          Wallet Transactions History
        </div>
        {loading ? (
          <div className="p-10 text-center text-xs text-slate-400">Loading wallet ledger...</div>
        ) : transactions.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-400 italic">
            No settled payments or payout requests recorded yet.
          </div>
        ) : (
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        tx.type === 'credit'
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {tx.type === 'credit' ? (
                        <ArrowDownRight className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div>{tx.desc}</div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(tx.date).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-sm">
                    <span
                      className={
                        tx.type === 'credit'
                          ? 'text-emerald-600'
                          : 'text-slate-900 dark:text-white'
                      }
                    >
                      {tx.type === 'credit' ? '+' : '-'}₹
                      {Math.abs(tx.amount).toLocaleString('en-IN')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isPayoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Building2 className="w-5 h-5 text-lime-600" /> Bank Payout Request
              </h3>
              <button
                onClick={() => setIsPayoutModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRequestPayout} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Destination Account
                </label>
                <select
                  value={selectedBankId}
                  onChange={(e) => setSelectedBankId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime-600"
                >
                  {bankAccounts.length === 0 ? (
                    <option value="">Primary Practice Settlement Bank (Configured in Settings)</option>
                  ) : (
                    bankAccounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.label}
                        {acc.account_last4 ? ` (****${acc.account_last4})` : ''}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payout Amount (₹) *
                </label>
                <Input
                  type="number"
                  min="1"
                  required
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  className="text-xs font-mono font-bold text-slate-900 dark:text-white"
                  placeholder="Enter amount"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Available for payout:{' '}
                  <strong className="text-lime-600 dark:text-lime-400">
                    ₹{summary.availableBalance.toLocaleString('en-IN')}
                  </strong>
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsPayoutModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || summary.availableBalance <= 0}
                  className="bg-lime-600 hover:bg-lime-500 text-white text-xs font-semibold"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Payout Request'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
