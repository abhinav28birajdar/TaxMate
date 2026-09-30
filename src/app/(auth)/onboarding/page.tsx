"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  CheckCircle2, 
  User, 
  Briefcase, 
  Building, 
  ShieldCheck, 
  ArrowRight, 
  UploadCloud, 
  FileCheck, 
  Sparkles,
  Phone,
  Mail,
  CreditCard,
  Camera
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function UnifiedOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [role, setRole] = useState<"customer" | "ca">("customer");
  
  // Profile Info
  const [fullName, setFullName] = useState("Abhinav Birajdar");
  const [phone, setPhone] = useState("+91 98210 98210");
  const [pan, setPan] = useState("ABCDE1234F");
  const [aadhaar, setAadhaar] = useState("•••• •••• 9012");
  const [acceptedTerms, setAcceptedTerms] = useState(true);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const handleFinishOnboarding = () => {
    toast.success("KYC verified & profile configured!");
    if (role === "ca") {
      router.push("/ca/dashboard");
    } else {
      router.push("/client/dashboard");
    }
  };

  return (
    <div className="bg-[#111111] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
      {/* Progress header */}
      <div>
        <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
          <span>Step {step} of 4</span>
          <span className="text-emerald-400 font-bold">
            {step === 1 && "Account Type"}
            {step === 2 && "Profile & Photo"}
            {step === 3 && "Tax & KYC Verification"}
            {step === 4 && "Onboarding Complete"}
          </span>
        </div>
        <div className="w-full bg-[#1F1F1F] h-1.5 rounded-full overflow-hidden">
          <div 
            className="bg-emerald-500 h-full transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Step 1: Select Account Type */}
      {step === 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-white">Select Account Type</h2>
            <p className="text-xs text-gray-400 mt-1">Choose how you will be using TaxMate</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div 
              onClick={() => setRole("customer")}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                role === "customer"
                  ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400 ring-1 ring-emerald-500/20"
                  : "bg-[#181818] border-white/5 text-gray-400 hover:border-white/20"
              }`}
            >
              <User className="w-7 h-7 text-emerald-400 mb-2" />
              <div className="font-bold text-sm text-white">Customer / Taxpayer</div>
              <p className="text-xs text-gray-400 mt-1">File ITR, store Form 16, and consult verified CAs.</p>
            </div>

            <div 
              onClick={() => setRole("ca")}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                role === "ca"
                  ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400 ring-1 ring-emerald-500/20"
                  : "bg-[#181818] border-white/5 text-gray-400 hover:border-white/20"
              }`}
            >
              <Briefcase className="w-7 h-7 text-emerald-400 mb-2" />
              <div className="font-bold text-sm text-white">CA / Accountant</div>
              <p className="text-xs text-gray-400 mt-1">Manage client portfolios, GST/ITR filings & consultations.</p>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={() => setStep(2)} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-xl">
              Continue <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </motion.div>
      )}

      {/* Step 2: Complete Profile & Photo */}
      {step === 2 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-white">Complete Profile</h2>
            <p className="text-xs text-gray-400 mt-1">Enter your personal contact details and upload profile photo</p>
          </div>

          <div className="flex items-center gap-4 py-2">
            <div className="w-16 h-16 rounded-2xl bg-[#1A1A1A] border border-white/10 flex items-center justify-center text-gray-400 relative overflow-hidden">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
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
                Upload Photo
              </Button>
              <p className="text-[10px] text-gray-500 mt-1">JPEG, PNG up to 5MB</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-300 font-medium">Full Legal Name</label>
              <input 
                type="text" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white mt-1 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-300 font-medium">Phone Number (OTP Verified)</label>
              <input 
                type="text" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white mt-1 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="ghost" onClick={() => setStep(1)} className="text-xs text-gray-400">Back</Button>
            <Button onClick={() => setStep(3)} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-xl">
              Next: Tax & KYC <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </motion.div>
      )}

      {/* Step 3: Tax Profile & KYC Verification */}
      {step === 3 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-white">KYC & Tax Verification</h2>
            <p className="text-xs text-gray-400 mt-1">Required for Income Tax Department (ITD) e-Filing integration</p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-300 font-medium">Permanent Account Number (PAN)</label>
              <input 
                type="text" 
                value={pan}
                onChange={(e) => setPan(e.target.value.toUpperCase())}
                className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white mt-1 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="text-xs text-gray-300 font-medium">Aadhaar Number (e-KYC)</label>
              <input 
                type="text" 
                value={aadhaar}
                onChange={(e) => setAadhaar(e.target.value)}
                className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white mt-1 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Direct integration with NSDL & UIDAI for automated cryptographic verification.</span>
            </div>

            <label className="flex items-start gap-2 pt-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-0.5 accent-emerald-500" 
              />
              <span className="text-xs text-gray-400">
                I accept the <Link href="/terms" className="text-emerald-400 hover:underline">Terms & Conditions</Link> and <Link href="/privacy" className="text-emerald-400 hover:underline">Privacy Policy</Link>.
              </span>
            </label>
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="ghost" onClick={() => setStep(2)} className="text-xs text-gray-400">Back</Button>
            <Button 
              onClick={() => {
                if (!acceptedTerms) {
                  toast.error("Please accept the Terms & Conditions.");
                  return;
                }
                setStep(4);
              }} 
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-xl"
            >
              Verify & Complete <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </motion.div>
      )}

      {/* Step 4: Onboarding Complete */}
      {step === 4 && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-5 text-center py-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.3)]">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              Identity Verified
            </span>
            <h2 className="text-2xl font-bold text-white mt-2">Onboarding Complete!</h2>
            <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
              Welcome to TaxMate, {fullName}. Your profile has been initialized with full PAN-Aadhaar verification.
            </p>
          </div>

          <div className="bg-[#181818] p-4 rounded-xl border border-white/5 max-w-xs mx-auto text-left text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-gray-400">Account Type:</span>
              <span className="text-white font-medium capitalize">{role === "ca" ? "Chartered Accountant" : "Customer / Individual"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">PAN Status:</span>
              <span className="text-emerald-400 font-mono font-medium">VERIFIED (NSDL)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Security Vault:</span>
              <span className="text-emerald-400 font-medium">AES-256 Enabled</span>
            </div>
          </div>

          <div className="pt-2">
            <Button 
              onClick={handleFinishOnboarding}
              className="w-full max-w-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-2.5 rounded-xl shadow-[0_0_20px_rgba(5,150,105,0.4)]"
            >
              Go to {role === "ca" ? "CA Dashboard" : "Customer Dashboard"} <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
