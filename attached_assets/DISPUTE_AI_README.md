# DisputeAI Agent Hub

DisputeAI is a streamlined credit dispute automation system that uses a Supervisor Agent to coordinate between specialized AI tools for web search, calendar/reminders, and credit repair actions.

## Features

- **Supervisor Agent**: Routes user requests to specialized tools or provides direct responses
- **Web Search Tool**: Finds legal information about consumer rights and credit laws
- **Calendar & Reminder Tool**: Sets important deadlines and sends notifications
- **Email Notification Tool**: Sends updates and reminders to users
- **CertMail Integration**: Handles certified mail tracking for dispute letters
- **Credit Report Analysis**: Identifies errors and potential law violations
- **Dispute Letter Generation**: Creates customized dispute letters for credit bureaus
- **Dispute Status Tracking**: Monitors the progress of ongoing disputes
- **AstraDB Integration**: Stores all user data and dispute information

## Architecture

The system follows a Supervisor Agent architecture using LangGraph, where:

1. A central Supervisor Agent receives user input and determines the appropriate action
2. Specialized agents handle domain-specific tasks (web search, calendar, credit repair)
3. The Supervisor maintains conversation context and ensures tasks are completed

## Getting Started

### Prerequisites

- Node.js (v16+)
- NPM or Yarn
- OpenAI API key

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   cd server
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```
   OPENAI_API_KEY=your_openai_api_key
   PORT=3000
   ```
4. Build the TypeScript files:
   ```
   npm run build
   ```
5. Start the DisputeAI server:
   ```
   npm run start:dispute
   ```

## API Endpoints

### POST /api/dispute-chat
Send a message to the DisputeAI system.

**Request Body:**
```json
{
  "message": "I found an error on my credit report",
  "sessionId": "unique_session_id",
  "userId": "user_id",
  "creditReport": "Optional credit report text"
}
```

**Response:**
```json
{
  "response": "I'll help you dispute that error...",
  "metadata": {
    "sessionId": "unique_session_id",
    "userId": "user_id",
    "model": "gpt-4-turbo-preview",
    "timestamp": "2025-07-10T15:30:45.123Z"
  }
}
```

### GET /api/user-metrics/:userId
Get usage metrics for a specific user.

### GET /api/chat-history/:userId
Get chat history for a specific user.

### DELETE /api/chat-session/:sessionId
Clear a specific chat session.

### POST /api/upload-credit-report
Upload a credit report for analysis.

## Development

To run in development mode with automatic reloading:
```
npm run dev:dispute
```

## How It Works

1. The user sends a message to the `/api/dispute-chat` endpoint
2. The Supervisor Agent analyzes the message to determine if it needs a specialized tool
3. If needed, the appropriate specialized agent is called with the relevant context
4. The specialized agent may use one or more tools to fulfill the request
5. Results are returned to the Supervisor Agent, which formulates a response
6. All interaction history is maintained in the session state for context

## Example Use Cases

1. **Credit Report Analysis**: Upload a credit report to identify errors and create dispute letters
2. **Legal Information**: Ask about rights under FCRA or FDCPA for credit disputes
3. **Dispute Tracking**: Check the status of ongoing disputes and next steps
4. **Calendar Management**: Set reminders for important deadlines in the dispute process
5. **Certified Mail**: Send dispute letters via certified mail with tracking

## Technologies Used

- LangGraph for agent orchestration
- LangChain for AI tools and agents
- AstraDB for data storage
- Express for API endpoints
- OpenAI GPT-4 for natural language processing
