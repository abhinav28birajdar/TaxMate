"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar as CalendarIcon,
  Video,
  Clock,
  Plus,
  ShieldCheck,
  CheckCircle2,
  X,
  ArrowRight,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/UnifiedAuthContext";
import { useRealtimeAppointments } from "@/hooks/use-realtime";

interface Appointment {
  id: string;
  caId?: string;
  caName: string;
  caAvatar?: string | null;
  clientId?: string;
  clientName?: string;
  title: string;
  category: string;
  startTime: string;
  endTime: string;
  fee: string;
  mode: string;
  status: string;
  meetingLink?: string | null;
  notes?: string | null;
}

interface CaDirectoryOption {
  id: string;
  name: string;
  firm: string;
  experience: string;
  rating: number;
  fee: string;
  consultationFee: number;
  specializations: string[];
  isAssigned?: boolean;
}

interface ClientOption {
  id: string;
  name: string;
  pan?: string;
}

const TIME_SLOTS = [
  "10:00 AM - 10:45 AM",
  "11:30 AM - 12:15 PM",
  "02:00 PM - 02:45 PM",
  "04:00 PM - 04:45 PM",
  "05:30 PM - 06:15 PM",
];

function slotToIsoRange(dateStr: string, slotLabel: string): { startTime: string; endTime: string } {
  const [startPart, endPart] = slotLabel.split("-").map((s) => s.trim());
  const parsePart = (part: string) => {
    const match = part.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return { hours: 16, minutes: 0 };
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const meridiem = match[3].toUpperCase();
    if (meridiem === "PM" && hours !== 12) hours += 12;
    if (meridiem === "AM" && hours === 12) hours = 0;
    return { hours, minutes };
  };

  const s = parsePart(startPart || "04:00 PM");
  const e = parsePart(endPart || "04:45 PM");
  const [y, m, d] = dateStr.split("-").map((n) => parseInt(n, 10));
  const start = new Date(y, (m || 1) - 1, d || 1, s.hours, s.minutes, 0, 0);
  const end = new Date(y, (m || 1) - 1, d || 1, e.hours, e.minutes, 0, 0);
  if (end <= start) {
    end.setMinutes(start.getMinutes() + 45);
  }
  return { startTime: start.toISOString(), endTime: end.toISOString() };
}

function getDefaultTomorrowDate(): string {
  const d = new Date(Date.now() + 86400000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function UnifiedAppointmentSystem() {
  const pathname = usePathname();
  const { user, role } = useAuth();
  const isCaPortal = pathname?.startsWith("/ca") || role === "CA" || role === "STAFF" || role === "SUPER_ADMIN";

  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [casList, setCasList] = useState<CaDirectoryOption[]>([]);
  const [clientsList, setClientsList] = useState<ClientOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState<Appointment | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState(getDefaultTomorrowDate);
  const [rescheduleSlot, setRescheduleSlot] = useState(TIME_SLOTS[0]);

  const [bookingStep, setBookingStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedCaId, setSelectedCaId] = useState("");
  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("Tax Planning & Sec 115BAC Regime Review");
  const [selectedCategory, setSelectedCategory] = useState("Tax Planning");
  const [selectedMode, setSelectedMode] = useState<"VIDEO_CALL" | "IN_PERSON" | "PHONE_CALL">("VIDEO_CALL");
  const [selectedDate, setSelectedDate] = useState(getDefaultTomorrowDate);
  const [selectedSlot, setSelectedSlot] = useState(TIME_SLOTS[3]);
  const [bookingNotes, setBookingNotes] = useState("");

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const requests: Promise<Response>[] = [
        fetch("/api/appointments?limit=100"),
        fetch("/api/cas"),
      ];
      if (isCaPortal) {
        requests.push(fetch("/api/clients?take=100"));
      }

      const [aptRes, caRes, cliRes] = await Promise.all(requests);

      if (aptRes?.ok) {
        const aptJson = await aptRes.json().catch(() => ({}));
        const rows = aptJson.data?.appointments || aptJson.appointments || [];
        setAppointments(
          rows.map((item: any) => ({
            id: item.id,
            caId: item.caId || item.ca_id,
            caName: item.caName || "Chartered Accountant",
            caAvatar: item.caAvatar || null,
            clientId: item.clientId || item.client_id,
            clientName: item.clientName || "Client",
            title: item.title || "Tax Consultation",
            category: item.category || "Tax Planning",
            startTime: item.startTime || item.start_time,
            endTime: item.endTime || item.end_time,
            fee: item.fee || "Retainer",
            mode:
              item.type === "IN_PERSON"
                ? "In-Person Office"
                : item.type === "PHONE_CALL"
                ? "Phone Consultation"
                : "Video Consultation",
            status: String(item.status || "CONFIRMED").toUpperCase(),
            meetingLink: item.meetingLink || item.meeting_link || (isCaPortal ? "/ca/calls" : "/client/calls"),
            notes: item.notes || "",
          }))
        );
      }

      if (caRes?.ok) {
        const caJson = await caRes.json().catch(() => ({}));
        const list: CaDirectoryOption[] = caJson.cas || [];
        setCasList(list);
        if (!selectedCaId && list.length > 0) {
          const assigned = list.find((c) => c.isAssigned);
          setSelectedCaId((assigned || list[0]).id);
        }
      }

      if (cliRes?.ok) {
        const cliJson = await cliRes.json().catch(() => ({}));
        const cliRows = (cliJson.clients || []).map((c: any) => ({
          id: c.id,
          name: c.display_name || c.full_name || c.email || "Client",
          pan: c.pan || undefined,
        }));
        setClientsList(cliRows);
        if (!selectedClientId && cliRows.length > 0) {
          setSelectedClientId(cliRows[0].id);
        }
      }
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
      toast.error("Unable to load appointments right now.");
    } finally {
      setLoading(false);
    }
  }, [user, isCaPortal, selectedCaId, selectedClientId]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, loadData]);

  useRealtimeAppointments(
    user?.id || "",
    () => { void loadData(); },
    () => { void loadData(); }
  );

  const selectedCAObj = useMemo(
    () => casList.find((c) => c.id === selectedCaId) || null,
    [casList, selectedCaId]
  );

  const selectedClientObj = useMemo(
    () => clientsList.find((c) => c.id === selectedClientId) || null,
    [clientsList, selectedClientId]
  );

  const handleConfirmBooking = async () => {
    if (!selectedTopic.trim()) {
      toast.error("Please enter a consultation subject.");
      return;
    }

    if (isCaPortal && !selectedClientId) {
      toast.error("Please add or select a client before scheduling.");
      return;
    }

    if (!isCaPortal && !selectedCaId) {
      toast.error("No Chartered Accountant is available to schedule right now.");
      return;
    }

    const { startTime, endTime } = slotToIsoRange(selectedDate, selectedSlot);
    if (new Date(startTime) < new Date()) {
      toast.error("Please select a future date and time slot.");
      return;
    }

    setSubmitting(true);
    try {
      const payload: Record<string, any> = {
        title: selectedTopic.trim(),
        startTime,
        endTime,
        type: selectedMode,
        category: selectedCategory,
        notes: bookingNotes.trim() || "Confirmed consultation scheduled via TaxMate.",
        fee: selectedCAObj?.fee || "Retainer",
      };

      if (isCaPortal) {
        payload.clientId = selectedClientId;
      } else {
        payload.caId = selectedCaId;
      }

      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.message || json.error || "Failed to book consultation");
      }

      setShowBookingModal(false);
      setBookingStep(1);
      setBookingNotes("");
      toast.success("Consultation scheduled and saved to your calendar.");
      await loadData();
    } catch (err: any) {
      toast.error(err.message || "Could not create appointment.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelAppointment = async (id: string) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.error || "Failed to cancel appointment");
      }
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "CANCELLED" } : a))
      );
      toast.info("Appointment cancelled.");
    } catch (err: any) {
      toast.error(err.message || "Unable to cancel appointment.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRescheduleSubmit = async () => {
    if (!showRescheduleModal) return;
    const { startTime, endTime } = slotToIsoRange(rescheduleDate, rescheduleSlot);
    if (new Date(startTime) < new Date()) {
      toast.error("Rescheduled time must be in the future.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/appointments/${showRescheduleModal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startTime,
          endTime,
          status: "CONFIRMED",
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.error || "Failed to reschedule appointment");
      }
      toast.success("Appointment rescheduled successfully!");
      setShowRescheduleModal(null);
      await loadData();
    } catch (err: any) {
      toast.error(err.message || "Could not reschedule appointment.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkCompleted = async (id: string) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED" }),
      });
      if (!res.ok) throw new Error("Failed to complete appointment");
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "COMPLETED" } : a))
      );
      toast.success("Consultation marked as completed.");
    } catch (err: any) {
      toast.error(err.message || "Could not update status.");
    } finally {
      setSubmitting(false);
    }
  };

  const upcomingList = appointments.filter(
    (a) => a.status === "CONFIRMED" || a.status === "PENDING" || a.status === "RESCHEDULED"
  );
  const pastList = appointments.filter(
    (a) => a.status === "COMPLETED" || a.status === "CANCELLED" || a.status === "NO_SHOW"
  );
  const visibleList = activeTab === "upcoming" ? upcomingList : pastList;

  const callsHref = isCaPortal ? "/ca/calls" : "/client/calls";
  const returnsHref = isCaPortal ? "/ca/income-tax/itr" : "/client/tax-returns";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <CalendarIcon className="w-4 h-4" /> Module 10: CA Appointment System
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            Booked Consultations & CA Sessions
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Schedule 1-on-1 video consultations, screen-sharing tax reviews, and advisory appointments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={loadData}
            variant="outline"
            disabled={loading}
            className="border-white/10 text-gray-300 hover:bg-white/5 text-xs rounded-xl"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            onClick={() => {
              setBookingStep(1);
              setShowBookingModal(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-[0_0_20px_rgba(5,150,105,0.3)]"
          >
            <Plus className="w-4 h-4 mr-1.5" /> {isCaPortal ? "Schedule Session" : "Book Consultation"}
          </Button>
        </div>
      </div>

      <div className="flex border-b border-white/10 gap-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab("upcoming")}
          className={`pb-3 transition-colors flex items-center gap-2 ${
            activeTab === "upcoming"
              ? "text-emerald-400 border-b-2 border-emerald-500 font-semibold"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <Clock className="w-4 h-4" /> Upcoming Consultations ({upcomingList.length})
        </button>
        <button
          onClick={() => setActiveTab("past")}
          className={`pb-3 transition-colors flex items-center gap-2 ${
            activeTab === "past"
              ? "text-emerald-400 border-b-2 border-emerald-500 font-semibold"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <CheckCircle2 className="w-4 h-4" /> Past Consultation History ({pastList.length})
        </button>
      </div>

      {loading ? (
        <div className="p-12 bg-[#111111] border border-white/10 rounded-2xl flex items-center justify-center gap-2 text-xs text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin text-emerald-400" /> Loading scheduled consultations...
        </div>
      ) : visibleList.length === 0 ? (
        <div className="p-12 bg-[#111111] border border-white/10 rounded-2xl text-center space-y-3">
          <CalendarIcon className="w-10 h-10 text-gray-600 mx-auto" />
          <h3 className="text-base font-semibold text-white">
            {activeTab === "upcoming" ? "No upcoming consultations" : "No past consultation records"}
          </h3>
          <p className="text-xs text-gray-400">
            {activeTab === "upcoming"
              ? "Schedule a session to collaborate with screen share and live tax review."
              : "Completed or cancelled consultations will appear here."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {visibleList.map((apt) => {
            const partnerLabel = isCaPortal ? apt.clientName || "Client" : apt.caName;
            const dateStr = apt.startTime
              ? new Date(apt.startTime).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "Scheduled";
            const timeStr = apt.startTime
              ? `${new Date(apt.startTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })} - ${new Date(apt.endTime || apt.startTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}`
              : "";

            return (
              <div
                key={apt.id}
                className="p-5 bg-[#111111] border border-white/10 hover:border-emerald-500/30 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-2xl transition-all"
              >
                <div className="flex items-start sm:items-center gap-4">
                  <div className="relative">
                    {apt.caAvatar ? (
                      <img
                        src={apt.caAvatar}
                        alt={partnerLabel}
                        className="w-12 h-12 rounded-xl object-cover border border-emerald-500/30"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-400">
                        {partnerLabel.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-black p-0.5 rounded-full text-[8px] font-bold">
                      ✓
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-sm text-white">{apt.title}</h4>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          apt.status === "CONFIRMED"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : apt.status === "PENDING"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                            : apt.status === "COMPLETED"
                            ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                        }`}
                      >
                        {apt.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">
                      With <strong className="text-gray-200">{partnerLabel}</strong> • {dateStr}{" "}
                      {timeStr ? `at ${timeStr}` : ""} • {apt.mode}
                    </p>
                    {apt.notes && (
                      <p className="text-[11px] text-gray-400 italic pt-0.5">
                        &ldquo;{apt.notes}&rdquo;
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 self-end sm:self-center">
                  {(apt.status === "CONFIRMED" || apt.status === "PENDING" || apt.status === "RESCHEDULED") && (
                    <>
                      <Button
                        onClick={() => {
                          setRescheduleDate(
                            apt.startTime
                              ? new Date(apt.startTime).toISOString().slice(0, 10)
                              : getDefaultTomorrowDate()
                          );
                          setShowRescheduleModal(apt);
                        }}
                        variant="outline"
                        size="sm"
                        disabled={submitting}
                        className="border-white/10 text-gray-300 hover:bg-white/5 text-xs rounded-xl"
                      >
                        Reschedule
                      </Button>
                      <Button
                        onClick={() => handleCancelAppointment(apt.id)}
                        variant="ghost"
                        size="sm"
                        disabled={submitting}
                        className="text-xs text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 rounded-xl"
                      >
                        Cancel
                      </Button>
                      {isCaPortal && (
                        <Button
                          onClick={() => handleMarkCompleted(apt.id)}
                          variant="outline"
                          size="sm"
                          disabled={submitting}
                          className="border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10 text-xs rounded-xl"
                        >
                          Complete
                        </Button>
                      )}
                      <Link href={`${callsHref}?appointmentId=${apt.id}`}>
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-[0_0_15px_rgba(5,150,105,0.4)]"
                        >
                          <Video className="w-3.5 h-3.5 mr-1.5" /> Join Room
                        </Button>
                      </Link>
                    </>
                  )}

                  {apt.status === "COMPLETED" && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 font-mono font-bold mr-2">{apt.fee}</span>
                      <Link href={`${callsHref}?appointmentId=${apt.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-white/10 text-gray-300 hover:bg-white/5 text-xs rounded-xl"
                        >
                          View Notes
                        </Button>
                      </Link>
                      <Link href={returnsHref}>
                        <Button
                          size="sm"
                          className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 text-xs rounded-xl"
                        >
                          Linked Returns
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showBookingModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#141414] border border-white/10 rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl relative"
          >
            <button
              onClick={() => setShowBookingModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                <span>Step {bookingStep} of 4</span>
                <span className="text-emerald-400 font-bold">Consultation Scheduler</span>
              </div>
              <div className="w-full bg-[#1F1F1F] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full transition-all duration-300"
                  style={{ width: `${(bookingStep / 4) * 100}%` }}
                />
              </div>
            </div>

            {bookingStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">
                  {isCaPortal ? "Select Client" : "Select Chartered Accountant"}
                </h3>
                {isCaPortal ? (
                  clientsList.length === 0 ? (
                    <div className="p-4 rounded-xl bg-[#181818] border border-white/10 text-xs text-gray-400">
                      No clients found in your practice yet. Add a client in Client Management first.
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-64 overflow-y-auto">
                      {clientsList.map((cli) => (
                        <div
                          key={cli.id}
                          onClick={() => setSelectedClientId(cli.id)}
                          className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                            selectedClientId === cli.id
                              ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                              : "bg-[#181818] border-white/5 text-gray-300 hover:border-white/20"
                          }`}
                        >
                          <div className="font-bold text-sm text-white">{cli.name}</div>
                          {cli.pan && <span className="text-[11px] font-mono text-gray-400">{cli.pan}</span>}
                        </div>
                      ))}
                    </div>
                  )
                ) : casList.length === 0 ? (
                  <div className="p-4 rounded-xl bg-[#181818] border border-white/10 text-xs text-gray-400">
                    No active Chartered Accountants are registered in the directory yet.
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-64 overflow-y-auto">
                    {casList.map((ca) => (
                      <div
                        key={ca.id}
                        onClick={() => setSelectedCaId(ca.id)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                          selectedCaId === ca.id
                            ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                            : "bg-[#181818] border-white/5 text-gray-300 hover:border-white/20"
                        }`}
                      >
                        <div>
                          <div className="font-bold text-sm text-white">{ca.name}</div>
                          <div className="text-xs text-gray-400">
                            {ca.specializations.slice(0, 2).join(", ")} • {ca.experience}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-emerald-400 text-sm">{ca.fee}</div>
                          <div className="text-[10px] text-gray-400">⭐ {ca.rating}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <Button
                    onClick={() => setBookingStep(2)}
                    disabled={isCaPortal ? !selectedClientId : !selectedCaId}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-xl"
                  >
                    Next: Topic & Date <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {bookingStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">Consultation Subject & Date</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-300 font-medium">Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white mt-1 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Tax Planning">Tax Planning</option>
                      <option value="ITR Review">ITR Review</option>
                      <option value="GST Audit">GST Audit</option>
                      <option value="Notice Representation">Notice Representation</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-300 font-medium">Discussion Subject</label>
                    <input
                      type="text"
                      value={selectedTopic}
                      onChange={(e) => setSelectedTopic(e.target.value)}
                      className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white mt-1 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-300 font-medium">Select Date</label>
                      <input
                        type="date"
                        min={new Date().toISOString().slice(0, 10)}
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white mt-1 focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-300 font-medium">Mode</label>
                      <select
                        value={selectedMode}
                        onChange={(e) => setSelectedMode(e.target.value as any)}
                        className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white mt-1 focus:outline-none focus:border-emerald-500"
                      >
                        <option value="VIDEO_CALL">Video Consultation</option>
                        <option value="PHONE_CALL">Phone Call</option>
                        <option value="IN_PERSON">In-Person Office</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between pt-2">
                  <Button variant="ghost" onClick={() => setBookingStep(1)} className="text-xs text-gray-400">
                    Back
                  </Button>
                  <Button
                    onClick={() => setBookingStep(3)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-xl"
                  >
                    Next: Select Time Slot <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {bookingStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">Available Time Slots</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {TIME_SLOTS.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-3 rounded-xl border text-left text-xs transition-all ${
                        selectedSlot === slot
                          ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400 font-bold"
                          : "bg-[#181818] border-white/5 text-gray-300 hover:border-white/20"
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5 inline mr-1 text-emerald-400" />
                      {slot}
                    </button>
                  ))}
                </div>
                <div>
                  <label className="text-xs text-gray-300 font-medium">Agenda / Notes (Optional)</label>
                  <textarea
                    rows={2}
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                    placeholder="Documents or tax questions to cover..."
                    className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white mt-1 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="flex justify-between pt-2">
                  <Button variant="ghost" onClick={() => setBookingStep(2)} className="text-xs text-gray-400">
                    Back
                  </Button>
                  <Button
                    onClick={() => setBookingStep(4)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-xl"
                  >
                    Next: Summary & Confirmation <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {bookingStep === 4 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">Confirm Appointment</h3>
                <div className="bg-[#181818] border border-white/10 rounded-xl p-4 space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-gray-400">{isCaPortal ? "Client:" : "Assigned CA:"}</span>
                    <span className="text-white font-semibold">
                      {isCaPortal ? selectedClientObj?.name : selectedCAObj?.name}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-gray-400">Topic:</span>
                    <span className="text-white font-semibold">{selectedTopic}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-gray-400">Date & Slot:</span>
                    <span className="text-emerald-400 font-mono font-semibold">
                      {selectedDate} ({selectedSlot})
                    </span>
                  </div>
                  <div className="flex justify-between py-1 font-bold text-white">
                    <span>Consultation Fee:</span>
                    <span className="text-emerald-400">{selectedCAObj?.fee || "Covered by Retainer"}</span>
                  </div>
                </div>

                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[11px] text-emerald-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
                  Includes synchronized screen share & tax document review room.
                </div>

                <div className="flex justify-between pt-2">
                  <Button variant="ghost" onClick={() => setBookingStep(3)} className="text-xs text-gray-400">
                    Back
                  </Button>
                  <Button
                    onClick={handleConfirmBooking}
                    disabled={submitting}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-xl shadow-[0_0_20px_rgba(5,150,105,0.4)]"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> Scheduling...
                      </>
                    ) : (
                      "Confirm & Schedule Now"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {showRescheduleModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowRescheduleModal(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" /> Reschedule Consultation
            </h3>
            <p className="text-xs text-gray-400">
              Choose a new date and time slot for {showRescheduleModal.title}.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-300 font-medium">New Date</label>
                <input
                  type="date"
                  min={new Date().toISOString().slice(0, 10)}
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white mt-1 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-gray-300 font-medium">New Time Slot</label>
                <select
                  value={rescheduleSlot}
                  onChange={(e) => setRescheduleSlot(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white mt-1 focus:outline-none focus:border-emerald-500"
                >
                  {TIME_SLOTS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                onClick={() => setShowRescheduleModal(null)}
                className="text-xs text-gray-400 hover:text-white"
              >
                Close
              </Button>
              <Button
                onClick={handleRescheduleSubmit}
                disabled={submitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-xl"
              >
                {submitting ? "Updating..." : "Confirm Reschedule"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
