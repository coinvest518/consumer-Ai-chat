import { scheduledEmailCollection } from './_db';

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    const { userId, recipients, subject, body, scheduledTime } = req.body;
    if (!userId || !recipients || !subject || !body || !scheduledTime) {
      return res.status(400).json({ error: 'Missing required fields' });
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
    res.status(201).json({ id: result.insertedId, message: 'Email scheduled successfully' });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
