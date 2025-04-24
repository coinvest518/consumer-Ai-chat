// Simple test script to verify Langflow API
import dotenv from 'dotenv';
dotenv.config();

const payload = {
    "input_value": "what deos the FCRA standfor ?",
    "output_type": "chat",
    "input_type": "chat",
    "session_id": "user_1"
};

const options = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.LANGFLOW_API_KEY}`
    },
    body: JSON.stringify(payload)
};

console.log('Testing Langflow API...');
console.log('URL:', process.env.LANGFLOW_API_URL);
console.log('Has API Key:', !!process.env.LANGFLOW_API_KEY);
console.log('\nMaking request...');

fetch(process.env.LANGFLOW_API_URL, options)
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('\nSuccess! Response:', JSON.stringify(data, null, 2));
    })
    .catch(error => {
        console.error('Error:', error);
    }); 