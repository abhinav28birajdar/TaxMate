"use client";

import React, { useState } from "react";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  User, 
  Bell, 
  Sparkles, 
  Tag, 
  ChevronRight,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function CACalendarPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [events, setEvents] = useState([
    { id: "1", title: "GSTR-3B Monthly Filing Due", client: "Acme Corp Ltd", date: "2026-10-20", time: "11:59 PM", category: "gst", priority: "high" },
    { id: "2", title: "Advance Tax Q3 Planning Consultation", client: "Mehta Logistics", date: "2026-10-25", time: "02:00 PM", category: "meeting", priority: "medium" },
    { id: "3", title: "TDS Return Filing (Form 26Q Q2)", client: "TechNova Solutions Pvt Ltd", date: "2026-10-31", time: "05:00 PM", category: "income_tax", priority: "urgent" },
    { id: "4", title: "Statutory Tax Audit Form 3CA/3CD Sign-off", client: "Apex Infra Ltd", date: "2026-11-05", time: "11:00 AM", category: "audit", priority: "medium" }
  ]);

  const [newTitle, setNewTitle] = useState("");
  const [newClient, setNewClient] = useState("");
  const [newCategory, setNewCategory] = useState("gst");
  const [newPriority, setNewPriority] = useState("medium");
  const [newDate, setNewDate] = useState("2026-10-30");

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;
    const newEvt = {
      id: Date.now().toString(),
      title: newTitle,
      client: newClient || "General Client",
      date: newDate,
      time: "10:00 AM",
      category: newCategory,
      priority: newPriority,
    };
    setEvents([newEvt, ...events]);
    setNewTitle("");
    setNewClient("");
    setShowModal(false);
    toast.success("Calendar reminder created!");
  };

  const filteredEvents = selectedCategory === "all" 
    ? events 
    : events.filter(e => e.category === selectedCategory);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <CalendarIcon className="w-4 h-4" /> Module 14: Tax & Statutory Calendar
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            Tax Calendar & Filing Deadlines
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Track CBDT statutory filing deadlines, GSTR milestones, client hearings, and custom reminders.
          </p>
        </div>
        <Button 
          onClick={() => setShowModal(true)} 
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-[0_0_20px_rgba(5,150,105,0.3)]"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Add Custom Reminder
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {["all", "gst", "income_tax", "meeting", "audit"].map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all ${
              selectedCategory === cat 
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold" 
                : "bg-[#111111] text-gray-400 hover:text-white border border-white/5"
            }`}
          >
            {cat.replace("_", " ")}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#111111] border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h2 className="text-base font-semibold text-white">Upcoming Practice Schedule ({filteredEvents.length})</h2>
            <span className="text-xs text-emerald-400 font-mono">Sync active</span>
          </div>

          <div className="space-y-3">
            {filteredEvents.map(evt => (
              <div 
                key={evt.id} 
                className="p-4 rounded-xl bg-[#161616] border border-white/5 hover:border-emerald-500/30 transition-all flex items-start justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-white">{evt.title}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      evt.priority === "urgent" ? "bg-rose-500/10 text-rose-400 border-rose-500/30" :
                      evt.priority === "high" ? "bg-amber-500/10 text-amber-400 border-amber-500/30" :
                      "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    }`}>
                      {evt.priority.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-gray-500" /> Client: {evt.client}
                  </p>
                </div>
                <div className="text-right text-xs space-y-1">
                  <div className="text-emerald-400 font-mono font-medium flex items-center gap-1 justify-end">
                    <CalendarIcon className="w-3.5 h-3.5" /> {evt.date}
                  </div>
                  <div className="text-gray-400 flex items-center gap-1 justify-end text-[11px]">
                    <Clock className="w-3 h-3" /> {evt.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-emerald-400" /> CBDT & GSTN Statutory Dates
            </h2>
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#161616] border border-white/5">
                <span className="text-emerald-400 font-bold block mb-0.5">October 20</span>
                <span className="text-gray-200 font-medium">GSTR-3B Monthly Return (September)</span>
                <p className="text-[10px] text-gray-500 mt-1">Tax payment & ITC claims deadline</p>
              </div>
              <div className="p-3.5 rounded-xl bg-[#161616] border border-white/5">
                <span className="text-emerald-400 font-bold block mb-0.5">October 31</span>
                <span className="text-gray-200 font-medium">TDS Return Filing (Form 24Q / 26Q Q2)</span>
                <p className="text-[10px] text-gray-500 mt-1">Form 16A generation window opens</p>
              </div>
              <div className="p-3.5 rounded-xl bg-[#161616] border border-white/5">
                <span className="text-emerald-400 font-bold block mb-0.5">December 15</span>
                <span className="text-gray-200 font-medium">Advance Tax Quarter 3 Installment (75%)</span>
                <p className="text-[10px] text-gray-500 mt-1">Applicable to all corporate & individual assessees</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
            🔔 SMS and WhatsApp alerts will be automatically triggered to respective clients 48 hours prior to statutory due dates.
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-white/10 rounded-2xl p-6 w-full max-w-md space-y-4 text-white shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-400" /> Add Tax Calendar Reminder
            </h3>
            <form onSubmit={handleAddEvent} className="space-y-3 text-xs">
              <div>
                <label className="block mb-1 text-gray-300 font-medium">Reminder Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., File Form 10IEA for Tax Regime Choice"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block mb-1 text-gray-300 font-medium">Client Name</label>
                <input
                  type="text"
                  placeholder="e.g. Acme Corp Ltd"
                  value={newClient}
                  onChange={(e) => setNewClient(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-gray-300 font-medium">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="gst">GST</option>
                    <option value="income_tax">Income Tax</option>
                    <option value="meeting">Meeting</option>
                    <option value="audit">Audit</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-gray-300 font-medium">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-1 text-gray-300 font-medium">Due Date</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="border-white/10 text-gray-300 hover:bg-white/5 text-xs rounded-xl">
                  Cancel
                </Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl">
                  Save Reminder
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
