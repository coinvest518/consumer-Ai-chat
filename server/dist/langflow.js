import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();
// Get Langflow API details from environment variables
const LANGFLOW_API_URL = process.env.LANGFLOW_API_URL?.trim();
const LANGFLOW_API_KEY = process.env.LANGFLOW_API_KEY?.trim();
const FLOW_ID = process.env.FLOW_ID?.trim();
/**
 * Call the Langflow API with a user message
 * @param message The user's message to process
 * @param sessionId Optional chat session ID for context
 * @returns Promise containing the API response
 */
export async function callLangflowAPI(message, sessionId) {
    if (!LANGFLOW_API_URL || !LANGFLOW_API_KEY || !FLOW_ID) {
        console.error('Missing env vars:', {
            hasUrl: !!LANGFLOW_API_URL,
            hasKey: !!LANGFLOW_API_KEY,
            hasFlowId: !!FLOW_ID
        });
        throw new Error('Langflow API configuration is missing');
    }
    try {
        const apiUrl = `${LANGFLOW_API_URL}/api/v1/process/${FLOW_ID}`;
        console.log('Making request to Langflow API:', {
            url: apiUrl,
            message
        });
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${LANGFLOW_API_KEY}`
            },
            body: JSON.stringify({
                input: {
                    question: message
                },
                chat_history: []
            })
        });
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Langflow API error response:', {
                status: response.status,
                statusText: response.statusText,
                body: errorText
            });
            throw new Error(`Langflow API error: ${response.status} - ${response.statusText}`);
        }
        const data = await response.json();
        console.log('Langflow raw response:', data);
        if (data.error) {
            throw new Error(`Langflow API error: ${data.error}`);
        }
        // Extract the response from Langflow's output
        let text = "Sorry, I couldn't process that.";
        if (data.result?.answer) {
            text = data.result.answer;
        }
        else if (data.result?.response) {
            text = data.result.response;
        }
        else if (data.result?.message) {
            text = data.result.message;
        }
        return {
            text,
            actions: ["Ask Follow-up", "Save Answer"]
        };
    }
    catch (error) {
        console.error('Error calling Langflow API:', error);
        throw error;
    }
}
