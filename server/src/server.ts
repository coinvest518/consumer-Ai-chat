import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { DataAPIClient } from '@datastax/astra-db-ts';
import { callLangflowAPI, type AIResponse } from './langflow.js';
import Stripe from 'stripe';
import { EmailMessage, ScheduledEmail } from '../types';

// Define simple response type
interface APIResponse {
  result?: string;
  response?: string;
  message?: string;
}

// Load environment variables from the parent directory
config({ path: '../.env' });

const app = express();
const port = process.env.PORT || 3000;

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'https://consumer-ai.vercel.app',
  'https://consumer-ai-chat.vercel.app',
  'https://consumer-ai-chat-git-main.vercel.app',
  'https://consumerai.info',
  'https://www.consumerai.info'
];

// More permissive CORS setup for Vercel deployments
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin) {
      console.log('Allowing request with no origin');
      return callback(null, true);
    }
    
    // Allow specific origins and any Vercel deployment
    if (allowedOrigins.indexOf(origin) !== -1 || origin.includes('vercel.app') || origin.includes('consumerai.info')) {
      console.log('Allowing origin:', origin);
      return callback(null, true);
    }
    
    console.log('CORS blocked origin:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(express.json());

// Initialize Astra DB client
const client = new DataAPIClient();
const db = client.db(process.env.ASTRA_DB_ENDPOINT!, {
  token: process.env.ASTRA_DB_APPLICATION_TOKEN!
});

// Initialize collections
const userMetricsCollection = db.collection('user_metrics');
const chatHistoryCollection = db.collection('chat_history');
const emailCollection = db.collection('emails');
const scheduledEmailCollection = db.collection('scheduled_emails');
const templateUsageCollection = db.collection('template_usage');

const collections = {
  userMetricsCollection,
  chatHistoryCollection,
  emailCollection,
  scheduledEmailCollection,
  templateUsageCollection
};

interface ChatRequest {
  message: string;
  sessionId: string;
  userId: string;
}

interface LangflowResponse {
  result?: {
    response?: string;
    answer?: string;
    message?: string;
  };
  outputs?: Array<{
    outputs: Array<{
      results: {
        message: {
          text: string;
        };
      };
    }>;
  }>;
}

interface MetricsDoc {
  _id?: string;
  userId?: string;
  dailyLimit: number;
  chatsUsed: number;
  isPro: boolean;
  lastUpdated?: string;
}

// Simple chat endpoint
app.post('/api/chat', async (req: express.Request, res: express.Response) => {
  const { message, sessionId, userId } = req.body as ChatRequest;

  console.log('Chat request received:', { userId, message: message.slice(0, 50) + '...', sessionId });

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    // Get current metrics for the specific user
    const currentMetrics = (await collections.userMetricsCollection.findOne({ userId })) as MetricsDoc || {
      userId,
      dailyLimit: 5,
      chatsUsed: 0,
      isPro: false
    };

    // Check if limit reached
    if (!currentMetrics.isPro && currentMetrics.chatsUsed >= currentMetrics.dailyLimit) {
      return res.status(429).json({ 
        error: 'Daily limit reached',
        chatsUsed: currentMetrics.chatsUsed,
        dailyLimit: currentMetrics.dailyLimit
      });
    }

    // Check if this is an email message
    const isEmailMessage = message.startsWith('Process this email:');
    let emailData = null;

    if (isEmailMessage) {
      // Extract email subject and body
      const emailLines = message.split('\n');
      const subjectLine = emailLines.find(line => line.startsWith('Subject:'));
      const bodyStartIndex = emailLines.indexOf('Body:');
      
      if (subjectLine && bodyStartIndex !== -1) {
        const subject = subjectLine.replace('Subject:', '').trim();
        const body = emailLines.slice(bodyStartIndex + 1).join('\n').trim();
        
        // Store email in email collection
        emailData = {
          userId: req.body.userId,
          subject,
          body,
          sender: '',
          recipients: [],
          timestamp: new Date().toISOString(),
          isRead: false
        };
        
        await collections.emailCollection.insertOne(emailData);
      }
    }

    // Use the imported callLangflowAPI function for API calls
    try {
      // First attempt with the callLangflowAPI helper
      const aiResponse: AIResponse = await callLangflowAPI(message, sessionId);
      
      // Create a more standard API response format
      const response: APIResponse = {
        result: aiResponse.text,
        response: aiResponse.text,
        message: "Success"
      };
      
      // Update metrics after successful response
      const updatedMetrics = {
        userId,
        dailyLimit: currentMetrics.dailyLimit,
        chatsUsed: currentMetrics.chatsUsed + 1,
        isPro: currentMetrics.isPro,
        lastUpdated: new Date().toISOString()
      };

      await collections.userMetricsCollection.updateOne(
        { userId },
        { $set: updatedMetrics },
        { upsert: true }
      );

      // If this was an email message, include the email data in response
      const responseData = {
        text: response.response,
        chatsUsed: updatedMetrics.chatsUsed,
        dailyLimit: updatedMetrics.dailyLimit,
        remaining: updatedMetrics.dailyLimit - updatedMetrics.chatsUsed
      };

      if (emailData) {
        Object.assign(responseData, { emailData });
      }

      return res.json(responseData);
    } catch (error) {
      console.error('LangflowAPI error, falling back to direct API call:', error);
      
      // Fall back to direct API call if the helper fails
      console.log('Sending request to Langflow:', {
        url: process.env.LANGFLOW_API_URL,
        message,
        sessionId
      });

      const payload = {
        input_value: message,
        output_type: "chat",
        input_type: "chat",
        session_id: sessionId || "user_1"
      };

      // Add timeout of 60 seconds and retry logic
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000);

      const response = await fetch(process.env.LANGFLOW_API_URL!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.LANGFLOW_API_KEY}`
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!response.ok) {
        console.error('Langflow API error:', {
          status: response.status,
          statusText: response.statusText,
          url: process.env.LANGFLOW_API_URL
        });

        // Special handling for timeout errors
        if (response.status === 504) {
          return res.status(504).json({ 
            error: 'The AI is taking longer than expected to respond. Please try again.',
            isTimeout: true
          });
        }

        return res.status(500).json({ error: 'Failed to get response from AI' });
      }

      const data = await response.json() as LangflowResponse;
      console.log('Langflow response:', data);

      let text = '';
      if (data.result?.response) {
        text = data.result.response;
      } else if (data.result?.answer) {
        text = data.result.answer;
      } else if (data.result?.message) {
        text = data.result.message;
      } else if (data.outputs?.[0]?.outputs?.[0]?.results?.message?.text) {
        text = data.outputs[0].outputs[0].results.message.text;
      }

      if (!text) {
        console.error('Invalid AI response format:', data);
        return res.status(500).json({ error: 'No valid response from AI' });
      }

      // Update metrics after successful response
      const updatedMetrics = {
        userId,
        dailyLimit: currentMetrics.dailyLimit,
        chatsUsed: currentMetrics.chatsUsed + 1,
        isPro: currentMetrics.isPro,
        lastUpdated: new Date().toISOString()
      };

      await collections.userMetricsCollection.updateOne(
        { userId },
        { $set: updatedMetrics },
        { upsert: true }
      );

      return res.json({ 
        text,
        chatsUsed: updatedMetrics.chatsUsed,
        dailyLimit: updatedMetrics.dailyLimit,
        remaining: updatedMetrics.dailyLimit - updatedMetrics.chatsUsed
      });
    }
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user metrics/limits
app.get('/api/user-metrics/limits/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('Fetching metrics for userId:', userId);
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    
    const metrics = await collections.userMetricsCollection.findOne({ userId });
    console.log('Found metrics:', metrics);
    
    res.json(metrics || {
      dailyLimit: 5,
      chatsUsed: 0,
      isPro: false,
      userId
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

// Update user metrics
app.post('/api/user-metrics/update', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const currentMetrics = await collections.userMetricsCollection.findOne({ userId }) || {
      dailyLimit: 5,
      chatsUsed: 0,
      isPro: false,
      lastUpdated: new Date().toISOString()
    };
    
    const metricsToUpdate = {
      dailyLimit: currentMetrics.dailyLimit,
      chatsUsed: currentMetrics.chatsUsed,
      isPro: currentMetrics.isPro,
      lastUpdated: new Date().toISOString()
    };
    
    await collections.userMetricsCollection.updateOne(
      { userId },
      { $set: metricsToUpdate },
      { upsert: true }
    );
    
    res.json({
      ...metricsToUpdate,
      userId
    });
  } catch (error) {
    console.error('Error updating metrics:', error);
    res.status(500).json({ error: 'Failed to update metrics' });
  }
});

// Save chat history
app.post('/api/chat-history/save', async (req, res) => {
  try {
    const { userId, messages } = req.body;
    
    console.log('Saving chat history for userId:', userId);
    
    if (!userId || !messages) {
      return res.status(400).json({ error: 'userId and messages are required' });
    }

    const chatData = {
      userId,
      messages,
      title: messages[messages.length - 1]?.text?.slice(0, 50) || 'New Chat',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timestamp: Date.now() // Add timestamp for easier debugging
    };
    
    console.log('Chat data to save:', { 
      userId: chatData.userId, 
      title: chatData.title, 
      messageCount: messages.length 
    });
    
    await collections.chatHistoryCollection.insertOne(chatData);
    res.json({ success: true, chatData });
  } catch (error) {
    console.error('Error saving chat:', error);
    res.status(500).json({ error: 'Failed to save chat' });
  }
});

// Replace the checkout session endpoint with payment link endpoint
app.post('/api/verify-payment', async (req: Request, res: Response) => {
  try {
    const { userId, email } = req.body;
    
    // Get current user metrics
    const currentMetrics = await collections.userMetricsCollection.findOne({ userId }) || {
      dailyLimit: 5,
      chatsUsed: 0,
      isPro: false,
      lastUpdated: new Date().toISOString()
    };
    
    // Update user metrics - add 50 more credits
    await collections.userMetricsCollection.updateOne(
      { userId },
      { 
        $set: {
          dailyLimit: currentMetrics.dailyLimit + 50,
          lastPurchase: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        }
      },
      { upsert: true }
    );
    
    // Create a purchase record
    await collections.chatHistoryCollection.insertOne({
      userId,
      type: 'purchase',
      credits: 50,
      amount: 9.99, // Fixed price for 50 credits
      timestamp: new Date().toISOString()
    });
    
    res.json({
      success: true,
      userId,
      customerEmail: email,
      creditsAdded: 50,
      newLimit: currentMetrics.dailyLimit + 50
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ error: 'Failed to process payment' });
  }
});

// Add GET endpoint for Stripe session verification (for thank-you page)
app.get('/api/verify-payment/:sessionId', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    // Verify with Stripe that this session was paid
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status === 'paid') {
      res.json({
        paid: true,
        customerEmail: session.customer_details?.email,
        sessionId: sessionId
      });
    } else {
      res.json({
        paid: false,
        sessionId: sessionId
      });
    }
  } catch (error) {
    console.error('Error verifying payment session:', error);
    res.status(500).json({ error: 'Failed to verify payment session' });
  }
});

// Add this endpoint
app.get('/api/chat-history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const cursor = await collections.chatHistoryCollection.find({ userId });
    const chatHistory = await cursor.toArray();
    
    if (!chatHistory || chatHistory.length === 0) {
      return res.json([]);
    }

    res.json(chatHistory);
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

// Add this endpoint
app.get('/api/chat/:chatId', async (req, res) => {
  try {
    const { chatId } = req.params;
    if (!chatId) {
      return res.status(400).json({ error: 'chatId is required' });
    }

    // Find by _id in Astra
    const chat = await collections.chatHistoryCollection.findOne({ 
      _id: chatId 
    });

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    // Return the full chat with messages
    res.json({
      id: chat._id,
      messages: chat.messages || [],
      timestamp: chat.timestamp
    });
  } catch (error) {
    console.error('Error fetching chat:', error);
    res.status(500).json({ error: 'Failed to fetch chat' });
  }
});

// Add a debug route to help identify if the server is running
app.get('/api/debug', (req, res) => {
  res.json({
    status: 'Server is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    headers: req.headers,
    vercelInfo: {
      isVercel: !!process.env.VERCEL,
      region: process.env.VERCEL_REGION,
      environment: process.env.VERCEL_ENV
    }
  });
});

// Implement the email endpoint
app.post('/api/emails', async (req, res) => {
  try {
    const { userId, sender, recipients, subject, body, metadata } = req.body;
    
    if (!userId || !subject || !body) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Store the email
    const emailData: EmailMessage = {
      userId,
      sender: sender || '',
      recipients: recipients || [],
      subject,
      body,
      timestamp: new Date().toISOString(),
      isRead: false,
      metadata
    };
    
    const result = await collections.emailCollection.insertOne(emailData);
    const emailId = result.insertedId;
    
    // Process with Langflow
    const emailContent = `
      From: ${emailData.sender}
      Subject: ${emailData.subject}
      
      ${emailData.body}
    `;
    
    // Call Langflow API with the email content
    const aiResponse = await callLangflowAPI(emailContent, userId);
    
    // Mark email as processed
    await collections.emailCollection.updateOne(
      { _id: emailId },
      { $set: { isRead: true } }
    );
    
    res.status(201).json({
      email: {
        id: emailId,
        ...emailData
      },
      aiResponse: aiResponse.text
    });
  } catch (error) {
    console.error('Error processing email:', error);
    res.status(500).json({ error: 'Failed to process email' });
  }
});

// Implement get emails endpoint
app.get('/api/emails/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const cursor = await collections.emailCollection.find({ userId });
    const emails = await cursor.toArray();
    res.json(emails);
  } catch (error) {
    console.error('Error fetching emails:', error);
    res.status(500).json({ error: 'Failed to fetch emails' });
  }
});

// Implement email scheduling endpoint
app.post('/api/emails/schedule', async (req, res) => {
  try {
    const { userId, recipients, subject, body, scheduledTime } = req.body;
    
    if (!userId || !recipients || !subject || !body || !scheduledTime) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const scheduledEmail: ScheduledEmail = {
      userId,
      recipients: Array.isArray(recipients) ? recipients : [recipients],
      subject,
      body,
      scheduledTime: new Date(scheduledTime).toISOString(),
      status: 'scheduled',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const result = await collections.scheduledEmailCollection.insertOne(scheduledEmail);
    
    res.status(201).json({
      id: result.insertedId,
      message: 'Email scheduled successfully'
    });
  } catch (error) {
    console.error('Error scheduling email:', error);
    res.status(500).json({ error: 'Failed to schedule email' });
  }
});

// Add webhook endpoint for Stripe events
app.post('/api/stripe-webhook', async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];
  
  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig as string,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    
    // Handle successful payment
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      const email = session.metadata?.email;
      
      if (userId) {
        // Get current metrics
        const currentMetrics = await collections.userMetricsCollection.findOne({ userId }) || {
          dailyLimit: 5,
          chatsUsed: 0,
          isPro: false,
          lastUpdated: new Date().toISOString()
        };
        
        // Update metrics
        await collections.userMetricsCollection.updateOne(
          { userId },
          { 
            $set: {
              dailyLimit: currentMetrics.dailyLimit + 50,
              lastPurchase: new Date().toISOString(),
              lastUpdated: new Date().toISOString()
            }
          },
          { upsert: true }
        );
        
        // Record purchase
        await collections.chatHistoryCollection.insertOne({
          userId,
          type: 'purchase',
          credits: 50,
          amount: 9.99,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    res.json({ received: true });
  } catch (err: any) {
    console.error('Webhook error:', err);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

// Tavus conversation creation endpoint - matches Tavus API documentation
app.post('/api/tavus/conversations', async (req, res) => {
  try {
    console.log('=== TAVUS DEBUG START ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const { persona_id, conversation_name, conversational_context, properties } = req.body;

    console.log('Environment check:', {
      hasApiKey: !!process.env.TAVUS_API_KEY,
      apiKeyPreview: process.env.TAVUS_API_KEY ? process.env.TAVUS_API_KEY.substring(0, 8) + '...' : 'MISSING',
      personaId: process.env.TAVUS_PERSONA_ID,
      replicaId: process.env.TAVUS_REPLICA_ID
    });

    if (!persona_id) {
      console.log('ERROR: Missing persona_id in request');
      return res.status(400).json({ error: 'persona_id is required' });
    }

    const requestBody = {
      persona_id,
      // Don't include replica_id since persona pb1db14ac254 has a default replica
      conversation_name: conversation_name || 'ConsumerAI Support',
      conversational_context: conversational_context || 'You are a helpful customer service representative for ConsumerAI, a legal AI platform helping consumers with credit disputes and debt collection issues. Help users understand our platform features, pricing, legal templates (FCRA, FDCPA), and guide them through signup or platform usage. Be professional, empathetic, and concise.',
      properties: {
        enable_recording: false,
        max_call_duration: 600, // 10 minutes
        enable_transcription: true,
        language: 'english', // Use full language name, not ISO code
        ...properties
      }
    };

    console.log('Sending to Tavus API:', JSON.stringify(requestBody, null, 2));

    // Try the correct Tavus API base URL from official documentation
    const baseUrls = [
      'https://tavusapi.com/v2/conversations',  // Official URL from Tavus documentation
      'https://api.tavus.io/v2/conversations'   // Backup URL in case there are regional differences
    ];

    let lastError;
    let response;
    
    for (const url of baseUrls) {
      try {
        console.log(`Attempting Tavus API call to: ${url}`);
        
        response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.TAVUS_API_KEY || ''
          },
          body: JSON.stringify(requestBody)
        });

        console.log(`Tavus API response status from ${url}: ${response.status}`);
        
        if (response.ok) {
          // Success! Continue with normal flow
          break;
        } else {
          const errorData = await response.text();
          console.error(`Tavus API error from ${url}:`, response.status, errorData);
          lastError = new Error(`HTTP ${response.status}: ${errorData}`);
          continue; // Try next URL
        }

      } catch (error) {
        console.error(`Network error with URL ${url}:`, error);
        lastError = error;
        continue; // Try next URL
      }
    }

    // Check if we got a successful response from any URL
    if (!response || !response.ok) {
      console.error('All Tavus API URLs failed');
      console.log('=== TAVUS DEBUG END (ERROR) ===');
      throw lastError || new Error('All Tavus API endpoints failed');
    }

    const conversationData = await response.json();
    console.log('Tavus conversation created successfully:', conversationData);
    console.log('=== TAVUS DEBUG END (SUCCESS) ===');
    res.json(conversationData);

  } catch (error) {
    console.error('Exception in Tavus endpoint:', error);
    console.log('=== TAVUS DEBUG END (EXCEPTION) ===');
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get Tavus conversation status
app.get('/api/tavus/conversation/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;

    const response = await fetch(`https://tavusapi.com/v2/conversations/${conversationId}`, {
      headers: {
        'x-api-key': process.env.TAVUS_API_KEY || ''
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to get conversation status' });
    }

    const conversationData = await response.json();
    res.json(conversationData);

  } catch (error) {
    console.error('Error getting Tavus conversation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// End Tavus conversation
app.post('/api/tavus/conversation/:conversationId/end', async (req, res) => {
  try {
    const { conversationId } = req.params;

    const response = await fetch(`https://tavusapi.com/v2/conversations/${conversationId}/end`, {
      method: 'POST',
      headers: {
        'x-api-key': process.env.TAVUS_API_KEY || ''
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to end conversation' });
    }

    const result = await response.json();
    res.json(result);

  } catch (error) {
    console.error('Error ending Tavus conversation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log('Environment check:', {
    hasLangflowUrl: !!process.env.LANGFLOW_API_URL,
    hasLangflowKey: !!process.env.LANGFLOW_API_KEY,
    env: process.env.NODE_ENV,
    isVercel: !!process.env.VERCEL
  });
});

// Debug endpoint to clear a user's chat history (for testing)
app.delete('/api/debug/clear-user-data/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('Clearing all data for userId:', userId);
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    
    // Clear chat history
    const chatHistoryResult = await collections.chatHistoryCollection.deleteMany({ userId });
    
    // Clear user metrics
    const metricsResult = await collections.userMetricsCollection.deleteMany({ userId });
    
    // Clear emails if any
    const emailResult = await collections.emailCollection.deleteMany({ userId });
    
    res.json({
      success: true,
      message: `Cleared all data for user ${userId}`,
      deletedCounts: {
        chatHistory: chatHistoryResult.deletedCount,
        metrics: metricsResult.deletedCount,
        emails: emailResult.deletedCount
      }
    });
  } catch (error) {
    console.error('Error clearing user data:', error);
    res.status(500).json({ error: 'Failed to clear user data' });
  }
});

// Debug endpoint to initialize a new user with fresh data
app.post('/api/debug/init-user', async (req, res) => {
  try {
    const { userId } = req.body;
    console.log('Initializing fresh user data for userId:', userId);
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    
    // Create fresh user metrics
    const newMetrics = {
      userId,
      dailyLimit: 5,
      chatsUsed: 0,
      isPro: false,
      lastUpdated: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    
    await collections.userMetricsCollection.updateOne(
      { userId },
      { $set: newMetrics },
      { upsert: true }
    );
    
    res.json({
      success: true,
      message: `Initialized fresh data for user ${userId}`,
      metrics: newMetrics
    });
  } catch (error) {
    console.error('Error initializing user:', error);
    res.status(500).json({ error: 'Failed to initialize user' });
  }
});

// Template-related endpoints

// Use template endpoint
app.post('/api/templates/use', async (req, res) => {
  try {
    const { userId, templateId, creditCost } = req.body;
    
    if (!userId || !templateId || !creditCost) {
      return res.status(400).json({ error: 'userId, templateId, and creditCost are required' });
    }

    // Get current user metrics
    const currentMetrics = await collections.userMetricsCollection.findOne({ userId });
    const defaultMetrics = {
      dailyLimit: 5,
      chatsUsed: 0,
      isPro: false,
      lastUpdated: new Date().toISOString()
    };
    
    const userMetrics = currentMetrics ? {
      dailyLimit: currentMetrics.dailyLimit || 5,
      chatsUsed: currentMetrics.chatsUsed || 0,
      isPro: currentMetrics.isPro || false,
      lastUpdated: currentMetrics.lastUpdated || new Date().toISOString()
    } : defaultMetrics;

    // Check if user has enough credits
    const remainingCredits = userMetrics.dailyLimit - userMetrics.chatsUsed;
    if (remainingCredits < creditCost) {
      return res.status(400).json({ 
        error: 'Insufficient credits',
        required: creditCost,
        available: remainingCredits
      });
    }

    // Deduct credits
    const updatedMetrics = {
      ...userMetrics,
      chatsUsed: userMetrics.chatsUsed + creditCost,
      lastUpdated: new Date().toISOString()
    };

    await collections.userMetricsCollection.updateOne(
      { userId },
      { $set: updatedMetrics },
      { upsert: true }
    );

    // Log template usage
    const templateUsage = {
      userId,
      templateId,
      creditCost,
      timestamp: new Date().toISOString(),
      creditsRemaining: updatedMetrics.dailyLimit - updatedMetrics.chatsUsed
    };

    await collections.templateUsageCollection.insertOne(templateUsage);

    res.json({
      success: true,
      creditsDeducted: creditCost,
      creditsRemaining: updatedMetrics.dailyLimit - updatedMetrics.chatsUsed,
      templateUsage
    });
  } catch (error) {
    console.error('Error using template:', error);
    res.status(500).json({ error: 'Failed to use template' });
  }
});

// Get template usage history
app.get('/api/templates/usage/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const usage = await collections.templateUsageCollection
      .find({ userId })
      .sort({ timestamp: -1 })
      .limit(50)
      .toArray();

    res.json(usage);
  } catch (error) {
    console.error('Error fetching template usage:', error);
    res.status(500).json({ error: 'Failed to fetch template usage' });
  }
});

// Deduct credits endpoint (for general credit deduction)
app.post('/api/user-metrics/deduct', async (req, res) => {
  try {
    const { userId, amount, reason } = req.body;
    
    if (!userId || !amount) {
      return res.status(400).json({ error: 'userId and amount are required' });
    }

    const currentMetrics = await collections.userMetricsCollection.findOne({ userId });
    const defaultMetrics = {
      dailyLimit: 5,
      chatsUsed: 0,
      isPro: false,
      lastUpdated: new Date().toISOString()
    };
    
    const userMetrics = currentMetrics ? {
      dailyLimit: currentMetrics.dailyLimit || 5,
      chatsUsed: currentMetrics.chatsUsed || 0,
      isPro: currentMetrics.isPro || false,
      lastUpdated: currentMetrics.lastUpdated || new Date().toISOString()
    } : defaultMetrics;

    const remainingCredits = userMetrics.dailyLimit - userMetrics.chatsUsed;
    if (remainingCredits < amount) {
      return res.status(400).json({ 
        error: 'Insufficient credits',
        required: amount,
        available: remainingCredits
      });
    }

    const updatedMetrics = {
      ...userMetrics,
      chatsUsed: userMetrics.chatsUsed + amount,
      lastUpdated: new Date().toISOString()
    };

    await collections.userMetricsCollection.updateOne(
      { userId },
      { $set: updatedMetrics },
      { upsert: true }
    );

    res.json({
      success: true,
      creditsDeducted: amount,
      creditsRemaining: updatedMetrics.dailyLimit - updatedMetrics.chatsUsed,
      reason: reason || 'General usage'
    });
  } catch (error) {
    console.error('Error deducting credits:', error);
    res.status(500).json({ error: 'Failed to deduct credits' });
  }
});

// Replace the checkout session endpoint with payment link endpoint