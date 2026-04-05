// ============================================================================
// TAXMATE: Complete TypeScript Types
// ============================================================================

// ============================================================================
// USER & AUTHENTICATION TYPES
// ============================================================================

export type UserRole = 'ca' | 'client' | 'staff';

export interface User {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  is_verified: boolean;
  is_active: boolean;
  last_login_at?: string;
  device_sessions: DeviceSession[];
  preferences: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface DeviceSession {
  id: string;
  device_name: string;
  ip_address: string;
  last_active: string;
  user_agent: string;
}

export interface AuthToken {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: 'Bearer';
}

// ============================================================================
// CA (CHARTERED ACCOUNTANT) TYPES
// ============================================================================

export type SubscriptionTier = 'free' | 'basic' | 'professional' | 'enterprise';

export interface CAProfile {
  id: string;
  firm_name: string;
  firm_address?: string;
  gst_number?: string;
  pan_number?: string;
  icai_registration_number?: string;
  experience_years?: number;
  specializations: string[];
  bio?: string;
  profile_image_url?: string;
  kyc_verified: boolean;
  kyc_documents: KYCDocument;
  kyc_submitted_at?: string;
  kyc_verified_at?: string;
  bank_account?: string;
  bank_ifsc?: string;
  is_premium: boolean;
  subscription_tier: SubscriptionTier;
  subscription_expires_at?: string;
  max_clients: number;
  max_staff: number;
  rating: number;
  total_reviews: number;
  total_revenue: number;
  created_at: string;
  updated_at: string;
}

export interface KYCDocument {
  aadhar_verified?: boolean;
  pan_verified?: boolean;
  icai_verified?: boolean;
  bank_verified?: boolean;
  [key: string]: any;
}

// ============================================================================
// CLIENT TYPES
// ============================================================================

export type ClientType = 'individual' | 'business' | 'startup' | 'huf' | 'partnership' | 'llp';
export type ClientCategory = 'general' | 'healthcare' | 'education' | 'retail' | 'manufacturing' | 'it' | 'finance' | 'other';
export type ClientStatus = 'active' | 'inactive' | 'archived';
export type KYCStatus = 'pending' | 'submitted' | 'verified' | 'rejected';

export interface Client {
  id: string;
  ca_id: string;
  name: string;
  email?: string;
  phone?: string;
  type: ClientType;
  gst_number?: string;
  pan_number?: string;
  aadhar_number?: string;
  uin_number?: string;
  client_category: ClientCategory;
  business_address?: string;
  country: string;
  state?: string;
  city?: string;
  pincode?: string;
  tags: string[];
  status: ClientStatus;
  kyc_status: KYCStatus;
  gstin_validity_date?: string;
  pan_validity_date?: string;
  last_filing_date?: string;
  next_filing_due?: string;
  total_invoices: number;
  total_paid: number;
  total_pending: number;
  notes: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// STAFF TYPES
// ============================================================================

export type StaffDesignation = 'junior_accountant' | 'senior_accountant' | 'manager' | 'lead';
export type StaffDepartment = 'general' | 'tax' | 'audit' | 'compliance' | 'client_support';

export interface Staff {
  id: string;
  ca_id: string;
  designation: StaffDesignation;
  department: StaffDepartment;
  assigned_clients: string[];
  permissions: string[];
  is_active: boolean;
  salary_structure?: Record<string, any>;
  performance_rating: number;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// SERVICES & OFFERINGS TYPES
// ============================================================================

export type ServiceCategory = 'gst_filing' | 'itr_filing' | 'audit' | 'company_registration' | 'compliance' | 'bookkeeping' | 'consultation' | 'other';
export type PricingType = 'fixed' | 'custom' | 'range';
export type DeliveryMethod = 'email' | 'platform' | 'in_person' | 'video_call';

export interface Service {
  id: string;
  ca_id: string;
  name: string;
  category: ServiceCategory;
  description?: string;
  pricing_type: PricingType;
  price?: number;
  price_range_min?: number;
  price_range_max?: number;
  currency: string;
  duration_days?: number;
  is_active: boolean;
  required_documents: string[];
  delivery_method: DeliveryMethod;
  turnaround_time_days?: number;
  icon_emoji?: string;
  order_count: number;
  avg_rating: number;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// DOCUMENT TYPES
// ============================================================================

export type DocumentCategory = 'gst_docs' | 'itr_docs' | 'bank_statements' | 'invoices' | 'receipts' | 'compliance_docs' | 'identity_proof' | 'business_proof' | 'other';
export type DocumentStatus = 'active' | 'archived' | 'deleted';
export type ValidityStatus = 'valid' | 'expiring_soon' | 'expired';
export type AccessLevel = 'private' | 'shared' | 'public';

export interface Document {
  id: string;
  client_id: string;
  ca_id: string;
  file_url: string;
  file_name: string;
  file_size?: number;
  file_type?: string;
  category: DocumentCategory;
  subcategory?: string;
  folder_path?: string;
  version: number;
  status: DocumentStatus;
  ocr_text?: string;
  is_scanned: boolean;
  expiry_date?: string;
  validity_status?: ValidityStatus;
  shared_with: string[];
  is_shared_with_client: boolean;
  uploaded_by?: string;
  tags: string[];
  description?: string;
  access_level: AccessLevel;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// CHAT & COMMUNICATION TYPES
// ============================================================================

export type RoomType = 'direct' | 'group' | 'broadcast';
export type MessageType = 'text' | 'file' | 'image' | 'video' | 'document' | 'system';

export interface ChatRoom {
  id: string;
  room_type: RoomType;
  name?: string;
  description?: string;
  participants: string[];
  created_by: string;
  avatar_url?: string;
  is_active: boolean;
  last_message_at?: string;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  chat_room_id: string;
  sender_id: string;
  message_type: MessageType;
  content?: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  file_type?: string;
  media_url?: string;
  media_type?: string;
  is_edited: boolean;
  edited_at?: string;
  is_deleted: boolean;
  deleted_at?: string;
  read_by: string[];
  reactions: Record<string, string[]>;
  reply_to_message_id?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// CALL TYPES
// ============================================================================

export type CallType = 'voice' | 'video' | 'screen_share';
export type CallStatus = 'initiated' | 'ringing' | 'connected' | 'ended' | 'missed' | 'declined';
export type CallQuality = 'poor' | 'fair' | 'good' | 'excellent';

export interface CallRecord {
  id: string;
  chat_room_id?: string;
  call_type: CallType;
  initiator_id: string;
  participants: string[];
  status: CallStatus;
  duration_seconds?: number;
  recording_url?: string;
  is_recorded: boolean;
  has_screen_share: boolean;
  call_quality?: CallQuality;
  started_at?: string;
  ended_at?: string;
  notes?: string;
  created_at: string;
}

// ============================================================================
// APPOINTMENT TYPES
// ============================================================================

export type AppointmentType = 'meeting' | 'consultation' | 'filing_discussion' | 'follow_up' | 'review';
export type AppointmentStatus = 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
export type MeetingPlatform = 'google_meet' | 'zoom' | 'teams' | 'in_person' | 'phone';

export interface Appointment {
  id: string;
  ca_id: string;
  client_id: string;
  service_id?: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  appointment_type: AppointmentType;
  status: AppointmentStatus;
  location?: string;
  meeting_link?: string;
  meeting_platform: MeetingPlatform;
  notes?: string;
  attachments: string[];
  reminders_sent: boolean;
  reminder_time_minutes: number;
  color_tag?: string;
  recurring: boolean;
  recurrence_pattern?: RecurrencePattern;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface RecurrencePattern {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  end_date?: string;
  end_count?: number;
}

// ============================================================================
// TASK TYPES
// ============================================================================

export type TaskCategory = 'gst_filing' | 'itr_filing' | 'audit' | 'compliance' | 'follow_up' | 'document_review' | 'general';
export type TaskStatus = 'pending' | 'in_progress' | 'review' | 'completed' | 'blocked' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Task {
  id: string;
  ca_id: string;
  client_id?: string;
  assigned_to?: string;
  title: string;
  description?: string;
  category: TaskCategory;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string;
  start_date?: string;
  completed_date?: string;
  recurring: boolean;
  recurrence_pattern?: RecurrencePattern;
  dependencies: string[];
  subtasks: Subtask[];
  checklist: ChecklistItem[];
  attachments: string[];
  comments_count: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Subtask {
  id: string;
  title: string;
  is_completed: boolean;
  completed_date?: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  is_checked: boolean;
}

export interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  comment: string;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// INVOICE & BILLING TYPES
// ============================================================================

export type InvoiceStatus = 'draft' | 'issued' | 'sent' | 'viewed' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled';
export type DiscountType = 'percentage' | 'fixed';

export interface Invoice {
  id: string;
  invoice_number: string;
  ca_id: string;
  client_id: string;
  service_id?: string;
  status: InvoiceStatus;
  invoice_date: string;
  due_date?: string;
  line_items: LineItem[];
  subtotal: number;
  tax_amount: number;
  tax_rate: number;
  discount_amount: number;
  discount_type?: DiscountType;
  total_amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  payment_terms?: string;
  notes?: string;
  bank_details?: Record<string, any>;
  gst_details?: Record<string, any>;
  file_url?: string;
  is_sent: boolean;
  sent_at?: string;
  reminder_sent: boolean;
  created_at: string;
  updated_at: string;
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  tax_rate?: number;
  tax_amount?: number;
}

// ============================================================================
// PAYMENT TYPES
// ============================================================================

export type PaymentMethod = 'razorpay' | 'bank_transfer' | 'upi' | 'check' | 'cash' | 'crypto';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';

export interface Payment {
  id: string;
  invoice_id: string;
  ca_id: string;
  client_id: string;
  amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  transaction_id?: string;
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
  payment_gateway_response?: Record<string, any>;
  reference_number?: string;
  notes?: string;
  receipt_url?: string;
  paid_at?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// SUBSCRIPTION TYPES
// ============================================================================

export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: SubscriptionTier;
  description?: string;
  price: number;
  currency: string;
  billing_cycle: 'monthly' | 'yearly';
  max_clients: number;
  max_staff: number;
  max_storage_gb: number;
  features: Record<string, any>;
  is_active: boolean;
  created_at: string;
}

export interface Subscription {
  id: string;
  ca_id: string;
  plan_id: string;
  status: 'active' | 'cancelled' | 'expired' | 'paused';
  start_date: string;
  end_date?: string;
  renewal_date?: string;
  auto_renew: boolean;
  payment_method?: PaymentMethod;
  total_paid: number;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export type NotificationType = 'filing_deadline' | 'task_assigned' | 'payment_reminder' | 'message' | 'document_shared' | 'appointment' | 'system' | 'transaction';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'critical';

export interface Notification {
  id: string;
  user_id: string;
  notification_type: NotificationType;
  title: string;
  message: string;
  related_id?: string;
  related_type?: string;
  priority: NotificationPriority;
  is_read: boolean;
  read_at?: string;
  action_url?: string;
  action_text?: string;
  channels: ('push' | 'email' | 'sms')[];
  is_sent: boolean;
  sent_at?: string;
  created_at: string;
}

// ============================================================================
// COMPLIANCE TYPES
// ============================================================================

export type FilingType = 'gst_return' | 'itr' | 'audit_report' | 'form_16' | 'form_15h' | 'other';
export type FilingStatus = 'pending' | 'in_progress' | 'filed' | 'rejected' | 'cancelled';

export interface ComplianceFiling {
  id: string;
  client_id: string;
  ca_id: string;
  filing_type: FilingType;
  financial_year_start?: string;
  financial_year_end?: string;
  status: FilingStatus;
  due_date?: string;
  filed_date?: string;
  reference_number?: string;
  filing_details: Record<string, any>;
  documents: string[];
  remarks?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// AUDIT LOG TYPES
// ============================================================================

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  description?: string;
  changes: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  status: 'success' | 'failed' | 'blocked';
  created_at: string;
}

// ============================================================================
// REVIEW TYPES
// ============================================================================

export interface Review {
  id: string;
  ca_id: string;
  client_id: string;
  service_id?: string;
  rating: number;
  title?: string;
  review_text?: string;
  helpful_count: number;
  is_verified: boolean;
  created_at: string;
}

// ============================================================================
// ACTIVITY FEED TYPES
// ============================================================================

export type ActivityType = 'client_added' | 'document_uploaded' | 'invoice_created' | 'payment_received' | 'appointment_scheduled' | 'task_assigned' | 'filing_completed' | 'message_sent';

export interface ActivityFeed {
  id: string;
  user_id: string;
  activity_type: ActivityType;
  title: string;
  description?: string;
  related_id?: string;
  related_type?: string;
  icon_emoji?: string;
  visibility: 'private' | 'ca_only' | 'public';
  created_at: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  statusCode: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================================================
// DASHBOARD TYPES
// ============================================================================

export interface CADashboardData {
  total_clients: number;
  total_revenue: number;
  pending_filings: number;
  pending_tasks: number;
  recent_payments: Payment[];
  upcoming_deadlines: Appointment[];
  activity_feed: ActivityFeed[];
}

export interface ClientDashboardData {
  pending_documents: Document[];
  upcoming_deadlines: ComplianceFiling[];
  recent_invoices: Invoice[];
  service_status: Task[];
  activity_feed: ActivityFeed[];
}

// ============================================================================
// REALTIME EVENT TYPES
// ============================================================================

export interface RealtimeEvent<T = any> {
  type: 'message_new' | 'task_updated' | 'invoice_created' | 'user_typing' | 'call_initiated';
  payload: T;
  timestamp: string;
}
