"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  User,
  Save,
  ShieldCheck,
  Building2,
  CreditCard,
  Camera,
  Users,
  CheckCircle2,
  Edit3,
  Loader2,
  Plus,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/hooks/UnifiedAuthContext";
import { createClient } from "@/utils/supabase/client";
import { uploadFile } from "@/lib/storage/upload";

interface DependentItem {
  id: string;
  name: string;
  relation: string;
  dob: string;
  pan: string;
  covered80D: boolean;
}

export function UnifiedCustomerProfile() {
  const { user, refreshSession } = useAuth();
  const [activeTab, setActiveTab] = useState<"personal" | "tax" | "bank" | "dependents" | "kyc">("personal");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [kycVerified, setKycVerified] = useState(false);
  const [kycDocs, setKycDocs] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    fullName: "",
    dob: "",
    gender: "",
    phone: "",
    email: "",
    addressLine1: "",
    city: "",
    state: "",
    pincode: "",
    pan: "",
    aadhaar: "",
    gstin: "",
    entityName: "",
    entityType: "Individual",
    employerName: "",
    designation: "",
    taxRegime: "New Regime (Sec 115BAC)",
    bankName: "",
    accountNumber: "",
    ifsc: "",
    accountType: "Savings Account",
  });

  const [dependents, setDependents] = useState<DependentItem[]>([]);
  const [showAddDependent, setShowAddDependent] = useState(false);
  const [newDependent, setNewDependent] = useState({
    name: "",
    relation: "Spouse",
    dob: "",
    pan: "",
    covered80D: true,
  });

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    const supabase = createClient();

    async function loadProfile() {
      try {
        setLoading(true);
        const userId = user!.id;

        const [{ data: profile }, { data: clientProf }, { data: clientRow }, { data: docs }] = await Promise.all([
          supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
          supabase.from("client_profiles").select("*").eq("user_id", userId).maybeSingle(),
          supabase.from("clients").select("*").eq("portal_user_id", userId).maybeSingle(),
          supabase
            .from("documents")
            .select("*")
            .or(`user_id.eq.${userId},uploaded_by.eq.${userId}`)
            .in("category", ["identity", "kyc", "PAN", "AADHAAR", "BANK"])
            .order("created_at", { ascending: false }),
        ]);

        if (cancelled) return;

        const meta = (profile?.metadata || {}) as Record<string, any>;
        const bank = (clientProf?.bank_details || meta.bank_details || {}) as Record<string, any>;

        setAvatarUrl(profile?.avatar_url || user?.avatarUrl || "");
        setKycVerified(Boolean(clientRow?.kyc_verified || profile?.is_verified));
        setKycDocs(docs || []);

        setFormData({
          fullName: profile?.full_name || clientRow?.full_name || user?.name || "",
          dob: clientProf?.date_of_birth || clientRow?.date_of_birth || meta.dob || "",
          gender: meta.gender || "",
          phone: clientRow?.phone || meta.phone || "",
          email: profile?.email || clientRow?.email || user?.email || "",
          addressLine1: clientProf?.address || clientRow?.address || meta.addressLine1 || "",
          city: clientProf?.city || clientRow?.city || meta.city || "",
          state: clientProf?.state || clientRow?.state || meta.state || "",
          pincode: clientProf?.pincode || clientRow?.pincode || meta.pincode || "",
          pan: clientProf?.pan_number || clientRow?.pan || meta.pan || "",
          aadhaar: clientProf?.aadhaar_number || clientRow?.aadhaar || meta.aadhaar || "",
          gstin: clientProf?.gst_number || clientRow?.gstin || meta.gstin || "",
          entityName: clientProf?.business_name || meta.entityName || "",
          entityType: clientProf?.business_type || clientRow?.client_type || meta.entityType || "Individual",
          employerName: meta.employerName || "",
          designation: meta.designation || "",
          taxRegime: meta.taxRegime || "New Regime (Sec 115BAC)",
          bankName: bank.bankName || "",
          accountNumber: bank.accountNumber || "",
          ifsc: bank.ifsc || "",
          accountType: bank.accountType || "Savings Account",
        });

        if (Array.isArray(meta.dependents)) {
          setDependents(meta.dependents);
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
        toast.error("Failed to load taxpayer profile");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProfile();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const completionFields = [
    formData.fullName,
    formData.dob,
    formData.phone,
    formData.email,
    formData.addressLine1,
    formData.city,
    formData.pan,
    formData.bankName,
    formData.accountNumber,
    formData.ifsc,
  ];
  const filledCount = completionFields.filter((f) => Boolean(f && String(f).trim())).length;
  const profileCompletion = Math.round((filledCount / completionFields.length) * 100);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file (JPEG, PNG, WebP)");
      return;
    }

    try {
      setUploadingAvatar(true);
      const uploaded = await uploadFile(file, "avatars", user.id);
      if (uploaded?.url) {
        const supabase = createClient();
        const { error } = await supabase
          .from("profiles")
          .update({ avatar_url: uploaded.url, updated_at: new Date().toISOString() })
          .eq("id", user.id);
        if (error) throw error;
        setAvatarUrl(uploaded.url);
        await refreshSession();
        toast.success("Profile photo updated!");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to upload avatar");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const persistProfileData = async (nextDependents?: DependentItem[]) => {
    if (!user?.id) return;
    const supabase = createClient();
    const depsToSave = nextDependents ?? dependents;

    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("metadata")
      .eq("id", user.id)
      .maybeSingle();

    const updatedMetadata = {
      ...((existingProfile?.metadata as Record<string, any>) || {}),
      dob: formData.dob,
      gender: formData.gender,
      phone: formData.phone,
      addressLine1: formData.addressLine1,
      city: formData.city,
      state: formData.state,
      pincode: formData.pincode,
      pan: formData.pan,
      aadhaar: formData.aadhaar,
      gstin: formData.gstin,
      entityName: formData.entityName,
      entityType: formData.entityType,
      employerName: formData.employerName,
      designation: formData.designation,
      taxRegime: formData.taxRegime,
      bank_details: {
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        ifsc: formData.ifsc,
        accountType: formData.accountType,
      },
      dependents: depsToSave,
    };

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name: formData.fullName,
        metadata: updatedMetadata,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (profileError) throw profileError;

    // Update or insert into client_profiles if exists
    const { data: existingClientProf } = await supabase
      .from("client_profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    const clientProfilePayload = {
      user_id: user.id,
      pan_number: formData.pan || null,
      aadhaar_number: formData.aadhaar || null,
      date_of_birth: formData.dob || null,
      business_name: formData.entityName || null,
      business_type: formData.entityType || null,
      gst_number: formData.gstin || null,
      address: formData.addressLine1 || null,
      city: formData.city || null,
      state: formData.state || null,
      pincode: formData.pincode || null,
      bank_details: updatedMetadata.bank_details,
      updated_at: new Date().toISOString(),
    };

    if (existingClientProf) {
      await supabase.from("client_profiles").update(clientProfilePayload).eq("user_id", user.id);
    } else {
      await supabase.from("client_profiles").insert(clientProfilePayload);
    }

    // Also keep clients table synchronized if a client record exists for this portal_user_id
    await supabase
      .from("clients")
      .update({
        full_name: formData.fullName,
        phone: formData.phone || null,
        pan: formData.pan || null,
        aadhaar: formData.aadhaar || null,
        gstin: formData.gstin || null,
        date_of_birth: formData.dob || null,
        address: formData.addressLine1 || null,
        city: formData.city || null,
        state: formData.state || null,
        pincode: formData.pincode || null,
        updated_at: new Date().toISOString(),
      })
      .eq("portal_user_id", user.id);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      toast.error("Full Legal Name is required");
      return;
    }

    try {
      setSaving(true);
      await persistProfileData();
      setIsEditing(false);
      await refreshSession();
      toast.success("Profile and Tax Information saved to Supabase!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save profile changes");
    } finally {
      setSaving(false);
    }
  };

  const handleAddDependent = async () => {
    if (!newDependent.name.trim()) {
      toast.error("Dependent name is required");
      return;
    }

    const updated = [
      ...dependents,
      {
        id: crypto.randomUUID(),
        ...newDependent,
      },
    ];

    try {
      setSaving(true);
      await persistProfileData(updated);
      setDependents(updated);
      setNewDependent({ name: "", relation: "Spouse", dob: "", pan: "", covered80D: true });
      setShowAddDependent(false);
      toast.success("Family member added and saved!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save family member");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveDependent = async (id: string) => {
    const updated = dependents.filter((d) => d.id !== id);
    try {
      setSaving(true);
      await persistProfileData(updated);
      setDependents(updated);
      toast.success("Dependent removed");
    } catch (err: any) {
      toast.error(err.message || "Failed to remove dependent");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3 text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        <p className="text-xs font-medium">Loading taxpayer profile & KYC vault...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <User className="w-4 h-4" /> Taxpayer Profile & KYC
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
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            variant={isEditing ? "default" : "outline"}
            className={
              isEditing
                ? "bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-xl"
                : "border-white/10 text-gray-300 hover:bg-white/5 text-xs rounded-xl"
            }
          >
            <Edit3 className="w-3.5 h-3.5 mr-1.5" /> {isEditing ? "Editing Mode Active" : "Edit Profile"}
          </Button>
        </div>
      </div>

      {/* Profile Card & Completion Banner */}
      <div className="bg-[#111111] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={formData.fullName || "Avatar"}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-emerald-600/20 border-2 border-emerald-500 flex items-center justify-center text-2xl font-bold text-emerald-400">
                  {(formData.fullName || formData.email || "U").slice(0, 2).toUpperCase()}
                </div>
              )}
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
              <button
                type="button"
                disabled={uploadingAvatar}
                onClick={() => avatarInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 bg-emerald-600 hover:bg-emerald-700 text-white p-1.5 rounded-full shadow-md transition-colors disabled:opacity-50"
                title="Upload Profile Photo"
              >
                {uploadingAvatar ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">{formData.fullName || "Complete Your Name"}</h2>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    kycVerified
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                  }`}
                >
                  {kycVerified ? "KYC Verified" : "Pending Verification"}
                </span>
              </div>
              <p className="text-xs text-gray-400">
                PAN: <span className="font-mono text-gray-200">{formData.pan || "Not Provided"}</span> • Aadhaar:{" "}
                <span className="font-mono text-gray-200">{formData.aadhaar || "Not Provided"}</span>
              </p>
              <p className="text-xs text-gray-400">
                {formData.email} {formData.phone ? `• ${formData.phone}` : ""}
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
              <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${profileCompletion}%` }} />
            </div>
            <p className="text-[10px] text-gray-500 mt-2">
              {profileCompletion < 100
                ? "Click Edit Profile to complete missing tax & bank fields"
                : "Master taxpayer profile is 100% complete"}
            </p>
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
              type="button"
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
                  placeholder="As per PAN card"
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
                  disabled
                  value={formData.email}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl p-2.5 text-white opacity-60"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">Phone Number</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98XXXXXXXX"
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
                  placeholder="House / Flat / Building / Street"
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
                    placeholder="State"
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-2/3 bg-[#181818] border border-white/10 rounded-xl p-2.5 text-white disabled:opacity-60 focus:outline-none focus:border-emerald-500"
                  />
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={formData.pincode}
                    placeholder="Pincode"
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
                  disabled={!isEditing}
                  value={formData.pan}
                  onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                  placeholder="ABCDE1234F"
                  maxLength={10}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl p-2.5 text-white disabled:opacity-60 focus:outline-none focus:border-emerald-500 font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">Aadhaar Number (Masked / Last 4 or 12 digits)</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.aadhaar}
                  onChange={(e) => setFormData({ ...formData, aadhaar: e.target.value })}
                  placeholder="XXXX-XXXX-1234"
                  className="w-full bg-[#181818] border border-white/10 rounded-xl p-2.5 text-white disabled:opacity-60 focus:outline-none focus:border-emerald-500 font-mono"
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
                  placeholder="Optional for salaried individuals"
                  className="w-full bg-[#181818] border border-white/10 rounded-xl p-2.5 text-white disabled:opacity-60 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">GSTIN (if applicable)</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.gstin}
                  onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                  placeholder="27AAACT1234F1Z5"
                  className="w-full bg-[#181818] border border-white/10 rounded-xl p-2.5 text-white disabled:opacity-60 focus:outline-none focus:border-emerald-500 font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">Employer / Company Name</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.employerName}
                  onChange={(e) => setFormData({ ...formData, employerName: e.target.value })}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl p-2.5 text-white disabled:opacity-60 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-gray-300 font-medium mb-1">Designation & Employment Type</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  placeholder="e.g., Full-Time Salaried / Freelancer / Director"
                  className="w-full bg-[#181818] border border-white/10 rounded-xl p-2.5 text-white disabled:opacity-60 focus:outline-none focus:border-emerald-500"
                />
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
              Income tax refunds will be credited directly to this account by CPC Bangalore.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-gray-300 font-medium mb-1">Bank Name</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  placeholder="e.g., HDFC Bank Ltd"
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
                  onChange={(e) => setFormData({ ...formData, ifsc: e.target.value.toUpperCase() })}
                  placeholder="HDFC0001234"
                  className="w-full bg-[#181818] border border-white/10 rounded-xl p-2.5 text-white disabled:opacity-60 focus:outline-none focus:border-emerald-500 font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">Account Type</label>
                <select
                  disabled={!isEditing}
                  value={formData.accountType}
                  onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl p-2.5 text-white disabled:opacity-60 focus:outline-none focus:border-emerald-500"
                >
                  <option value="Savings Account">Savings Account</option>
                  <option value="Current Account">Current Account</option>
                  <option value="NRE / NRO Account">NRE / NRO Account</option>
                </select>
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
                onClick={() => setShowAddDependent(!showAddDependent)}
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-xl"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Family Member
              </Button>
            </div>

            {showAddDependent && (
              <div className="p-4 rounded-2xl bg-[#181818] border border-emerald-500/30 space-y-3 text-xs">
                <h4 className="font-bold text-white">New Family / Dependent Member</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={newDependent.name}
                    onChange={(e) => setNewDependent({ ...newDependent, name: e.target.value })}
                    className="bg-[#111111] border border-white/10 rounded-xl p-2.5 text-white"
                  />
                  <select
                    value={newDependent.relation}
                    onChange={(e) => setNewDependent({ ...newDependent, relation: e.target.value })}
                    className="bg-[#111111] border border-white/10 rounded-xl p-2.5 text-white"
                  >
                    <option value="Spouse">Spouse</option>
                    <option value="Child">Child</option>
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Father (Senior Citizen)">Father (Senior Citizen)</option>
                    <option value="Mother (Senior Citizen)">Mother (Senior Citizen)</option>
                  </select>
                  <input
                    type="date"
                    value={newDependent.dob}
                    onChange={(e) => setNewDependent({ ...newDependent, dob: e.target.value })}
                    className="bg-[#111111] border border-white/10 rounded-xl p-2.5 text-white font-mono"
                  />
                  <input
                    type="text"
                    placeholder="PAN (Optional)"
                    value={newDependent.pan}
                    onChange={(e) => setNewDependent({ ...newDependent, pan: e.target.value.toUpperCase() })}
                    className="bg-[#111111] border border-white/10 rounded-xl p-2.5 text-white font-mono uppercase"
                  />
                </div>
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 text-gray-300">
                    <input
                      type="checkbox"
                      checked={newDependent.covered80D}
                      onChange={(e) => setNewDependent({ ...newDependent, covered80D: e.target.checked })}
                    />
                    Covered under Section 80D health insurance
                  </label>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => setShowAddDependent(false)} className="border-white/10 text-xs">
                      Cancel
                    </Button>
                    <Button type="button" size="sm" disabled={saving} onClick={handleAddDependent} className="bg-emerald-600 hover:bg-emerald-700 text-xs">
                      {saving ? "Saving..." : "Save Member"}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {dependents.length === 0 ? (
                <div className="p-6 text-center rounded-xl bg-[#181818] border border-white/5 text-xs text-gray-400">
                  No family members or dependents added yet.
                </div>
              ) : (
                dependents.map((dep) => (
                  <div
                    key={dep.id}
                    className="p-4 rounded-xl bg-[#181818] border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-bold text-white text-sm">{dep.name}</div>
                      <div className="text-gray-400">
                        {dep.relation} {dep.pan ? `• PAN: ${dep.pan}` : ""}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {dep.covered80D && (
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                          Sec 80D Eligible
                        </span>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveDependent(dep.id)}
                        className="h-7 w-7 text-gray-400 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 5: KYC Documents */}
        {activeTab === "kyc" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-semibold text-white">Identity Verification & KYC Documents</h3>
              <Link href="/client/documents">
                <Button type="button" size="sm" variant="outline" className="border-white/10 text-xs text-emerald-400 hover:bg-white/5 rounded-xl">
                  <UploadCloud className="w-3.5 h-3.5 mr-1.5" /> Upload KYC Document
                </Button>
              </Link>
            </div>
            {kycDocs.length === 0 ? (
              <div className="p-6 text-center rounded-xl bg-[#181818] border border-white/5 text-xs text-gray-400">
                No identity/KYC documents uploaded yet. Visit Document Vault to upload your PAN, Aadhaar, or Bank Cheque.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {kycDocs.map((doc) => (
                  <div key={doc.id} className="p-4 rounded-xl bg-[#181818] border border-white/5 space-y-2 text-xs">
                    <span className="text-gray-400 font-medium uppercase">{doc.category || doc.document_type || "KYC"}</span>
                    <div className="font-bold text-white truncate">{doc.file_name}</div>
                    <div className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {doc.status || "Uploaded"}
                    </div>
                  </div>
                ))}
              </div>
            )}
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
              disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-[0_0_20px_rgba(5,150,105,0.3)]"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1.5" />}
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
