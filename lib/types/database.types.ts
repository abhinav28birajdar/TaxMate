export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          display_name: string | null
          photo_url: string | null
          role: 'customer' | 'ca' | 'business'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          display_name?: string | null
          photo_url?: string | null
          role: 'customer' | 'ca' | 'business'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string | null
          photo_url?: string | null
          role?: 'customer' | 'ca' | 'business'
          created_at?: string
          updated_at?: string
        }
      }
      ca_details: {
        Row: {
          id: string
          user_id: string
          bio: string | null
          specializations: string[] | null
          consultation_rate: number | null
          is_verified: boolean
          years_experience: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          bio?: string | null
          specializations?: string[] | null
          consultation_rate?: number | null
          is_verified?: boolean
          years_experience?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          bio?: string | null
          specializations?: string[] | null
          consultation_rate?: number | null
          is_verified?: boolean
          years_experience?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      business_details: {
        Row: {
          id: string
          user_id: string
          company_name: string
          company_size: string | null
          industry: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company_name: string
          company_size?: string | null
          industry?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          company_name?: string
          company_size?: string | null
          industry?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      services: {
        Row: {
          id: string
          ca_id: string
          name: string
          description: string
          price: number
          service_type: 'fixed' | 'recurring'
          duration_minutes: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          ca_id: string
          name: string
          description: string
          price: number
          service_type: 'fixed' | 'recurring'
          duration_minutes?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          ca_id?: string
          name?: string
          description?: string
          price?: number
          service_type?: 'fixed' | 'recurring'
          duration_minutes?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          customer_id: string
          ca_id: string
          service_id: string
          booking_status: 'pending_payment' | 'confirmed' | 'completed' | 'cancelled'
          scheduled_at: string
          payment_id: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          ca_id: string
          service_id: string
          booking_status?: 'pending_payment' | 'confirmed' | 'completed' | 'cancelled'
          scheduled_at: string
          payment_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          ca_id?: string
          service_id?: string
          booking_status?: 'pending_payment' | 'confirmed' | 'completed' | 'cancelled'
          scheduled_at?: string
          payment_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          booking_id: string
          amount: number
          currency: string
          payment_status: string
          payment_method: string
          transaction_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          amount: number
          currency: string
          payment_status: string
          payment_method: string
          transaction_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          amount?: number
          currency?: string
          payment_status?: string
          payment_method?: string
          transaction_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          booking_id: string
          reviewer_id: string
          reviewee_id: string
          rating: number
          comment: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          reviewer_id: string
          reviewee_id: string
          rating: number
          comment?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          reviewer_id?: string
          reviewee_id?: string
          rating?: number
          comment?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'customer' | 'ca' | 'business'
      service_type: 'fixed' | 'recurring'
      booking_status: 'pending_payment' | 'confirmed' | 'completed' | 'cancelled'
    }
  }
}