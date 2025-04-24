import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { fadeIn } from '@/lib/animations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiRequest } from '@/lib/queryClient';
import { Loader2 } from 'lucide-react';

interface ChatHistory {
  id: string;
  userId: string;
  title: string;
  messages: any[];
  createdAt: string;
  updatedAt: string;
}

const Dashboard = () => {
  const [location, navigate] = useLocation();
  const { user, signOut } = useAuth();
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        if (!user) return;

        // Use the API endpoint for Astra DB
        const response = await apiRequest.get(`/api/chat-history/${user.id}`);
        setChatHistory(response.data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching chat history:', err);
        setError('Failed to load chat history');
        setChatHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchChatHistory();
  }, [user]);

  const handleNewChat = () => {
    navigate('/chat');
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
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
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Dashboard</h1>
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
                    <span className="text-gray-600">Questions Remaining Today:</span>
                    <span className="font-medium">5/5</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Account Type:</span>
                    <span className="font-medium">Free Tier</span>
                  </div>
                  <div className="mt-4">
                    <Button variant="outline" className="w-full">
                      Upgrade to Pro
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
          
          {chatHistory.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-8">
                <p className="text-gray-500 mb-4">You haven't started any chats yet</p>
                <Button onClick={handleNewChat}>Start Your First Chat</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {chatHistory.map((chat) => (
                <Card 
                  key={chat.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/chat/${chat.id}`)}
                >
                  <CardContent className="p-4">
                    <h3 className="font-medium truncate">{chat.title}</h3>
                    
                    <p className="text-sm text-gray-500 mt-1">
                      Last updated: {new Date(chat.updatedAt).toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;