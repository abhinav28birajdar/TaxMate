'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  FileText, 
  ArrowLeft, 
  Download, 
  Share2, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  Lock, 
  Eye, 
  Copy,
  PenTool,
  Clock,
  User,
  Building
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';

export default function CADocumentDetailPage() {
  const params = useParams();
  const docId = params?.id as string || 'DOC-2026-092';

  const [signed, setSigned] = useState<boolean>(false);

  const documentData = {
    id: docId,
    name: 'GSTR-3B_Annual_Consolidation_Report_FY2526.pdf',
    category: 'GST & Compliance',
    uploadedBy: 'CA Rajesh Sharma',
    clientName: 'Zenith Logistics LLP',
    fileSize: '3.8 MB',
    fileType: 'application/pdf',
    uploadDate: '12 Aug 2026, 14:32 IST',
    version: 2,
    isShared: true,
    aiSummary: 'Consolidated GSTR-3B annual return summary with total outward taxable supplies of ₹1,48,50,000, IGST paid ₹26,73,000, and Net Eligible Input Tax Credit (ITC) claimed ₹19,82,400. Zero late fees incurred across 12 filing periods.',
    extractedData: {
      gstin: '27AAACZ1234F1Z8',
      financialYear: '2025-26',
      totalTurnover: '₹1,48,50,000',
      totalTaxPayable: '₹26,73,000',
      itcClaimed: '₹19,82,400',
      taxPaidInCash: '₹6,90,600'
    },
    ocrRawText: `FORM GSTR-3B [See rule 61(5)]\nYear: 2025-26 | Period: Annual Consolidation\nGSTIN: 27AAACZ1234F1Z8 | Legal Name: ZENITH LOGISTICS LLP\n3.1 Details of Outward Supplies and inward supplies liable to reverse charge:\n(a) Outward taxable supplies (other than zero rated, nil rated and exempted): Taxable Value: 1,48,50,000 | Integrated Tax: 26,73,000 | Central Tax: 0 | State/UT Tax: 0\n4. Eligible ITC:\n(A) ITC Available (whether in full or part): (5) All other ITC: Integrated Tax: 19,82,400\nVerification: I hereby solemnly affirm and declare that the information given herein above is true and correct to the best of my knowledge.`
  };

  const handleCopyOCR = () => {
    navigator.clipboard?.writeText(documentData.ocrRawText);
    toast.success('Raw OCR Text copied to clipboard!');
  };

  const handleDigitalSign = () => {
    setSigned(true);
    toast.success('Document digitally signed with DSC Token (Class-3 ICAI Certificate)!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link href="/ca/documents" className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-lime-600 mb-2">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Document Vault
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {documentData.name}
            </h1>
            <Badge className="bg-lime-600/10 text-lime-700 dark:text-lime-400 border-lime-600/30 text-xs font-bold">
              {documentData.category}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">Doc ID: <span className="font-mono">{documentData.id}</span> • Client: <strong className="text-slate-700 dark:text-slate-300">{documentData.clientName}</strong> • v{documentData.version}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.success('Downloading PDF...')} className="text-xs rounded-xl border-slate-200 dark:border-slate-800">
            <Download className="w-3.5 h-3.5 mr-1.5" /> Download File
          </Button>
          {!signed ? (
            <Button size="sm" onClick={handleDigitalSign} className="bg-lime-600 hover:bg-lime-500 text-white font-bold text-xs rounded-xl shadow-md shadow-lime-600/20">
              <PenTool className="w-3.5 h-3.5 mr-1.5" /> Apply DSC Signature
            </Button>
          ) : (
            <Badge className="bg-lime-600 text-white text-xs px-3 py-1.5 font-bold flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" /> DSC Signed
            </Badge>
          )}
        </div>
      </div>

      {/* Grid Layout: Left (Preview & OCR) & Right (AI Summary & Meta) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Preview & OCR Tabs */}
        <div className="lg:col-span-2 space-y-4">
          <Tabs defaultValue="preview" className="w-full space-y-4">
            <TabsList className="bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800">
              <TabsTrigger value="preview" className="rounded-xl text-xs font-semibold">
                <Eye className="w-3.5 h-3.5 mr-1.5" /> Document Preview
              </TabsTrigger>
              <TabsTrigger value="ocr" className="rounded-xl text-xs font-semibold">
                <FileText className="w-3.5 h-3.5 mr-1.5" /> Raw OCR Text
              </TabsTrigger>
            </TabsList>

            <TabsContent value="preview" className="space-y-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 min-h-[480px] flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden">
                <div className="w-16 h-16 rounded-2xl bg-lime-600/10 text-lime-600 flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{documentData.name}</h3>
                <p className="text-xs text-slate-500 max-w-sm mt-1">
                  High-fidelity PDF document rendering active. All metadata verified and cryptographically stored on Supabase Storage.
                </p>
                <div className="mt-6 flex gap-3">
                  <Button variant="outline" size="sm" onClick={() => toast.info('Opening interactive full-screen viewer')} className="text-xs rounded-xl border-slate-200 dark:border-slate-800">
                    Open Fullscreen Viewer
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="ocr" className="space-y-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Tesseract / Vision OCR Output</span>
                  <Button variant="ghost" size="sm" onClick={handleCopyOCR} className="text-xs gap-1">
                    <Copy className="w-3.5 h-3.5" /> Copy Text
                  </Button>
                </div>
                <pre className="p-4 rounded-2xl bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed">
                  {documentData.ocrRawText}
                </pre>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Col: AI Summary & Metadata */}
        <div className="space-y-6">
          
          {/* Gemini AI Summary Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-lime-600 text-white flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Gemini AI Executive Summary</h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
              {documentData.aiSummary}
            </p>

            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Key Tax Entities Extracted</h4>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/50">
                  <span className="text-slate-500">GSTIN</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{documentData.extractedData.gstin}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/50">
                  <span className="text-slate-500">Turnover</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{documentData.extractedData.totalTurnover}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/50">
                  <span className="text-slate-500">IGST Payable</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{documentData.extractedData.totalTaxPayable}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Eligible ITC</span>
                  <span className="font-bold text-lime-600">{documentData.extractedData.itcClaimed}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Document Properties Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Document Properties</h3>
            
            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex justify-between">
                <span className="text-slate-500">File Size:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{documentData.fileSize}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Uploaded:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{documentData.uploadDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Uploaded By:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{documentData.uploadedBy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Encryption:</span>
                <span className="font-semibold text-lime-600">AES-256 Cloud Vault</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
