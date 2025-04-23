import fetch from 'node-fetch';

// Define AIResponse interface here to avoid import issues
export interface AIResponse {
  text: string;
  citation?: string;
  actions?: string[];
}

// Langflow API configuration
const LANGFLOW_API_BASE = 'https://cloud.langflow.ai';
const FLOW_ID = 'd2ec4675-eb79-4511-be23-85dad6279573'; // From your configuration

// Define Langflow response type
interface LangflowResponse {
  result?: string;
  output?: string;
  citation?: string;
  source?: string;
  [key: string]: any;
}

/**
 * Call the Langflow API with a user message
 * @param message The user's message to process
 * @param sessionId Optional chat session ID for context
 * @returns Promise containing the API response
 */
export async function callLangflowAPI(message: string, sessionId?: string): Promise<AIResponse> {
  try {
    const url = `${LANGFLOW_API_BASE}/api/v1/run/${FLOW_ID}`;
    
    // Prepare the request payload
    const payload = {
      inputs: {
        input_value: message
      },
      stream: false
    };
    
    // Call the Langflow API
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`Langflow API error: ${response.status} ${response.statusText}`);
    }
    
    // Parse and return the response
    const data = await response.json() as LangflowResponse;
    
    // Extract relevant information from the response
    return {
      text: data.result || data.output || "I couldn't find specific information on that topic.",
      citation: data.citation || data.source,
      actions: ["Ask Follow-up", "Save Answer"]
    };
  } catch (error) {
    console.error('Error calling Langflow API:', error);
    return {
      text: "I'm having trouble connecting to my knowledge base. Please try again later.",
      actions: ["Try Again"]
    };
  }
}