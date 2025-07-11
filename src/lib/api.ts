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
      
      console.log('Fetching chat limits for user:', userId);
      console.log('Auth token available:', !!token);
      
      // Try multiple endpoints in order of preference
      const endpoints = [
        `/api/user/metrics?user_id=${userId}`,
        `/api/user/metrics-simple?user_id=${userId}`
      ];
      
      let lastError = null;
      
      for (const endpoint of endpoints) {
        try {
          console.log('Trying endpoint:', endpoint);
          
          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          };
          
          // Add auth token if available
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }
          
          const response = await fetch(endpoint, { 
            headers,
            credentials: 'same-origin' // This is important for CORS with credentials
          });

          console.log('Response status for', endpoint, ':', response.status);
          console.log('Response headers:', Object.fromEntries(response.headers.entries()));
          
          if (response.ok) {
            try {
              const data = await response.json();
              console.log('Received data from', endpoint, ':', data);
              if (data && typeof data === 'object') {
                return data;
              } else {
                console.error('Invalid data format received:', data);
                lastError = new Error('Invalid data format received');
                continue;
              }
            } catch (parseError) {
              console.error('JSON parse error:', parseError);
              lastError = parseError;
              continue;
            }
          } else if (response.status === 404) {
            console.log('Endpoint not found:', endpoint);
            lastError = new Error(`Endpoint ${endpoint} not found`);
            continue;
          } else {
            const errorData = await response.text();
            console.error('API Error Response:', {
              endpoint,
              status: response.status,
              statusText: response.statusText,
              error: errorData
            });
            lastError = new Error(`HTTP error! status: ${response.status}`);
            continue;
          }
        } catch (fetchError) {
          console.error('Fetch error for', endpoint, ':', fetchError);
          lastError = fetchError;
          continue;
        }
      }
      
      // If all endpoints fail, return default metrics
      console.log('All API endpoints failed, returning default metrics. Last error:', lastError);
      return {
        id: `metrics-${userId}`,
        user_id: userId,
        daily_limit: 5,
        chats_used: 0,
        is_pro: false,
        last_updated: new Date().toISOString(),
        created_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to fetch user metrics:', error);
      
      // Return default metrics as fallback
      return {
        id: `metrics-${userId}`,
        user_id: userId,
        daily_limit: 5,
        chats_used: 0,
        is_pro: false,
        last_updated: new Date().toISOString(),
        created_at: new Date().toISOString()
      };
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
      // Use the same fallback pattern as getChatLimits
      const endpoints = [
        `/api/user/metrics?user_id=${userId}`,
        `/api/user/metrics-simple?user_id=${userId}`
      ];
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const contentType = response.headers.get('content-type');
            if (contentType?.includes('application/json')) {
              return await response.json();
            }
          }
        } catch (fetchError) {
          console.error('Fetch error for', endpoint, ':', fetchError);
          continue;
        }
      }
      
      // If all endpoints fail, return default metrics
      return {
        id: `metrics-${userId}`,
        user_id: userId,
        daily_limit: 5,
        chats_used: 0,
        is_pro: false,
        last_updated: new Date().toISOString(),
        created_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to update chat metrics:', error);
      // Return default metrics as fallback
      return {
        id: `metrics-${userId}`,
        user_id: userId,
        daily_limit: 5,
        chats_used: 0,
        is_pro: false,
        last_updated: new Date().toISOString(),
        created_at: new Date().toISOString()
      };
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