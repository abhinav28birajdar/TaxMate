"use client";

import React, { useState } from "react";
import { 
  FileSpreadsheet, 
  ShieldCheck, 
  Download, 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Building, 
  Briefcase, 
  Home, 
  TrendingUp, 
  CreditCard, 
  FileText, 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  Layers,
  Calculator,
  IndianRupee,
  RefreshCw,
  Globe,
  Award,
  Receipt,
  FileCheck,
  Send,
  Eye,
  Key,
  QrCode,
  Printer,
  ChevronDown,
  X,
  History,
  FileDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function UnifiedTaxReturnManager() {
  const [activeView, setActiveView] = useState<"dashboard" | "create-wizard" | "return-details" | "review-approval" | "filing-receipt" | "history">("dashboard");
  const [selectedReturnId, setSelectedReturnId] = useState<string>("itr-2026-01");
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [showApprovalModal, setShowApprovalModal] = useState<boolean>(false);
  const [otpCode, setOtpCode] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionComplete, setSubmissionComplete] = useState<boolean>(false);
  const [filingReceiptData, setFilingReceiptData] = useState<any>(null);

  // Income details state
  const [salaryIncome, setSalaryIncome] = useState<number>(1850000);
  const [businessIncome, setBusinessIncome] = useState<number>(0);
  const [freelanceIncome, setFreelanceIncome] = useState<number>(240000);
  const [rentalIncome, setRentalIncome] = useState<number>(180000);
  const [capitalGainsLTCG, setCapitalGainsLTCG] = useState<number>(165000);
  const [capitalGainsSTCG, setCapitalGainsSTCG] = useState<number>(45000);
  const [interestIncome, setInterestIncome] = useState<number>(35000); // Bank & FD Interest
  const [dividendIncome, setDividendIncome] = useState<number>(18000); // Stock Dividends
  const [otherIncome, setOtherIncome] = useState<number>(25000); // Lottery, Gifts, Crypto
  const [foreignIncome, setForeignIncome] = useState<number>(60000); // Foreign Salary/Dividends (Schedule FSI)
  const [exemptIncome, setExemptIncome] = useState<number>(40000); // Agricultural & PPF exempt Sec 10

  // Expenses state
  const [municipalTaxes, setMunicipalTaxes] = useState<number>(15000);
  const [freelanceExpenses, setFreelanceExpenses] = useState<number>(50000);

  // Deductions & Investments state
  const [elssAmount, setElssAmount] = useState<number>(50000);
  const [ppfAmount, setPpfAmount] = useState<number>(70000);
  const [epfAmount, setEpfAmount] = useState<number>(30000);
  const [taxSaverFdAmount, setTaxSaverFdAmount] = useState<number>(0);
  
  const total80CInvestments = elssAmount + ppfAmount + epfAmount + taxSaverFdAmount;
  const deduction80C = Math.min(150000, total80CInvestments);

  const [deduction80D, setDeduction80D] = useState<number>(35000); // Health insurance
  const [deduction80CCD1B, setDeduction80CCD1B] = useState<number>(50000); // NPS additional
  const [deduction80E, setDeduction80E] = useState<number>(0); // Education loan interest
  const [deduction80G, setDeduction80G] = useState<number>(10000); // Donations
  const [deduction80TTA, setDeduction80TTA] = useState<number>(10000); // Savings interest
  const [housingLoanInterest, setHousingLoanInterest] = useState<number>(120000); // Sec 24b

  // Regime Selection
  const [selectedRegime, setSelectedRegime] = useState<"new" | "old">("new");
  const [tdsPaid, setTdsPaid] = useState<number>(295000);
  const [tcsPaid, setTcsPaid] = useState<number>(5000);
  const [advanceTaxPaid, setAdvanceTaxPaid] = useState<number>(15000);

  const totalPrepaidTaxes = tdsPaid + tcsPaid + advanceTaxPaid;

  // Gross Total Income (Foreign included, Exempt not added to taxable)
  const netRental = Math.max(0, rentalIncome - municipalTaxes);
  const standardRentalDeduction = netRental * 0.3; // 30% under Sec 24a
  const taxableRental = Math.max(0, netRental - standardRentalDeduction);

  const grossIncome = salaryIncome + businessIncome + Math.max(0, freelanceIncome - freelanceExpenses) + taxableRental + capitalGainsLTCG + capitalGainsSTCG + interestIncome + dividendIncome + otherIncome + foreignIncome;
  
  // Old Regime Net Taxable
  const standardDeductionOld = 50000;
  const totalDeductionsOld = deduction80C + deduction80D + deduction80CCD1B + deduction80E + deduction80G + deduction80TTA + Math.min(200000, housingLoanInterest) + standardDeductionOld;
  const netTaxableIncomeOld = Math.max(0, grossIncome - totalDeductionsOld);
  
  // Tax Calculation Old Regime
  const calcTaxOld = (taxable: number) => {
    if (taxable <= 250000) return 0;
    if (taxable <= 500000) return (taxable - 250000) * 0.05;
    if (taxable <= 1000000) return 12500 + (taxable - 500000) * 0.2;
    return 112500 + (taxable - 1000000) * 0.3;
  };
  let baseTaxOld = calcTaxOld(netTaxableIncomeOld);
  // Sec 87A rebate for Old Regime: if taxable <= 5,00,000, max ₹12,500 rebate
  if (netTaxableIncomeOld <= 500000) {
    baseTaxOld = 0;
  }
  const taxLiabilityOld = Math.round(baseTaxOld * 1.04); // + 4% cess

  // New Regime Net Taxable (Section 115BAC FY 2025-26 / AY 2026-27)
  const standardDeductionNew = 75000;
  const netTaxableIncomeNew = Math.max(0, grossIncome - standardDeductionNew);
  
  const calcTaxNew = (taxable: number) => {
    if (taxable <= 300000) return 0;
    if (taxable <= 700000) return (taxable - 300000) * 0.05;
    if (taxable <= 1000000) return 20000 + (taxable - 700000) * 0.1;
    if (taxable <= 1200000) return 50000 + (taxable - 1000000) * 0.15;
    if (taxable <= 1500000) return 80000 + (taxable - 1200000) * 0.2;
    return 140000 + (taxable - 1500000) * 0.3;
  };
  let baseTaxNew = calcTaxNew(netTaxableIncomeNew);
  // Sec 87A rebate for New Regime: if taxable <= 7,00,000, full rebate
  if (netTaxableIncomeNew <= 700000) {
    baseTaxNew = 0;
  }
  const taxLiabilityNew = Math.round(baseTaxNew * 1.04);

  const finalTaxLiability = selectedRegime === "new" ? taxLiabilityNew : taxLiabilityOld;
  const netBalance = totalPrepaidTaxes - finalTaxLiability;
  const isRefund = netBalance > 0;
  const refundAmount = isRefund ? netBalance : 0;
  const payableAmount = isRefund ? 0 : Math.abs(netBalance);

  // Break-even deduction calculation
  const breakEvenDeduction = 425000;

  const returnsList = [
    {
      id: "itr-2026-01",
      ay: "AY 2026-27 (FY 2025-26)",
      form: "ITR-2 (Capital Gains & Foreign Assets)",
      status: "Client Approval Pending",
      caName: "CA Rajesh Sharma, FCA",
      ackNo: "Pending Digital Signature",
      filedDate: "Draft Prepared Today",
      grossIncome: `₹${grossIncome.toLocaleString("en-IN")}`,
      taxLiability: `₹${finalTaxLiability.toLocaleString("en-IN")}`,
      tds: `₹${totalPrepaidTaxes.toLocaleString("en-IN")}`,
      refund: isRefund ? `₹${refundAmount.toLocaleString("en-IN")}` : "₹0",
      regime: selectedRegime === "new" ? "New Regime (Sec 115BAC)" : "Old Tax Regime",
      eVerified: false
    },
    {
      id: "itr-2025-01",
      ay: "AY 2025-26 (FY 2024-25)",
      form: "ITR-1 (Sahaj)",
      status: "Filed & Processed",
      caName: "CA Rajesh Sharma, FCA",
      ackNo: "ACK-982104928172",
      filedDate: "24 Jul 2025",
      grossIncome: "₹18,40,000",
      taxLiability: "₹1,85,000",
      tds: "₹1,98,000",
      refund: "₹13,000",
      regime: "Old Regime",
      eVerified: true
    },
    {
      id: "itr-2024-01",
      ay: "AY 2024-25 (FY 2023-24)",
      form: "ITR-1 (Sahaj)",
      status: "Filed & Processed",
      caName: "Sharma & Associates",
      ackNo: "ACK-871920391823",
      filedDate: "19 Jul 2024",
      grossIncome: "₹15,20,000",
      taxLiability: "₹1,42,000",
      tds: "₹1,50,000",
      refund: "₹8,000",
      regime: "Old Regime",
      eVerified: true
    },
    {
      id: "itr-2023-01",
      ay: "AY 2023-24 (FY 2022-23)",
      form: "ITR-1 (Sahaj)",
      status: "Filed & Processed",
      caName: "Sharma & Associates",
      ackNo: "ACK-761829019281",
      filedDate: "28 Jul 2023",
      grossIncome: "₹12,80,000",
      taxLiability: "₹1,18,000",
      tds: "₹1,24,000",
      refund: "₹6,000",
      regime: "Old Regime",
      eVerified: true
    }
  ];

  const handleSimulateEFileSubmission = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setShowApprovalModal(false);
      setSubmissionComplete(true);
      const generatedAck = `ACK-${Date.now().toString().slice(-10)}`;
      setFilingReceiptData({
        ackNo: generatedAck,
        ay: "AY 2026-27 (FY 2025-26)",
        form: "ITR-2",
        pan: "ABCDE1234F",
        taxpayer: "Abhinav Birajdar",
        timestamp: new Date().toLocaleString("en-IN"),
        grossIncome: grossIncome,
        taxLiability: finalTaxLiability,
        prepaidTaxes: totalPrepaidTaxes,
        refundDue: isRefund ? refundAmount : 0,
        taxPayable: !isRefund ? payableAmount : 0,
        regime: selectedRegime === "new" ? "New Regime Sec 115BAC" : "Old Regime",
        eVerificationMethod: "Aadhaar OTP (Verified)"
      });
      setActiveView("filing-receipt");
      toast.success("ITR-2 successfully e-filed & verified with CBDT CPC Bengaluru!");
    }, 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-white">
      {/* View Switcher Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-emerald-400" /> Income Tax Returns & Computation Engine
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Complete ITR filing lifecycle: Salary, Business, Rental, Capital Gains, Other & Foreign Income, Regime Comparison, Review & Approval.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {activeView !== "dashboard" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveView("dashboard")}
              className="text-xs border-white/10 text-gray-300 hover:text-white"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Returns Dashboard
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveView("history")}
            className={`text-xs border-white/10 ${activeView === "history" ? "bg-white/10 text-white" : "text-gray-300 hover:text-white"}`}
          >
            <History className="w-3.5 h-3.5 mr-1.5 text-emerald-400" /> Previous Year Returns
          </Button>

          <Button
            onClick={() => { setActiveView("create-wizard"); setWizardStep(1); }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-[0_0_20px_rgba(5,150,105,0.4)]"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Create New Tax Return (AY 2026-27)
          </Button>
        </div>
      </div>

      {/* DASHBOARD VIEW */}
      {activeView === "dashboard" && (
        <div className="space-y-6">
          {/* Active Workflow Progress Indicator */}
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" /> Active Filing Timeline (AY 2026-27 • ITR-2)
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  CA Draft Ready
                </span>
                <Button
                  size="sm"
                  onClick={() => setActiveView("review-approval")}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-7 px-3 rounded-lg"
                >
                  <FileCheck className="w-3.5 h-3.5 mr-1" /> Review & Approve
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-2">
              {[
                { title: "1. Add Income Sources", desc: "Salary, Capital Gains & Foreign", done: true },
                { title: "2. Document Audit", desc: "Form 16 & 26AS Reconciled", done: true },
                { title: "3. Tax Computation", desc: "Old vs New Sec 115BAC", done: true },
                { title: "4. Customer Approval", desc: "Aadhaar OTP e-Verify", active: true },
                { title: "5. E-Filing & ITR-V", desc: "Official Submission", done: false },
              ].map((step, i) => (
                <div
                  key={i}
                  className={`p-3.5 rounded-xl border text-xs space-y-1 transition-all ${
                    step.active
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)] font-bold"
                      : step.done
                      ? "bg-[#18181b] border-white/10 text-gray-200"
                      : "bg-[#141414] border-white/5 text-gray-500 opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{step.title}</span>
                    {step.done && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>
                  <p className="text-[11px] text-gray-400">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-[#111111] border border-white/10 space-y-1">
              <span className="text-xs text-gray-400">Total Gross Income (AY 2026-27)</span>
              <div className="text-xl font-bold font-mono text-white">₹{grossIncome.toLocaleString("en-IN")}</div>
              <span className="text-[10px] text-emerald-400 font-semibold">Across all 5 income heads</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#111111] border border-white/10 space-y-1">
              <span className="text-xs text-gray-400">Tax Liability ({selectedRegime.toUpperCase()})</span>
              <div className="text-xl font-bold font-mono text-white">₹{finalTaxLiability.toLocaleString("en-IN")}</div>
              <span className="text-[10px] text-gray-400">Includes 4% Health & Ed Cess</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#111111] border border-white/10 space-y-1">
              <span className="text-xs text-gray-400">TDS / Advance Taxes Credited</span>
              <div className="text-xl font-bold font-mono text-emerald-400">₹{totalPrepaidTaxes.toLocaleString("en-IN")}</div>
              <span className="text-[10px] text-gray-400">Reconciled with Form 26AS</span>
            </div>
            <div className={`p-4 rounded-2xl border space-y-1 ${isRefund ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300" : "bg-amber-950/20 border-amber-500/30 text-amber-300"}`}>
              <span className="text-xs font-semibold">{isRefund ? "Estimated Refund Due" : "Tax Payable (Challan 280)"}</span>
              <div className="text-xl font-extrabold font-mono">₹{(isRefund ? refundAmount : payableAmount).toLocaleString("en-IN")}</div>
              <span className="text-[10px] opacity-80">{isRefund ? "Direct bank transfer" : "Self-assessment tax due"}</span>
            </div>
          </div>

          {/* Tax Returns List Table */}
          <div className="bg-[#111111] rounded-2xl border border-white/10 overflow-hidden shadow-xl">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-white">Filed Returns & Tax Return History</h3>
                <p className="text-xs text-gray-400 mt-0.5">Historical and active income tax filings with official acknowledgement records.</p>
              </div>
              <span className="text-xs text-gray-400 font-mono">{returnsList.length} Assessment Years Recorded</span>
            </div>

            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-[#18181b] text-white font-semibold border-b border-white/10">
                <tr>
                  <th className="py-3.5 px-4">Assessment Year</th>
                  <th className="py-3.5 px-4">ITR Form</th>
                  <th className="py-3.5 px-4">Gross Income</th>
                  <th className="py-3.5 px-4">Tax Liability</th>
                  <th className="py-3.5 px-4">Pre-Paid Taxes</th>
                  <th className="py-3.5 px-4">Refund / Payable</th>
                  <th className="py-3.5 px-4">Filing Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {returnsList.map((r) => (
                  <tr key={r.id} className="hover:bg-[#18181b]/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white">
                      <div>{r.ay}</div>
                      <div className="text-[10px] text-gray-400 font-normal">{r.regime}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-emerald-400">{r.form}</td>
                    <td className="py-3.5 px-4 font-mono font-bold">{r.grossIncome}</td>
                    <td className="py-3.5 px-4 font-mono">{r.taxLiability}</td>
                    <td className="py-3.5 px-4 font-mono text-emerald-400 font-bold">{r.tds}</td>
                    <td className="py-3.5 px-4 font-mono font-extrabold text-emerald-400">{r.refund}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        r.status.includes("Filed")
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => { setSelectedReturnId(r.id); setActiveView("return-details"); }}
                        className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 text-xs"
                      >
                        View Details
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toast.success(`Downloading official ITR-V Ack for ${r.ay}`)}
                        className="text-gray-300 hover:text-white"
                        title="Download Tax Return (ITR-V)"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE TAX RETURN WIZARD */}
      {activeView === "create-wizard" && (
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
          {/* Stepper Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <span className="text-[11px] font-mono text-emerald-400 uppercase font-bold">Step {wizardStep} of 4</span>
              <h2 className="text-xl font-bold text-white">
                {wizardStep === 1 && "Income Details, Foreign Income & Exemptions"}
                {wizardStep === 2 && "Deduction Details, Investments & Expenses"}
                {wizardStep === 3 && "Tax Regime Selection (Old vs New Sec 115BAC)"}
                {wizardStep === 4 && "Tax Calculation, Liability Breakdown & Approval"}
              </h2>
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              {[
                { s: 1, label: "Income" },
                { s: 2, label: "Deductions" },
                { s: 3, label: "Regime" },
                { s: 4, label: "Summary" }
              ].map((item) => (
                <button
                  key={item.s}
                  onClick={() => setWizardStep(item.s)}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold cursor-pointer transition-all ${
                    wizardStep === item.s
                      ? "bg-emerald-600 text-white shadow-[0_0_15px_rgba(5,150,105,0.4)]"
                      : wizardStep > item.s
                      ? "bg-emerald-950/40 text-emerald-400 border border-emerald-500/30"
                      : "bg-[#18181b] text-gray-400 border border-white/5"
                  }`}
                >
                  <span>{item.s}.</span>
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* STEP 1: Income Details */}
          {wizardStep === 1 && (
            <div className="space-y-6">
              <p className="text-xs text-gray-400">
                Input all gross income components earned between 1st April 2025 and 31st March 2026 across all five heads of income, foreign assets, and exempt sources.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Salary Income */}
                <div className="p-4 rounded-xl bg-[#18181b] border border-white/5 space-y-2">
                  <label className="text-xs font-semibold text-gray-200 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-emerald-400" /> Salary Income (Form 16)
                  </label>
                  <input
                    type="number"
                    value={salaryIncome}
                    onChange={(e) => setSalaryIncome(Number(e.target.value))}
                    className="w-full bg-[#111111] border border-white/10 rounded-lg p-2.5 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                  <p className="text-[10px] text-gray-400">Gross salary, HRA, LTA & special allowances</p>
                </div>

                {/* Business Income */}
                <div className="p-4 rounded-xl bg-[#18181b] border border-white/5 space-y-2">
                  <label className="text-xs font-semibold text-gray-200 flex items-center gap-2">
                    <Building className="w-4 h-4 text-emerald-400" /> Business Income (Sec 44AD / P&L)
                  </label>
                  <input
                    type="number"
                    value={businessIncome}
                    onChange={(e) => setBusinessIncome(Number(e.target.value))}
                    className="w-full bg-[#111111] border border-white/10 rounded-lg p-2.5 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                  <p className="text-[10px] text-gray-400">Presumptive taxation or audited net profits</p>
                </div>

                {/* Freelance Income */}
                <div className="p-4 rounded-xl bg-[#18181b] border border-white/5 space-y-2">
                  <label className="text-xs font-semibold text-gray-200 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-emerald-400" /> Freelance / Professional Fees (Sec 44ADA)
                  </label>
                  <input
                    type="number"
                    value={freelanceIncome}
                    onChange={(e) => setFreelanceIncome(Number(e.target.value))}
                    className="w-full bg-[#111111] border border-white/10 rounded-lg p-2.5 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                  <p className="text-[10px] text-gray-400">Technical consulting, design or software income</p>
                </div>

                {/* Rental Income */}
                <div className="p-4 rounded-xl bg-[#18181b] border border-white/5 space-y-2">
                  <label className="text-xs font-semibold text-gray-200 flex items-center gap-2">
                    <Home className="w-4 h-4 text-emerald-400" /> Rental Income (House Property)
                  </label>
                  <input
                    type="number"
                    value={rentalIncome}
                    onChange={(e) => setRentalIncome(Number(e.target.value))}
                    className="w-full bg-[#111111] border border-white/10 rounded-lg p-2.5 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                  <p className="text-[10px] text-gray-400">Gross annual rent received from tenant</p>
                </div>

                {/* Capital Gains LTCG */}
                <div className="p-4 rounded-xl bg-[#18181b] border border-white/5 space-y-2">
                  <label className="text-xs font-semibold text-gray-200 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" /> Long-Term Capital Gains (LTCG 112A)
                  </label>
                  <input
                    type="number"
                    value={capitalGainsLTCG}
                    onChange={(e) => setCapitalGainsLTCG(Number(e.target.value))}
                    className="w-full bg-[#111111] border border-white/10 rounded-lg p-2.5 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                  <p className="text-[10px] text-gray-400">Listed equity & equity mutual funds (exceeding ₹1.25L)</p>
                </div>

                {/* Capital Gains STCG */}
                <div className="p-4 rounded-xl bg-[#18181b] border border-white/5 space-y-2">
                  <label className="text-xs font-semibold text-gray-200 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" /> Short-Term Capital Gains (STCG 111A)
                  </label>
                  <input
                    type="number"
                    value={capitalGainsSTCG}
                    onChange={(e) => setCapitalGainsSTCG(Number(e.target.value))}
                    className="w-full bg-[#111111] border border-white/10 rounded-lg p-2.5 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                  <p className="text-[10px] text-gray-400">20% flat tax on equity held &lt; 12 months</p>
                </div>

                {/* Interest Income */}
                <div className="p-4 rounded-xl bg-[#18181b] border border-white/5 space-y-2">
                  <label className="text-xs font-semibold text-gray-200 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-emerald-400" /> Interest Income (Savings & FDs)
                  </label>
                  <input
                    type="number"
                    value={interestIncome}
                    onChange={(e) => setInterestIncome(Number(e.target.value))}
                    className="w-full bg-[#111111] border border-white/10 rounded-lg p-2.5 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                  <p className="text-[10px] text-gray-400">Auto-fetched from AIS/TIS bank reports</p>
                </div>

                {/* Dividend Income */}
                <div className="p-4 rounded-xl bg-[#18181b] border border-white/5 space-y-2">
                  <label className="text-xs font-semibold text-gray-200 flex items-center gap-2">
                    <IndianRupee className="w-4 h-4 text-emerald-400" /> Dividend Income
                  </label>
                  <input
                    type="number"
                    value={dividendIncome}
                    onChange={(e) => setDividendIncome(Number(e.target.value))}
                    className="w-full bg-[#111111] border border-white/10 rounded-lg p-2.5 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                  <p className="text-[10px] text-gray-400">Taxable dividends from domestic & foreign equities</p>
                </div>

                {/* Other Income */}
                <div className="p-4 rounded-xl bg-[#18181b] border border-white/5 space-y-2">
                  <label className="text-xs font-semibold text-gray-200 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" /> Other Income (Gifts, Crypto & Lottery)
                  </label>
                  <input
                    type="number"
                    value={otherIncome}
                    onChange={(e) => setOtherIncome(Number(e.target.value))}
                    className="w-full bg-[#111111] border border-white/10 rounded-lg p-2.5 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                  <p className="text-[10px] text-gray-400">Virtual Digital Assets (Sec 115BBH) & unapproved gifts</p>
                </div>

                {/* Foreign Income (Schedule FSI/FA) */}
                <div className="p-4 rounded-xl bg-[#18181b] border border-white/5 space-y-2">
                  <label className="text-xs font-semibold text-gray-200 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-emerald-400" /> Foreign Income (Schedule FSI / FA)
                  </label>
                  <input
                    type="number"
                    value={foreignIncome}
                    onChange={(e) => setForeignIncome(Number(e.target.value))}
                    className="w-full bg-[#111111] border border-white/10 rounded-lg p-2.5 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                  <p className="text-[10px] text-gray-400">US Stock RSUs, foreign dividends, Double Tax Relief (Sec 90)</p>
                </div>

                {/* Exempt Income (Section 10) */}
                <div className="p-4 rounded-xl bg-[#18181b] border border-white/5 space-y-2">
                  <label className="text-xs font-semibold text-gray-200 flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-400" /> Exempt Income (Section 10)
                  </label>
                  <input
                    type="number"
                    value={exemptIncome}
                    onChange={(e) => setExemptIncome(Number(e.target.value))}
                    className="w-full bg-[#111111] border border-white/10 rounded-lg p-2.5 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                  <p className="text-[10px] text-gray-400">Agricultural income, PPF interest & life insurance maturity (Not taxed)</p>
                </div>

                {/* Gross Total Income Card */}
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase">Gross Total Income</span>
                    <div className="text-2xl font-extrabold font-mono text-white mt-1">
                      ₹{grossIncome.toLocaleString("en-IN")}
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400">Auto-aggregated for ITR computation engine.</p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Deduction Details, Investments & Expenses */}
          {wizardStep === 2 && (
            <div className="space-y-6">
              <p className="text-xs text-gray-400">
                Configure your eligible deductions under Chapter VI-A and property/freelance expenses. Many deductions apply to the Old Tax Regime.
              </p>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                  <Receipt className="w-4 h-4" /> 1. Section 80C Investment Details (Max ₹1,50,000)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="p-3.5 rounded-xl bg-[#18181b] border border-white/5 space-y-1">
                    <label className="text-[11px] text-gray-300">ELSS Mutual Funds</label>
                    <input
                      type="number"
                      value={elssAmount}
                      onChange={(e) => setElssAmount(Number(e.target.value))}
                      className="w-full bg-[#111111] border border-white/10 rounded-lg p-2 text-xs font-mono text-white"
                    />
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#18181b] border border-white/5 space-y-1">
                    <label className="text-[11px] text-gray-300">Public Provident Fund (PPF)</label>
                    <input
                      type="number"
                      value={ppfAmount}
                      onChange={(e) => setPpfAmount(Number(e.target.value))}
                      className="w-full bg-[#111111] border border-white/10 rounded-lg p-2 text-xs font-mono text-white"
                    />
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#18181b] border border-white/5 space-y-1">
                    <label className="text-[11px] text-gray-300">Employee PF (EPF)</label>
                    <input
                      type="number"
                      value={epfAmount}
                      onChange={(e) => setEpfAmount(Number(e.target.value))}
                      className="w-full bg-[#111111] border border-white/10 rounded-lg p-2 text-xs font-mono text-white"
                    />
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#18181b] border border-white/5 space-y-1">
                    <label className="text-[11px] text-gray-300">Tax Saving 5-Year FD</label>
                    <input
                      type="number"
                      value={taxSaverFdAmount}
                      onChange={(e) => setTaxSaverFdAmount(Number(e.target.value))}
                      className="w-full bg-[#111111] border border-white/10 rounded-lg p-2 text-xs font-mono text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> 2. Other Chapter VI-A Deduction Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-[#18181b] border border-white/5 space-y-2">
                    <label className="text-xs font-semibold text-gray-200">
                      Section 80D (Health Insurance Premium)
                    </label>
                    <input
                      type="number"
                      value={deduction80D}
                      onChange={(e) => setDeduction80D(Number(e.target.value))}
                      className="w-full bg-[#111111] border border-white/10 rounded-lg p-2.5 text-sm font-mono text-white"
                    />
                    <p className="text-[10px] text-gray-400">Self, family & senior citizen parents</p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#18181b] border border-white/5 space-y-2">
                    <label className="text-xs font-semibold text-gray-200">
                      Section 80CCD(1B) (NPS Additional)
                    </label>
                    <input
                      type="number"
                      value={deduction80CCD1B}
                      onChange={(e) => setDeduction80CCD1B(Number(e.target.value))}
                      className="w-full bg-[#111111] border border-white/10 rounded-lg p-2.5 text-sm font-mono text-white"
                    />
                    <p className="text-[10px] text-gray-400">Additional deduction up to ₹50,000 for National Pension System</p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#18181b] border border-white/5 space-y-2">
                    <label className="text-xs font-semibold text-gray-200">
                      Section 24(b) Home Loan Interest
                    </label>
                    <input
                      type="number"
                      value={housingLoanInterest}
                      onChange={(e) => setHousingLoanInterest(Number(e.target.value))}
                      className="w-full bg-[#111111] border border-white/10 rounded-lg p-2.5 text-sm font-mono text-white"
                    />
                    <p className="text-[10px] text-gray-400">Max ₹2,00,000 deduction on self-occupied property</p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#18181b] border border-white/5 space-y-2">
                    <label className="text-xs font-semibold text-gray-200">
                      Section 80G (Charitable Donations)
                    </label>
                    <input
                      type="number"
                      value={deduction80G}
                      onChange={(e) => setDeduction80G(Number(e.target.value))}
                      className="w-full bg-[#111111] border border-white/10 rounded-lg p-2.5 text-sm font-mono text-white"
                    />
                    <p className="text-[10px] text-gray-400">PM CARES Fund & approved relief trusts</p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#18181b] border border-white/5 space-y-2">
                    <label className="text-xs font-semibold text-gray-200">
                      Section 80TTA (Savings Account Interest)
                    </label>
                    <input
                      type="number"
                      value={deduction80TTA}
                      onChange={(e) => setDeduction80TTA(Number(e.target.value))}
                      className="w-full bg-[#111111] border border-white/10 rounded-lg p-2.5 text-sm font-mono text-white"
                    />
                    <p className="text-[10px] text-gray-400">Up to ₹10,000 interest deduction</p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#18181b] border border-white/5 space-y-2">
                    <label className="text-xs font-semibold text-gray-200">
                      Section 80E (Higher Education Loan)
                    </label>
                    <input
                      type="number"
                      value={deduction80E}
                      onChange={(e) => setDeduction80E(Number(e.target.value))}
                      className="w-full bg-[#111111] border border-white/10 rounded-lg p-2.5 text-sm font-mono text-white"
                    />
                    <p className="text-[10px] text-gray-400">Full interest amount without upper limit</p>
                  </div>
                </div>
              </div>

              {/* Expense Details */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                  <Calculator className="w-4 h-4" /> 3. Expense Details (Rental & Freelance)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-[#18181b] border border-white/5 space-y-2">
                    <label className="text-xs font-semibold text-gray-200">
                      Municipal Property Taxes Paid (House Property)
                    </label>
                    <input
                      type="number"
                      value={municipalTaxes}
                      onChange={(e) => setMunicipalTaxes(Number(e.target.value))}
                      className="w-full bg-[#111111] border border-white/10 rounded-lg p-2.5 text-sm font-mono text-white"
                    />
                    <p className="text-[10px] text-gray-400">Deductible from gross rental value prior to standard 30% deduction</p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#18181b] border border-white/5 space-y-2">
                    <label className="text-xs font-semibold text-gray-200">
                      Freelance / Professional Expenses Claimed
                    </label>
                    <input
                      type="number"
                      value={freelanceExpenses}
                      onChange={(e) => setFreelanceExpenses(Number(e.target.value))}
                      className="w-full bg-[#111111] border border-white/10 rounded-lg p-2.5 text-sm font-mono text-white"
                    />
                    <p className="text-[10px] text-gray-400">Software subscriptions, travel, internet & equipment depreciation</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Tax Regime Comparison */}
          {wizardStep === 3 && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-emerald-400">Break-even Deduction Point Analysis:</span>
                  <p className="text-gray-300 mt-0.5">
                    For your gross income of ₹{grossIncome.toLocaleString("en-IN")}, you need total deductions exceeding <span className="font-mono font-bold text-white">₹{breakEvenDeduction.toLocaleString("en-IN")}</span> for Old Regime to be beneficial. Current total deductions: <span className="font-mono font-bold text-emerald-400">₹{totalDeductionsOld.toLocaleString("en-IN")}</span>.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shrink-0">
                  {totalDeductionsOld > breakEvenDeduction ? "Old Regime Recommended" : "New Regime Recommended"}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* New Tax Regime Card */}
                <div
                  onClick={() => setSelectedRegime("new")}
                  className={`p-6 rounded-2xl border cursor-pointer transition-all space-y-4 ${
                    selectedRegime === "new"
                      ? "bg-emerald-950/20 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.2)]"
                      : "bg-[#18181b] border-white/10 hover:border-white/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      Section 115BAC New Tax Regime
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                      {selectedRegime === "new" ? "Selected" : "Click to Select"}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white">New Tax Regime (Default)</h3>
                  <p className="text-xs text-gray-400">
                    Enhanced Standard Deduction of ₹75,000. Low progressive tax slabs. No documentation hassle for 80C or 80D proofs.
                  </p>

                  <div className="space-y-2 pt-2 border-t border-white/10 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Standard Deduction:</span>
                      <span className="font-mono font-bold text-white">₹75,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Net Taxable Income:</span>
                      <span className="font-mono font-bold text-white">₹{netTaxableIncomeNew.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Base Tax:</span>
                      <span className="font-mono text-gray-300">₹{baseTaxNew.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Health & Education Cess (4%):</span>
                      <span className="font-mono text-gray-300">₹{Math.round(baseTaxNew * 0.04).toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-white/5 font-bold text-sm">
                      <span className="text-white">Total Tax Liability:</span>
                      <span className="font-mono text-emerald-400">₹{taxLiabilityNew.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>

                {/* Old Tax Regime Card */}
                <div
                  onClick={() => setSelectedRegime("old")}
                  className={`p-6 rounded-2xl border cursor-pointer transition-all space-y-4 ${
                    selectedRegime === "old"
                      ? "bg-emerald-950/20 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.2)]"
                      : "bg-[#18181b] border-white/10 hover:border-white/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      Old Tax Regime (Sec 115BAC Opt-Out)
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-gray-300 font-bold">
                      {selectedRegime === "old" ? "Selected" : "Click to Select"}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white">Old Tax Regime</h3>
                  <p className="text-xs text-gray-400">
                    Allows claiming 80C, 80D, 80CCD, 80E, 24(b) home loan interest, and ₹50,000 standard deduction. Requires Form 10-IEA.
                  </p>

                  <div className="space-y-2 pt-2 border-t border-white/10 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Deductions Claimed:</span>
                      <span className="font-mono font-bold text-white">₹{totalDeductionsOld.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Net Taxable Income:</span>
                      <span className="font-mono font-bold text-white">₹{netTaxableIncomeOld.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Base Tax:</span>
                      <span className="font-mono text-gray-300">₹{baseTaxOld.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Health & Education Cess (4%):</span>
                      <span className="font-mono text-gray-300">₹{Math.round(baseTaxOld * 0.04).toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-white/5 font-bold text-sm">
                      <span className="text-white">Total Tax Liability:</span>
                      <span className="font-mono text-white">₹{taxLiabilityOld.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Tax Calculation, Liability Breakdown & Approval */}
          {wizardStep === 4 && (
            <div className="space-y-6">
              {/* Tax Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-[#18181b] border border-white/10 space-y-1">
                  <span className="text-xs text-gray-400">Gross Total Income</span>
                  <div className="text-xl font-bold font-mono text-white">₹{grossIncome.toLocaleString("en-IN")}</div>
                  <span className="text-[10px] text-gray-500">All sources aggregated</span>
                </div>

                <div className="p-4 rounded-xl bg-[#18181b] border border-white/10 space-y-1">
                  <span className="text-xs text-gray-400">Final Tax Liability</span>
                  <div className="text-xl font-bold font-mono text-white">₹{finalTaxLiability.toLocaleString("en-IN")}</div>
                  <span className="text-[10px] text-emerald-400">{selectedRegime.toUpperCase()} Regime Applied</span>
                </div>

                <div className="p-4 rounded-xl bg-[#18181b] border border-white/10 space-y-1">
                  <span className="text-xs text-gray-400">TDS / Advance Taxes</span>
                  <div className="text-xl font-bold font-mono text-emerald-400">₹{totalPrepaidTaxes.toLocaleString("en-IN")}</div>
                  <span className="text-[10px] text-gray-500">TDS: ₹{tdsPaid.toLocaleString("en-IN")} • Advance: ₹{advanceTaxPaid.toLocaleString("en-IN")}</span>
                </div>

                <div className={`p-4 rounded-xl border space-y-1 ${
                  isRefund ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-300" : "bg-amber-950/30 border-amber-500/40 text-amber-300"
                }`}>
                  <span className="text-xs font-semibold">{isRefund ? "Net Tax Refund" : "Balance Tax Payable"}</span>
                  <div className="text-2xl font-extrabold font-mono">
                    ₹{(isRefund ? refundAmount : payableAmount).toLocaleString("en-IN")}
                  </div>
                  <span className="text-[10px] opacity-80">{isRefund ? "Direct credit to verified bank account" : "Pay via Challan 280"}</span>
                </div>
              </div>

              {/* Itemized Tax Breakdown Table */}
              <div className="bg-[#18181b] rounded-xl border border-white/10 p-5 space-y-4">
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-emerald-400" /> Itemized Tax Calculation & Slab Breakdown
                </h4>

                <div className="divide-y divide-white/5 text-xs text-gray-300">
                  <div className="py-2 flex justify-between">
                    <span>Gross Total Income (Salary + Business + Property + Capital Gains + Other)</span>
                    <span className="font-mono text-white">₹{grossIncome.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span>Less: Standard Deduction ({selectedRegime === "new" ? "₹75,000 under Sec 115BAC" : "₹50,000"})</span>
                    <span className="font-mono text-emerald-400">-₹{(selectedRegime === "new" ? 75000 : 50000).toLocaleString("en-IN")}</span>
                  </div>
                  {selectedRegime === "old" && (
                    <div className="py-2 flex justify-between">
                      <span>Less: Chapter VI-A Deductions (80C, 80D, 80CCD, 80E, 24b)</span>
                      <span className="font-mono text-emerald-400">-₹{(totalDeductionsOld - standardDeductionOld).toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  <div className="py-2 flex justify-between font-bold text-white">
                    <span>Net Taxable Income</span>
                    <span className="font-mono">₹{(selectedRegime === "new" ? netTaxableIncomeNew : netTaxableIncomeOld).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span>Basic Income Tax Calculated on Slabs</span>
                    <span className="font-mono">₹{(selectedRegime === "new" ? baseTaxNew : baseTaxOld).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span>Add: Health & Education Cess @ 4%</span>
                    <span className="font-mono text-amber-400">+₹{Math.round((selectedRegime === "new" ? baseTaxNew : baseTaxOld) * 0.04).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="py-2 flex justify-between font-bold text-white border-t border-white/10 pt-2">
                    <span>Total Tax Liability</span>
                    <span className="font-mono text-emerald-400 text-sm">₹{finalTaxLiability.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="py-2 flex justify-between text-emerald-400">
                    <span>Less: Total Pre-Paid Taxes (TDS + TCS + Advance Tax)</span>
                    <span className="font-mono font-bold">-₹{totalPrepaidTaxes.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="py-2.5 flex justify-between font-extrabold text-sm border-t border-white/10 pt-2">
                    <span className={isRefund ? "text-emerald-400" : "text-amber-400"}>
                      {isRefund ? "Net Refund Receivable from Income Tax Dept" : "Net Tax Payable before E-Filing"}
                    </span>
                    <span className={`font-mono text-base ${isRefund ? "text-emerald-400" : "text-amber-400"}`}>
                      ₹{(isRefund ? refundAmount : payableAmount).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Ready to Submit & Review Action Card */}
              <div className="p-5 rounded-2xl bg-[#141414] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> Return Draft Prepared & Ready for Digital Approval
                  </h4>
                  <p className="text-xs text-gray-400">
                    Review your complete ITR summary, verify bank account for refund credit, and e-sign using Aadhaar OTP.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setActiveView("review-approval")}
                    className="border-white/10 text-xs text-gray-300 hover:text-white"
                  >
                    <Eye className="w-3.5 h-3.5 mr-1.5" /> Full Review
                  </Button>
                  <Button
                    onClick={() => setShowApprovalModal(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 rounded-xl shadow-[0_0_20px_rgba(5,150,105,0.4)]"
                  >
                    <Send className="w-3.5 h-3.5 mr-1.5" /> Approve & E-File Return
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Stepper Navigation Buttons */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              disabled={wizardStep === 1}
              onClick={() => setWizardStep(wizardStep - 1)}
              className="border-white/10 text-xs text-gray-300 hover:text-white"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Previous Step
            </Button>

            {wizardStep < 4 ? (
              <Button
                size="sm"
                onClick={() => setWizardStep(wizardStep + 1)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-5 rounded-xl"
              >
                Next Step <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => setActiveView("dashboard")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-5 rounded-xl"
              >
                Save Draft Return
              </Button>
            )}
          </div>
        </div>
      )}

      {/* FULL RETURN REVIEW & APPROVAL VIEW */}
      {activeView === "review-approval" && (
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <span className="text-xs font-bold text-emerald-400 font-mono uppercase">Tax Return Review</span>
              <h2 className="text-xl font-bold text-white mt-0.5">AY 2026-27 Form ITR-2 Comprehensive Review</h2>
              <p className="text-xs text-gray-400 mt-1">Prepared by CA Rajesh Sharma, FCA (ICAI Reg #291048)</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.success("Draft computation sheet exported.")}
                className="border-white/10 text-xs"
              >
                <Download className="w-3.5 h-3.5 mr-1.5" /> Export PDF
              </Button>
              <Button
                onClick={() => setShowApprovalModal(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
              >
                <FileCheck className="w-3.5 h-3.5 mr-1.5" /> Digital Approval (Aadhaar OTP)
              </Button>
            </div>
          </div>

          {/* Verification Checklist */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Verification Checklist:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[#18181b] rounded-xl border border-white/5 flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Form 16 Part A & B verified against TRACES 26AS.</span>
              </div>
              <div className="p-3 bg-[#18181b] rounded-xl border border-white/5 flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Capital gains matched with broker P&L statement.</span>
              </div>
              <div className="p-3 bg-[#18181b] rounded-xl border border-white/5 flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Bank account pre-validated for electronic refund credit.</span>
              </div>
              <div className="p-3 bg-[#18181b] rounded-xl border border-white/5 flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Section 115BAC New Regime chosen for optimal tax savings.</span>
              </div>
            </div>
          </div>

          {/* Tax Summary Overview */}
          <div className="bg-[#18181b] p-6 rounded-2xl border border-white/5 space-y-4">
            <h4 className="font-bold text-sm text-white">Summary for E-Filing:</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-gray-400">Assessment Year</span>
                <p className="font-bold text-white mt-1">AY 2026-27 (FY 2025-26)</p>
              </div>
              <div>
                <span className="text-gray-400">Gross Total Income</span>
                <p className="font-mono font-bold text-white mt-1">₹{grossIncome.toLocaleString("en-IN")}</p>
              </div>
              <div>
                <span className="text-gray-400">Total Pre-Paid Taxes</span>
                <p className="font-mono font-bold text-emerald-400 mt-1">₹{totalPrepaidTaxes.toLocaleString("en-IN")}</p>
              </div>
              <div>
                <span className="text-gray-400">Net Refund Due</span>
                <p className="font-mono font-extrabold text-emerald-400 mt-1">₹{refundAmount.toLocaleString("en-IN")}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PREVIOUS YEAR RETURNS / HISTORY VIEW */}
      {activeView === "history" && (
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <span className="text-xs font-bold text-emerald-400 font-mono uppercase">Tax Return History</span>
              <h2 className="text-xl font-bold text-white mt-0.5">Previous Year Returns & Filed Archives</h2>
              <p className="text-xs text-gray-400 mt-1">Official CBDT acknowledgement receipts and computation sheets for past financial years.</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success("Consolidated 3-year tax summary downloaded.")}
              className="border-white/10 text-xs text-gray-300 hover:text-white"
            >
              <FileDown className="w-3.5 h-3.5 mr-1.5" /> Download Multi-Year Summary
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {returnsList.filter(r => r.eVerified).map((item) => (
              <div key={item.id} className="p-5 rounded-2xl bg-[#18181b] border border-white/10 space-y-4 hover:border-emerald-500/40 transition-all flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {item.status}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">{item.filedDate}</span>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-white">{item.ay}</h3>
                    <p className="text-xs text-emerald-400 font-semibold mt-0.5">{item.form}</p>
                    <p className="text-[11px] text-gray-400 font-mono mt-1">Ack: {item.ackNo}</p>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-white/5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Gross Income:</span>
                      <span className="font-mono font-bold text-white">{item.grossIncome}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Tax Liability:</span>
                      <span className="font-mono text-white">{item.taxLiability}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Refund Issued:</span>
                      <span className="font-mono font-bold text-emerald-400">{item.refund}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/5 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toast.success(`Downloaded ITR-V Ack for ${item.ay}`)}
                    className="flex-1 text-xs border-white/10"
                  >
                    <Download className="w-3.5 h-3.5 mr-1" /> ITR-V
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => toast.success(`Downloaded Computation Sheet for ${item.ay}`)}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                  >
                    Computation
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FILING RECEIPT & CONFIRMATION VIEW */}
      {activeView === "filing-receipt" && filingReceiptData && (
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl max-w-3xl mx-auto">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-400 font-mono uppercase">Filing Confirmation</span>
                <h2 className="text-xl font-bold text-white">ITR-V Electronic Acknowledgement</h2>
                <span className="text-xs text-gray-400">Centralized Processing Center (CPC), Bengaluru</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="border-white/10 text-xs text-gray-300"
              >
                <Printer className="w-3.5 h-3.5 mr-1" /> Print
              </Button>
              <Button
                size="sm"
                onClick={() => toast.success("ITR-V official acknowledgement PDF downloaded.")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
              >
                <Download className="w-3.5 h-3.5 mr-1" /> Download ITR-V PDF
              </Button>
            </div>
          </div>

          {/* Official ITR-V Mock Sheet */}
          <div className="bg-white text-black p-6 rounded-xl font-mono text-xs space-y-4 shadow-inner">
            <div className="border-b-2 border-black pb-3 text-center">
              <h3 className="font-extrabold text-sm uppercase">Government of India • Income Tax Department</h3>
              <p className="text-[10px] text-gray-700">INDIAN INCOME TAX RETURN ACKNOWLEDGEMENT [ITR-V]</p>
              <p className="text-[10px] font-bold mt-1">{filingReceiptData.ay} • Form {filingReceiptData.form}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-[11px]">
              <div>
                <span className="text-gray-500">Acknowledgement Number:</span>
                <p className="font-extrabold text-sm">{filingReceiptData.ackNo}</p>
              </div>
              <div>
                <span className="text-gray-500">Date & Timestamp:</span>
                <p className="font-bold">{filingReceiptData.timestamp}</p>
              </div>
              <div>
                <span className="text-gray-500">Permanent Account Number (PAN):</span>
                <p className="font-bold">{filingReceiptData.pan}</p>
              </div>
              <div>
                <span className="text-gray-500">Name of Assessee:</span>
                <p className="font-bold">{filingReceiptData.taxpayer}</p>
              </div>
            </div>

            <div className="border-t border-gray-300 pt-3 space-y-1.5">
              <div className="flex justify-between">
                <span>Gross Total Income:</span>
                <span className="font-bold">₹{filingReceiptData.grossIncome.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Tax Liability (+4% Cess):</span>
                <span className="font-bold">₹{filingReceiptData.taxLiability.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes Deposited (TDS/TCS/Advance):</span>
                <span className="font-bold">₹{filingReceiptData.prepaidTaxes.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between border-t border-black pt-1 font-extrabold text-sm">
                <span>{filingReceiptData.refundDue > 0 ? "Net Refund Claimed:" : "Tax Payable:"}</span>
                <span>₹{(filingReceiptData.refundDue > 0 ? filingReceiptData.refundDue : filingReceiptData.taxPayable).toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="border-t border-gray-300 pt-3 flex items-center justify-between text-[10px]">
              <div className="space-y-1">
                <span className="font-bold text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Return Digitally Signed & E-Verified
                </span>
                <p className="text-gray-600">Verification Source: Aadhaar OTP EVC</p>
                <p className="text-gray-600">Do not send physical paper to CPC Bengaluru.</p>
              </div>
              <div className="w-16 h-16 border border-gray-400 rounded flex items-center justify-center bg-gray-50">
                <QrCode className="w-12 h-12 text-gray-800" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RETURN DETAILS VIEW */}
      {activeView === "return-details" && (
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <span className="text-xs font-bold text-emerald-400 font-mono uppercase">Tax Return Details</span>
              <h2 className="text-xl font-bold text-white mt-0.5">AY 2026-27 Income Tax Return Computation</h2>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveView("review-approval")}
                className="border-white/10 text-xs"
              >
                Review & E-Sign
              </Button>
              <Button
                onClick={() => toast.success("ITR-V PDF Download initiated.")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
              >
                <Download className="w-4 h-4 mr-1.5" /> Download ITR-V
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-[#18181b] border border-white/5">
              <span className="text-gray-400">Form Type</span>
              <p className="font-bold text-white text-sm mt-1">ITR-2 (Capital Gains & Foreign Assets)</p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#18181b] border border-white/5">
              <span className="text-gray-400">Assigned Chartered Accountant</span>
              <p className="font-bold text-emerald-400 text-sm mt-1">CA Rajesh Sharma, FCA</p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#18181b] border border-white/5">
              <span className="text-gray-400">Filing Status</span>
              <p className="font-bold text-amber-400 text-sm mt-1">Client Approval Pending</p>
            </div>
          </div>
        </div>
      )}

      {/* AADHAAR OTP APPROVAL & E-VERIFICATION MODAL */}
      {showApprovalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#111111] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-5 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base">Tax Return Approval & E-Verification</h3>
              </div>
              <button onClick={() => setShowApprovalModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-300">
              An Aadhaar OTP has been sent to your registered mobile number ending with <strong>•••• 4921</strong> to authorize and e-verify your AY 2026-27 return submission with Income Tax Department.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-300">Enter 6-digit Aadhaar OTP:</label>
              <input
                type="text"
                maxLength={6}
                placeholder="e.g. 582910"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="w-full bg-[#18181b] border border-white/10 rounded-xl p-3 text-center text-lg font-mono tracking-widest text-emerald-400 focus:outline-none focus:border-emerald-500"
              />
              <span className="text-[10px] text-gray-400 block text-right">Expires in 09:42 mins</span>
            </div>

            <div className="p-3 bg-[#18181b] rounded-xl border border-white/5 text-[11px] text-gray-300 space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Tax Liability:</span>
                <span className="font-mono font-bold text-white">₹{finalTaxLiability.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">{isRefund ? "Refund Credited:" : "Tax Due:"}</span>
                <span className="font-mono font-bold text-emerald-400">₹{(isRefund ? refundAmount : payableAmount).toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowApprovalModal(false)}
                className="border-white/10 text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={isSubmitting}
                onClick={handleSimulateEFileSubmission}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> E-Filing to CBDT...
                  </span>
                ) : (
                  "Verify & Submit ITR"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
