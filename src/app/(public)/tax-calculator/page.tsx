"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Calculator, 
  IndianRupee, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Info,
  TrendingDown,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PublicTaxCalculatorPage() {
  const [grossIncome, setGrossIncome] = useState<number>(1200000);
  const [deduction80C, setDeduction80C] = useState<number>(150000);
  const [deduction80D, setDeduction80D] = useState<number>(25000);
  const [hraExemption, setHraExemption] = useState<number>(50000);
  const [otherDeductions, setOtherDeductions] = useState<number>(50000); // Standard Deduction

  // Old Tax Regime Calculation
  const calculateOldRegime = () => {
    const totalDeductions = Math.min(deduction80C, 150000) + deduction80D + hraExemption + otherDeductions;
    const taxableIncome = Math.max(0, grossIncome - totalDeductions);

    let tax = 0;
    if (taxableIncome > 1000000) {
      tax += (taxableIncome - 1000000) * 0.3 + 112500;
    } else if (taxableIncome > 500000) {
      tax += (taxableIncome - 500000) * 0.2 + 12500;
    } else if (taxableIncome > 250000) {
      tax += (taxableIncome - 250000) * 0.05;
    }

    if (taxableIncome <= 500000) {
      tax = Math.max(0, tax - 12500);
    }

    const cess = tax * 0.04;
    return {
      taxableIncome,
      baseTax: tax,
      cess,
      totalTax: Math.round(tax + cess),
    };
  };

  // New Tax Regime Calculation (AY 2026-27 under Sec 115BAC)
  const calculateNewRegime = () => {
    const stdDeduction = 75000;
    const taxableIncome = Math.max(0, grossIncome - stdDeduction);

    let tax = 0;
    if (taxableIncome > 1500000) {
      tax += (taxableIncome - 1500000) * 0.3 + 150000;
    } else if (taxableIncome > 1200000) {
      tax += (taxableIncome - 1200000) * 0.2 + 90000;
    } else if (taxableIncome > 900000) {
      tax += (taxableIncome - 900000) * 0.15 + 45000;
    } else if (taxableIncome > 600000) {
      tax += (taxableIncome - 600000) * 0.10 + 15000;
    } else if (taxableIncome > 300000) {
      tax += (taxableIncome - 300000) * 0.05;
    }

    if (taxableIncome <= 700000) {
      tax = 0;
    }

    const cess = tax * 0.04;
    return {
      taxableIncome,
      baseTax: tax,
      cess,
      totalTax: Math.round(tax + cess),
    };
  };

  const oldRes = calculateOldRegime();
  const newRes = calculateNewRegime();
  const savings = oldRes.totalTax - newRes.totalTax;
  const isNewBetter = savings > 0;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-20" />
      <div className="absolute top-0 right-1/4 w-[500px] h-[350px] bg-emerald-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto space-y-12 relative z-10">
        
        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-400">
            <Calculator className="w-3.5 h-3.5 mr-1.5" /> Budget 2026 Slab Updates Active
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
            Income Tax Calculator.
          </h1>
          <p className="text-base text-gray-400 font-light">
            Compare Old vs New Tax Regime (Section 115BAC) with exact deduction simulations for Assessment Year 2026-27.
          </p>
        </div>

        {/* Calculator Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Panel */}
          <div className="bg-[#111111] border border-white/10 rounded-3xl p-6 sm:p-7 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-emerald-400" /> Income & Deductions
            </h3>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="text-gray-300 font-medium block mb-1">Gross Annual Income (₹)</label>
                <input
                  type="number"
                  value={grossIncome}
                  onChange={(e) => setGrossIncome(Number(e.target.value))}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-gray-300 font-medium block mb-1">Section 80C (PPF, ELSS, EPF - Max ₹1.5L)</label>
                <input
                  type="number"
                  value={deduction80C}
                  onChange={(e) => setDeduction80C(Number(e.target.value))}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-gray-300 font-medium block mb-1">Section 80D (Health Insurance) (₹)</label>
                <input
                  type="number"
                  value={deduction80D}
                  onChange={(e) => setDeduction80D(Number(e.target.value))}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-gray-300 font-medium block mb-1">HRA Exemption (₹)</label>
                <input
                  type="number"
                  value={hraExemption}
                  onChange={(e) => setHraExemption(Number(e.target.value))}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-gray-300 font-medium block mb-1">Standard Deduction (Old Regime) (₹)</label>
                <input
                  type="number"
                  value={otherDeductions}
                  onChange={(e) => setOtherDeductions(Number(e.target.value))}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recommendation Banner */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-[#111111] to-[#111111] border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl">
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">
                    {isNewBetter ? "New Tax Regime is Recommended!" : "Old Tax Regime is Recommended!"}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    You save <strong className="text-emerald-400">₹{Math.abs(savings).toLocaleString("en-IN")}</strong> by opting for the {isNewBetter ? "New" : "Old"} Tax Regime.
                  </p>
                </div>
              </div>

              <span className="px-4 py-1.5 rounded-full bg-emerald-500 text-black font-extrabold text-xs shrink-0">
                Save ₹{Math.abs(savings).toLocaleString("en-IN")}
              </span>
            </div>

            {/* Side-by-side Regime Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Old Regime */}
              <div className={`p-6 rounded-3xl bg-[#111111] border transition-all ${
                !isNewBetter ? "border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/30" : "border-white/10"
              }`}>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold text-base text-white">Old Tax Regime</h4>
                  {!isNewBetter && (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                      Lowest Tax
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mb-4">With Section 80C, 80D & HRA deductions</p>
                
                <div className="space-y-2.5 text-xs text-gray-300">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Gross Income:</span>
                    <span className="font-mono">₹{grossIncome.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Deductions:</span>
                    <span className="font-mono text-emerald-400">- ₹{(grossIncome - oldRes.taxableIncome).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Taxable Income:</span>
                    <span className="font-mono">₹{oldRes.taxableIncome.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Cess (4%):</span>
                    <span className="font-mono">₹{oldRes.cess.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="border-t border-white/10 pt-3 flex justify-between font-bold text-base text-white">
                    <span>Tax Payable:</span>
                    <span>₹{oldRes.totalTax.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              {/* New Regime */}
              <div className={`p-6 rounded-3xl bg-[#111111] border transition-all ${
                isNewBetter ? "border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/30" : "border-white/10"
              }`}>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold text-base text-white">New Tax Regime</h4>
                  {isNewBetter && (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                      Lowest Tax
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mb-4">Sec 115BAC (₹75k Standard Deduction)</p>
                
                <div className="space-y-2.5 text-xs text-gray-300">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Gross Income:</span>
                    <span className="font-mono">₹{grossIncome.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Standard Deduction:</span>
                    <span className="font-mono text-emerald-400">- ₹75,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Taxable Income:</span>
                    <span className="font-mono">₹{newRes.taxableIncome.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Cess (4%):</span>
                    <span className="font-mono">₹{newRes.cess.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="border-t border-white/10 pt-3 flex justify-between font-bold text-base text-emerald-400">
                    <span>Tax Payable:</span>
                    <span>₹{newRes.totalTax.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Filing CTA */}
            <div className="flex justify-end pt-2">
              <Link href="/register">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-3 px-6 rounded-xl shadow-[0_0_20px_rgba(5,150,105,0.4)]">
                  File ITR with this Recommendation <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
