# Tavus.io AI Avatar Customer Support Integration

## Overview
This integration adds a floating video chat button that connects users to a Tavus.io AI avatar for customer service support.

## Setup Instructions

### 1. Get Your Tavus Credentials
1. Go to [Tavus Platform](https://platform.tavus.io/)
2. Create an account and log in
3. Get your API key from the dashboard
4. Create a persona for customer support (or get the persona ID if you already have one)

### 2. Update Environment Variables
In your `.env` file, replace the placeholder values:

```env
# Tavus.io Configuration
VITE_TAVUS_API_KEY=2205a4ce09c0421b8470878eb22e14e0
VITE_TAVUS_PERSONA_ID=pb1db14ac254
VITE_TAVUS_REPLICA_ID=r4317e64d25a
TAVUS_API_KEY=2205a4ce09c0421b8470878eb22e14e0
TAVUS_PERSONA_ID=pb1db14ac254
TAVUS_REPLICA_ID=r4317e64d25a

# Daily.co Configuration (for advanced video features)
DAILY_API_KEY=7537b2d6fa5206b05b48fbff98829a4ed3efa7eef3d4d71969ec34120debf007
VITE_DAILY_API_KEY=7537b2d6fa5206b05b48fbff98829a4ed3efa7eef3d4d71969ec34120debf007
```

**✅ Your credentials are already configured!**

### 3. Persona Setup (Recommended)
Create a persona with this context for best customer service experience:

**Persona Name:** ConsumerAI Support Agent
**Persona Description:** Helpful customer service representative for ConsumerAI legal platform
**Knowledge Base:** Include information about:
- Platform features and how to use templates
- Billing and subscription questions
- Common legal terms (FCRA, FDCPA, etc.)
- Troubleshooting steps

### 4. Features
- **Floating Chat Button**: Appears in bottom-right corner
- **Video Interface**: Full video chat with AI avatar
- **Smart Context**: AI understands it's customer support for ConsumerAI
- **Mobile Responsive**: Works on desktop and mobile
- **Auto-timeout**: Calls end after 10 minutes to save costs

### 5. Customization Options

#### Button Position
```tsx
<TavusChatbot className="bottom-4 right-4" /> // Custom position
```

#### Custom Conversation Context
Edit in `TavusChatbot.tsx`:
```tsx
conversational_context: `Your custom context here...`
```

#### Styling
The component uses Tailwind CSS and can be customized via className props.

### 6. Usage Flow
1. User clicks floating video chat button
2. Backend creates Tavus conversation with your persona
3. User is connected to AI avatar for support
4. Conversation auto-ends after timeout or manual end

### 7. Cost Considerations
- Each conversation costs based on Tavus pricing
- Set reasonable timeouts (default: 10 minutes)
- Consider usage limits for free tier users

### 8. Troubleshooting
- **Chat won't start**: Check API keys in environment variables
- **No video**: Verify persona_id is correct
- **Connection errors**: Check server logs for Tavus API responses

### 9. Security Notes
- API keys are properly handled server-side
- No sensitive data exposed to frontend
- Conversations are not recorded by default

## Integration Complete! 🎉
Your ConsumerAI app now has AI avatar customer support powered by Tavus.io.
