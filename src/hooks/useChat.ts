import { useState, useEffect, useCallback } from "react";
import { Message, ChatSession, ChatHistory } from "@/lib/types";
import type { ChatHistoryMessage } from "../../api/_supabase";
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
        if (metrics) {
          console.log('Received metrics:', metrics);
          setChatLimits({
            dailyLimit: metrics.daily_limit || 5,
            chatsUsedToday: metrics.chats_used || 0,
            isProUser: metrics.is_pro || false
          });
        } else {
          // Fallback to default limits
          console.log('No metrics received, using defaults');
          setChatLimits({ dailyLimit: 5, chatsUsedToday: 0, isProUser: false });
        }
      } catch (error: any) {
        console.error('Failed to fetch chat limits:', error);
        
        // Always set default limits on error to avoid blocking the app
        setChatLimits({ dailyLimit: 5, chatsUsedToday: 0, isProUser: false });
        
        // Only show error for non-API connectivity issues
        if (error?.message && !error.message.includes('404') && !error.message.includes('fetch')) {
          setError("Couldn't load your usage data. Using default limits for now.");
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
        message: messages.filter(m => m.id !== "0-ai").map(m => m.text).join('\n'), // Combine messages as a single string
        response: messages.filter(m => m.sender === "bot" && m.id !== "0-ai").map(m => m.text).join('\n') // Combine bot responses
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
            const errorText = await response.text();
            // Check if the server returned an HTML page, which is a common sign of a server-side error.
            if (errorText.trim().startsWith('<!DOCTYPE') || errorText.trim().startsWith('<html')) {
              errorData = { error: `Server Error: Received an HTML page instead of JSON. Status: ${response.status}` };
            } else {
              errorData = { error: errorText || 'The server returned an empty error response.' };
            }
          } catch {
            errorData = { error: `API request failed with status ${response.status}` };
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
          dailyLimit: result.dailyLimit || prev.dailyLimit // This line is correct if result comes from ChatResponse, but if you use UserMetrics, use daily_limit
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
        
        // Group ChatHistoryMessage[] by session_id to create ChatSession[]
        const sessionMap = new Map<string, ChatSession>();
        
        response.forEach((chatMessage: ChatHistoryMessage) => {
          const sessionId = chatMessage.session_id;
          
          if (!sessionMap.has(sessionId)) {
            const newSession: ChatSession = {
              id: sessionId,
              sessionId: sessionId,
              title: 'Chat Session',
              lastMessage: '',
              updatedAt: new Date(chatMessage.created_at),
              messageCount: 0,
              messages: []
            };
            sessionMap.set(sessionId, newSession);
          }
          
          const session = sessionMap.get(sessionId)!;
          
          // Add user message
          if (session.messages) {
            session.messages.push({
              id: `${chatMessage.id}-user`,
              text: chatMessage.message,
              sender: 'user',
              type: 'user',
              timestamp: new Date(chatMessage.created_at).getTime(),
              metadata: chatMessage.metadata
            });
            
            // Add bot response
            session.messages.push({
              id: `${chatMessage.id}-bot`,
              text: chatMessage.response,
              sender: 'bot',
              type: 'ai',
              timestamp: new Date(chatMessage.created_at).getTime() + 1,
              metadata: chatMessage.metadata
            });
          }
          
          session.messageCount = session.messages?.length || 0;
          session.lastMessage = chatMessage.response || chatMessage.message;
          session.updatedAt = new Date(chatMessage.updated_at || chatMessage.created_at);
        });
        
        const sessions = Array.from(sessionMap.values()).sort((a, b) => 
          b.updatedAt.getTime() - a.updatedAt.getTime()
        );
        
        setChatSessions(sessions);
      } catch (error: any) {
        if (error instanceof SyntaxError && error.message.includes("Unexpected token '<'")) {
          console.error('Error fetching chat sessions: The server returned an HTML error page instead of JSON. This is a server-side issue.', error);
          setError("Could not load your chat history due to a server problem.");
        } else {
          console.error('Error fetching chat sessions:', error);
          setError("Could not load your chat history.");
        }
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
