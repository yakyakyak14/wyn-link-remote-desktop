import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          avatar: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          avatar?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          avatar?: string | null;
          updated_at?: string;
        };
      };
      sessions: {
        Row: {
          id: string;
          host_user_id: string;
          client_user_id: string | null;
          session_code: string;
          pin: string;
          access_level: 'full' | 'partial';
          allowed_apps: string[] | null;
          allowed_paths: string[] | null;
          is_active: boolean;
          expires_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          host_user_id: string;
          client_user_id?: string | null;
          session_code: string;
          pin: string;
          access_level?: 'full' | 'partial';
          allowed_apps?: string[] | null;
          allowed_paths?: string[] | null;
          is_active?: boolean;
          expires_at: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          host_user_id?: string;
          client_user_id?: string | null;
          session_code?: string;
          pin?: string;
          access_level?: 'full' | 'partial';
          allowed_apps?: string[] | null;
          allowed_paths?: string[] | null;
          is_active?: boolean;
          expires_at?: string;
          updated_at?: string;
        };
      };
      devices: {
        Row: {
          id: string;
          user_id: string;
          device_name: string;
          device_type: 'web' | 'mobile' | 'desktop' | 'extension';
          platform: string;
          is_online: boolean;
          last_seen: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          device_name: string;
          device_type: 'web' | 'mobile' | 'desktop' | 'extension';
          platform: string;
          is_online?: boolean;
          last_seen?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          device_name?: string;
          device_type?: 'web' | 'mobile' | 'desktop' | 'extension';
          platform?: string;
          is_online?: boolean;
          last_seen?: string;
        };
      };
    };
  };
};