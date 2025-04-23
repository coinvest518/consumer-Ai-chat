import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { useAuthContext } from '@/contexts/AuthContext';
import { fadeIn } from '@/lib/animations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiRequest } from '@/lib/queryClient';
import { Loader2 } from 'lucide-react';

// Define the ChatSession type locally to avoid import errors
interface ChatSession {
  id: number;
  userId: number;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export default function Dashboard() {
  const [location, navigate] = useLocation();
  const { user, signOut } = useAuthContext();
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    async function fetchChatHistory() {
      try {
        const response = await fetch('/api/chat-sessions');
        if (response.ok) {
          const data = await response.json();
          setChatHistory(data || []);
        }
      } catch (error) {
        console.error('Error fetching chat history:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchChatHistory();
  }, [user, navigate]);

  const handleNewChat = () => {
    navigate('/chat');
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-gray-50 p-6"
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
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
              <Card key={chat.id} className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/chat/${chat.id}`)}>
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
    </motion.div>
  );
}