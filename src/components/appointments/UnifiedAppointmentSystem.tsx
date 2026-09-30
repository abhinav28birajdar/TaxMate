"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Calendar as CalendarIcon, 
  Video, 
  Clock, 
  Plus, 
  ShieldCheck, 
  User, 
  CheckCircle2, 
  X, 
  AlertCircle, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight,
  Phone,
  MessageSquare,
  FileText,
  Star,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface Appointment {
  id: string;
  caName: string;
  caAvatar: string;
  title: string;
  category: "Tax Planning" | "ITR Review" | "GST Audit" | "Notice Representation";
  date: string;
  time: string;
  fee: string;
  mode: "Video Consultation" | "In-Person Office";
  status: "CONFIRMED" | "COMPLETED" | "RESCHEDULED" | "CANCELLED";
  meetingLink?: string;
  notes?: string;
}

export function UnifiedAppointmentSystem() {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState<Appointment | null>(null);

  // Booking Flow State
  const [bookingStep, setBookingStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedCA, setSelectedCA] = useState("CA Rajesh Sharma, FCA");
  const [selectedTopic, setSelectedTopic] = useState("Tax Planning & Sec 115BAC Regime");
  const [selectedDate, setSelectedDate] = useState("2026-10-25");
  const [selectedSlot, setSelectedSlot] = useState("04:00 PM - 04:45 PM");

  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: "APT-1092",
      caName: "CA Rajesh Sharma, FCA",
      caAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop",
      title: "Tax Planning & Sec 115BAC Regime Review",
      category: "Tax Planning",
      date: "25 Oct 2026",
      time: "04:00 PM - 04:45 PM",
      fee: "₹1,500",
      mode: "Video Consultation",
      status: "CONFIRMED",
      meetingLink: "/client/calls",
      notes: "Please have your Form 16 Part B and Capital gains statement ready on screen.",
    },
    {
      id: "APT-1088",
      caName: "CA Ananya Deshmukh",
      caAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop",
      title: "GSTR-3B Input Tax Credit Reconciliation",
      category: "GST Audit",
      date: "12 Oct 2026",
      time: "02:00 PM - 02:30 PM",
      fee: "₹2,000",
      mode: "Video Consultation",
      status: "COMPLETED",
      meetingLink: "/client/calls",
      notes: "Successfully reconciled ₹48,200 mismatched 2B credit.",
    },
    {
      id: "APT-1045",
      caName: "CA Vikramaditya Rao",
      caAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
      title: "Advance Tax Q2 Liability Estimation",
      category: "ITR Review",
      date: "14 Sep 2026",
      time: "11:00 AM - 11:45 AM",
      fee: "₹1,500",
      mode: "Video Consultation",
      status: "COMPLETED",
      meetingLink: "/client/calls",
      notes: "Estimated challan 280 tax liability paid on time.",
    },
  ]);

  const casList = [
    { name: "CA Rajesh Sharma, FCA", exp: "14 yrs", rating: 4.9, fee: "₹1,500", spec: "Corporate Tax, Sec 115BAC" },
    { name: "CA Ananya Deshmukh", exp: "9 yrs", rating: 4.8, fee: "₹2,000", spec: "GST Audit, Input Tax Credit" },
    { name: "CA Vikramaditya Rao", exp: "16 yrs", rating: 4.95, fee: "₹2,500", spec: "Litigation & Notice 148A" },
  ];

  const timeSlots = [
    "10:00 AM - 10:45 AM",
    "11:30 AM - 12:15 PM",
    "02:00 PM - 02:45 PM",
    "04:00 PM - 04:45 PM",
    "05:30 PM - 06:15 PM",
  ];

  const handleConfirmBooking = () => {
    const newApt: Appointment = {
      id: `APT-${Math.floor(1100 + Math.random() * 900)}`,
      caName: selectedCA,
      caAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop",
      title: selectedTopic,
      category: "Tax Planning",
      date: selectedDate,
      time: selectedSlot,
      fee: "₹1,500",
      mode: "Video Consultation",
      status: "CONFIRMED",
      meetingLink: "/client/calls",
      notes: "Confirmed consultation. Meeting link generated.",
    };
    setAppointments([newApt, ...appointments]);
    setShowBookingModal(false);
    setBookingStep(1);
    toast.success("Consultation booked! Video link dispatched to SMS and Email.");
  };

  const handleCancelAppointment = (id: string) => {
    setAppointments(appointments.map(a => a.id === id ? { ...a, status: "CANCELLED" } : a));
    toast.info("Appointment cancelled. Full refund initiated.");
  };

  const upcomingList = appointments.filter(a => a.status === "CONFIRMED" || a.status === "RESCHEDULED");
  const pastList = appointments.filter(a => a.status === "COMPLETED" || a.status === "CANCELLED");

  return (
    <div className="space-y-6">
      {/* Header */}
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

        <Button 
          onClick={() => {
            setBookingStep(1);
            setShowBookingModal(true);
          }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-[0_0_20px_rgba(5,150,105,0.3)]"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Book Consultation
        </Button>
      </div>

      {/* Tabs */}
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

      {/* Appointment Cards */}
      <div className="space-y-4">
        {(activeTab === "upcoming" ? upcomingList : pastList).map((apt) => (
          <div 
            key={apt.id} 
            className="p-5 bg-[#111111] border border-white/10 hover:border-emerald-500/30 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-2xl transition-all"
          >
            <div className="flex items-start sm:items-center gap-4">
              <div className="relative">
                <img 
                  src={apt.caAvatar} 
                  alt={apt.caName}
                  className="w-12 h-12 rounded-xl object-cover border border-emerald-500/30" 
                />
                <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-black p-0.5 rounded-full text-[8px] font-bold">
                  ✓
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-bold text-sm text-white">{apt.title}</h4>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    apt.status === "CONFIRMED"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : apt.status === "COMPLETED"
                      ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                      : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                  }`}>
                    {apt.status}
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  With <strong className="text-gray-200">{apt.caName}</strong> • {apt.date} at {apt.time}
                </p>
                {apt.notes && (
                  <p className="text-[11px] text-gray-400 italic pt-0.5">
                    &ldquo;{apt.notes}&rdquo;
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-end sm:self-center">
              {apt.status === "CONFIRMED" && (
                <>
                  <Button 
                    onClick={() => setShowRescheduleModal(apt)}
                    variant="outline" 
                    size="sm" 
                    className="border-white/10 text-gray-300 hover:bg-white/5 text-xs rounded-xl"
                  >
                    Reschedule
                  </Button>
                  <Button 
                    onClick={() => handleCancelAppointment(apt.id)}
                    variant="ghost" 
                    size="sm" 
                    className="text-xs text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Link href="/client/calls">
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-[0_0_15px_rgba(5,150,105,0.4)]">
                      <Video className="w-3.5 h-3.5 mr-1.5" /> Join Room
                    </Button>
                  </Link>
                </>
              )}

              {apt.status === "COMPLETED" && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 font-mono font-bold mr-2">{apt.fee}</span>
                  <Link href="/client/calls">
                    <Button variant="outline" size="sm" className="border-white/10 text-gray-300 hover:bg-white/5 text-xs rounded-xl">
                      View Recording
                    </Button>
                  </Link>
                  <Link href="/client/tax-returns">
                    <Button size="sm" className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 text-xs rounded-xl">
                      Linked Returns
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Booking Wizard Modal */}
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
                <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${(bookingStep / 4) * 100}%` }} />
              </div>
            </div>

            {/* Step 1: Select CA */}
            {bookingStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">Select Chartered Accountant</h3>
                <div className="space-y-2.5">
                  {casList.map((ca, i) => (
                    <div 
                      key={i}
                      onClick={() => setSelectedCA(ca.name)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        selectedCA === ca.name
                          ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                          : "bg-[#181818] border-white/5 text-gray-300 hover:border-white/20"
                      }`}
                    >
                      <div>
                        <div className="font-bold text-sm text-white">{ca.name}</div>
                        <div className="text-xs text-gray-400">{ca.spec} • {ca.exp} exp</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-emerald-400 text-sm">{ca.fee}</div>
                        <div className="text-[10px] text-gray-400">⭐ {ca.rating}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end pt-2">
                  <Button onClick={() => setBookingStep(2)} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-xl">
                    Next: Topic & Date <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Topic & Date */}
            {bookingStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">Consultation Subject & Date</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-300 font-medium">Discussion Subject</label>
                    <input 
                      type="text" 
                      value={selectedTopic}
                      onChange={(e) => setSelectedTopic(e.target.value)}
                      className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white mt-1 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-300 font-medium">Select Consultation Date</label>
                    <input 
                      type="date" 
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white mt-1 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>
                <div className="flex justify-between pt-2">
                  <Button variant="ghost" onClick={() => setBookingStep(1)} className="text-xs text-gray-400">Back</Button>
                  <Button onClick={() => setBookingStep(3)} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-xl">
                    Next: Select Time Slot <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Select Time Slot */}
            {bookingStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">Available Time Slots</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {timeSlots.map((slot, i) => (
                    <button
                      key={i}
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
                <div className="flex justify-between pt-2">
                  <Button variant="ghost" onClick={() => setBookingStep(2)} className="text-xs text-gray-400">Back</Button>
                  <Button onClick={() => setBookingStep(4)} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-xl">
                    Next: Summary & Confirmation <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Summary & Confirmation */}
            {bookingStep === 4 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">Confirm Appointment</h3>
                <div className="bg-[#181818] border border-white/10 rounded-xl p-4 space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-gray-400">Assigned CA:</span>
                    <span className="text-white font-semibold">{selectedCA}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-gray-400">Topic:</span>
                    <span className="text-white font-semibold">{selectedTopic}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-gray-400">Date & Slot:</span>
                    <span className="text-emerald-400 font-mono font-semibold">{selectedDate} ({selectedSlot})</span>
                  </div>
                  <div className="flex justify-between py-1 font-bold text-white">
                    <span>Consultation Fee:</span>
                    <span className="text-emerald-400">₹1,500 (Covered by Retainer)</span>
                  </div>
                </div>

                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[11px] text-emerald-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
                  Includes synchronized screen share & tax document annotations.
                </div>

                <div className="flex justify-between pt-2">
                  <Button variant="ghost" onClick={() => setBookingStep(3)} className="text-xs text-gray-400">Back</Button>
                  <Button onClick={handleConfirmBooking} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-xl shadow-[0_0_20px_rgba(5,150,105,0.4)]">
                    Confirm & Schedule Now
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Reschedule Modal */}
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
              <Clock className="w-4 h-4 text-emerald-400" /> Reschedule {showRescheduleModal.id}
            </h3>
            <p className="text-xs text-gray-400">Choose a new date and time slot for your consultation with {showRescheduleModal.caName}.</p>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-300 font-medium">New Date</label>
                <input 
                  type="date" 
                  defaultValue="2026-10-28"
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white mt-1 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-gray-300 font-medium">New Time Slot</label>
                <select className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white mt-1 focus:outline-none focus:border-emerald-500">
                  {timeSlots.map((s, idx) => (
                    <option key={idx} value={s}>{s}</option>
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
                onClick={() => {
                  toast.success("Appointment rescheduled successfully!");
                  setShowRescheduleModal(null);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-xl"
              >
                Confirm Reschedule
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
