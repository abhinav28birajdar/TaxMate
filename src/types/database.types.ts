// ===========================================
// CA PRO CONNECT - DATABASE TYPES
// Auto-generated types for Supabase schema
// ===========================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'ca' | 'client' | 'firm' | 'admin';
export type UserStatus = 'active' | 'suspended' | 'deactivated' | 'pending_onboarding';
export type VerificationStatus = 'unverified' | 'pending' | 'under_review' | 'verified' | 'rejected';
export type CaseStatus = 'pending' | 'in_progress' | 'waiting_client' | 'under_review' | 'filed' | 'completed' | 'on_hold' | 'cancelled';
export type CasePriority = 'low' | 'medium' | 'high' | 'urgent';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'disputed';
export type AppointmentStatus = 'scheduled' | 'confirmed' | 'rescheduled' | 'cancelled' | 'completed' | 'no_show';
export type RelationshipStatus = 'pending' | 'accepted' | 'rejected' | 'terminated';
export type PresenceStatus = 'online' | 'away' | 'busy' | 'offline';

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          phone: string | null
          phone_verified: boolean
          email_verified: boolean
          role: UserRole
          status: UserStatus
          last_login_at: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id: string
          email: string
          phone?: string | null
          phone_verified?: boolean
          email_verified?: boolean
          role: UserRole
          status?: UserStatus
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          phone?: string | null
          phone_verified?: boolean
          email_verified?: boolean
          role?: UserRole
          status?: UserStatus
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      ca_profiles: {
        Row: {
          id: string
          user_id: string
          first_name: string
          last_name: string
          display_name: string | null
          avatar_url: string | null
          banner_url: string | null
          bio: string | null
          tagline: string | null
          icai_membership_number: string | null
          icai_registration_date: string | null
          firm_name: string | null
          designation: string | null
          years_of_experience: number
          verification_status: VerificationStatus
          verification_documents: Json
          verified_at: string | null
          verified_by: string | null
          rejection_reason: string | null
          office_address: Json | null
          service_locations: string[] | null
          is_available: boolean
          consultation_modes: string[]
          total_clients: number
          active_cases: number
          completed_cases: number
          average_rating: number
          total_reviews: number
          is_premium: boolean
          premium_expires_at: string | null
          featured_until: string | null
          slug: string | null
          meta_title: string | null
          meta_description: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          first_name: string
          last_name: string
          display_name?: string | null
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          tagline?: string | null
          icai_membership_number?: string | null
          icai_registration_date?: string | null
          firm_name?: string | null
          designation?: string | null
          years_of_experience?: number
          verification_status?: VerificationStatus
          verification_documents?: Json
          verified_at?: string | null
          verified_by?: string | null
          rejection_reason?: string | null
          office_address?: Json | null
          service_locations?: string[] | null
          is_available?: boolean
          consultation_modes?: string[]
          total_clients?: number
          active_cases?: number
          completed_cases?: number
          average_rating?: number
          total_reviews?: number
          is_premium?: boolean
          premium_expires_at?: string | null
          featured_until?: string | null
          slug?: string | null
          meta_title?: string | null
          meta_description?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          first_name?: string
          last_name?: string
          display_name?: string | null
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          tagline?: string | null
          icai_membership_number?: string | null
          icai_registration_date?: string | null
          firm_name?: string | null
          designation?: string | null
          years_of_experience?: number
          verification_status?: VerificationStatus
          verification_documents?: Json
          verified_at?: string | null
          verified_by?: string | null
          rejection_reason?: string | null
          office_address?: Json | null
          service_locations?: string[] | null
          is_available?: boolean
          consultation_modes?: string[]
          total_clients?: number
          active_cases?: number
          completed_cases?: number
          average_rating?: number
          total_reviews?: number
          is_premium?: boolean
          premium_expires_at?: string | null
          featured_until?: string | null
          slug?: string | null
          meta_title?: string | null
          meta_description?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      client_profiles: {
        Row: {
          id: string
          user_id: string
          client_type: 'individual' | 'business'
          first_name: string
          last_name: string
          date_of_birth: string | null
          pan_number: string | null
          business_name: string | null
          business_type: string | null
          gst_number: string | null
          cin_number: string | null
          incorporation_date: string | null
          avatar_url: string | null
          phone_alternate: string | null
          address: Json | null
          preferred_language: string
          total_cases: number
          active_cases: number
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          client_type?: 'individual' | 'business'
          first_name: string
          last_name: string
          date_of_birth?: string | null
          pan_number?: string | null
          business_name?: string | null
          business_type?: string | null
          gst_number?: string | null
          cin_number?: string | null
          incorporation_date?: string | null
          avatar_url?: string | null
          phone_alternate?: string | null
          address?: Json | null
          preferred_language?: string
          total_cases?: number
          active_cases?: number
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          client_type?: 'individual' | 'business'
          first_name?: string
          last_name?: string
          date_of_birth?: string | null
          pan_number?: string | null
          business_name?: string | null
          business_type?: string | null
          gst_number?: string | null
          cin_number?: string | null
          incorporation_date?: string | null
          avatar_url?: string | null
          phone_alternate?: string | null
          address?: Json | null
          preferred_language?: string
          total_cases?: number
          active_cases?: number
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      ca_services: {
        Row: {
          id: string
          ca_id: string
          service_type: string
          sub_category: string | null
          description: string | null
          pricing_type: 'fixed' | 'hourly' | 'quote'
          base_price: number
          currency: string
          estimated_days: number | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          ca_id: string
          service_type: string
          sub_category?: string | null
          description?: string | null
          pricing_type?: 'fixed' | 'hourly' | 'quote'
          base_price: number
          currency?: string
          estimated_days?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          ca_id?: string
          service_type?: string
          sub_category?: string | null
          description?: string | null
          pricing_type?: 'fixed' | 'hourly' | 'quote'
          base_price?: number
          currency?: string
          estimated_days?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      ca_specializations: {
        Row: {
          id: string
          ca_id: string
          specialization: string
          created_at: string
        }
        Insert: {
          id?: string
          ca_id: string
          specialization: string
          created_at?: string
        }
        Update: {
          id?: string
          ca_id?: string
          specialization?: string
          created_at?: string
        }
      }
      ca_client_relationships: {
        Row: {
          id: string
          ca_id: string
          client_id: string
          status: RelationshipStatus
          requested_by: string | null
          requested_at: string
          accepted_at: string | null
          rejected_at: string | null
          rejection_reason: string | null
          permissions: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          ca_id: string
          client_id: string
          status?: RelationshipStatus
          requested_by?: string | null
          requested_at?: string
          accepted_at?: string | null
          rejected_at?: string | null
          rejection_reason?: string | null
          permissions?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          ca_id?: string
          client_id?: string
          status?: RelationshipStatus
          requested_by?: string | null
          requested_at?: string
          accepted_at?: string | null
          rejected_at?: string | null
          rejection_reason?: string | null
          permissions?: Json
          created_at?: string
          updated_at?: string
        }
      }
      cases: {
        Row: {
          id: string
          case_number: string
          ca_id: string
          client_id: string
          relationship_id: string | null
          title: string
          description: string | null
          case_type: string
          sub_type: string | null
          status: CaseStatus
          priority: CasePriority
          deadline: string | null
          started_at: string | null
          completed_at: string | null
          filed_at: string | null
          estimated_fee: number | null
          final_fee: number | null
          currency: string
          payment_status: 'unpaid' | 'partially_paid' | 'paid' | 'refunded'
          assigned_to: string | null
          tags: string[] | null
          assessment_year: string | null
          financial_year: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          case_number?: string
          ca_id: string
          client_id: string
          relationship_id?: string | null
          title: string
          description?: string | null
          case_type: string
          sub_type?: string | null
          status?: CaseStatus
          priority?: CasePriority
          deadline?: string | null
          started_at?: string | null
          completed_at?: string | null
          filed_at?: string | null
          estimated_fee?: number | null
          final_fee?: number | null
          currency?: string
          payment_status?: 'unpaid' | 'partially_paid' | 'paid' | 'refunded'
          assigned_to?: string | null
          tags?: string[] | null
          assessment_year?: string | null
          financial_year?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          case_number?: string
          ca_id?: string
          client_id?: string
          relationship_id?: string | null
          title?: string
          description?: string | null
          case_type?: string
          sub_type?: string | null
          status?: CaseStatus
          priority?: CasePriority
          deadline?: string | null
          started_at?: string | null
          completed_at?: string | null
          filed_at?: string | null
          estimated_fee?: number | null
          final_fee?: number | null
          currency?: string
          payment_status?: 'unpaid' | 'partially_paid' | 'paid' | 'refunded'
          assigned_to?: string | null
          tags?: string[] | null
          assessment_year?: string | null
          financial_year?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      case_tasks: {
        Row: {
          id: string
          case_id: string
          title: string
          description: string | null
          status: 'pending' | 'in_progress' | 'completed'
          assigned_to: string | null
          due_date: string | null
          completed_at: string | null
          completed_by: string | null
          position: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          case_id: string
          title: string
          description?: string | null
          status?: 'pending' | 'in_progress' | 'completed'
          assigned_to?: string | null
          due_date?: string | null
          completed_at?: string | null
          completed_by?: string | null
          position?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          case_id?: string
          title?: string
          description?: string | null
          status?: 'pending' | 'in_progress' | 'completed'
          assigned_to?: string | null
          due_date?: string | null
          completed_at?: string | null
          completed_by?: string | null
          position?: number
          created_at?: string
          updated_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          participant_ids: string[]
          case_id: string | null
          title: string | null
          is_archived: boolean
          last_message_at: string
          last_message_preview: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          participant_ids: string[]
          case_id?: string | null
          title?: string | null
          is_archived?: boolean
          last_message_at?: string
          last_message_preview?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          participant_ids?: string[]
          case_id?: string | null
          title?: string | null
          is_archived?: boolean
          last_message_at?: string
          last_message_preview?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          message_type: 'text' | 'file' | 'system' | 'image'
          content: string | null
          file_url: string | null
          file_name: string | null
          file_size: number | null
          is_edited: boolean
          edited_at: string | null
          created_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          message_type?: 'text' | 'file' | 'system' | 'image'
          content?: string | null
          file_url?: string | null
          file_name?: string | null
          file_size?: number | null
          is_edited?: boolean
          edited_at?: string | null
          created_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          message_type?: 'text' | 'file' | 'system' | 'image'
          content?: string | null
          file_url?: string | null
          file_name?: string | null
          file_size?: number | null
          is_edited?: boolean
          edited_at?: string | null
          created_at?: string
          deleted_at?: string | null
        }
      }
      documents: {
        Row: {
          id: string
          uploaded_by: string
          case_id: string | null
          ca_id: string | null
          client_id: string | null
          file_name: string
          file_size: number | null
          mime_type: string | null
          storage_path: string
          document_type: string | null
          ai_tags: string[] | null
          ai_extracted_data: Json | null
          version: number
          parent_document_id: string | null
          is_public: boolean
          password_protected: boolean
          encrypted: boolean
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          uploaded_by: string
          case_id?: string | null
          ca_id?: string | null
          client_id?: string | null
          file_name: string
          file_size?: number | null
          mime_type?: string | null
          storage_path: string
          document_type?: string | null
          ai_tags?: string[] | null
          ai_extracted_data?: Json | null
          version?: number
          parent_document_id?: string | null
          is_public?: boolean
          password_protected?: boolean
          encrypted?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          uploaded_by?: string
          case_id?: string | null
          ca_id?: string | null
          client_id?: string | null
          file_name?: string
          file_size?: number | null
          mime_type?: string | null
          storage_path?: string
          document_type?: string | null
          ai_tags?: string[] | null
          ai_extracted_data?: Json | null
          version?: number
          parent_document_id?: string | null
          is_public?: boolean
          password_protected?: boolean
          encrypted?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      appointments: {
        Row: {
          id: string
          ca_id: string
          client_id: string
          case_id: string | null
          scheduled_at: string
          duration_minutes: number
          timezone: string
          appointment_type: string
          mode: 'online' | 'offline'
          location: string | null
          meeting_link: string | null
          meeting_password: string | null
          status: AppointmentStatus
          title: string | null
          notes: string | null
          reminder_sent: boolean
          recording_url: string | null
          cancelled_by: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          ca_id: string
          client_id: string
          case_id?: string | null
          scheduled_at: string
          duration_minutes?: number
          timezone?: string
          appointment_type?: string
          mode?: 'online' | 'offline'
          location?: string | null
          meeting_link?: string | null
          meeting_password?: string | null
          status?: AppointmentStatus
          title?: string | null
          notes?: string | null
          reminder_sent?: boolean
          recording_url?: string | null
          cancelled_by?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          ca_id?: string
          client_id?: string
          case_id?: string | null
          scheduled_at?: string
          duration_minutes?: number
          timezone?: string
          appointment_type?: string
          mode?: 'online' | 'offline'
          location?: string | null
          meeting_link?: string | null
          meeting_password?: string | null
          status?: AppointmentStatus
          title?: string | null
          notes?: string | null
          reminder_sent?: boolean
          recording_url?: string | null
          cancelled_by?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string | null
          action_url: string | null
          related_user_id: string | null
          case_id: string | null
          conversation_id: string | null
          is_read: boolean
          read_at: string | null
          sent_via_email: boolean
          sent_via_sms: boolean
          sent_via_push: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message?: string | null
          action_url?: string | null
          related_user_id?: string | null
          case_id?: string | null
          conversation_id?: string | null
          is_read?: boolean
          read_at?: string | null
          sent_via_email?: boolean
          sent_via_sms?: boolean
          sent_via_push?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          message?: string | null
          action_url?: string | null
          related_user_id?: string | null
          case_id?: string | null
          conversation_id?: string | null
          is_read?: boolean
          read_at?: string | null
          sent_via_email?: boolean
          sent_via_sms?: boolean
          sent_via_push?: boolean
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          ca_id: string
          client_id: string
          case_id: string | null
          rating: number
          title: string | null
          review_text: string | null
          communication_rating: number | null
          expertise_rating: number | null
          responsiveness_rating: number | null
          value_rating: number | null
          is_published: boolean
          is_verified: boolean
          ca_response: string | null
          ca_responded_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          ca_id: string
          client_id: string
          case_id?: string | null
          rating: number
          title?: string | null
          review_text?: string | null
          communication_rating?: number | null
          expertise_rating?: number | null
          responsiveness_rating?: number | null
          value_rating?: number | null
          is_published?: boolean
          is_verified?: boolean
          ca_response?: string | null
          ca_responded_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          ca_id?: string
          client_id?: string
          case_id?: string | null
          rating?: number
          title?: string | null
          review_text?: string | null
          communication_rating?: number | null
          expertise_rating?: number | null
          responsiveness_rating?: number | null
          value_rating?: number | null
          is_published?: boolean
          is_verified?: boolean
          ca_response?: string | null
          ca_responded_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          payment_id: string
          payer_id: string
          payee_id: string
          case_id: string | null
          amount: number
          currency: string
          payment_gateway: string | null
          gateway_order_id: string | null
          gateway_payment_id: string | null
          status: PaymentStatus
          payment_type: string | null
          description: string | null
          invoice_id: string | null
          initiated_at: string
          completed_at: string | null
          failed_at: string | null
          failure_reason: string | null
          held_in_escrow: boolean
          released_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          payment_id: string
          payer_id: string
          payee_id: string
          case_id?: string | null
          amount: number
          currency?: string
          payment_gateway?: string | null
          gateway_order_id?: string | null
          gateway_payment_id?: string | null
          status?: PaymentStatus
          payment_type?: string | null
          description?: string | null
          invoice_id?: string | null
          initiated_at?: string
          completed_at?: string | null
          failed_at?: string | null
          failure_reason?: string | null
          held_in_escrow?: boolean
          released_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          payment_id?: string
          payer_id?: string
          payee_id?: string
          case_id?: string | null
          amount?: number
          currency?: string
          payment_gateway?: string | null
          gateway_order_id?: string | null
          gateway_payment_id?: string | null
          status?: PaymentStatus
          payment_type?: string | null
          description?: string | null
          invoice_id?: string | null
          initiated_at?: string
          completed_at?: string | null
          failed_at?: string | null
          failure_reason?: string | null
          held_in_escrow?: boolean
          released_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_presence: {
        Row: {
          id: string
          user_id: string
          status: PresenceStatus
          last_seen_at: string
          current_page: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          status?: PresenceStatus
          last_seen_at?: string
          current_page?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          status?: PresenceStatus
          last_seen_at?: string
          current_page?: string | null
          updated_at?: string
        }
      }
    }
  }
}

// ===========================================
// HELPER TYPES FOR COMPONENTS
// ===========================================

// Full CA Profile with relations
export interface CAProfileFull {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  display_name: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  bio: string | null;
  tagline: string | null;
  icai_membership_number: string | null;
  firm_name: string | null;
  designation: string | null;
  years_of_experience: number;
  verification_status: VerificationStatus;
  office_address: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
  } | null;
  service_locations: string[];
  is_available: boolean;
  consultation_modes: string[];
  average_rating: number;
  total_reviews: number;
  total_clients: number;
  completed_cases: number;
  is_premium: boolean;
  slug: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  services?: CAService[];
  specializations?: CASpecialization[];
  reviews?: Review[];
}

export interface CAService {
  id: string;
  ca_id: string;
  service_type: string;
  sub_category: string | null;
  description: string | null;
  pricing_type: 'fixed' | 'hourly' | 'quote';
  base_price: number;
  currency: string;
  estimated_days: number | null;
  is_active: boolean;
}

export interface CASpecialization {
  id: string;
  ca_id: string;
  specialization: string;
}

export interface ClientProfileFull {
  id: string;
  user_id: string;
  client_type: 'individual' | 'business';
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  pan_number: string | null;
  business_name: string | null;
  business_type: string | null;
  gst_number: string | null;
  avatar_url: string | null;
  address: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
  } | null;
  total_cases: number;
  active_cases: number;
  created_at: string;
}

export interface CaseFull {
  id: string;
  case_number: string;
  ca_id: string;
  client_id: string;
  title: string;
  description: string | null;
  case_type: string;
  sub_type: string | null;
  status: CaseStatus;
  priority: CasePriority;
  deadline: string | null;
  estimated_fee: number | null;
  final_fee: number | null;
  currency: string;
  payment_status: 'unpaid' | 'partially_paid' | 'paid' | 'refunded';
  tags: string[];
  assessment_year: string | null;
  financial_year: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  ca?: CAProfileFull;
  client?: ClientProfileFull;
  tasks?: CaseTask[];
  documents?: Document[];
}

export interface CaseTask {
  id: string;
  case_id: string;
  title: string;
  description: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  due_date: string | null;
  completed_at: string | null;
  position: number;
}

export interface Document {
  id: string;
  uploaded_by: string;
  case_id: string | null;
  file_name: string;
  file_size: number | null;
  mime_type: string | null;
  storage_path: string;
  document_type: string | null;
  created_at: string;
}

export interface Conversation {
  id: string;
  participant_ids: string[];
  case_id: string | null;
  title: string | null;
  is_archived: boolean;
  last_message_at: string;
  last_message_preview: string | null;
  // Computed/joined
  participants?: Array<{
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  }>;
  unread_count?: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  message_type: 'text' | 'file' | 'system' | 'image';
  content: string | null;
  file_url: string | null;
  file_name: string | null;
  file_size: number | null;
  is_edited: boolean;
  created_at: string;
  // Joined
  sender?: {
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  };
}

export interface Appointment {
  id: string;
  ca_id: string;
  client_id: string;
  case_id: string | null;
  scheduled_at: string;
  duration_minutes: number;
  timezone: string;
  appointment_type: string;
  mode: 'online' | 'offline';
  location: string | null;
  meeting_link: string | null;
  status: AppointmentStatus;
  title: string | null;
  notes: string | null;
  created_at: string;
  // Joined
  ca?: CAProfileFull;
  client?: ClientProfileFull;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string | null;
  action_url: string | null;
  is_read: boolean;
  created_at: string;
}

export interface Review {
  id: string;
  ca_id: string;
  client_id: string;
  rating: number;
  title: string | null;
  review_text: string | null;
  communication_rating: number | null;
  expertise_rating: number | null;
  responsiveness_rating: number | null;
  value_rating: number | null;
  ca_response: string | null;
  ca_responded_at: string | null;
  created_at: string;
  // Joined
  client?: {
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  };
}

// ===========================================
// API RESPONSE TYPES
// ===========================================

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ===========================================
// FORM TYPES
// ===========================================

export interface CAOnboardingForm {
  // Step 1: Credentials
  icaiNumber: string;
  panNumber: string;
  registrationYear: string;
  bio: string;
  certificateUrl: string;
  profilePhotoUrl: string;
  panCardUrl: string;
  // Step 2: Specializations
  specializations: string[];
  experienceLevel: string;
  languages: string[];
  // Step 3: Services
  serviceAreas: string;
  consultationFee: string;
  remoteAvailable: boolean;
  availableDays: string[];
  startTime: string;
  endTime: string;
}

export interface ClientOnboardingForm {
  clientType: 'individual' | 'business';
  // Individual
  dateOfBirth?: string;
  panNumber?: string;
  // Business
  businessName?: string;
  businessType?: string;
  gstNumber?: string;
  // Common
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
}

export interface CreateCaseForm {
  client_id: string;
  title: string;
  description: string;
  case_type: string;
  sub_type?: string;
  priority: CasePriority;
  deadline?: string;
  estimated_fee?: number;
  assessment_year?: string;
  financial_year?: string;
}

export interface BookAppointmentForm {
  ca_id: string;
  scheduled_at: string;
  duration_minutes: number;
  appointment_type: string;
  mode: 'online' | 'offline';
  title?: string;
  notes?: string;
}
