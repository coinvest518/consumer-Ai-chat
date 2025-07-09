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
    if (!user?.id) return;
    
    const savedMessages = localStorage.getItem(`chat-messages-${user.id}`);
    if (savedMessages) {
      try {
        const parsedMessages: Message[] = JSON.parse(savedMessages).map((msg: any) => ({
          ...msg,
          timestamp: typeof msg.timestamp === 'string' ? new Date(msg.timestamp).getTime() : msg.timestamp,
        }));
        setMessages(parsedMessages);
      } catch (e) {
        console.error("Failed to parse saved messages:", e);
        localStorage.removeItem(`chat-messages-${user.id}`);
      }
    }
  }, [user]);

  // Save messages to localStorage when they change
  useEffect(() => {
    if (messages.length > 1 && user?.id) {
      localStorage.setItem(`chat-messages-${user.id}`, JSON.stringify(messages));
    }
  }, [messages, user]);

  // Fetch chat limits on mount
  useEffect(() => {
    if (!user) return;

    const fetchLimits = async () => {
      try {
        console.log('Fetching chat limits for user:', user.id);
        const metrics = await api.getChatLimits(user.id);
        console.log('Received metrics:', metrics);
        if (metrics) {
          setChatLimits({
            dailyLimit: metrics.dailyLimit || 5,
            chatsUsedToday: metrics.chatsUsed || 0,
            isProUser: metrics.isPro || false
          });
        }
      } catch (error) {
        console.error('Failed to fetch chat limits:', error);
        // If metrics don't exist yet, create them for the new user
        if (user?.id) {
          try {
            console.log('Creating initial metrics for new user:', user.id);
            await api.updateChatMetrics(user.id);
            // Set default values for new user
            setChatLimits({
              dailyLimit: 5,
              chatsUsedToday: 0,
              isProUser: false
            });
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
      setError('Daily limit reached. You\'ve used all your credits. Purchase more to continue chatting.');
      throw new Error('Credit limit reached');
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
          sessionId: messages[0]?.id || Date.now().toString(),
          userId: user?.id
        })
      });


      if (!response.ok) {
        let errorData: any = {};
        try {
          errorData = await response.json();
        } catch (jsonErr) {
          // If response is not JSON or empty, fallback to text
          try {
            const text = await response.text();
            errorData = { error: text };
          } catch {
            errorData = { error: 'Unknown error' };
          }
        }
        if (response.status === 504 || (errorData && typeof errorData === 'object' && 'isTimeout' in errorData && errorData.isTimeout)) {
          throw new Error('The AI is taking longer than expected to respond. Please try again.');
        }
        throw new Error((errorData && typeof errorData === 'object' && 'error' in errorData && errorData.error) ? errorData.error : `API request failed with status ${response.status}`);
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
        if (user?.id) {
          localStorage.setItem(`chatLimits-${user.id}`, JSON.stringify({
            dailyLimit: result.dailyLimit,
            chatsUsedToday: result.chatsUsed,
            lastUpdated: new Date().toISOString()
          }));
        }
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
    if (user?.id) {
      localStorage.removeItem(`chat-messages-${user.id}`);
    }
  }, [user]);

  // Reset chat state when user changes (new login)
  useEffect(() => {
    if (user?.id) {
      // Clear any existing messages and reset to default
      setMessages([
        {
          id: "0-ai",
          text: "Hi there! I'm your ConsumerAI assistant. I can help with questions about credit reports, debt collection, and consumer protection laws. What can I help you with today?",
          sender: "bot",
          type: "ai",
          timestamp: Date.now(),
        },
      ]);
      
      // Reset chat limits for new user session
      setChatLimits({
        dailyLimit: 5,
        chatsUsedToday: 0,
        isProUser: false
      });
    }
  }, [user?.id]);

  // Clean up old localStorage data when user changes
  useEffect(() => {
    if (user?.id) {
      // Remove old generic localStorage keys that might cause issues
      localStorage.removeItem('chat-messages');
      localStorage.removeItem('chatLimits');
      
      // Only keep data for the current user
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if ((key.startsWith('chat-messages-') || key.startsWith('chatLimits-')) && 
            !key.endsWith(user.id)) {
          // Clean up other users' data from this browser to prevent confusion
          localStorage.removeItem(key);
        }
      });
    }
  }, [user?.id]);

  // Reset counts at midnight
  useEffect(() => {
    if (!user?.id) return;
    
    const resetTime = new Date();
    resetTime.setHours(24, 0, 0, 0);
    const timeUntilReset = resetTime.getTime() - Date.now();

    const timer = setTimeout(() => {
      setChatLimits(prev => ({
        ...prev,
        chatsUsedToday: 0
      }));
      localStorage.removeItem(`chatLimits-${user.id}`);
    }, timeUntilReset);

    return () => clearTimeout(timer);
  }, [user]);

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
