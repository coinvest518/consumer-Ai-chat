import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Video, Phone, Loader2, Bot, ThumbsUp, ThumbsDown, Star, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface TavusConversation {
  conversation_id: string;
  conversation_url: string;
  status: string;
  created_at: string;
}

interface TavusChatbotProps {
  className?: string;
}

export default function TavusChatbot({ className = '' }: TavusChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState<TavusConversation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [conversationStartTime, setConversationStartTime] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { toast } = useToast();

  // Handle responsive design
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const createConversation = async (retryCount = 0) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/tavus/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          persona_id: import.meta.env.VITE_TAVUS_PERSONA_ID,
          conversation_name: 'ConsumerAI Customer Support',
          conversational_context: `You are a helpful customer service representative for ConsumerAI, a legal AI assistant platform that helps consumers with credit disputes, debt collection issues, and consumer protection law. 
          
You should help users with:
- Questions about the platform features and how it works
- Understanding our legal templates (FCRA, FDCPA, debt validation, inquiry disputes)
- Pricing, plans, and subscription information
- Account setup and getting started
- Technical support and troubleshooting
- General guidance on consumer law topics
- Explaining credit report disputes and debt collection rights

For users who haven't signed up yet, focus on explaining platform benefits and guiding them through the signup process. Be friendly, professional, and empathetic. If users have complex legal questions, explain how our AI chat feature and legal templates can help them once they sign up. Always maintain a supportive tone as we're helping people with potentially stressful financial and legal situations. Keep responses concise but helpful.`,
          properties: {
            enable_recording: false,
            max_call_duration: 600,
            enable_transcription: true,
            language: 'english'
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to create conversation`);
      }

      const data = await response.json();
      setConversation(data);
      
      toast({
        title: "Video Chat Ready! 🎥",
        description: "Connecting you with our AI customer support representative...",
      });
      
    } catch (err) {
      console.error('Error creating conversation:', err);
      
      if (retryCount < 2 && err instanceof Error && err.message.includes('Failed to create conversation')) {
        console.log(`Retrying conversation creation (attempt ${retryCount + 1})`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return createConversation(retryCount + 1);
      }
      
      setError(err instanceof Error ? err.message : 'Failed to start video chat. Please try again.');
      toast({
        title: "Connection Error",
        description: "Unable to start video chat. Please check your connection and try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartChat = () => {
    console.log('🚀 Button clicked! Current state:', { isOpen, conversation, isLoading });
    if (!conversation) {
      createConversation();
    }
    setIsOpen(true);
    setConversationStartTime(Date.now());
    console.log('🚀 Modal should open now, isOpen set to true');
  };

  const handleCreateConversation = () => {
    createConversation();
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
    setIsFullscreen(false);
  };

  const handleEndCall = () => {
    if (conversationStartTime) {
      const duration = Math.round((Date.now() - conversationStartTime) / 1000 / 60);
      console.log(`Conversation lasted ${duration} minutes`);
    }
    
    setConversation(null);
    setIsOpen(false);
    setIsMinimized(false);
    setIsFullscreen(false);
    setShowFeedback(true);
    
    setTimeout(() => {
      toast({
        title: "How was your experience? 💬",
        description: "Your feedback helps us improve our AI customer support.",
      });
    }, 1000);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    setIsMinimized(false);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
    setIsFullscreen(false);
  };

  const submitFeedback = async (rating: number, helpful: boolean) => {
    try {
      console.log('Feedback submitted:', { rating, helpful, conversationId: conversation?.conversation_id });
      
      setShowFeedback(false);
      toast({
        title: "Thank you! 🙏",
        description: "Your feedback has been recorded and helps us improve.",
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  // Dynamic sizing based on device and state
  const getModalSize = () => {
    if (isFullscreen) {
      return "w-full h-full max-w-none max-h-none rounded-none";
    }
    if (isMinimized) {
      return "w-80 h-60 md:w-96 md:h-72";
    }
    if (isMobile) {
      return "w-full h-[85vh] max-w-none mx-4 rounded-t-2xl";
    }
    return "w-full max-w-5xl h-[75vh] max-h-[800px]";
  };

  const getModalPosition = () => {
    if (isFullscreen) {
      return "items-center justify-center";
    }
    if (isMinimized) {
      return "items-end justify-end pr-6 pb-6";
    }
    if (isMobile) {
      return "items-end justify-center";
    }
    return "items-center justify-center";
  };

  return (
    <>
      {/* Floating Chat Button */}
      <motion.div
        className={`fixed ${isMobile ? 'bottom-4 right-4' : 'bottom-6 right-6'} z-50 ${className}`}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <div className="relative group">
          <Button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('🎯 Button onClick fired!');
              handleStartChat();
            }}
            disabled={isLoading}
            className={`rounded-full ${isMobile ? 'w-12 h-12' : 'w-16 h-16'} bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 relative z-10`}
          >
            {isLoading ? (
              <Loader2 className={`${isMobile ? 'w-5 h-5' : 'w-7 h-7'} animate-spin text-white`} />
            ) : (
              <Video className={`${isMobile ? 'w-5 h-5' : 'w-7 h-7'} text-white`} />
            )}
          </Button>
          
          {/* Pulse Animation - Behind button with pointer-events-none */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-ping opacity-20 pointer-events-none -z-10" />
          
          {/* Tooltip - Hidden on mobile */}
          {!isMobile && (
            <div className="absolute bottom-full right-0 mb-2 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap transform translate-y-1 group-hover:translate-y-0 pointer-events-none">
              Talk to Customer Support
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
            </div>
          )}
        </div>
      </motion.div>

      {/* Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex ${getModalPosition()} ${isMobile ? 'p-0' : 'p-4'}`}
          >
            <motion.div
              initial={{ 
                scale: isMobile ? 0.95 : 0.9, 
                opacity: 0,
                y: isMobile ? 50 : 0
              }}
              animate={{ 
                scale: 1, 
                opacity: 1,
                y: 0
              }}
              exit={{ 
                scale: isMobile ? 0.95 : 0.9, 
                opacity: 0,
                y: isMobile ? 50 : 0
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={`bg-white ${isMobile ? 'rounded-t-2xl' : 'rounded-2xl'} shadow-2xl overflow-hidden ${getModalSize()} flex flex-col`}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Bot className="w-6 h-6" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm md:text-base">ConsumerAI Support</h3>
                    <p className="text-xs text-blue-100">
                      {conversation ? '🟢 Connected' : isLoading ? '🟡 Connecting...' : '🔴 Disconnected'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 md:gap-2">
                  {/* Essential Controls Only - Tavus/Daily.co handles media controls */}
                  {conversation && !isMinimized && (
                    <>
                      {!isMobile && (
                        <>
                          <Button
                            onClick={toggleMinimize}
                            variant="ghost"
                            size="sm"
                            className="text-white hover:bg-white/20 w-8 h-8 p-0"
                          >
                            <Minimize2 className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={toggleFullscreen}
                            variant="ghost"
                            size="sm"
                            className="text-white hover:bg-white/20 w-8 h-8 p-0"
                          >
                            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                          </Button>
                        </>
                      )}
                      
                      <Button
                        onClick={handleEndCall}
                        variant="ghost"
                        size="sm"
                        className="bg-red-500 hover:bg-red-600 text-white w-8 h-8 p-0"
                      >
                        <Phone className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                  
                  <Button
                    onClick={handleClose}
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20 w-8 h-8 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Video Container */}
              {!isMinimized && (
                <div className="flex-1 relative bg-black overflow-hidden">
                  {error ? (
                    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <X className="w-8 h-8 text-red-500" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Connection Failed</h3>
                      <p className="text-gray-600 mb-4 text-sm max-w-sm">{error}</p>
                      <Button onClick={handleCreateConversation} disabled={isLoading} className="bg-blue-500 hover:bg-blue-600">
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Video className="w-4 h-4 mr-2" />
                        )}
                        Try Again
                      </Button>
                    </div>
                  ) : conversation?.conversation_url ? (
                    <div className="absolute inset-0 w-full h-full">
                      <iframe
                        ref={iframeRef}
                        src={conversation.conversation_url}
                        allow="camera; microphone; fullscreen; display-capture; autoplay"
                        className="w-full h-full border-0 bg-black"
                        title="Customer Support Video Chat"
                        style={{ minHeight: '400px' }}
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-gradient-to-br from-blue-900/20 to-purple-900/20">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6">
                        {isLoading ? (
                          <Loader2 className="w-10 h-10 text-white animate-spin" />
                        ) : (
                          <Video className="w-10 h-10 text-white" />
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        {isLoading ? 'Starting Video Chat...' : 'Customer Support'}
                      </h3>
                      <p className="text-white/80 mb-6 text-sm max-w-md leading-relaxed">
                        {isLoading 
                          ? 'Please wait while we connect you with our AI assistant. This may take a few seconds.'
                          : 'Connect with our AI customer support representative via secure video chat. Get instant help with your questions.'
                        }
                      </p>
                      {!isLoading && !conversation && (
                        <Button 
                          onClick={handleCreateConversation} 
                          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          <Video className="w-5 h-5 mr-2" />
                          Start Video Chat
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Footer Info - Hidden when minimized or on mobile */}
              {!isMinimized && !isMobile && (
                <div className="p-3 bg-gray-50 border-t text-center">
                  <p className="text-xs text-gray-500">
                    🔒 Secure & Private • Powered by Tavus AI • 
                    <span className="ml-1 text-blue-600 cursor-pointer hover:underline">
                      Privacy Policy
                    </span>
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback Modal */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bot className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  How was your experience?
                </h3>
                <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                  Your feedback helps us improve our AI customer support and provide better assistance.
                </p>
                
                <div className="flex justify-center gap-1 mb-6">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => submitFeedback(rating, rating >= 4)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200 transform hover:scale-110"
                    >
                      <Star 
                        className={`w-7 h-7 ${rating <= 3 ? 'text-gray-300 hover:text-yellow-400' : 'text-yellow-400 hover:text-yellow-500'} transition-colors`}
                        fill={rating <= 3 ? 'none' : 'currentColor'}
                      />
                    </button>
                  ))}
                </div>
                
                <div className="flex gap-3">
                  <Button
                    onClick={() => submitFeedback(5, true)}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                  >
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    Helpful
                  </Button>
                  <Button
                    onClick={() => submitFeedback(2, false)}
                    variant="outline"
                    className="flex-1 border-gray-300 hover:bg-gray-50"
                  >
                    <ThumbsDown className="w-4 h-4 mr-2" />
                    Not Helpful
                  </Button>
                </div>
                
                <Button
                  onClick={() => setShowFeedback(false)}
                  variant="ghost"
                  className="mt-4 text-gray-500 hover:text-gray-700"
                >
                  Skip for now
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
