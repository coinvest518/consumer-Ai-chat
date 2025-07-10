import { supabase } from './_supabase';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { Email } from './_supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'POST') {
      const { type, userId, sender, recipients, subject, body, metadata, scheduledTime } = req.body;

      if (!userId || !subject || !body) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Common email data
      const emailData: Partial<Email> = {
        user_id: userId,
        sender: sender || '',
        recipients: Array.isArray(recipients) ? recipients : recipients ? [recipients] : [],
        subject,
        body,
        metadata,
        status: 'pending',
        scheduled_time: type === 'scheduled' || scheduledTime ? new Date(scheduledTime).toISOString() : undefined
      };

      // Insert email
      const { data: email, error: insertError } = await supabase
        .from('emails')
        .insert([emailData])
        .select()
        .single();

      if (insertError) {
        console.error('Error creating email:', insertError);
        return res.status(500).json({ error: 'Failed to create email' });
      }

      return res.status(201).json({
        email,
        message: emailData.scheduled_time ? 'Email scheduled successfully' : 'Email created successfully'
      });
    }

    if (req.method === 'GET') {
      const { userId, status, scheduled } = req.query;
      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }

      let query = supabase
        .from('emails')
        .select('*')
        .eq('user_id', userId);

      // Filter by status if provided
      if (status) {
        query = query.eq('status', status);
      }

      // Filter scheduled vs immediate emails
      if (scheduled === 'true') {
        query = query.not('scheduled_time', 'is', null);
      } else if (scheduled === 'false') {
        query = query.is('scheduled_time', null);
      }

      // Order by creation date, most recent first
      query = query.order('created_at', { ascending: false });

      const { data: emails, error } = await query;

      if (error) {
        console.error('Error fetching emails:', error);
        return res.status(500).json({ error: 'Failed to fetch emails' });
      }

      return res.json(emails || []);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Error in emails API:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message || String(error)
    });
  }
}
