import { ChatOpenAI } from '@langchain/openai';
import { StructuredTool } from '@langchain/core/tools';
import { AgentExecutor, createOpenAIToolsAgent } from 'langchain/agents';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { z } from 'zod';
import { HumanMessage, AIMessage } from '@langchain/core/messages';
import dotenv from 'dotenv';
// Initialize environment
dotenv.config({ path: '../.env' });
const OPENAI_API_KEY = process.env.OPENAI_API_KEY?.trim();
/**
 * Web Search Tool
 * Searches for relevant legal information, consumer rights, etc.
 */
class WebSearchTool extends StructuredTool {
    constructor() {
        super(...arguments);
        this.name = "web_search";
        this.description = "Search the web for legal information, credit dispute laws, and consumer rights";
        this.schema = z.object({
            query: z.string().describe("The search query to find legal information")
        });
    }
    async _call({ query }) {
        // Mock response based on query type
        if (query.toLowerCase().includes('fcra') || query.toLowerCase().includes('fair credit')) {
            return "The Fair Credit Reporting Act (FCRA) requires credit bureaus to investigate disputes within 30 days. " +
                "You can dispute inaccurate information, and the bureau must verify it or remove it.";
        }
        else if (query.toLowerCase().includes('fdcpa') || query.toLowerCase().includes('debt collection')) {
            return "The Fair Debt Collection Practices Act (FDCPA) prohibits debt collectors from using abusive practices. " +
                "You can dispute a debt within 30 days of first contact.";
        }
        else {
            return "Found relevant consumer protection laws: FCRA (credit reporting) and FDCPA (debt collection). " +
                "Both provide consumers with rights to dispute inaccurate information.";
        }
    }
}
/**
 * Generate Dispute Letter Tool
 * Creates customized dispute letters based on provided issues
 */
class GenerateLetterTool extends StructuredTool {
    constructor() {
        super(...arguments);
        this.name = "generate_letter";
        this.description = "Generate a dispute letter for credit bureaus or debt collectors";
        this.schema = z.object({
            type: z.enum(['credit_bureau', 'debt_collector']),
            recipient: z.string(),
            issues: z.array(z.string()),
            userInfo: z.object({
                name: z.string(),
                address: z.string(),
                phone: z.string().optional(),
                email: z.string().optional()
            })
        });
    }
    async _call({ type, recipient, issues, userInfo }) {
        const date = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const letterTemplate = type === 'credit_bureau'
            ? `Re: Dispute of Inaccurate Credit Information - Consumer File

Under the Fair Credit Reporting Act (FCRA), I am writing to dispute the following information in my credit file:

{issues}

As required by Section 611 [15 U.S.C. § 1681i] of the FCRA, please investigate these matters and correct or delete the disputed items.`
            : `Re: Debt Dispute and Validation Request

Under the Fair Debt Collection Practices Act (FDCPA), I dispute the validity of this debt and request validation:

{issues}

As required by Section 809(b) of the FDCPA, please cease collection until you provide validation.`;
        const letter = `${date}

${userInfo.name}
${userInfo.address}
${userInfo.phone ? `Phone: ${userInfo.phone}\n` : ''}${userInfo.email ? `Email: ${userInfo.email}\n` : ''}

${recipient}

${letterTemplate.replace('{issues}', issues.map(issue => `- ${issue}`).join('\n'))}

Sincerely,
${userInfo.name}`;
        return letter;
    }
}
const webSearchTool = new WebSearchTool();
const generateLetterTool = new GenerateLetterTool();
/**
 * Create the Supervisor Agent that coordinates the tools
 */
const model = new ChatOpenAI({
    modelName: 'gpt-4',
    temperature: 0
});
// Agent will be created per request in callAgentAPI
// Store chat sessions in memory
const sessionStates = new Map();
/**
 * Main API function
 */
export async function callAgentAPI(message, sessionId, userId) {
    if (!OPENAI_API_KEY) {
        throw new Error('OpenAI API key is required');
    }
    try {
        // Get or create session state
        let session = sessionStates.get(sessionId);
        if (!session) {
            session = { messages: [] };
            sessionStates.set(sessionId, session);
        }
        // Create the agent prompt
        const prompt = ChatPromptTemplate.fromMessages([
            ["system", `You are DisputeAI, a professional AI assistant specializing in credit disputes and debt collection issues. You have access to two tools:

1. web_search - Use this to find relevant legal information about consumer rights, the FCRA, and the FDCPA
2. generate_letter - Use this to create dispute letters for credit bureaus or debt collectors

Guidelines:
- Respond directly to the user's questions without prefixing with "User:" or similar
- Be professional, helpful, and provide actionable advice
- Use tools when needed to gather legal information or generate documents
- Focus on consumer rights under FCRA and FDCPA
- Always provide clear next steps

Remember: You are responding as the AI assistant, not narrating a conversation.`],
            new MessagesPlaceholder("chat_history"),
            new MessagesPlaceholder("agent_scratchpad"),
        ]);
        // Create the agent using OpenAI functions format
        const agent = await createOpenAIToolsAgent({
            llm: model,
            tools: [webSearchTool, generateLetterTool],
            prompt: prompt
        });
        const agentExecutor = new AgentExecutor({
            agent,
            tools: [webSearchTool, generateLetterTool]
        });
        // Execute the agent with current chat history (before adding current message)
        const response = await agentExecutor.invoke({
            input: message,
            chat_history: session.messages
        });
        // After successful response, add both user message and AI response to history
        const userMessage = new HumanMessage(message);
        const aiMessage = new AIMessage(response.output);
        session.messages.push(userMessage);
        session.messages.push(aiMessage);
        return {
            text: response.output,
            metadata: {
                sessionId,
                userId,
                timestamp: new Date().toISOString()
            }
        };
    }
    catch (error) {
        console.error('Error in DisputeAI:', error);
        throw error;
    }
}
export function clearChatSessionMemory(sessionId) {
    return sessionStates.delete(sessionId);
}
export function clearAllChatSessionMemories() {
    sessionStates.clear();
}
