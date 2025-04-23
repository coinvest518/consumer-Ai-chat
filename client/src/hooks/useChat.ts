import { useState, useEffect, useCallback } from "react";
import { Message, AIResponse } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      type: "ai",
      text: "Hi there! I'm your ConsumerAI assistant. I can help with questions about credit reports, debt collection, and consumer protection laws. What can I help you with today?",
      timestamp: Date.now(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Load messages from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem("chat-messages");
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (e) {
        console.error("Failed to parse saved messages:", e);
      }
    }
  }, []);

  // Save messages to localStorage when they change
  useEffect(() => {
    if (messages.length > 1) {
      localStorage.setItem("chat-messages", JSON.stringify(messages));
    }
  }, [messages]);

  const sendMessage = useCallback(
    async (text: string) => {
      setIsLoading(true);
      
      // Add user message immediately
      const userMessage: Message = {
        type: "user",
        text,
        timestamp: Date.now(),
      };
      
      setMessages((prev) => [...prev, userMessage]);

      try {
        // Send to API
        const response = await apiRequest("POST", "/api/chat", { message: text });
        const data: AIResponse = await response.json();
        
        // Add AI response
        const aiMessage: Message = {
          type: "ai",
          text: data.text,
          citation: data.citation,
          actions: data.actions,
          timestamp: Date.now(),
        };
        
        setMessages((prev) => [...prev, aiMessage]);
      } catch (error) {
        console.error("Error sending message:", error);
        toast({
          title: "Error",
          description: "Failed to get a response. Please try again.",
          variant: "destructive",
        });
        
        // Add fallback AI response on error
        const fallbackMessage: Message = {
          type: "ai",
          text: "I'm sorry, I'm having trouble processing your request right now. Please try again in a moment.",
          timestamp: Date.now(),
        };
        
        setMessages((prev) => [...prev, fallbackMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  const clearChat = useCallback(() => {
    setMessages([
      {
        type: "ai",
        text: "Hi there! I'm your ConsumerAI assistant. I can help with questions about credit reports, debt collection, and consumer protection laws. What can I help you with today?",
        timestamp: Date.now(),
      },
    ]);
    localStorage.removeItem("chat-messages");
  }, []);

  return {
    messages,
    sendMessage,
    clearChat,
    isLoading,
  };
}
