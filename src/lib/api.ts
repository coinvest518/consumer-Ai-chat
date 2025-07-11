import type { 
  ChatHistoryMessage, 
  UserMetrics, 
  Email, 
  TemplateUsage, 
  Purchase 
} from '../../api/_supabase';
import type { PaymentVerificationResponse } from './types';
import { supabase } from './supabase';

// Helper function to handle Supabase responses
async function handleSupabaseResponse<T>(
  { data, error }: { data: T | null; error: any }
): Promise<T> {
  if (error) {
    console.error('API Error:', error);
    throw new Error(error.message || 'An error occurred');
  }
  return data as T;
}

export const api = {
  getChatLimits: async (userId: string): Promise<UserMetrics> => {
    try {
      const session = await supabase.auth.getSession();
      const token = session?.data?.session?.access_token;
      
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await fetch(`/api/user/metrics?user_id=${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const contentType = response.headers.get('content-type');
      if (!response.ok) {
        const errorData = contentType?.includes('application/json') 
          ? await response.json() 
          : await response.text();
          
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });

        // No need to return default metrics here as the backend handles that
        throw new Error(
          typeof errorData === 'object' && errorData.error 
            ? errorData.error 
            : `HTTP error! status: ${response.status}`
        );
      }

      if (!contentType?.includes('application/json')) {
        throw new Error('Invalid response format from server');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch user metrics:', error);
      throw error;
    }
  },

  getChatHistory: async (userId: string): Promise<ChatHistoryMessage[]> => {
    return handleSupabaseResponse(
      await supabase
        .from('chat_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
    );
  },

  saveChat: async (chatData: {
    userId: string;
    message: string;
    response: string;
    sessionId?: string;
    metadata?: Record<string, any>;
  }): Promise<ChatHistoryMessage> => {
    const newMessage = {
      user_id: chatData.userId,
      session_id: chatData.sessionId || crypto.randomUUID(),
      message: chatData.message,
      response: chatData.response,
      message_type: 'chat',
      metadata: chatData.metadata
    };

    return handleSupabaseResponse(
      await supabase
        .from('chat_history')
        .insert([newMessage])
        .select()
        .single()
    );
  },

  useTemplate: async (
    userId: string,
    templateData: {
      template_id: string;
      credit_cost: number;
      credits_remaining: number;
      metadata?: Record<string, any>;
    }
  ): Promise<{ templateUsage: TemplateUsage; remaining: number }> => {
    // Use the stored procedure to handle template usage atomically
    const { data, error } = await supabase.rpc('use_template', {
      p_user_id: userId,
      p_template_id: templateData.template_id,
      p_credit_cost: templateData.credit_cost
    });

    if (error) throw error;

    return {
      templateUsage: data,
      remaining: templateData.credits_remaining - templateData.credit_cost
    };
  },

  getTemplateUsage: async (userId: string): Promise<TemplateUsage[]> => {
    return handleSupabaseResponse(
      await supabase
        .from('template_usage')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
    );
  },

  sendEmail: async (userId: string, emailData: {
    recipients: string[];
    subject: string;
    body: string;
    metadata?: Record<string, any>;
  }): Promise<Email> => {
    return handleSupabaseResponse(
      await supabase
        .from('emails')
        .insert([{
          user_id: userId,
          recipients: emailData.recipients,
          subject: emailData.subject,
          body: emailData.body,
          status: 'pending',
          metadata: emailData.metadata
        }])
        .select()
        .single()
    );
  },

  scheduleEmail: async (userId: string, emailData: {
    recipients: string[];
    subject: string;
    body: string;
    scheduledTime: string;
    metadata?: Record<string, any>;
  }): Promise<Email> => {
    return handleSupabaseResponse(
      await supabase
        .from('emails')
        .insert([{
          user_id: userId,
          recipients: emailData.recipients,
          subject: emailData.subject,
          body: emailData.body,
          status: 'pending',
          scheduled_time: emailData.scheduledTime,
          metadata: emailData.metadata
        }])
        .select()
        .single()
    );
  },

  verifyPayment: async (sessionId: string): Promise<PaymentVerificationResponse> => {
    const response = await fetch(`/api/verify-payment?sessionId=${sessionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to verify payment');
    }

    return response.json();
  },

  updateChatMetrics: async (userId: string): Promise<UserMetrics> => {
    try {
      // For now, this can be a simple function that increments usage
      // The backend will handle creating/updating metrics
      const response = await fetch(`/api/user/metrics?user_id=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to update chat metrics');
      }

      return response.json();
    } catch (error) {
      console.error('Failed to update chat metrics:', error);
      throw error;
    }
  },

  getUserData: async (userId: string): Promise<{
    metrics: UserMetrics;
    emails: Email[];
    purchases: Purchase[];
  }> => {
    const [
      { data: metrics },
      { data: emails },
      { data: purchases }
    ] = await Promise.all([
      supabase
        .from('user_metrics')
        .select('*')
        .eq('user_id', userId)
        .single(),
      supabase
        .from('emails')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
      supabase
        .from('purchases')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
    ]);

    return {
      metrics: metrics || {
        id: crypto.randomUUID(),
        user_id: userId,
        daily_limit: 5,
        chats_used: 0,
        is_pro: false,
        last_updated: new Date().toISOString(),
        created_at: new Date().toISOString()
      },
      emails: emails || [],
      purchases: purchases || []
    };
  }
};