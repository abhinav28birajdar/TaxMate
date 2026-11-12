"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  CheckSquare,
  Clock,
  Plus,
  MessageSquare,
  Paperclip,
  X,
  CheckCircle2,
  FileText,
  List,
  Kanban,
  Download,
  Upload,
  Send,
  Trash2,
  Check,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/hooks/UnifiedAuthContext";
import { useRealtimeTasks } from "@/hooks/use-realtime";

export type TaskStatus =
  | "pending"
  | "in_progress"
  | "review"
  | "customer_approval"
  | "filed"
  | "completed";

export interface TaskAttachment {
  id: string;
  docId?: string;
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
  clientId?: string | null;
  isMyTask?: boolean;
  priority: "Urgent" | "High" | "Medium" | "Low";
  status: TaskStatus;
  due: string;
  dueRaw?: string | null;
  isOverdue?: boolean;
  assignedTo: string;
  description: string;
  attachments: TaskAttachment[];
  comments: TaskComment[];
  history: TaskHistoryEntry[];
  rawMetadata?: Record<string, any>;
}

function mapRowToStage(row: any): TaskStatus {
  const stage = row.metadata?.workflowStage;
  if (
    stage &&
    ["pending", "in_progress", "review", "customer_approval", "filed", "completed"].includes(stage)
  ) {
    return stage;
  }
  const s = String(row.status || "TODO").toUpperCase();
  if (s === "COMPLETED" || s === "DONE") return "completed";
  if (s === "IN_REVIEW" || s === "REVIEW") return "review";
  if (s === "IN_PROGRESS") return "in_progress";
  return "pending";
}

function stageToDbStatus(stage: TaskStatus): string {
  switch (stage) {
    case "completed":
      return "COMPLETED";
    case "review":
    case "customer_approval":
      return "IN_REVIEW";
    case "in_progress":
    case "filed":
      return "IN_PROGRESS";
    default:
      return "TODO";
  }
}

function formatPriorityLabel(raw?: string | null): "Urgent" | "High" | "Medium" | "Low" {
  const p = String(raw || "MEDIUM").toUpperCase();
  if (p === "URGENT") return "Urgent";
  if (p === "HIGH") return "High";
  if (p === "LOW") return "Low";
  return "Medium";
}

export function UnifiedTasksWorkflow({ portal = "client" }: { portal: "ca" | "client" }) {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [filterTab, setFilterTab] = useState<"all" | "my" | "pending" | "completed" | "overdue">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [clientsList, setClientsList] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [detailsTab, setDetailsTab] = useState<"overview" | "attachments" | "comments" | "history">("overview");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newClientId, setNewClientId] = useState("");
  const [newClientLabel, setNewClientLabel] = useState("");
  const [newPriority, setNewPriority] = useState<"Urgent" | "High" | "Medium" | "Low">("High");
  const [newDue, setNewDue] = useState(new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10));
  const [newDescription, setNewDescription] = useState("");
  const [commentInput, setCommentInput] = useState("");

  const actorName = user?.name || user?.email?.split("@")[0] || "You";

  const fetchTasksAndClients = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const requests: Promise<Response>[] = [fetch("/api/tasks?limit=100")];
      if (portal === "ca") {
        requests.push(fetch("/api/clients?take=100"));
      }
      const [tasksRes, clientsRes] = await Promise.all(requests);

      if (tasksRes?.ok) {
        const json = await tasksRes.json().catch(() => ({}));
        const now = Date.now();
        const mapped: TaskItem[] = (json.tasks || []).map((row: any) => {
          const status = mapRowToStage(row);
          const dueTs = row.due_date ? new Date(row.due_date).getTime() : null;
          const isOverdue = Boolean(dueTs && dueTs < now && status !== "completed" && status !== "filed");
          const meta = row.metadata && typeof row.metadata === "object" ? row.metadata : {};
          return {
            id: row.id,
            title: row.title,
            client: row.client_name || meta.clientName || "Client Workspace",
            clientId: row.client_id || null,
            isMyTask: row.assigned_to === user.id || row.ca_id === user.id || row.client_id === user.id,
            priority: formatPriorityLabel(row.priority),
            status,
            due: row.due_date
              ? new Date(row.due_date).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "No Deadline",
            dueRaw: row.due_date || null,
            isOverdue,
            assignedTo: row.assigned_to_name || "Assigned CA",
            description: row.description || "Compliance workflow task.",
            attachments: Array.isArray(meta.attachments) ? meta.attachments : [],
            comments: Array.isArray(meta.comments) ? meta.comments : [],
            history: Array.isArray(meta.history)
              ? meta.history
              : [
                  {
                    action: "Task created",
                    user: row.assigned_to_name || "System",
                    timestamp: row.created_at ? new Date(row.created_at).toLocaleDateString("en-IN") : "Recent",
                  },
                ],
            rawMetadata: meta,
          };
        });
        setTasks(mapped);
      }

      if (clientsRes?.ok) {
        const cJson = await clientsRes.json().catch(() => ({}));
        const cRows = (cJson.clients || []).map((c: any) => ({
          id: c.id,
          name: c.display_name || c.full_name || c.email || "Client",
        }));
        setClientsList(cRows);
        if (!newClientId && cRows.length > 0) {
          setNewClientId(cRows[0].id);
        }
      }
    } catch (err) {
      console.error("Failed loading tasks:", err);
      toast.error("Could not fetch tasks.");
    } finally {
      setLoading(false);
    }
  }, [user, portal, newClientId]);

  useRealtimeTasks(
    user?.id || "",
    () => { void fetchTasksAndClients(); },
    () => { void fetchTasksAndClients(); },
    () => { void fetchTasksAndClients(); }
  );

  useEffect(() => {
    if (user) {
      fetchTasksAndClients();
    }
  }, [user, fetchTasksAndClients]);

  const columns: { key: TaskStatus; title: string; badgeClass: string }[] = [
    { key: "pending", title: "Pending", badgeClass: "bg-slate-500/20 text-slate-300 border-slate-500/30" },
    { key: "in_progress", title: "In Progress", badgeClass: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
    { key: "review", title: "Review", badgeClass: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
    { key: "customer_approval", title: "Customer Approval", badgeClass: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
    { key: "filed", title: "Filed", badgeClass: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" },
    { key: "completed", title: "Completed", badgeClass: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
  ];

  const filteredTasks = tasks.filter((t) => {
    if (filterTab === "my" && !t.isMyTask) return false;
    if (filterTab === "pending" && t.status !== "pending") return false;
    if (filterTab === "completed" && t.status !== "completed") return false;
    if (filterTab === "overdue" && !t.isOverdue) return false;

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.client.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleMoveTask = async (taskId: string, newStatus: TaskStatus) => {
    const target = tasks.find((t) => t.id === taskId);
    if (!target) return;

    const nextHistory = [
      ...target.history,
      {
        action: `Status moved to ${newStatus.replace("_", " ").toUpperCase()}`,
        user: actorName,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ];

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: stageToDbStatus(newStatus),
          metadata: {
            ...target.rawMetadata,
            workflowStage: newStatus,
            history: nextHistory,
          },
        }),
      });
      if (!res.ok) throw new Error("Failed to update stage");

      const updated: TaskItem = {
        ...target,
        status: newStatus,
        history: nextHistory,
        rawMetadata: { ...target.rawMetadata, workflowStage: newStatus, history: nextHistory },
      };

      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
      if (selectedTask?.id === taskId) {
        setSelectedTask(updated);
      }
      toast.success(`Task moved to ${newStatus.replace("_", " ").toUpperCase()}`);
    } catch {
      toast.error("Could not persist task status update.");
    }
  };

  const handleCompleteTask = (task: TaskItem) => {
    handleMoveTask(task.id, "completed");
  };

  const handleAddComment = async () => {
    if (!selectedTask || !commentInput.trim()) return;
    const text = commentInput.trim();
    const newComment: TaskComment = {
      id: `c-${Date.now()}`,
      author: actorName,
      avatar: actorName.slice(0, 2).toUpperCase(),
      text,
      timestamp: new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }),
    };

    const nextComments = [...selectedTask.comments, newComment];
    const nextHistory = [
      ...selectedTask.history,
      { action: "Added a comment", user: actorName, timestamp: "Just now" },
    ];

    setSubmitting(true);
    try {
      const res = await fetch(`/api/tasks/${selectedTask.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metadata: {
            ...selectedTask.rawMetadata,
            comments: nextComments,
            history: nextHistory,
          },
        }),
      });
      if (!res.ok) throw new Error("Failed to post comment");

      const updatedTask: TaskItem = {
        ...selectedTask,
        comments: nextComments,
        history: nextHistory,
        rawMetadata: { ...selectedTask.rawMetadata, comments: nextComments, history: nextHistory },
      };

      setTasks((prev) => prev.map((t) => (t.id === selectedTask.id ? updatedTask : t)));
      setSelectedTask(updatedTask);
      setCommentInput("");
      toast.success("Comment saved.");
    } catch {
      toast.error("Could not save comment.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUploadAttachment = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedTask) return;
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("category", "TASK_ATTACHMENT");
      if (selectedTask.clientId) {
        fd.append("clientId", selectedTask.clientId);
      }

      const uploadRes = await fetch("/api/documents/upload", {
        method: "POST",
        body: fd,
      });
      const uploadJson = await uploadRes.json().catch(() => ({}));
      if (!uploadRes.ok) {
        throw new Error(uploadJson.error || "File upload failed");
      }

      const uploaded = uploadJson.data || uploadJson;
      const newAtt: TaskAttachment = {
        id: `att-${Date.now()}`,
        docId: uploaded.id,
        name: file.name,
        size: `${Math.max(0.01, file.size / (1024 * 1024)).toFixed(2)} MB`,
        uploadedAt: new Date().toLocaleDateString("en-IN"),
      };

      const nextAttachments = [...selectedTask.attachments, newAtt];
      const nextHistory = [
        ...selectedTask.history,
        { action: `Attached ${file.name}`, user: actorName, timestamp: "Just now" },
      ];

      const patchRes = await fetch(`/api/tasks/${selectedTask.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metadata: {
            ...selectedTask.rawMetadata,
            attachments: nextAttachments,
            history: nextHistory,
          },
        }),
      });
      if (!patchRes.ok) throw new Error("Failed to link attachment to task");

      const updated: TaskItem = {
        ...selectedTask,
        attachments: nextAttachments,
        history: nextHistory,
        rawMetadata: { ...selectedTask.rawMetadata, attachments: nextAttachments, history: nextHistory },
      };
      setTasks((prev) => prev.map((t) => (t.id === selectedTask.id ? updated : t)));
      setSelectedTask(updated);
      toast.success(`Attached "${file.name}" to task.`);
    } catch (err: any) {
      toast.error(err.message || "Attachment upload failed.");
    } finally {
      setSubmitting(false);
      e.target.value = "";
    }
  };

  const handleDownloadAttachment = async (att: TaskAttachment) => {
    if (!att.docId) {
      toast.info("No linked storage file found for this entry.");
      return;
    }
    window.open(`/api/documents/download?id=${encodeURIComponent(att.docId)}`, "_blank", "noopener,noreferrer");
  };

  const handleDeleteTask = async (taskId: string) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Only CA/Admin can delete tasks");
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      setSelectedTask(null);
      toast.info("Task deleted.");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete task.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setSubmitting(true);
    try {
      const selectedClientName =
        clientsList.find((c) => c.id === newClientId)?.name || newClientLabel.trim() || actorName;
      const historyInit = [
        {
          action: "Task created",
          user: actorName,
          timestamp: new Date().toLocaleDateString("en-IN"),
        },
      ];

      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDescription.trim() || "Compliance workflow task.",
          priority: newPriority.toUpperCase(),
          status: "TODO",
          dueDate: newDue || null,
          clientId: newClientId || undefined,
          metadata: {
            workflowStage: "pending",
            clientName: selectedClientName,
            attachments: [],
            comments: [],
            history: historyInit,
          },
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.error || "Failed to create task");
      }

      setNewTitle("");
      setNewDescription("");
      setNewClientLabel("");
      setShowNewTaskModal(false);
      toast.success("Compliance task persisted to workspace.");
      await fetchTasksAndClients();
    } catch (err: any) {
      toast.error(err.message || "Could not create task.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-emerald-400" />{" "}
            {portal === "ca" ? "Practice Tasks & Compliance Board" : "Tasks & Compliance Workflow"}
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Track filings, document submissions, approvals, and milestone tasks across tax engagements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={fetchTasksAndClients}
            variant="outline"
            disabled={loading}
            className="border-white/10 text-gray-300 hover:bg-white/5 text-xs rounded-xl"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loading ? "animate-spin" : ""}`} />
          </Button>
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

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-2">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          {[
            { key: "all", label: "All Tasks", count: tasks.length },
            { key: "my", label: "My Tasks", count: tasks.filter((t) => t.isMyTask).length },
            { key: "pending", label: "Pending Tasks", count: tasks.filter((t) => t.status === "pending").length },
            { key: "completed", label: "Completed Tasks", count: tasks.filter((t) => t.status === "completed").length },
            { key: "overdue", label: "Overdue Tasks", count: tasks.filter((t) => t.isOverdue).length },
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
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  filterTab === tab.key ? "bg-emerald-950/60 text-emerald-300" : "bg-white/5 text-gray-400"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

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

      {loading ? (
        <div className="p-12 bg-[#111111] border border-white/10 rounded-2xl flex items-center justify-center gap-2 text-xs text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin text-emerald-400" /> Loading compliance tasks...
        </div>
      ) : viewMode === "kanban" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 overflow-x-auto pb-4">
          {columns.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.key);
            return (
              <div
                key={col.key}
                className="bg-[#111111] border border-white/10 rounded-2xl p-3 flex flex-col min-h-[520px] shadow-lg"
              >
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        col.key === "completed"
                          ? "bg-emerald-500"
                          : col.key === "filed"
                          ? "bg-cyan-400"
                          : col.key === "customer_approval"
                          ? "bg-purple-400"
                          : col.key === "review"
                          ? "bg-amber-400"
                          : col.key === "in_progress"
                          ? "bg-blue-400"
                          : "bg-gray-400"
                      }`}
                    />
                    <h3 className="font-bold text-xs text-white truncate">{col.title}</h3>
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${col.badgeClass}`}>
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-2.5 mt-3 flex-1 overflow-y-auto">
                  {colTasks.length === 0 ? (
                    <div className="h-32 border border-dashed border-white/5 rounded-xl flex items-center justify-center text-gray-500 text-[10px]">
                      No tasks in {col.title}
                    </div>
                  ) : (
                    colTasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => {
                          setSelectedTask(task);
                          setDetailsTab("overview");
                        }}
                        className="p-3 bg-[#18181b] hover:bg-[#202024] border border-white/10 hover:border-emerald-500/40 rounded-xl transition-all cursor-pointer space-y-2 group shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] uppercase font-bold tracking-wider text-emerald-400 truncate max-w-[120px]">
                            {task.client}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                              task.priority === "Urgent"
                                ? "bg-red-500/20 text-red-300 border border-red-500/30"
                                : task.priority === "High"
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                : "bg-white/5 text-gray-300"
                            }`}
                          >
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
      ) : (
        <div className="bg-[#111111] rounded-2xl border border-white/10 overflow-hidden shadow-xl">
          {filteredTasks.length === 0 ? (
            <div className="p-12 text-center text-xs text-gray-400">No tasks match your filter.</div>
          ) : (
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
                        onClick={() => {
                          setSelectedTask(t);
                          setDetailsTab("overview");
                        }}
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
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          t.priority === "Urgent"
                            ? "bg-red-500/20 text-red-300 border border-red-500/30"
                            : t.priority === "High"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : "bg-white/5 text-gray-300"
                        }`}
                      >
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
                        onClick={() => {
                          setSelectedTask(t);
                          setDetailsTab("overview");
                        }}
                        className="text-emerald-400 hover:text-emerald-300 text-xs h-7 px-2"
                      >
                        Details
                      </Button>
                      {t.status !== "completed" && (
                        <Button
                          size="sm"
                          onClick={() => handleCompleteTask(t)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-7 px-2 font-semibold"
                        >
                          <Check className="w-3.5 h-3.5 mr-1" /> Complete
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-[#111111] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-5 text-white shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-emerald-400">
                  {selectedTask.client} • {selectedTask.priority} Priority •{" "}
                  {selectedTask.status.replace("_", " ").toUpperCase()}
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">{selectedTask.title}</h3>
                <span className="text-xs text-gray-400 font-mono">
                  Due: {selectedTask.due} • Assignee: {selectedTask.assignedTo}
                </span>
              </div>
              <button onClick={() => setSelectedTask(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-2 border-b border-white/10 pb-2 text-xs">
              {[
                { key: "overview", label: "Task Details" },
                { key: "attachments", label: `Attachments (${selectedTask.attachments.length})` },
                { key: "comments", label: `Comments (${selectedTask.comments.length})` },
                { key: "history", label: "Audit History" },
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

            {detailsTab === "overview" && (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 bg-[#18181b] rounded-xl border border-white/5 space-y-2">
                  <span className="font-bold text-gray-300">Task Scope & Description:</span>
                  <p className="text-gray-300 leading-relaxed">{selectedTask.description}</p>
                </div>

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

            {detailsTab === "attachments" && (
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Files & Document Attachments:</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleUploadAttachment}
                    className="hidden"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={submitting}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-white/10 text-xs h-7"
                  >
                    <Upload className="w-3 h-3 mr-1" /> {submitting ? "Uploading..." : "Attach File"}
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
                          onClick={() => handleDownloadAttachment(att)}
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
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddComment();
                    }}
                    className="flex-1 bg-[#18181b] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                  />
                  <Button
                    size="sm"
                    onClick={handleAddComment}
                    disabled={submitting}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs"
                  >
                    <Send className="w-3.5 h-3.5 mr-1" /> Post
                  </Button>
                </div>
              </div>
            )}

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

            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedTask(null)}
                  className="border-white/10 text-xs"
                >
                  Close
                </Button>
                {portal === "ca" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={submitting}
                    onClick={() => handleDeleteTask(selectedTask.id)}
                    className="text-xs text-rose-400 hover:bg-rose-500/10"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                  </Button>
                )}
              </div>

              {selectedTask.status !== "completed" && (
                <Button
                  size="sm"
                  onClick={() => {
                    handleCompleteTask(selectedTask);
                    setSelectedTask(null);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1.5" /> Mark Task Completed
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

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

              {portal === "ca" && clientsList.length > 0 ? (
                <div>
                  <label className="block text-gray-300 mb-1">Client Account</label>
                  <select
                    value={newClientId}
                    onChange={(e) => setNewClientId(e.target.value)}
                    className="w-full bg-[#18181b] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                  >
                    {clientsList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-gray-300 mb-1">Engagement / Project Scope</label>
                  <input
                    type="text"
                    value={newClientLabel}
                    onChange={(e) => setNewClientLabel(e.target.value)}
                    placeholder="e.g. ITR Filing FY 2025-26"
                    className="w-full bg-[#18181b] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}

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
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNewTaskModal(false)}
                  className="border-white/10 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={submitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                >
                  {submitting ? "Creating..." : "Create Task"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
