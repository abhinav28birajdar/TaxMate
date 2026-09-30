"use client";

import React, { useState } from "react";
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
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function CustomerOnboardingWizardPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);

  // Form states
  const [customerType, setCustomerType] = useState<"salaried" | "freelancer" | "business" | "nri">("salaried");
  
  // Personal & Contact
  const [fullName, setFullName] = useState("Abhinav Birajdar");
  const [dob, setDob] = useState("1994-05-15");
  const [email, setEmail] = useState("abhinav@example.com");
  const [phone, setPhone] = useState("+91 98210 98210");
  const [addressLine, setAddressLine] = useState("Flat 402, Lotus Residency");
  const [city, setCity] = useState("Pune");
  const [state, setState] = useState("Maharashtra");
  const [pincode, setPincode] = useState("411038");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // ID & Bank
  const [pan, setPan] = useState("AAACT1234F");
  const [aadhaar, setAadhaar] = useState("•••• •••• 8912");
  const [bankName, setBankName] = useState("HDFC Bank Ltd");
  const [accountNumber, setAccountNumber] = useState("50100291823901");
  const [ifsc, setIfsc] = useState("HDFC0001234");
  const [accountType, setAccountType] = useState("Savings Account");

  // Employment & Business
  const [employerName, setEmployerName] = useState("TechNova Solutions Pvt Ltd");
  const [designation, setDesignation] = useState("Senior Engineering Lead");
  const [annualCTC, setAnnualCTC] = useState("₹24,50,000");
  const [gstin, setGstin] = useState("");

  // Tax Profile & Income Sources
  const [incomeSources, setIncomeSources] = useState({
    salary: true,
    freelance: false,
    rental: false,
    interest: true,
    dividend: true,
    capitalGains: true,
  });
  const [previousAYFiled, setPreviousAYFiled] = useState("AY 2025-26 (ITR-1)");
  const [prevAckNo, setPrevAckNo] = useState("ACK-2025-991823");
  const [chosenRegime, setChosenRegime] = useState("New Regime (Sec 115BAC)");

  // KYC Uploads
  const [panUploaded, setPanUploaded] = useState(true);
  const [aadhaarUploaded, setAadhaarUploaded] = useState(true);
  const [chequeUploaded, setChequeUploaded] = useState(true);

  const handleFinish = () => {
    toast.success("Welcome to TaxMate! Customer onboarding successfully completed.");
    router.push("/client/dashboard");
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
                <Button 
                  onClick={() => {
                    setAvatarPreview("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop");
                    toast.success("Profile photo uploaded!");
                  }}
                  variant="outline" 
                  size="sm" 
                  className="text-xs border-white/10 text-gray-300 rounded-xl"
                >
                  Upload Profile Photo
                </Button>
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

        {/* STEP 6: KYC Upload & Onboarding Complete */}
        {currentStep === 6 && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">KYC Upload & Verification Review</h2>
              <p className="text-xs text-gray-400 mt-0.5">Automated OCR cross-reference with Income Tax Department records.</p>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3.5 rounded-xl bg-[#181818] border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-emerald-400" />
                  <div>
                    <div className="font-semibold text-white">PAN Card Original Copy</div>
                    <div className="text-[10px] text-gray-400">AAACT1234F • Cryptographic checksum OK</div>
                  </div>
                </div>
                <span className="text-emerald-400 font-bold text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  VERIFIED
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#181818] border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-emerald-400" />
                  <div>
                    <div className="font-semibold text-white">Aadhaar e-KYC Offline XML</div>
                    <div className="text-[10px] text-gray-400">UIDAI timestamped • Demographic match 100%</div>
                  </div>
                </div>
                <span className="text-emerald-400 font-bold text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  VERIFIED
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#181818] border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-emerald-400" />
                  <div>
                    <div className="font-semibold text-white">HDFC Bank Cancelled Cheque</div>
                    <div className="text-[10px] text-gray-400">Penny-drop verified with account holder name</div>
                  </div>
                </div>
                <span className="text-emerald-400 font-bold text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  VERIFIED
                </span>
              </div>
            </div>

            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-xs space-y-1">
              <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> Ready for Automated ITR-1 / ITR-2 Filings
              </div>
              <p className="text-emerald-300 text-[11px] leading-relaxed">
                Your profile is 100% complete and verified. A dedicated Chartered Accountant has been mapped to your docket.
              </p>
            </div>

            <div className="flex justify-between pt-2">
              <Button variant="ghost" onClick={() => setCurrentStep(5)} className="text-xs text-gray-400">Back</Button>
              <Button onClick={handleFinish} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl px-6 shadow-[0_0_20px_rgba(5,150,105,0.4)]">
                Complete Onboarding & Open Dashboard <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
