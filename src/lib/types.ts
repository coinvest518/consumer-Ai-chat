export interface Message {
  id?: string;
  text: string;
  sender: 'user' | 'bot';
  type: 'user' | 'ai' | 'email';
  timestamp: number;
  citation?: string;
  actions?: string[];
  emailMetadata?: {
    subject: string;
    body: string;
    sender?: string;
    recipients?: string[];
    isProcessed?: boolean;
  };
}

export interface Chat {
  id: string;
  messages: Message[];
  title?: string;
  createdAt: Date;
}

export interface AIResponse {
  text: string;
  citation?: string;
  actions?: string[];
}

export interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  updatedAt: Date;
  messageCount: number;
  messages?: Message[];
}

export interface ChatHistory {
  id: string;
  userId: string;
  messages: {
    id?: string;
    text: string;
    sender: 'user' | 'bot';
    type: string;
    timestamp: number;
  }[];
  timestamp?: number;
  title?: string;
}
