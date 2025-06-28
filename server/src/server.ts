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
  apiVersion: '2025-03-31.basil'
});

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'https://consumer-ai.vercel.app',
  'https://consumer-ai-chat.vercel.app',
  'https://consumer-ai-chat-git-main.vercel.app'
];

// More permissive CORS setup for Vercel deployments
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin) {
      console.log('Allowing request with no origin');
      return callback(null, true);
    }
    
    // Allow any Vercel deployment
    if (allowedOrigins.indexOf(origin) !== -1 || origin.includes('vercel.app')) {
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

const collections = {
  userMetricsCollection,
  chatHistoryCollection,
  emailCollection,
  scheduledEmailCollection
};

interface ChatRequest {
  message: string;
  sessionId: string;
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
  const { message, sessionId } = req.body as ChatRequest;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    // Get current metrics
    const currentMetrics = (await collections.userMetricsCollection.findOne({})) as MetricsDoc || {
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
        dailyLimit: currentMetrics.dailyLimit,
        chatsUsed: currentMetrics.chatsUsed + 1,
        isPro: currentMetrics.isPro,
        lastUpdated: new Date().toISOString()
      };

      await collections.userMetricsCollection.updateOne(
        { userId: currentMetrics.userId || 'default' },
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
        dailyLimit: currentMetrics.dailyLimit,
        chatsUsed: currentMetrics.chatsUsed + 1,
        isPro: currentMetrics.isPro,
        lastUpdated: new Date().toISOString()
      };

      await collections.userMetricsCollection.updateOne(
        { userId: currentMetrics.userId || 'default' },
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
app.get('/api/user-metrics/limits', async (req, res) => {
  try {
    const metrics = await collections.userMetricsCollection.findOne({});
    res.json(metrics || {
      dailyLimit: 5,
      chatsUsed: 0,
      isPro: false
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
    
    if (!userId || !messages) {
      return res.status(400).json({ error: 'userId and messages are required' });
    }

    const chatData = {
      userId,
      messages,
      title: messages[messages.length - 1]?.text?.slice(0, 50) || 'New Chat',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log('Environment check:', {
    hasLangflowUrl: !!process.env.LANGFLOW_API_URL,
    hasLangflowKey: !!process.env.LANGFLOW_API_KEY,
    env: process.env.NODE_ENV,
    isVercel: !!process.env.VERCEL
  });
}); 