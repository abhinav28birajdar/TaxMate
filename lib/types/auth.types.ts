import { Database } from '@/lib/types/database.types';

export type UserRole = Database['public']['Enums']['user_role'] | 'any';

export interface UserProfile {
  id: string;
  email: string;
  display_name: string | null;
  photo_url: string | null;
  role: Database['public']['Enums']['user_role'] | null;
  created_at?: string;
  updated_at?: string;
  is_verified?: boolean;
  consultation_rate?: number;
  bio?: string;
  specializations?: string[];
  company_name?: string;
  company_size?: string;
  industry?: string;
}