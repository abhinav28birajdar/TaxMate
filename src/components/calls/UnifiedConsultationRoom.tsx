"use client";

import React, { useState, useEffect } from "react";
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  PhoneCall, 
  Share2, 
  Monitor, 
  FileText, 
  ShieldCheck, 
  Clock, 
  Users, 
  Maximize2, 
  Download, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut,
  AlertCircle,
  CheckCircle2,
  Lock,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CallRecord {
  id: string;
  contactName: string;
  role: string;
  type: "Video" | "Voice";
  date: string;
  duration: string;
  status: "Completed" | "Missed" | "Follow-up Scheduled";
  notes: string;
  documentsShared: string[];
}

export function UnifiedConsultationRoom({ portal = "client" }: { portal: "client" | "ca" }) {
  const [activeTab, setActiveTab] = useState<"active-room" | "call-history">("active-room");
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isDocViewerOpen, setIsDocViewerOpen] = useState(true);
  const [selectedDocIndex, setSelectedDocIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [callDuration, setCallDuration] = useState(842); // 14m 02s
  const [isCallActive, setIsCallActive] = useState(true);
  const [showIncomingSim, setShowIncomingSim] = useState(false);

  // Consultation documents available for shared viewing
  const consultationDocs = [
    {
      title: "ITR-2 Annual Return Computation AY 2026-27",
      type: "ITR Draft",
      pages: 4,
      highlights: ["Gross Total Income: ₹24,50,000", "Sec 112A LTCG: ₹1,85,000", "Net Tax Refund: ₹42,500"],
      note: "CA Rajesh highlighted Schedule CG (Capital Gains) on Page 2."
    },
    {
      title: "Form 26AS Tax Credit Statement (FY 2025-26)",
      type: "TDS Credit",
      pages: 6,
      highlights: ["Part A: TDS on Salary (₹1,90,000)", "Part A1: Bank Interest 194A (₹33,000)", "Part B: TCS 206C (₹0)"],
      note: "Matched with HDFC and ICICI bank 16A certificates."
    },
    {
      title: "Sec 115BAC Old vs New Regime Comparative Audit",
      type: "Tax Advisory",
      pages: 2,
      highlights: ["Old Regime Tax: ₹4,12,000", "New Regime Tax: ₹3,68,500", "Net Savings: ₹43,500 under New Regime"],
      note: "Recommendation: Opt for Section 115BAC New Regime."
    }
  ];

  const callHistory: CallRecord[] = [
    {
      id: "call-1",
      contactName: portal === "client" ? "CA Rajesh Sharma, FCA" : "TechNova Solutions Pvt Ltd",
      role: portal === "client" ? "Senior Tax Advisor" : "Corporate Tax Client",
      type: "Video",
      date: "Today, 10:00 AM",
      duration: "24m 18s",
      status: "Completed",
      notes: "Discussed Section 112A grandfathering clause and approved draft computation.",
      documentsShared: ["ITR-2 Draft Computation.pdf", "Form 26AS.pdf"]
    },
    {
      id: "call-2",
      contactName: portal === "client" ? "CA Ananya Deshmukh" : "Dr. Vikramaditya Rao",
      role: portal === "client" ? "GST Litigation Specialist" : "Medical Practitioner",
      type: "Voice",
      date: "18 Oct 2026",
      duration: "12m 45s",
      status: "Completed",
      notes: "Explained GSTR-3B ITC reversal under Rule 42/43 for mixed exempt supplies.",
      documentsShared: ["ITC Reconciliation Sheet.xlsx"]
    },
    {
      id: "call-3",
      contactName: portal === "client" ? "CA Rajesh Sharma, FCA" : "Apex Logistics India",
      role: portal === "client" ? "Senior Tax Advisor" : "Logistics Retainer",
      type: "Video",
      date: "14 Oct 2026",
      duration: "18m 02s",
      status: "Follow-up Scheduled",
      notes: "Reviewed Q2 TDS challans; client to provide pending lower deduction certificates.",
      documentsShared: ["Form 26Q TDS Audit.pdf"]
    }
  ];

  // Call timer simulation
  useEffect(() => {
    let interval: any;
    if (isCallActive) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCallActive]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? `0${mins}` : mins}:${secs < 10 ? `0${secs}` : secs}`;
  };

  const handleEndCall = () => {
    setIsCallActive(false);
    toast.success("Call ended. Consultation recording and notes saved to your Vault.");
  };

  const handleStartCall = () => {
    setIsCallActive(true);
    setCallDuration(0);
    toast.success("Joined 256-bit encrypted Consultation Room.");
  };

  const currentDoc = consultationDocs[selectedDocIndex];

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-white">
      {/* Top Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Video className="w-6 h-6 text-emerald-400" /> WebRTC Consultation & Screen Sharing Suite
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            256-bit encrypted video consultations with real-time synchronized tax document review and screen sharing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-[#141414] p-1 rounded-xl border border-white/10 text-xs">
            <button
              onClick={() => setActiveTab("active-room")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === "active-room" ? "bg-emerald-600 text-white shadow-[0_0_12px_rgba(5,150,105,0.4)]" : "text-gray-400 hover:text-white"
              }`}
            >
              Active Room
            </button>
            <button
              onClick={() => setActiveTab("call-history")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === "call-history" ? "bg-emerald-600 text-white shadow-[0_0_12px_rgba(5,150,105,0.4)]" : "text-gray-400 hover:text-white"
              }`}
            >
              Call History ({callHistory.length})
            </button>
          </div>

          <Button
            onClick={() => setShowIncomingSim(true)}
            variant="outline"
            size="sm"
            className="text-xs border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
          >
            <PhoneCall className="w-3.5 h-3.5 mr-1.5" /> Simulate Incoming Call
          </Button>
        </div>
      </div>

      {activeTab === "active-room" ? (
        <div className="space-y-4">
          {/* Active Consultation Container */}
          {isCallActive ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 bg-[#0A0A0A] border border-white/10 rounded-3xl p-4 shadow-2xl relative overflow-hidden">
              
              {/* Left/Main Video Grid & Screen Share Stream (col-span-7 or 12) */}
              <div className={`${isDocViewerOpen ? "lg:col-span-7" : "lg:col-span-12"} space-y-3 transition-all`}>
                <div className="relative aspect-video bg-[#111111] border border-white/10 rounded-2xl overflow-hidden flex items-center justify-center shadow-inner group">
                  
                  {/* Background Mock Stream */}
                  {isScreenSharing ? (
                    <div className="w-full h-full bg-[#18181b] p-6 space-y-4 flex flex-col justify-between">
                      <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs">
                        <span className="flex items-center gap-2 text-emerald-400 font-bold">
                          <Monitor className="w-4 h-4" /> Screen Sharing: Excel Capital Gains Ledger
                        </span>
                        <span className="font-mono text-[10px] text-gray-400">1920x1080 @ 60fps</span>
                      </div>
                      <div className="flex-1 bg-[#111111] border border-white/5 rounded-xl p-4 text-[11px] font-mono text-gray-300 space-y-2">
                        <div className="grid grid-cols-4 font-bold text-white border-b border-white/10 pb-1">
                          <span>ISIN Script</span>
                          <span>Buy Value</span>
                          <span>Sell Value</span>
                          <span className="text-right">Sec 112A Gain</span>
                        </div>
                        <div className="grid grid-cols-4 text-gray-400">
                          <span>INFY - Infosys</span>
                          <span>₹2,40,000</span>
                          <span>₹4,85,000</span>
                          <span className="text-right text-emerald-400">+₹2,45,000</span>
                        </div>
                        <div className="grid grid-cols-4 text-gray-400">
                          <span>TCS - Tata Consultancy</span>
                          <span>₹3,10,000</span>
                          <span>₹5,20,000</span>
                          <span className="text-right text-emerald-400">+₹2,10,000</span>
                        </div>
                        <div className="grid grid-cols-4 text-gray-400">
                          <span>HDFCBANK - HDFC Ltd</span>
                          <span>₹1,80,000</span>
                          <span>₹2,20,000</span>
                          <span className="text-right text-emerald-400">+₹40,000</span>
                        </div>
                      </div>
                    </div>
                  ) : videoOn ? (
                    <div className="w-full h-full relative flex items-center justify-center bg-gradient-to-tr from-[#0F0F0F] to-[#1A1A1A]">
                      <div className="text-center space-y-3 z-10">
                        <div className="w-24 h-24 rounded-2xl bg-emerald-600 text-white font-extrabold text-3xl flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(5,150,105,0.4)] border-2 border-emerald-400">
                          {portal === "client" ? "RS" : "TN"}
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-base flex items-center justify-center gap-1.5">
                            {portal === "client" ? "CA Rajesh Sharma, FCA" : "TechNova Solutions"}
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          </h3>
                          <p className="text-xs text-gray-400">Connected via 256-bit WebRTC Secure Stream</p>
                        </div>
                      </div>

                      {/* Small PIP User Camera Preview */}
                      <div className="absolute top-4 right-4 w-32 aspect-video bg-[#141414] border border-white/20 rounded-xl overflow-hidden shadow-lg flex items-center justify-center text-xs text-gray-400 font-bold">
                        <div className="text-center">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block mr-1"></span>
                          <span>You (Live)</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center space-y-2">
                      <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mx-auto text-gray-400">
                        <VideoOff className="w-8 h-8" />
                      </div>
                      <p className="text-xs text-gray-400">Camera is turned off</p>
                    </div>
                  )}

                  {/* Top Status Overlay Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold flex items-center gap-1.5 backdrop-blur-md">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      {formatTimer(callDuration)}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-black/60 text-gray-300 border border-white/10 text-[10px] backdrop-blur-md hidden sm:inline">
                      🔒 256-bit Encrypted
                    </span>
                  </div>
                </div>

                {/* Stream Controls Bar */}
                <div className="p-3 bg-[#111111] border border-white/10 rounded-2xl flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Button
                      variant={micOn ? "outline" : "destructive"}
                      size="sm"
                      onClick={() => setMicOn(!micOn)}
                      className={`rounded-xl h-10 px-3 border-white/10 ${micOn ? "text-white hover:bg-white/10" : ""}`}
                    >
                      {micOn ? <Mic className="w-4 h-4 mr-1 text-emerald-400" /> : <MicOff className="w-4 h-4 mr-1" />}
                      <span className="text-xs">{micOn ? "Mute" : "Unmuted"}</span>
                    </Button>

                    <Button
                      variant={videoOn ? "outline" : "destructive"}
                      size="sm"
                      onClick={() => setVideoOn(!videoOn)}
                      className={`rounded-xl h-10 px-3 border-white/10 ${videoOn ? "text-white hover:bg-white/10" : ""}`}
                    >
                      {videoOn ? <Video className="w-4 h-4 mr-1 text-emerald-400" /> : <VideoOff className="w-4 h-4 mr-1" />}
                      <span className="text-xs">{videoOn ? "Stop Cam" : "Start Cam"}</span>
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsScreenSharing(!isScreenSharing)}
                      className={`rounded-xl h-10 px-3 border-white/10 ${
                        isScreenSharing ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40" : "text-white hover:bg-white/10"
                      }`}
                    >
                      <Monitor className="w-4 h-4 mr-1 text-emerald-400" />
                      <span className="text-xs">{isScreenSharing ? "Stop Sharing" : "Share Screen"}</span>
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsDocViewerOpen(!isDocViewerOpen)}
                      className={`rounded-xl h-10 px-3 border-white/10 ${
                        isDocViewerOpen ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40" : "text-white hover:bg-white/10"
                      }`}
                    >
                      <FileText className="w-4 h-4 mr-1 text-emerald-400" />
                      <span className="text-xs">{isDocViewerOpen ? "Hide Docs" : "Split Docs"}</span>
                    </Button>

                    <Button
                      onClick={handleEndCall}
                      size="sm"
                      className="bg-red-600 hover:bg-red-700 text-white rounded-xl h-10 px-4 font-bold shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                    >
                      <PhoneOff className="w-4 h-4 mr-1.5" /> End Call
                    </Button>
                  </div>
                </div>
              </div>

              {/* Right Side: Synchronized Document Viewer (Specifically for Tax Consultations) */}
              {isDocViewerOpen && (
                <div className="lg:col-span-5 bg-[#141414] border border-white/10 rounded-2xl flex flex-col overflow-hidden h-[540px]">
                  
                  {/* Doc Viewer Top Bar */}
                  <div className="p-3 border-b border-white/10 bg-[#1A1A1A] flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-xs font-bold text-white truncate">
                        Synchronized Tax Document Viewer
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button onClick={() => setZoomLevel(Math.max(80, zoomLevel - 10))} className="p-1 text-gray-400 hover:text-white">
                        <ZoomOut className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[10px] font-mono text-gray-400 px-1">{zoomLevel}%</span>
                      <button onClick={() => setZoomLevel(Math.min(140, zoomLevel + 10))} className="p-1 text-gray-400 hover:text-white">
                        <ZoomIn className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Document Switcher Tabs */}
                  <div className="p-2 border-b border-white/10 bg-[#111111] flex gap-1.5 overflow-x-auto text-[11px]">
                    {consultationDocs.map((doc, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedDocIndex(idx)}
                        className={`px-2.5 py-1 rounded-lg truncate whitespace-nowrap transition-all ${
                          selectedDocIndex === idx
                            ? "bg-emerald-600 text-white font-semibold"
                            : "bg-[#18181b] text-gray-400 hover:text-white"
                        }`}
                      >
                        {doc.type}
                      </button>
                    ))}
                  </div>

                  {/* Rendered Document Body */}
                  <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#0F0F0F]" style={{ fontSize: `${zoomLevel}%` }}>
                    <div className="p-4 bg-[#18181b] border border-white/10 rounded-xl space-y-3">
                      <div className="flex items-center justify-between border-b border-white/10 pb-2">
                        <h4 className="font-bold text-xs text-emerald-400">{currentDoc.title}</h4>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-mono">
                          Page 1 of {currentDoc.pages}
                        </span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <p className="text-gray-300 font-semibold">Key Audited Computations:</p>
                        <ul className="space-y-1.5 pl-2 text-gray-400 text-[11px]">
                          {currentDoc.highlights.map((h, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              <span>{h}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Live Annotation Callout */}
                      <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs space-y-1">
                        <span className="font-bold flex items-center gap-1.5 text-[11px]">
                          <Sparkles className="w-3.5 h-3.5" /> CA Live Note & Recommendation:
                        </span>
                        <p className="text-[11px] text-gray-300">{currentDoc.note}</p>
                      </div>
                    </div>
                  </div>

                  {/* Footer Controls */}
                  <div className="p-2.5 border-t border-white/10 bg-[#141414] flex items-center justify-between text-xs text-gray-400">
                    <span className="text-[10px]">Sync: CA Rajesh & Client in view</span>
                    <Button size="sm" variant="ghost" className="h-7 text-xs text-emerald-400 hover:text-emerald-300">
                      <Download className="w-3 h-3 mr-1" /> Download PDF Copy
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-16 text-center space-y-4 bg-[#111111] border border-white/10 rounded-3xl p-8 shadow-xl">
              <div className="w-16 h-16 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                <Video className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Consultation Room Closed</h3>
                <p className="text-xs text-gray-400 max-w-md mx-auto mt-1">
                  Ready to resume consultation with {portal === "client" ? "CA Rajesh Sharma" : "TechNova Solutions"}?
                </p>
              </div>
              <Button onClick={handleStartCall} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 rounded-xl shadow-[0_0_20px_rgba(5,150,105,0.4)]">
                <Video className="w-4 h-4 mr-2" /> Rejoin Consultation Room
              </Button>
            </div>
          )}
        </div>
      ) : (
        /* Call History Tab */
        <div className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="font-bold text-sm text-white">Consultation Records & Recorded Calls</h3>
            <span className="text-xs text-gray-400">Total 3 Sessions Audited</span>
          </div>

          <div className="divide-y divide-white/10">
            {callHistory.map((c) => (
              <div key={c.id} className="p-4.5 hover:bg-[#18181b] transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{c.contactName}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                      {c.type} Call
                    </span>
                    <span className="text-[10px] text-gray-400">{c.date} ({c.duration})</span>
                  </div>
                  <p className="text-xs text-gray-400">{c.notes}</p>
                  <div className="flex items-center gap-2 pt-1 text-[11px] text-emerald-400">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Docs reviewed: {c.documentsShared.join(", ")}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="border-white/10 text-xs text-gray-300 hover:text-white">
                    View Call Notes
                  </Button>
                  <Button size="sm" onClick={handleStartCall} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs">
                    Start Call
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Simulated Incoming Call Alert Modal */}
      {showIncomingSim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm bg-[#111111] border border-emerald-500/40 rounded-3xl p-6 text-center space-y-6 shadow-2xl text-white">
            <div className="relative mx-auto w-20 h-20">
              <span className="animate-ping absolute inset-0 rounded-full bg-emerald-500 opacity-75"></span>
              <div className="relative w-20 h-20 rounded-full bg-emerald-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                RS
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] uppercase tracking-wider font-bold text-emerald-400">
                Incoming Video Consultation
              </span>
              <h3 className="text-lg font-bold text-white">CA Rajesh Sharma, FCA</h3>
              <p className="text-xs text-gray-400">Statutory Tax Review & Capital Gains Audit</p>
            </div>

            <div className="flex items-center justify-center gap-4 pt-2">
              <Button
                variant="destructive"
                onClick={() => { setShowIncomingSim(false); toast.error("Call declined"); }}
                className="rounded-full w-14 h-14 bg-red-600 hover:bg-red-700 shadow-lg"
              >
                <PhoneOff className="w-6 h-6" />
              </Button>
              <Button
                onClick={() => { setShowIncomingSim(false); handleStartCall(); }}
                className="rounded-full w-14 h-14 bg-emerald-600 hover:bg-emerald-700 shadow-[0_0_25px_rgba(5,150,105,0.6)]"
              >
                <Video className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
