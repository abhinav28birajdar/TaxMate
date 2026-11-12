"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FileText,
  Upload,
  Download,
  Trash2,
  Search,
  Sparkles,
  Camera,
  CheckCircle2,
  Eye,
  X,
  RefreshCw,
  FolderLock,
  Share2,
  Edit2,
  Copy,
  ShieldAlert,
  ExternalLink,
  Check,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/hooks/UnifiedAuthContext";
import { useRealtimeSubscription } from "@/hooks/use-realtime";

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
  "Other Documents",
] as const;

export type DocumentCategoryType = (typeof DOCUMENT_CATEGORIES)[number];

export interface VaultDocument {
  id: string;
  name: string;
  category: DocumentCategoryType;
  lifecycleStatus:
    | "My Documents"
    | "CA Requested"
    | "Pending"
    | "Submitted"
    | "Verified"
    | "Rejected"
    | "Expired";
  size: string;
  uploadedAt: string;
  assessmentYear: string;
  tags?: string[];
  rejectionReason?: string;
  ocrStatus: string;
  mimeType?: string;
  signedUrl?: string;
  clientId?: string;
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

interface ClientOption {
  id: string;
  full_name: string;
  email: string;
  portal_user_id?: string | null;
}

function formatBytes(bytes?: number | null): string {
  const num = Number(bytes || 0);
  if (!num || Number.isNaN(num)) return "—";
  if (num < 1024) return `${num} B`;
  if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`;
  return `${(num / (1024 * 1024)).toFixed(2)} MB`;
}

function formatTimestamp(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function normalizeCategory(raw?: string | null): DocumentCategoryType {
  if (!raw) return "Other Documents";
  const match = DOCUMENT_CATEGORIES.find(
    (c) => c.toLowerCase() === raw.trim().toLowerCase()
  );
  return match || "Other Documents";
}

function normalizeLifecycle(rawDoc: any): VaultDocument["lifecycleStatus"] {
  const explicit = rawDoc.metadata?.lifecycleStatus;
  const valid: VaultDocument["lifecycleStatus"][] = [
    "My Documents",
    "CA Requested",
    "Pending",
    "Submitted",
    "Verified",
    "Rejected",
    "Expired",
  ];
  if (explicit && valid.includes(explicit)) return explicit;
  const st = String(rawDoc.status || "").toLowerCase();
  if (st === "verified") return "Verified";
  if (st === "rejected") return "Rejected";
  if (st === "expired") return "Expired";
  if (st === "pending") return "Pending";
  return "Submitted";
}

function mapDbDoc(doc: any): VaultDocument {
  const meta = doc.metadata && typeof doc.metadata === "object" ? doc.metadata : {};
  const sizeStr = formatBytes(doc.file_size || doc.size);
  const uploadedStr = formatTimestamp(doc.created_at);
  const rawHistory = Array.isArray(meta.history) ? meta.history : [];
  const rawVersions = Array.isArray(meta.versions) ? meta.versions : [];

  return {
    id: doc.id,
    name: doc.name || doc.file_name || "Untitled Document",
    category: normalizeCategory(doc.category || doc.document_type),
    lifecycleStatus: normalizeLifecycle(doc),
    size: sizeStr,
    uploadedAt: uploadedStr,
    assessmentYear: doc.financial_year || "2026-27",
    tags: Array.isArray(doc.tags) ? doc.tags : [],
    rejectionReason: meta.rejectionReason || undefined,
    ocrStatus: meta.ocrStatus || "Uploaded & Encrypted",
    mimeType: doc.mime_type || meta.mime_type || "",
    signedUrl: doc.signed_url || doc.file_url || "",
    clientId: doc.client_id || undefined,
    extractedData: meta.extractedData || undefined,
    versions:
      rawVersions.length > 0
        ? rawVersions
        : [{ version: "v1.0", date: uploadedStr, size: sizeStr, notes: "Stored in encrypted vault" }],
    history:
      rawHistory.length > 0
        ? rawHistory.map((h: any) => ({
            action: h.action || "Updated",
            timestamp: formatTimestamp(h.timestamp),
            user: h.user || "User",
          }))
        : [{ action: "Uploaded to Vault", timestamp: uploadedStr, user: "Account Holder" }],
  };
}

export function UnifiedDocumentVault({ portal = "client" }: { portal: "client" | "ca" }) {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<VaultDocument[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatusTab, setSelectedStatusTab] =
    useState<DocumentLifecycleStatus>("All Documents");
  const [selectedCategory, setSelectedCategory] =
    useState<DocumentCategoryType>("All Categories");
  const [searchQuery, setSearchQuery] = useState("");

  // Upload state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTab, setUploadTab] = useState<"device" | "camera" | "multiple">("device");
  const [uploadCategory, setUploadCategory] = useState<DocumentCategoryType>("Form 16");
  const [uploadAY, setUploadAY] = useState("2026-27");
  const [uploadClientId, setUploadClientId] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const singleFileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const multiFileInputRef = useRef<HTMLInputElement>(null);

  // Preview / Edit / Share / Reject modals
  const [previewDoc, setPreviewDoc] = useState<VaultDocument | null>(null);
  const [detailsTab, setDetailsTab] = useState<"preview" | "details" | "history" | "versions">(
    "preview"
  );

  const [editInfoDoc, setEditInfoDoc] = useState<VaultDocument | null>(null);
  const [editDocName, setEditDocName] = useState("");
  const [editDocCategory, setEditDocCategory] = useState<DocumentCategoryType>("Other Documents");
  const [editDocAY, setEditDocAY] = useState("2026-27");
  const [savingEdit, setSavingEdit] = useState(false);

  const [shareDoc, setShareDoc] = useState<VaultDocument | null>(null);
  const [shareLink, setShareLink] = useState("");
  const [loadingShare, setLoadingShare] = useState(false);
  const [sendingToPeer, setSendingToPeer] = useState(false);

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/documents?signed=true&take=100", {
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to load documents");
      }
      setDocuments((json.documents || []).map(mapDbDoc));
    } catch (err: any) {
      toast.error(err.message || "Could not load document vault");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
    if (portal === "ca") {
      fetch("/api/clients?take=50", { credentials: "include" })
        .then((r) => (r.ok ? r.json() : null))
        .then((j) => {
          if (j?.clients) {
            setClients(j.clients);
          }
        })
        .catch(() => {});
    }
  }, [fetchDocuments, portal]);

  useRealtimeSubscription(
    "documents",
    undefined,
    () => { void fetchDocuments(); },
    () => { void fetchDocuments(); },
    () => { void fetchDocuments(); },
    [user?.id],
    Boolean(user?.id)
  );

  const filteredDocuments = documents.filter((doc) => {
    if (selectedStatusTab === "My Documents") {
      if (doc.lifecycleStatus === "CA Requested") return false;
    } else if (selectedStatusTab !== "All Documents") {
      if (doc.lifecycleStatus !== selectedStatusTab) return false;
    }

    if (selectedCategory !== "All Categories" && doc.category !== selectedCategory) {
      return false;
    }

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const matchName = doc.name.toLowerCase().includes(q);
      const matchCat = doc.category.toLowerCase().includes(q);
      const matchTag = doc.tags?.some((t) => t.toLowerCase().includes(q));
      if (!matchName && !matchCat && !matchTag) return false;
    }

    return true;
  });

  const handleUploadFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    setIsUploading(true);
    setUploadProgress(10);

    try {
      let completed = 0;
      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("category", uploadCategory);
        fd.append("financialYear", uploadAY);
        fd.append("lifecycleStatus", portal === "ca" ? "Verified" : "Submitted");
        fd.append("isSharedWithCa", "true");
        if (portal === "ca" && uploadClientId) {
          fd.append("clientId", uploadClientId);
        }

        const res = await fetch("/api/documents/upload", {
          method: "POST",
          body: fd,
          credentials: "include",
        });
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.error || `Failed uploading ${file.name}`);
        }
        completed += 1;
        setUploadProgress(Math.round((completed / files.length) * 100));
      }

      toast.success(
        files.length === 1
          ? `"${files[0].name}" uploaded securely to Supabase Vault.`
          : `${files.length} documents uploaded securely.`
      );
      setShowUploadModal(false);
      await fetchDocuments();
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      const res = await fetch(`/api/documents/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to delete document");
      }
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      if (previewDoc?.id === id) setPreviewDoc(null);
      toast.success("Document removed from vault.");
    } catch (err: any) {
      toast.error(err.message || "Delete failed");
    }
  };

  const handleDownloadDocument = async (doc: VaultDocument) => {
    try {
      const res = await fetch(`/api/documents/download?id=${encodeURIComponent(doc.id)}`, {
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok || !json.signedUrl) {
        throw new Error(json.error || "Unable to generate secure download link");
      }
      const link = document.createElement("a");
      link.href = json.signedUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.download = json.fileName || doc.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Downloading "${doc.name}"`);
    } catch (err: any) {
      toast.error(err.message || "Download failed");
    }
  };

  const handleSaveEditInfo = async () => {
    if (!editInfoDoc || !editDocName.trim()) {
      toast.error("Document title cannot be empty.");
      return;
    }
    try {
      setSavingEdit(true);
      const res = await fetch(`/api/documents/${editInfoDoc.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: editDocName.trim(),
          category: editDocCategory,
          financialYear: editDocAY.trim() || "2026-27",
          historyAction: `Updated metadata to "${editDocName.trim()}" (${editDocCategory})`,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to update document");
      }
      toast.success("Document information updated.");
      setEditInfoDoc(null);
      await fetchDocuments();
    } catch (err: any) {
      toast.error(err.message || "Update failed");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleUpdateLifecycleStatus = async (
    doc: VaultDocument,
    lifecycleStatus: "Verified" | "Rejected",
    rejectionReason?: string
  ) => {
    try {
      const res = await fetch(`/api/documents/${doc.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          status: lifecycleStatus === "Verified" ? "verified" : "rejected",
          lifecycleStatus,
          rejectionReason: rejectionReason ?? null,
          historyAction: `Marked ${lifecycleStatus} by ${user?.name || "CA"}`,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Status update failed");
      toast.success(`Document marked as ${lifecycleStatus}.`);
      await fetchDocuments();
      setPreviewDoc(null);
    } catch (err: any) {
      toast.error(err.message || "Could not update status");
    }
  };

  const handleOpenShare = async (doc: VaultDocument) => {
    setShareDoc(doc);
    setShareLink(doc.signedUrl || "");
    setLoadingShare(true);
    try {
      const res = await fetch(`/api/documents/download?id=${encodeURIComponent(doc.id)}`, {
        credentials: "include",
      });
      const json = await res.json();
      if (res.ok && json.signedUrl) {
        setShareLink(json.signedUrl);
      }
    } catch {
      // Keep fallback signedUrl if present
    } finally {
      setLoadingShare(false);
    }
  };

  const handleSendShareInChat = async () => {
    if (!shareDoc) return;
    try {
      setSendingToPeer(true);
      const convRes = await fetch("/api/conversations", { credentials: "include" });
      const convJson = await convRes.json();
      if (!convRes.ok) {
        throw new Error(convJson.error || "Could not access chat channels");
      }

      let targetConvId: string | undefined = convJson.conversations?.[0]?.id;
      if (!targetConvId && convJson.contacts?.[0]?.id) {
        const createRes = await fetch("/api/conversations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            participantId: convJson.contacts[0].id,
            title: convJson.contacts[0].name,
          }),
        });
        const createJson = await createRes.json();
        targetConvId = createJson.conversation?.id;
      }

      if (!targetConvId) {
        toast.info("No active conversation found. Copy the signed link instead.");
        return;
      }

      const msgRes = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          conversationId: targetConvId,
          messageType: "FILE",
          content: `Shared vault document "${shareDoc.name}" (${shareDoc.category}, AY ${shareDoc.assessmentYear}).`,
          fileUrl: shareLink || shareDoc.signedUrl,
          attachments: [
            {
              id: shareDoc.id,
              name: shareDoc.name,
              mimeType: shareDoc.mimeType || "application/pdf",
              url: shareLink || shareDoc.signedUrl,
            },
          ],
        }),
      });

      if (!msgRes.ok) {
        const errJson = await msgRes.json().catch(() => ({}));
        throw new Error(errJson.message || errJson.error || "Failed to share in chat");
      }

      toast.success(
        portal === "client"
          ? "Document shared directly with your CA via Chat."
          : "Document shared with client via Chat."
      );
      setShareDoc(null);
    } catch (err: any) {
      toast.error(err.message || "Could not share document via chat");
    } finally {
      setSendingToPeer(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-white">
      {/* Hidden File Inputs */}
      <input
        ref={singleFileInputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,.webp,.csv,.txt,.xls,.xlsx"
        className="hidden"
        onChange={(e) => {
          handleUploadFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          handleUploadFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <input
        ref={multiFileInputRef}
        type="file"
        multiple
        accept=".pdf,.png,.jpg,.jpeg,.webp,.csv,.txt,.xls,.xlsx"
        className="hidden"
        onChange={(e) => {
          handleUploadFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <FolderLock className="w-6 h-6 text-emerald-400" /> Customer Documents Vault
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Private encrypted Supabase Storage repository across all 15 tax document categories.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDocuments}
            disabled={loading}
            className="border-white/10 text-gray-300 hover:bg-white/5 text-xs rounded-xl"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            onClick={() => {
              setShowUploadModal(true);
              setUploadTab("device");
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-[0_0_20px_rgba(5,150,105,0.4)]"
          >
            <Upload className="w-4 h-4 mr-1.5" /> Upload Document
          </Button>
        </div>
      </div>

      {/* 8 Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs border-b border-white/10">
        {(
          [
            "All Documents",
            "My Documents",
            "CA Requested",
            "Pending",
            "Submitted",
            "Verified",
            "Rejected",
            "Expired",
          ] as DocumentLifecycleStatus[]
        ).map((tab) => {
          const count = documents.filter((d) => {
            if (tab === "All Documents") return true;
            if (tab === "My Documents") return d.lifecycleStatus !== "CA Requested";
            return d.lifecycleStatus === tab;
          }).length;

          return (
            <button
              key={tab}
              onClick={() => setSelectedStatusTab(tab)}
              className={`px-3 py-2 border-b-2 font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedStatusTab === tab
                  ? "border-emerald-500 text-emerald-400"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              <span>{tab}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedStatusTab === tab
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "bg-white/5 text-gray-400"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 15 Category Pills & Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
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
          <span>
            Showing <strong className="text-white">{filteredDocuments.length}</strong> documents
            matching filters
          </span>
          <span className="font-mono text-[11px]">Private Bucket Signed Access</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-[#18181b] text-white font-semibold border-b border-white/10">
              <tr>
                <th className="py-3.5 px-4">Document Title</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">AY / FY</th>
                <th className="py-3.5 px-4">Processing</th>
                <th className="py-3.5 px-4">Size</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    <RefreshCw className="w-6 h-6 mx-auto mb-2 animate-spin text-emerald-400" />
                    Loading encrypted documents...
                  </td>
                </tr>
              ) : filteredDocuments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500 space-y-3">
                    <FolderLock className="w-8 h-8 mx-auto opacity-40" />
                    <p>No documents found matching your filters.</p>
                    <Button
                      size="sm"
                      onClick={() => {
                        setShowUploadModal(true);
                        setUploadTab("device");
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-xl"
                    >
                      <Upload className="w-3.5 h-3.5 mr-1.5" /> Upload First Document
                    </Button>
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
                            onClick={() => {
                              setPreviewDoc(doc);
                              setDetailsTab("preview");
                            }}
                          >
                            {doc.name}
                          </span>
                          <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-normal mt-0.5">
                            <span>{doc.uploadedAt}</span>
                            {doc.tags?.map((t) => (
                              <span
                                key={t}
                                className="px-1.5 py-0.2 rounded bg-white/5 text-gray-400"
                              >
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
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          doc.lifecycleStatus === "Verified"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : doc.lifecycleStatus === "CA Requested"
                              ? "bg-purple-500/10 text-purple-400 border-purple-500/30"
                              : doc.lifecycleStatus === "Rejected"
                                ? "bg-red-500/10 text-red-400 border-red-500/30"
                                : doc.lifecycleStatus === "Expired"
                                  ? "bg-gray-500/10 text-gray-400 border-gray-500/30"
                                  : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                        }`}
                      >
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

                    <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setPreviewDoc(doc);
                          setDetailsTab("preview");
                        }}
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
                        onClick={() => handleDownloadDocument(doc)}
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
      </div>

      {/* UPLOAD DOCUMENT MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-[#111111] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-5 text-white shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Upload className="w-5 h-5 text-emerald-400" /> Upload Tax Documents
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Files are stored directly inside your private encrypted bucket.
                </p>
              </div>
              <button
                onClick={() => !isUploading && setShowUploadModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-gray-300 mb-1">Category</label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value as DocumentCategoryType)}
                  className="w-full bg-[#18181b] border border-white/10 rounded-xl p-2.5 text-white"
                >
                  {DOCUMENT_CATEGORIES.filter((c) => c !== "All Categories").map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-300 mb-1">Assessment Year</label>
                <input
                  type="text"
                  value={uploadAY}
                  onChange={(e) => setUploadAY(e.target.value)}
                  className="w-full bg-[#18181b] border border-white/10 rounded-xl p-2.5 text-white font-mono"
                />
              </div>
              {portal === "ca" && clients.length > 0 && (
                <div className="sm:col-span-2">
                  <label className="block text-gray-300 mb-1">Assign to Client (Optional)</label>
                  <select
                    value={uploadClientId}
                    onChange={(e) => setUploadClientId(e.target.value)}
                    className="w-full bg-[#18181b] border border-white/10 rounded-xl p-2.5 text-white"
                  >
                    <option value="">Firm General Vault</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.portal_user_id || c.id}>
                        {c.full_name} ({c.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs font-semibold">
              <button
                onClick={() => setUploadTab("device")}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  uploadTab === "device"
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500"
                    : "bg-[#18181b] border-white/5 text-gray-400"
                }`}
              >
                Single File
              </button>
              <button
                onClick={() => setUploadTab("camera")}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  uploadTab === "camera"
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500"
                    : "bg-[#18181b] border-white/5 text-gray-400"
                }`}
              >
                Camera Scan
              </button>
              <button
                onClick={() => setUploadTab("multiple")}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  uploadTab === "multiple"
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500"
                    : "bg-[#18181b] border-white/5 text-gray-400"
                }`}
              >
                Batch Upload
              </button>
            </div>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleUploadFiles(e.dataTransfer.files);
              }}
              className="border-2 border-dashed border-white/10 hover:border-emerald-500/40 rounded-2xl p-8 text-center space-y-3 bg-[#141414] transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/20">
                {uploadTab === "camera" ? (
                  <Camera className="w-6 h-6" />
                ) : (
                  <Upload className="w-6 h-6" />
                )}
              </div>
              <div>
                <p className="text-sm font-bold text-white">
                  {uploadTab === "camera"
                    ? "Capture clear photo of your tax statement or receipt"
                    : uploadTab === "multiple"
                      ? "Drag and drop multiple files or click below to select"
                      : "Drag and drop a file or click below to browse"}
                </p>
                <p className="text-[11px] text-gray-400 mt-1">
                  PDF, JPG, PNG, CSV, XLS/XLSX up to 25 MB per document
                </p>
              </div>

              {isUploading ? (
                <div className="space-y-2 pt-2 max-w-xs mx-auto">
                  <div className="flex justify-between text-xs text-emerald-400 font-mono">
                    <span>Uploading to Encrypted Storage...</span>
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
                    onClick={() => {
                      if (uploadTab === "camera") cameraInputRef.current?.click();
                      else if (uploadTab === "multiple") multiFileInputRef.current?.click();
                      else singleFileInputRef.current?.click();
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-[0_0_15px_rgba(5,150,105,0.4)]"
                  >
                    {uploadTab === "camera"
                      ? "Open Camera / Image"
                      : uploadTab === "multiple"
                        ? "Select Multiple Files"
                        : "Select File from Device"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DOCUMENT PREVIEW MODAL */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-3xl bg-[#111111] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-5 text-white shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase">
                  {previewDoc.category}
                </span>
                <h3 className="font-bold text-lg text-white mt-0.5">{previewDoc.name}</h3>
                <span className="text-xs text-gray-400 font-mono">
                  Size: {previewDoc.size} • Uploaded: {previewDoc.uploadedAt} • AY:{" "}
                  {previewDoc.assessmentYear}
                </span>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-2 border-b border-white/10 pb-2 text-xs">
              {(["preview", "details", "versions", "history"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setDetailsTab(tab)}
                  className={`px-3 py-1.5 rounded-lg capitalize font-semibold ${
                    detailsTab === tab
                      ? "bg-emerald-600 text-white"
                      : "bg-[#18181b] text-gray-400 hover:text-white"
                  }`}
                >
                  {tab === "details" ? "Document Metadata" : tab}
                </button>
              ))}
            </div>

            {detailsTab === "preview" && (
              <div className="bg-[#18181b] border border-white/5 rounded-xl overflow-hidden">
                {previewDoc.signedUrl &&
                previewDoc.signedUrl.startsWith("http") &&
                previewDoc.mimeType?.startsWith("image/") ? (
                  <img
                    src={previewDoc.signedUrl}
                    alt={previewDoc.name}
                    className="max-h-96 w-full object-contain bg-black"
                  />
                ) : previewDoc.signedUrl &&
                  previewDoc.signedUrl.startsWith("http") &&
                  (previewDoc.mimeType?.includes("pdf") ||
                    previewDoc.name.toLowerCase().endsWith(".pdf")) ? (
                  <iframe
                    src={previewDoc.signedUrl}
                    title={previewDoc.name}
                    className="w-full h-96 bg-white"
                  />
                ) : (
                  <div className="p-6 font-mono text-xs text-gray-300 space-y-2">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="font-bold text-white">ENCRYPTED VAULT FILE RECORD</span>
                      <span className="text-emerald-400">{previewDoc.lifecycleStatus}</span>
                    </div>
                    <p>Title: {previewDoc.name}</p>
                    <p>Category: {previewDoc.category}</p>
                    <p>Assessment Year: {previewDoc.assessmentYear}</p>
                    <p>Status: {previewDoc.ocrStatus}</p>
                    {previewDoc.signedUrl && (
                      <a
                        href={previewDoc.signedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-emerald-400 hover:underline pt-2"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Open Signed URL in New Tab
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}

            {detailsTab === "details" && (
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-[#18181b] rounded-xl border border-white/5 space-y-2">
                  <h4 className="font-bold text-white">Stored Metadata:</h4>
                  <div className="grid grid-cols-2 gap-2 text-gray-300">
                    <div>
                      Category: <span className="font-bold text-white">{previewDoc.category}</span>
                    </div>
                    <div>
                      Lifecycle Status:{" "}
                      <span className="font-bold text-emerald-400">
                        {previewDoc.lifecycleStatus}
                      </span>
                    </div>
                    <div>
                      Assessment Year:{" "}
                      <span className="font-bold text-white">{previewDoc.assessmentYear}</span>
                    </div>
                    <div>
                      MIME Type:{" "}
                      <span className="font-mono text-gray-300">
                        {previewDoc.mimeType || "application/octet-stream"}
                      </span>
                    </div>
                    {previewDoc.extractedData?.pan && (
                      <div>
                        Detected PAN:{" "}
                        <span className="font-mono text-emerald-400">
                          {previewDoc.extractedData.pan}
                        </span>
                      </div>
                    )}
                    {previewDoc.extractedData?.grossIncome && (
                      <div>
                        Gross Figures:{" "}
                        <span className="font-mono text-white">
                          {previewDoc.extractedData.grossIncome}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {previewDoc.rejectionReason && (
                  <div className="p-4 bg-red-950/20 border border-red-500/30 rounded-xl text-red-300 space-y-1">
                    <span className="font-bold flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4" /> Rejection Remarks:
                    </span>
                    <p>{previewDoc.rejectionReason}</p>
                  </div>
                )}
              </div>
            )}

            {detailsTab === "versions" && (
              <div className="space-y-2">
                <span className="text-xs font-semibold text-gray-300">Version History:</span>
                <div className="divide-y divide-white/5 bg-[#18181b] rounded-xl border border-white/5 text-xs">
                  {previewDoc.versions.map((ver, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-white">{ver.version}</span>
                        <span className="text-gray-400 text-[11px] ml-2">({ver.date})</span>
                        {ver.notes && (
                          <p className="text-[11px] text-gray-400 mt-0.5">{ver.notes}</p>
                        )}
                      </div>
                      <span className="text-gray-400 font-mono text-[11px]">{ver.size}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

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

            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-white/10">
              <div className="flex items-center gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteDocument(previewDoc.id)}
                  className="text-xs bg-red-950/40 border border-red-500/30 text-red-300 hover:bg-red-900"
                >
                  Delete File
                </Button>
                {portal === "ca" && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => handleUpdateLifecycleStatus(previewDoc, "Verified")}
                      className="text-xs bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-600/30"
                    >
                      <Check className="w-3.5 h-3.5 mr-1" /> Verify
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleUpdateLifecycleStatus(
                          previewDoc,
                          "Rejected",
                          "Please upload a clearer, legible document copy."
                        )
                      }
                      className="text-xs border-red-500/30 text-red-300 hover:bg-red-950/40"
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                    </Button>
                  </>
                )}
              </div>
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
                  onClick={() => handleDownloadDocument(previewDoc)}
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
              <button
                onClick={() => setEditInfoDoc(null)}
                className="text-gray-400 hover:text-white"
              >
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
                  {DOCUMENT_CATEGORIES.filter((c) => c !== "All Categories").map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditInfoDoc(null)}
                className="border-white/10 text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={savingEdit}
                onClick={handleSaveEditInfo}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
              >
                {savingEdit ? "Saving..." : "Save Changes"}
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
              <button
                onClick={() => setShareDoc(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-gray-300">
                Short-lived (15 min) signed access link for <strong>{shareDoc.name}</strong>.
              </p>

              <div>
                <label className="block text-gray-300 mb-1">Signed Access Link</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={loadingShare ? "Generating signed URL..." : shareLink || "Unavailable"}
                    className="w-full bg-[#18181b] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-emerald-400 select-all"
                  />
                  <Button
                    size="sm"
                    disabled={!shareLink}
                    onClick={() => {
                      navigator.clipboard.writeText(shareLink);
                      toast.success("Signed link copied to clipboard!");
                    }}
                    className="bg-emerald-600 text-white shrink-0"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-white/10">
              <Button
                size="sm"
                variant="outline"
                disabled={sendingToPeer}
                onClick={handleSendShareInChat}
                className="text-xs border-emerald-500/30 text-emerald-400"
              >
                {sendingToPeer
                  ? "Sending..."
                  : portal === "client"
                    ? "Send to My CA in Chat"
                    : "Send to Client in Chat"}
              </Button>
              <Button
                size="sm"
                onClick={() => setShareDoc(null)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
