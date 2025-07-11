"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b)
                if (b.hasOwnProperty(p))
                    d[p] = b[p]; };
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
        function fulfilled(value) { try {
            step(generator.next(value));
        }
        catch (e) {
            reject(e);
        } }
        function rejected(value) { try {
            step(generator["throw"](value));
        }
        catch (e) {
            reject(e);
        } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function () { if (t[0] & 1)
            throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function () { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f)
            throw new TypeError("Generator is already executing.");
        while (_)
            try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
                    return t;
                if (y = 0, t)
                    op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0:
                    case 1:
                        t = op;
                        break;
                    case 4:
                        _.label++;
                        return { value: op[1], done: false };
                    case 5:
                        _.label++;
                        y = op[1];
                        op = [0];
                        continue;
                    case 7:
                        op = _.ops.pop();
                        _.trys.pop();
                        continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                            _ = 0;
                            continue;
                        }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                            _.label = op[1];
                            break;
                        }
                        if (op[0] === 6 && _.label < t[1]) {
                            _.label = t[1];
                            t = op;
                            break;
                        }
                        if (t && _.label < t[2]) {
                            _.label = t[2];
                            _.ops.push(op);
                            break;
                        }
                        if (t[2])
                            _.ops.pop();
                        _.trys.pop();
                        continue;
                }
                op = body.call(thisArg, _);
            }
            catch (e) {
                op = [6, e];
                y = 0;
            }
            finally {
                f = t = 0;
            }
        if (op[0] & 5)
            throw op[1];
        return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _a;
exports.__esModule = true;
exports.clearAllChatSessionMemories = exports.clearChatSessionMemory = exports.callAgentAPI = void 0;
var openai_1 = require("@langchain/openai");
var tools_1 = require("@langchain/core/tools");
var agents_1 = require("langchain/agents");
var prompts_1 = require("@langchain/core/prompts");
var zod_1 = require("zod");
var messages_1 = require("@langchain/core/messages");
var dotenv_1 = require("dotenv");
// Initialize environment
dotenv_1["default"].config({ path: '../.env' });
var OPENAI_API_KEY = (_a = process.env.OPENAI_API_KEY) === null || _a === void 0 ? void 0 : _a.trim();
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
 * Creates customized dispute letters based on provided issues
 */
var GenerateLetterTool = /** @class */ (function (_super) {
    __extends(GenerateLetterTool, _super);
    function GenerateLetterTool() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.name = "generate_letter";
        _this.description = "Generate a dispute letter for credit bureaus or debt collectors";
        _this.schema = zod_1.z.object({
            type: zod_1.z["enum"](['credit_bureau', 'debt_collector']),
            recipient: zod_1.z.string(),
            issues: zod_1.z.array(zod_1.z.string()),
            userInfo: zod_1.z.object({
                name: zod_1.z.string(),
                address: zod_1.z.string(),
                phone: zod_1.z.string().optional(),
                email: zod_1.z.string().optional()
            })
        });
        return _this;
    }
    GenerateLetterTool.prototype._call = function (_a) {
        var type = _a.type, recipient = _a.recipient, issues = _a.issues, userInfo = _a.userInfo;
        return __awaiter(this, void 0, Promise, function () {
            var date, letterTemplate, letter;
            return __generator(this, function (_b) {
                date = new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                letterTemplate = type === 'credit_bureau'
                    ? "Re: Dispute of Inaccurate Credit Information - Consumer File\n\nUnder the Fair Credit Reporting Act (FCRA), I am writing to dispute the following information in my credit file:\n\n{issues}\n\nAs required by Section 611 [15 U.S.C. \u00A7 1681i] of the FCRA, please investigate these matters and correct or delete the disputed items."
                    : "Re: Debt Dispute and Validation Request\n\nUnder the Fair Debt Collection Practices Act (FDCPA), I dispute the validity of this debt and request validation:\n\n{issues}\n\nAs required by Section 809(b) of the FDCPA, please cease collection until you provide validation.";
                letter = date + "\n\n" + userInfo.name + "\n" + userInfo.address + "\n" + (userInfo.phone ? "Phone: " + userInfo.phone + "\n" : '') + (userInfo.email ? "Email: " + userInfo.email + "\n" : '') + "\n\n" + recipient + "\n\n" + letterTemplate.replace('{issues}', issues.map(function (issue) { return "- " + issue; }).join('\n')) + "\n\nSincerely,\n" + userInfo.name;
                return [2 /*return*/, letter];
            });
        });
    };
    return GenerateLetterTool;
}(tools_1.StructuredTool));
var webSearchTool = new WebSearchTool();
var generateLetterTool = new GenerateLetterTool();
/**
 * Create the Supervisor Agent that coordinates the tools
 */
var model = new openai_1.ChatOpenAI({
    modelName: 'gpt-4',
    temperature: 0
});
// Agent will be created per request in callAgentAPI
// Store chat sessions in memory
var sessionStates = new Map();
/**
 * Main API function
 */
function callAgentAPI(message, sessionId, userId) {
    return __awaiter(this, void 0, Promise, function () {
        var session, prompt, agent, agentExecutor, response, userMessage, aiMessage, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!OPENAI_API_KEY) {
                        throw new Error('OpenAI API key is required');
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    session = sessionStates.get(sessionId);
                    if (!session) {
                        session = { messages: [] };
                        sessionStates.set(sessionId, session);
                    }
                    prompt = prompts_1.ChatPromptTemplate.fromMessages([
                        ["system", "You are DisputeAI, a professional AI assistant specializing in credit disputes and debt collection issues. You have access to two tools:\n\n1. web_search - Use this to find relevant legal information about consumer rights, the FCRA, and the FDCPA\n2. generate_letter - Use this to create dispute letters for credit bureaus or debt collectors\n\nGuidelines:\n- Respond directly to the user's questions without prefixing with \"User:\" or similar\n- Be professional, helpful, and provide actionable advice\n- Use tools when needed to gather legal information or generate documents\n- Focus on consumer rights under FCRA and FDCPA\n- Always provide clear next steps\n\nRemember: You are responding as the AI assistant, not narrating a conversation."],
                        new prompts_1.MessagesPlaceholder("chat_history"),
                        new prompts_1.MessagesPlaceholder("agent_scratchpad"),
                    ]);
                    return [4 /*yield*/, agents_1.createOpenAIToolsAgent({
                            llm: model,
                            tools: [webSearchTool, generateLetterTool],
                            prompt: prompt
                        })];
                case 2:
                    agent = _a.sent();
                    agentExecutor = new agents_1.AgentExecutor({
                        agent: agent,
                        tools: [webSearchTool, generateLetterTool]
                    });
                    return [4 /*yield*/, agentExecutor.invoke({
                            input: message,
                            chat_history: session.messages
                        })];
                case 3:
                    response = _a.sent();
                    userMessage = new messages_1.HumanMessage(message);
                    aiMessage = new messages_1.AIMessage(response.output);
                    session.messages.push(userMessage);
                    session.messages.push(aiMessage);
                    return [2 /*return*/, {
                            text: response.output,
                            metadata: {
                                sessionId: sessionId,
                                userId: userId,
                                timestamp: new Date().toISOString()
                            }
                        }];
                case 4:
                    error_1 = _a.sent();
                    console.error('Error in DisputeAI:', error_1);
                    throw error_1;
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.callAgentAPI = callAgentAPI;
function clearChatSessionMemory(sessionId) {
    return sessionStates["delete"](sessionId);
}
exports.clearChatSessionMemory = clearChatSessionMemory;
function clearAllChatSessionMemories() {
    sessionStates.clear();
}
exports.clearAllChatSessionMemories = clearAllChatSessionMemories;
