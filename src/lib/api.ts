const API_BASE_URL = 'http://localhost:5001/api';

export const api = {
  async getChatLimits() {
    const response = await fetch(`${API_BASE_URL}/user-metrics/limits`);
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }
    return response.json();
  },

  async updateChatMetrics(userId: string) {
    const response = await fetch(`${API_BASE_URL}/user-metrics/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId })
    });
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }
    return response.json();
  },

  async saveChat(chatData: { userId: string; messages: any[] }) {
    const response = await fetch(`${API_BASE_URL}/chat-history/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(chatData)
    });
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }
    return response.json();
  }
}; 