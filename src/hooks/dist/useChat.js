"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.useChat = void 0;
var react_1 = require("react");
var AuthContext_1 = require("@/contexts/AuthContext");
var api_1 = require("@/lib/api");
var config_1 = require("@/lib/config");
function useChat() {
    var _this = this;
    var user = AuthContext_1.useAuth().user;
    var _a = react_1.useState([
        {
            id: "0-ai",
            text: "Hi there! I'm your ConsumerAI assistant. I can help with questions about credit reports, debt collection, and consumer protection laws. What can I help you with today?",
            sender: "bot",
            type: "ai",
            timestamp: Date.now()
        },
    ]), messages = _a[0], setMessages = _a[1];
    var _b = react_1.useState(false), isLoading = _b[0], setIsLoading = _b[1];
    var _c = react_1.useState(null), error = _c[0], setError = _c[1];
    var _d = react_1.useState({
        dailyLimit: 5,
        chatsUsedToday: 0,
        isProUser: false
    }), chatLimits = _d[0], setChatLimits = _d[1];
    var _e = react_1.useState([]), chatSessions = _e[0], setChatSessions = _e[1];
    // Load messages from localStorage on mount
    react_1.useEffect(function () {
        if (!(user === null || user === void 0 ? void 0 : user.id))
            return;
        var savedMessages = localStorage.getItem("chat-messages-" + user.id);
        if (savedMessages) {
            try {
                var parsedMessages = JSON.parse(savedMessages).map(function (msg) { return (__assign(__assign({}, msg), { timestamp: typeof msg.timestamp === 'string' ? new Date(msg.timestamp).getTime() : msg.timestamp })); });
                setMessages(parsedMessages);
            }
            catch (e) {
                console.error("Failed to parse saved messages:", e);
                localStorage.removeItem("chat-messages-" + user.id);
            }
        }
    }, [user]);
    // Save messages to localStorage when they change
    react_1.useEffect(function () {
        if (messages.length > 1 && (user === null || user === void 0 ? void 0 : user.id)) {
            localStorage.setItem("chat-messages-" + user.id, JSON.stringify(messages));
        }
    }, [messages, user]);
    // Fetch chat limits on mount
    react_1.useEffect(function () {
        if (!user)
            return;
        var fetchLimits = function () { return __awaiter(_this, void 0, void 0, function () {
            var metrics, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        console.log('Fetching chat limits for user:', user.id);
                        return [4 /*yield*/, api_1.api.getChatLimits(user.id)];
                    case 1:
                        metrics = _a.sent();
                        if (metrics) {
                            console.log('Received metrics:', metrics);
                            setChatLimits({
                                dailyLimit: metrics.daily_limit || 5,
                                chatsUsedToday: metrics.chats_used || 0,
                                isProUser: metrics.is_pro || false
                            });
                        }
                        else {
                            // Fallback to default limits
                            console.log('No metrics received, using defaults');
                            setChatLimits({ dailyLimit: 5, chatsUsedToday: 0, isProUser: false });
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        console.error('Failed to fetch chat limits:', error_1);
                        // Always set default limits on error to avoid blocking the app
                        setChatLimits({ dailyLimit: 5, chatsUsedToday: 0, isProUser: false });
                        // Only show error for non-API connectivity issues
                        if ((error_1 === null || error_1 === void 0 ? void 0 : error_1.message) && !error_1.message.includes('404') && !error_1.message.includes('fetch')) {
                            setError("Couldn't load your usage data. Using default limits for now.");
                        }
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        fetchLimits();
    }, [user]);
    var updateChatMetrics = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(user === null || user === void 0 ? void 0 : user.id))
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, api_1.api.updateChatMetrics(user.id)];
                case 2:
                    _a.sent();
                    // Save chat history with proper structure
                    return [4 /*yield*/, api_1.api.saveChat({
                            userId: user.id,
                            message: messages.filter(function (m) { return m.id !== "0-ai"; }).map(function (m) { return m.text; }).join('\n'),
                            response: messages.filter(function (m) { return m.sender === "bot" && m.id !== "0-ai"; }).map(function (m) { return m.text; }).join('\n') // Combine bot responses
                        })];
                case 3:
                    // Save chat history with proper structure
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    error_2 = _a.sent();
                    console.error('Error updating chat metrics:', error_2);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var sendMessage = react_1.useCallback(function (userInput) { return __awaiter(_this, void 0, void 0, function () {
        var userMessage, maxRetries, retryCount, _loop_1, state_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!userInput.trim())
                        return [2 /*return*/];
                    if (!chatLimits.isProUser && chatLimits.chatsUsedToday >= chatLimits.dailyLimit) {
                        setError('Daily limit reached. You\'ve used all your credits. Purchase more to continue chatting.');
                        throw new Error('Credit limit reached');
                    }
                    userMessage = {
                        id: Date.now().toString() + '-user',
                        text: userInput,
                        sender: "user",
                        type: "user",
                        timestamp: Date.now()
                    };
                    setMessages(function (prevMessages) { return __spreadArrays(prevMessages, [userMessage]); });
                    setIsLoading(true);
                    setError(null);
                    maxRetries = 3;
                    retryCount = 0;
                    _loop_1 = function () {
                        var controller_1, timeoutId, response, errorData, result_1, botMessage_1, err_1, errorMessage, systemMessage_1;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 6, , 10]);
                                    controller_1 = new AbortController();
                                    timeoutId = setTimeout(function () { return controller_1.abort(); }, 30000);
                                    return [4 /*yield*/, fetch(config_1.getApiUrl('/chat'), {
                                            method: 'POST',
                                            headers: {
                                                'Content-Type': 'application/json',
                                                'Accept': 'application/json'
                                            },
                                            credentials: 'include',
                                            signal: controller_1.signal,
                                            body: JSON.stringify({
                                                message: userInput,
                                                sessionId: ((_a = messages[0]) === null || _a === void 0 ? void 0 : _a.id) || Date.now().toString(),
                                                userId: user === null || user === void 0 ? void 0 : user.id
                                            })
                                        })];
                                case 1:
                                    response = _a.sent();
                                    clearTimeout(timeoutId);
                                    if (!!response.ok) return [3 /*break*/, 3];
                                    return [4 /*yield*/, response.json()["catch"](function () { return ({}); })];
                                case 2:
                                    errorData = _a.sent();
                                    throw new Error(errorData.message ||
                                        "Server error: " + response.status + " " + response.statusText);
                                case 3: return [4 /*yield*/, response.json()];
                                case 4:
                                    result_1 = _a.sent();
                                    // Validate the response format
                                    if (!result_1 || typeof result_1.text !== 'string') {
                                        throw new Error('Invalid response format from server');
                                    }
                                    botMessage_1 = {
                                        id: Date.now().toString() + '-bot',
                                        text: result_1.text,
                                        sender: "bot",
                                        type: "ai",
                                        timestamp: Date.now(),
                                        citation: result_1.citation,
                                        actions: result_1.actions
                                    };
                                    setMessages(function (prevMessages) { return __spreadArrays(prevMessages, [botMessage_1]); });
                                    // Update chat count with server response
                                    if (typeof result_1.chatsUsed === 'number') {
                                        setChatLimits(function (prev) { return (__assign(__assign({}, prev), { chatsUsedToday: result_1.chatsUsed, dailyLimit: result_1.dailyLimit || prev.dailyLimit })); });
                                    }
                                    // Update metrics after successful message
                                    return [4 /*yield*/, updateChatMetrics()];
                                case 5:
                                    // Update metrics after successful message
                                    _a.sent();
                                    return [2 /*return*/, "break"];
                                case 6:
                                    err_1 = _a.sent();
                                    retryCount++;
                                    if (err_1.name === 'AbortError') {
                                        if (retryCount === maxRetries) {
                                            setError('Request timed out. Please try again.');
                                            console.error("Request timeout after all retries");
                                        }
                                        return [2 /*return*/, "continue"];
                                    }
                                    console.error("Error sending message:", err_1);
                                    if (!(retryCount === maxRetries)) return [3 /*break*/, 7];
                                    errorMessage = err_1.message.includes('Failed to fetch')
                                        ? 'Unable to reach the server. Please check your internet connection.'
                                        : err_1.message || 'An unexpected error occurred';
                                    setError(errorMessage);
                                    systemMessage_1 = {
                                        id: Date.now().toString() + '-system',
                                        text: errorMessage,
                                        sender: "bot",
                                        type: "system",
                                        timestamp: Date.now()
                                    };
                                    setMessages(function (prev) { return __spreadArrays(prev, [systemMessage_1]); });
                                    return [3 /*break*/, 9];
                                case 7: 
                                // Wait before retrying (exponential backoff)
                                return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, Math.pow(2, retryCount) * 1000); })];
                                case 8:
                                    // Wait before retrying (exponential backoff)
                                    _a.sent();
                                    return [2 /*return*/, "continue"];
                                case 9: return [3 /*break*/, 10];
                                case 10: return [2 /*return*/];
                            }
                        });
                    };
                    _b.label = 1;
                case 1:
                    if (!(retryCount < maxRetries)) return [3 /*break*/, 3];
                    return [5 /*yield**/, _loop_1()];
                case 2:
                    state_1 = _b.sent();
                    if (state_1 === "break")
                        return [3 /*break*/, 3];
                    return [3 /*break*/, 1];
                case 3:
                    setIsLoading(false);
                    return [2 /*return*/];
            }
        });
    }); }, [chatLimits, messages, updateChatMetrics, user]);
    var clearChat = react_1.useCallback(function () {
        setMessages([
            {
                id: "0-ai",
                text: "Hi there! I'm your ConsumerAI assistant. I can help with questions about credit reports, debt collection, and consumer protection laws. What can I help you with today?",
                sender: "bot",
                type: "ai",
                timestamp: Date.now()
            },
        ]);
        if (user === null || user === void 0 ? void 0 : user.id) {
            localStorage.removeItem("chat-messages-" + user.id);
        }
    }, [user]);
    // Reset chat state when user changes (new login)
    react_1.useEffect(function () {
        if (user === null || user === void 0 ? void 0 : user.id) {
            // Clear any existing messages and reset to default
            setMessages([
                {
                    id: "0-ai",
                    text: "Hi there! I'm your ConsumerAI assistant. I can help with questions about credit reports, debt collection, and consumer protection laws. What can I help you with today?",
                    sender: "bot",
                    type: "ai",
                    timestamp: Date.now()
                },
            ]);
            // Reset chat limits for new user session
            setChatLimits({
                dailyLimit: 5,
                chatsUsedToday: 0,
                isProUser: false
            });
        }
    }, [user === null || user === void 0 ? void 0 : user.id]);
    // Clean up old localStorage data when user changes
    react_1.useEffect(function () {
        if (user === null || user === void 0 ? void 0 : user.id) {
            // Remove old generic localStorage keys that might cause issues
            localStorage.removeItem('chat-messages');
            localStorage.removeItem('chatLimits');
            // Only keep data for the current user
            var keys = Object.keys(localStorage);
            keys.forEach(function (key) {
                if ((key.startsWith('chat-messages-') || key.startsWith('chatLimits-')) &&
                    !key.endsWith(user.id)) {
                    // Clean up other users' data from this browser to prevent confusion
                    localStorage.removeItem(key);
                }
            });
        }
    }, [user === null || user === void 0 ? void 0 : user.id]);
    // Reset counts at midnight
    react_1.useEffect(function () {
        if (!(user === null || user === void 0 ? void 0 : user.id))
            return;
        var resetTime = new Date();
        resetTime.setHours(24, 0, 0, 0);
        var timeUntilReset = resetTime.getTime() - Date.now();
        var timer = setTimeout(function () {
            setChatLimits(function (prev) { return (__assign(__assign({}, prev), { chatsUsedToday: 0 })); });
            localStorage.removeItem("chatLimits-" + user.id);
        }, timeUntilReset);
        return function () { return clearTimeout(timer); };
    }, [user]);
    var updateMessages = react_1.useCallback(function (newMessages) {
        console.log("Setting messages:", newMessages);
        setMessages(newMessages);
    }, []);
    react_1.useEffect(function () {
        var fetchChats = function () { return __awaiter(_this, void 0, void 0, function () {
            var response, sessionMap_1, sessions, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!(user === null || user === void 0 ? void 0 : user.id))
                            return [2 /*return*/];
                        return [4 /*yield*/, api_1.api.getChatHistory(user.id)];
                    case 1:
                        response = _a.sent();
                        sessionMap_1 = new Map();
                        response.forEach(function (chatMessage) {
                            var _a;
                            var sessionId = chatMessage.session_id;
                            if (!sessionMap_1.has(sessionId)) {
                                var newSession = {
                                    id: sessionId,
                                    sessionId: sessionId,
                                    title: 'Chat Session',
                                    lastMessage: '',
                                    updatedAt: new Date(chatMessage.created_at),
                                    messageCount: 0,
                                    messages: []
                                };
                                sessionMap_1.set(sessionId, newSession);
                            }
                            var session = sessionMap_1.get(sessionId);
                            // Add user message
                            if (session.messages) {
                                session.messages.push({
                                    id: chatMessage.id + "-user",
                                    text: chatMessage.message,
                                    sender: 'user',
                                    type: 'user',
                                    timestamp: new Date(chatMessage.created_at).getTime(),
                                    metadata: chatMessage.metadata
                                });
                                // Add bot response
                                session.messages.push({
                                    id: chatMessage.id + "-bot",
                                    text: chatMessage.response,
                                    sender: 'bot',
                                    type: 'ai',
                                    timestamp: new Date(chatMessage.created_at).getTime() + 1,
                                    metadata: chatMessage.metadata
                                });
                            }
                            session.messageCount = ((_a = session.messages) === null || _a === void 0 ? void 0 : _a.length) || 0;
                            session.lastMessage = chatMessage.response || chatMessage.message;
                            session.updatedAt = new Date(chatMessage.updated_at || chatMessage.created_at);
                        });
                        sessions = Array.from(sessionMap_1.values()).sort(function (a, b) {
                            return b.updatedAt.getTime() - a.updatedAt.getTime();
                        });
                        setChatSessions(sessions);
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        if (error_3 instanceof SyntaxError && error_3.message.includes("Unexpected token '<'")) {
                            console.error('Error fetching chat sessions: The server returned an HTML error page instead of JSON. This is a server-side issue.', error_3);
                            setError("Could not load your chat history due to a server problem.");
                        }
                        else {
                            console.error('Error fetching chat sessions:', error_3);
                            setError("Could not load your chat history.");
                        }
                        setChatSessions([]);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        fetchChats();
    }, [user]);
    return {
        messages: messages,
        setMessages: updateMessages,
        sendMessage: sendMessage,
        clearChat: clearChat,
        isLoading: isLoading,
        error: error,
        chatLimits: chatLimits,
        chatSessions: chatSessions
    };
}
exports.useChat = useChat;
