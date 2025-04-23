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

// User metrics type
export interface UserMetrics {
  userId: string;
  questionsAsked: number;
  questionsRemaining: number;
  isPro: boolean;
  createdAt: string;
  updatedAt: string;
}