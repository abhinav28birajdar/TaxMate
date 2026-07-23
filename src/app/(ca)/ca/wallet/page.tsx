'use client';

import { useState } from 'react';
import { Wallet, ArrowDownRight, ArrowUpRight, Plus, CreditCard, Building2, CheckCircle2, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function CAWalletPage() {
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('50000');
  const [bankAccount, setBankAccount] = useState('hdfc_4091');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [transactions, setTransactions] = useState([
    { id: 'wt1', desc: 'Client Payment - TechNova Solutions', amount: '+₹35,400', date: '20 Oct 2026', type: 'credit' },
    { id: 'wt2', desc: 'Bank Payout to HDFC Current Acc', amount: '-₹50,000', date: '18 Oct 2026', type: 'debit' },
    { id: 'wt3', desc: 'Client Payment - Apex Logistics', amount: '+₹64,900', date: '15 Oct 2026', type: 'credit' },
  ]);

  const handleRequestPayout = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(payoutAmount);
    if (!amountNum || amountNum <= 0) {
      toast.error('Please enter a valid payout amount');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsPayoutModalOpen(false);

      const newTx = {
        id: `wt_${Date.now()}`,
        desc: `Bank Payout to ${bankAccount === 'hdfc_4091' ? 'HDFC Bank (****4091)' : 'ICICI Bank (****8821)'}`,
        amount: `-₹${amountNum.toLocaleString('en-IN')}`,
        date: 'Today',
        type: 'debit',
      };

      setTransactions([newTx, ...transactions]);
      toast.success(`Payout request of ₹${amountNum.toLocaleString('en-IN')} submitted successfully to your bank!`);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Wallet className="w-6 h-6 text-lime-600" /> CA Digital Wallet & Payouts
          </h1>
          <p className="text-xs text-slate-500 mt-1">Manage collected client payments, gateway settlements, and bank payouts.</p>
        </div>
        <Button
          onClick={() => setIsPayoutModalOpen(true)}
          className="bg-lime-600 hover:bg-lime-500 text-white font-semibold text-xs shadow-md shadow-lime-600/20"
        >
          <CreditCard className="w-4 h-4 mr-1.5" /> Request Payout to Bank
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 bg-gradient-to-r from-lime-900/40 via-slate-900 to-slate-900 text-white rounded-2xl border border-lime-500/30">
          <span className="text-xs font-semibold text-lime-400">Available Wallet Balance</span>
          <div className="text-3xl font-extrabold text-white mt-2">₹1,84,500</div>
          <span className="text-[10px] text-slate-400 mt-1 block">Ready for instant bank settlement</span>
        </div>
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span className="text-xs font-semibold text-slate-500">Pending Settlement (T+1)</span>
          <div className="text-3xl font-extrabold text-amber-500 mt-2">₹42,000</div>
          <span className="text-[10px] text-slate-400 mt-1 block">Razorpay / Stripe clearing</span>
        </div>
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span className="text-xs font-semibold text-slate-500">Total Lifetime Payouts</span>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">₹12,40,000</div>
          <span className="text-[10px] text-slate-400 mt-1 block">Settled to verified bank account</span>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 font-bold text-sm text-slate-900 dark:text-white">
          Wallet Transactions History
        </div>
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
                    {tx.type === 'credit' ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  </div>
                  <div>
                    <div>{tx.desc}</div>
                    <div className="text-[10px] text-slate-400">{tx.date}</div>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-right font-mono font-bold text-sm">
                  <span className={tx.type === 'credit' ? 'text-emerald-600' : 'text-slate-900 dark:text-white'}>
                    {tx.amount}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Payout Modal */}
      {isPayoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
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
                  Select Registered Bank Account *
                </label>
                <select
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime-600"
                >
                  <option value="hdfc_4091">HDFC Bank Current Account (A/C ****4091) - Primary</option>
                  <option value="icici_8821">ICICI Bank Current Account (A/C ****8821)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payout Amount (₹) *
                </label>
                <Input
                  type="number"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  className="text-xs font-mono font-bold text-slate-900 dark:text-white"
                  placeholder="Enter amount"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Available for payout: <strong className="text-lime-600 dark:text-lime-400">₹1,84,500</strong>
                </span>
              </div>

              <div className="p-3 bg-lime-600/10 border border-lime-600/20 rounded-xl text-xs text-lime-700 dark:text-lime-400 space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-lime-600" /> Instant IMPS Payout
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Funds will be transferred to your selected bank account instantly within 15 minutes. Zero transaction fees.
                </p>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPayoutModalOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  size="sm"
                  className="bg-lime-600 hover:bg-lime-500 text-white font-semibold text-xs shadow-md shadow-lime-600/20"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Processing Payout...
                    </>
                  ) : (
                    'Confirm Payout Request'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
