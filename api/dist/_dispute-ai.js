"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.callAgentAPI = exports.clearAllChatSessionMemories = exports.clearChatSessionMemory = void 0;
var openai_1 = require("@langchain/openai");
var tools_1 = require("@langchain/core/tools");
var agents_1 = require("langchain/agents");
var prompts_1 = require("@langchain/core/prompts");
var zod_1 = require("zod");
var messages_1 = require("@langchain/core/messages");
/**
 * Web Search Tool
 * Searches for relevant legal information, consumer rights, etc.
 */
var WebSearchTool = /** @class */ (function (_super) {
    __extends(WebSearchTool, _super);
    function WebSearchTool() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.name = "web_search";
        _this.description = "Search the web for legal information, credit dispute laws, and consumer rights";
        _this.schema = zod_1.z.object({
            query: zod_1.z.string().describe("The search query to find legal information")
        });
        return _this;
    }
    WebSearchTool.prototype._call = function (_a) {
        var query = _a.query;
        return __awaiter(this, void 0, Promise, function () {
            return __generator(this, function (_b) {
                // Mock response based on query type
                if (query.toLowerCase().includes('fcra') || query.toLowerCase().includes('fair credit')) {
                    return [2 /*return*/, "The Fair Credit Reporting Act (FCRA) requires credit bureaus to investigate disputes within 30 days. " +
                            "You can dispute inaccurate information, and the bureau must verify it or remove it."];
                }
                else if (query.toLowerCase().includes('fdcpa') || query.toLowerCase().includes('debt collection')) {
                    return [2 /*return*/, "The Fair Debt Collection Practices Act (FDCPA) prohibits debt collectors from using abusive practices. " +
                            "You can dispute a debt within 30 days of first contact."];
                }
                else {
                    return [2 /*return*/, "Found relevant consumer protection laws: FCRA (credit reporting) and FDCPA (debt collection). " +
                            "Both provide consumers with rights to dispute inaccurate information."];
                }
                return [2 /*return*/];
            });
        });
    };
    return WebSearchTool;
}(tools_1.StructuredTool));
/**
 * Generate Dispute Letter Tool
 */
var GenerateDisputeLetterTool = /** @class */ (function (_super) {
    __extends(GenerateDisputeLetterTool, _super);
    function GenerateDisputeLetterTool() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.name = "generate_dispute_letter";
        _this.description = "Generate a formal dispute letter for credit report errors or debt collection issues";
        _this.schema = zod_1.z.object({
            disputeType: zod_1.z.string().describe("Type of dispute (credit report error, debt validation, etc.)"),
            details: zod_1.z.string().describe("Specific details about the dispute"),
            consumerInfo: zod_1.z.string().describe("Consumer's name and address")
        });
        return _this;
    }
    GenerateDisputeLetterTool.prototype._call = function (_a) {
        var disputeType = _a.disputeType, details = _a.details, consumerInfo = _a.consumerInfo;
        return __awaiter(this, void 0, Promise, function () {
            var date;
            return __generator(this, function (_b) {
                date = new Date().toLocaleDateString();
                if (disputeType.toLowerCase().includes('credit')) {
                    return [2 /*return*/, "Date: " + date + "\n\n" + consumerInfo + "\n\nTo Whom It May Concern:\n\nI am writing to dispute the following information on my credit report:\n\n" + details + "\n\nThis information is inaccurate and I request that it be investigated and removed from my credit report as required under the Fair Credit Reporting Act (FCRA).\n\nPlease provide me with written confirmation of the deletion or correction.\n\nSincerely,\n[Your signature]"];
                }
                else {
                    return [2 /*return*/, "Date: " + date + "\n\n" + consumerInfo + "\n\nDear Debt Collector:\n\nI am disputing the debt you claim I owe. Under the Fair Debt Collection Practices Act (FDCPA), I have the right to request validation of this debt.\n\n" + details + "\n\nPlease provide proof that I owe this debt and that you have the right to collect it.\n\nSincerely,\n[Your signature]"];
                }
                return [2 /*return*/];
            });
        });
    };
    return GenerateDisputeLetterTool;
}(tools_1.StructuredTool));
/**
 * Memory storage for chat sessions
 */
var chatSessionMemories = new Map();
/**
 * Get chat session memory
 */
function getChatSessionMemory(sessionId) {
    if (!chatSessionMemories.has(sessionId)) {
        chatSessionMemories.set(sessionId, []);
    }
    return chatSessionMemories.get(sessionId);
}
/**
 * Clear chat session memory
 */
function clearChatSessionMemory(sessionId) {
    return chatSessionMemories["delete"](sessionId);
}
exports.clearChatSessionMemory = clearChatSessionMemory;
/**
 * Clear all chat session memories
 */
function clearAllChatSessionMemories() {
    chatSessionMemories.clear();
}
exports.clearAllChatSessionMemories = clearAllChatSessionMemories;
/**
 * Main function to call the AI agent
 */
function callAgentAPI(message, sessionId, userId) {
    var _a;
    return __awaiter(this, void 0, Promise, function () {
        var OPENAI_API_KEY, llm, tools, prompt, agent, agentExecutor, chatHistory, result, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    OPENAI_API_KEY = (_a = process.env.OPENAI_API_KEY) === null || _a === void 0 ? void 0 : _a.trim();
                    if (!OPENAI_API_KEY) {
                        throw new Error('OpenAI API key not configured');
                    }
                    llm = new openai_1.ChatOpenAI({
                        openAIApiKey: OPENAI_API_KEY,
                        modelName: 'gpt-4o-mini',
                        temperature: 0.7,
                        maxTokens: 1000
                    });
                    tools = [
                        new WebSearchTool(),
                        new GenerateDisputeLetterTool(),
                    ];
                    prompt = prompts_1.ChatPromptTemplate.fromMessages([
                        ["system", "You are ConsumerAI, an expert legal assistant specializing in consumer protection law, credit disputes, and debt collection issues. \n\nYour expertise includes:\n- Fair Credit Reporting Act (FCRA)\n- Fair Debt Collection Practices Act (FDCPA) \n- Truth in Lending Act (TILA)\n- Fair Credit Billing Act (FCBA)\n- Credit repair strategies\n- Debt validation processes\n- Consumer rights and protections\n\nGuidelines:\n- Provide accurate, actionable legal information\n- Always suggest specific steps users can take\n- Reference relevant laws when applicable\n- Be empathetic but professional\n- If unsure about legal advice, recommend consulting an attorney\n- Focus on consumer empowerment and education\n\nRemember: You provide legal information, not legal advice. Always recommend users consult with qualified attorneys for complex legal matters."],
                        new prompts_1.MessagesPlaceholder("chat_history"),
                        ["human", "{input}"],
                        new prompts_1.MessagesPlaceholder("agent_scratchpad"),
                    ]);
                    return [4 /*yield*/, agents_1.createOpenAIToolsAgent({
                            llm: llm,
                            tools: tools,
                            prompt: prompt
                        })];
                case 1:
                    agent = _b.sent();
                    agentExecutor = new agents_1.AgentExecutor({
                        agent: agent,
                        tools: tools,
                        maxIterations: 3,
                        verbose: false
                    });
                    chatHistory = getChatSessionMemory(sessionId);
                    // Add user message to memory
                    chatHistory.push(new messages_1.HumanMessage(message));
                    return [4 /*yield*/, agentExecutor.invoke({
                            input: message,
                            chat_history: chatHistory
                        })];
                case 2:
                    result = _b.sent();
                    // Add AI response to memory
                    if (result.output) {
                        chatHistory.push(new messages_1.AIMessage(result.output));
                    }
                    // Keep memory size manageable (last 20 messages)
                    if (chatHistory.length > 20) {
                        chatHistory.splice(0, chatHistory.length - 20);
                    }
                    return [2 /*return*/, {
                            text: result.output || "I'm having trouble processing your request right now. Please try again.",
                            metadata: {
                                sessionId: sessionId,
                                userId: userId,
                                timestamp: new Date().toISOString()
                            }
                        }];
                case 3:
                    error_1 = _b.sent();
                    console.error('Error in callAgentAPI:', error_1);
                    // Return a helpful error message to the user
                    return [2 /*return*/, {
                            text: "I'm experiencing some technical difficulties right now. Please try again in a moment, or contact support if the issue persists.",
                            metadata: {
                                error: error_1 instanceof Error ? error_1.message : 'Unknown error',
                                sessionId: sessionId,
                                userId: userId,
                                timestamp: new Date().toISOString()
                            }
                        }];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.callAgentAPI = callAgentAPI;
