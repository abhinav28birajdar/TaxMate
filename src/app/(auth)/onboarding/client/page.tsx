"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  User, 
  Briefcase, 
  Building, 
  Globe, 
  Camera, 
  ShieldCheck, 
  CreditCard, 
  FileText, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  UploadCloud, 
  Sparkles, 
  Phone, 
  Mail, 
  MapPin, 
  Check,
  Building2,
  Calendar,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function CustomerOnboardingWizardPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [customerType, setCustomerType] = useState<"salaried" | "freelancer" | "business" | "nri">("salaried");
  
  // Personal & Contact
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // ID & Bank
  const [pan, setPan] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [accountType, setAccountType] = useState("Savings Account");

  // Employment & Business
  const [employerName, setEmployerName] = useState("");
  const [designation, setDesignation] = useState("");
  const [annualCTC, setAnnualCTC] = useState("");
  const [gstin, setGstin] = useState("");

  // Tax Profile & Income Sources
  const [incomeSources, setIncomeSources] = useState({
    salary: true,
    freelance: false,
    rental: false,
    interest: false,
    dividend: false,
    capitalGains: false,
  });
  const [previousAYFiled, setPreviousAYFiled] = useState("AY 2025-26 (ITR-1)");
  const [prevAckNo, setPrevAckNo] = useState("");
  const [chosenRegime, setChosenRegime] = useState("New Regime (Sec 115BAC) - Standard ₹75k Deduction");

  // KYC Confirmation
  const [panConfirmed, setPanConfirmed] = useState(false);
  const [aadhaarConfirmed, setAadhaarConfirmed] = useState(false);
  const [bankConfirmed, setBankConfirmed] = useState(false);

  useEffect(() => {
    let active = true;
    async function hydrate() {
      try {
        const [profileRes, onboardingRes] = await Promise.all([
          fetch("/api/v1/profile"),
          fetch("/api/v1/onboarding"),
        ]);

        if (!active) return;

        if (profileRes.ok) {
          const profileJson = await profileRes.json();
          const u = profileJson?.data?.user;
          const p = profileJson?.data?.profile;
          if (p?.fullName || u?.name) setFullName((prev) => prev || p?.fullName || u?.name || "");
          if (u?.email) setEmail((prev) => prev || u.email);
          if (p?.phone) setPhone((prev) => prev || p.phone);
        }

        if (onboardingRes.ok) {
          const obJson = await onboardingRes.json();
          const ob = obJson?.data?.onboarding;
          const info = (ob?.basic_info || {}) as Record<string, any>;
          const prefs = (ob?.preferences || {}) as Record<string, any>;

          if (info.customerType) setCustomerType(info.customerType);
          if (info.fullName) setFullName(info.fullName);
          if (info.dob) setDob(info.dob);
          if (info.phone) setPhone(info.phone);
          if (info.addressLine) setAddressLine(info.addressLine);
          if (info.city) setCity(info.city);
          if (info.state) setState(info.state);
          if (info.pincode) setPincode(info.pincode);
          if (info.pan) {
            setPan(info.pan);
            setPanConfirmed(true);
          }
          if (info.aadhaar) {
            setAadhaar(info.aadhaar);
            setAadhaarConfirmed(true);
          }
          if (info.bankName) setBankName(info.bankName);
          if (info.accountNumber) {
            setAccountNumber(info.accountNumber);
            setBankConfirmed(true);
          }
          if (info.ifsc) setIfsc(info.ifsc);
          if (info.accountType) setAccountType(info.accountType);
          if (info.employerName) setEmployerName(info.employerName);
          if (info.designation) setDesignation(info.designation);
          if (info.annualCTC) setAnnualCTC(info.annualCTC);
          if (info.gstin) setGstin(info.gstin);

          if (prefs.incomeSources) setIncomeSources((prev) => ({ ...prev, ...prefs.incomeSources }));
          if (prefs.previousAYFiled) setPreviousAYFiled(prefs.previousAYFiled);
          if (prefs.prevAckNo) setPrevAckNo(prefs.prevAckNo);
          if (prefs.chosenRegime) setChosenRegime(prefs.chosenRegime);
        }
      } catch {
        // Non-blocking hydration
      } finally {
        if (active) setLoadingProfile(false);
      }
    }
    hydrate();
    return () => {
      active = false;
    };
  }, []);

  const handleFinish = async () => {
    if (!fullName.trim()) {
      toast.error("Please provide your full legal name before completing onboarding.");
      setCurrentStep(2);
      return;
    }

    setSubmitting(true);
    try {
      const selectedInterests = Object.entries(incomeSources)
        .filter(([, enabled]) => enabled)
        .map(([key]) => key);

      const profileRes = await fetch("/api/v1/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          phone: phone.trim() || undefined,
        }),
      });

      if (!profileRes.ok) {
        const err = await profileRes.json().catch(() => ({}));
        throw new Error(err?.message || "Failed to update profile");
      }

      const obRes = await fetch("/api/v1/onboarding", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step: 6,
          completed: true,
          interests: selectedInterests,
          basicInfo: {
            customerType,
            fullName: fullName.trim(),
            dob,
            email: email.trim(),
            phone: phone.trim(),
            addressLine,
            city,
            state,
            pincode,
            pan: pan.trim().toUpperCase(),
            aadhaar: aadhaar.trim(),
            bankName,
            accountNumber,
            ifsc: ifsc.trim().toUpperCase(),
            accountType,
            employerName,
            designation,
            annualCTC,
            gstin: gstin.trim().toUpperCase(),
          },
          preferences: {
            incomeSources,
            previousAYFiled,
            prevAckNo,
            chosenRegime,
            kycConfirmed: {
              pan: panConfirmed,
              aadhaar: aadhaarConfirmed,
              bank: bankConfirmed,
            },
          },
        }),
      });

      if (!obRes.ok) {
        const err = await obRes.json().catch(() => ({}));
        throw new Error(err?.message || "Failed to save onboarding details");
      }

      toast.success("Welcome to TaxMate! Your onboarding profile has been saved.");
      router.push("/portal/dashboard");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not complete onboarding.");
    } finally {
      setSubmitting(false);
    }
  };

  const stepsList = [
    { num: 1, label: "Customer Type" },
    { num: 2, label: "Personal & Address" },
    { num: 3, label: "PAN & Bank Details" },
    { num: 4, label: "Employment / Business" },
    { num: 5, label: "Tax Profile & Sources" },
    { num: 6, label: "KYC & Complete" },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white py-12 px-4 sm:px-6 relative overflow-hidden flex flex-col justify-center items-center">
      {/* Background orbs */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-20" />
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[350px] bg-emerald-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-2xl w-full bg-[#111111] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8 relative z-10">
        
        {/* Header with Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span className="font-mono text-emerald-400 font-bold uppercase tracking-wider">
              Step {currentStep} of 6: {stepsList[currentStep - 1].label}
            </span>
            <span className="text-gray-500 font-medium">Customer Onboarding</span>
          </div>
          <div className="w-full bg-[#1C1C1C] h-2 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-500 h-full transition-all duration-300 rounded-full"
              style={{ width: `${(currentStep / 6) * 100}%` }}
            />
          </div>
        </div>

        {/* STEP 1: Select Customer Type */}
        {currentStep === 1 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                Customer Welcome
              </span>
              <h2 className="text-2xl font-bold text-white mt-3">Welcome to TaxMate. Select your profile:</h2>
              <p className="text-xs text-gray-400 mt-1">We customize tax deductions and filing checklists based on your category.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              {[
                { id: "salaried", title: "Salaried Individual", desc: "Form 16 income, HRA, 80C deductions, and mutual fund capital gains.", icon: User },
                { id: "freelancer", title: "Freelancer / Consultant", desc: "Section 44ADA presumptive taxation, client invoices, and 194J TDS claims.", icon: Briefcase },
                { id: "business", title: "Business / MSME Owner", desc: "Pvt Ltd, LLP, Partnership turnover, GST returns, and corporate ITR-6.", icon: Building },
                { id: "nri", title: "Non-Resident Indian (NRI)", desc: "Schedule FA disclosures, DTAA Section 90/91 relief, and NRE/NRO taxation.", icon: Globe },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = customerType === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setCustomerType(item.id as any)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400 ring-1 ring-emerald-500/30"
                        : "bg-[#161616] border-white/5 text-gray-400 hover:border-white/20"
                    }`}
                  >
                    <div>
                      <Icon className="w-6 h-6 mb-2 text-emerald-400" />
                      <h4 className="font-bold text-sm text-white">{item.title}</h4>
                      <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={() => setCurrentStep(2)} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-xl px-5">
                Next: Personal & Contact <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* STEP 2: Personal Information & Address */}
        {currentStep === 2 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-white">Personal Information & Address</h2>
              <p className="text-xs text-gray-400 mt-0.5">Please ensure name matches your Government identification documents.</p>
            </div>

            {/* Profile Photo Upload */}
            <div className="flex items-center gap-4 py-1">
              <div className="w-16 h-16 rounded-2xl bg-[#1A1A1A] border border-white/10 flex items-center justify-center text-gray-400 relative overflow-hidden">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-6 h-6 text-emerald-400" />
                )}
              </div>
              <div>
                <label className="inline-flex items-center justify-center px-3 py-1.5 text-xs border border-white/10 text-gray-300 rounded-xl cursor-pointer hover:bg-white/5 transition">
                  Upload Profile Photo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 5 * 1024 * 1024) {
                        toast.error("Please select an image smaller than 5MB.");
                        return;
                      }
                      setAvatarPreview(URL.createObjectURL(file));
                      toast.success("Profile photo selected!");
                    }}
                  />
                </label>
                <p className="text-[10px] text-gray-500 mt-1">JPEG or PNG format up to 5MB</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-gray-300 font-medium block mb-1">Full Legal Name (as per PAN) *</label>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-gray-300 font-medium block mb-1">Date of Birth *</label>
                <input 
                  type="date" 
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="text-gray-300 font-medium block mb-1">Email Address (Verified) *</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-gray-300 font-medium block mb-1">Phone Number (OTP Verified) *</label>
                <input 
                  type="text" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-gray-300 font-medium block mb-1">Residential Street Address</label>
                <input 
                  type="text" 
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-gray-300 font-medium block mb-1">City & State</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-1/2 bg-[#181818] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                  <input 
                    type="text" 
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-1/2 bg-[#181818] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-300 font-medium block mb-1">Pincode</label>
                <input 
                  type="text" 
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={() => setCurrentStep(1)} className="text-xs text-gray-400">Back</Button>
              <Button onClick={() => setCurrentStep(3)} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-xl px-5">
                Next: PAN & Bank Details <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: PAN, Aadhaar & Bank Details */}
        {currentStep === 3 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-white">PAN, Aadhaar & Refund Bank Details</h2>
              <p className="text-xs text-gray-400 mt-0.5">Required for ITD e-filing authorization and instant tax refunds.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-gray-300 font-medium block mb-1">Permanent Account Number (PAN) *</label>
                <input 
                  type="text" 
                  value={pan}
                  onChange={(e) => setPan(e.target.value.toUpperCase())}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl p-2.5 text-white font-mono uppercase focus:outline-none focus:border-emerald-500"
                />
                <span className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> NSDL Verified Assessee Record
                </span>
              </div>

              <div>
                <label className="text-gray-300 font-medium block mb-1">Aadhaar Number (e-KYC) *</label>
                <input 
                  type="text" 
                  value={aadhaar}
                  onChange={(e) => setAadhaar(e.target.value)}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
                <span className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> UIDAI Linked & Authenticated
                </span>
              </div>

              <div>
                <label className="text-gray-300 font-medium block mb-1">Bank Name</label>
                <input 
                  type="text" 
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-gray-300 font-medium block mb-1">Bank Account Number</label>
                <input 
                  type="text" 
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-gray-300 font-medium block mb-1">IFSC Code</label>
                <input 
                  type="text" 
                  value={ifsc}
                  onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl p-2.5 text-white font-mono uppercase focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-gray-300 font-medium block mb-1">Account Type</label>
                <select 
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value)}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option>Savings Account</option>
                  <option>Current Account</option>
                  <option>NRE / NRO Account</option>
                </select>
              </div>
            </div>

            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[11px] text-emerald-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
              Pre-validated for direct income tax refunds into this account via RBI NEFT/RTGS gateway.
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={() => setCurrentStep(2)} className="text-xs text-gray-400">Back</Button>
              <Button onClick={() => setCurrentStep(4)} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-xl px-5">
                Next: Employment & Business <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* STEP 4: Employment & Business Information */}
        {currentStep === 4 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-white">Employment & Business Information</h2>
              <p className="text-xs text-gray-400 mt-0.5">Captures employer details, TAN, or business GSTIN for Form 16 reconciliation.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div>
                <label className="text-gray-300 font-medium block mb-1">Employer / Entity Legal Name</label>
                <input 
                  type="text" 
                  value={employerName}
                  onChange={(e) => setEmployerName(e.target.value)}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-gray-300 font-medium block mb-1">Designation / Nature of Profession</label>
                <input 
                  type="text" 
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-gray-300 font-medium block mb-1">Estimated Annual CTC / Gross Receipts</label>
                <input 
                  type="text" 
                  value={annualCTC}
                  onChange={(e) => setAnnualCTC(e.target.value)}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-gray-300 font-medium block mb-1">GSTIN (Optional for Salaried)</label>
                <input 
                  type="text" 
                  placeholder="27AAACT1234F1Z5"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value.toUpperCase())}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl p-2.5 text-white font-mono uppercase focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={() => setCurrentStep(3)} className="text-xs text-gray-400">Back</Button>
              <Button onClick={() => setCurrentStep(5)} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-xl px-5">
                Next: Tax Profile & Sources <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* STEP 5: Tax Profile & Income Sources */}
        {currentStep === 5 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-white">Tax Profile, Sources & Prior Filings</h2>
              <p className="text-xs text-gray-400 mt-0.5">Select all heads of income applicable to your financial year.</p>
            </div>

            <div className="space-y-3">
              <label className="text-xs text-gray-300 font-medium block">Active Income Heads (Tick all that apply):</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {[
                  { key: "salary", label: "Salary & Allowances" },
                  { key: "freelance", label: "Freelance & Consulting" },
                  { key: "rental", label: "Rental House Property" },
                  { key: "interest", label: "Savings / FD Interest" },
                  { key: "dividend", label: "Stock Dividends" },
                  { key: "capitalGains", label: "Equities / Crypto Gains" },
                ].map((s) => (
                  <label 
                    key={s.key}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                      (incomeSources as any)[s.key]
                        ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                        : "bg-[#181818] border-white/5 text-gray-400 hover:border-white/20"
                    }`}
                  >
                    <input 
                      type="checkbox" 
                      checked={(incomeSources as any)[s.key]}
                      onChange={(e) => setIncomeSources({ ...incomeSources, [s.key]: e.target.checked })}
                      className="accent-emerald-500 rounded" 
                    />
                    <span className="font-semibold text-[11px]">{s.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
              <div>
                <label className="text-gray-300 font-medium block mb-1">Previous Year Return Filed</label>
                <input 
                  type="text" 
                  value={previousAYFiled}
                  onChange={(e) => setPreviousAYFiled(e.target.value)}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-gray-300 font-medium block mb-1">Previous Acknowledgement Number</label>
                <input 
                  type="text" 
                  value={prevAckNo}
                  onChange={(e) => setPrevAckNo(e.target.value)}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-gray-300 font-medium block mb-1">Preferred Tax Regime</label>
                <select 
                  value={chosenRegime}
                  onChange={(e) => setChosenRegime(e.target.value)}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option>New Regime (Sec 115BAC) - Standard ₹75k Deduction</option>
                  <option>Old Regime (With Section 80C, 80D & HRA)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={() => setCurrentStep(4)} className="text-xs text-gray-400">Back</Button>
              <Button onClick={() => setCurrentStep(6)} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-xl px-5">
                Next: KYC Verification <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* STEP 6: KYC Confirmation & Onboarding Complete */}
        {currentStep === 6 && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">KYC Confirmation & Profile Review</h2>
              <p className="text-xs text-gray-400 mt-0.5">Verify your submitted tax identity details before opening your portal. You can upload supporting documents in the Vault at any time.</p>
            </div>

            {loadingProfile ? (
              <div className="p-6 rounded-xl bg-[#181818] border border-white/5 flex items-center justify-center gap-2 text-xs text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" /> Loading saved profile...
              </div>
            ) : (
              <div className="space-y-2.5 text-xs">
                <button
                  type="button"
                  onClick={() => setPanConfirmed((prev) => !prev)}
                  className="w-full text-left p-3.5 rounded-xl bg-[#181818] border border-white/10 hover:border-emerald-500/30 flex items-center justify-between transition"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-emerald-400" />
                    <div>
                      <div className="font-semibold text-white">PAN Identity Details</div>
                      <div className="text-[10px] text-gray-400">
                        {pan ? `${pan.toUpperCase()} • Ready for e-Filing verification` : "No PAN entered yet (click to confirm deferred entry)"}
                      </div>
                    </div>
                  </div>
                  <span className={`font-bold text-[10px] px-2.5 py-0.5 rounded-full border ${panConfirmed || pan ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "text-amber-400 bg-amber-500/10 border-amber-500/20"}`}>
                    {panConfirmed ? "CONFIRMED" : pan ? "PROVIDED" : "OPTIONAL"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setAadhaarConfirmed((prev) => !prev)}
                  className="w-full text-left p-3.5 rounded-xl bg-[#181818] border border-white/10 hover:border-emerald-500/30 flex items-center justify-between transition"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-emerald-400" />
                    <div>
                      <div className="font-semibold text-white">Aadhaar Reference</div>
                      <div className="text-[10px] text-gray-400">
                        {aadhaar ? `Ending ${aadhaar.slice(-4)} • Required for Aadhaar OTP e-Verify` : "Can be linked later during ITR verification"}
                      </div>
                    </div>
                  </div>
                  <span className={`font-bold text-[10px] px-2.5 py-0.5 rounded-full border ${aadhaarConfirmed || aadhaar ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "text-amber-400 bg-amber-500/10 border-amber-500/20"}`}>
                    {aadhaarConfirmed ? "CONFIRMED" : aadhaar ? "PROVIDED" : "OPTIONAL"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setBankConfirmed((prev) => !prev)}
                  className="w-full text-left p-3.5 rounded-xl bg-[#181818] border border-white/10 hover:border-emerald-500/30 flex items-center justify-between transition"
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-emerald-400" />
                    <div>
                      <div className="font-semibold text-white">Refund Bank Account</div>
                      <div className="text-[10px] text-gray-400">
                        {bankName ? `${bankName}${accountNumber ? ` • A/C ending ${accountNumber.slice(-4)}` : ""}` : "Add refund account details anytime in Settings"}
                      </div>
                    </div>
                  </div>
                  <span className={`font-bold text-[10px] px-2.5 py-0.5 rounded-full border ${bankConfirmed || (bankName && accountNumber) ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "text-amber-400 bg-amber-500/10 border-amber-500/20"}`}>
                    {bankConfirmed ? "CONFIRMED" : bankName && accountNumber ? "PROVIDED" : "OPTIONAL"}
                  </span>
                </button>
              </div>
            )}

            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-xs space-y-1">
              <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> Ready for TaxMate Client Portal
              </div>
              <p className="text-emerald-300 text-[11px] leading-relaxed">
                {fullName ? `${fullName}'s profile` : "Your tax profile"} will be persisted to Supabase and made available to your assigned Chartered Accountant.
              </p>
            </div>

            <div className="flex justify-between pt-2">
              <Button variant="ghost" onClick={() => setCurrentStep(5)} disabled={submitting} className="text-xs text-gray-400">Back</Button>
              <Button onClick={handleFinish} disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl px-6 shadow-[0_0_20px_rgba(5,150,105,0.4)]">
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Saving Profile...
                  </>
                ) : (
                  <>
                    Complete Onboarding & Open Dashboard <ArrowRight className="w-4 h-4 ml-1.5" />
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
