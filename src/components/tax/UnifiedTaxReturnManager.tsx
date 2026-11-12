"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  FileSpreadsheet,
  ShieldCheck,
  Download,
  Plus,
  Clock,
  CheckCircle2,
  Building,
  Briefcase,
  Home,
  TrendingUp,
  CreditCard,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Calculator,
  IndianRupee,
  RefreshCw,
  Globe,
  Award,
  Receipt,
  FileCheck,
  Send,
  Eye,
  Printer,
  X,
  History,
  FileDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface SavedReturnRecord {
  id: string;
  assessmentYear: string;
  financialYear: string;
  itrType: string;
  status: string;
  rawStatus?: string;
  caName: string;
  acknowledgeNumber: string;
  filingDate?: string | null;
  grossIncome: number;
  taxableIncome: number;
  taxAmount: number;
  refundAmount: number;
  prepaidTaxes: number;
  regime: string;
  pan: string;
  taxpayerName: string;
  eVerified: boolean;
  computation?: Record<string, number> | null;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function downloadItrVDocument(record: {
  ackNo: string;
  ay: string;
  form: string;
  pan: string;
  taxpayer: string;
  timestamp: string;
  grossIncome: number;
  taxLiability: number;
  prepaidTaxes: number;
  refundDue: number;
  taxPayable: number;
  regime: string;
}) {
  const html = `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>ITR-V ${escapeHtml(record.ackNo)}</title>
<style>
  body { font-family: ui-monospace, SFMono-Regular, monospace; max-width: 720px; margin: 40px auto; padding: 24px; color: #111; border: 2px solid #111; }
  .center { text-align: center; border-bottom: 2px solid #111; padding-bottom: 12px; margin-bottom: 16px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
  .row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #ddd; }
  .total { font-weight: 800; border-top: 2px solid #111; padding-top: 8px; }
</style></head>
<body>
  <div class="center">
    <h2>TaxMate Electronic Tax Filing Acknowledgement [ITR-V]</h2>
    <p>${escapeHtml(record.ay)} &bull; Form ${escapeHtml(record.form)} &bull; ${escapeHtml(record.regime)}</p>
  </div>
  <div class="grid">
    <div><strong>Acknowledgement No:</strong><br>${escapeHtml(record.ackNo)}</div>
    <div><strong>Filed Timestamp:</strong><br>${escapeHtml(record.timestamp)}</div>
    <div><strong>PAN:</strong><br>${escapeHtml(record.pan || "Pending KYC")}</div>
    <div><strong>Taxpayer Name:</strong><br>${escapeHtml(record.taxpayer || "Taxpayer")}</div>
  </div>
  <div class="row"><span>Gross Total Income</span><strong>Rs. ${record.grossIncome.toLocaleString("en-IN")}</strong></div>
  <div class="row"><span>Total Tax Liability (+4% Cess)</span><strong>Rs. ${record.taxLiability.toLocaleString("en-IN")}</strong></div>
  <div class="row"><span>Pre-paid Taxes (TDS/TCS/Advance)</span><strong>Rs. ${record.prepaidTaxes.toLocaleString("en-IN")}</strong></div>
  <div class="row total"><span>${record.refundDue > 0 ? "Net Refund Receivable" : "Tax Payable"}</span><strong>Rs. ${(record.refundDue > 0 ? record.refundDue : record.taxPayable).toLocaleString("en-IN")}</strong></div>
</body></html>`;

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ITR-V-${record.ay.replace(/[^a-zA-Z0-9_-]/g, "_")}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function UnifiedTaxReturnManager() {
  const [activeView, setActiveView] = useState<
    | "dashboard"
    | "create-wizard"
    | "return-details"
    | "review-approval"
    | "filing-receipt"
    | "history"
  >("dashboard");
  const [returnsList, setReturnsList] = useState<SavedReturnRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReturnId, setSelectedReturnId] = useState<string>("");
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [showApprovalModal, setShowApprovalModal] = useState<boolean>(false);
  const [otpCode, setOtpCode] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [savingDraft, setSavingDraft] = useState<boolean>(false);
  const [filingReceiptData, setFilingReceiptData] = useState<any>(null);

  const [taxpayerInfo, setTaxpayerInfo] = useState({
    name: "",
    pan: "",
    phoneLast4: "••••",
  });

  // Income details state (defaults to 0 until loaded/entered)
  const [salaryIncome, setSalaryIncome] = useState<number>(0);
  const [businessIncome, setBusinessIncome] = useState<number>(0);
  const [freelanceIncome, setFreelanceIncome] = useState<number>(0);
  const [rentalIncome, setRentalIncome] = useState<number>(0);
  const [capitalGainsLTCG, setCapitalGainsLTCG] = useState<number>(0);
  const [capitalGainsSTCG, setCapitalGainsSTCG] = useState<number>(0);
  const [interestIncome, setInterestIncome] = useState<number>(0);
  const [dividendIncome, setDividendIncome] = useState<number>(0);
  const [otherIncome, setOtherIncome] = useState<number>(0);
  const [foreignIncome, setForeignIncome] = useState<number>(0);
  const [exemptIncome, setExemptIncome] = useState<number>(0);

  // Expenses state
  const [municipalTaxes, setMunicipalTaxes] = useState<number>(0);
  const [freelanceExpenses, setFreelanceExpenses] = useState<number>(0);

  // Deductions & Investments state
  const [elssAmount, setElssAmount] = useState<number>(0);
  const [ppfAmount, setPpfAmount] = useState<number>(0);
  const [epfAmount, setEpfAmount] = useState<number>(0);
  const [taxSaverFdAmount, setTaxSaverFdAmount] = useState<number>(0);

  const total80CInvestments = elssAmount + ppfAmount + epfAmount + taxSaverFdAmount;
  const deduction80C = Math.min(150000, total80CInvestments);

  const [deduction80D, setDeduction80D] = useState<number>(0);
  const [deduction80CCD1B, setDeduction80CCD1B] = useState<number>(0);
  const [deduction80E, setDeduction80E] = useState<number>(0);
  const [deduction80G, setDeduction80G] = useState<number>(0);
  const [deduction80TTA, setDeduction80TTA] = useState<number>(0);
  const [housingLoanInterest, setHousingLoanInterest] = useState<number>(0);

  // Regime & Prepaid Taxes
  const [selectedRegime, setSelectedRegime] = useState<"new" | "old">("new");
  const [tdsPaid, setTdsPaid] = useState<number>(0);
  const [tcsPaid, setTcsPaid] = useState<number>(0);
  const [advanceTaxPaid, setAdvanceTaxPaid] = useState<number>(0);

  const applyComputationToForm = useCallback((rec: SavedReturnRecord) => {
    const c = rec.computation || {};
    setSalaryIncome(Number(c.salaryIncome ?? rec.grossIncome ?? 0));
    setBusinessIncome(Number(c.businessIncome ?? 0));
    setFreelanceIncome(Number(c.freelanceIncome ?? 0));
    setRentalIncome(Number(c.rentalIncome ?? 0));
    setCapitalGainsLTCG(Number(c.capitalGainsLTCG ?? 0));
    setCapitalGainsSTCG(Number(c.capitalGainsSTCG ?? 0));
    setInterestIncome(Number(c.interestIncome ?? 0));
    setDividendIncome(Number(c.dividendIncome ?? 0));
    setOtherIncome(Number(c.otherIncome ?? 0));
    setForeignIncome(Number(c.foreignIncome ?? 0));
    setExemptIncome(Number(c.exemptIncome ?? 0));
    setMunicipalTaxes(Number(c.municipalTaxes ?? 0));
    setFreelanceExpenses(Number(c.freelanceExpenses ?? 0));
    setElssAmount(Number(c.elssAmount ?? 0));
    setPpfAmount(Number(c.ppfAmount ?? 0));
    setEpfAmount(Number(c.epfAmount ?? 0));
    setTaxSaverFdAmount(Number(c.taxSaverFdAmount ?? 0));
    setDeduction80D(Number(c.deduction80D ?? 0));
    setDeduction80CCD1B(Number(c.deduction80CCD1B ?? 0));
    setDeduction80E(Number(c.deduction80E ?? 0));
    setDeduction80G(Number(c.deduction80G ?? 0));
    setDeduction80TTA(Number(c.deduction80TTA ?? 0));
    setHousingLoanInterest(Number(c.housingLoanInterest ?? 0));
    setTdsPaid(Number(c.tdsPaid ?? rec.prepaidTaxes ?? 0));
    setTcsPaid(Number(c.tcsPaid ?? 0));
    setAdvanceTaxPaid(Number(c.advanceTaxPaid ?? 0));
    setSelectedRegime(rec.regime === "old" ? "old" : "new");
  }, []);

  const loadTaxReturns = useCallback(async () => {
    try {
      setLoading(true);
      const [itrRes, profRes] = await Promise.all([
        fetch("/api/itr", { credentials: "include" }),
        fetch("/api/v1/profile", { credentials: "include" }),
      ]);

      if (profRes.ok) {
        const pJson = await profRes.json();
        const phoneStr = String(pJson.data?.phone || "");
        setTaxpayerInfo({
          name: pJson.data?.fullName || pJson.data?.email || "Taxpayer",
          pan: pJson.data?.pan || "",
          phoneLast4: phoneStr.length >= 4 ? phoneStr.slice(-4) : "registered",
        });
      }

      if (itrRes.ok) {
        const iJson = await itrRes.json();
        const items: SavedReturnRecord[] = (iJson.data || []).map((item: any) => ({
          id: item.id,
          assessmentYear: item.assessmentYear || `AY ${item.financialYear || "2026-27"}`,
          financialYear: item.financialYear || "2025-26",
          itrType: item.itrType || "ITR-2",
          status: item.status || "in-progress",
          rawStatus: item.rawStatus,
          caName: item.caName || "Assigned CA Desk",
          acknowledgeNumber: item.acknowledgeNumber || "Pending Approval",
          filingDate: item.filingDate || null,
          grossIncome: Number(item.grossIncome || 0),
          taxableIncome: Number(item.taxableIncome || 0),
          taxAmount: Number(item.taxAmount || 0),
          refundAmount: Number(item.refundAmount || 0),
          prepaidTaxes: Number(item.prepaidTaxes || 0),
          regime: item.regime || "new",
          pan: item.pan || "",
          taxpayerName: item.taxpayerName || "",
          eVerified: Boolean(item.eVerified),
          computation: item.computation || null,
        }));

        setReturnsList(items);
        if (items.length > 0 && !selectedReturnId) {
          setSelectedReturnId(items[0].id);
          applyComputationToForm(items[0]);
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load tax returns");
    } finally {
      setLoading(false);
    }
  }, [applyComputationToForm, selectedReturnId]);

  useEffect(() => {
    loadTaxReturns();
  }, [loadTaxReturns]);

  const totalPrepaidTaxes = tdsPaid + tcsPaid + advanceTaxPaid;
  const netRental = Math.max(0, rentalIncome - municipalTaxes);
  const taxableRental = Math.max(0, netRental - netRental * 0.3);

  const grossIncome =
    salaryIncome +
    businessIncome +
    Math.max(0, freelanceIncome - freelanceExpenses) +
    taxableRental +
    capitalGainsLTCG +
    capitalGainsSTCG +
    interestIncome +
    dividendIncome +
    otherIncome +
    foreignIncome;

  const standardDeductionOld = 50000;
  const totalDeductionsOld =
    deduction80C +
    deduction80D +
    deduction80CCD1B +
    deduction80E +
    deduction80G +
    deduction80TTA +
    Math.min(200000, housingLoanInterest) +
    standardDeductionOld;
  const netTaxableIncomeOld = Math.max(0, grossIncome - totalDeductionsOld);

  const calcTaxOld = (taxable: number) => {
    if (taxable <= 250000) return 0;
    if (taxable <= 500000) return (taxable - 250000) * 0.05;
    if (taxable <= 1000000) return 12500 + (taxable - 500000) * 0.2;
    return 112500 + (taxable - 1000000) * 0.3;
  };
  let baseTaxOld = calcTaxOld(netTaxableIncomeOld);
  if (netTaxableIncomeOld <= 500000) baseTaxOld = 0;
  const taxLiabilityOld = Math.round(baseTaxOld * 1.04);

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
  if (netTaxableIncomeNew <= 700000) baseTaxNew = 0;
  const taxLiabilityNew = Math.round(baseTaxNew * 1.04);

  const finalTaxLiability = selectedRegime === "new" ? taxLiabilityNew : taxLiabilityOld;
  const netBalance = totalPrepaidTaxes - finalTaxLiability;
  const isRefund = netBalance > 0;
  const refundAmount = isRefund ? netBalance : 0;
  const payableAmount = isRefund ? 0 : Math.abs(netBalance);
  const breakEvenDeduction = 425000;

  const buildComputationPayload = () => ({
    salaryIncome,
    businessIncome,
    freelanceIncome,
    rentalIncome,
    capitalGainsLTCG,
    capitalGainsSTCG,
    interestIncome,
    dividendIncome,
    otherIncome,
    foreignIncome,
    exemptIncome,
    municipalTaxes,
    freelanceExpenses,
    elssAmount,
    ppfAmount,
    epfAmount,
    taxSaverFdAmount,
    deduction80D,
    deduction80CCD1B,
    deduction80E,
    deduction80G,
    deduction80TTA,
    housingLoanInterest,
    tdsPaid,
    tcsPaid,
    advanceTaxPaid,
  });

  const persistDraftReturn = async (
    targetId: string | null
  ): Promise<SavedReturnRecord | null> => {
    const inferredForm =
      businessIncome > 0 || freelanceIncome > 0
        ? "ITR_3"
        : capitalGainsLTCG > 0 || capitalGainsSTCG > 0 || foreignIncome > 0 || rentalIncome > 0
          ? "ITR_2"
          : "ITR_1";

    const payload = {
      ...(targetId ? { id: targetId } : {}),
      itrType: inferredForm,
      financialYear: "2025-26",
      assessmentYear: "AY 2026-27",
      status: "under-review",
      grossIncome,
      taxableIncome:
        selectedRegime === "new" ? netTaxableIncomeNew : netTaxableIncomeOld,
      taxAmount: finalTaxLiability,
      refundAmount: refundAmount,
      prepaidTaxes: totalPrepaidTaxes,
      regime: selectedRegime,
      pan: taxpayerInfo.pan,
      taxpayerName: taxpayerInfo.name,
      computation: buildComputationPayload(),
    };

    const res = await fetch("/api/itr", {
      method: targetId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || "Failed to save return computation");
    }
    return json.data;
  };

  const handleSaveDraft = async () => {
    try {
      setSavingDraft(true);
      const currentRecord = returnsList.find((r) => r.id === selectedReturnId && !r.eVerified);
      const saved = await persistDraftReturn(currentRecord?.id || null);
      if (saved) {
        setSelectedReturnId(saved.id);
      }
      toast.success("Tax return computation saved to Supabase.");
      await loadTaxReturns();
      setActiveView("dashboard");
    } catch (err: any) {
      toast.error(err.message || "Could not save draft");
    } finally {
      setSavingDraft(false);
    }
  };

  const handleSubmitEFile = async () => {
    if (!/^\d{6}$/.test(otpCode.trim())) {
      toast.error("Enter the 6-digit numeric Aadhaar/EVC OTP before submitting.");
      return;
    }

    try {
      setIsSubmitting(true);
      const currentRecord = returnsList.find((r) => r.id === selectedReturnId && !r.eVerified);
      const baseRecord = await persistDraftReturn(currentRecord?.id || null);
      if (!baseRecord?.id) throw new Error("Unable to resolve return record ID");

      const generatedAck = `ACK-${Date.now().toString().slice(-10)}`;
      const todayIso = new Date().toISOString().split("T")[0];

      const submitRes = await fetch("/api/itr", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          id: baseRecord.id,
          status: "submitted",
          filingDate: todayIso,
          acknowledgeNumber: generatedAck,
          eVerified: true,
        }),
      });
      const submitJson = await submitRes.json();
      if (!submitRes.ok || !submitJson.success) {
        throw new Error(submitJson.error || "E-file submission failed");
      }

      setShowApprovalModal(false);
      setOtpCode("");
      setFilingReceiptData({
        ackNo: generatedAck,
        ay: baseRecord.assessmentYear || "AY 2026-27",
        form: baseRecord.itrType || "ITR-2",
        pan: taxpayerInfo.pan || "Verified PAN",
        taxpayer: taxpayerInfo.name || "Taxpayer",
        timestamp: new Date().toLocaleString("en-IN"),
        grossIncome,
        taxLiability: finalTaxLiability,
        prepaidTaxes: totalPrepaidTaxes,
        refundDue: isRefund ? refundAmount : 0,
        taxPayable: !isRefund ? payableAmount : 0,
        regime: selectedRegime === "new" ? "New Regime Sec 115BAC" : "Old Regime",
      });
      setActiveView("filing-receipt");
      toast.success("Income tax return filed & recorded successfully!");
      await loadTaxReturns();
    } catch (err: any) {
      toast.error(err.message || "E-filing failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedReturn =
    returnsList.find((r) => r.id === selectedReturnId) || returnsList[0] || null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-white">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-emerald-400" /> Income Tax Returns &amp;
            Computation Engine
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Compute, compare New vs Old tax regimes, save drafts, and record verified filings.
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
            className={`text-xs border-white/10 ${
              activeView === "history"
                ? "bg-white/10 text-white"
                : "text-gray-300 hover:text-white"
            }`}
          >
            <History className="w-3.5 h-3.5 mr-1.5 text-emerald-400" /> Previous Year Returns
          </Button>

          <Button
            onClick={() => {
              setSelectedReturnId("");
              setActiveView("create-wizard");
              setWizardStep(1);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-[0_0_20px_rgba(5,150,105,0.4)]"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Create Tax Return (AY 2026-27)
          </Button>
        </div>
      </div>

      {/* DASHBOARD VIEW */}
      {activeView === "dashboard" && (
        <div className="space-y-6">
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" /> Active Computation Status (AY
                2026-27)
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {selectedReturn ? selectedReturn.status : "Ready to Start"}
                </span>
                <Button
                  size="sm"
                  onClick={() => setActiveView("review-approval")}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-7 px-3 rounded-lg"
                >
                  <FileCheck className="w-3.5 h-3.5 mr-1" /> Review &amp; Approve
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-2">
              {[
                {
                  title: "1. Income Sources",
                  desc: "Salary, Capital Gains & Foreign",
                  done: grossIncome > 0,
                },
                {
                  title: "2. Deductions",
                  desc: "Chapter VI-A & Expenses",
                  done: grossIncome > 0,
                },
                {
                  title: "3. Tax Computation",
                  desc: "Old vs New Sec 115BAC",
                  done: grossIncome > 0,
                },
                {
                  title: "4. Customer Approval",
                  desc: "Aadhaar OTP e-Verify",
                  active: Boolean(selectedReturn && !selectedReturn.eVerified),
                  done: Boolean(selectedReturn?.eVerified),
                },
                {
                  title: "5. E-Filing & ITR-V",
                  desc: "Official Submission",
                  done: Boolean(selectedReturn?.eVerified),
                },
              ].map((step, i) => (
                <div
                  key={i}
                  className={`p-3.5 rounded-xl border text-xs space-y-1 transition-all ${
                    step.active
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500 font-bold"
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

          {/* Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-[#111111] border border-white/10 space-y-1">
              <span className="text-xs text-gray-400">Computed Gross Income</span>
              <div className="text-xl font-bold font-mono text-white">
                ₹{grossIncome.toLocaleString("en-IN")}
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold">
                Live wizard total
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-[#111111] border border-white/10 space-y-1">
              <span className="text-xs text-gray-400">
                Tax Liability ({selectedRegime.toUpperCase()})
              </span>
              <div className="text-xl font-bold font-mono text-white">
                ₹{finalTaxLiability.toLocaleString("en-IN")}
              </div>
              <span className="text-[10px] text-gray-400">Includes 4% Health &amp; Ed Cess</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#111111] border border-white/10 space-y-1">
              <span className="text-xs text-gray-400">TDS / Advance Taxes Credited</span>
              <div className="text-xl font-bold font-mono text-emerald-400">
                ₹{totalPrepaidTaxes.toLocaleString("en-IN")}
              </div>
              <span className="text-[10px] text-gray-400">TDS + TCS + Advance Tax</span>
            </div>
            <div
              className={`p-4 rounded-2xl border space-y-1 ${
                isRefund
                  ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
                  : "bg-amber-950/20 border-amber-500/30 text-amber-300"
              }`}
            >
              <span className="text-xs font-semibold">
                {isRefund ? "Estimated Refund Due" : "Tax Payable (Challan 280)"}
              </span>
              <div className="text-xl font-extrabold font-mono">
                ₹{(isRefund ? refundAmount : payableAmount).toLocaleString("en-IN")}
              </div>
              <span className="text-[10px] opacity-80">
                {isRefund ? "Refund receivable" : "Balance tax due"}
              </span>
            </div>
          </div>

          {/* Returns Table */}
          <div className="bg-[#111111] rounded-2xl border border-white/10 overflow-hidden shadow-xl">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-white">
                  Saved Drafts &amp; Filed Tax Returns
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Persisted income tax return computations and filing acknowledgements.
                </p>
              </div>
              <span className="text-xs text-gray-400 font-mono">
                {returnsList.length} Record{returnsList.length === 1 ? "" : "s"}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-[#18181b] text-white font-semibold border-b border-white/10">
                  <tr>
                    <th className="py-3.5 px-4">Assessment Year</th>
                    <th className="py-3.5 px-4">ITR Form</th>
                    <th className="py-3.5 px-4">Gross Income</th>
                    <th className="py-3.5 px-4">Tax Liability</th>
                    <th className="py-3.5 px-4">Pre-Paid Taxes</th>
                    <th className="py-3.5 px-4">Refund</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-gray-400">
                        Loading tax return records...
                      </td>
                    </tr>
                  ) : returnsList.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-gray-500 space-y-3">
                        <p>No income tax returns saved yet.</p>
                        <Button
                          size="sm"
                          onClick={() => {
                            setActiveView("create-wizard");
                            setWizardStep(1);
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                        >
                          <Plus className="w-3.5 h-3.5 mr-1" /> Start New Computation
                        </Button>
                      </td>
                    </tr>
                  ) : (
                    returnsList.map((r) => (
                      <tr key={r.id} className="hover:bg-[#18181b]/50 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-white">
                          <div>{r.assessmentYear}</div>
                          <div className="text-[10px] text-gray-400 font-normal uppercase">
                            {r.regime} regime
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-emerald-400">{r.itrType}</td>
                        <td className="py-3.5 px-4 font-mono font-bold">
                          ₹{r.grossIncome.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3.5 px-4 font-mono">
                          ₹{r.taxAmount.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-emerald-400 font-bold">
                          ₹{r.prepaidTaxes.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-extrabold text-emerald-400">
                          ₹{r.refundAmount.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase ${
                              r.eVerified
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedReturnId(r.id);
                              applyComputationToForm(r);
                              setActiveView("return-details");
                            }}
                            className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 text-xs"
                          >
                            View Details
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              downloadItrVDocument({
                                ackNo: r.acknowledgeNumber || r.id.slice(0, 10).toUpperCase(),
                                ay: r.assessmentYear,
                                form: r.itrType,
                                pan: r.pan || taxpayerInfo.pan,
                                taxpayer: r.taxpayerName || taxpayerInfo.name,
                                timestamp: r.filingDate || new Date().toLocaleDateString("en-IN"),
                                grossIncome: r.grossIncome,
                                taxLiability: r.taxAmount,
                                prepaidTaxes: r.prepaidTaxes,
                                refundDue: r.refundAmount,
                                taxPayable: Math.max(0, r.taxAmount - r.prepaidTaxes),
                                regime: r.regime,
                              });
                              toast.success(`Downloaded ITR-V receipt for ${r.assessmentYear}`);
                            }}
                            className="text-gray-300 hover:text-white"
                            title="Download ITR-V Receipt"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CREATE TAX RETURN WIZARD */}
      {activeView === "create-wizard" && (
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <span className="text-[11px] font-mono text-emerald-400 uppercase font-bold">
                Step {wizardStep} of 4
              </span>
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
                { s: 4, label: "Summary" },
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

          {wizardStep === 1 && (
            <div className="space-y-6">
              <p className="text-xs text-gray-400">
                Enter gross income components across all heads of income, foreign assets, and
                exempt sources.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    label: "Salary Income (Form 16)",
                    val: salaryIncome,
                    set: setSalaryIncome,
                    icon: Briefcase,
                    hint: "Gross salary, allowances & perquisites",
                  },
                  {
                    label: "Business Income (Sec 44AD)",
                    val: businessIncome,
                    set: setBusinessIncome,
                    icon: Building,
                    hint: "Presumptive taxation or audited profits",
                  },
                  {
                    label: "Freelance Fees (Sec 44ADA)",
                    val: freelanceIncome,
                    set: setFreelanceIncome,
                    icon: Briefcase,
                    hint: "Professional & consulting income",
                  },
                  {
                    label: "Rental Income",
                    val: rentalIncome,
                    set: setRentalIncome,
                    icon: Home,
                    hint: "Gross annual rent received",
                  },
                  {
                    label: "Long-Term Capital Gains (112A)",
                    val: capitalGainsLTCG,
                    set: setCapitalGainsLTCG,
                    icon: TrendingUp,
                    hint: "Listed equity & equity MFs",
                  },
                  {
                    label: "Short-Term Capital Gains (111A)",
                    val: capitalGainsSTCG,
                    set: setCapitalGainsSTCG,
                    icon: TrendingUp,
                    hint: "Equity held under 12 months",
                  },
                  {
                    label: "Interest Income (Savings & FDs)",
                    val: interestIncome,
                    set: setInterestIncome,
                    icon: CreditCard,
                    hint: "Bank savings & fixed deposits",
                  },
                  {
                    label: "Dividend Income",
                    val: dividendIncome,
                    set: setDividendIncome,
                    icon: IndianRupee,
                    hint: "Taxable equity dividends",
                  },
                  {
                    label: "Other Income (Gifts / VDA)",
                    val: otherIncome,
                    set: setOtherIncome,
                    icon: Sparkles,
                    hint: "Virtual Digital Assets & other sources",
                  },
                  {
                    label: "Foreign Income (Schedule FSI)",
                    val: foreignIncome,
                    set: setForeignIncome,
                    icon: Globe,
                    hint: "RSUs, foreign dividends & Sec 90",
                  },
                  {
                    label: "Exempt Income (Section 10)",
                    val: exemptIncome,
                    set: setExemptIncome,
                    icon: Award,
                    hint: "PPF & exempt sources (non-taxable)",
                  },
                ].map((f, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-[#18181b] border border-white/5 space-y-2"
                  >
                    <label className="text-xs font-semibold text-gray-200 flex items-center gap-2">
                      <f.icon className="w-4 h-4 text-emerald-400" /> {f.label}
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={f.val}
                      onChange={(e) => f.set(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-[#111111] border border-white/10 rounded-lg p-2.5 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
                    />
                    <p className="text-[10px] text-gray-400">{f.hint}</p>
                  </div>
                ))}

                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase">
                      Gross Total Income
                    </span>
                    <div className="text-2xl font-extrabold font-mono text-white mt-1">
                      ₹{grossIncome.toLocaleString("en-IN")}
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400">
                    Auto-aggregated across taxable heads.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-[#18181b] border border-white/5 space-y-2">
                  <label className="text-xs font-semibold text-gray-200">TDS Credited (26AS)</label>
                  <input
                    type="number"
                    min={0}
                    value={tdsPaid}
                    onChange={(e) => setTdsPaid(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-[#111111] border border-white/10 rounded-lg p-2.5 text-sm font-mono text-white"
                  />
                </div>
                <div className="p-4 rounded-xl bg-[#18181b] border border-white/5 space-y-2">
                  <label className="text-xs font-semibold text-gray-200">TCS Credited</label>
                  <input
                    type="number"
                    min={0}
                    value={tcsPaid}
                    onChange={(e) => setTcsPaid(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-[#111111] border border-white/10 rounded-lg p-2.5 text-sm font-mono text-white"
                  />
                </div>
                <div className="p-4 rounded-xl bg-[#18181b] border border-white/5 space-y-2">
                  <label className="text-xs font-semibold text-gray-200">Advance Tax Paid</label>
                  <input
                    type="number"
                    min={0}
                    value={advanceTaxPaid}
                    onChange={(e) => setAdvanceTaxPaid(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-[#111111] border border-white/10 rounded-lg p-2.5 text-sm font-mono text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {wizardStep === 2 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                  <Receipt className="w-4 h-4" /> 1. Section 80C Investments (Max ₹1,50,000)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  {[
                    { label: "ELSS Mutual Funds", val: elssAmount, set: setElssAmount },
                    { label: "PPF", val: ppfAmount, set: setPpfAmount },
                    { label: "EPF", val: epfAmount, set: setEpfAmount },
                    { label: "5-Year Tax Saver FD", val: taxSaverFdAmount, set: setTaxSaverFdAmount },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-[#18181b] border border-white/5 space-y-1"
                    >
                      <label className="text-[11px] text-gray-300">{item.label}</label>
                      <input
                        type="number"
                        min={0}
                        value={item.val}
                        onChange={(e) => item.set(Math.max(0, Number(e.target.value)))}
                        className="w-full bg-[#111111] border border-white/10 rounded-lg p-2 text-xs font-mono text-white"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> 2. Other Chapter VI-A Deductions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { label: "Section 80D (Health Insurance)", val: deduction80D, set: setDeduction80D },
                    { label: "Section 80CCD(1B) (NPS)", val: deduction80CCD1B, set: setDeduction80CCD1B },
                    { label: "Section 24(b) Home Loan Interest", val: housingLoanInterest, set: setHousingLoanInterest },
                    { label: "Section 80G (Donations)", val: deduction80G, set: setDeduction80G },
                    { label: "Section 80TTA (Savings Interest)", val: deduction80TTA, set: setDeduction80TTA },
                    { label: "Section 80E (Education Loan)", val: deduction80E, set: setDeduction80E },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-[#18181b] border border-white/5 space-y-2"
                    >
                      <label className="text-xs font-semibold text-gray-200">{item.label}</label>
                      <input
                        type="number"
                        min={0}
                        value={item.val}
                        onChange={(e) => item.set(Math.max(0, Number(e.target.value)))}
                        className="w-full bg-[#111111] border border-white/10 rounded-lg p-2.5 text-sm font-mono text-white"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                  <Calculator className="w-4 h-4" /> 3. Property &amp; Freelance Expenses
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-[#18181b] border border-white/5 space-y-2">
                    <label className="text-xs font-semibold text-gray-200">
                      Municipal Property Taxes Paid
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={municipalTaxes}
                      onChange={(e) => setMunicipalTaxes(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-[#111111] border border-white/10 rounded-lg p-2.5 text-sm font-mono text-white"
                    />
                  </div>
                  <div className="p-4 rounded-xl bg-[#18181b] border border-white/5 space-y-2">
                    <label className="text-xs font-semibold text-gray-200">
                      Freelance / Business Expenses
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={freelanceExpenses}
                      onChange={(e) => setFreelanceExpenses(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-[#111111] border border-white/10 rounded-lg p-2.5 text-sm font-mono text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {wizardStep === 3 && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between text-xs gap-4">
                <div>
                  <span className="font-bold text-emerald-400">
                    Break-even Deduction Analysis:
                  </span>
                  <p className="text-gray-300 mt-0.5">
                    Current Old Regime deductions:{" "}
                    <span className="font-mono font-bold text-emerald-400">
                      ₹{totalDeductionsOld.toLocaleString("en-IN")}
                    </span>{" "}
                    (benchmark ₹{breakEvenDeduction.toLocaleString("en-IN")}).
                  </p>
                </div>
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shrink-0">
                  {taxLiabilityNew <= taxLiabilityOld
                    ? "New Regime Saves More"
                    : "Old Regime Saves More"}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      Section 115BAC New Regime
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                      {selectedRegime === "new" ? "Selected" : "Click to Select"}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white">New Tax Regime (Default)</h3>
                  <div className="space-y-2 pt-2 border-t border-white/10 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Standard Deduction:</span>
                      <span className="font-mono font-bold text-white">₹75,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Net Taxable Income:</span>
                      <span className="font-mono font-bold text-white">
                        ₹{netTaxableIncomeNew.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-white/5 font-bold text-sm">
                      <span className="text-white">Total Tax Liability (+4% Cess):</span>
                      <span className="font-mono text-emerald-400">
                        ₹{taxLiabilityNew.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>

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
                      Old Tax Regime
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-gray-300 font-bold">
                      {selectedRegime === "old" ? "Selected" : "Click to Select"}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white">Old Tax Regime</h3>
                  <div className="space-y-2 pt-2 border-t border-white/10 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Deductions Claimed:</span>
                      <span className="font-mono font-bold text-white">
                        ₹{totalDeductionsOld.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Net Taxable Income:</span>
                      <span className="font-mono font-bold text-white">
                        ₹{netTaxableIncomeOld.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-white/5 font-bold text-sm">
                      <span className="text-white">Total Tax Liability (+4% Cess):</span>
                      <span className="font-mono text-white">
                        ₹{taxLiabilityOld.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {wizardStep === 4 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-[#18181b] border border-white/10 space-y-1">
                  <span className="text-xs text-gray-400">Gross Total Income</span>
                  <div className="text-xl font-bold font-mono text-white">
                    ₹{grossIncome.toLocaleString("en-IN")}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-[#18181b] border border-white/10 space-y-1">
                  <span className="text-xs text-gray-400">Final Tax Liability</span>
                  <div className="text-xl font-bold font-mono text-white">
                    ₹{finalTaxLiability.toLocaleString("en-IN")}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-[#18181b] border border-white/10 space-y-1">
                  <span className="text-xs text-gray-400">TDS / Advance Taxes</span>
                  <div className="text-xl font-bold font-mono text-emerald-400">
                    ₹{totalPrepaidTaxes.toLocaleString("en-IN")}
                  </div>
                </div>
                <div
                  className={`p-4 rounded-xl border space-y-1 ${
                    isRefund
                      ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-300"
                      : "bg-amber-950/30 border-amber-500/40 text-amber-300"
                  }`}
                >
                  <span className="text-xs font-semibold">
                    {isRefund ? "Net Tax Refund" : "Balance Tax Payable"}
                  </span>
                  <div className="text-2xl font-extrabold font-mono">
                    ₹{(isRefund ? refundAmount : payableAmount).toLocaleString("en-IN")}
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#141414] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> Return Draft Ready for
                    Persistence &amp; Approval
                  </h4>
                  <p className="text-xs text-gray-400">
                    Save your draft to Supabase or verify with 6-digit OTP to record submission.
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
                    <Send className="w-3.5 h-3.5 mr-1.5" /> Approve &amp; E-File Return
                  </Button>
                </div>
              </div>
            </div>
          )}

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
                disabled={savingDraft}
                onClick={handleSaveDraft}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-5 rounded-xl"
              >
                {savingDraft ? "Saving..." : "Save Draft Return"}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* REVIEW & APPROVAL VIEW */}
      {activeView === "review-approval" && (
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <span className="text-xs font-bold text-emerald-400 font-mono uppercase">
                Tax Return Review
              </span>
              <h2 className="text-xl font-bold text-white mt-0.5">
                {selectedReturn?.assessmentYear || "AY 2026-27"} Computation Summary Review
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Assessee: {taxpayerInfo.name} {taxpayerInfo.pan ? `• PAN: ${taxpayerInfo.pan}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  downloadItrVDocument({
                    ackNo: selectedReturn?.acknowledgeNumber || "DRAFT-PREVIEW",
                    ay: selectedReturn?.assessmentYear || "AY 2026-27",
                    form: selectedReturn?.itrType || "ITR-2",
                    pan: taxpayerInfo.pan,
                    taxpayer: taxpayerInfo.name,
                    timestamp: new Date().toLocaleString("en-IN"),
                    grossIncome,
                    taxLiability: finalTaxLiability,
                    prepaidTaxes: totalPrepaidTaxes,
                    refundDue: refundAmount,
                    taxPayable: payableAmount,
                    regime: selectedRegime,
                  })
                }
                className="border-white/10 text-xs"
              >
                <Download className="w-3.5 h-3.5 mr-1.5" /> Export Computation
              </Button>
              <Button
                onClick={() => setShowApprovalModal(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
              >
                <FileCheck className="w-3.5 h-3.5 mr-1.5" /> Approve &amp; E-File
              </Button>
            </div>
          </div>

          <div className="bg-[#18181b] p-6 rounded-2xl border border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-gray-400">Gross Total Income</span>
              <p className="font-mono font-bold text-white mt-1">
                ₹{grossIncome.toLocaleString("en-IN")}
              </p>
            </div>
            <div>
              <span className="text-gray-400">Tax Liability</span>
              <p className="font-mono font-bold text-white mt-1">
                ₹{finalTaxLiability.toLocaleString("en-IN")}
              </p>
            </div>
            <div>
              <span className="text-gray-400">Pre-Paid Taxes</span>
              <p className="font-mono font-bold text-emerald-400 mt-1">
                ₹{totalPrepaidTaxes.toLocaleString("en-IN")}
              </p>
            </div>
            <div>
              <span className="text-gray-400">{isRefund ? "Refund Due" : "Tax Payable"}</span>
              <p className="font-mono font-extrabold text-emerald-400 mt-1">
                ₹{(isRefund ? refundAmount : payableAmount).toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* HISTORY VIEW */}
      {activeView === "history" && (
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <span className="text-xs font-bold text-emerald-400 font-mono uppercase">
                Tax Return History
              </span>
              <h2 className="text-xl font-bold text-white mt-0.5">
                Filed Returns &amp; Verified Archives
              </h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const jsonBlob = new Blob([JSON.stringify(returnsList, null, 2)], {
                  type: "application/json",
                });
                const url = URL.createObjectURL(jsonBlob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "taxmate-returns-history.json";
                a.click();
                URL.revokeObjectURL(url);
                toast.success("Downloaded multi-year returns JSON summary.");
              }}
              className="border-white/10 text-xs text-gray-300 hover:text-white"
            >
              <FileDown className="w-3.5 h-3.5 mr-1.5" /> Export JSON Summary
            </Button>
          </div>

          {returnsList.filter((r) => r.eVerified).length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-8">
              No completed/e-verified returns recorded yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {returnsList
                .filter((r) => r.eVerified)
                .map((item) => (
                  <div
                    key={item.id}
                    className="p-5 rounded-2xl bg-[#18181b] border border-white/10 space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase">
                        {item.status}
                      </span>
                      <h3 className="font-bold text-base text-white">{item.assessmentYear}</h3>
                      <p className="text-xs text-emerald-400 font-semibold">{item.itrType}</p>
                      <p className="text-[11px] text-gray-400 font-mono">
                        Ack: {item.acknowledgeNumber}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() =>
                        downloadItrVDocument({
                          ackNo: item.acknowledgeNumber,
                          ay: item.assessmentYear,
                          form: item.itrType,
                          pan: item.pan || taxpayerInfo.pan,
                          taxpayer: item.taxpayerName || taxpayerInfo.name,
                          timestamp: item.filingDate || "Filed",
                          grossIncome: item.grossIncome,
                          taxLiability: item.taxAmount,
                          prepaidTaxes: item.prepaidTaxes,
                          refundDue: item.refundAmount,
                          taxPayable: Math.max(0, item.taxAmount - item.prepaidTaxes),
                          regime: item.regime,
                        })
                      }
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                    >
                      <Download className="w-3.5 h-3.5 mr-1" /> Download ITR-V
                    </Button>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* FILING RECEIPT VIEW */}
      {activeView === "filing-receipt" && filingReceiptData && (
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl max-w-3xl mx-auto">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-400 font-mono uppercase">
                  Filing Recorded
                </span>
                <h2 className="text-xl font-bold text-white">ITR-V Electronic Acknowledgement</h2>
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
                onClick={() => downloadItrVDocument(filingReceiptData)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
              >
                <Download className="w-3.5 h-3.5 mr-1" /> Download ITR-V
              </Button>
            </div>
          </div>

          <div className="bg-white text-black p-6 rounded-xl font-mono text-xs space-y-4">
            <div className="border-b-2 border-black pb-3 text-center">
              <h3 className="font-extrabold text-sm uppercase">
                TaxMate Electronic Filing Record [ITR-V]
              </h3>
              <p className="text-[10px] font-bold mt-1">
                {filingReceiptData.ay} • Form {filingReceiptData.form}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-[11px]">
              <div>
                <span className="text-gray-500">Acknowledgement Number:</span>
                <p className="font-extrabold text-sm">{filingReceiptData.ackNo}</p>
              </div>
              <div>
                <span className="text-gray-500">Timestamp:</span>
                <p className="font-bold">{filingReceiptData.timestamp}</p>
              </div>
              <div>
                <span className="text-gray-500">PAN:</span>
                <p className="font-bold">{filingReceiptData.pan}</p>
              </div>
              <div>
                <span className="text-gray-500">Assessee:</span>
                <p className="font-bold">{filingReceiptData.taxpayer}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RETURN DETAILS VIEW */}
      {activeView === "return-details" && selectedReturn && (
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <span className="text-xs font-bold text-emerald-400 font-mono uppercase">
                Tax Return Details
              </span>
              <h2 className="text-xl font-bold text-white mt-0.5">
                {selectedReturn.assessmentYear} Computation
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {!selectedReturn.eVerified && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveView("create-wizard")}
                  className="border-white/10 text-xs"
                >
                  Edit Computation
                </Button>
              )}
              <Button
                onClick={() =>
                  downloadItrVDocument({
                    ackNo: selectedReturn.acknowledgeNumber,
                    ay: selectedReturn.assessmentYear,
                    form: selectedReturn.itrType,
                    pan: selectedReturn.pan || taxpayerInfo.pan,
                    taxpayer: selectedReturn.taxpayerName || taxpayerInfo.name,
                    timestamp: selectedReturn.filingDate || new Date().toLocaleDateString("en-IN"),
                    grossIncome: selectedReturn.grossIncome,
                    taxLiability: selectedReturn.taxAmount,
                    prepaidTaxes: selectedReturn.prepaidTaxes,
                    refundDue: selectedReturn.refundAmount,
                    taxPayable: Math.max(
                      0,
                      selectedReturn.taxAmount - selectedReturn.prepaidTaxes
                    ),
                    regime: selectedReturn.regime,
                  })
                }
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
              >
                <Download className="w-4 h-4 mr-1.5" /> Download Summary
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-[#18181b] border border-white/5">
              <span className="text-gray-400">Form Type</span>
              <p className="font-bold text-white text-sm mt-1">{selectedReturn.itrType}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#18181b] border border-white/5">
              <span className="text-gray-400">Assigned Advisor</span>
              <p className="font-bold text-emerald-400 text-sm mt-1">
                {selectedReturn.caName || "CA Advisory"}
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#18181b] border border-white/5">
              <span className="text-gray-400">Status</span>
              <p className="font-bold text-amber-400 text-sm mt-1 uppercase">
                {selectedReturn.status}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* APPROVAL & E-VERIFICATION MODAL */}
      {showApprovalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#111111] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-5 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base">Tax Return Approval &amp; E-Verification</h3>
              </div>
              <button
                onClick={() => setShowApprovalModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-300">
              Enter your 6-digit EVC / Aadhaar verification OTP ({taxpayerInfo.phoneLast4}) to
              record your approved return submission in Supabase.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-300">
                Enter 6-digit Verification Code:
              </label>
              <input
                type="text"
                maxLength={6}
                placeholder="000000"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                className="w-full bg-[#18181b] border border-white/10 rounded-xl p-3 text-center text-lg font-mono tracking-widest text-emerald-400 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="p-3 bg-[#18181b] rounded-xl border border-white/5 text-[11px] text-gray-300 space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Tax Liability:</span>
                <span className="font-mono font-bold text-white">
                  ₹{finalTaxLiability.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">
                  {isRefund ? "Refund Credited:" : "Tax Payable:"}
                </span>
                <span className="font-mono font-bold text-emerald-400">
                  ₹{(isRefund ? refundAmount : payableAmount).toLocaleString("en-IN")}
                </span>
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
                onClick={handleSubmitEFile}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Submitting...
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
