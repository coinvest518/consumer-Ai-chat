// Define shared types for server

// AI response type
export interface AIResponse {
  text: string;
  citation?: string;
  actions?: string[];
}

// Message type for chat history
export interface ChatMessage {
  type: "user" | "ai" | "system";
  text: string;
  citation?: string;
  actions?: string[];
  title?: string; // Used for naming chat sessions
  timestamp?: string;
}

// User metrics type - aligned with frontend expectations
export interface UserMetrics {
  id: string;
  user_id: string;
  daily_limit: number;
  chats_used: number;
  is_pro: boolean;
  last_updated: string;
  created_at: string;
}

// Legacy user metrics type for Astra DB (backwards compatibility)
export interface LegacyUserMetrics {
  userId: string;
  questionsAsked: number;
  questionsRemaining: number;
  isPro: boolean;
  createdAt: string;
  updatedAt: string;
}

// Add email-related types
export interface EmailMessage {
  _id?: string;
  userId: string;           // Links to existing user
  sender: string;           // Email sender address
  recipients: string[];     // List of recipient addresses
  subject: string;          // Email subject
  body: string;             // Email content
  timestamp: string;        // When the email was received/sent
  isRead: boolean;          // Whether the email has been read
  labels?: string[];        // Optional categorization
  metadata?: any;           // Additional email data
}

// For scheduled/future emails
export interface ScheduledEmail {
  _id?: string;
  userId: string;           // Links to existing user
  recipients: string[];     // Recipients to send to
  subject: string;          // Email subject
  body: string;             // Email content  
  scheduledTime: string;    // When to send the email
  status: 'scheduled' | 'sent' | 'failed';  // Status tracking
  createdAt: string;        // Creation timestamp
  updatedAt: string;        // Last update timestamp
}