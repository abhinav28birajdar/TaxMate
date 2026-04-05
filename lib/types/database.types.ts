/**
 * Database Types for TaxMate
 * 
 * This file defines TypeScript types for the Supabase database.
 * To regenerate with accurate types, run:
 * npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/types/database.types.ts
 * 
 * Note: This file uses permissive types to allow flexibility during development.
 * Once the schema is finalized, regenerate with the Supabase CLI for strict typing.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// User roles in the system
export type UserRole = 'ca' | 'client' | 'firm' | 'admin';

// Case statuses
export type CaseStatus = 
  | 'pending' 
  | 'in_progress' 
  | 'waiting_client' 
  | 'under_review' 
  | 'filed' 
  | 'completed' 
  | 'on_hold' 
  | 'cancelled';

// Case priorities
export type CasePriority = 'low' | 'medium' | 'high' | 'urgent';

// Presence statuses
export type PresenceStatus = 'online' | 'away' | 'busy' | 'offline';

// Message types
export type MessageType = 'text' | 'file' | 'image' | 'voice' | 'system';

// Notification types
export type NotificationType = 
  | 'message' 
  | 'case_update' 
  | 'appointment' 
  | 'payment' 
  | 'document' 
  | 'review' 
  | 'system' 
  | 'reminder';

// Relationship status
export type RelationshipStatus = 'pending' | 'accepted' | 'rejected' | 'blocked';

// Payment status
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';

// Invoice status
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

// Appointment status
export type AppointmentStatus = 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';

/**
 * Permissive Database interface
 * Allows any table operations while development is ongoing
 */
export interface Database {
  public: {
    Tables: {
      // Core user tables
      users: TableDefinition;
      profiles: TableDefinition;
      ca_profiles: TableDefinition;
      client_profiles: TableDefinition;
      firm_profiles: TableDefinition;
      
      // Relationship tables
      ca_client_relationships: TableDefinition;
      firm_members: TableDefinition;
      
      // Case management
      cases: TableDefinition;
      case_tasks: TableDefinition;
      case_documents: TableDefinition;
      case_timeline: TableDefinition;
      case_notes: TableDefinition;
      case_types: TableDefinition;
      
      // Communication
      conversations: TableDefinition;
      messages: TableDefinition;
      message_read_receipts: TableDefinition;
      typing_indicators: TableDefinition;
      notifications: TableDefinition;
      
      // Appointments
      appointments: TableDefinition;
      availability_slots: TableDefinition;
      
      // Payments
      invoices: TableDefinition;
      invoice_items: TableDefinition;
      payments: TableDefinition;
      
      // Documents
      documents: TableDefinition;
      document_folders: TableDefinition;
      
      // Reviews
      reviews: TableDefinition;
      
      // Compliance
      compliance_deadlines: TableDefinition;
      compliance_reminders: TableDefinition;
      
      // Presence
      user_presence: TableDefinition;
      
      // Analytics (optional analytics database)
      activity_logs: TableDefinition;
      page_views: TableDefinition;
      error_logs: TableDefinition;
      metrics: TableDefinition;
      
      // Permissions
      roles: TableDefinition;
      permissions: TableDefinition;
      role_permissions: TableDefinition;
      
      // Allow any other tables
      [key: string]: TableDefinition;
    };
    Views: {
      [key: string]: ViewDefinition;
    };
    Functions: {
      [key: string]: FunctionDefinition;
    };
    Enums: {
      user_role: UserRole;
      case_status: CaseStatus;
      case_priority: CasePriority;
      presence_status: PresenceStatus;
      message_type: MessageType;
      notification_type: NotificationType;
      relationship_status: RelationshipStatus;
      payment_status: PaymentStatus;
      invoice_status: InvoiceStatus;
      appointment_status: AppointmentStatus;
    };
  };
}

// Permissive table definition
interface TableDefinition {
  Row: Record<string, unknown>;
  Insert: Record<string, unknown>;
  Update: Record<string, unknown>;
  Relationships?: RelationshipDefinition[];
}

interface ViewDefinition {
  Row: Record<string, unknown>;
  Relationships?: RelationshipDefinition[];
}

interface FunctionDefinition {
  Args: Record<string, unknown>;
  Returns: unknown;
}

interface RelationshipDefinition {
  foreignKeyName: string;
  columns: string[];
  referencedRelation: string;
  referencedColumns: string[];
}

/**
 * Utility types for working with the database
 */

// Extract row type from a table
export type TableRow<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Row'];

// Extract insert type from a table
export type TableInsert<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Insert'];

// Extract update type from a table
export type TableUpdate<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Update'];

/**
 * Common entity interfaces for type safety in components
 */

export interface User {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface CAProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  display_name: string;
  slug: string;
  avatar_url?: string;
  bio?: string;
  specializations: string[];
  is_verified: boolean;
  rating: number;
  total_reviews: number;
  hourly_rate?: number;
  phone?: string;
  city?: string;
  state?: string;
  experience_years?: number;
  created_at: string;
  updated_at: string;
}

export interface ClientProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  phone?: string;
  company_name?: string;
  gst_number?: string;
  pan_number?: string;
  address?: string;
  city?: string;
  state?: string;
  created_at: string;
  updated_at: string;
}

export interface Case {
  id: string;
  case_number: string;
  ca_id: string;
  client_id: string;
  title: string;
  description?: string;
  case_type: string;
  status: CaseStatus;
  priority: CasePriority;
  deadline?: string;
  estimated_fee?: number;
  actual_fee?: number;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  participant_ids: string[];
  case_id?: string;
  last_message_at?: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content?: string;
  message_type: MessageType;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  is_edited: boolean;
  edited_at?: string;
  deleted_at?: string;
  read_at?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  action_url?: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

export interface Appointment {
  id: string;
  ca_id: string;
  client_id: string;
  case_id?: string;
  title: string;
  description?: string;
  scheduled_at: string;
  duration_minutes: number;
  meeting_type: 'video' | 'audio' | 'in_person';
  meeting_link?: string;
  status: AppointmentStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  ca_id: string;
  client_id: string;
  case_id?: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  status: InvoiceStatus;
  due_date: string;
  paid_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  invoice_id: string;
  ca_id: string;
  client_id: string;
  amount: number;
  payment_method: string;
  transaction_id?: string;
  status: PaymentStatus;
  created_at: string;
}

export interface Review {
  id: string;
  ca_id: string;
  client_id: string;
  case_id?: string;
  rating: number;
  comment?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}