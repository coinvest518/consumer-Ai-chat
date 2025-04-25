import { useState, useEffect, useCallback } from "react";
import { Message, ChatSession, ChatHistory } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { api } from '@/lib/api';
import { API_BASE_URL } from '@/lib/config';

interface ChatLimits {
  dailyLimit: number;
  chatsUsedToday: number;
  isProUser: boolean;
}

interface ChatResponse {
  text: string;
  chatsUsed: number;
  dailyLimit: number;
  remaining: number;
  citation?: string;
  actions?: string[];
}

export function useChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "0-ai",
      text: "Hi there! I'm your ConsumerAI assistant. I can help with questions about credit reports, debt collection, and consumer protection laws. What can I help you with today?",
      sender: "bot",
      type: "ai",
      timestamp: Date.now(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatLimits, setChatLimits] = useState<ChatLimits>({
    dailyLimit: 5,
    chatsUsedToday: 0,
    isProUser: false
  });
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);

  // Load messages from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem("chat-messages");
    if (savedMessages) {
      try {
        const parsedMessages: Message[] = JSON.parse(savedMessages).map((msg: any) => ({
          ...msg,
          timestamp: typeof msg.timestamp === 'string' ? new Date(msg.timestamp).getTime() : msg.timestamp,
        }));
        setMessages(parsedMessages);
      } catch (e) {
        console.error("Failed to parse saved messages:", e);
        localStorage.removeItem("chat-messages");
      }
    }
  }, []);

  // Save messages to localStorage when they change
  useEffect(() => {
    if (messages.length > 1) {
      localStorage.setItem("chat-messages", JSON.stringify(messages));
    }
  }, [messages]);

  // Fetch chat limits on mount
  useEffect(() => {
    if (!user) return;

    const fetchLimits = async () => {
      try {
        const metrics = await api.getChatLimits();
        if (metrics) {
          setChatLimits({
            dailyLimit: metrics.dailyLimit || 5,
            chatsUsedToday: metrics.chatsUsed || 0,
            isProUser: metrics.isPro || false
          });
        }
      } catch (error) {
        console.error('Failed to fetch chat limits:', error);
        // If metrics don't exist yet, we'll use defaults and create them
        if (user?.id) {
          try {
            await api.updateChatMetrics(user.id);
          } catch (err) {
            console.error('Failed to create initial metrics:', err);
          }
        }
      }
    };

    fetchLimits();
  }, [user]);

  const updateChatMetrics = async () => {
    if (!user?.id) return;
    
    try {
      await api.updateChatMetrics(user.id);
      // Save chat history with proper structure
      await api.saveChat({
        userId: user.id,
        messages: messages.filter(m => m.id !== "0-ai") // Don't save welcome message
      });
    } catch (error) {
      console.error('Error updating chat metrics:', error);
    }
  };

  const sendMessage = useCallback(async (userInput: string) => {
    if (!userInput.trim()) return;

    if (!chatLimits.isProUser && chatLimits.chatsUsedToday >= chatLimits.dailyLimit) {
      setError('You have reached your daily limit. Please upgrade to Pro to continue chatting.');
      throw new Error('Daily chat limit reached');
    }

    const userMessage: Message = {
      id: Date.now().toString() + '-user',
      text: userInput,
      sender: "user",
      type: "user",
      timestamp: Date.now()
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          message: userInput,
          sessionId: messages[0]?.id || Date.now().toString()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 504 || errorData.isTimeout) {
          throw new Error('The AI is taking longer than expected to respond. Please try again.');
        }
        throw new Error(`API request failed with status ${response.status}`);
      }

      const result = await response.json() as ChatResponse;
      
      // Validate the response format
      if (!result || typeof result.text !== 'string') {
        throw new Error('Invalid response format from server');
      }

      const botMessage: Message = {
        id: Date.now().toString() + '-bot',
        text: result.text,
        sender: "bot",
        type: "ai",
        timestamp: Date.now(),
        citation: result.citation,
        actions: result.actions
      };

      setMessages((prevMessages) => [...prevMessages, botMessage]);

      // Update chat count with server response
      if (typeof result.chatsUsed === 'number') {
        setChatLimits(prev => ({
          ...prev,
          chatsUsedToday: result.chatsUsed,
          dailyLimit: result.dailyLimit || prev.dailyLimit
        }));

        // Update localStorage
        localStorage.setItem('chatLimits', JSON.stringify({
          dailyLimit: result.dailyLimit,
          chatsUsedToday: result.chatsUsed,
          lastUpdated: new Date().toISOString()
        }));
      }

      // Update metrics after successful message
      await updateChatMetrics();

    } catch (err: any) {
      console.error("Error sending message:", err);
      setError(err.message || "An unexpected error occurred");
      
      // Add a fallback error message to the chat
      const errorMessage: Message = {
        id: Date.now().toString() + '-error',
        text: "I apologize, but I encountered an error processing your request. Please try again.",
        sender: "bot",
        type: "ai",
        timestamp: Date.now()
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [chatLimits, messages, updateChatMetrics]);

  const clearChat = useCallback(() => {
    setMessages([
      {
        id: "0-ai",
        text: "Hi there! I'm your ConsumerAI assistant. I can help with questions about credit reports, debt collection, and consumer protection laws. What can I help you with today?",
        sender: "bot",
        type: "ai",
        timestamp: Date.now(),
      },
    ]);
    localStorage.removeItem("chat-messages");
  }, []);

  // Reset counts at midnight
  useEffect(() => {
    const resetTime = new Date();
    resetTime.setHours(24, 0, 0, 0);
    const timeUntilReset = resetTime.getTime() - Date.now();

    const timer = setTimeout(() => {
      setChatLimits(prev => ({
        ...prev,
        chatsUsedToday: 0
      }));
      localStorage.removeItem('chatLimits');
    }, timeUntilReset);

    return () => clearTimeout(timer);
  }, []);

  const updateMessages = useCallback((newMessages: Message[]) => {
    console.log("Setting messages:", newMessages);
    setMessages(newMessages);
  }, []);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        if (!user?.id) return;
        const response = await api.getChatHistory(user.id);
        // Transform the chat history into ChatSession format
        const sessions = response.map((chat: ChatHistory) => ({
          id: chat.id,
          title: chat.title || 'Chat',
          lastMessage: chat.messages[chat.messages.length - 1]?.text || '',
          updatedAt: new Date(chat.timestamp || Date.now()),
          messageCount: chat.messages.length,
          messages: chat.messages
        }));
        setChatSessions(sessions);
      } catch (error) {
        console.error('Error fetching chat sessions:', error);
        setChatSessions([]);
      }
    };
    
    fetchChats();
  }, [user]);

  return {
    messages,
    setMessages: updateMessages,
    sendMessage,
    clearChat,
    isLoading,
    error,
    chatLimits,
    chatSessions
  };
}
