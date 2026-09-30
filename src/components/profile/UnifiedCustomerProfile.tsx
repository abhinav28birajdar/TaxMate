"use client";

import React, { useState } from "react";
import { 
  User, 
  Save, 
  ShieldCheck, 
  Building2, 
  CreditCard, 
  Camera, 
  MapPin, 
  Phone, 
  Mail, 
  Users, 
  FileCheck, 
  Sparkles, 
  CheckCircle2, 
  Edit3, 
  Check, 
  UploadCloud, 
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";

export function UnifiedCustomerProfile() {
  const [activeTab, setActiveTab] = useState<"personal" | "tax" | "bank" | "dependents" | "kyc">("personal");
  const [isEditing, setIsEditing] = useState(false);

  // Profile data
  const [formData, setFormData] = useState({
    fullName: "Abhinav Birajdar",
    dob: "1994-05-15",
    gender: "Male",
    phone: "+91 98210 98210",
    email: "abhinav@example.com",
    addressLine1: "Flat 402, Lotus Grand Residency",
    city: "Pune",
    state: "Maharashtra",
    pincode: "411038",
    pan: "AAACT1234F",
    aadhaar: "•••• •••• 8912",
    gstin: "27AAACT1234F1Z5",
    entityName: "TechNova Solutions Pvt Ltd",
    entityType: "Private Limited",
    taxRegime: "New Regime (Sec 115BAC)",
    bankName: "HDFC Bank Ltd",
    accountNumber: "50100291823901",
    ifsc: "HDFC0001234",
    accountType: "Current Account",
  });

  const [dependents, setDependents] = useState([
    { name: "Pooja Birajdar", relation: "Spouse", dob: "1996-08-20", pan: "BZXPB8812M", covered80D: true },
    { name: "Ramesh Birajdar", relation: "Father (Senior Citizen)", dob: "1958-03-12", pan: "ARVPB1902K", covered80D: true },
  ]);

  const profileCompletion = 90;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    toast.success("Profile and Tax Information updated successfully!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <User className="w-4 h-4" /> Module 2: Customer Profile & KYC
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            My Taxpayer Profile
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Manage your personal, business, family dependents, and ITD e-filing master data.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            onClick={() => setIsEditing(!isEditing)}
            variant={isEditing ? "default" : "outline"}
            className={isEditing 
              ? "bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-xl"
              : "border-white/10 text-gray-300 hover:bg-white/5 text-xs rounded-xl"
            }
          >
            <Edit3 className="w-3.5 h-3.5 mr-1.5" /> {isEditing ? "Editing Mode" : "Edit Profile"}
          </Button>
        </div>
      </div>

      {/* Profile Card & Completion Banner */}
      <div className="bg-[#111111] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop" 
                alt="Avatar"
                className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              />
              <button 
                onClick={() => toast.success("Photo upload triggered")}
                className="absolute -bottom-2 -right-2 bg-emerald-600 hover:bg-emerald-700 text-white p-1.5 rounded-full shadow-md transition-colors"
                title="Change Photo"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">{formData.fullName}</h2>
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  KYC Verified
                </span>
              </div>
              <p className="text-xs text-gray-400">
                PAN: <span className="font-mono text-gray-200">{formData.pan}</span> • Aadhaar: <span className="font-mono text-gray-200">{formData.aadhaar}</span>
              </p>
              <p className="text-xs text-gray-400">
                {formData.email} • {formData.phone}
              </p>
            </div>
          </div>

          {/* Profile Completion Meter */}
          <div className="bg-[#181818] border border-white/5 rounded-2xl p-4 min-w-[220px]">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="text-gray-400 font-medium">Profile Completion</span>
              <span className="text-emerald-400 font-bold">{profileCompletion}%</span>
            </div>
            <div className="w-full bg-[#111111] h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${profileCompletion}%` }} />
            </div>
            <p className="text-[10px] text-gray-500 mt-2">Add Secondary Demat A/C to reach 100%</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-white/10 flex items-center gap-2 overflow-x-auto scrollbar-thin">
        {[
          { id: "personal", label: "Personal & Address", icon: User },
          { id: "tax", label: "Tax & Business", icon: Building2 },
          { id: "bank", label: "Bank Accounts", icon: CreditCard },
          { id: "dependents", label: "Family & Dependents", icon: Users },
          { id: "kyc", label: "KYC Documents", icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`whitespace-nowrap px-4 py-2.5 rounded-t-xl text-xs font-medium flex items-center gap-2 transition-all ${
                activeTab === tab.id
                  ? "bg-[#111111] text-emerald-400 border-t-2 border-emerald-500 font-semibold"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content Form Container */}
      <form onSubmit={handleSave} className="bg-[#111111] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
        {/* Tab 1: Personal & Address */}
        {activeTab === "personal" && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white border-b border-white/10 pb-3">
              Personal Information & Residential Address
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-gray-300 font-medium mb-1">Full Legal Name</label>
                <input 
                  type="text" 
                  disabled={!isEditing}
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl p-2.5 text-white disabled:opacity-60 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">Date of Birth</label>
                <input 
                  type="date" 
                  disabled={!isEditing}
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl p-2.5 text-white disabled:opacity-60 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">Contact Email</label>
                <input 
                  type="email" 
                  disabled={!isEditing}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl p-2.5 text-white disabled:opacity-60 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">Phone Number</label>
                <input 
                  type="text" 
                  disabled={!isEditing}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl p-2.5 text-white disabled:opacity-60 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-gray-300 font-medium mb-1">Street Address</label>
                <input 
                  type="text" 
                  disabled={!isEditing}
                  value={formData.addressLine1}
                  onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl p-2.5 text-white disabled:opacity-60 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">City</label>
                <input 
                  type="text" 
                  disabled={!isEditing}
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl p-2.5 text-white disabled:opacity-60 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">State & Pincode</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    disabled={!isEditing}
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-2/3 bg-[#181818] border border-white/10 rounded-xl p-2.5 text-white disabled:opacity-60 focus:outline-none focus:border-emerald-500"
                  />
                  <input 
                    type="text" 
                    disabled={!isEditing}
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    className="w-1/3 bg-[#181818] border border-white/10 rounded-xl p-2.5 text-white disabled:opacity-60 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Tax & Business */}
        {activeTab === "tax" && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white border-b border-white/10 pb-3">
              Tax Regime & Business Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-gray-300 font-medium mb-1">Permanent Account Number (PAN)</label>
                <input 
                  type="text" 
                  disabled
                  value={formData.pan}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl p-2.5 text-white opacity-70 font-mono"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">Default Tax Regime</label>
                <select 
                  disabled={!isEditing}
                  value={formData.taxRegime}
                  onChange={(e) => setFormData({ ...formData, taxRegime: e.target.value })}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl p-2.5 text-white disabled:opacity-60 focus:outline-none focus:border-emerald-500"
                >
                  <option value="New Regime (Sec 115BAC)">New Regime (Sec 115BAC) - Standard</option>
                  <option value="Old Regime">Old Regime (With 80C/80D/HRA)</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">Business Entity Name</label>
                <input 
                  type="text" 
                  disabled={!isEditing}
                  value={formData.entityName}
                  onChange={(e) => setFormData({ ...formData, entityName: e.target.value })}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl p-2.5 text-white disabled:opacity-60 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">GSTIN (if applicable)</label>
                <input 
                  type="text" 
                  disabled={!isEditing}
                  value={formData.gstin}
                  onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl p-2.5 text-white disabled:opacity-60 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">Employer / Company Name</label>
                <input 
                  type="text" 
                  disabled={!isEditing}
                  defaultValue="TechNova Solutions Pvt Ltd"
                  className="w-full bg-[#181818] border border-white/10 rounded-xl p-2.5 text-white disabled:opacity-60 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">Designation & Employment Type</label>
                <input 
                  type="text" 
                  disabled={!isEditing}
                  defaultValue="Senior Engineering Lead (Full-Time Salaried)"
                  className="w-full bg-[#181818] border border-white/10 rounded-xl p-2.5 text-white disabled:opacity-60 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <label className="block text-gray-300 font-medium text-xs">Active Income Sources (FY 2026-27):</label>
              <div className="flex flex-wrap gap-2 text-xs">
                {["Salary & Form 16", "Mutual Fund Capital Gains", "Savings & FD Interest", "Stock Dividends", "House Property Rental"].map((src, i) => (
                  <span key={i} className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-emerald-400 flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> {src}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Bank Accounts */}
        {activeTab === "bank" && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white border-b border-white/10 pb-3">
              Refund Primary Bank Account
            </h3>
            <p className="text-xs text-gray-400">
              Income tax refunds will be directly credited to this pre-validated account by CPC Bangalore.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-gray-300 font-medium mb-1">Bank Name</label>
                <input 
                  type="text" 
                  disabled={!isEditing}
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl p-2.5 text-white disabled:opacity-60 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">Account Number</label>
                <input 
                  type="text" 
                  disabled={!isEditing}
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl p-2.5 text-white disabled:opacity-60 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">IFSC Code</label>
                <input 
                  type="text" 
                  disabled={!isEditing}
                  value={formData.ifsc}
                  onChange={(e) => setFormData({ ...formData, ifsc: e.target.value })}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl p-2.5 text-white disabled:opacity-60 focus:outline-none focus:border-emerald-500 font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">Account Type</label>
                <input 
                  type="text" 
                  disabled={!isEditing}
                  value={formData.accountType}
                  onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl p-2.5 text-white disabled:opacity-60 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Family & Dependents */}
        {activeTab === "dependents" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-sm font-semibold text-white">Family / Dependent Members</h3>
                <p className="text-xs text-gray-400">Used for calculating Section 80D medical insurance deduction limits.</p>
              </div>
              <Button 
                type="button"
                onClick={() => toast.success("Added new dependent row.")}
                size="sm" 
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-xl"
              >
                Add Family Member
              </Button>
            </div>

            <div className="space-y-3">
              {dependents.map((dep, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-[#181818] border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-bold text-white text-sm">{dep.name}</div>
                    <div className="text-gray-400">{dep.relation} • PAN: <span className="font-mono text-gray-200">{dep.pan}</span></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                      Sec 80D Eligible
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: KYC Documents */}
        {activeTab === "kyc" && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white border-b border-white/10 pb-3">
              Identity Verification & KYC Documents
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#181818] border border-white/5 space-y-2 text-xs">
                <span className="text-gray-400 font-medium">PAN Card</span>
                <div className="font-bold text-white">PAN_Original_Scan.pdf</div>
                <div className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified by NSDL
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#181818] border border-white/5 space-y-2 text-xs">
                <span className="text-gray-400 font-medium">Aadhaar Card</span>
                <div className="font-bold text-white">Aadhaar_eKYC_XML.xml</div>
                <div className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified by UIDAI
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#181818] border border-white/5 space-y-2 text-xs">
                <span className="text-gray-400 font-medium">Bank Proof</span>
                <div className="font-bold text-white">HDFC_Cancelled_Cheque.pdf</div>
                <div className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Penny Drop Passed
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        {isEditing && (
          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsEditing(false)}
              className="border-white/10 text-gray-300 hover:bg-white/5 text-xs rounded-xl"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-[0_0_20px_rgba(5,150,105,0.3)]"
            >
              <Save className="w-3.5 h-3.5 mr-1.5" /> Save Changes
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
