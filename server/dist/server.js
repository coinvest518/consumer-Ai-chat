import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { DataAPIClient } from '@datastax/astra-db-ts';
import fetch from 'node-fetch';
config();
const app = express();
const port = process.env.PORT || 5001;
app.use(cors());
app.use(express.json());
// Initialize Astra DB client
const client = new DataAPIClient();
const db = client.db(process.env.ASTRA_DB_ENDPOINT, {
    token: process.env.ASTRA_DB_APPLICATION_TOKEN
});
// Initialize collections
const userMetricsCollection = db.collection('user_metrics');
const chatHistoryCollection = db.collection('chat_history');
const collections = {
    userMetricsCollection,
    chatHistoryCollection
};
// Simple chat endpoint
app.post('/api/chat', async (req, res) => {
    const { message, sessionId } = req.body;
    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }
    try {
        // Get current metrics
        const currentMetrics = (await collections.userMetricsCollection.findOne({})) || {
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
            const response = await fetch(process.env.LANGFLOW_API_URL, {
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
            const data = await response.json();
            console.log('Langflow response:', data);
            let text = '';
            if (data.result?.response) {
                text = data.result.response;
            }
            else if (data.result?.answer) {
                text = data.result.answer;
            }
            else if (data.result?.message) {
                text = data.result.message;
            }
            else if (data.outputs?.[0]?.outputs?.[0]?.results?.message?.text) {
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
            await collections.userMetricsCollection.updateOne({ userId: currentMetrics.userId || 'default' }, { $set: updatedMetrics }, { upsert: true });
            return res.json({
                text,
                chatsUsed: updatedMetrics.chatsUsed,
                dailyLimit: updatedMetrics.dailyLimit,
                remaining: updatedMetrics.dailyLimit - updatedMetrics.chatsUsed
            });
        }
        catch (error) {
            console.error('Server error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    catch (error) {
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
    }
    catch (error) {
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
        await collections.userMetricsCollection.updateOne({ userId }, { $set: metricsToUpdate }, { upsert: true });
        res.json({
            ...metricsToUpdate,
            userId
        });
    }
    catch (error) {
        console.error('Error updating metrics:', error);
        res.status(500).json({ error: 'Failed to update metrics' });
    }
});
// Save chat history
app.post('/api/chat-history/save', async (req, res) => {
    try {
        const chatData = {
            ...req.body,
            timestamp: Date.now()
        };
        await collections.chatHistoryCollection.insertOne(chatData);
        res.json({ success: true });
    }
    catch (error) {
        console.error('Error saving chat:', error);
        res.status(500).json({ error: 'Failed to save chat' });
    }
});
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log('Environment check:', {
        hasLangflowUrl: !!process.env.LANGFLOW_API_URL,
        hasLangflowKey: !!process.env.LANGFLOW_API_KEY
    });
});
