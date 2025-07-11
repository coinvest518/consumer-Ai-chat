import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Brain, MessageSquare, CheckCircle, XCircle, Circle, PlusCircle, Mail, CreditCard, TrendingUp, Building, DollarSign, Bot, Database, Mic, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import ChatMessage from "./ChatMessage";
import { useChat } from "@/hooks/useChat";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Message } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Dialog, 
  DialogTrigger, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { v4 as uuidv4 } from "uuid";

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string) => Promise<void>;
  isLoading: boolean;
  showProgress?: boolean;
  initialTemplate?: any;
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

export default function ChatInterface({ messages, onSendMessage, isLoading, showProgress, initialTemplate }: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { 
    sendMessage, 
    error,
    chatLimits,
    clearChat,
    setMessages
  } = useChat();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<keyof typeof AI_STEPS | null>(null);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [emailForm, setEmailForm] = useState({
    subject: "",
    body: ""
  });

  // Initialize input with template content if provided
  useEffect(() => {
    if (initialTemplate && initialTemplate.fullContent && !inputValue) {
      setInputValue(initialTemplate.fullContent);
    }
  }, [initialTemplate, inputValue]);
  
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
  const isLimitReached = !chatLimits.isProUser && chatLimits.chatsUsedToday >= chatLimits.dailyLimit;

  // Add clear chat button in header
  const handleClearChat = () => {
    clearChat();
    toast({
      title: "Chat Cleared",
      description: "Your chat history has been cleared"
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    // Prevent submission if limit reached
    if (isLimitReached) {
      toast({
        title: "Daily Limit Reached",
        description: "You've used all your credits. Purchase more to continue chatting.",
        variant: "destructive"
      });
      return;
    }

    const messageText = inputValue;
    setInputValue("");

    try {
      setCurrentStep("understanding");
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setCurrentStep("processing");
      await onSendMessage(messageText);
      
      setCurrentStep("generating");
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setCurrentStep(null);
    } catch (error: any) {
      console.error("Chat error:", error);
      
      toast({
        title: "Error",
        description: error.message || "Failed to send message. Please try again.",
        variant: "destructive"
      });

      // Add the unsent message back to the input
      setInputValue(messageText);
    } finally {
      setCurrentStep(null);
    }
  };

  const handleEmailSubmit = async () => {
    if (!emailForm.subject.trim() || !emailForm.body.trim()) {
      toast({
        title: "Incomplete form",
        description: "Please provide both subject and body for the email",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setCurrentStep('processing');
      setProgress(33);
      
      // Create email message with proper metadata
      const newMessage: Message = {
        id: uuidv4(),
        text: "Email for analysis",
        sender: 'user',
        type: 'email',
        timestamp: Date.now(),
        metadata: {
          emailMetadata: {
            subject: emailForm.subject,
            body: emailForm.body,
            sender: user?.email || '',
            recipients: []
          }
        }
      };

      // Add message to chat
      const updatedMessages = [...messages, newMessage];
      setMessages(updatedMessages);
      
      // Send through chat flow
      await onSendMessage(JSON.stringify({
        type: 'email',
        subject: emailForm.subject,
        body: emailForm.body
      }));
      
      // Reset form and close dialog
      setEmailForm({
        subject: "",
        body: ""
      });
      setIsDialogOpen(false);
      
      setCurrentStep(null);
      setProgress(100);
      
      toast({
        title: "Email Added",
        description: "Your email has been added to the chat for processing",
      });
    } catch (error) {
      console.error('Error processing email:', error);
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
    if (chatLimits.isProUser) {
      return <div className="text-sm text-gray-500">Pro User: Unlimited Access</div>;
    }

    return (
      <div className="p-4 text-center">
        <div className="text-sm text-gray-600">
          {!isLimitReached ? (
            `${remainingChats} credit${remainingChats !== 1 ? 's' : ''} remaining`
          ) : (
            <div className="text-red-500">
              Daily limit reached. You've used all your credits.
            </div>
          )}
        </div>
        {(remainingChats <= 2 || isLimitReached) && (
          <Button 
            variant="default" 
            className="mt-2"
            onClick={() => window.location.href = 'https://consumer-ai.vercel.app/dashboard'}
          >
            Get 50 More Credits
          </Button>
        )}
      </div>
    );
  };

  console.log("ChatInterface received messages:", messages);

  const serviceLinks = [
    {
      name: "Tradeline Supply",
      description: "Authorized User Tradelines",
      icon: CreditCard,
      url: "https://www.tkqlhce.com/click-101325994-13520451",
      color: "bg-blue-500 hover:bg-blue-600"
    },
    {
      name: "Ava Finance",
      description: "Build Credit Fast",
      icon: TrendingUp,
      url: "https://meetava.sjv.io/anDyvY",
      color: "bg-purple-500 hover:bg-purple-600"
    },
    {
      name: "Notion AI",
      description: "Smart Workspace",
      icon: Bot,
      url: "https://affiliate.notion.so/5bs3ysbrqs3b-4y5a7",
      color: "bg-gray-800 hover:bg-gray-900"
    },
    {
      name: "Bright Data",
      description: "Web Data Platform",
      icon: Database,
      url: "https://brightdata.com",
      color: "bg-green-500 hover:bg-green-600"
    },
    {
      name: "ElevenLabs",
      description: "AI Voice Generation",
      icon: Mic,
      url: "https://try.elevenlabs.io/2dh4kqbqw25i",
      color: "bg-indigo-500 hover:bg-indigo-600"
    },
    {
      name: "Kikoff",
      description: "Credit Building",
      icon: CreditCard,
      url: "https://kikoff.com/refer/67PP77ZH",
      color: "bg-pink-500 hover:bg-pink-600"
    }
  ];

  const creditBuildingLinks = [
    {
      name: "Brigit",
      description: "Get $15 Free",
      icon: DollarSign,
      url: "https://brigit.app.link/cpFcNVSajub",
      color: "bg-orange-500 hover:bg-orange-600"
    },
    {
      name: "Grow Credit",
      description: "Build Credit History",
      icon: TrendingUp,
      url: "https://growcredit.com",
      color: "bg-teal-500 hover:bg-teal-600"
    },
    {
      name: "Credit Strong",
      description: "Credit Building Loans",
      icon: Building,
      url: "https://www.creditstrong.com",
      color: "bg-cyan-500 hover:bg-cyan-600"
    },
    {
      name: "RentReporter",
      description: "Special Discount",
      icon: BadgeCheck,
      url: "https://prf.hn/click/camref:1101l3G9fN",
      color: "bg-rose-500 hover:bg-rose-600"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto relative space-y-6">
      {/* Services Section */}
      <div className="bg-white rounded-lg shadow-xl p-6">
        <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">
          Recommended Financial Services
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {serviceLinks.map((service, index) => (
            <a
              key={index}
              href={service.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`${service.color} text-white rounded-lg p-4 transition-transform hover:scale-105 flex flex-col items-center text-center space-y-2`}
            >
              <service.icon className="h-8 w-8 mb-2" />
              <span className="font-semibold">{service.name}</span>
              <span className="text-sm opacity-90">{service.description}</span>
            </a>
          ))}
        </div>
        
        <h3 className="text-xl font-semibold mb-4 text-center text-gray-800">
          Credit Building Tools
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {creditBuildingLinks.map((tool, index) => (
            <a
              key={index}
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`${tool.color} text-white rounded-lg p-4 transition-transform hover:scale-105 flex flex-col items-center text-center space-y-2`}
            >
              <tool.icon className="h-6 w-6 mb-1" />
              <span className="font-semibold">{tool.name}</span>
              <span className="text-sm opacity-90">{tool.description}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Existing Chat Interface */}
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
          )
          }
          {currentStep && AI_STEPS[currentStep] && (
            <div className={`flex items-center gap-2 p-3 bg-gray-100 rounded-lg border-l-4 ${AI_STEPS[currentStep].color}`}>
              {(() => {
                const Icon = AI_STEPS[currentStep].icon;
                return <Icon className="w-4 h-4 animate-spin" />;
              })()}
              <div className="flex flex-col text-left">
                <span className="text-sm font-semibold">{AI_STEPS[currentStep].title}</span>
                <span className="text-xs text-gray-600">{AI_STEPS[currentStep].description}</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="p-4 border-t">
          <div className="flex items-center gap-4 w-full">
            <div className="flex-1">
              <Input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isLimitReached}
                placeholder={
                  isLimitReached 
                    ? "Daily limit reached. Purchase more credits to continue."
                    : "Ask about consumer laws, credit reports, debt collection..."
                }
                className="w-full"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="p-2 rounded-full h-10 w-10 flex items-center justify-center shrink-0"
                    disabled={isLimitReached}
                    title="Add Email"
                  >
                    <Mail className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Email to Chat</DialogTitle>
                    <DialogDescription>
                      Paste an email you want the AI to analyze or process.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email Subject</label>
                      <Input
                        value={emailForm.subject}
                        onChange={(e) => setEmailForm({...emailForm, subject: e.target.value})}
                        placeholder="Enter email subject"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email Body</label>
                      <Textarea
                        value={emailForm.body}
                        onChange={(e) => setEmailForm({...emailForm, body: e.target.value})}
                        placeholder="Paste the email content here"
                        rows={8}
                      />
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleEmailSubmit}>Process Email</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <Button
                type="submit"
                className="p-2 rounded-full h-10 w-10 flex items-center justify-center shrink-0"
                disabled={isLimitReached || !inputValue.trim()}
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </form>
        
        {renderLimitStatus()}
      </motion.div>
    </div>
  );
}
