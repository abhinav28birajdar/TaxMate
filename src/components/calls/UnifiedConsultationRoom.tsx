"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Monitor,
  FileText,
  ShieldCheck,
  Download,
  ZoomIn,
  ZoomOut,
  X,
  Calendar,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";

interface AppointmentItem {
  id: string;
  title: string;
  description?: string | null;
  type: string;
  status: string;
  startTime: string;
  endTime: string;
  meetingLink?: string | null;
  notes?: string | null;
}

interface ConsultationDoc {
  id: string;
  title: string;
  category: string;
  mimeType: string;
  signedUrl: string;
  financialYear: string;
}

function formatTimer(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins < 10 ? `0${mins}` : mins}:${secs < 10 ? `0${secs}` : secs}`;
}

export function UnifiedConsultationRoom({
  portal = "client",
  initialAppointmentId,
}: {
  portal: "client" | "ca";
  initialAppointmentId?: string;
}) {
  const [activeTab, setActiveTab] = useState<"active-room" | "call-history">("active-room");
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string>(
    initialAppointmentId || ""
  );
  const [docs, setDocs] = useState<ConsultationDoc[]>([]);
  const [loading, setLoading] = useState(true);

  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isDocViewerOpen, setIsDocViewerOpen] = useState(true);
  const [selectedDocIndex, setSelectedDocIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [callDuration, setCallDuration] = useState(0);
  const [isCallActive, setIsCallActive] = useState(false);
  const [callNotes, setCallNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [viewNotesItem, setViewNotesItem] = useState<AppointmentItem | null>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);

  const stopCameraStream = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
  }, []);

  const stopScreenStream = useCallback(() => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
    }
    if (screenVideoRef.current) {
      screenVideoRef.current.srcObject = null;
    }
    setIsScreenSharing(false);
  }, []);

  const loadConsultationData = useCallback(async () => {
    try {
      setLoading(true);
      const [apptRes, docsRes] = await Promise.all([
        fetch("/api/appointments?limit=50", { credentials: "include" }),
        fetch("/api/documents?signed=true&take=25", { credentials: "include" }),
      ]);

      if (apptRes.ok) {
        const apptJson = await apptRes.json();
        const list: AppointmentItem[] = apptJson.data?.appointments || [];
        setAppointments(list);
        if (list.length > 0) {
          const matchedInitial = selectedAppointmentId
            ? list.find((a) => a.id === selectedAppointmentId)
            : null;
          if (matchedInitial) {
            setCallNotes((prev) => prev || matchedInitial.notes || "");
          } else if (!selectedAppointmentId || !list.some((a) => a.id === selectedAppointmentId)) {
            const activeOrUpcoming =
              list.find((a) => ["CONFIRMED", "PENDING"].includes(a.status)) || list[0];
            setSelectedAppointmentId(activeOrUpcoming.id);
            setCallNotes(activeOrUpcoming.notes || "");
          }
        }
      }

      if (docsRes.ok) {
        const docsJson = await docsRes.json();
        const mapped: ConsultationDoc[] = (docsJson.documents || []).map((d: any) => ({
          id: d.id,
          title: d.name || d.file_name || "Document",
          category: d.category || d.document_type || "Document",
          mimeType: d.mime_type || d.metadata?.mime_type || "",
          signedUrl: d.signed_url || d.file_url || "",
          financialYear: d.financial_year || "2026-27",
        }));
        setDocs(mapped);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load consultation data");
    } finally {
      setLoading(false);
    }
  }, [selectedAppointmentId]);

  useEffect(() => {
    loadConsultationData();
    return () => {
      stopCameraStream();
      stopScreenStream();
    };
  }, [loadConsultationData, stopCameraStream, stopScreenStream]);

  useEffect(() => {
    if (!isCallActive) return;
    const timer = setInterval(() => setCallDuration((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [isCallActive]);

  const startLocalMedia = async (enableVideo: boolean, enableAudio: boolean) => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      toast.error("Browser media APIs are unavailable.");
      return false;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: enableVideo,
        audio: enableAudio,
      });
      mediaStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      return true;
    } catch {
      toast.error("Camera or microphone permission was denied.");
      return false;
    }
  };

  const handleStartCall = async (apptId?: string) => {
    if (apptId) {
      const found = appointments.find((a) => a.id === apptId);
      setSelectedAppointmentId(apptId);
      setCallNotes(found?.notes || "");
    }
    await startLocalMedia(videoOn, micOn);
    setCallDuration(0);
    setIsCallActive(true);
    setActiveTab("active-room");
    toast.success("Joined consultation room.");
  };

  const handleToggleMic = () => {
    const next = !micOn;
    setMicOn(next);
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach((t) => {
        t.enabled = next;
      });
    }
  };

  const handleToggleVideo = async () => {
    const next = !videoOn;
    setVideoOn(next);
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getVideoTracks().forEach((t) => {
        t.enabled = next;
      });
    }
    if (next && isCallActive && (!mediaStreamRef.current || mediaStreamRef.current.getVideoTracks().length === 0)) {
      await startLocalMedia(true, micOn);
    }
  };

  const handleToggleScreenShare = async () => {
    if (isScreenSharing) {
      stopScreenStream();
      return;
    }
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getDisplayMedia) {
      toast.error("Screen sharing is not supported in this browser.");
      return;
    }
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      displayStream.getVideoTracks()[0].onended = () => stopScreenStream();
      screenStreamRef.current = displayStream;
      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = displayStream;
      }
      setIsScreenSharing(true);
    } catch {
      toast.error("Screen sharing cancelled or denied.");
    }
  };

  const handleSaveNotes = async (appointmentId: string, notesText: string, markCompleted = false) => {
    if (!appointmentId) return;
    try {
      setSavingNotes(true);
      const res = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          notes: notesText,
          ...(markCompleted ? { status: "COMPLETED" } : {}),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save consultation notes");
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === appointmentId
            ? { ...a, notes: notesText, status: markCompleted ? "COMPLETED" : a.status }
            : a
        )
      );
      toast.success(
        markCompleted ? "Consultation ended and notes saved." : "Consultation notes saved."
      );
    } catch (err: any) {
      toast.error(err.message || "Could not save consultation notes");
    } finally {
      setSavingNotes(false);
    }
  };

  const handleEndCall = async () => {
    stopCameraStream();
    stopScreenStream();
    setIsCallActive(false);
    if (selectedAppointmentId) {
      await handleSaveNotes(selectedAppointmentId, callNotes, true);
    } else {
      toast.success("Consultation session ended.");
    }
  };

  const handleDownloadDoc = async (doc: ConsultationDoc) => {
    try {
      const res = await fetch(`/api/documents/download?id=${encodeURIComponent(doc.id)}`, {
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok || !json.signedUrl) {
        throw new Error(json.error || "Unable to fetch download URL");
      }
      window.open(json.signedUrl, "_blank", "noopener,noreferrer");
    } catch (err: any) {
      toast.error(err.message || "Download failed");
    }
  };

  const currentAppointment =
    appointments.find((a) => a.id === selectedAppointmentId) || appointments[0] || null;
  const currentDoc = docs[selectedDocIndex] || null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Video className="w-6 h-6 text-emerald-400" /> Consultation &amp; Document Review Room
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Live local media &amp; screen sharing paired with your scheduled appointments and Vault
            documents.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-[#141414] p-1 rounded-xl border border-white/10 text-xs">
            <button
              onClick={() => setActiveTab("active-room")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === "active-room"
                  ? "bg-emerald-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Active Room
            </button>
            <button
              onClick={() => setActiveTab("call-history")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === "call-history"
                  ? "bg-emerald-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Consultations ({appointments.length})
            </button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadConsultationData}
            className="border-white/10 text-gray-300 hover:text-white text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {activeTab === "active-room" ? (
        isCallActive ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 bg-[#0A0A0A] border border-white/10 rounded-3xl p-4 shadow-2xl">
            <div className={`${isDocViewerOpen ? "lg:col-span-7" : "lg:col-span-12"} space-y-3`}>
              <div className="relative aspect-video bg-[#111111] border border-white/10 rounded-2xl overflow-hidden flex items-center justify-center">
                {isScreenSharing ? (
                  <video
                    ref={screenVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-contain bg-black"
                  />
                ) : videoOn ? (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mx-auto text-gray-400">
                      <VideoOff className="w-8 h-8" />
                    </div>
                    <p className="text-xs text-gray-400">Camera turned off</p>
                  </div>
                )}

                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold flex items-center gap-1.5 backdrop-blur-md">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    {formatTimer(callDuration)}
                  </span>
                  {currentAppointment && (
                    <span className="px-2.5 py-0.5 rounded-full bg-black/70 text-gray-200 border border-white/10 text-[10px] backdrop-blur-md">
                      {currentAppointment.title}
                    </span>
                  )}
                </div>

                {currentAppointment?.meetingLink && (
                  <a
                    href={currentAppointment.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Open Meeting URL
                  </a>
                )}
              </div>

              <div className="p-3 bg-[#111111] border border-white/10 rounded-2xl flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Button
                    variant={micOn ? "outline" : "destructive"}
                    size="sm"
                    onClick={handleToggleMic}
                    className={`rounded-xl h-10 px-3 border-white/10 ${micOn ? "text-white" : ""}`}
                  >
                    {micOn ? (
                      <Mic className="w-4 h-4 mr-1 text-emerald-400" />
                    ) : (
                      <MicOff className="w-4 h-4 mr-1" />
                    )}
                    <span className="text-xs">{micOn ? "Mute" : "Unmute"}</span>
                  </Button>

                  <Button
                    variant={videoOn ? "outline" : "destructive"}
                    size="sm"
                    onClick={handleToggleVideo}
                    className={`rounded-xl h-10 px-3 border-white/10 ${videoOn ? "text-white" : ""}`}
                  >
                    {videoOn ? (
                      <Video className="w-4 h-4 mr-1 text-emerald-400" />
                    ) : (
                      <VideoOff className="w-4 h-4 mr-1" />
                    )}
                    <span className="text-xs">{videoOn ? "Stop Cam" : "Start Cam"}</span>
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleToggleScreenShare}
                    className={`rounded-xl h-10 px-3 border-white/10 ${
                      isScreenSharing
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                        : "text-white"
                    }`}
                  >
                    <Monitor className="w-4 h-4 mr-1 text-emerald-400" />
                    <span className="text-xs">
                      {isScreenSharing ? "Stop Share" : "Share Screen"}
                    </span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsDocViewerOpen(!isDocViewerOpen)}
                    className="rounded-xl h-10 px-3 border-white/10 text-white"
                  >
                    <FileText className="w-4 h-4 mr-1 text-emerald-400" />
                    <span className="text-xs">{isDocViewerOpen ? "Hide Docs" : "Show Docs"}</span>
                  </Button>

                  <Button
                    onClick={handleEndCall}
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 text-white rounded-xl h-10 px-4 font-bold"
                  >
                    <PhoneOff className="w-4 h-4 mr-1.5" /> End Call
                  </Button>
                </div>
              </div>

              {currentAppointment && (
                <div className="p-3 bg-[#111111] border border-white/10 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-gray-300">Session Notes</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={savingNotes}
                      onClick={() => handleSaveNotes(currentAppointment.id, callNotes, false)}
                      className="h-7 text-xs text-emerald-400"
                    >
                      {savingNotes ? "Saving..." : "Save Notes"}
                    </Button>
                  </div>
                  <textarea
                    rows={2}
                    value={callNotes}
                    onChange={(e) => setCallNotes(e.target.value)}
                    placeholder="Record discussion summary or follow-up items..."
                    className="w-full bg-[#18181b] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}
            </div>

            {isDocViewerOpen && (
              <div className="lg:col-span-5 bg-[#141414] border border-white/10 rounded-2xl flex flex-col overflow-hidden h-[540px]">
                <div className="p-3 border-b border-white/10 bg-[#1A1A1A] flex items-center justify-between">
                  <span className="text-xs font-bold text-white truncate flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-400" /> Vault Document Viewer
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setZoomLevel(Math.max(80, zoomLevel - 10))}
                      className="p-1 text-gray-400 hover:text-white"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] font-mono text-gray-400 px-1">{zoomLevel}%</span>
                    <button
                      onClick={() => setZoomLevel(Math.min(140, zoomLevel + 10))}
                      className="p-1 text-gray-400 hover:text-white"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {docs.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center p-6 text-center text-xs text-gray-500">
                    No documents uploaded to your Vault yet.
                  </div>
                ) : (
                  <>
                    <div className="p-2 border-b border-white/10 bg-[#111111] flex gap-1.5 overflow-x-auto text-[11px]">
                      {docs.map((doc, idx) => (
                        <button
                          key={doc.id}
                          onClick={() => setSelectedDocIndex(idx)}
                          className={`px-2.5 py-1 rounded-lg truncate max-w-[160px] whitespace-nowrap transition-all ${
                            selectedDocIndex === idx
                              ? "bg-emerald-600 text-white font-semibold"
                              : "bg-[#18181b] text-gray-400 hover:text-white"
                          }`}
                        >
                          {doc.title}
                        </button>
                      ))}
                    </div>

                    <div
                      className="flex-1 p-4 overflow-y-auto bg-[#0F0F0F]"
                      style={{ fontSize: `${zoomLevel}%` }}
                    >
                      {currentDoc && (
                        <div className="p-4 bg-[#18181b] border border-white/10 rounded-xl space-y-3">
                          <div className="flex items-center justify-between border-b border-white/10 pb-2">
                            <h4 className="font-bold text-xs text-emerald-400 truncate">
                              {currentDoc.title}
                            </h4>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-mono shrink-0">
                              {currentDoc.category}
                            </span>
                          </div>
                          {currentDoc.signedUrl.startsWith("http") &&
                          currentDoc.mimeType.startsWith("image/") ? (
                            <img
                              src={currentDoc.signedUrl}
                              alt={currentDoc.title}
                              className="max-h-72 w-full object-contain rounded-lg bg-black"
                            />
                          ) : currentDoc.signedUrl.startsWith("http") &&
                            (currentDoc.mimeType.includes("pdf") ||
                              currentDoc.title.toLowerCase().endsWith(".pdf")) ? (
                            <iframe
                              src={currentDoc.signedUrl}
                              title={currentDoc.title}
                              className="w-full h-72 rounded-lg bg-white"
                            />
                          ) : (
                            <p className="text-xs text-gray-400">
                              Assessment Year: {currentDoc.financialYear}. Use the download button
                              below to inspect this file.
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {currentDoc && (
                      <div className="p-2.5 border-t border-white/10 bg-[#141414] flex items-center justify-between text-xs text-gray-400">
                        <span className="text-[10px] flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Signed Access
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDownloadDoc(currentDoc)}
                          className="h-7 text-xs text-emerald-400 hover:text-emerald-300"
                        >
                          <Download className="w-3 h-3 mr-1" /> Open / Download
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="py-16 text-center space-y-4 bg-[#111111] border border-white/10 rounded-3xl p-8 shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
              <Video className="w-8 h-8" />
            </div>
            {currentAppointment ? (
              <>
                <div>
                  <h3 className="text-xl font-bold text-white">{currentAppointment.title}</h3>
                  <p className="text-xs text-gray-400 max-w-md mx-auto mt-1">
                    Scheduled for{" "}
                    {new Date(currentAppointment.startTime).toLocaleString("en-IN")} (
                    {currentAppointment.status})
                  </p>
                </div>
                <div className="flex justify-center gap-3">
                  <Button
                    onClick={() => handleStartCall(currentAppointment.id)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 rounded-xl"
                  >
                    <Video className="w-4 h-4 mr-2" /> Enter Consultation Room
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div>
                  <h3 className="text-xl font-bold text-white">No Scheduled Consultations</h3>
                  <p className="text-xs text-gray-400 max-w-md mx-auto mt-1">
                    Schedule a video or phone consultation first, or launch an ad-hoc document review
                    room.
                  </p>
                </div>
                <div className="flex justify-center gap-3">
                  <Link href={portal === "client" ? "/portal/appointments" : "/ca/appointments"}>
                    <Button
                      variant="outline"
                      className="border-white/10 text-gray-300 text-xs rounded-xl"
                    >
                      <Calendar className="w-4 h-4 mr-1.5" /> View Appointments
                    </Button>
                  </Link>
                  <Button
                    onClick={() => handleStartCall()}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 rounded-xl text-xs"
                  >
                    <Video className="w-4 h-4 mr-1.5" /> Start Local Review Room
                  </Button>
                </div>
              </>
            )}
          </div>
        )
      ) : (
        <div className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="font-bold text-sm text-white">Consultation Schedule &amp; History</h3>
            <span className="text-xs text-gray-400">
              {appointments.length} record{appointments.length === 1 ? "" : "s"}
            </span>
          </div>

          {appointments.length === 0 ? (
            <div className="p-10 text-center text-xs text-gray-500">
              No consultation appointments recorded yet.
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {appointments.map((appt) => (
                <div
                  key={appt.id}
                  className="p-4 hover:bg-[#18181b] transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-sm text-white">{appt.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                        {appt.type}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-300">
                        {appt.status}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {new Date(appt.startTime).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">
                      {appt.notes || appt.description || "No notes recorded yet."}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setViewNotesItem(appt)}
                      className="border-white/10 text-xs text-gray-300 hover:text-white"
                    >
                      Call Notes
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleStartCall(appt.id)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                    >
                      Join Room
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Call Notes Modal */}
      {viewNotesItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#111111] border border-white/10 rounded-2xl p-6 space-y-4 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-base">Consultation Notes</h3>
              <button
                onClick={() => setViewNotesItem(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-emerald-400 font-semibold">{viewNotesItem.title}</p>
            <textarea
              rows={4}
              value={viewNotesItem.notes || ""}
              onChange={(e) =>
                setViewNotesItem({ ...viewNotesItem, notes: e.target.value })
              }
              className="w-full bg-[#18181b] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
              placeholder="Enter consultation notes..."
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewNotesItem(null)}
                className="border-white/10 text-xs"
              >
                Close
              </Button>
              <Button
                size="sm"
                disabled={savingNotes}
                onClick={async () => {
                  await handleSaveNotes(viewNotesItem.id, viewNotesItem.notes || "", false);
                  setViewNotesItem(null);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
              >
                {savingNotes ? "Saving..." : "Save Notes"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
