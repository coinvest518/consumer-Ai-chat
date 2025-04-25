import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { DataAPIClient } from '@datastax/astra-db-ts';
import { callLangflowAPI, type AIResponse } from '../langflow';
import Stripe from 'stripe';

// Define simple response type
interface APIResponse {
  result?: string;
  response?: string;
  message?: string;
}

config();

const app = express();
const port = process.env.PORT || 3000;

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil'
});

app.use(cors());
app.use(express.json());

// Initialize Astra DB client
const client = new DataAPIClient();
const db = client.db(process.env.ASTRA_DB_ENDPOINT!, {
  token: process.env.ASTRA_DB_APPLICATION_TOKEN!
});

// Initialize collections
const userMetricsCollection = db.collection('user_metrics');
const chatHistoryCollection = db.collection('chat_history');

const collections = {
  userMetricsCollection,
  chatHistoryCollection
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

    try {
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

    } catch (error) {
      console.error('Server error:', error);
      return res.status(500).json({ error: 'Internal server error' });
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

// Stripe payment endpoints
app.post('/api/create-checkout-session', async (req: Request, res: Response) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.STRIPE_SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: process.env.STRIPE_CANCEL_URL,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

app.get('/api/verify-payment/:sessionId', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status === 'paid') {
      // Update user metrics to Pro
      const customerId = session.customer as string;
      const customerEmail = session.customer_details?.email;
      
      await collections.userMetricsCollection.updateOne(
        { userId: customerId || customerEmail },
        { 
          $set: {
            isPro: true,
            dailyLimit: 1000, // Set a high limit for Pro users
            lastUpdated: new Date().toISOString()
          }
        },
        { upsert: true }
      );
      
      res.json({
        paid: true,
        customerEmail,
        customerId
      });
    } else {
      res.json({
        paid: false
      });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log('Environment check:', {
    hasLangflowUrl: !!process.env.LANGFLOW_API_URL,
    hasLangflowKey: !!process.env.LANGFLOW_API_KEY
  });
}); 