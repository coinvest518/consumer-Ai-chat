import { motion } from "framer-motion";
import ChatInterface from "@/components/chat/ChatInterface";
import { useState, useEffect } from "react";
import { Brain, Loader2, MessageSquare } from "lucide-react";
import { useChat } from "@/hooks/useChat";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

interface StepIndicator {
  icon: typeof Brain | typeof Loader2 | typeof MessageSquare;
  title: string;
  description: string;
  color: string;
}

const AI_STEPS: Record<string, StepIndicator> = {
  understanding: {
    icon: Brain,
    title: "Understanding Query",
    description: "Analyzing your question",
    color: "border-blue-500 text-blue-500"
  },
  processing: {
    icon: Loader2,
    title: "Processing",
    description: "Searching knowledge base",
    color: "border-purple-500 text-purple-500"
  },
  generating: {
    icon: MessageSquare,
    title: "Generating Response",
    description: "Crafting detailed answer",
    color: "border-green-500 text-green-500"
  }
};

const Chat = () => {
  const { chatId } = useParams();
  const { messages, setMessages, sendMessage, isLoading } = useChat();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  // Load existing chat if chatId exists
  useEffect(() => {
    const loadChat = async () => {
      if (!chatId) return;
      try {
        const chat = await api.getChat(chatId);
        setMessages(chat.messages);
      } catch (error) {
        console.error('Error loading chat:', error);
        toast({
          title: 'Error',
          description: 'Failed to load chat history',
          variant: 'destructive',
        });
      }
    };

    loadChat();
  }, [chatId, setMessages, toast]);

  // Redirect if not authenticated
  if (!user) {
    navigate('/login');
    return null;
  }

  const handleDashboardClick = () => {
    navigate('/dashboard');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen flex flex-col bg-gray-50"
    >
      <header className="w-full bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button
            variant="ghost"
            onClick={handleDashboardClick}
            className="flex items-center gap-2"
          >
            ← Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="flex-grow py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Ask ConsumerAI
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Get answers to your consumer law questions instantly.
            </p>
          </div>
          
          <ChatInterface 
            messages={messages} 
            onSendMessage={sendMessage}
            isLoading={isLoading}
            showProgress={true}
          />
        </div>
      </main>
    </motion.div>
  );
};

export default Chat;
