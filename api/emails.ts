import { emailCollection } from './_db';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { userId, sender, recipients, subject, body, metadata } = req.body;
    if (!userId || !subject || !body) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const emailData = {
      userId,
      sender: sender || '',
      recipients: recipients || [],
      subject,
      body,
      timestamp: new Date().toISOString(),
      isRead: false,
      metadata
    };
    const result = await emailCollection.insertOne(emailData);
    res.status(201).json({ email: { id: result.insertedId, ...emailData } });
  } else if (req.method === 'GET') {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId is required' });
    const emails = await emailCollection.find({ userId }).toArray();
    res.json(emails);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
