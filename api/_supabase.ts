import { createClient } from '@supabase/supabase-js'

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  {
    auth: {
      persistSession: false
    }
  }
)

console.log('API Supabase client initialized with URL:', process.env.SUPABASE_URL)

// Types for our database tables
export type ChatHistoryMessage = {
  id: string
  user_id: string
  session_id: string
  message: string
  response: string
  message_type: 'chat' | 'system' | 'purchase'
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

export type UserMetrics = {
  id: string
  user_id: string
  daily_limit: number
  chats_used: number
  is_pro: boolean
  last_purchase?: string
  last_updated: string
  created_at: string
}

export type Email = {
  id: string
  user_id: string
  sender?: string
  recipients: string[]
  subject: string
  body: string
  status: 'pending' | 'sent' | 'failed'
  metadata?: Record<string, any>
  scheduled_time?: string
  created_at: string
  updated_at: string
}

export type TemplateUsage = {
  id: string
  user_id: string
  template_id: string
  credit_cost: number
  credits_remaining: number
  metadata?: Record<string, any>
  created_at: string
}

export type Purchase = {
  id: string
  user_id: string
  amount: number
  credits: number
  stripe_session_id?: string
  status: 'completed' | 'pending' | 'failed'
  metadata?: Record<string, any>
  created_at: string
}

// RPC function result types
export type UseTemplateResult = {
  id: string
  user_id: string
  template_id: string
  credit_cost: number
  credits_remaining: number
  created_at: string
}

// Database error codes
export const DB_ERRORS = {
  NOT_FOUND: 'PGRST116',
  FOREIGN_KEY_VIOLATION: '23503',
  UNIQUE_VIOLATION: '23505',
  CHECK_VIOLATION: '23514'
} as const
