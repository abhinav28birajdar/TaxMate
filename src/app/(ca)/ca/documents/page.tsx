'use client';

import { useState } from 'react';
import { FileText, Upload, Search, Download, Eye, Sparkles, Folder } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CADocumentsVaultPage() {
  const documents = [
    { id: 'doc_1', name: 'Form 26AS FY 2025-26.pdf', client: 'TechNova Solutions', size: '2.4 MB', uploadedAt: '18 Oct 2026', ocrStatus: 'Extracted', category: 'Tax Form' },
    { id: 'doc_2', name: 'HDFC Bank Statement Q2.pdf', client: 'Ananya Deshmukh', size: '4.1 MB', uploadedAt: '15 Oct 2026', ocrStatus: 'Extracted', category: 'Bank Statement' },
    { id: 'doc_3', name: 'GSTR-3B Acknowledgement.pdf', client: 'Apex Logistics', size: '890 KB', uploadedAt: '11 Oct 2026', ocrStatus: 'Verified', category: 'GST Return' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-lime-600" /> Document Vault & Client Files
          </h1>
          <p className="text-xs text-slate-500 mt-1">OCR text extraction, AI summarization, digital signatures, and encrypted storage.</p>
        </div>
        <Button className="bg-lime-600 hover:bg-lime-500 text-white font-semibold shadow-md shadow-lime-600/20">
          <Upload className="w-4 h-4 mr-2" /> Upload Document
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-3.5 px-4">File Name</th>
              <th className="py-3.5 px-4">Client Entity</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Size</th>
              <th className="py-3.5 px-4">Uploaded</th>
              <th className="py-3.5 px-4">OCR Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {documents.map((doc) => (
              <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-lime-600" />
                  {doc.name}
                </td>
                <td className="py-3.5 px-4 font-semibold">{doc.client}</td>
                <td className="py-3.5 px-4">{doc.category}</td>
                <td className="py-3.5 px-4 font-mono">{doc.size}</td>
                <td className="py-3.5 px-4">{doc.uploadedAt}</td>
                <td className="py-3.5 px-4">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-lime-600/10 text-lime-600 border border-lime-600/20 flex items-center gap-1 w-fit">
                    <Sparkles className="w-3 h-3" /> {doc.ocrStatus}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right flex justify-end gap-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4 text-slate-500" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Download className="w-4 h-4 text-lime-600" />
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
