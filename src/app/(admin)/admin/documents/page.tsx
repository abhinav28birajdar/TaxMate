"use client";

import React, { useState } from "react";
import { 
  FolderLock, 
  Search, 
  Filter, 
  CheckCircle2, 
  ShieldAlert, 
  Eye, 
  Download, 
  Trash2, 
  HardDrive, 
  Sparkles,
  Layers,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AdminDocumentManagementPage() {
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("all");

  const [docs, setDocs] = useState([
    { id: "d-1", name: "Form_16_Part_A_B_AY2026.pdf", category: "Form 16", owner: "Abhinav Birajdar", size: "2.4 MB", ocrStatus: "Extracted", uploaded: "Today", flagged: false },
    { id: "d-2", name: "Zerodha_Capital_Gains_P&L.xlsx", category: "Investment Proofs", owner: "Ananya Deshmukh", size: "3.2 MB", ocrStatus: "Extracted", uploaded: "Yesterday", flagged: false },
    { id: "d-3", name: "Blurry_Medical_Invoice.jpg", category: "Insurance Documents", owner: "Vikramaditya Rao", size: "0.4 MB", ocrStatus: "Failed", uploaded: "2 days ago", flagged: true },
    { id: "d-4", name: "Registered_Sale_Deed_Commercial.pdf", category: "Property Documents", owner: "TechNova Solutions", size: "8.5 MB", ocrStatus: "Extracted", uploaded: "3 days ago", flagged: false },
    { id: "d-5", name: "ICAI_COP_Certificate_2026.pdf", category: "Business Documents", owner: "CA Rajesh Sharma", size: "1.8 MB", ocrStatus: "Verified", uploaded: "5 days ago", flagged: false }
  ]);

  return (
    <div className="space-y-6 text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <FolderLock className="w-6 h-6 text-emerald-400" /> Platform Document Vault & Storage Infrastructure
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Global 256-bit encrypted documents repository, Tesseract OCR queue, and storage quota management.
          </p>
        </div>

        <Button
          onClick={() => toast.success("Storage audit scan completed. Zero integrity violations detected.")}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-[0_0_20px_rgba(5,150,105,0.4)]"
        >
          <HardDrive className="w-3.5 h-3.5 mr-1.5" /> Run Integrity Audit
        </Button>
      </div>

      {/* Storage Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
        <div className="p-4 bg-[#111111] border border-white/10 rounded-2xl space-y-1">
          <span className="text-gray-400">Total Vault Files</span>
          <div className="text-xl font-bold text-white">14,290</div>
          <span className="text-[10px] text-emerald-400">Across 15 categories</span>
        </div>
        <div className="p-4 bg-[#111111] border border-white/10 rounded-2xl space-y-1">
          <span className="text-gray-400">Total Storage Allocated</span>
          <div className="text-xl font-bold font-mono text-white">284.5 GB</div>
          <span className="text-[10px] text-gray-500">AWS S3 Mumbai Region</span>
        </div>
        <div className="p-4 bg-[#111111] border border-white/10 rounded-2xl space-y-1">
          <span className="text-gray-400">OCR Recognition Success</span>
          <div className="text-xl font-bold text-emerald-400">99.4%</div>
          <span className="text-[10px] text-gray-500">Tesseract Engine</span>
        </div>
        <div className="p-4 bg-[#111111] border border-white/10 rounded-2xl space-y-1">
          <span className="text-gray-400">Flagged / Corrupt Files</span>
          <div className="text-xl font-bold text-amber-400">1</div>
          <span className="text-[10px] text-amber-400">Resolution required</span>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-[#111111] rounded-2xl border border-white/10 overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs text-gray-300">
          <thead className="bg-[#18181b] text-white font-semibold border-b border-white/10">
            <tr>
              <th className="py-3.5 px-4">Document Title</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Uploader / Owner</th>
              <th className="py-3.5 px-4">Size</th>
              <th className="py-3.5 px-4">OCR Status</th>
              <th className="py-3.5 px-4">Uploaded</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {docs.map((d) => (
              <tr key={d.id} className="hover:bg-[#18181b]/50 transition-colors">
                <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{d.name}</span>
                </td>
                <td className="py-3.5 px-4">
                  <span className="px-2 py-0.5 rounded-md bg-[#18181b] border border-white/5 text-emerald-300">
                    {d.category}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-gray-200">{d.owner}</td>
                <td className="py-3.5 px-4 font-mono text-gray-400">{d.size}</td>
                <td className="py-3.5 px-4">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    d.ocrStatus === "Failed" ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  }`}>
                    {d.ocrStatus}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-gray-400">{d.uploaded}</td>
                <td className="py-3.5 px-4 text-right space-x-1">
                  <Button size="sm" variant="ghost" onClick={() => toast.success(`Downloaded ${d.name}`)} className="text-gray-300 h-7 px-2">
                    <Download className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => toast.info("Viewing document logs")} className="text-emerald-400 h-7 px-2">
                    <Eye className="w-3.5 h-3.5" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
