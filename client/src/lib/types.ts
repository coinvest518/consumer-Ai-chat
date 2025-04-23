export interface Message {
  type: "user" | "ai";
  text: string;
  citation?: string;
  actions?: string[];
  timestamp?: number;
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
