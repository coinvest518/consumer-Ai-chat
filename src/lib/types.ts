import type { ChatHistoryMessage, UserMetrics, Email, TemplateUsage, Purchase } from '../../api/_supabase';

export interface Message {
  id?: string;
  text: string;
  sender: 'user' | 'bot';
  type: 'chat' | 'system' | 'purchase' | 'email' | 'user' | 'ai';  // Added 'user' and 'ai' for compatibility
  timestamp: number;
  citation?: string;
  actions?: string[];
  metadata?: Record<string, any>;
}

export interface Chat {
  id: string;
  sessionId: string;
  messages: Message[];
  title?: string;
  createdAt: Date;
  metadata?: Record<string, any>;
}

export interface AIResponse {
  text: string;
  citation?: string;
  actions?: string[];
  metadata?: Record<string, any>;
}

export interface ChatSession {
  id: string;
  sessionId: string;
  title: string;
  lastMessage: string;
  updatedAt: Date;
  messageCount: number;
  messages?: Message[];
  metadata?: Record<string, any>;
}

export interface EmailData {
  subject: string;
  body: string;
  sender?: string;
  recipients?: string[];
  scheduledTime?: string;
  metadata?: Record<string, any>;
}

export interface TemplateData extends Omit<TemplateUsage, 'user_id'> {
  templateId: string; // Alias for template_id
  creditCost: number; // Alias for credit_cost
}

export interface UserData {
  metrics: UserMetrics;
  chatHistory: ChatHistoryMessage[];
  templateUsage: TemplateUsage[];
  emails: Email[];
  purchases: Purchase[];
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
}

export interface PaymentVerificationResponse {
  paid: boolean;
  customerEmail?: string;
  sessionId: string;
  processed: boolean;
}

export interface ChatMetricsResponse {
  chatsUsed: number;
  dailyLimit: number;
  remaining: number;
  isPro: boolean;
  lastUpdated: string;
}
