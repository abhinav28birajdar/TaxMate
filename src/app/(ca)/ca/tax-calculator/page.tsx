'use client';

import React, { useState } from 'react';
import { 
  Calculator, 
  IndianRupee, 
  HelpCircle, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight,
  TrendingDown
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function TaxCalculatorPage() {
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

    // Rebate 87A for income up to 5L in Old Regime
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

    // Rebate 87A for income up to 7L in New Regime
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
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-slate-100 flex items-center gap-2">
          Income Tax Calculator (AY 2026-27)
          <Badge className="bg-lime-500/20 text-lime-400 border-lime-500/30">Sec 115BAC Updated</Badge>
        </h1>
        <p className="text-slate-400 text-sm mt-1">Compare tax liability between Old vs New Tax Regime with instant deduction analysis.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Parameters */}
        <Card className="lg:col-span-1 bg-slate-900/50 border-slate-800 space-y-4">
          <CardHeader>
            <CardTitle className="text-slate-100 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-lime-400" /> Income & Deductions
            </CardTitle>
            <CardDescription className="text-slate-400">Enter annual financial figures</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Gross Annual Income (₹)</label>
              <Input
                type="number"
                value={grossIncome}
                onChange={(e) => setGrossIncome(Number(e.target.value))}
                className="bg-slate-950 border-slate-800 text-slate-200"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Section 80C (PPF, ELSS, EPF) (Max ₹1.5L)</label>
              <Input
                type="number"
                value={deduction80C}
                onChange={(e) => setDeduction80C(Number(e.target.value))}
                className="bg-slate-950 border-slate-800 text-slate-200"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Section 80D (Health Insurance) (₹)</label>
              <Input
                type="number"
                value={deduction80D}
                onChange={(e) => setDeduction80D(Number(e.target.value))}
                className="bg-slate-950 border-slate-800 text-slate-200"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">HRA Exemption (₹)</label>
              <Input
                type="number"
                value={hraExemption}
                onChange={(e) => setHraExemption(Number(e.target.value))}
                className="bg-slate-950 border-slate-800 text-slate-200"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Standard Deduction (Old Regime) (₹)</label>
              <Input
                type="number"
                value={otherDeductions}
                onChange={(e) => setOtherDeductions(Number(e.target.value))}
                className="bg-slate-950 border-slate-800 text-slate-200"
              />
            </div>
          </CardContent>
        </Card>

        {/* Results Comparison Grid */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recommendation Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-lime-950/40 via-slate-900 to-slate-900 border border-lime-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-lime-500/20 text-lime-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100 text-lg">
                  {isNewBetter ? 'New Tax Regime is Recommended!' : 'Old Tax Regime is Recommended!'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  You save <strong className="text-lime-400">₹{Math.abs(savings).toLocaleString('en-IN')}</strong> under the {isNewBetter ? 'New' : 'Old'} Regime.
                </p>
              </div>
            </div>
            <Badge className="bg-lime-600 text-slate-950 font-bold px-3 py-1 text-sm">
              Save ₹{Math.abs(savings).toLocaleString('en-IN')}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Old Regime Card */}
            <Card className={`bg-slate-900/50 border-slate-800 ${!isNewBetter ? 'ring-2 ring-lime-500' : ''}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-slate-100">Old Tax Regime</CardTitle>
                  {!isNewBetter && <Badge className="bg-lime-500/20 text-lime-400 border-lime-500/30">Lowest Tax</Badge>}
                </div>
                <CardDescription className="text-slate-400">With Chapter VI-A Deductions & HRA</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Gross Income:</span>
                  <span className="text-slate-200 font-medium">₹{grossIncome.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Total Deductions:</span>
                  <span className="text-slate-200 font-medium">- ₹{(grossIncome - oldRes.taxableIncome).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Taxable Income:</span>
                  <span className="text-slate-200 font-medium">₹{oldRes.taxableIncome.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Base Tax + Cess (4%):</span>
                  <span className="text-slate-200 font-medium">₹{oldRes.cess.toLocaleString('en-IN')}</span>
                </div>
                <div className="border-t border-slate-800 pt-3 flex justify-between text-base font-bold">
                  <span className="text-slate-200">Total Tax Payable:</span>
                  <span className="text-slate-100">₹{oldRes.totalTax.toLocaleString('en-IN')}</span>
                </div>
              </CardContent>
            </Card>

            {/* New Regime Card */}
            <Card className={`bg-slate-900/50 border-slate-800 ${isNewBetter ? 'ring-2 ring-lime-500' : ''}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-slate-100">New Tax Regime</CardTitle>
                  {isNewBetter && <Badge className="bg-lime-500/20 text-lime-400 border-lime-500/30">Lowest Tax</Badge>}
                </div>
                <CardDescription className="text-slate-400">Default Regime (₹75k Std Deduction)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Gross Income:</span>
                  <span className="text-slate-200 font-medium">₹{grossIncome.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Standard Deduction:</span>
                  <span className="text-slate-200 font-medium">- ₹75,000</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Taxable Income:</span>
                  <span className="text-slate-200 font-medium">₹{newRes.taxableIncome.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Base Tax + Cess (4%):</span>
                  <span className="text-slate-200 font-medium">₹{newRes.cess.toLocaleString('en-IN')}</span>
                </div>
                <div className="border-t border-slate-800 pt-3 flex justify-between text-base font-bold">
                  <span className="text-slate-200">Total Tax Payable:</span>
                  <span className="text-lime-400">₹{newRes.totalTax.toLocaleString('en-IN')}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
