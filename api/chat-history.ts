import { chatHistoryCollection } from './_db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId is required' });
    const cursor = await chatHistoryCollection.find({ userId });
    const chatHistory = await cursor.toArray();
    res.json(chatHistory || []);
  } else if (req.method === 'POST') {
    const { userId, messages } = req.body;
    if (!userId || !messages) return res.status(400).json({ error: 'userId and messages are required' });
    const chatData = {
      userId,
      messages,
      title: messages[messages.length - 1]?.text?.slice(0, 50) || 'New Chat',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timestamp: Date.now()
    };
    await chatHistoryCollection.insertOne(chatData);
    res.json({ success: true, chatData });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
