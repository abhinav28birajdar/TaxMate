"use client";

import React, { useState } from "react";
import { 
  FileText, 
  Upload, 
  Download, 
  Trash2, 
  Search, 
  Filter, 
  Sparkles, 
  Plus, 
  Camera, 
  Image as ImageIcon, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Eye, 
  X, 
  Check, 
  RefreshCw,
  FolderLock,
  Layers,
  ArrowRight,
  Share2,
  Edit2,
  FileCheck,
  FileX,
  History,
  Copy,
  ExternalLink,
  ShieldAlert,
  Calendar,
  Lock,
  Tag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export type DocumentLifecycleStatus = 
  | "All Documents"
  | "My Documents"
  | "CA Requested"
  | "Pending"
  | "Submitted"
  | "Verified"
  | "Rejected"
  | "Expired";

export const DOCUMENT_CATEGORIES = [
  "All Categories",
  "PAN",
  "Aadhaar",
  "Form 16",
  "Salary Slips",
  "Bank Statements",
  "Investment Proofs",
  "Insurance Documents",
  "Loan Documents",
  "Property Documents",
  "Rent Documents",
  "Business Documents",
  "GST Documents",
  "ITR Documents",
  "Tax Receipts",
  "Other Documents"
] as const;

export type DocumentCategoryType = typeof DOCUMENT_CATEGORIES[number];

export interface VaultDocument {
  id: string;
  name: string;
  category: DocumentCategoryType;
  lifecycleStatus: "My Documents" | "CA Requested" | "Pending" | "Submitted" | "Verified" | "Rejected" | "Expired";
  size: string;
  uploadedAt: string;
  assessmentYear: string;
  tags?: string[];
  rejectionReason?: string;
  ocrStatus: "Extracted & Verified" | "Processing" | "Needs Review" | "Failed";
  extractedData?: {
    pan?: string;
    grossIncome?: string;
    tdsDeducted?: string;
    assessmentYear?: string;
    issuer?: string;
  };
  versions: { version: string; date: string; size: string; notes?: string }[];
  history: { action: string; timestamp: string; user: string }[];
}

export function UnifiedDocumentVault({ portal = "client" }: { portal: "client" | "ca" }) {
  const [selectedStatusTab, setSelectedStatusTab] = useState<DocumentLifecycleStatus>("All Documents");
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategoryType>("All Categories");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modals state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTab, setUploadTab] = useState<"device" | "camera" | "multiple">("device");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  const [previewDoc, setPreviewDoc] = useState<VaultDocument | null>(null);
  const [detailsTab, setDetailsTab] = useState<"preview" | "details" | "history" | "versions">("preview");
  
  const [editInfoDoc, setEditInfoDoc] = useState<VaultDocument | null>(null);
  const [editDocName, setEditDocName] = useState("");
  const [editDocCategory, setEditDocCategory] = useState<DocumentCategoryType>("Other Documents");
  const [editDocAY, setEditDocAY] = useState("2026-27");
  
  const [renameDoc, setRenameDoc] = useState<VaultDocument | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const [shareDoc, setShareDoc] = useState<VaultDocument | null>(null);
  const [shareLink, setShareLink] = useState("");
  const [sharePassword, setSharePassword] = useState("TaxMate@2026");
  const [shareExpiryDays, setShareExpiryDays] = useState("7");

  // Initial Documents with full 15 categories & 8 statuses
  const [documents, setDocuments] = useState<VaultDocument[]>([
    {
      id: "doc-1",
      name: "Form 16 Part A & B AY 2026-27.pdf",
      category: "Form 16",
      lifecycleStatus: "Verified",
      size: "2.4 MB",
      uploadedAt: "Today, 09:30 AM",
      assessmentYear: "2026-27",
      tags: ["TDS", "Form 16", "Salary"],
      ocrStatus: "Extracted & Verified",
      extractedData: {
        pan: "ABCDE1234F",
        grossIncome: "₹18,50,000",
        tdsDeducted: "₹2,23,000",
        assessmentYear: "2026-27",
        issuer: "TechNova Technologies Ltd"
      },
      versions: [
        { version: "v2.0 (Digitally Signed)", date: "Today, 09:30 AM", size: "2.4 MB", notes: "Signed copy with DSC" },
        { version: "v1.0 (Draft)", date: "Yesterday, 04:15 PM", size: "2.3 MB", notes: "Initial PDF download" }
      ],
      history: [
        { action: "Uploaded via Device", timestamp: "Yesterday 04:15 PM", user: "You" },
        { action: "OCR Extraction Complete", timestamp: "Yesterday 04:16 PM", user: "System Tesseract OCR" },
        { action: "Verified by CA", timestamp: "Today 10:00 AM", user: "CA Rajesh Sharma" }
      ]
    },
    {
      id: "doc-2",
      name: "HDFC Bank Statement Q2 FY26.pdf",
      category: "Bank Statements",
      lifecycleStatus: "Verified",
      size: "4.8 MB",
      uploadedAt: "18 Oct 2026",
      assessmentYear: "2026-27",
      tags: ["Bank", "Interest", "Savings"],
      ocrStatus: "Extracted & Verified",
      extractedData: {
        pan: "ABCDE1234F",
        grossIncome: "₹1,40,000 Interest",
        tdsDeducted: "₹14,000",
        assessmentYear: "2026-27",
        issuer: "HDFC Bank Ltd"
      },
      versions: [{ version: "v1.0", date: "18 Oct 2026", size: "4.8 MB", notes: "E-statement exported from NetBanking" }],
      history: [
        { action: "Uploaded via Device", timestamp: "18 Oct 2026", user: "You" },
        { action: "Verified by System", timestamp: "18 Oct 2026", user: "TaxMate Automated Verification" }
      ]
    },
    {
      id: "doc-3",
      name: "PAN Card Copy Verified.pdf",
      category: "PAN",
      lifecycleStatus: "Verified",
      size: "0.8 MB",
      uploadedAt: "10 Oct 2026",
      assessmentYear: "Permanent",
      tags: ["Identity", "PAN", "KYC"],
      ocrStatus: "Extracted & Verified",
      extractedData: {
        pan: "ABCDE1234F",
        issuer: "Income Tax Department"
      },
      versions: [{ version: "v1.0", date: "10 Oct 2026", size: "0.8 MB" }],
      history: [{ action: "Uploaded during Onboarding", timestamp: "10 Oct 2026", user: "You" }]
    },
    {
      id: "doc-4",
      name: "Aadhaar Card Masked Copy.pdf",
      category: "Aadhaar",
      lifecycleStatus: "Verified",
      size: "1.2 MB",
      uploadedAt: "10 Oct 2026",
      assessmentYear: "Permanent",
      tags: ["Identity", "Aadhaar", "UIDAI"],
      ocrStatus: "Extracted & Verified",
      versions: [{ version: "v1.0", date: "10 Oct 2026", size: "1.2 MB" }],
      history: [{ action: "UIDAI e-KYC Verified", timestamp: "10 Oct 2026", user: "You" }]
    },
    {
      id: "doc-5",
      name: "August 2026 Salary Slip.pdf",
      category: "Salary Slips",
      lifecycleStatus: "Submitted",
      size: "0.5 MB",
      uploadedAt: "12 Oct 2026",
      assessmentYear: "2026-27",
      tags: ["Payslip", "Salary", "August"],
      ocrStatus: "Extracted & Verified",
      extractedData: { grossIncome: "₹1,54,000", tdsDeducted: "₹18,500" },
      versions: [{ version: "v1.0", date: "12 Oct 2026", size: "0.5 MB" }],
      history: [{ action: "Uploaded via Camera Scan", timestamp: "12 Oct 2026", user: "You" }]
    },
    {
      id: "doc-6",
      name: "Star Health Mediclaim 80D Premium Receipt.pdf",
      category: "Insurance Documents",
      lifecycleStatus: "Verified",
      size: "1.1 MB",
      uploadedAt: "15 Oct 2026",
      assessmentYear: "2026-27",
      tags: ["80D", "Health Insurance"],
      ocrStatus: "Extracted & Verified",
      extractedData: { grossIncome: "₹35,000 Premium", issuer: "Star Health & Allied" },
      versions: [{ version: "v1.0", date: "15 Oct 2026", size: "1.1 MB" }],
      history: [{ action: "Verified by CA", timestamp: "16 Oct 2026", user: "CA Rajesh Sharma" }]
    },
    {
      id: "doc-7",
      name: "PPF Contribution Receipt SBI 80C.pdf",
      category: "Investment Proofs",
      lifecycleStatus: "Verified",
      size: "0.9 MB",
      uploadedAt: "14 Oct 2026",
      assessmentYear: "2026-27",
      tags: ["80C", "PPF", "Tax Saver"],
      ocrStatus: "Extracted & Verified",
      extractedData: { grossIncome: "₹70,000 Deposited", issuer: "State Bank of India" },
      versions: [{ version: "v1.0", date: "14 Oct 2026", size: "0.9 MB" }],
      history: [{ action: "Verified for Old Regime Deductions", timestamp: "15 Oct 2026", user: "CA Rajesh Sharma" }]
    },
    {
      id: "doc-8",
      name: "Home Loan Provisional Interest Certificate.pdf",
      category: "Loan Documents",
      lifecycleStatus: "Verified",
      size: "1.4 MB",
      uploadedAt: "16 Oct 2026",
      assessmentYear: "2026-27",
      tags: ["Sec 24b", "Home Loan", "Interest"],
      ocrStatus: "Extracted & Verified",
      extractedData: { grossIncome: "₹1,20,000 Interest", issuer: "Axis Bank Housing Loans" },
      versions: [{ version: "v1.0", date: "16 Oct 2026", size: "1.4 MB" }],
      history: [{ action: "Attached to ITR-2 Computation", timestamp: "17 Oct 2026", user: "CA Rajesh Sharma" }]
    },
    {
      id: "doc-9",
      name: "House Property Registered Rent Agreement.pdf",
      category: "Rent Documents",
      lifecycleStatus: "Submitted",
      size: "3.5 MB",
      uploadedAt: "21 Oct 2026",
      assessmentYear: "2026-27",
      tags: ["Rental", "HRA", "Agreement"],
      ocrStatus: "Processing",
      versions: [{ version: "v1.0", date: "21 Oct 2026", size: "3.5 MB" }],
      history: [{ action: "Uploaded via Device", timestamp: "21 Oct 2026", user: "You" }]
    },
    {
      id: "doc-10",
      name: "Registered Sale Deed Property Purchase.pdf",
      category: "Property Documents",
      lifecycleStatus: "My Documents",
      size: "7.2 MB",
      uploadedAt: "05 Oct 2026",
      assessmentYear: "Permanent",
      tags: ["Real Estate", "Title Deed"],
      ocrStatus: "Extracted & Verified",
      versions: [{ version: "v1.0", date: "05 Oct 2026", size: "7.2 MB" }],
      history: [{ action: "Added to Vault", timestamp: "05 Oct 2026", user: "You" }]
    },
    {
      id: "doc-11",
      name: "CA Requested Zerodha Capital Gains P&L.xlsx",
      category: "Investment Proofs",
      lifecycleStatus: "CA Requested",
      size: "3.2 MB",
      uploadedAt: "20 Oct 2026",
      assessmentYear: "2026-27",
      tags: ["LTCG", "Broker Report", "Urgent"],
      ocrStatus: "Needs Review",
      extractedData: { grossIncome: "₹2,10,000 Gains", issuer: "Zerodha Broking Ltd" },
      versions: [{ version: "v1.0", date: "20 Oct 2026", size: "3.2 MB" }],
      history: [{ action: "Requested by CA Rajesh Sharma", timestamp: "19 Oct 2026", user: "CA Rajesh Sharma" }]
    },
    {
      id: "doc-12",
      name: "GSTR-1 Filed Return ARN Summary.pdf",
      category: "GST Documents",
      lifecycleStatus: "Verified",
      size: "1.8 MB",
      uploadedAt: "22 Oct 2026",
      assessmentYear: "2026-27",
      tags: ["GST", "GSTR-1", "ARN"],
      ocrStatus: "Extracted & Verified",
      versions: [{ version: "v1.0", date: "22 Oct 2026", size: "1.8 MB" }],
      history: [{ action: "Auto-synced from GSTN", timestamp: "22 Oct 2026", user: "System" }]
    },
    {
      id: "doc-13",
      name: "AY 2025-26 Filed ITR-1 Acknowledgement.pdf",
      category: "ITR Documents",
      lifecycleStatus: "Verified",
      size: "0.7 MB",
      uploadedAt: "25 Jul 2025",
      assessmentYear: "2025-26",
      tags: ["ITR-V", "Past Return"],
      ocrStatus: "Extracted & Verified",
      versions: [{ version: "v1.0", date: "25 Jul 2025", size: "0.7 MB" }],
      history: [{ action: "Filed with CPC Bengaluru", timestamp: "25 Jul 2025", user: "TaxMate" }]
    },
    {
      id: "doc-14",
      name: "Challan 280 Self Assessment Tax (₹25,000).pdf",
      category: "Tax Receipts",
      lifecycleStatus: "Verified",
      size: "0.6 MB",
      uploadedAt: "15 Sep 2026",
      assessmentYear: "2026-27",
      tags: ["Challan 280", "CIN: 002910"],
      ocrStatus: "Extracted & Verified",
      extractedData: { tdsDeducted: "₹25,000", issuer: "State Bank of India" },
      versions: [{ version: "v1.0", date: "15 Sep 2026", size: "0.6 MB" }],
      history: [{ action: "CIN Verified with ITD e-Pay Tax", timestamp: "16 Sep 2026", user: "System" }]
    },
    {
      id: "doc-15",
      name: "Blurry Medical Bill Receipt (Re-upload Needed).jpg",
      category: "Other Documents",
      lifecycleStatus: "Rejected",
      rejectionReason: "Invoice resolution too low; GSTIN & Doctor registration number illegible.",
      size: "0.3 MB",
      uploadedAt: "22 Oct 2026",
      assessmentYear: "2026-27",
      tags: ["Medical", "Rejected"],
      ocrStatus: "Failed",
      versions: [{ version: "v1.0", date: "22 Oct 2026", size: "0.3 MB" }],
      history: [{ action: "Marked Rejected by CA", timestamp: "23 Oct 2026", user: "CA Rajesh Sharma" }]
    },
    {
      id: "doc-16",
      name: "Rent Agreement 2023-2024 Expired.pdf",
      category: "Rent Documents",
      lifecycleStatus: "Expired",
      size: "2.1 MB",
      uploadedAt: "10 Mar 2024",
      assessmentYear: "2024-25",
      tags: ["Expired", "Tenancy"],
      ocrStatus: "Extracted & Verified",
      versions: [{ version: "v1.0", date: "10 Mar 2024", size: "2.1 MB" }],
      history: [{ action: "Agreement Expired on 31 Mar 2024", timestamp: "01 Apr 2024", user: "System" }]
    },
    {
      id: "doc-17",
      name: "Pending Shareholder Resolution Document.docx",
      category: "Business Documents",
      lifecycleStatus: "Pending",
      size: "1.3 MB",
      uploadedAt: "Yesterday",
      assessmentYear: "2026-27",
      tags: ["MCA", "Corporate"],
      ocrStatus: "Needs Review",
      versions: [{ version: "v1.0", date: "Yesterday", size: "1.3 MB" }],
      history: [{ action: "Uploaded by CFO", timestamp: "Yesterday", user: "Corporate User" }]
    }
  ]);

  // Filtering Logic
  const filteredDocuments = documents.filter((doc) => {
    // Status Filter
    if (selectedStatusTab === "My Documents" && doc.lifecycleStatus !== "My Documents") {
      // My Documents includes all user-uploaded docs that aren't CA-requested
      if (doc.lifecycleStatus === "CA Requested") return false;
    } else if (selectedStatusTab === "CA Requested" && doc.lifecycleStatus !== "CA Requested") {
      return false;
    } else if (selectedStatusTab === "Pending" && doc.lifecycleStatus !== "Pending") {
      return false;
    } else if (selectedStatusTab === "Submitted" && doc.lifecycleStatus !== "Submitted") {
      return false;
    } else if (selectedStatusTab === "Verified" && doc.lifecycleStatus !== "Verified") {
      return false;
    } else if (selectedStatusTab === "Rejected" && doc.lifecycleStatus !== "Rejected") {
      return false;
    } else if (selectedStatusTab === "Expired" && doc.lifecycleStatus !== "Expired") {
      return false;
    }

    // Category Filter
    if (selectedCategory !== "All Categories" && doc.category !== selectedCategory) {
      return false;
    }

    // Search Query
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const matchName = doc.name.toLowerCase().includes(q);
      const matchCat = doc.category.toLowerCase().includes(q);
      const matchTag = doc.tags?.some(t => t.toLowerCase().includes(q));
      if (!matchName && !matchCat && !matchTag) return false;
    }

    return true;
  });

  // Upload Simulation
  const handleSimulateUpload = (fileName: string, category: DocumentCategoryType) => {
    setIsUploading(true);
    setUploadProgress(15);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          setTimeout(() => {
            setIsUploading(false);
            setUploadProgress(0);
            setShowUploadModal(false);

            const newDoc: VaultDocument = {
              id: `doc-${Date.now()}`,
              name: fileName,
              category: category,
              lifecycleStatus: "Submitted",
              size: "2.1 MB",
              uploadedAt: "Just now",
              assessmentYear: "2026-27",
              tags: ["Newly Uploaded", category],
              ocrStatus: "Extracted & Verified",
              extractedData: {
                pan: "ABCDE1234F",
                grossIncome: "₹14,50,000",
                tdsDeducted: "₹1,82,000",
                assessmentYear: "2026-27",
                issuer: "Detected via Tesseract OCR Engine"
              },
              versions: [{ version: "v1.0", date: "Just now", size: "2.1 MB", notes: "Initial file upload" }],
              history: [
                { action: `Uploaded via ${uploadTab}`, timestamp: "Just now", user: "You" },
                { action: "Tesseract OCR Completed", timestamp: "Just now", user: "System OCR" }
              ]
            };

            setDocuments([newDoc, ...documents]);
            toast.success(`"${fileName}" uploaded & OCR data parsed successfully!`);
          }, 500);
          return 100;
        }
        return prev + 25;
      });
    }, 200);
  };

  // Delete Action
  const handleDeleteDocument = (id: string) => {
    setDocuments(documents.filter((d) => d.id !== id));
    toast.success("Document removed from vault.");
    if (previewDoc?.id === id) setPreviewDoc(null);
  };

  // Rename Action
  const handleSaveRename = () => {
    if (!renameDoc || !renameValue.trim()) return;
    setDocuments(documents.map(d => d.id === renameDoc.id ? {
      ...d,
      name: renameValue.trim(),
      history: [...d.history, { action: `Renamed to "${renameValue.trim()}"`, timestamp: "Just now", user: "You" }]
    } : d));
    toast.success("Document renamed successfully.");
    setRenameDoc(null);
  };

  // Edit Information Action
  const handleSaveEditInfo = () => {
    if (!editInfoDoc) return;
    setDocuments(documents.map(d => d.id === editInfoDoc.id ? {
      ...d,
      name: editDocName,
      category: editDocCategory,
      assessmentYear: editDocAY,
      history: [...d.history, { action: "Updated metadata & category", timestamp: "Just now", user: "You" }]
    } : d));
    toast.success("Document information updated.");
    setEditInfoDoc(null);
  };

  // Share Action
  const handleOpenShare = (doc: VaultDocument) => {
    setShareDoc(doc);
    setShareLink(`https://taxmate.in/vault/shared/${doc.id}?key=${Math.random().toString(36).substring(7)}`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-white">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <FolderLock className="w-6 h-6 text-emerald-400" /> Customer Documents Vault & OCR Engine
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            256-bit AES encrypted repository with automated parsing across all 15 tax document categories.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => { setShowUploadModal(true); setUploadTab("device"); }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-[0_0_20px_rgba(5,150,105,0.4)]"
          >
            <Upload className="w-4 h-4 mr-1.5" /> Upload Document
          </Button>
        </div>
      </div>

      {/* 8 Status Filter Tabs (Documents Dashboard) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs border-b border-white/10">
        {[
          "All Documents",
          "My Documents",
          "CA Requested",
          "Pending",
          "Submitted",
          "Verified",
          "Rejected",
          "Expired"
        ].map((tab) => {
          const count = documents.filter((d) => {
            if (tab === "All Documents") return true;
            if (tab === "My Documents") return d.lifecycleStatus !== "CA Requested";
            return d.lifecycleStatus === tab;
          }).length;

          return (
            <button
              key={tab}
              onClick={() => setSelectedStatusTab(tab as DocumentLifecycleStatus)}
              className={`px-3 py-2 border-b-2 font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedStatusTab === tab
                  ? "border-emerald-500 text-emerald-400"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              <span>{tab}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                selectedStatusTab === tab ? "bg-emerald-500/20 text-emerald-300" : "bg-white/5 text-gray-400"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 15 Category Pills & Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Category Horizontal Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            {DOCUMENT_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-all text-xs ${
                  selectedCategory === cat
                    ? "bg-emerald-600 text-white font-bold shadow-[0_0_15px_rgba(5,150,105,0.4)]"
                    : "bg-[#141414] hover:bg-[#1A1A1A] text-gray-400 hover:text-white border border-white/5"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72 shrink-0">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search document, category, tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#111111] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-[#111111] rounded-2xl border border-white/10 overflow-hidden shadow-xl">
        <div className="p-3.5 border-b border-white/10 flex items-center justify-between text-xs text-gray-400">
          <span>Showing <strong className="text-white">{filteredDocuments.length}</strong> documents matching filters</span>
          <span className="font-mono text-[11px]">End-to-End Encrypted Storage</span>
        </div>

        <table className="w-full text-left text-xs text-gray-300">
          <thead className="bg-[#18181b] text-white font-semibold border-b border-white/10">
            <tr>
              <th className="py-3.5 px-4">Document Title</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">AY / FY</th>
              <th className="py-3.5 px-4">OCR Status</th>
              <th className="py-3.5 px-4">Size</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredDocuments.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-gray-500">
                  <FolderLock className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  No documents found matching the selected status or category filters.
                </td>
              </tr>
            ) : (
              filteredDocuments.map((doc) => (
                <tr key={doc.id} className="hover:bg-[#18181b]/50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-white">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <span 
                          className="cursor-pointer hover:text-emerald-400 transition-colors"
                          onClick={() => { setPreviewDoc(doc); setDetailsTab("preview"); }}
                        >
                          {doc.name}
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-normal mt-0.5">
                          <span>{doc.uploadedAt}</span>
                          {doc.tags && doc.tags.map(t => (
                            <span key={t} className="px-1.5 py-0.2 rounded bg-white/5 text-gray-400">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-md bg-[#18181b] border border-white/5 font-semibold text-emerald-300 text-[11px]">
                      {doc.category}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      doc.lifecycleStatus === "Verified"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : doc.lifecycleStatus === "CA Requested"
                        ? "bg-purple-500/10 text-purple-400 border-purple-500/30"
                        : doc.lifecycleStatus === "Rejected"
                        ? "bg-red-500/10 text-red-400 border-red-500/30"
                        : doc.lifecycleStatus === "Expired"
                        ? "bg-gray-500/10 text-gray-400 border-gray-500/30"
                        : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                    }`}>
                      {doc.lifecycleStatus}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-mono">{doc.assessmentYear}</td>

                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 inline-flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> {doc.ocrStatus}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-gray-400">{doc.size}</td>

                  <td className="py-3.5 px-4 text-right space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => { setPreviewDoc(doc); setDetailsTab("preview"); }}
                      className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 text-xs h-7 px-2"
                      title="Preview Document"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditInfoDoc(doc);
                        setEditDocName(doc.name);
                        setEditDocCategory(doc.category);
                        setEditDocAY(doc.assessmentYear);
                      }}
                      className="text-gray-300 hover:text-white text-xs h-7 px-2"
                      title="Edit Information"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleOpenShare(doc)}
                      className="text-gray-300 hover:text-white text-xs h-7 px-2"
                      title="Share Document"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toast.success(`Downloading "${doc.name}"`)}
                      className="text-gray-300 hover:text-white text-xs h-7 px-2"
                      title="Download File"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="text-gray-400 hover:text-red-400 text-xs h-7 px-2"
                      title="Delete Document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* UPLOAD DOCUMENT MODAL (Device, Camera, Multiple) */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-[#111111] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-5 text-white shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Upload className="w-5 h-5 text-emerald-400" /> Upload Tax Documents
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">Automated OCR and security virus scan enabled.</p>
              </div>
              <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 3 Upload Mode Tabs */}
            <div className="grid grid-cols-3 gap-2 text-xs font-semibold">
              <button
                onClick={() => setUploadTab("device")}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  uploadTab === "device" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500" : "bg-[#18181b] border-white/5 text-gray-400"
                }`}
              >
                Upload From Device
              </button>
              <button
                onClick={() => setUploadTab("camera")}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  uploadTab === "camera" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500" : "bg-[#18181b] border-white/5 text-gray-400"
                }`}
              >
                Upload From Camera
              </button>
              <button
                onClick={() => setUploadTab("multiple")}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  uploadTab === "multiple" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500" : "bg-[#18181b] border-white/5 text-gray-400"
                }`}
              >
                Upload Multiple Documents
              </button>
            </div>

            {/* Upload Area */}
            <div className="border-2 border-dashed border-white/10 hover:border-emerald-500/40 rounded-2xl p-8 text-center space-y-3 bg-[#141414] transition-all">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/20">
                {uploadTab === "camera" ? <Camera className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
              </div>
              <div>
                <p className="text-sm font-bold text-white">
                  {uploadTab === "camera" 
                    ? "Camera Scan: Hold Form 16 or Rent Agreement flat in good light"
                    : uploadTab === "multiple"
                    ? "Batch Upload: Drag and drop multiple PDF/JPG/PNG files"
                    : "Click to select or drag and drop file from your computer"}
                </p>
                <p className="text-[11px] text-gray-400 mt-1">PDF, JPG, PNG up to 25 MB per document</p>
              </div>

              {isUploading ? (
                <div className="space-y-2 pt-2 max-w-xs mx-auto">
                  <div className="flex justify-between text-xs text-emerald-400 font-mono">
                    <span>Extracting Tax Data via Tesseract OCR...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-[#18181b] rounded-full h-2 overflow-hidden border border-white/5">
                    <div
                      className="bg-emerald-500 h-full transition-all duration-200"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="pt-2">
                  <Button
                    onClick={() => handleSimulateUpload(
                      uploadTab === "camera" ? "Camera_Scanned_Document.pdf" : uploadTab === "multiple" ? "Batch_Upload_Documents.zip" : "Form_16_Salary_AY2026.pdf",
                      "Form 16"
                    )}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-[0_0_15px_rgba(5,150,105,0.4)]"
                  >
                    {uploadTab === "camera" ? "Capture & Process OCR" : "Select & Start Upload"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DOCUMENT PREVIEW & DETAILS DRAWER MODAL */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-3xl bg-[#111111] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-5 text-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase">{previewDoc.category}</span>
                <h3 className="font-bold text-lg text-white mt-0.5">{previewDoc.name}</h3>
                <span className="text-xs text-gray-400 font-mono">Size: {previewDoc.size} • Uploaded: {previewDoc.uploadedAt} • AY: {previewDoc.assessmentYear}</span>
              </div>
              <button onClick={() => setPreviewDoc(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Inner Subtabs: Preview | Details | Versions | History */}
            <div className="flex gap-2 border-b border-white/10 pb-2 text-xs">
              {(["preview", "details", "versions", "history"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setDetailsTab(tab)}
                  className={`px-3 py-1.5 rounded-lg capitalize font-semibold ${
                    detailsTab === tab ? "bg-emerald-600 text-white" : "bg-[#18181b] text-gray-400 hover:text-white"
                  }`}
                >
                  {tab === "details" ? "Document Details & OCR" : tab}
                </button>
              ))}
            </div>

            {/* Tab: Preview */}
            {detailsTab === "preview" && (
              <div className="aspect-[16/9] bg-[#18181b] border border-white/5 rounded-xl p-6 flex flex-col justify-between font-mono text-xs text-gray-300">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="font-bold text-white">TAX DOCUMENT OFFICIAL ARCHIVE</span>
                  <span className="text-emerald-400">PAN: {previewDoc.extractedData?.pan || "ABCDE1234F"}</span>
                </div>
                <div className="space-y-2 py-4">
                  <p>Document Title: {previewDoc.name}</p>
                  <p>Category: {previewDoc.category}</p>
                  <p>Assessment Year: {previewDoc.assessmentYear}</p>
                  <p>OCR Extraction Status: {previewDoc.ocrStatus}</p>
                  <p>Verified with Income Tax Department records.</p>
                </div>
                <div className="text-[10px] text-gray-500 border-t border-white/10 pt-2 flex justify-between">
                  <span>Digitally Encrypted (256-bit AES)</span>
                  <span>Page 1 of 1</span>
                </div>
              </div>
            )}

            {/* Tab: Details & OCR */}
            {detailsTab === "details" && (
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-[#18181b] rounded-xl border border-white/5 space-y-2">
                  <h4 className="font-bold text-white">Extracted Metadata:</h4>
                  <div className="grid grid-cols-2 gap-2 text-gray-300">
                    <div>Category: <span className="font-bold text-white">{previewDoc.category}</span></div>
                    <div>Lifecycle Status: <span className="font-bold text-emerald-400">{previewDoc.lifecycleStatus}</span></div>
                    <div>Assessment Year: <span className="font-bold text-white">{previewDoc.assessmentYear}</span></div>
                    <div>Detected PAN: <span className="font-mono text-emerald-400">{previewDoc.extractedData?.pan || "N/A"}</span></div>
                    <div>Gross Figures: <span className="font-mono text-white">{previewDoc.extractedData?.grossIncome || "N/A"}</span></div>
                    <div>TDS Figures: <span className="font-mono text-white">{previewDoc.extractedData?.tdsDeducted || "N/A"}</span></div>
                  </div>
                </div>

                {previewDoc.rejectionReason && (
                  <div className="p-4 bg-red-950/20 border border-red-500/30 rounded-xl text-red-300 space-y-1">
                    <span className="font-bold flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4" /> Rejection Remarks from CA:
                    </span>
                    <p>{previewDoc.rejectionReason}</p>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Versions */}
            {detailsTab === "versions" && (
              <div className="space-y-2">
                <span className="text-xs font-semibold text-gray-300">Document Version History:</span>
                <div className="divide-y divide-white/5 bg-[#18181b] rounded-xl border border-white/5 text-xs">
                  {previewDoc.versions.map((ver, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-white">{ver.version}</span>
                        <span className="text-gray-400 text-[11px] ml-2">({ver.date})</span>
                        {ver.notes && <p className="text-[11px] text-gray-400 mt-0.5">{ver.notes}</p>}
                      </div>
                      <span className="text-gray-400 font-mono text-[11px]">{ver.size}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: History / Audit Log */}
            {detailsTab === "history" && (
              <div className="space-y-2">
                <span className="text-xs font-semibold text-gray-300">Document Audit Trail:</span>
                <div className="divide-y divide-white/5 bg-[#18181b] rounded-xl border border-white/5 text-xs">
                  {previewDoc.history.map((h, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-white">{h.action}</span>
                        <p className="text-[10px] text-gray-400 mt-0.5">By {h.user}</p>
                      </div>
                      <span className="text-[10px] text-gray-400 font-mono">{h.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions Bar */}
            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeleteDocument(previewDoc.id)}
                className="text-xs bg-red-950/40 border border-red-500/30 text-red-300 hover:bg-red-900"
              >
                Delete File
              </Button>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleOpenShare(previewDoc)}
                  className="border-white/10 text-xs"
                >
                  <Share2 className="w-3.5 h-3.5 mr-1" /> Share
                </Button>
                <Button
                  size="sm"
                  onClick={() => toast.success(`Downloading ${previewDoc.name}`)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                >
                  <Download className="w-3.5 h-3.5 mr-1" /> Download File
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT DOCUMENT INFORMATION MODAL */}
      {editInfoDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#111111] border border-white/10 rounded-2xl p-6 space-y-4 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-emerald-400" /> Edit Document Information
              </h3>
              <button onClick={() => setEditInfoDoc(null)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-300 mb-1">Document Title</label>
                <input
                  type="text"
                  value={editDocName}
                  onChange={(e) => setEditDocName(e.target.value)}
                  className="w-full bg-[#18181b] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1">Document Category</label>
                <select
                  value={editDocCategory}
                  onChange={(e) => setEditDocCategory(e.target.value as DocumentCategoryType)}
                  className="w-full bg-[#18181b] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                >
                  {DOCUMENT_CATEGORIES.filter(c => c !== "All Categories").map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-300 mb-1">Assessment Year (AY)</label>
                <input
                  type="text"
                  value={editDocAY}
                  onChange={(e) => setEditDocAY(e.target.value)}
                  className="w-full bg-[#18181b] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
              <Button variant="outline" size="sm" onClick={() => setEditInfoDoc(null)} className="border-white/10 text-xs">
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveEditInfo} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs">
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* SHARE DOCUMENT MODAL */}
      {shareDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#111111] border border-white/10 rounded-2xl p-6 space-y-4 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Share2 className="w-4 h-4 text-emerald-400" /> Share Document
              </h3>
              <button onClick={() => setShareDoc(null)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-gray-300">
                Generate a secure, time-limited link to share <strong>{shareDoc.name}</strong> directly with your CA or financial advisor.
              </p>

              <div>
                <label className="block text-gray-300 mb-1">Shareable Link</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={shareLink}
                    className="w-full bg-[#18181b] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-emerald-400 select-all"
                  />
                  <Button
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(shareLink);
                      toast.success("Link copied to clipboard!");
                    }}
                    className="bg-emerald-600 text-white shrink-0"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 mb-1">Password Protection</label>
                  <input
                    type="text"
                    value={sharePassword}
                    onChange={(e) => setSharePassword(e.target.value)}
                    className="w-full bg-[#18181b] border border-white/10 rounded-xl p-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-1">Expires After</label>
                  <select
                    value={shareExpiryDays}
                    onChange={(e) => setShareExpiryDays(e.target.value)}
                    className="w-full bg-[#18181b] border border-white/10 rounded-xl p-2 text-xs text-white"
                  >
                    <option value="1">1 Day</option>
                    <option value="7">7 Days</option>
                    <option value="30">30 Days</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-white/10">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  toast.success(`Directly sent link to CA Rajesh Sharma via Chat!`);
                  setShareDoc(null);
                }}
                className="text-xs border-emerald-500/30 text-emerald-400"
              >
                Send to My CA
              </Button>
              <Button size="sm" onClick={() => setShareDoc(null)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs">
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
