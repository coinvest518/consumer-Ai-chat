
import { emailCollection, scheduledEmailCollection } from './_db';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    const { type, userId, sender, recipients, subject, body, metadata, scheduledTime } = req.body;
    if (!userId || !subject || !body) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    // If scheduledTime is present or type === 'scheduled', treat as scheduled email
    if (type === 'scheduled' || scheduledTime) {
      if (!recipients || !scheduledTime) {
        return res.status(400).json({ error: 'Missing required fields for scheduled email' });
      }
      const scheduledEmail = {
        userId,
        recipients: Array.isArray(recipients) ? recipients : [recipients],
        subject,
        body,
        scheduledTime: new Date(scheduledTime).toISOString(),
        status: 'scheduled',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const result = await scheduledEmailCollection.insertOne(scheduledEmail);
      return res.status(201).json({ id: result.insertedId, message: 'Email scheduled successfully' });
    } else {
      // Immediate email
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
      return res.status(201).json({ email: { id: result.insertedId, ...emailData } });
    }
  } else if (req.method === 'GET') {
    const { userId, scheduled } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId is required' });
    if (scheduled === 'true') {
      // Return scheduled emails
      const emails = await scheduledEmailCollection.find({ userId }).toArray();
      return res.json(emails);
    } else {
      // Return immediate emails
      const emails = await emailCollection.find({ userId }).toArray();
      return res.json(emails);
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
