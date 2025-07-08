import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const { persona_id, conversation_name, conversational_context, properties } = req.body;
  if (!persona_id) {
    return res.status(400).json({ error: 'persona_id is required' });
  }
  const requestBody = {
    persona_id,
    conversation_name: conversation_name || 'ConsumerAI Support',
    conversational_context: conversational_context || 'You are a helpful customer service representative for ConsumerAI, a legal AI platform helping consumers with credit disputes and debt collection issues. Help users understand our platform features, pricing, legal templates (FCRA, FDCPA), and guide them through signup or platform usage. Be professional, empathetic, and concise.',
    properties: {
      enable_recording: false,
      max_call_duration: 600,
      enable_transcription: true,
      language: 'english',
      ...properties
    }
  };
  const baseUrls = [
    'https://tavusapi.com/v2/conversations',
    'https://api.tavus.io/v2/conversations'
  ];
  let lastError;
  let response;
  for (const url of baseUrls) {
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.TAVUS_API_KEY || ''
        },
        body: JSON.stringify(requestBody)
      });
      if (response.ok) break;
      lastError = new Error(`HTTP ${response.status}: ${await response.text()}`);
    } catch (error) {
      lastError = error;
    }
  }
  if (!response || !response.ok) {
    return res.status(500).json({
      error: 'All Tavus API endpoints failed',
      details: lastError instanceof Error ? lastError.message : String(lastError)
    });
  }
  const conversationData = await response.json();
  res.json(conversationData);
}
