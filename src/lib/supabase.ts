import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          bio: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          username: string;
          bio?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          bio?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
      };
      questions: {
        Row: {
          id: string;
          content: string;
          author_id: string | null;
          recipient_id: string;
          answer: string | null;
          is_answered: boolean;
          is_anonymous: boolean;
          likes_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          content: string;
          author_id?: string | null;
          recipient_id: string;
          answer?: string | null;
          is_answered?: boolean;
          is_anonymous?: boolean;
          likes_count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          content?: string;
          author_id?: string | null;
          recipient_id?: string;
          answer?: string | null;
          is_answered?: boolean;
          is_anonymous?: boolean;
          likes_count?: number;
          created_at?: string;
        };
      };
      likes: {
        Row: {
          id: string;
          user_id: string;
          question_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          question_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          question_id?: string;
          created_at?: string;
        };
      };
    };
  };
}
