import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Brain, MessageSquare, CheckCircle, XCircle, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import ChatMessage from "./ChatMessage";
import { useChat } from "@/hooks/useChat";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Message } from "@/lib/types";

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string) => Promise<void>;
  isLoading: boolean;
  showProgress?: boolean;
}

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

export default function ChatInterface({ messages, onSendMessage, isLoading, showProgress }: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState("");
  const { 
    sendMessage, 
    error,     // Add usage for error
    chatLimits,
    clearChat  // Add usage for clearChat
  } = useChat();
  const [currentStep, setCurrentStep] = useState<keyof typeof AI_STEPS | null>(null);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Reset thinking state when no message is being processed
  useEffect(() => {
    if (!isLoading) {
      setCurrentStep(null);
      setProgress(0);
    }
  }, [isLoading]);

  // Add error display
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive"
      });
    }
  }, [error, toast]);

  const remainingChats = chatLimits.dailyLimit - chatLimits.chatsUsedToday;

  // Add clear chat button in header
  const handleClearChat = () => {
    clearChat();
    toast({
      title: "Chat Cleared",
      description: "Your chat history has been cleared"
    });
    navigate('/dashboard');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const messageText = inputValue;
    setInputValue("");

    try {
      // Show progress steps
      setCurrentStep('understanding');
      setProgress(0);
      await new Promise(r => setTimeout(r, 1000));
      
      setCurrentStep('processing');
      setProgress(33);
      await new Promise(r => setTimeout(r, 1000));
      
      setCurrentStep('generating');
      setProgress(66);
      
      // Send actual message
      await onSendMessage(messageText);
      
      setProgress(100);
      setCurrentStep(null);
      
    } catch (error) {
      console.error('Error:', error);
      setCurrentStep(null);
      setProgress(0);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  const renderLimitStatus = () => {
    const remaining = chatLimits.dailyLimit - chatLimits.chatsUsedToday;
    
    if (chatLimits.isProUser) {
      return <div className="text-sm text-gray-500">Pro User: Unlimited Access</div>;
    }

    return (
      <div className="p-4 text-center">
        <div className="text-sm text-gray-600">
          {remaining > 0 ? (
            `${remaining} free messages remaining today`
          ) : (
            <div className="text-red-500">
              Daily limit reached. Resets at midnight.
            </div>
          )}
        </div>
        {remaining <= 2 && (
          <Button 
            variant="default" 
            className="mt-2"
            onClick={() => window.location.href = 'https://buy.stripe.com/9AQeYP2cUcq0eA0bIU'}
          >
            Upgrade to Pro for Unlimited Access
          </Button>
        )}
      </div>
    );
  };

  console.log("ChatInterface received messages:", messages);

  return (
    <div className="max-w-3xl mx-auto relative">
      <motion.div 
        className="bg-white rounded-lg shadow-xl overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="p-4 bg-primary text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            <span className="font-medium text-lg">ConsumerAI Assistant</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex h-2 w-2 rounded-full bg-green-400"></span>
            <span className="text-sm">Online</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearChat}
            className="text-white hover:text-white/80"
          >
            Clear Chat
          </Button>
        </div>

        <div className="h-96 p-4 overflow-y-auto bg-gray-50 space-y-4" id="chat-container">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500">No messages yet</div>
          ) : (
            messages.map((message, index) => (
              <ChatMessage key={message.id || index} message={message} />
            ))
          )}
          {currentStep && (
            <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm text-gray-600">
                {currentStep === 'understanding' && "Understanding your question..."}
                {currentStep === 'processing' && "Processing information..."}
                {currentStep === 'generating' && "Generating response..."}
              </span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="p-4 border-t flex items-center">
          <Input
            type="text"
            className="flex-1 border-gray-300 focus:ring-primary focus:border-primary block w-full rounded-md sm:text-sm border p-2"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={!chatLimits.isProUser && chatLimits.chatsUsedToday >= chatLimits.dailyLimit}
            placeholder={
              chatLimits.chatsUsedToday >= chatLimits.dailyLimit 
                ? "Daily limit reached. Please upgrade to continue."
                : "Ask about consumer laws, credit reports, debt collection..."
            }
          />
          <Button
            type="submit"
            className="ml-3 p-2 rounded-full h-10 w-10 flex items-center justify-center"
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
        
        {renderLimitStatus()}
      </motion.div>
    </div>
  );
}
