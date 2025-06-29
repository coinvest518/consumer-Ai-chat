import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { fadeIn } from '@/lib/animations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { Loader2, Menu, FileText } from 'lucide-react';
import ChatList from '../components/ChatList';
import TemplateSidebar from '../components/TemplateSidebar';
import TavusChatbot from '../components/TavusChatbot';
import { useChat } from '../hooks/useChat';
import { useToast } from "@/hooks/use-toast";

interface ChatHistory {
  _id?: string;
  id: string;
  userId: string;
  messages: Array<{
    id?: string;
    text: string;
    sender: string;
    type: string;
    timestamp: number;
  }>;
  timestamp?: number;
  createdAt?: string;
  updatedAt?: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, signOut, loading: authLoading } = useAuth();
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { chatSessions } = useChat();
  const [isUpgradeLoading, setIsUpgradeLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { toast } = useToast();
  const [metrics, setMetrics] = useState({
    dailyLimit: 5,
    chatsUsed: 0,
    remaining: 5
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login', { replace: true });
      return;
    }

    const fetchChatHistory = async () => {
      try {
        if (!user) return;

        const response = await api.getChatHistory(user.id);
        setChatHistory(response || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching chat history:', err);
        setError('No chat history found. Start a new chat!');
        setChatHistory([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchMetrics = async () => {
      try {
        if (!user) return;
        
        const metricsData = await api.getChatLimits(user.id);
        setMetrics({
          dailyLimit: metricsData.dailyLimit || 5,
          chatsUsed: metricsData.chatsUsed || 0,
          remaining: (metricsData.dailyLimit || 5) - (metricsData.chatsUsed || 0)
        });
      } catch (err) {
        console.error('Error fetching metrics:', err);
      }
    };

    if (user) {
      fetchChatHistory();
      fetchMetrics();
    }
  }, [user, authLoading, navigate]);

  const handleNewChat = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate('/chat');
  };

  const handleChatClick = (chatId: string) => {
    const safeId = chatId.replace(/[^a-zA-Z0-9-]/g, '');
    navigate(`/chat/${safeId}`);
  };

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await signOut();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleGetMoreCredits = () => {
    try {
      setIsUpgradeLoading(true);
      // Redirect to the fixed Stripe payment link
      window.location.href = 'https://buy.stripe.com/9AQeYP2cUcq0eA0bIU';
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to redirect to payment page",
        variant: "destructive"
      });
    } finally {
      setIsUpgradeLoading(false);
    }
  };

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleTemplateSelect = (template: any) => {
    // Navigate to chat with the template pre-loaded
    navigate('/chat', { 
      state: { 
        template: template,
        templateContent: template.fullContent,
        templateType: template.type
      } 
    });
  };

  const refetchMetrics = async () => {
    try {
      if (!user) return;
      
      const metricsData = await api.getChatLimits(user.id);
      setMetrics({
        dailyLimit: metricsData.dailyLimit || 5,
        chatsUsed: metricsData.chatsUsed || 0,
        remaining: (metricsData.dailyLimit || 5) - (metricsData.chatsUsed || 0)
      });
    } catch (err) {
      console.error('Error fetching metrics:', err);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Card className="p-4 text-center text-red-600">
          {error}
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Template Sidebar */}
      <TemplateSidebar
        isOpen={isSidebarOpen}
        onToggle={handleSidebarToggle}
        onTemplateSelect={handleTemplateSelect}
        userCredits={metrics.remaining}
        onCreditUpdate={refetchMetrics}
      />

      <div className={`min-h-screen bg-gray-50 transition-all duration-300 ${isSidebarOpen ? 'lg:ml-96' : ''}`}>
        <div className="p-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSidebarToggle}
                  className="flex items-center gap-2"
                >
                  <Menu className="w-4 h-4" />
                  <FileText className="w-4 h-4" />
                  Templates
                </Button>
                <h1 className="text-3xl font-bold">Dashboard</h1>
              </div>
              <div className="flex gap-4">
                <Button onClick={handleNewChat}>New Chat</Button>
                <Button variant="outline" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Usage Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Questions Remaining:</span>
                    <span className="font-medium">{metrics.remaining}/{metrics.dailyLimit}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Questions Asked:</span>
                    <span className="font-medium">{metrics.chatsUsed}</span>
                  </div>
                  <div className="mt-4">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={handleGetMoreCredits}
                      disabled={isUpgradeLoading}
                    >
                      {isUpgradeLoading ? 'Processing...' : 'Get 50 More Credits ($9.99)'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Account Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{user?.email}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Chats:</span>
                    <span className="font-medium">{chatHistory.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Joined:</span>
                    <span className="font-medium">
                      {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <h2 className="text-2xl font-bold mb-4">Recent Chats</h2>
          
          {(chatHistory.length === 0 && chatSessions.length === 0) ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-8">
                <p className="text-gray-500 mb-4">You haven't started any chats yet</p>
                <Button onClick={handleNewChat}>Start Your First Chat</Button>
              </CardContent>
            </Card>
          ) : (
            <ChatList 
              sessions={chatSessions.length > 0 ? chatSessions : chatHistory.map(chat => ({
                id: chat.id,
                title: 'Chat',
                lastMessage: chat.messages[chat.messages.length - 1]?.text || '',
                updatedAt: new Date(chat.timestamp || Date.now()),
                messageCount: chat.messages.length,
                messages: chat.messages.map(msg => ({
                  ...msg,
                  type: msg.type as 'user' | 'ai',
                  sender: msg.sender as 'user' | 'bot'
                }))
              }))} 
            />
          )}
          </div>
        </div>
        
        {/* Floating Tavus Customer Support Chatbot */}
        <TavusChatbot />
      </div>
    </motion.div>
  );
};

export default Dashboard;