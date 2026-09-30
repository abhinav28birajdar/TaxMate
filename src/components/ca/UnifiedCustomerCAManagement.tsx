"use client";

import React, { useState } from "react";
import { 
  Users, 
  Search, 
  Filter, 
  Star, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Award, 
  Briefcase, 
  Phone, 
  Video, 
  MessageSquare, 
  UserCheck, 
  UserMinus, 
  RefreshCw, 
  Send, 
  Mail, 
  FileText, 
  ArrowRight, 
  X, 
  ChevronRight, 
  History, 
  DollarSign, 
  IndianRupee,
  Check,
  AlertCircle
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
  availability: string;
  specializations: string[];
  qualifications: string[];
  bio: string;
  services: { name: string; price: string; tat: string }[];
  reviews: { author: string; rating: number; date: string; comment: string }[];
}

export function UnifiedCustomerCAManagement({ initialTab = "my-ca" }: { initialTab?: "my-ca" | "find-ca" | "requests" | "history" }) {
  const [activeTab, setActiveTab] = useState<"my-ca" | "find-ca" | "requests" | "history">(initialTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPractice, setSelectedPractice] = useState("All");
  const [selectedCity, setSelectedCity] = useState("All");

  // Modals state
  const [selectedCA, setSelectedCA] = useState<CAProfile | null>(null);
  const [showHireModal, setShowHireModal] = useState(false);
  const [hireCA, setHireCA] = useState<CAProfile | null>(null);
  const [hireTitle, setHireTitle] = useState("ITR-2 Filing & Capital Gains Audit AY 2026-27");
  const [hireBudget, setHireBudget] = useState("3500");
  const [hireNotes, setHireNotes] = useState("Please review US stock RSUs, equity capital gains, and optimize regime selection.");

  const [showChangeCAModal, setShowChangeCAModal] = useState(false);
  const [changeReason, setChangeReason] = useState("Specialization mismatch");
  
  const [showRemoveCAModal, setShowRemoveCAModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitePhone, setInvitePhone] = useState("");
  const [inviteName, setInviteName] = useState("");

  // Sample Assigned CA Data
  const [myCA, setMyCA] = useState<CAProfile>({
    id: "ca-1",
    name: "CA Rajesh Sharma, FCA",
    firm: "Apex Tax & Audit Partners",
    membershipNo: "ICAI FCA #291048",
    experience: "14 Years",
    rating: 4.9,
    reviewsCount: 48,
    location: "Mumbai, Maharashtra",
    fee: "₹3,500 / filing",
    availability: "Available Today • Next slot 3:30 PM",
    specializations: ["Capital Gains Audit", "ITR-2 & ITR-3", "Schedule FA Foreign Assets", "GST Appeals"],
    qualifications: ["FCA (Fellow Chartered Accountant)", "DISA (ICAI Information Systems Auditor)", "LLB (Taxation)", "B.Com (Hons, SRCC)"],
    bio: "Senior partner with 14+ years advising 350+ tech founders, executives, and salaried professionals with complex equity capital gains and foreign asset holdings.",
    services: [
      { name: "ITR-2 Individual Filing (Salary & Capital Gains)", price: "₹3,500", tat: "2 Business Days" },
      { name: "Schedule FSI & FA Foreign Asset Declaration", price: "₹2,500", tat: "1 Business Day" },
      { name: "Old vs New Regime Section 115BAC Optimization", price: "Included", tat: "Same Day" },
      { name: "Income Tax Department Notice Resolution (Sec 143(1))", price: "₹4,500", tat: "3 Business Days" }
    ],
    reviews: [
      { author: "Aditya Verma (Tech Lead)", rating: 5, date: "15 Sep 2026", comment: "Rajesh saved me over ₹1.4L in tax by properly accounting for LTCG indexation on my property sale." },
      { author: "Pooja Hegde (Product Manager)", rating: 5, date: "28 Jul 2026", comment: "Super prompt response on US stock vesting RSUs. Filing was acknowledged within 24 hours!" }
    ]
  });

  // Directory CAs
  const caDirectory: CAProfile[] = [
    myCA,
    {
      id: "ca-2",
      name: "CA Priya Mehta, ACA",
      firm: "Mehta & Associates",
      membershipNo: "ICAI ACA #381920",
      experience: "9 Years",
      rating: 4.8,
      reviewsCount: 36,
      location: "Bengaluru, Karnataka",
      fee: "₹2,500 / filing",
      availability: "Available Tomorrow",
      specializations: ["Startup Taxation", "ESOP Taxation", "ITR-1 & ITR-2", "Angel Tax Compliance"],
      qualifications: ["ACA (Chartered Accountant)", "Dip. IFRS (ACCA UK)", "B.Com"],
      bio: "Bengaluru-based tax expert focused on tech employees with RSUs, startup founders, and angel investors.",
      services: [
        { name: "Startup & ESOP Tax Advisory", price: "₹4,000", tat: "2 Business Days" },
        { name: "Salaried ITR-1 Sahaj Filing", price: "₹1,500", tat: "24 Hours" }
      ],
      reviews: [
        { author: "Kiran R.", rating: 5, date: "10 Aug 2026", comment: "Seamless experience for startup ESOP exercise tax." }
      ]
    },
    {
      id: "ca-3",
      name: "CA Anish Kumar, FCA",
      firm: "Kumar Tax Advisory",
      membershipNo: "ICAI FCA #194829",
      experience: "11 Years",
      rating: 4.9,
      reviewsCount: 52,
      location: "Delhi-NCR",
      fee: "₹3,000 / filing",
      availability: "Available in 2 Days",
      specializations: ["NRI Taxation", "Section 195 TDS", "Form 15CA / 15CB", "DTAA Relief"],
      qualifications: ["FCA", "Certification in International Taxation (ICAI)"],
      bio: "Specialist in Cross-border Indian tax compliance, foreign remittance 15CA/CB certificates, and NRI bank taxation.",
      services: [
        { name: "Form 15CA / 15CB Certification", price: "₹5,000", tat: "24 Hours" },
        { name: "NRI ITR Filing with DTAA Relief", price: "₹6,000", tat: "3 Business Days" }
      ],
      reviews: [
        { author: "Sunil Shenoy (Dubai)", rating: 5, date: "02 Sep 2026", comment: "Handled my NRE/NRO remittance and 15CB smoothly." }
      ]
    },
    {
      id: "ca-4",
      name: "CA Vikramaditya Iyer",
      firm: "Apex Corporate Tax Advisory",
      membershipNo: "ICAI FCA #210982",
      experience: "16 Years",
      rating: 4.9,
      reviewsCount: 64,
      location: "Chennai, Tamil Nadu",
      fee: "₹5,000 / filing",
      availability: "Available Today",
      specializations: ["Corporate Tax Audit Sec 44AB", "Transfer Pricing", "TDS Returns 26Q/24Q"],
      qualifications: ["FCA", "CISA", "M.Com"],
      bio: "Senior corporate tax auditor handling SME audits, Section 44AB reports, and high net-worth individuals.",
      services: [
        { name: "Tax Audit Report Form 3CA/3CD", price: "₹15,000", tat: "5 Business Days" }
      ],
      reviews: [
        { author: "Ramanathan K.", rating: 5, date: "18 Jun 2026", comment: "Top notch tax auditor with thorough knowledge of GST reconciliation." }
      ]
    }
  ];

  // Requests Tracking State
  const [caRequests, setCaRequests] = useState([
    {
      id: "REQ-8910",
      caName: "CA Rajesh Sharma, FCA",
      firm: "Apex Tax & Audit Partners",
      service: "ITR-2 Filing & Capital Gains Audit AY 2026-27",
      budget: "₹3,500",
      status: "Assignment Confirmed & Active",
      date: "12 Oct 2026",
      badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
    },
    {
      id: "REQ-8902",
      caName: "CA Priya Mehta, ACA",
      firm: "Mehta & Associates",
      service: "ESOP Valuation Consultation",
      budget: "₹4,000",
      status: "Proposal Under Review",
      date: "25 Sep 2026",
      badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/30"
    }
  ]);

  // Relationship History State
  const relationshipHistory = [
    {
      id: "rel-1",
      caName: "CA Rajesh Sharma, FCA",
      firm: "Apex Tax & Audit Partners",
      period: "Jan 2025 - Present (Active)",
      filingsCount: 2,
      feesPaid: "₹7,000",
      notes: "Assigned for AY 2025-26 & AY 2026-27 filings.",
      status: "Active"
    },
    {
      id: "rel-2",
      caName: "CA Anish Kumar, FCA",
      firm: "Kumar Tax Advisory",
      period: "Jun 2024 - Dec 2024",
      filingsCount: 1,
      feesPaid: "₹3,000",
      notes: "Handled AY 2024-25 ITR-1 filing and TDS mismatch rectification.",
      status: "Completed & Archived"
    }
  ];

  const filteredCAs = caDirectory.filter((ca) => {
    if (selectedPractice !== "All" && !ca.specializations.some(s => s.toLowerCase().includes(selectedPractice.toLowerCase()))) {
      return false;
    }
    if (selectedCity !== "All" && !ca.location.toLowerCase().includes(selectedCity.toLowerCase())) {
      return false;
    }
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      return ca.name.toLowerCase().includes(q) || ca.firm.toLowerCase().includes(q) || ca.specializations.some(s => s.toLowerCase().includes(q));
    }
    return true;
  });

  const handleSendHireProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hireCA) return;

    const newReq = {
      id: `REQ-${Date.now().toString().slice(-4)}`,
      caName: hireCA.name,
      firm: hireCA.firm,
      service: hireTitle,
      budget: `₹${Number(hireBudget).toLocaleString("en-IN")}`,
      status: "Submitted (Awaiting CA Approval)",
      date: "Today",
      badgeClass: "bg-blue-500/10 text-blue-400 border-blue-500/30"
    };

    setCaRequests([newReq, ...caRequests]);
    setShowHireModal(false);
    toast.success(`Hire proposal sent to ${hireCA.name}!`);
    setActiveTab("requests");
  };

  const handleSendExternalInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail && !invitePhone) return;
    toast.success(`Invitation to join TaxMate sent to ${inviteName || "your CA"}!`);
    setShowInviteModal(false);
    setInviteEmail("");
    setInvitePhone("");
    setInviteName("");
  };

  const handleChangeCAConfirm = () => {
    toast.success("Request to change CA submitted. Platform coordinator will reassign your engagement within 4 business hours.");
    setShowChangeCAModal(false);
  };

  const handleRemoveCAConfirm = () => {
    toast.success("CA relationship removed. Engagement archived.");
    setShowRemoveCAModal(false);
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
            onClick={() => { setActiveTab("find-ca"); }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-[0_0_20px_rgba(5,150,105,0.4)]"
          >
            <Search className="w-3.5 h-3.5 mr-1.5" /> Find & Hire CA
          </Button>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 text-xs">
        {[
          { key: "my-ca", label: "My CA Overview" },
          { key: "find-ca", label: "CA Directory & Search" },
          { key: "requests", label: `CA Requests & Approval (${caRequests.length})` },
          { key: "history", label: "Relationship History" }
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key as any)}
            className={`px-3.5 py-2 rounded-xl font-semibold transition-all ${
              activeTab === t.key
                ? "bg-emerald-600 text-white shadow-[0_0_15px_rgba(5,150,105,0.4)] font-bold"
                : "bg-[#141414] hover:bg-[#1A1A1A] text-gray-400 hover:text-white border border-white/5"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: MY CA OVERVIEW */}
      {activeTab === "my-ca" && (
        <div className="space-y-6">
          {/* Main Assigned CA Banner Card */}
          <div className="p-6 rounded-2xl bg-[#111111] border border-emerald-500/30 shadow-2xl relative overflow-hidden space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-600/20 text-emerald-400 font-extrabold flex items-center justify-center text-xl border border-emerald-500/30 shrink-0">
                  RS
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
                  <p className="text-xs text-gray-300">{myCA.firm} • {myCA.location}</p>
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
                <span className="text-gray-400">Current Engagement</span>
                <p className="font-bold text-emerald-400 mt-0.5">AY 2026-27 ITR-2 Filing</p>
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
                  <span key={sp} className="px-2.5 py-1 bg-white/5 text-gray-300 text-[10px] font-semibold rounded-lg border border-white/5">
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
        </div>
      )}

      {/* TAB 2: FIND CA & CA DIRECTORY */}
      {activeTab === "find-ca" && (
        <div className="space-y-6">
          {/* Search & Filter Header */}
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
                  <option value="ITR">ITR-1 / ITR-2</option>
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
                  <option value="Mumbai">Mumbai</option>
                  <option value="Bengaluru">Bengaluru</option>
                  <option value="Delhi">Delhi-NCR</option>
                  <option value="Chennai">Chennai</option>
                </select>
              </div>
            </div>
          </div>

          {/* CA Directory Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredCAs.map((ca) => (
              <div key={ca.id} className="bg-[#111111] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4 hover:border-emerald-500/40 transition-all flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-xl bg-emerald-600/10 text-emerald-400 font-bold flex items-center justify-center text-base border border-emerald-500/20">
                      {ca.name.split(' ')[1]?.charAt(0) || 'C'}
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
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-gray-400" /> {ca.location}</span>
                    <span>• {ca.experience} Exp</span>
                  </div>

                  <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed">
                    {ca.bio}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {ca.specializations.slice(0, 3).map((sp) => (
                      <span key={sp} className="px-2 py-0.5 bg-[#18181b] text-gray-300 text-[10px] font-semibold rounded-md border border-white/5">
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
                      onClick={() => { setHireCA(ca); setShowHireModal(true); }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md shadow-emerald-600/20"
                    >
                      Request CA
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CA REQUESTS & APPROVAL STATUS */}
      {activeTab === "requests" && (
        <div className="bg-[#111111] rounded-2xl border border-white/10 overflow-hidden shadow-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="font-bold text-base text-white">CA Engagement Proposals & Request Status</h3>
              <p className="text-xs text-gray-400 mt-0.5">Track real-time approval status, terms acceptance, and CA assignment confirmations.</p>
            </div>
            <span className="text-xs font-mono text-emerald-400">{caRequests.length} Active Requests</span>
          </div>

          <div className="space-y-3">
            {caRequests.map((req) => (
              <div key={req.id} className="p-4 bg-[#18181b] rounded-xl border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-gray-400">{req.id}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${req.badgeClass}`}>
                      {req.status}
                    </span>
                    <span className="text-xs text-gray-500">• {req.date}</span>
                  </div>
                  <h4 className="font-bold text-sm text-white">{req.service}</h4>
                  <p className="text-xs text-gray-400">Assigned To: <strong className="text-emerald-400">{req.caName}</strong> ({req.firm})</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 block">Proposed Fee</span>
                    <span className="font-mono font-bold text-white text-sm">{req.budget}</span>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toast.success(`Viewing full proposal terms for ${req.id}`)}
                    className="border-white/10 text-xs"
                  >
                    View Terms
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: RELATIONSHIP HISTORY */}
      {activeTab === "history" && (
        <div className="bg-[#111111] rounded-2xl border border-white/10 overflow-hidden shadow-xl p-6 space-y-4">
          <div className="border-b border-white/10 pb-4">
            <h3 className="font-bold text-base text-white">CA Relationship History & Handover Records</h3>
            <p className="text-xs text-gray-400 mt-0.5">Historical records of all Chartered Accountants who filed on your behalf.</p>
          </div>

          <div className="space-y-3">
            {relationshipHistory.map((item) => (
              <div key={item.id} className="p-4 bg-[#18181b] rounded-xl border border-white/5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-sm text-white flex items-center gap-2">
                      {item.caName}
                      <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold border ${
                        item.status.includes("Active") ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-white/5 text-gray-400 border-white/10"
                      }`}>
                        {item.status}
                      </span>
                    </h4>
                    <p className="text-xs text-gray-400">{item.firm} • {item.period}</p>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono">
                    <div>
                      <span className="text-gray-500">Filings Completed:</span>
                      <p className="font-bold text-white">{item.filingsCount}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Total Fees Settled:</span>
                      <p className="font-bold text-emerald-400">{item.feesPaid}</p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-300 bg-[#111111] p-2.5 rounded-lg border border-white/5">
                  {item.notes}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CA FULL PROFILE MODAL (Services, Experience, Qualifications, Reviews, Availability) */}
      {selectedCA && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-[#111111] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-5 text-white shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase">{selectedCA.membershipNo}</span>
                <h3 className="text-xl font-bold text-white flex items-center gap-2 mt-0.5">
                  {selectedCA.name} <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </h3>
                <p className="text-xs text-gray-400">{selectedCA.firm} • {selectedCA.location} • {selectedCA.experience} Experience</p>
              </div>
              <button onClick={() => setSelectedCA(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Bio & Availability */}
              <div className="p-3.5 bg-[#18181b] rounded-xl border border-white/5 space-y-1.5">
                <span className="font-bold text-emerald-400">About Practitioner:</span>
                <p className="text-gray-300 leading-relaxed">{selectedCA.bio}</p>
                <div className="pt-2 flex items-center gap-1.5 text-gray-400 font-mono text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" /> {selectedCA.availability}
                </div>
              </div>

              {/* Qualifications */}
              <div className="space-y-1.5">
                <span className="font-bold text-white">Qualifications & Accreditations:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedCA.qualifications.map((q) => (
                    <div key={q} className="p-2.5 bg-[#18181b] rounded-lg border border-white/5 flex items-center gap-2 text-gray-200">
                      <Award className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{q}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Services Offered */}
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

              {/* Reviews */}
              <div className="space-y-1.5">
                <span className="font-bold text-white">Client Reviews & Testimonials:</span>
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
                  value={hireBudget}
                  onChange={(e) => setHireBudget(e.target.value)}
                  className="w-full bg-[#18181b] border border-white/10 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1">Project Details & Tax Notes</label>
                <textarea
                  rows={3}
                  value={hireNotes}
                  onChange={(e) => setHireNotes(e.target.value)}
                  className="w-full bg-[#18181b] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowHireModal(false)} className="border-white/10 text-xs">
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs">
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
              TaxMate will facilitate a smooth handover of your Form 16, bank statements, and draft return to another verified practitioner.
            </p>

            <div className="space-y-3 text-xs">
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
              <Button size="sm" onClick={handleChangeCAConfirm} className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs">
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
              Are you sure you want to end your engagement with <strong>{myCA.name}</strong>? Your documents in the vault will remain private and accessible only by you.
            </p>

            <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
              <Button variant="outline" size="sm" onClick={() => setShowRemoveCAModal(false)} className="border-white/10 text-xs">
                Cancel
              </Button>
              <Button size="sm" onClick={handleRemoveCAConfirm} className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs">
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
                  placeholder="e.g. CA Suresh Patel"
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
                  placeholder="ca@pateltaxadvisory.in"
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
                <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs">
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
