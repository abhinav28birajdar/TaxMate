"use client";

import React, { useState } from "react";
import { 
  CreditCard, 
  IndianRupee, 
  TrendingUp, 
  ArrowUpRight, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  Receipt
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AdminPaymentManagementPage() {
  const transactions = [
    { id: "tx-1", ref: "PAY-2026-9012", from: "TechNova Solutions Pvt Ltd", to: "CA Rajesh Sharma, FCA", amount: "₹1,50,000", fee: "₹3,000", method: "Razorpay UPI", status: "Settled", date: "Today, 11:30 AM" },
    { id: "tx-2", ref: "PAY-2026-8910", from: "Ananya Deshmukh", to: "CA Rajesh Sharma, FCA", amount: "₹4,999", fee: "₹99", method: "HDFC Card", status: "Settled", date: "Yesterday" },
    { id: "tx-3", ref: "PAY-2026-8742", from: "Karan Malhotra", to: "TaxMate Escrow", amount: "₹1,999", fee: "₹0", method: "UPI", status: "Refunded", date: "22 Oct 2026" },
    { id: "tx-4", ref: "PAY-2026-8611", from: "Apex Logistics India", to: "CA Priya Mehta", amount: "₹12,000", fee: "₹240", method: "NetBanking", status: "Settled", date: "20 Oct 2026" }
  ];

  return (
    <div className="space-y-6 text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-emerald-400" /> Platform Billing & Escrow Gateway
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Track Gross Merchandise Value (GMV), Razorpay/Stripe webhooks, escrow settlements, and gateway commission fees.
          </p>
        </div>

        <Button
          onClick={() => toast.success("Downloaded platform financial ledger.")}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-[0_0_20px_rgba(5,150,105,0.4)]"
        >
          <Download className="w-3.5 h-3.5 mr-1.5" /> Download Monthly Ledger
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
        <div className="p-4 bg-[#111111] border border-white/10 rounded-2xl space-y-1">
          <span className="text-gray-400">Total Platform GMV</span>
          <div className="text-xl font-bold font-mono text-white">₹1.84 Cr</div>
          <span className="text-[10px] text-emerald-400 font-semibold">+18.5% YoY</span>
        </div>
        <div className="p-4 bg-[#111111] border border-white/10 rounded-2xl space-y-1">
          <span className="text-gray-400">Platform Commission (Net)</span>
          <div className="text-xl font-bold font-mono text-emerald-400">₹14.20 L</div>
          <span className="text-[10px] text-gray-500">2% Escrow Fee</span>
        </div>
        <div className="p-4 bg-[#111111] border border-white/10 rounded-2xl space-y-1">
          <span className="text-gray-400">Pending Escrow Release</span>
          <div className="text-xl font-bold font-mono text-amber-400">₹8.45 L</div>
          <span className="text-[10px] text-gray-500">Releases upon filing</span>
        </div>
        <div className="p-4 bg-[#111111] border border-white/10 rounded-2xl space-y-1">
          <span className="text-gray-400">Total Refunds Processed</span>
          <div className="text-xl font-bold font-mono text-rose-400">₹42,000</div>
          <span className="text-[10px] text-gray-500">Zero chargeback fines</span>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-[#111111] rounded-2xl border border-white/10 overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs text-gray-300">
          <thead className="bg-[#18181b] text-white font-semibold border-b border-white/10">
            <tr>
              <th className="py-3.5 px-4">Transaction Ref</th>
              <th className="py-3.5 px-4">Customer</th>
              <th className="py-3.5 px-4">Beneficiary CA</th>
              <th className="py-3.5 px-4">Amount</th>
              <th className="py-3.5 px-4">Platform Fee</th>
              <th className="py-3.5 px-4">Payment Method</th>
              <th className="py-3.5 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-[#18181b]/50 transition-colors">
                <td className="py-3.5 px-4 font-mono font-bold text-white">{tx.ref}</td>
                <td className="py-3.5 px-4 text-emerald-300">{tx.from}</td>
                <td className="py-3.5 px-4 text-gray-200">{tx.to}</td>
                <td className="py-3.5 px-4 font-mono font-extrabold text-white">{tx.amount}</td>
                <td className="py-3.5 px-4 font-mono text-emerald-400">{tx.fee}</td>
                <td className="py-3.5 px-4 text-gray-400">{tx.method}</td>
                <td className="py-3.5 px-4">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    tx.status === "Settled" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                  }`}>
                    {tx.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
