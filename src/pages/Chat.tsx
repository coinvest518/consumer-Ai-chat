import { motion } from "framer-motion";
import ChatInterface from "@/components/chat/ChatInterface";
import { useState, useEffect } from "react";
import { Brain, Loader2, MessageSquare } from "lucide-react";
import { useChat } from "@/hooks/useChat";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import type { Message } from "@/lib/types";

// StepIndicator and AI_STEPS are defined and used in ChatInterface.tsx for progress UI.
// If you need to customize step UI, edit them in ChatInterface.tsx.

const Chat = () => {
  const { chatId } = useParams();
  const { messages, setMessages, sendMessage, isLoading } = useChat();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [initialTemplate, setInitialTemplate] = useState<any>(null);

  // Check for template from navigation state
  useEffect(() => {
    if (location.state?.template) {
      setInitialTemplate(location.state.template);
      
      // Show a notification about the template being applied
      toast({
        title: "Template Applied",
        description: `"${location.state.template.name}" is ready to use`,
      });
    }
  }, [location.state, toast]);

  // Load existing chat if chatId exists
  useEffect(() => {
    const loadChat = async () => {
      if (!chatId || !user) return;
      try {
        const chatHistory = await api.getChatHistory(user.id);
        const currentChat = chatHistory.find(chat => chat.session_id === chatId);
        if (!currentChat) {
          throw new Error('Chat not found');
        }
        // Convert chat history format to messages format
        const messages: Message[] = [
          {
            id: currentChat.id,
            text: currentChat.message,
            sender: "user",
            type: "user",
            timestamp: new Date(currentChat.created_at).getTime(),
          },
          {
            id: `${currentChat.id}-response`,
            text: currentChat.response,
            sender: "bot",
            type: "ai",
            timestamp: new Date(currentChat.created_at).getTime() + 1,
          },
        ];
        setMessages(messages);
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
            {initialTemplate && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>{initialTemplate.name}</strong> template is ready to use
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {initialTemplate.description}
                </p>
              </div>
            )}
          </div>
          
          <ChatInterface 
            messages={messages} 
            onSendMessage={sendMessage}
            isLoading={isLoading}
            showProgress={true}
            initialTemplate={initialTemplate}
          />
        </div>
      </main>
    </motion.div>
  );
};

export default Chat;
