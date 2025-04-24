export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  type: 'user' | 'ai';
  citation?: string;
  actions?: string[];
  timestamp: number;
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
}
