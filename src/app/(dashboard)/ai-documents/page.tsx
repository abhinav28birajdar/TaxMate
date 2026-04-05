import React from 'react';
import { Card, Badge, Button } from '@/components/ui/core-components';

export default function AIDocumentProcessingPage() {
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [processingDocs, setProcessingDocs] = React.useState([
    {
      id: 1,
      name: 'GST Certificate Jan 2024.pdf',
      size: '2.4MB',
      status: 'processing',
      progress: 65,
      confidence: 0,
      category: '',
      extractedData: null,
    },
    {
      id: 2,
      name: 'Bank Statement Feb 2024.pdf',
      size: '3.1MB',
      status: 'completed',
      progress: 100,
      confidence: 98,
      category: 'Bank Statements',
      extractedData: {
        accountNumber: '****5678',
        period: 'Feb 1 - Feb 29, 2024',
        balance: '₹245,680',
        transactions: 42,
      },
    },
    {
      id: 3,
      name: 'Invoice Template March.pdf',
      size: '1.8MB',
      status: 'completed',
      progress: 100,
      confidence: 95,
      category: 'Invoices',
      extractedData: {
        invoiceNumber: 'INV-2024-032',
        amount: '₹45,000',
        date: 'March 15, 2024',
        vendor: 'Tech Solutions Ltd',
      },
    },
  ]);

  const [processedStats, setProcessedStats] = React.useState({
    totalProcessed: 156,
    avgAccuracy: 94.2,
    autoCategories: 148,
    dataExtracted: 534,
    timeSaved: '142 hours',
  });

  const categories = [
    { name: 'GST Documents', count: 42, color: 'from-blue-500 to-cyan-500' },
    { name: 'ITR Documents', count: 38, color: 'from-purple-500 to-pink-500' },
    { name: 'Bank Statements', count: 35, color: 'from-emerald-500 to-teal-500' },
    { name: 'Invoices', count: 28, color: 'from-orange-500 to-red-500' },
    { name: 'PAN Cards', count: 12, color: 'from-indigo-500 to-blue-500' },
  ];

  const aiFeatures = [
    { feature: 'Auto Categorization', accuracy: '97%', docs: 148, time: '34 sec avg' },
    { feature: 'Data Extraction', accuracy: '94%', docs: 156, time: '12 sec avg' },
    { feature: 'OCR Processing', accuracy: '99%', docs: 142, time: '8 sec avg' },
    { feature: 'Duplicate Detection', accuracy: '92%', docs: 156, time: '2 sec avg' },
  ];

  const extractionExamples = [
    {
      field: 'GST Number',
      example: '07AABCT1234A1Z0',
      confidence: '99%',
      documents: '42',
    },
    {
      field: 'PAN Number',
      example: 'ABCDE1234F',
      confidence: '98%',
      documents: '38',
    },
    {
      field: 'Account Number',
      example: '****5678',
      confidence: '97%',
      documents: '35',
    },
    {
      field: 'Invoice Amount',
      example: '₹45,000',
      confidence: '96%',
      documents: '28',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">🤖 AI Document Processing</h1>
        <p className="text-slate-600">Intelligent document categorization, extraction & analysis</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        <Card className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
          <p className="text-sm opacity-90">Documents Processed</p>
          <p className="text-3xl font-bold">{processedStats.totalProcessed}</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
          <p className="text-sm opacity-90">Average Accuracy</p>
          <p className="text-3xl font-bold">{processedStats.avgAccuracy}%</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-orange-500 to-red-600 text-white">
          <p className="text-sm opacity-90">Auto Categorized</p>
          <p className="text-3xl font-bold">{processedStats.autoCategories}</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
          <p className="text-sm opacity-90">Data Fields Extracted</p>
          <p className="text-3xl font-bold">{processedStats.dataExtracted}</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-pink-500 to-rose-600 text-white">
          <p className="text-sm opacity-90">Time Saved</p>
          <p className="text-3xl font-bold">{processedStats.timeSaved}</p>
        </Card>
      </div>

      {/* Upload Area */}
      <Card className="p-12 bg-white/80 backdrop-blur border-2 border-dashed border-indigo-300 rounded-lg mb-8 text-center">
        <input type="file" multiple className="hidden" id="docUpload" accept=".pdf,.jpg,.png,.xlsx" />
        <label htmlFor="docUpload" className="cursor-pointer">
          <div>
            <p className="text-4xl mb-2">📤</p>
            <p className="text-lg font-semibold text-slate-900 mb-2">Drag & drop or click to upload documents</p>
            <p className="text-slate-600 mb-4">Supports: PDF, JPG, PNG, XLSX, DOCX</p>
            <Button className="bg-indigo-600 text-white">Browse Files</Button>
          </div>
        </label>
      </Card>

      {/* Processing Queue */}
      <Card className="p-8 bg-white/80 backdrop-blur border border-white/20 mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Processing Queue</h2>
        <div className="space-y-4">
          {processingDocs.map((doc) => (
            <div key={doc.id} className="p-4 bg-slate-50 rounded-lg">
              <div className="flex items-start gap-4 mb-3">
                <div className="text-2xl">📄</div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{doc.name}</p>
                  <p className="text-sm text-slate-600">{doc.size}</p>
                </div>
                <Badge
                  variant={
                    doc.status === 'completed'
                      ? 'success'
                      : doc.status === 'processing'
                      ? 'default'
                      : 'alert'
                  }
                >
                  {doc.status === 'completed'
                    ? '✓ Completed'
                    : doc.status === 'processing'
                    ? '⏳ Processing'
                    : 'Failed'}
                </Badge>
              </div>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      doc.status === 'completed'
                        ? 'bg-emerald-500'
                        : 'bg-indigo-500'
                    }`}
                    style={{ width: `${doc.progress}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1 text-xs text-slate-600">
                  <span>{doc.progress}% complete</span>
                  {doc.confidence > 0 && <span>Confidence: {doc.confidence}%</span>}
                </div>
              </div>

              {/* Results */}
              {doc.extractedData && (
                <div className="mt-3 p-3 bg-emerald-50 rounded border border-emerald-200">
                  <p className="text-sm font-semibold text-emerald-900 mb-2">✓ Auto Categorized: {doc.category}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(doc.extractedData).map(([key, value]) => (
                      <div key={key} className="text-emerald-800">
                        <span className="font-medium">{key}:</span> {value}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* AI Features Performance */}
      <Card className="p-8 bg-white/80 backdrop-blur border border-white/20 mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6">AI Processing Capabilities</h2>
        <div className="grid grid-cols-2 gap-6">
          {aiFeatures.map((feat, idx) => (
            <div key={idx} className="p-4 bg-slate-50 rounded-lg">
              <div className="flex justify-between items-start mb-3">
                <p className="font-semibold text-slate-900">{feat.feature}</p>
                <Badge variant="success">{feat.accuracy}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-600">Documents Processed</p>
                  <p className="text-2xl font-bold text-indigo-600">{feat.docs}</p>
                </div>
                <div>
                  <p className="text-slate-600">Avg Processing Time</p>
                  <p className="text-lg font-semibold text-slate-900">{feat.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Category Distribution */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <Card className="p-8 bg-white/80 backdrop-blur border border-white/20">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Document Categories</h2>
          <div className="space-y-3">
            {categories.map((cat, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-center mb-2">
                  <p className="font-medium text-slate-900">{cat.name}</p>
                  <Badge>{cat.count}</Badge>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className={`bg-gradient-to-r ${cat.color} h-2 rounded-full`}
                    style={{ width: `${(cat.count / 42) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Data Extraction Examples */}
        <Card className="p-8 bg-white/80 backdrop-blur border border-white/20">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Smart Data Extraction</h2>
          <div className="space-y-3">
            {extractionExamples.map((ex, idx) => (
              <div key={idx} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex justify-between items-start mb-2">
                  <p className="font-semibold text-slate-900">{ex.field}</p>
                  <Badge variant="success">{ex.confidence}</Badge>
                </div>
                <p className="text-sm text-slate-600 font-mono bg-white px-2 py-1 rounded mb-1">
                  {ex.example}
                </p>
                <p className="text-xs text-slate-600">Detected in {ex.documents} documents</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* AI Insights */}
      <Card className="p-8 bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200">
        <h2 className="text-xl font-bold text-slate-900 mb-4">🔍 AI Insights</h2>
        <div className="grid grid-cols-3 gap-6">
          <div className="p-4 bg-white rounded-lg">
            <p className="text-3xl font-bold text-indigo-600 mb-1">94.2%</p>
            <p className="text-sm text-slate-600">Average Accuracy Rate</p>
            <p className="text-xs text-slate-500 mt-2">Continuously improving with each processed document</p>
          </div>
          <div className="p-4 bg-white rounded-lg">
            <p className="text-3xl font-bold text-emerald-600 mb-1">7.4 sec</p>
            <p className="text-sm text-slate-600">Avg Processing Time</p>
            <p className="text-xs text-slate-500 mt-2">Complete categorization & extraction per document</p>
          </div>
          <div className="p-4 bg-white rounded-lg">
            <p className="text-3xl font-bold text-purple-600 mb-1">142 hrs</p>
            <p className="text-sm text-slate-600">Time Saved This Month</p>
            <p className="text-xs text-slate-500 mt-2">Equivalent to 4 FTEs manual work eliminated</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
