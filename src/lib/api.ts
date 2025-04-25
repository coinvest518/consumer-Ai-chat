import { API_BASE_URL } from './config';

export const api = {
  getChatLimits: async () => {
    const response = await fetch(`${API_BASE_URL}/user-metrics/limits`);
    if (!response.ok) {
      throw new Error('Failed to fetch chat limits');
    }
    return response.json();
  },

  updateChatMetrics: async (userId: string) => {
    const response = await fetch(`${API_BASE_URL}/user-metrics/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });
    if (!response.ok) {
      throw new Error('Failed to update chat metrics');
    }
    return response.json();
  },

  saveChat: async (chatData: any) => {
    const response = await fetch(`${API_BASE_URL}/chat-history/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(chatData),
    });
    if (!response.ok) {
      throw new Error('Failed to save chat');
    }
    return response.json();
  },

  verifyPayment: async (sessionId: string) => {
    const response = await fetch(`${API_BASE_URL}/verify-payment/${sessionId}`);
    if (!response.ok) {
      throw new Error('Failed to verify payment');
    }
    return response.json();
  },

  getChatHistory: async (userId: string) => {
    const response = await fetch(`${API_BASE_URL}/chat-history/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch chat history');
    return response.json();
  },

  getChat: async (chatId: string) => {
    const response = await fetch(`${API_BASE_URL}/chat/${chatId}`);
    if (!response.ok) throw new Error('Failed to fetch chat');
    return response.json();
  },
}; 