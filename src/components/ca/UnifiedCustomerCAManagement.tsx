"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Users,
  Search,
  Star,
  MapPin,
  ShieldCheck,
  Clock,
  Award,
  Video,
  MessageSquare,
  UserMinus,
  RefreshCw,
  Send,
  Mail,
  X,
  Loader2,
  Check,
  Ban,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";

export interface CAProfile {
  id: string;
  name: string;
  firm: string;
  membershipNo: string;
  experience: string;
  rating: number;
  reviewsCount: number;
  location: string;
  fee: string;
  consultationFee?: number;
  availability: string;
  specializations: string[];
  qualifications: string[];
  bio: string;
  isAssigned?: boolean;
  services: { name: string; price: string; tat: string }[];
  reviews: { author: string; rating: number; date: string; comment: string }[];
}

interface CARequestItem {
  id: string;
  kind: "request" | "proposal";
  caName: string;
  firm: string;
  service: string;
  scope?: string;
  budget: string;
  rawStatus: string;
  status: string;
  date: string;
  badgeClass: string;
}

interface RelationshipHistoryItem {
  id: string;
  caId: string;
  caName: string;
  firm: string;
  period: string;
  filingsCount: number;
  notes: string;
  status: string;
}

function getStatusBadge(rawStatus: string) {
  const s = String(rawStatus || "pending").toLowerCase();
  if (s === "accepted" || s === "active" || s === "signed") {
    return {
      label: "Accepted & Active",
      badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    };
  }
  if (s === "rejected" || s === "declined" || s === "cancelled") {
    return {
      label: s.charAt(0).toUpperCase() + s.slice(1),
      badgeClass: "bg-red-500/10 text-red-400 border-red-500/30",
    };
  }
  if (s === "sent") {
    return {
      label: "Proposal Awaiting Your Approval",
      badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    };
  }
  return {
    label: "Submitted (Awaiting CA Review)",
    badgeClass: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  };
}

export function UnifiedCustomerCAManagement({
  initialTab = "my-ca",
}: {
  initialTab?: "my-ca" | "find-ca" | "requests" | "history";
}) {
  const [activeTab, setActiveTab] = useState<"my-ca" | "find-ca" | "requests" | "history">(initialTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPractice, setSelectedPractice] = useState("All");
  const [selectedCity, setSelectedCity] = useState("All");

  const [caDirectory, setCaDirectory] = useState<CAProfile[]>([]);
  const [myCA, setMyCA] = useState<CAProfile | null>(null);
  const [caRequests, setCaRequests] = useState<CARequestItem[]>([]);
  const [relationshipHistory, setRelationshipHistory] = useState<RelationshipHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Modals state
  const [selectedCA, setSelectedCA] = useState<CAProfile | null>(null);
  const [selectedTermsItem, setSelectedTermsItem] = useState<CARequestItem | null>(null);
  const [showHireModal, setShowHireModal] = useState(false);
  const [hireCA, setHireCA] = useState<CAProfile | null>(null);
  const [hireTitle, setHireTitle] = useState("Annual ITR Filing & Tax Compliance");
  const [hireBudget, setHireBudget] = useState("3500");
  const [hireNotes, setHireNotes] = useState("");

  const [showChangeCAModal, setShowChangeCAModal] = useState(false);
  const [changeReason, setChangeReason] = useState("Specialization mismatch");
  const [changeTargetCaId, setChangeTargetCaId] = useState("");

  const [showRemoveCAModal, setShowRemoveCAModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitePhone, setInvitePhone] = useState("");
  const [inviteName, setInviteName] = useState("");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [casRes, reqsRes, propsRes, itrRes] = await Promise.all([
        fetch("/api/cas"),
        fetch("/api/ca-requests"),
        fetch("/api/proposals"),
        fetch("/api/itr"),
      ]);

      let directory: CAProfile[] = [];
      if (casRes.ok) {
        const casJson = await casRes.json();
        directory = (casJson.cas || []).map((c: any) => ({
          id: c.id,
          name: c.name || "Chartered Accountant",
          firm: c.firm || "Independent Practice",
          membershipNo: c.membershipNo || "ICAI Verified",
          experience: c.experience || "Verified CA",
          rating: Number(c.rating || 4.8),
          reviewsCount: Number(c.reviewsCount || 0),
          location: c.location || "India",
          fee: c.fee || `₹${Number(c.consultationFee || 1500).toLocaleString("en-IN")} / session`,
          consultationFee: Number(c.consultationFee || 1500),
          availability: c.availability || "Available Today",
          specializations: Array.isArray(c.specializations) ? c.specializations : ["ITR Filing", "GST"],
          qualifications: Array.isArray(c.qualifications) ? c.qualifications : ["Chartered Accountant"],
          bio: c.bio || "Verified practicing Chartered Accountant on TaxMate.",
          isAssigned: Boolean(c.isAssigned),
          services: Array.isArray(c.services) ? c.services : [],
          reviews: Array.isArray(c.reviews) ? c.reviews : [],
        }));
      }
      setCaDirectory(directory);

      const itrRows = itrRes.ok ? (await itrRes.json()).data || [] : [];
      const filingsByCa = new Map<string, number>();
      for (const f of itrRows) {
        if (f.caId) {
          filingsByCa.set(f.caId, (filingsByCa.get(f.caId) || 0) + 1);
        }
      }

      const assignedFromDir = directory.find((c) => c.isAssigned) || null;
      let assignedFromRel: CAProfile | null = assignedFromDir;

      const combinedRequests: CARequestItem[] = [];
      if (reqsRes.ok) {
        const reqsJson = await reqsRes.json();
        const rawReqs = reqsJson.requests || [];
        const rawRels = reqsJson.relationships || [];

        for (const r of rawReqs) {
          const badge = getStatusBadge(r.status);
          combinedRequests.push({
            id: r.id,
            kind: "request",
            caName: r.ca?.name || "Chartered Accountant",
            firm: r.ca?.firm_name || "CA Practice",
            service: r.title,
            scope: r.message || "",
            budget: r.proposed_budget ? `₹${Number(r.proposed_budget).toLocaleString("en-IN")}` : "Standard Fee",
            rawStatus: String(r.status || "pending").toLowerCase(),
            status: badge.label,
            date: r.created_at
              ? new Date(r.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
              : "Recent",
            badgeClass: badge.badgeClass,
          });
        }

        const mappedHistory: RelationshipHistoryItem[] = rawRels.map((rel: any) => {
          const isActive = ["active", "accepted"].includes(String(rel.status || "").toLowerCase());
          const startStr = rel.connected_at || rel.created_at
            ? new Date(rel.connected_at || rel.created_at).toLocaleDateString("en-IN", {
                month: "short",
                year: "numeric",
              })
            : "Active";

          if (isActive && !assignedFromRel) {
            const found = directory.find((c) => c.id === rel.ca_id);
            if (found) assignedFromRel = found;
          }

          return {
            id: rel.id,
            caId: rel.ca_id,
            caName: rel.ca?.name || "Chartered Accountant",
            firm: rel.ca?.firm_name || rel.ca?.designation || "CA Practice",
            period: isActive ? `${startStr} - Present (Active)` : `${startStr} - Ended`,
            filingsCount: filingsByCa.get(rel.ca_id) || 0,
            notes: rel.notes || "Authorized tax consultant & compliance engagement.",
            status: isActive ? "Active" : "Ended & Archived",
          };
        });
        setRelationshipHistory(mappedHistory);
      }

      if (propsRes.ok) {
        const propsJson = await propsRes.json();
        for (const p of propsJson.proposals || []) {
          const badge = getStatusBadge(p.status);
          const matchedCa = directory.find((c) => c.id === p.ca_id);
          combinedRequests.push({
            id: p.id,
            kind: "proposal",
            caName: matchedCa?.name || "Chartered Accountant",
            firm: matchedCa?.firm || "CA Practice",
            service: p.title,
            scope: p.scope || p.notes || "",
            budget: `₹${Number(p.retainer_amount || 0).toLocaleString("en-IN")}`,
            rawStatus: String(p.status || "sent").toLowerCase(),
            status: badge.label,
            date: p.created_at
              ? new Date(p.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
              : "Recent",
            badgeClass: badge.badgeClass,
          });
        }
      }

      setMyCA(assignedFromRel);
      setCaRequests(combinedRequests);

      const firstAlternate = directory.find((c) => c.id !== assignedFromRel?.id);
      if (firstAlternate) {
        setChangeTargetCaId(firstAlternate.id);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load CA management data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const availableCities = useMemo(() => {
    const cities = new Set<string>();
    for (const c of caDirectory) {
      const city = c.location.split(",")[0]?.trim();
      if (city && city !== "India (Remote & Office)") cities.add(city);
    }
    return Array.from(cities);
  }, [caDirectory]);

  const filteredCAs = caDirectory.filter((ca) => {
    if (
      selectedPractice !== "All" &&
      !ca.specializations.some((s) => s.toLowerCase().includes(selectedPractice.toLowerCase()))
    ) {
      return false;
    }
    if (selectedCity !== "All" && !ca.location.toLowerCase().includes(selectedCity.toLowerCase())) {
      return false;
    }
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      return (
        ca.name.toLowerCase().includes(q) ||
        ca.firm.toLowerCase().includes(q) ||
        ca.specializations.some((s) => s.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleSendHireProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hireCA) return;

    try {
      setSubmitting(true);
      const res = await fetch("/api/ca-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caId: hireCA.id,
          requestType: "hire",
          title: hireTitle.trim(),
          proposedBudget: Number(hireBudget || 0),
          message: hireNotes.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to submit engagement request");

      toast.success(`Hire proposal sent to ${hireCA.name}!`);
      setShowHireModal(false);
      setHireNotes("");
      setActiveTab("requests");
      await loadData();
    } catch (err: any) {
      toast.error(err.message || "Could not submit hire request");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestAction = async (
    item: CARequestItem,
    status: "cancelled" | "accepted" | "declined"
  ) => {
    try {
      setSubmitting(true);
      const endpoint = item.kind === "proposal" ? "/api/proposals" : "/api/ca-requests";
      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, status }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update status");

      toast.success(
        status === "accepted"
          ? "Proposal accepted!"
          : status === "declined"
          ? "Proposal declined"
          : "Request cancelled"
      );
      await loadData();
    } catch (err: any) {
      toast.error(err.message || "Action failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendExternalInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    try {
      setSubmitting(true);
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inquiryType: "ca_invite",
          name: inviteName.trim() || "Invited CA",
          email: inviteEmail.trim(),
          phone: invitePhone.trim() || null,
          subject: "Client Invitation to Join TaxMate",
          message: `A TaxMate client invited ${inviteName || inviteEmail} (${invitePhone || "no phone"}) to collaborate on filings & vault documents.`,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to send invitation");

      toast.success(`Invitation logged and dispatched for ${inviteName || inviteEmail}!`);
      setShowInviteModal(false);
      setInviteEmail("");
      setInvitePhone("");
      setInviteName("");
    } catch (err: any) {
      toast.error(err.message || "Failed to send CA invitation");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangeCAConfirm = async () => {
    const targetId = changeTargetCaId || caDirectory.find((c) => c.id !== myCA?.id)?.id;
    if (!targetId) {
      toast.info("Browse the CA Directory to pick your replacement CA.");
      setShowChangeCAModal(false);
      setActiveTab("find-ca");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/ca-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caId: targetId,
          requestType: "change_ca",
          title: `CA Reassignment Request (${changeReason})`,
          message: `Client requested CA reassignment. Reason: ${changeReason}. Current CA: ${myCA?.name || "None"}.`,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to submit reassignment request");

      toast.success("CA reassignment request submitted!");
      setShowChangeCAModal(false);
      setActiveTab("requests");
      await loadData();
    } catch (err: any) {
      toast.error(err.message || "Could not submit reassignment request");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveCAConfirm = async () => {
    try {
      setSubmitting(true);
      const qs = myCA ? `?caId=${encodeURIComponent(myCA.id)}` : "";
      const res = await fetch(`/api/ca-requests${qs}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to remove CA engagement");

      toast.success("CA engagement ended and archived in history.");
      setShowRemoveCAModal(false);
      await loadData();
    } catch (err: any) {
      toast.error(err.message || "Could not remove CA engagement");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-white">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-400" /> Chartered Accountant Management Hub
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Manage your dedicated CA engagement, browse ICAI-verified practitioners, request proposals, and track relationship history.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowInviteModal(true)}
            className="text-xs border-white/10 text-gray-300 hover:text-white"
          >
            <Mail className="w-3.5 h-3.5 mr-1.5 text-emerald-400" /> Send CA Invitation
          </Button>

          <Button
            onClick={() => setActiveTab("find-ca")}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-[0_0_20px_rgba(5,150,105,0.4)]"
          >
            <Search className="w-3.5 h-3.5 mr-1.5" /> Find & Hire CA
          </Button>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 text-xs overflow-x-auto">
        {[
          { key: "my-ca", label: "My CA Overview" },
          { key: "find-ca", label: `CA Directory & Search (${caDirectory.length})` },
          { key: "requests", label: `Requests & Proposals (${caRequests.length})` },
          { key: "history", label: `Relationship History (${relationshipHistory.length})` },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key as any)}
            className={`px-3.5 py-2 rounded-xl font-semibold transition-all whitespace-nowrap ${
              activeTab === t.key
                ? "bg-emerald-600 text-white shadow-[0_0_15px_rgba(5,150,105,0.4)] font-bold"
                : "bg-[#141414] hover:bg-[#1A1A1A] text-gray-400 hover:text-white border border-white/5"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-16 flex items-center justify-center text-sm text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-400 mr-2" />
          Loading CA directory & engagement data...
        </div>
      ) : (
        <>
          {/* TAB 1: MY CA OVERVIEW */}
          {activeTab === "my-ca" && (
            <div className="space-y-6">
              {!myCA ? (
                <div className="p-8 rounded-2xl bg-[#111111] border border-white/10 text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <Users className="w-7 h-7" />
                  </div>
                  <div className="space-y-1 max-w-md mx-auto">
                    <h2 className="text-lg font-bold text-white">No Chartered Accountant Assigned Yet</h2>
                    <p className="text-xs text-gray-400">
                      Browse verified CAs in our directory to send a hiring proposal, or invite your existing personal CA to manage your documents and filings.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <Button
                      onClick={() => setActiveTab("find-ca")}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                    >
                      <Search className="w-3.5 h-3.5 mr-1.5" /> Browse CA Directory
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowInviteModal(true)}
                      className="border-white/10 text-xs text-gray-300 hover:text-white"
                    >
                      <Mail className="w-3.5 h-3.5 mr-1.5 text-emerald-400" /> Invite Personal CA
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-[#111111] border border-emerald-500/30 shadow-2xl relative overflow-hidden space-y-6">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-emerald-600/20 text-emerald-400 font-extrabold flex items-center justify-center text-xl border border-emerald-500/30 shrink-0">
                        {myCA.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            Currently Assigned CA
                          </span>
                          <span className="text-xs text-gray-400 font-mono">{myCA.membershipNo}</span>
                        </div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                          {myCA.name} <ShieldCheck className="w-5 h-5 text-emerald-400" />
                        </h2>
                        <p className="text-xs text-gray-300">
                          {myCA.firm} • {myCA.location}
                        </p>
                      </div>
                    </div>

                    {/* Direct Actions */}
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href="/client/chat">
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold">
                          <MessageSquare className="w-3.5 h-3.5 mr-1.5" /> Message CA
                        </Button>
                      </Link>
                      <Link href="/client/calls">
                        <Button size="sm" variant="outline" className="border-white/10 text-xs text-gray-300 hover:text-white">
                          <Video className="w-3.5 h-3.5 mr-1.5" /> Video Call
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedCA(myCA)}
                        className="border-white/10 text-xs text-gray-300 hover:text-white"
                      >
                        View Full Profile
                      </Button>
                    </div>
                  </div>

                  {/* Quick Details Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/10 text-xs">
                    <div className="p-3 bg-[#18181b] rounded-xl border border-white/5">
                      <span className="text-gray-400">Experience</span>
                      <p className="font-bold text-white mt-0.5">{myCA.experience}</p>
                    </div>
                    <div className="p-3 bg-[#18181b] rounded-xl border border-white/5">
                      <span className="text-gray-400">Rating</span>
                      <p className="font-bold text-amber-400 mt-0.5 flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400" /> {myCA.rating} ({myCA.reviewsCount} reviews)
                      </p>
                    </div>
                    <div className="p-3 bg-[#18181b] rounded-xl border border-white/5">
                      <span className="text-gray-400">Consultation Rate</span>
                      <p className="font-bold text-emerald-400 mt-0.5">{myCA.fee}</p>
                    </div>
                    <div className="p-3 bg-[#18181b] rounded-xl border border-white/5">
                      <span className="text-gray-400">CA Availability</span>
                      <p className="font-bold text-white mt-0.5 truncate">{myCA.availability}</p>
                    </div>
                  </div>

                  {/* Specializations & Secondary Management Options */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                    <div className="flex flex-wrap gap-1.5">
                      {myCA.specializations.map((sp) => (
                        <span
                          key={sp}
                          className="px-2.5 py-1 bg-white/5 text-gray-300 text-[10px] font-semibold rounded-lg border border-white/5"
                        >
                          {sp}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowChangeCAModal(true)}
                        className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 text-xs"
                      >
                        <RefreshCw className="w-3.5 h-3.5 mr-1" /> Change CA
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowRemoveCAModal(true)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs"
                      >
                        <UserMinus className="w-3.5 h-3.5 mr-1" /> Remove CA
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: FIND CA & CA DIRECTORY */}
          {activeTab === "find-ca" && (
            <div className="space-y-6">
              <div className="p-4 bg-[#111111] rounded-2xl border border-white/10 space-y-4">
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by CA name, firm, practice area (GST, ITR, NRI, Audit)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[#18181b] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="flex gap-2 w-full sm:w-auto">
                    <select
                      value={selectedPractice}
                      onChange={(e) => setSelectedPractice(e.target.value)}
                      className="bg-[#18181b] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="All">All Practices</option>
                      <option value="Capital Gains">Capital Gains</option>
                      <option value="ITR">ITR Filing</option>
                      <option value="GST">GST & Compliance</option>
                      <option value="NRI">NRI Taxation</option>
                      <option value="Audit">Corporate Audit</option>
                    </select>

                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="bg-[#18181b] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="All">All Cities</option>
                      {availableCities.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {filteredCAs.length === 0 ? (
                <div className="p-12 text-center bg-[#111111] rounded-2xl border border-white/10 text-xs text-gray-400">
                  No verified Chartered Accountants match your current filters.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {filteredCAs.map((ca) => (
                    <div
                      key={ca.id}
                      className="bg-[#111111] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4 hover:border-emerald-500/40 transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="w-12 h-12 rounded-xl bg-emerald-600/10 text-emerald-400 font-bold flex items-center justify-center text-base border border-emerald-500/20">
                            {ca.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                            <Star className="w-3.5 h-3.5 fill-amber-400" /> {ca.rating} ({ca.reviewsCount})
                          </div>
                        </div>

                        <div>
                          <h3 className="font-bold text-white text-base flex items-center gap-1.5">
                            {ca.name} <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          </h3>
                          <p className="text-xs text-gray-400">{ca.firm}</p>
                          <span className="text-[10px] text-gray-500 font-mono">{ca.membershipNo}</span>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-gray-400 pt-1">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-gray-400" /> {ca.location}
                          </span>
                          <span>• {ca.experience}</span>
                        </div>

                        <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed">{ca.bio}</p>

                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {ca.specializations.slice(0, 3).map((sp) => (
                            <span
                              key={sp}
                              className="px-2 py-0.5 bg-[#18181b] text-gray-300 text-[10px] font-semibold rounded-md border border-white/5"
                            >
                              {sp}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-gray-400 block">Consultation Fee</span>
                          <span className="text-base font-extrabold text-white">{ca.fee}</span>
                        </div>
                        <div className="flex gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedCA(ca)}
                            className="border-white/10 text-xs"
                          >
                            Profile
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              setHireCA(ca);
                              setHireBudget(String(ca.consultationFee || 2500));
                              setShowHireModal(true);
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md shadow-emerald-600/20"
                          >
                            {ca.isAssigned ? "New Request" : "Request CA"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CA REQUESTS & APPROVAL STATUS */}
          {activeTab === "requests" && (
            <div className="bg-[#111111] rounded-2xl border border-white/10 overflow-hidden shadow-xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="font-bold text-base text-white">CA Engagement Proposals & Request Status</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Track real-time approval status, accept/decline CA proposals, and monitor assignment confirmations.
                  </p>
                </div>
                <span className="text-xs font-mono text-emerald-400">{caRequests.length} Records</span>
              </div>

              {caRequests.length === 0 ? (
                <div className="py-10 text-center text-xs text-gray-400">
                  No engagement requests or proposals yet. Browse the CA Directory to initiate one.
                </div>
              ) : (
                <div className="space-y-3">
                  {caRequests.map((req) => (
                    <div
                      key={`${req.kind}-${req.id}`}
                      className="p-4 bg-[#18181b] rounded-xl border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono font-bold text-gray-400">
                            {req.kind === "proposal" ? "PROP" : "REQ"}-{req.id.slice(0, 6).toUpperCase()}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${req.badgeClass}`}>
                            {req.status}
                          </span>
                          <span className="text-xs text-gray-500">• {req.date}</span>
                        </div>
                        <h4 className="font-bold text-sm text-white">{req.service}</h4>
                        <p className="text-xs text-gray-400">
                          Practitioner: <strong className="text-emerald-400">{req.caName}</strong> ({req.firm})
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="text-right mr-2">
                          <span className="text-[10px] text-gray-400 block">Proposed Fee</span>
                          <span className="font-mono font-bold text-white text-sm">{req.budget}</span>
                        </div>

                        {req.kind === "proposal" && req.rawStatus === "sent" && (
                          <>
                            <Button
                              size="sm"
                              disabled={submitting}
                              onClick={() => handleRequestAction(req, "accepted")}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                            >
                              <Check className="w-3.5 h-3.5 mr-1" /> Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={submitting}
                              onClick={() => handleRequestAction(req, "declined")}
                              className="border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs"
                            >
                              <Ban className="w-3.5 h-3.5 mr-1" /> Decline
                            </Button>
                          </>
                        )}

                        {req.kind === "request" && req.rawStatus === "pending" && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={submitting}
                            onClick={() => handleRequestAction(req, "cancelled")}
                            className="border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs"
                          >
                            Cancel
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedTermsItem(req)}
                          className="border-white/10 text-xs"
                        >
                          View Terms
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: RELATIONSHIP HISTORY */}
          {activeTab === "history" && (
            <div className="bg-[#111111] rounded-2xl border border-white/10 overflow-hidden shadow-xl p-6 space-y-4">
              <div className="border-b border-white/10 pb-4">
                <h3 className="font-bold text-base text-white">CA Relationship History & Handover Records</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Historical records of all Chartered Accountants authorized on your account.
                </p>
              </div>

              {relationshipHistory.length === 0 ? (
                <div className="py-10 text-center text-xs text-gray-400">
                  No historical CA engagements recorded yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {relationshipHistory.map((item) => (
                    <div key={item.id} className="p-4 bg-[#18181b] rounded-xl border border-white/5 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-sm text-white flex items-center gap-2">
                            {item.caName}
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                item.status === "Active"
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                  : "bg-white/5 text-gray-400 border-white/10"
                              }`}
                            >
                              {item.status}
                            </span>
                          </h4>
                          <p className="text-xs text-gray-400">
                            {item.firm} • {item.period}
                          </p>
                        </div>

                        <div className="flex items-center gap-4 text-xs font-mono">
                          <div>
                            <span className="text-gray-500">Filings Recorded:</span>
                            <p className="font-bold text-white">{item.filingsCount}</p>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-gray-300 bg-[#111111] p-2.5 rounded-lg border border-white/5">
                        {item.notes}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* VIEW PROPOSAL / REQUEST TERMS MODAL */}
      {selectedTermsItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#111111] border border-white/10 rounded-2xl p-6 space-y-4 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-base text-white">Engagement Terms</h3>
              <button onClick={() => setSelectedTermsItem(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <p className="text-gray-400">
                Service: <strong className="text-white">{selectedTermsItem.service}</strong>
              </p>
              <p className="text-gray-400">
                Practitioner: <strong className="text-emerald-400">{selectedTermsItem.caName}</strong> ({selectedTermsItem.firm})
              </p>
              <p className="text-gray-400">
                Proposed Fee: <strong className="text-white font-mono">{selectedTermsItem.budget}</strong>
              </p>
              <div className="p-3 bg-[#18181b] rounded-xl border border-white/5 text-gray-300 mt-2">
                {selectedTermsItem.scope || "Standard engagement scope & confidentiality agreement applies."}
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button size="sm" variant="outline" onClick={() => setSelectedTermsItem(null)} className="border-white/10 text-xs">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* CA FULL PROFILE MODAL */}
      {selectedCA && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-[#111111] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-5 text-white shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase">{selectedCA.membershipNo}</span>
                <h3 className="text-xl font-bold text-white flex items-center gap-2 mt-0.5">
                  {selectedCA.name} <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </h3>
                <p className="text-xs text-gray-400">
                  {selectedCA.firm} • {selectedCA.location} • {selectedCA.experience}
                </p>
              </div>
              <button onClick={() => setSelectedCA(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 bg-[#18181b] rounded-xl border border-white/5 space-y-1.5">
                <span className="font-bold text-emerald-400">About Practitioner:</span>
                <p className="text-gray-300 leading-relaxed">{selectedCA.bio}</p>
                <div className="pt-2 flex items-center gap-1.5 text-gray-400 font-mono text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" /> {selectedCA.availability}
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="font-bold text-white">Qualifications & Accreditations:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedCA.qualifications.map((q) => (
                    <div
                      key={q}
                      className="p-2.5 bg-[#18181b] rounded-lg border border-white/5 flex items-center gap-2 text-gray-200"
                    >
                      <Award className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{q}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedCA.services.length > 0 && (
                <div className="space-y-1.5">
                  <span className="font-bold text-white">Services & Standard Turnaround Times:</span>
                  <div className="divide-y divide-white/5 bg-[#18181b] rounded-xl border border-white/5">
                    {selectedCA.services.map((srv, idx) => (
                      <div key={idx} className="p-3 flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-white">{srv.name}</span>
                          <p className="text-[10px] text-gray-400 mt-0.5">Turnaround: {srv.tat}</p>
                        </div>
                        <span className="font-mono font-bold text-emerald-400">{srv.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <span className="font-bold text-white">Client Reviews & Testimonials:</span>
                {selectedCA.reviews.length === 0 ? (
                  <div className="p-3 bg-[#18181b] rounded-xl border border-white/5 text-gray-400">
                    No client reviews submitted yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedCA.reviews.map((rev, idx) => (
                      <div key={idx} className="p-3 bg-[#18181b] rounded-xl border border-white/5 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-white">{rev.author}</span>
                          <span className="text-gray-400 font-mono">{rev.date}</span>
                        </div>
                        <p className="text-gray-300 italic">&quot;{rev.comment}&quot;</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
              <Button variant="outline" size="sm" onClick={() => setSelectedCA(null)} className="border-white/10 text-xs">
                Close
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setHireCA(selectedCA);
                  setHireBudget(String(selectedCA.consultationFee || 2500));
                  setSelectedCA(null);
                  setShowHireModal(true);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
              >
                Hire / Request Proposal
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* REQUEST CA / HIRE PROPOSAL MODAL */}
      {showHireModal && hireCA && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#111111] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-5 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <Send className="w-4 h-4 text-emerald-400" /> Send CA Engagement Proposal
                </h3>
                <p className="text-xs text-gray-400">Request consultation or engagement proposal from {hireCA.name}</p>
              </div>
              <button onClick={() => setShowHireModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendHireProposal} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-300 mb-1">Engagement Title *</label>
                <input
                  type="text"
                  required
                  value={hireTitle}
                  onChange={(e) => setHireTitle(e.target.value)}
                  className="w-full bg-[#18181b] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1">Estimated Budget (₹)</label>
                <input
                  type="number"
                  min={0}
                  value={hireBudget}
                  onChange={(e) => setHireBudget(e.target.value)}
                  className="w-full bg-[#18181b] border border-white/10 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1">Project Details & Tax Notes</label>
                <textarea
                  rows={3}
                  placeholder="Describe your ITR form type, capital gains, foreign assets, GST volume, or specific notice..."
                  value={hireNotes}
                  onChange={(e) => setHireNotes(e.target.value)}
                  className="w-full bg-[#18181b] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowHireModal(false)} className="border-white/10 text-xs">
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs">
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
                  Submit Proposal
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CHANGE CA MODAL */}
      {showChangeCAModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#111111] border border-white/10 rounded-2xl p-6 space-y-4 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-amber-400" /> Request CA Reassignment
              </h3>
              <button onClick={() => setShowChangeCAModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-300">
              TaxMate will facilitate a smooth handover of your vault documents and draft filings to a replacement practitioner.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-300 mb-1">Select Replacement CA</label>
                <select
                  value={changeTargetCaId}
                  onChange={(e) => setChangeTargetCaId(e.target.value)}
                  className="w-full bg-[#18181b] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                >
                  {caDirectory
                    .filter((c) => c.id !== myCA?.id)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.firm})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-300 mb-1">Reason for Reassignment</label>
                <select
                  value={changeReason}
                  onChange={(e) => setChangeReason(e.target.value)}
                  className="w-full bg-[#18181b] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Specialization mismatch">Specialization mismatch (e.g., need NRI / RSU specialist)</option>
                  <option value="Response delay">Response delay / Turnaround time</option>
                  <option value="Fee adjustment">Fee structure adjustment</option>
                  <option value="Other">Other personalized preference</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
              <Button variant="outline" size="sm" onClick={() => setShowChangeCAModal(false)} className="border-white/10 text-xs">
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={submitting}
                onClick={handleChangeCAConfirm}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs"
              >
                Confirm & Reassign
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* REMOVE CA MODAL */}
      {showRemoveCAModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#111111] border border-red-500/30 rounded-2xl p-6 space-y-4 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-base text-red-400 flex items-center gap-2">
                <UserMinus className="w-4 h-4 text-red-400" /> Remove CA Engagement
              </h3>
              <button onClick={() => setShowRemoveCAModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-300">
              Are you sure you want to end your engagement with <strong>{myCA?.name}</strong>? Your documents in the vault will remain private and accessible only by you.
            </p>

            <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
              <Button variant="outline" size="sm" onClick={() => setShowRemoveCAModal(false)} className="border-white/10 text-xs">
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={submitting}
                onClick={handleRemoveCAConfirm}
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
              >
                Remove CA
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* SEND CA INVITATION MODAL */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#111111] border border-white/10 rounded-2xl p-6 space-y-4 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400" /> Invite Your Personal CA to TaxMate
              </h3>
              <button onClick={() => setShowInviteModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-300">
              Already have a personal CA or firm? Invite them to TaxMate so they can access your Vault documents and e-file on your behalf securely.
            </p>

            <form onSubmit={handleSendExternalInvite} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-300 mb-1">CA Name</label>
                <input
                  type="text"
                  placeholder="CA Practice / Partner Name"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full bg-[#18181b] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1">CA Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="partner@cafirm.in"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full bg-[#18181b] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1">CA Mobile Number (Optional)</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={invitePhone}
                  onChange={(e) => setInvitePhone(e.target.value)}
                  className="w-full bg-[#18181b] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowInviteModal(false)} className="border-white/10 text-xs">
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs">
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
                  Send Invitation
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
