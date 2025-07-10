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
    const { data, error } = await supabase
      .from('user_metrics')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    // Return default metrics if none exist
    return data || {
      user_id: userId,
      daily_limit: 5,
      chats_used: 0,
      is_pro: false,
      last_updated: new Date().toISOString()
    };
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
        user_id: userId,
        daily_limit: 5,
        chats_used: 0,
        is_pro: false,
        last_updated: new Date().toISOString()
      },
      emails: emails || [],
      purchases: purchases || []
    };
  }
};