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
      user_metrics: {
        Row: {
          id: string
          user_id: string
          created_at: string
          questions_asked?: number
          questions_remaining?: number
          is_pro?: boolean
          updated_at?: string
        }
        Insert: {
          id?: string
          user_id: string
          created_at?: string
          questions_asked?: number
          questions_remaining?: number
          is_pro?: boolean
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          created_at?: string
          questions_asked?: number
          questions_remaining?: number
          is_pro?: boolean
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
      [_ in never]: never
    }
  }
}
