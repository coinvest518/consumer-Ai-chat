import { ChatOpenAI } from '@langchain/openai';
import { Tool, StructuredTool } from '@langchain/core/tools';
import { AgentExecutor, createOpenAIToolsAgent } from 'langchain/agents';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { z } from 'zod';
import { 
  SystemMessage, 
  HumanMessage,
  AIMessage
} from '@langchain/core/messages';

// API Response interface
export interface AIResponse {
  text: string;
  metadata?: any;
}

/**
 * Web Search Tool
 * Searches for relevant legal information, consumer rights, etc.
 */
class WebSearchTool extends StructuredTool {
  name = "web_search";
  description = "Search the web for legal information, credit dispute laws, and consumer rights";
  schema = z.object({
    query: z.string().describe("The search query to find legal information")
  });

  protected async _call({ query }: z.infer<typeof this.schema>): Promise<string> {
    // Mock response based on query type
    if (query.toLowerCase().includes('fcra') || query.toLowerCase().includes('fair credit')) {
      return "The Fair Credit Reporting Act (FCRA) requires credit bureaus to investigate disputes within 30 days. " +
             "You can dispute inaccurate information, and the bureau must verify it or remove it.";
    } else if (query.toLowerCase().includes('fdcpa') || query.toLowerCase().includes('debt collection')) {
      return "The Fair Debt Collection Practices Act (FDCPA) prohibits debt collectors from using abusive practices. " +
             "You can dispute a debt within 30 days of first contact.";
    } else {
      return "Found relevant consumer protection laws: FCRA (credit reporting) and FDCPA (debt collection). " +
             "Both provide consumers with rights to dispute inaccurate information.";
    }
  }
}

/**
 * Generate Dispute Letter Tool
 */
class GenerateDisputeLetterTool extends StructuredTool {
  name = "generate_dispute_letter";
  description = "Generate a formal dispute letter for credit report errors or debt collection issues";
  schema = z.object({
    disputeType: z.string().describe("Type of dispute (credit report error, debt validation, etc.)"),
    details: z.string().describe("Specific details about the dispute"),
    consumerInfo: z.string().describe("Consumer's name and address")
  });

  protected async _call({ disputeType, details, consumerInfo }: z.infer<typeof this.schema>): Promise<string> {
    const date = new Date().toLocaleDateString();
    
    if (disputeType.toLowerCase().includes('credit')) {
      return `Date: ${date}

${consumerInfo}

To Whom It May Concern:

I am writing to dispute the following information on my credit report:

${details}

This information is inaccurate and I request that it be investigated and removed from my credit report as required under the Fair Credit Reporting Act (FCRA).

Please provide me with written confirmation of the deletion or correction.

Sincerely,
[Your signature]`;
    } else {
      return `Date: ${date}

${consumerInfo}

Dear Debt Collector:

I am disputing the debt you claim I owe. Under the Fair Debt Collection Practices Act (FDCPA), I have the right to request validation of this debt.

${details}

Please provide proof that I owe this debt and that you have the right to collect it.

Sincerely,
[Your signature]`;
    }
  }
}

/**
 * Memory storage for chat sessions
 */
const chatSessionMemories = new Map<string, Array<SystemMessage | HumanMessage | AIMessage>>();

/**
 * Get chat session memory
 */
function getChatSessionMemory(sessionId: string): Array<SystemMessage | HumanMessage | AIMessage> {
  if (!chatSessionMemories.has(sessionId)) {
    chatSessionMemories.set(sessionId, []);
  }
  return chatSessionMemories.get(sessionId)!;
}

/**
 * Clear chat session memory
 */
export function clearChatSessionMemory(sessionId: string): boolean {
  return chatSessionMemories.delete(sessionId);
}

/**
 * Clear all chat session memories
 */
export function clearAllChatSessionMemories(): void {
  chatSessionMemories.clear();
}

/**
 * Main function to call the AI agent
 */
export async function callAgentAPI(message: string, sessionId: string, userId: string): Promise<AIResponse> {
  try {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY?.trim();
    
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    // Initialize the language model
    const llm = new ChatOpenAI({
      openAIApiKey: OPENAI_API_KEY,
      modelName: 'gpt-4o-mini',
      temperature: 0.7,
      maxTokens: 1000,
    });

    // Create tools
    const tools = [
      new WebSearchTool(),
      new GenerateDisputeLetterTool(),
    ];

    // Create the prompt template
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", `You are ConsumerAI, an expert legal assistant specializing in consumer protection law, credit disputes, and debt collection issues. 

Your expertise includes:
- Fair Credit Reporting Act (FCRA)
- Fair Debt Collection Practices Act (FDCPA) 
- Truth in Lending Act (TILA)
- Fair Credit Billing Act (FCBA)
- Credit repair strategies
- Debt validation processes
- Consumer rights and protections

Guidelines:
- Provide accurate, actionable legal information
- Always suggest specific steps users can take
- Reference relevant laws when applicable
- Be empathetic but professional
- If unsure about legal advice, recommend consulting an attorney
- Focus on consumer empowerment and education

Remember: You provide legal information, not legal advice. Always recommend users consult with qualified attorneys for complex legal matters.`],
      new MessagesPlaceholder("chat_history"),
      ["human", "{input}"],
      new MessagesPlaceholder("agent_scratchpad"),
    ]);

    // Create the agent
    const agent = await createOpenAIToolsAgent({
      llm,
      tools,
      prompt,
    });

    // Create the agent executor
    const agentExecutor = new AgentExecutor({
      agent,
      tools,
      maxIterations: 3,
      verbose: false,
    });

    // Get session memory
    const chatHistory = getChatSessionMemory(sessionId);

    // Add user message to memory
    chatHistory.push(new HumanMessage(message));

    // Execute the agent
    const result = await agentExecutor.invoke({
      input: message,
      chat_history: chatHistory,
    });

    // Add AI response to memory
    if (result.output) {
      chatHistory.push(new AIMessage(result.output));
    }

    // Keep memory size manageable (last 20 messages)
    if (chatHistory.length > 20) {
      chatHistory.splice(0, chatHistory.length - 20);
    }

    return {
      text: result.output || "I'm having trouble processing your request right now. Please try again.",
      metadata: {
        sessionId,
        userId,
        timestamp: new Date().toISOString(),
      }
    };

  } catch (error) {
    console.error('Error in callAgentAPI:', error);
    
    // Return a helpful error message to the user
    return {
      text: "I'm experiencing some technical difficulties right now. Please try again in a moment, or contact support if the issue persists.",
      metadata: {
        error: error instanceof Error ? error.message : 'Unknown error',
        sessionId,
        userId,
        timestamp: new Date().toISOString(),
      }
    };
  }
}
