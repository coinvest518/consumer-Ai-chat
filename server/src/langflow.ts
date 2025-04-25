import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

// Get Langflow API details from environment variables
const LANGFLOW_API_URL = process.env.LANGFLOW_API_URL?.trim();
const LANGFLOW_API_KEY = process.env.LANGFLOW_API_KEY?.trim();
const FLOW_ID = "d2ec4675-eb79-4511-be23-85dad6279573";

// Define the AIResponse interface
export interface AIResponse {
  text: string;
  metadata?: any;
}

// Define Langflow response type
interface LangflowResponse {
  result?: {
    answer?: string;
    response?: string;
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
  error?: string;
}

/**
 * Call the Langflow API with a user message
 * @param message The user's message to process
 * @param sessionId Optional chat session ID for context
 * @returns Promise containing the API response
 */
export async function callLangflowAPI(message: string, sessionId: string): Promise<AIResponse> {
  if (!LANGFLOW_API_URL || !LANGFLOW_API_KEY) {
    throw new Error('Langflow API configuration missing');
  }

  const payload = {
    input_value: message,
    output_type: "chat",
    input_type: "chat",
    session_id: sessionId || "user_1",
    flow_id: FLOW_ID // Using the FLOW_ID constant
  };

  const response = await fetch(LANGFLOW_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${LANGFLOW_API_KEY}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Langflow API error: ${response.status}`);
  }

  const data = await response.json() as LangflowResponse; // Type assertion to use the interface
  
  // Extract text from various possible response formats
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
    throw new Error('No valid response from AI');
  }

  return { 
    text,
    metadata: {
      flowId: FLOW_ID,
      sessionId,
      timestamp: new Date().toISOString()
    }
  };
}

// Add a function to validate API configuration
export function validateLangflowConfig(): boolean {
  return !!(LANGFLOW_API_URL && LANGFLOW_API_KEY && FLOW_ID);
} 