// ============================================
// COMPLETE TAXMATE TYPE DEFINITIONS
// ============================================

import { ReactNode } from 'react';

// ============ USER & AUTH TYPES ============
export type UserRole = 'ca' | 'client' | 'staff' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CAProfile extends User {
  firmName: string;
  gstNumber: string;
  panNumber: string;
  experience: number;
  bio?: string;
  kycVerified: boolean;
  certificateNumber?: string;
  licenseUrl?: string;
  rating?: number;
  totalClients: number;
  totalRevenueMonthly: number;
  specializations: string[];
}

export interface ClientProfile extends User {
  type: 'individual' | 'business' | 'startup';
  gstNumber?: string;
  panNumber: string;
  businessName?: string;
  industry?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  caId?: string;
  isVerified: boolean;
}

export interface StaffMember extends User {
  caId: string;
  designation: string;
  department: string;
  permissions: string[];
  status: 'active' | 'inactive';
}

// ============ CLIENT MANAGEMENT TYPES ============
export interface Client {
  id: string;
  caId: string;
  name: string;
  email: string;
  phone: string;
  type: 'individual' | 'business' | 'startup';
  gstNumber?: string;
  panNumber: string;
  businessName?: string;
  industry?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  tags: string[];
  status: 'active' | 'inactive' | 'prospect';
  notes?: string;
  lastInteraction?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientTimeline {
  id: string;
  clientId: string;
  type: 'document' | 'task' | 'payment' | 'message' | 'call' | 'note';
  title: string;
  description?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  createdBy: string;
}

// ============ DOCUMENT TYPES ============
export interface Document {
  id: string;
  clientId: string;
  caId: string;
  name: string;
  fileUrl: string;
  category: 'gst' | 'itr' | 'bank' | 'pan' | 'other' | 'invoices' | 'agreements';
  fileSize: number;
  mimeType: string;
  version: number;
  expiryDate?: string;
  isExpired: boolean;
  uploadedBy: string;
  tags: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentFolder {
  id: string;
  clientId: string;
  caId: string;
  name: string;
  category: Document['category'];
  documentCount: number;
  totalSize: number;
  createdAt: string;
}

// ============ TASK & WORKFLOW TYPES ============
export type TaskStatus = 'pending' | 'in_progress' | 'in_review' | 'completed' | 'blocked';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  clientId: string;
  caId: string;
  assignedTo?: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  completedDate?: string;
  recurringPattern?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  nextRecurringDate?: string;
  checklist?: ChecklistItem[];
  attachments?: string[];
  comments: Comment[];
  tags: string[];
  parentTaskId?: string;
  subtasks?: Task[];
  createdAt: string;
  updatedAt: string;
}

export interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: string;
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

// ============ SERVICE TYPES ============
export interface Service {
  id: string;
  caId: string;
  name: string;
  description: string;
  category: 'filing' | 'compliance' | 'consulting' | 'audit' | 'other';
  basePricing: number;
  customPricing: boolean;
  estimatedDuration: string;
  requiredDocuments: string[];
  deliverables: string[];
  active: boolean;
  createdAt: string;
}

export interface ServiceRequest {
  id: string;
  serviceId: string;
  clientId: string;
  caId: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'rejected';
  quotedPrice?: number;
  agreedPrice?: number;
  startDate?: string;
  completionDate?: string;
  notes?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

// ============ APPOINTMENT TYPES ============
export interface Appointment {
  id: string;
  clientId: string;
  caId: string;
  title: string;
  description?: string;
  type: 'meeting' | 'call' | 'consultation' | 'audit' | 'review';
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  meetingLink?: string;
  location?: string;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  reminders: string[]; // reminder times (e.g., '15m', '1h', '1d')
  notes?: string;
  participants: string[];
  createdAt: string;
}

// ============ INVOICE & PAYMENT TYPES ============
export type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  caId: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  taxPercentage: number;
  taxAmount: number;
  total: number;
  amountPaid: number;
  amountDue: number;
  notes?: string;
  terms?: string;
  attachments?: string[];
  sentAt?: string;
  viewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';

export interface Payment {
  id: string;
  invoiceId: string;
  clientId: string;
  amount: number;
  status: PaymentStatus;
  method: 'razorpay' | 'bank_transfer' | 'upi' | 'cheque' | 'cash';
  referenceNumber?: string;
  transactionId?: string;
  paidDate?: string;
  notes?: string;
  createdAt: string;
}

export interface Subscription {
  id: string;
  caId: string;
  plan: 'basic' | 'pro' | 'enterprise';
  status: 'active' | 'cancelled' | 'expired';
  monthlyPrice: number;
  yearlyPrice: number;
  billingCycle: 'monthly' | 'yearly';
  startDate: string;
  endDate?: string;
  autoRenew: boolean;
  features: string[];
  clientLimit: number;
  storageLimit: number;
  createdAt: string;
}

// ============ CHAT & COMMUNICATION TYPES ============
export interface ChatRoom {
  id: string;
  participantIds: string[];
  name?: string;
  isGroup: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  documentId?: string; // reference to Document
  mentionedUserIds?: string[];
  reactions?: MessageReaction[];
  isEdited: boolean;
  editedAt?: string;
  createdAt: string;
}

export interface MessageReaction {
  userId: string;
  emoji: string;
  createdAt: string;
}

export interface TypingIndicator {
  roomId: string;
  userId: string;
  userName: string;
}

export interface ReadReceipt {
  roomId: string;
  userId: string;
  messageId: string;
  readAt: string;
}

// ============ NOTIFICATION TYPES ============
export type NotificationType = 'task' | 'document' | 'payment' | 'deadline' | 'message' | 'system' | 'appointment';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  description: string;
  actionUrl?: string;
  read: boolean;
  readAt?: string;
  channels: ('push' | 'email' | 'sms')[];
  priority: 'low' | 'medium' | 'high';
  linkedId?: string; // task, document, payment, etc ID
  createdAt: string;
}

export interface NotificationPreference {
  userId: string;
  taskNotifications: boolean;
  documentNotifications: boolean;
  paymentNotifications: boolean;
  deadlineNotifications: boolean;
  messageNotifications: boolean;
  systemNotifications: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  quietHours?: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
}

// ============ ANALYTICS TYPES ============
export interface DashboardMetrics {
  totalClients: number;
  activeClients: number;
  totalRevenue: number;
  monthlyRevenue: number;
  pendingTasks: number;
  completedTasks: number;
  pendingDocuments: number;
  expiredDocuments: number;
  unpaidInvoices: number;
  totalInvoices: number;
}

export interface ClientMetrics {
  clientId: string;
  totalSpent: number;
  monthlySpend: number;
  servicesUsed: number;
  documentsUploaded: number;
  tasksCompleted: number;
  paymentStatus: 'good_standing' | 'overdue' | 'delinquent';
  lastInteraction: string;
}

export interface RevenueAnalytics {
  period: string; // 'daily', 'weekly', 'monthly', 'yearly'
  totalRevenue: number;
  invoicedAmount: number;
  collectedAmount: number;
  pendingAmount: number;
  chartData: Array<{
    date: string;
    revenue: number;
    collections: number;
  }>;
}

// ============ COMPLIANCE TYPES ============
export interface ComplianceTask {
  id: string;
  clientId: string;
  caId: string;
  type: 'gst_filing' | 'itr_filing' | 'audit' | 'annual_return' | 'compliance_check' | 'other';
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue' | 'exempted';
  priority: 'low' | 'medium' | 'high' | 'critical';
  frequency?: 'monthly' | 'quarterly' | 'half_yearly' | 'annual' | 'one_time';
  nextDueDate?: string;
  documents?: string[];
  notes?: string;
  completedDate?: string;
  completedBy?: string;
  createdAt: string;
}

export interface GSTFiling {
  id: string;
  clientId: string;
  period: string; // 'YYYY-MM'
  gstr1Total: number;
  gstr2Total: number;
  gstLiability: number;
  inwardSupplies: number;
  outwardSupplies: number;
  creditAvailable: number;
  filedDate?: string;
  status: 'pending' | 'filed' | 'under_review' | 'completed' | 'rejected';
  refNumber?: string;
  documentUrl?: string;
  createdAt: string;
}

export interface ITRFiling {
  id: string;
  clientId: string;
  year: number;
  financialYear: string;
  grossIncome: number;
  netIncome: number;
  tax: number;
  filedDate?: string;
  status: 'pending' | 'filed' | 'processed' | 'accepted' | 'rejected';
  refNumber?: string;
  documentUrl?: string;
  createdAt: string;
}

// ============ FEEDBACK & RATING TYPES ============
export interface Rating {
  id: string;
  caId: string;
  clientId: string;
  rating: number; // 1-5
  comment?: string;
  category: 'communication' | 'expertise' | 'timeliness' | 'value' | 'overall';
  createdAt: string;
}

export interface Review {
  id: string;
  caId: string;
  clientId: string;
  serviceId?: string;
  title: string;
  content: string;
  rating: number; // 1-5
  helpful: number;
  verified: boolean;
  createdAt: string;
}

// ============ AI & AUTOMATION TYPES ============
export interface AIAssistant {
  id: string;
  name: string;
  model: 'gpt-4' | 'gpt-3.5-turbo' | 'gemini-pro';
  capabilities: string[];
  active: boolean;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface AutomationRule {
  id: string;
  caId: string;
  name: string;
  trigger: string; // Event that triggers automation
  action: string; // Action to take
  conditions?: Record<string, any>;
  active: boolean;
  createdAt: string;
}

// ============ AUDIT LOG TYPES ============
export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string; // 'client', 'document', 'invoice', etc.
  resourceId: string;
  oldValue?: Record<string, any>;
  newValue?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  status: 'success' | 'failure';
  reason?: string;
  timestamp: string;
}

// ============ API RESPONSE TYPES ============
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  timestamp: string;
}

// ============ UI COMPONENT TYPES ============
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

export interface BadgeProps {
  variant?: 'success' | 'danger' | 'warning' | 'info' | 'primary';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  className?: string;
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'phone' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox' | 'radio';
  placeholder?: string;
  required?: boolean;
  validation?: (value: any) => string | null;
  options?: Array<{ label: string; value: string }>;
}

export interface ModalProps {
  isOpen: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// ============ FILTER & SEARCH TYPES ============
export interface FilterOptions {
  search?: string;
  status?: string | string[];
  priority?: string | string[];
  category?: string | string[];
  dateRange?: {
    start: string;
    end: string;
  };
  tags?: string[];
  customFields?: Record<string, any>;
}

export interface SortOptions {
  field: string;
  order: 'asc' | 'desc';
}

export interface TableOptions {
  page: number;
  pageSize: number;
  filters?: FilterOptions;
  sort?: SortOptions;
}
