import express from 'express';
import { collections } from '../astra';

const router = express.Router();

// Get chat history for a user
router.get('/chat-history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Query the chat_memory collection from Astra DB
    const chatHistory = await collections.chat_memory.find({
      userId: userId
    }).toArray();

    res.json(chatHistory);
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

export default router; 