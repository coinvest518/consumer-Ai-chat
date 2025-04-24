import { motion } from "framer-motion";
import ChatInterface from "@/components/chat/ChatInterface";
import { useState } from "react";
import { Brain, Loader2, MessageSquare } from "lucide-react";
import { useChat } from "@/hooks/useChat";

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
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen flex flex-col bg-gray-50"
    >
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
          
          <ChatInterface />
        </div>
      </main>
    </motion.div>
  );
};

export default Chat;
