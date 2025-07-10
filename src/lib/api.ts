import type { 
  ChatHistoryMessage, 
  UserMetrics, 
  Email, 
  TemplateUsage, 
  Purchase 
} from '../../api/_supabase';
import type {
  Message,
  ChatSession,
  EmailData,
  TemplateData,
  UserData,
  ApiResponse,
  ChatMetricsResponse
} from './types';
import { ApiError } from './utils';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new ApiError(error.message || 'API request failed', error.details);
  }
  return response.json();
}

export const api = {
  getChatLimits: async (userId: string): Promise<ChatMetricsResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/user-metrics?userId=${encodeURIComponent(userId)}`);
      const data = await handleResponse<UserMetrics>(response);
      return {
        chatsUsed: data.chats_used,
        dailyLimit: data.daily_limit,
        remaining: data.daily_limit - data.chats_used,
        isPro: data.is_pro,
        lastUpdated: data.last_updated
      };
    } catch (error: any) {
      console.error('Get chat limits error:', error);
      throw error instanceof ApiError ? error : new ApiError('Failed to fetch chat limits', error.message);
    }
  },

  getChatHistory: async (userId: string): Promise<ChatHistoryMessage[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat-history/${encodeURIComponent(userId)}`);
      return handleResponse<ChatHistoryMessage[]>(response);
    } catch (error: any) {
      console.error('Get chat history error:', error);
      throw error instanceof ApiError ? error : new ApiError('Failed to fetch chat history', error.message);
    }
  },

  saveChat: async (chatData: {
    userId: string;
    message: string;
    response: string;
    sessionId?: string;
    metadata?: Record<string, any>;
  }): Promise<ChatHistoryMessage> => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chatData)
      });
      return handleResponse<ChatHistoryMessage>(response);
    } catch (error: any) {
      console.error('Save chat error:', error);
      throw error instanceof ApiError ? error : new ApiError('Failed to save chat', error.message);
    }
  },

  useTemplate: async (
    userId: string,
    templateData: TemplateData
  ): Promise<ApiResponse<{ templateUsage: TemplateUsage; remaining: number }>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/template-usage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          templateId: templateData.templateId,
          creditCost: templateData.creditCost,
          metadata: templateData.metadata
        })
      });
      return handleResponse(response);
    } catch (error: any) {
      console.error('Use template error:', error);
      throw error instanceof ApiError ? error : new ApiError('Failed to use template', error.message);
    }
  },

  getTemplateUsage: async (userId: string): Promise<TemplateUsage[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/template-usage?userId=${encodeURIComponent(userId)}`);
      return handleResponse<TemplateUsage[]>(response);
    } catch (error: any) {
      console.error('Get template usage error:', error);
      throw error instanceof ApiError ? error : new ApiError('Failed to fetch template usage', error.message);
    }
  },

  sendEmail: async (userId: string, emailData: EmailData): Promise<ApiResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/emails`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...emailData, userId })
      });
      return handleResponse<ApiResponse>(response);
    } catch (error: any) {
      console.error('Send email error:', error);
      throw error instanceof ApiError ? error : new ApiError('Failed to send email', error.message);
    }
  },

  scheduleEmail: async (userId: string, emailData: EmailData): Promise<ApiResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/emails`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...emailData, userId, type: 'scheduled' })
      });
      return handleResponse<ApiResponse>(response);
    } catch (error: any) {
      console.error('Schedule email error:', error);
      throw error instanceof ApiError ? error : new ApiError('Failed to schedule email', error.message);
    }
  },

  verifyPayment: async (sessionId: string): Promise<ApiResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/verify-payment?sessionId=${encodeURIComponent(sessionId)}`);
      return handleResponse<ApiResponse>(response);
    } catch (error: any) {
      console.error('Payment verification error:', error);
      throw error instanceof ApiError ? error : new ApiError('Failed to verify payment', error.message);
    }
  },

  getUserData: async (userId: string): Promise<UserData> => {
    try {
      const [metrics, chatHistory, templateUsage, emailsRes, purchasesRes] = await Promise.all([
        api.getChatLimits(userId),
        api.getChatHistory(userId),
        api.getTemplateUsage(userId),
        fetch(`${API_BASE_URL}/emails?userId=${encodeURIComponent(userId)}`),
        fetch(`${API_BASE_URL}/purchases?userId=${encodeURIComponent(userId)}`)
      ]);

      const [emails, purchases] = await Promise.all([
        handleResponse<Email[]>(emailsRes),
        handleResponse<Purchase[]>(purchasesRes)
      ]);

      return {
        metrics: {
          user_id: userId,
          daily_limit: metrics.dailyLimit,
          chats_used: metrics.chatsUsed,
          is_pro: metrics.isPro,
          last_updated: metrics.lastUpdated
        } as UserMetrics,
        chatHistory,
        templateUsage,
        emails,
        purchases
      };
    } catch (error: any) {
      console.error('Get user data error:', error);
      throw error instanceof ApiError ? error : new ApiError('Failed to fetch user data', error.message);
    }
  }
};