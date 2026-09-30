"use client";

import React, { useState } from "react";
import { 
  CheckSquare, 
  Clock, 
  AlertCircle, 
  Plus, 
  MessageSquare, 
  Paperclip, 
  User, 
  Calendar, 
  Filter, 
  ChevronRight, 
  X, 
  Sparkles,
  CheckCircle2,
  FileText,
  Layers,
  ArrowRight,
  List,
  Kanban,
  Download,
  Upload,
  History,
  Send,
  Trash2,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export type TaskStatus = "pending" | "in_progress" | "review" | "customer_approval" | "filed" | "completed";

export interface TaskAttachment {
  id: string;
  name: string;
  size: string;
  uploadedAt: string;
}

export interface TaskComment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  timestamp: string;
}

export interface TaskHistoryEntry {
  action: string;
  user: string;
  timestamp: string;
}

export interface TaskItem {
  id: string;
  title: string;
  client: string;
  isMyTask?: boolean;
  priority: "Urgent" | "High" | "Medium" | "Low";
  status: TaskStatus;
  due: string;
  isOverdue?: boolean;
  assignedTo: string;
  description: string;
  attachments: TaskAttachment[];
  comments: TaskComment[];
  history: TaskHistoryEntry[];
}

export function UnifiedTasksWorkflow({ portal = "client" }: { portal: "ca" | "client" }) {
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [filterTab, setFilterTab] = useState<"all" | "my" | "pending" | "completed" | "overdue">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [tasks, setTasks] = useState<TaskItem[]>([
    {
      id: "t-1",
      title: "GSTR-1 Monthly Return Filing (Sept 2026)",
      client: "TechNova Solutions Pvt Ltd",
      isMyTask: true,
      priority: "Urgent",
      status: "pending",
      due: "20 Oct 2026",
      isOverdue: true,
      assignedTo: "CA Rajesh Sharma",
      description: "Reconcile B2B outward supplies against tally sales register and submit to GSTN.",
      attachments: [
        { id: "att-1", name: "Sept_Sales_Register.xlsx", size: "1.4 MB", uploadedAt: "19 Oct 2026" },
        { id: "att-2", name: "GSTR_1_Summary.pdf", size: "0.8 MB", uploadedAt: "19 Oct 2026" }
      ],
      comments: [
        { id: "c-1", author: "CA Rajesh Sharma", avatar: "RS", text: "Please upload the revised B2B invoices.", timestamp: "Yesterday 11:20 AM" },
        { id: "c-2", author: "You", avatar: "ME", text: "Uploaded updated Excel sheet with all 48 outward invoices.", timestamp: "Yesterday 02:40 PM" }
      ],
      history: [
        { action: "Task created by System Compliance Engine", user: "System", timestamp: "15 Oct 2026" },
        { action: "Attachments added", user: "You", timestamp: "19 Oct 2026" }
      ]
    },
    {
      id: "t-2",
      title: "Form 26Q TDS Return Preparation",
      client: "Apex Logistics India",
      isMyTask: false,
      priority: "High",
      status: "in_progress",
      due: "31 Oct 2026",
      isOverdue: false,
      assignedTo: "Senior Associate Priya",
      description: "Verify Section 194C contractor deductions and lower rate certificates.",
      attachments: [
        { id: "att-3", name: "Form_26Q_Challans.pdf", size: "2.1 MB", uploadedAt: "18 Oct 2026" }
      ],
      comments: [
        { id: "c-3", author: "Senior Associate Priya", avatar: "PA", text: "Challan 281 verification in progress.", timestamp: "20 Oct 2026" }
      ],
      history: [
        { action: "Task created", user: "CA Rajesh Sharma", timestamp: "18 Oct 2026" },
        { action: "Status moved to In Progress", user: "Senior Associate Priya", timestamp: "19 Oct 2026" }
      ]
    },
    {
      id: "t-3",
      title: "ITR-2 Final Draft Client Approval",
      client: "Abhinav Birajdar",
      isMyTask: true,
      priority: "High",
      status: "customer_approval",
      due: "28 Oct 2026",
      isOverdue: false,
      assignedTo: "CA Rajesh Sharma",
      description: "Sent computation sheet via Client Portal for digital verification and Aadhaar OTP approval.",
      attachments: [
        { id: "att-4", name: "ITR2_Draft_Computation_AY2026.pdf", size: "1.1 MB", uploadedAt: "Yesterday" }
      ],
      comments: [
        { id: "c-4", author: "CA Rajesh Sharma", avatar: "RS", text: "Draft prepared with New Tax Regime Section 115BAC.", timestamp: "Yesterday" }
      ],
      history: [
        { action: "Draft computed & sent for approval", user: "CA Rajesh Sharma", timestamp: "Yesterday" }
      ]
    },
    {
      id: "t-4",
      title: "GSTR-3B Monthly Return Submission",
      client: "TechNova Solutions Pvt Ltd",
      isMyTask: true,
      priority: "High",
      status: "filed",
      due: "20 Oct 2026",
      isOverdue: false,
      assignedTo: "Senior Associate Priya",
      description: "Successfully submitted to GSTN Portal with ARN #AA070926019208B.",
      attachments: [
        { id: "att-5", name: "GSTR3B_Acknowledgement_Receipt.pdf", size: "0.6 MB", uploadedAt: "20 Oct 2026" }
      ],
      comments: [],
      history: [
        { action: "Filed with GSTN ARN generated", user: "Senior Associate Priya", timestamp: "20 Oct 2026" }
      ]
    },
    {
      id: "t-5",
      title: "Advance Tax Q2 Installment Challan 280 Payment",
      client: "Abhinav Birajdar",
      isMyTask: true,
      priority: "Medium",
      status: "completed",
      due: "15 Sep 2026",
      isOverdue: false,
      assignedTo: "Self / Client",
      description: "Deposited ₹25,000 Advance Tax via Income Tax e-Pay Tax Portal with BSR Code 002910.",
      attachments: [
        { id: "att-6", name: "Challan_280_Receipt_Paid.pdf", size: "0.4 MB", uploadedAt: "15 Sep 2026" }
      ],
      comments: [
        { id: "c-5", author: "You", avatar: "ME", text: "Paid via HDFC Netbanking, receipt attached.", timestamp: "15 Sep 2026" }
      ],
      history: [
        { action: "Payment completed & marked finished", user: "You", timestamp: "15 Sep 2026" }
      ]
    }
  ]);

  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [detailsTab, setDetailsTab] = useState<"overview" | "attachments" | "comments" | "history">("overview");

  // Create Task Modal state
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newClient, setNewClient] = useState("TechNova Solutions");
  const [newPriority, setNewPriority] = useState<"Urgent" | "High" | "Medium" | "Low">("High");
  const [newDue, setNewDue] = useState("2026-10-31");
  const [newDescription, setNewDescription] = useState("");
  const [commentInput, setCommentInput] = useState("");

  const columns: { key: TaskStatus; title: string; badgeClass: string }[] = [
    { key: "pending", title: "Pending", badgeClass: "bg-slate-500/20 text-slate-300 border-slate-500/30" },
    { key: "in_progress", title: "In Progress", badgeClass: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
    { key: "review", title: "Review", badgeClass: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
    { key: "customer_approval", title: "Customer Approval", badgeClass: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
    { key: "filed", title: "Filed", badgeClass: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" },
    { key: "completed", title: "Completed", badgeClass: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" }
  ];

  // Filter Tasks
  const filteredTasks = tasks.filter((t) => {
    if (filterTab === "my" && !t.isMyTask) return false;
    if (filterTab === "pending" && t.status !== "pending") return false;
    if (filterTab === "completed" && t.status !== "completed") return false;
    if (filterTab === "overdue" && !t.isOverdue) return false;

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      return t.title.toLowerCase().includes(q) || t.client.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
    }
    return true;
  });

  const handleMoveTask = (taskId: string, newStatus: TaskStatus) => {
    setTasks(tasks.map((t) => {
      if (t.id === taskId) {
        return {
          ...t,
          status: newStatus,
          history: [
            ...t.history,
            { action: `Status moved to ${newStatus.replace("_", " ").toUpperCase()}`, user: "You", timestamp: "Just now" }
          ]
        };
      }
      return t;
    }));
    toast.success(`Task moved to ${newStatus.replace("_", " ").toUpperCase()}`);
    if (selectedTask?.id === taskId) {
      setSelectedTask({ ...selectedTask, status: newStatus });
    }
  };

  const handleCompleteTask = (task: TaskItem) => {
    handleMoveTask(task.id, "completed");
    toast.success(`"${task.title}" marked as Completed!`);
  };

  const handleAddComment = () => {
    if (!selectedTask || !commentInput.trim()) return;
    const newComment: TaskComment = {
      id: `c-${Date.now()}`,
      author: "You",
      avatar: "ME",
      text: commentInput.trim(),
      timestamp: "Just now"
    };

    const updatedTask = {
      ...selectedTask,
      comments: [...selectedTask.comments, newComment],
      history: [...selectedTask.history, { action: "Added a comment", user: "You", timestamp: "Just now" }]
    };

    setTasks(tasks.map(t => t.id === selectedTask.id ? updatedTask : t));
    setSelectedTask(updatedTask);
    setCommentInput("");
    toast.success("Comment added.");
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask: TaskItem = {
      id: `t-${Date.now()}`,
      title: newTitle,
      client: newClient || "General Client",
      isMyTask: true,
      priority: newPriority,
      status: "pending",
      due: newDue,
      isOverdue: false,
      assignedTo: "CA Rajesh Sharma",
      description: newDescription || "Task created from Customer Tasks workspace.",
      attachments: [],
      comments: [],
      history: [{ action: "Task created by customer", user: "You", timestamp: "Just now" }]
    };

    setTasks([newTask, ...tasks]);
    setNewTitle("");
    setNewDescription("");
    setShowNewTaskModal(false);
    toast.success("New compliance task created successfully.");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-white">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-emerald-400" /> Customer Tasks & Compliance Workflow
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Track filings, document submissions, CA approvals, and milestone tasks across your tax engagements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle: Kanban vs List */}
          <div className="flex bg-[#111111] p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setViewMode("kanban")}
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1 font-semibold transition-all ${
                viewMode === "kanban" ? "bg-emerald-600 text-white" : "text-gray-400 hover:text-white"
              }`}
              title="Kanban Board View"
            >
              <Kanban className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1 font-semibold transition-all ${
                viewMode === "list" ? "bg-emerald-600 text-white" : "text-gray-400 hover:text-white"
              }`}
              title="Itemized List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <Button
            onClick={() => setShowNewTaskModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-[0_0_20px_rgba(5,150,105,0.4)]"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Create Task
          </Button>
        </div>
      </div>

      {/* 5 Filter Tabs: All, My Tasks, Pending, Completed, Overdue */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-2">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          {[
            { key: "all", label: "All Tasks", count: tasks.length },
            { key: "my", label: "My Tasks", count: tasks.filter(t => t.isMyTask).length },
            { key: "pending", label: "Pending Tasks", count: tasks.filter(t => t.status === "pending").length },
            { key: "completed", label: "Completed Tasks", count: tasks.filter(t => t.status === "completed").length },
            { key: "overdue", label: "Overdue Tasks", count: tasks.filter(t => t.isOverdue).length }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterTab(tab.key as any)}
              className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                filterTab === tab.key
                  ? "bg-emerald-600 text-white shadow-[0_0_12px_rgba(5,150,105,0.4)] font-bold"
                  : "bg-[#141414] hover:bg-[#1A1A1A] text-gray-400 hover:text-white border border-white/5"
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                filterTab === tab.key ? "bg-emerald-950/60 text-emerald-300" : "bg-white/5 text-gray-400"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64 shrink-0">
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#111111] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* VIEW 1: KANBAN BOARD */}
      {viewMode === "kanban" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 overflow-x-auto pb-4">
          {columns.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.key);
            return (
              <div
                key={col.key}
                className="bg-[#111111] border border-white/10 rounded-2xl p-3 flex flex-col min-h-[550px] shadow-lg"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className={`w-2 h-2 rounded-full ${
                      col.key === 'completed' ? 'bg-emerald-500' :
                      col.key === 'filed' ? 'bg-cyan-400' :
                      col.key === 'customer_approval' ? 'bg-purple-400' :
                      col.key === 'review' ? 'bg-amber-400' :
                      col.key === 'in_progress' ? 'bg-blue-400' : 'bg-gray-400'
                    }`}></span>
                    <h3 className="font-bold text-xs text-white truncate">{col.title}</h3>
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${col.badgeClass}`}>
                    {colTasks.length}
                  </span>
                </div>

                {/* Column Task Cards */}
                <div className="space-y-2.5 mt-3 flex-1 overflow-y-auto">
                  {colTasks.length === 0 ? (
                    <div className="h-32 border border-dashed border-white/5 rounded-xl flex items-center justify-center text-gray-500 text-[10px]">
                      No tasks in {col.title}
                    </div>
                  ) : (
                    colTasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => { setSelectedTask(task); setDetailsTab("overview"); }}
                        className="p-3 bg-[#18181b] hover:bg-[#202024] border border-white/10 hover:border-emerald-500/40 rounded-xl transition-all cursor-pointer space-y-2 group shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] uppercase font-bold tracking-wider text-emerald-400 truncate max-w-[120px]">
                            {task.client}
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                            task.priority === "Urgent" ? "bg-red-500/20 text-red-300 border border-red-500/30" :
                            task.priority === "High" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" :
                            "bg-white/5 text-gray-300"
                          }`}>
                            {task.priority}
                          </span>
                        </div>

                        <h4 className="font-semibold text-xs text-white leading-snug group-hover:text-emerald-400 transition-colors">
                          {task.title}
                        </h4>

                        <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px] text-gray-400">
                          <span className={`flex items-center gap-1 font-mono ${task.isOverdue ? "text-red-400 font-bold" : ""}`}>
                            <Clock className="w-3 h-3" /> {task.due}
                          </span>

                          <div className="flex items-center gap-2">
                            {task.comments.length > 0 && (
                              <span className="flex items-center gap-0.5">
                                <MessageSquare className="w-3 h-3" /> {task.comments.length}
                              </span>
                            )}
                            {task.attachments.length > 0 && (
                              <span className="flex items-center gap-0.5">
                                <Paperclip className="w-3 h-3" /> {task.attachments.length}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: ITEMIZED LIST VIEW */}
      {viewMode === "list" && (
        <div className="bg-[#111111] rounded-2xl border border-white/10 overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-[#18181b] text-white font-semibold border-b border-white/10">
              <tr>
                <th className="py-3.5 px-4">Task Title</th>
                <th className="py-3.5 px-4">Client / Scope</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Due Date</th>
                <th className="py-3.5 px-4">Assigned To</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTasks.map((t) => (
                <tr key={t.id} className="hover:bg-[#18181b]/50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-white">
                    <span 
                      className="cursor-pointer hover:text-emerald-400"
                      onClick={() => { setSelectedTask(t); setDetailsTab("overview"); }}
                    >
                      {t.title}
                    </span>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 font-normal mt-0.5">
                      <span>{t.attachments.length} files attached</span>
                      <span>• {t.comments.length} comments</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-gray-300 font-medium">{t.client}</td>
                  <td className="py-3.5 px-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      t.priority === "Urgent" ? "bg-red-500/20 text-red-300 border border-red-500/30" :
                      t.priority === "High" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" :
                      "bg-white/5 text-gray-300"
                    }`}>
                      {t.priority}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {t.status.replace("_", " ").toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono">
                    <span className={t.isOverdue ? "text-red-400 font-bold" : ""}>{t.due}</span>
                  </td>
                  <td className="py-3.5 px-4 text-gray-300">{t.assignedTo}</td>
                  <td className="py-3.5 px-4 text-right space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => { setSelectedTask(t); setDetailsTab("overview"); }}
                      className="text-emerald-400 hover:text-emerald-300 text-xs h-7 px-2"
                    >
                      Details
                    </Button>
                    {t.status !== "completed" && (
                      <Button
                        size="sm"
                        onClick={() => handleCompleteTask(t)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-7 px-2 font-semibold"
                        title="Mark Complete"
                      >
                        <Check className="w-3.5 h-3.5 mr-1" /> Complete
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TASK DETAILS MODAL (Details, Attachments, Comments, History, Completion) */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-[#111111] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-5 text-white shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-emerald-400">
                  {selectedTask.client} • {selectedTask.priority} Priority • Status: {selectedTask.status.replace("_", " ").toUpperCase()}
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">{selectedTask.title}</h3>
                <span className="text-xs text-gray-400 font-mono">Due: {selectedTask.due} • Assignee: {selectedTask.assignedTo}</span>
              </div>
              <button onClick={() => setSelectedTask(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Inner Subtabs: Overview | Attachments | Comments | History */}
            <div className="flex gap-2 border-b border-white/10 pb-2 text-xs">
              {[
                { key: "overview", label: "Task Details" },
                { key: "attachments", label: `Attachments (${selectedTask.attachments.length})` },
                { key: "comments", label: `Comments (${selectedTask.comments.length})` },
                { key: "history", label: "Audit History" }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setDetailsTab(tab.key as any)}
                  className={`px-3 py-1.5 rounded-lg font-semibold ${
                    detailsTab === tab.key ? "bg-emerald-600 text-white" : "bg-[#18181b] text-gray-400 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab 1: Overview */}
            {detailsTab === "overview" && (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 bg-[#18181b] rounded-xl border border-white/5 space-y-2">
                  <span className="font-bold text-gray-300">Task Scope & Description:</span>
                  <p className="text-gray-300 leading-relaxed">{selectedTask.description}</p>
                </div>

                {/* Advance Workflow Stage */}
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-semibold text-gray-300">Advance Workflow Stage:</label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-[10px]">
                    {columns.map((c) => (
                      <button
                        key={c.key}
                        onClick={() => handleMoveTask(selectedTask.id, c.key)}
                        className={`p-2 rounded-lg font-semibold truncate transition-all ${
                          selectedTask.status === c.key
                            ? "bg-emerald-600 text-white shadow-[0_0_12px_rgba(5,150,105,0.4)]"
                            : "bg-[#18181b] text-gray-400 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        {c.title}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Attachments */}
            {detailsTab === "attachments" && (
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Files & Document Attachments:</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const newAtt: TaskAttachment = {
                        id: `att-${Date.now()}`,
                        name: "Uploaded_Document_Evidence.pdf",
                        size: "1.2 MB",
                        uploadedAt: "Just now"
                      };
                      const updated = { ...selectedTask, attachments: [...selectedTask.attachments, newAtt] };
                      setTasks(tasks.map(t => t.id === selectedTask.id ? updated : t));
                      setSelectedTask(updated);
                      toast.success("Document attached to task.");
                    }}
                    className="border-white/10 text-xs h-7"
                  >
                    <Upload className="w-3 h-3 mr-1" /> Attach New File
                  </Button>
                </div>

                {selectedTask.attachments.length === 0 ? (
                  <p className="text-gray-500 py-6 text-center">No attachments for this task yet.</p>
                ) : (
                  <div className="divide-y divide-white/5 bg-[#18181b] rounded-xl border border-white/5">
                    {selectedTask.attachments.map((att) => (
                      <div key={att.id} className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-emerald-400" />
                          <div>
                            <span className="font-semibold text-white">{att.name}</span>
                            <span className="text-gray-400 font-mono text-[10px] ml-2">({att.size})</span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toast.success(`Downloading ${att.name}`)}
                          className="text-gray-300 hover:text-white h-7 px-2"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Comments */}
            {detailsTab === "comments" && (
              <div className="space-y-3 text-xs">
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedTask.comments.length === 0 ? (
                    <p className="text-gray-500 py-6 text-center">No comments yet. Start the conversation below.</p>
                  ) : (
                    selectedTask.comments.map((cm) => (
                      <div key={cm.id} className="p-3 rounded-xl bg-[#18181b] border border-white/5 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-emerald-400">{cm.author}</span>
                          <span className="text-gray-400 font-mono text-[10px]">{cm.timestamp}</span>
                        </div>
                        <p className="text-gray-200">{cm.text}</p>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex gap-2 pt-2 border-t border-white/10">
                  <input
                    type="text"
                    placeholder="Add a task comment or clarification..."
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleAddComment(); }}
                    className="flex-1 bg-[#18181b] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                  />
                  <Button
                    size="sm"
                    onClick={handleAddComment}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs"
                  >
                    <Send className="w-3.5 h-3.5 mr-1" /> Post
                  </Button>
                </div>
              </div>
            )}

            {/* Tab 4: History */}
            {detailsTab === "history" && (
              <div className="space-y-2 text-xs">
                <span className="font-bold text-white">Task Audit Trail:</span>
                <div className="divide-y divide-white/5 bg-[#18181b] rounded-xl border border-white/5">
                  {selectedTask.history.map((h, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-white">{h.action}</span>
                        <p className="text-[10px] text-gray-400 mt-0.5">By {h.user}</p>
                      </div>
                      <span className="text-gray-400 font-mono text-[10px]">{h.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Bottom Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedTask(null)}
                className="border-white/10 text-xs"
              >
                Close
              </Button>

              {selectedTask.status !== "completed" && (
                <Button
                  size="sm"
                  onClick={() => {
                    handleCompleteTask(selectedTask);
                    setSelectedTask(null);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1.5" /> Mark Task as Completed
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CREATE TASK MODAL */}
      {showNewTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#111111] border border-white/10 rounded-2xl p-6 space-y-4 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" /> Create Compliance Task
              </h3>
              <button onClick={() => setShowNewTaskModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-300 mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Upload Bank Statement for Q3 FY26"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#18181b] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1">Client / Project</label>
                <input
                  type="text"
                  value={newClient}
                  onChange={(e) => setNewClient(e.target.value)}
                  className="w-full bg-[#18181b] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full bg-[#18181b] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Urgent">Urgent</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newDue}
                    onChange={(e) => setNewDue(e.target.value)}
                    className="w-full bg-[#18181b] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 mb-1">Task Description / Instructions</label>
                <textarea
                  rows={2}
                  placeholder="Add details, instructions or required outputs..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-[#18181b] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowNewTaskModal(false)} className="border-white/10 text-xs">
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs">
                  Create Task
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
