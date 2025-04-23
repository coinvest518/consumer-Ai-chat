import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import ChatMessage from "./ChatMessage";
import { useChat } from "@/hooks/useChat";
import { motion } from "framer-motion";

export default function ChatInterface() {
  const [inputValue, setInputValue] = useState("");
  const { messages, sendMessage, isLoading } = useChat();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;
    
    sendMessage(inputValue);
    setInputValue("");
  };

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
        </div>

        <div className="h-96 p-4 overflow-y-auto bg-gray-50 space-y-4" id="chat-container">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-400 text-center px-4">
              <div>
                <p className="text-lg font-medium">Welcome to ConsumerAI!</p>
                <p className="mt-2">Ask me anything about consumer protection laws, credit reports, debt collection, and more.</p>
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="p-4 border-t flex items-center">
          <Input
            type="text"
            placeholder="Ask about consumer laws, credit reports, debt collection..."
            className="flex-1 border-gray-300 focus:ring-primary focus:border-primary block w-full rounded-md sm:text-sm border p-2"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={isLoading}
            className="ml-3 p-2 rounded-full h-10 w-10 flex items-center justify-center"
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
        
        <div className="p-3 bg-gray-50 border-t text-xs text-gray-500 text-center">
          Free version: 5 questions/day. <a href="/#pricing" className="text-primary hover:text-primary/90">Upgrade to Pro</a> for unlimited access.
        </div>
      </motion.div>
    </div>
  );
}
