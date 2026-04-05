// ============================================
// ENHANCED TAXMATE TYPES - NEW FEATURES
// ============================================

// ============ GST MANAGEMENT ============
export interface GSTRecord {
  id: string;
  clientId: string;
  caId: string;
  month: number;
  year: number;
  gstrType: 'gstr1' | 'gstr2' | 'gstr3b' | 'gstr9';
  filingDate: string;
  dueDate: string;
  status: 'not-started' | 'in-progress' | 'filed' | 'overdue' | 'amended';
  totalInvoice: number;
  totalTax: number;
  totalITC: number;
  notes?: string;
  documents: string[];
  createdAt: string;
  updatedAt: string;
}

export interface GSTReminder {
  id: string;
  clientId: string;
  caId: string;
  gstrType: 'gstr1' | 'gstr2' | 'gstr3b' | 'gstr9';
  month: number;
  year: number;
  dueDate: string;
  reminderSentDates: string[];
  status: 'pending' | 'notified' | 'completed';
}

// ============ ITR MANAGEMENT ============
export interface ITRRecord {
  id: string;
  clientId: string;
  caId: string;
  financialYear: string;
  itrType: 'itr1' | 'itr2' | 'itr3' | 'itr4' | 'itr5' | 'itr6' | 'itr7';
  filingDate: string;
  dueDate: string;
  status: 'not-started' | 'in-progress' | 'filed' | 'overdue' | 'amended';
  grossIncome: number;
  taxableIncome: number;
  taxAmount: number;
  refundAmount?: number;
  acknowledgeNumber?: string;
  documents: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ITRReminder {
  id: string;
  clientId: string;
  caId: string;
  financialYear: string;
  dueDate: string;
  reminderSentDates: string[];
  status: 'pending' | 'notified' | 'completed';
}

// ============ COMPLIANCE MANAGEMENT ============
export interface ComplianceItem {
  id: string;
  caId: string;
  clientId: string;
  title: string;
  description: string;
  type: 'gst' | 'itr' | 'tds' | 'esi' | 'epf' | 'audit' | 'other';
  dueDate: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  frequency: 'once' | 'monthly' | 'quarterly' | 'yearly';
  checklist?: string[];
  documents: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ComplianceCalendar {
  id: string;
  caId: string;
  clientId: string;
  items: ComplianceItem[];
  month: number;
  year: number;
  overdueCount: number;
  completedCount: number;
  pendingCount: number;
}

// ============ FINANCIAL ANALYTICS ============
export interface FinancialMetrics {
  id: string;
  caId: string;
  month: number;
  year: number;
  totalRevenue: number;
  totalExpenses: number;
  profitMargin: number;
  activeClients: number;
  newClients: number;
  invoicesSent: number;
  invoicesPaid: number;
  averageInvoiceValue: number;
}

export interface ClientFinancials {
  id: string;
  clientId: string;
  period: string;
  grossRevenue: number;
  expenses: number;
  netProfit: number;
  taxAmount: number;
  gstCollected: number;
  gstPaid: number;
  netGST: number;
}

export interface RevenueAnalytics {
  id: string;
  caId: string;
  month: number;
  year: number;
  byService: Record<string, number>;
  byClient: Record<string, number>;
  totalRevenue: number;
  growth: number;
  trend: 'up' | 'down' | 'stable';
}

// ============ ADVANCED INVOICING ============
export interface InvoiceTemplate {
  id: string;
  caId: string;
  name: string;
  description: string;
  items: InvoiceLineItem[];
  taxRate: number;
  terms?: string;
  notes?: string;
  isDefault: boolean;
}

export interface RecurringInvoice {
  id: string;
  caId: string;
  clientId: string;
  templateId: string;
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';
  startDate: string;
  endDate?: string;
  nextDueDate: string;
  status: 'active' | 'paused' | 'completed';
  autoSend: boolean;
  lastGeneratedDate?: string;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  taxable: boolean;
}

export interface PaymentReminder {
  id: string;
  invoiceId: string;
  clientId: string;
  caId: string;
  status: 'pending' | 'sent' | 'paid' | 'overdue';
  daysOverdue: number;
  remindersSent: number;
  nextReminderDate?: string;
}

// ============ TEAM COLLABORATION ============
export interface TeamMember {
  id: string;
  caId: string;
  userId: string;
  name: string;
  email: string;
  designation: string;
  department: string;
  permissions: string[];
  assignedClients: string[];
  assignedTasks: number;
  completedTasks: number;
  performanceScore: number;
  status: 'active' | 'inactive';
  joinDate: string;
}

export interface TaskAssignment {
  id: string;
  taskId: string;
  teamMemberId: string;
  caId: string;
  assignedBy: string;
  assignedAt: string;
  status: 'pending' | 'accepted' | 'in-progress' | 'completed' | 'rejected';
  completedAt?: string;
  notes?: string;
}

// ============ CLIENT PORTAL ============
export interface ClientPortalAccess {
  id: string;
  clientId: string;
  caId: string;
  accessLevel: 'view' | 'limited' | 'full';
  canUploadDocuments: boolean;
  canViewInvoices: boolean;
  canRequestServices: boolean;
  canChat: boolean;
  lastAccessDate?: string;
  createdAt: string;
}

export interface ServiceRequest {
  id: string;
  clientId: string;
  caId: string;
  serviceId: string;
  serviceName: string;
  status: 'requested' | 'quoted' | 'accepted' | 'in-progress' | 'completed' | 'rejected';
  requestDate: string;
  requiredBy?: string;
  estimatedCost?: number;
  actualCost?: number;
  documents: string[];
  notes?: string;
  completedAt?: string;
}

// ============ AUTOMATION ============
export interface AutomationRule {
  id: string;
  caId: string;
  name: string;
  description: string;
  trigger: string;
  action: string;
  conditions: Record<string, any>;
  isActive: boolean;
  createdAt: string;
}

export interface AutomationLog {
  id: string;
  ruleId: string;
  caId: string;
  triggeredAt: string;
  status: 'success' | 'failed';
  result?: string;
  error?: string;
}

// ============ REPORTS ============
export interface Report {
  id: string;
  caId: string;
  name: string;
  description: string;
  type: 'revenue' | 'client' | 'compliance' | 'financial' | 'team' | 'custom';
  filters: Record<string, any>;
  frequency: 'once' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  recipients: string[];
  isScheduled: boolean;
  lastGeneratedDate?: string;
  nextGenerationDate?: string;
  createdAt: string;
}

export interface ReportData {
  id: string;
  reportId: string;
  generatedAt: string;
  data: Record<string, any>;
  chartData?: Record<string, any>;
  summary: string;
  exportFormats: ('pdf' | 'excel' | 'csv')[];
}

// ============ AUDIT & TRACKING ============
export interface AuditLog {
  id: string;
  userId: string;
  caId: string;
  action: string;
  entity: string;
  entityId: string;
  changes: Record<string, { old: any; new: any }>;
  userAgent: string;
  ipAddress: string;
  timestamp: string;
}

export interface ActivityFeed {
  id: string;
  caId: string;
  clientId?: string;
  userId: string;
  action: string;
  type: 'client' | 'document' | 'task' | 'invoice' | 'chat' | 'compliance' | 'gst' | 'itr';
  title: string;
  description: string;
  metadata: Record<string, any>;
  timestamp: string;
  isRead: boolean;
}

// ============ EXPENSE TRACKING ============
export interface Expense {
  id: string;
  caId: string;
  clientId?: string;
  category: string;
  amount: number;
  description: string;
  date: string;
  billNumber?: string;
  gstAmount?: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  attachments: string[];
  createdAt: string;
}

export interface ExpenseCategory {
  id: string;
  caId: string;
  name: string;
  icon: string;
  color: string;
  isActive: boolean;
}

// ============ PERFORMANCE METRICS ============
export interface PerformanceMetrics {
  id: string;
  caId: string;
  period: string;
  clientsOnboarded: number;
  clientsRetained: number;
  averageClientLifespan: number;
  taskCompletionRate: number;
  invoiceCollectionRate: number;
  averageResponseTime: number;
  customers atisfactionScore: number;
  totalRevenueGenerated: number;
}

// ============ NOTIFICATIONS ============
export interface NotificationPreference {
  id: string;
  userId: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  complianceAlerts: boolean;
  invoiceReminders: boolean;
  taskAssignments: boolean;
  documentUploads: boolean;
  paymentUpdates: boolean;
  systemUpdates: boolean;
}

export interface SmartNotification {
  id: string;
  userId: string;
  caId: string;
  title: string;
  message: string;
  type: 'compliance' | 'invoice' | 'task' | 'document' | 'payment' | 'gst' | 'itr' | 'system';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionUrl?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

// ============ DOCUMENT INTELLIGENCE ============
export interface DocumentAnalysis {
  id: string;
  documentId: string;
  clientId: string;
  caId: string;
  extractedData: Record<string, any>;
  category: string;
  confidence: number;
  suggestedTags: string[];
  expiryDate?: string;
  importance: 'low' | 'medium' | 'high';
  aiSummary?: string;
}

export interface OCRResult {
  id: string;
  documentId: string;
  clientId: string;
  caId: string;
  extractedText: string;
  confidence: number;
  entities: Record<string, any>;
  tables?: string[][];
  createdAt: string;
}

// ============ SCHEDULING ============
export interface CalendarEvent {
  id: string;
  caId: string;
  clientId?: string;
  title: string;
  description?: string;
  type: 'meeting' | 'deadline' | 'filing' | 'reminder' | 'holiday';
  startDate: string;
  endDate: string;
  location?: string;
  attendees: string[];
  isRecurring: boolean;
  recurrenceRule?: string;
  reminders: string[];
}

export interface SlotAvailability {
  id: string;
  caId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDuration: number;
  isAvailable: boolean;
}

export interface Appointment {
  id: string;
  caId: string;
  clientId: string;
  title: string;
  description?: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  type: 'video' | 'phone' | 'in-person' | 'email';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  meetingLink?: string;
  notes?: string;
}
