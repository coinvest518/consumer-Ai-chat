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
exports.__esModule = true;
var express_1 = require("express");
var cors_1 = require("cors");
var dotenv_1 = require("dotenv");
var astra_db_ts_1 = require("@datastax/astra-db-ts");
var langflow_js_1 = require("./langflow.js");
var stripe_1 = require("stripe");
// Load environment variables from the parent directory
dotenv_1.config({ path: '../.env' });
var app = express_1["default"]();
var port = process.env.PORT || 3000;
// Initialize Stripe
var stripe = new stripe_1["default"](process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16'
});
// CORS configuration
var allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://consumer-ai.vercel.app',
    'https://consumer-ai-chat.vercel.app',
    'https://consumer-ai-chat-git-main.vercel.app',
    'https://consumerai.info',
    'https://www.consumerai.info'
];
// More permissive CORS setup
app.use(cors_1["default"]({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            console.log('Blocked origin:', origin);
            // Just allow all origins in development
            if (process.env.NODE_ENV === 'development') {
                return callback(null, true);
            }
            return callback(null, allowedOrigins[0]);
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express_1["default"].json());
// Initialize Astra DB client
var client = new astra_db_ts_1.DataAPIClient();
var db = client.db(process.env.ASTRA_DB_ENDPOINT, {
    token: process.env.ASTRA_DB_APPLICATION_TOKEN
});
// Initialize collections
var userMetricsCollection = db.collection('user_metrics');
var chatHistoryCollection = db.collection('chat_history');
var emailCollection = db.collection('emails');
var scheduledEmailCollection = db.collection('scheduled_emails');
var templateUsageCollection = db.collection('template_usage');
var collections = {
    userMetricsCollection: userMetricsCollection,
    chatHistoryCollection: chatHistoryCollection,
    emailCollection: emailCollection,
    scheduledEmailCollection: scheduledEmailCollection,
    templateUsageCollection: templateUsageCollection
};
// Simple chat endpoint
app.post('/api/chat', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, message, sessionId, userId, currentMetrics, isEmailMessage, emailData, emailLines, subjectLine, bodyStartIndex, subject, body, aiResponse, response, updatedMetrics, responseData, error_1, payload, controller_1, timeout, response, data, text, updatedMetrics, error_2;
    var _b, _c, _d, _e, _f, _g, _h, _j, _k;
    return __generator(this, function (_l) {
        switch (_l.label) {
            case 0:
                _a = req.body, message = _a.message, sessionId = _a.sessionId, userId = _a.userId;
                console.log('Chat request received:', { userId: userId, message: message.slice(0, 50) + '...', sessionId: sessionId });
                if (!message) {
                    return [2 /*return*/, res.status(400).json({ error: 'Message is required' })];
                }
                if (!userId) {
                    return [2 /*return*/, res.status(400).json({ error: 'User ID is required' })];
                }
                _l.label = 1;
            case 1:
                _l.trys.push([1, 12, , 13]);
                return [4 /*yield*/, collections.userMetricsCollection.findOne({ userId: userId })];
            case 2:
                currentMetrics = (_l.sent()) || {
                    userId: userId,
                    dailyLimit: 5,
                    chatsUsed: 0,
                    isPro: false
                };
                // Check if limit reached
                if (!currentMetrics.isPro && currentMetrics.chatsUsed >= currentMetrics.dailyLimit) {
                    return [2 /*return*/, res.status(429).json({
                            error: 'Daily limit reached',
                            chatsUsed: currentMetrics.chatsUsed,
                            dailyLimit: currentMetrics.dailyLimit
                        })];
                }
                isEmailMessage = message.startsWith('Process this email:');
                emailData = null;
                if (!isEmailMessage) return [3 /*break*/, 4];
                emailLines = message.split('\n');
                subjectLine = emailLines.find(function (line) { return line.startsWith('Subject:'); });
                bodyStartIndex = emailLines.indexOf('Body:');
                if (!(subjectLine && bodyStartIndex !== -1)) return [3 /*break*/, 4];
                subject = subjectLine.replace('Subject:', '').trim();
                body = emailLines.slice(bodyStartIndex + 1).join('\n').trim();
                // Store email in email collection
                emailData = {
                    userId: req.body.userId,
                    subject: subject,
                    body: body,
                    sender: '',
                    recipients: [],
                    timestamp: new Date().toISOString(),
                    isRead: false
                };
                return [4 /*yield*/, collections.emailCollection.insertOne(emailData)];
            case 3:
                _l.sent();
                _l.label = 4;
            case 4:
                _l.trys.push([4, 7, , 11]);
                return [4 /*yield*/, langflow_js_1.callLangflowAPI(message, sessionId)];
            case 5:
                aiResponse = _l.sent();
                response = {
                    result: aiResponse.text,
                    response: aiResponse.text,
                    message: "Success"
                };
                updatedMetrics = {
                    userId: userId,
                    dailyLimit: currentMetrics.dailyLimit,
                    chatsUsed: currentMetrics.chatsUsed + 1,
                    isPro: currentMetrics.isPro,
                    lastUpdated: new Date().toISOString()
                };
                return [4 /*yield*/, collections.userMetricsCollection.updateOne({ userId: userId }, { $set: updatedMetrics }, { upsert: true })];
            case 6:
                _l.sent();
                responseData = {
                    text: response.response,
                    chatsUsed: updatedMetrics.chatsUsed,
                    dailyLimit: updatedMetrics.dailyLimit,
                    remaining: updatedMetrics.dailyLimit - updatedMetrics.chatsUsed
                };
                if (emailData) {
                    Object.assign(responseData, { emailData: emailData });
                }
                return [2 /*return*/, res.json(responseData)];
            case 7:
                error_1 = _l.sent();
                console.error('LangflowAPI error, falling back to direct API call:', error_1);
                // Fall back to direct API call if the helper fails
                console.log('Sending request to Langflow:', {
                    url: process.env.LANGFLOW_API_URL,
                    message: message,
                    sessionId: sessionId
                });
                payload = {
                    input_value: message,
                    output_type: "chat",
                    input_type: "chat",
                    session_id: sessionId || "user_1"
                };
                controller_1 = new AbortController();
                timeout = setTimeout(function () { return controller_1.abort(); }, 60000);
                return [4 /*yield*/, fetch(process.env.LANGFLOW_API_URL, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': "Bearer " + process.env.LANGFLOW_API_KEY
                        },
                        body: JSON.stringify(payload),
                        signal: controller_1.signal
                    })];
            case 8:
                response = _l.sent();
                clearTimeout(timeout);
                if (!response.ok) {
                    console.error('Langflow API error:', {
                        status: response.status,
                        statusText: response.statusText,
                        url: process.env.LANGFLOW_API_URL
                    });
                    // Special handling for timeout errors
                    if (response.status === 504) {
                        return [2 /*return*/, res.status(504).json({
                                error: 'The AI is taking longer than expected to respond. Please try again.',
                                isTimeout: true
                            })];
                    }
                    return [2 /*return*/, res.status(500).json({ error: 'Failed to get response from AI' })];
                }
                return [4 /*yield*/, response.json()];
            case 9:
                data = _l.sent();
                console.log('Langflow response:', data);
                text = '';
                if ((_b = data.result) === null || _b === void 0 ? void 0 : _b.response) {
                    text = data.result.response;
                }
                else if ((_c = data.result) === null || _c === void 0 ? void 0 : _c.answer) {
                    text = data.result.answer;
                }
                else if ((_d = data.result) === null || _d === void 0 ? void 0 : _d.message) {
                    text = data.result.message;
                }
                else if ((_k = (_j = (_h = (_g = (_f = (_e = data.outputs) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.outputs) === null || _g === void 0 ? void 0 : _g[0]) === null || _h === void 0 ? void 0 : _h.results) === null || _j === void 0 ? void 0 : _j.message) === null || _k === void 0 ? void 0 : _k.text) {
                    text = data.outputs[0].outputs[0].results.message.text;
                }
                if (!text) {
                    console.error('Invalid AI response format:', data);
                    return [2 /*return*/, res.status(500).json({ error: 'No valid response from AI' })];
                }
                updatedMetrics = {
                    userId: userId,
                    dailyLimit: currentMetrics.dailyLimit,
                    chatsUsed: currentMetrics.chatsUsed + 1,
                    isPro: currentMetrics.isPro,
                    lastUpdated: new Date().toISOString()
                };
                return [4 /*yield*/, collections.userMetricsCollection.updateOne({ userId: userId }, { $set: updatedMetrics }, { upsert: true })];
            case 10:
                _l.sent();
                return [2 /*return*/, res.json({
                        text: text,
                        chatsUsed: updatedMetrics.chatsUsed,
                        dailyLimit: updatedMetrics.dailyLimit,
                        remaining: updatedMetrics.dailyLimit - updatedMetrics.chatsUsed
                    })];
            case 11: return [3 /*break*/, 13];
            case 12:
                error_2 = _l.sent();
                console.error('Server error:', error_2);
                return [2 /*return*/, res.status(500).json({ error: 'Internal server error' })];
            case 13: return [2 /*return*/];
        }
    });
}); });
// Get user metrics/limits
app.get('/api/user-metrics/limits/:userId', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, metrics, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                userId = req.params.userId;
                console.log('Fetching metrics for userId:', userId);
                if (!userId) {
                    return [2 /*return*/, res.status(400).json({ error: 'userId is required' })];
                }
                return [4 /*yield*/, collections.userMetricsCollection.findOne({ userId: userId })];
            case 1:
                metrics = _a.sent();
                console.log('Found metrics:', metrics);
                res.json(metrics || {
                    dailyLimit: 5,
                    chatsUsed: 0,
                    isPro: false,
                    userId: userId
                });
                return [3 /*break*/, 3];
            case 2:
                error_3 = _a.sent();
                console.error('Error fetching metrics:', error_3);
                res.status(500).json({ error: 'Failed to fetch metrics' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Update user metrics
app.post('/api/user-metrics/update', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, currentMetrics, metricsToUpdate, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                userId = req.body.userId;
                if (!userId) {
                    return [2 /*return*/, res.status(400).json({ error: 'userId is required' })];
                }
                return [4 /*yield*/, collections.userMetricsCollection.findOne({ userId: userId })];
            case 1:
                currentMetrics = (_a.sent()) || {
                    dailyLimit: 5,
                    chatsUsed: 0,
                    isPro: false,
                    lastUpdated: new Date().toISOString()
                };
                metricsToUpdate = {
                    dailyLimit: currentMetrics.dailyLimit,
                    chatsUsed: currentMetrics.chatsUsed,
                    isPro: currentMetrics.isPro,
                    lastUpdated: new Date().toISOString()
                };
                return [4 /*yield*/, collections.userMetricsCollection.updateOne({ userId: userId }, { $set: metricsToUpdate }, { upsert: true })];
            case 2:
                _a.sent();
                res.json(__assign(__assign({}, metricsToUpdate), { userId: userId }));
                return [3 /*break*/, 4];
            case 3:
                error_4 = _a.sent();
                console.error('Error updating metrics:', error_4);
                res.status(500).json({ error: 'Failed to update metrics' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
// Save chat history
app.post('/api/chat-history/save', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, userId, messages, chatData, error_5;
    var _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 2, , 3]);
                _a = req.body, userId = _a.userId, messages = _a.messages;
                console.log('Saving chat history for userId:', userId);
                if (!userId || !messages) {
                    return [2 /*return*/, res.status(400).json({ error: 'userId and messages are required' })];
                }
                chatData = {
                    userId: userId,
                    messages: messages,
                    title: ((_c = (_b = messages[messages.length - 1]) === null || _b === void 0 ? void 0 : _b.text) === null || _c === void 0 ? void 0 : _c.slice(0, 50)) || 'New Chat',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    timestamp: Date.now() // Add timestamp for easier debugging
                };
                console.log('Chat data to save:', {
                    userId: chatData.userId,
                    title: chatData.title,
                    messageCount: messages.length
                });
                return [4 /*yield*/, collections.chatHistoryCollection.insertOne(chatData)];
            case 1:
                _d.sent();
                res.json({ success: true, chatData: chatData });
                return [3 /*break*/, 3];
            case 2:
                error_5 = _d.sent();
                console.error('Error saving chat:', error_5);
                res.status(500).json({ error: 'Failed to save chat' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Replace the checkout session endpoint with payment link endpoint
app.post('/api/verify-payment', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, userId, email, currentMetrics, error_6;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 4, , 5]);
                _a = req.body, userId = _a.userId, email = _a.email;
                return [4 /*yield*/, collections.userMetricsCollection.findOne({ userId: userId })];
            case 1:
                currentMetrics = (_b.sent()) || {
                    dailyLimit: 5,
                    chatsUsed: 0,
                    isPro: false,
                    lastUpdated: new Date().toISOString()
                };
                // Update user metrics - add 50 more credits
                return [4 /*yield*/, collections.userMetricsCollection.updateOne({ userId: userId }, {
                        $set: {
                            dailyLimit: currentMetrics.dailyLimit + 50,
                            lastPurchase: new Date().toISOString(),
                            lastUpdated: new Date().toISOString()
                        }
                    }, { upsert: true })];
            case 2:
                // Update user metrics - add 50 more credits
                _b.sent();
                // Create a purchase record
                return [4 /*yield*/, collections.chatHistoryCollection.insertOne({
                        userId: userId,
                        type: 'purchase',
                        credits: 50,
                        amount: 9.99,
                        timestamp: new Date().toISOString()
                    })];
            case 3:
                // Create a purchase record
                _b.sent();
                res.json({
                    success: true,
                    userId: userId,
                    customerEmail: email,
                    creditsAdded: 50,
                    newLimit: currentMetrics.dailyLimit + 50
                });
                return [3 /*break*/, 5];
            case 4:
                error_6 = _b.sent();
                console.error('Error processing payment:', error_6);
                res.status(500).json({ error: 'Failed to process payment' });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
// Add GET endpoint for Stripe session verification (for thank-you page)
app.get('/api/verify-payment/:sessionId', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var sessionId, session, error_7;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                sessionId = req.params.sessionId;
                if (!sessionId) {
                    return [2 /*return*/, res.status(400).json({ error: 'Session ID is required' })];
                }
                return [4 /*yield*/, stripe.checkout.sessions.retrieve(sessionId)];
            case 1:
                session = _b.sent();
                if (session.payment_status === 'paid') {
                    res.json({
                        paid: true,
                        customerEmail: (_a = session.customer_details) === null || _a === void 0 ? void 0 : _a.email,
                        sessionId: sessionId
                    });
                }
                else {
                    res.json({
                        paid: false,
                        sessionId: sessionId
                    });
                }
                return [3 /*break*/, 3];
            case 2:
                error_7 = _b.sent();
                console.error('Error verifying payment session:', error_7);
                res.status(500).json({ error: 'Failed to verify payment session' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Add this endpoint
app.get('/api/chat-history/:userId', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, cursor, chatHistory, error_8;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                userId = req.params.userId;
                if (!userId) {
                    return [2 /*return*/, res.status(400).json({ error: 'userId is required' })];
                }
                return [4 /*yield*/, collections.chatHistoryCollection.find({ userId: userId })];
            case 1:
                cursor = _a.sent();
                return [4 /*yield*/, cursor.toArray()];
            case 2:
                chatHistory = _a.sent();
                if (!chatHistory || chatHistory.length === 0) {
                    return [2 /*return*/, res.json([])];
                }
                res.json(chatHistory);
                return [3 /*break*/, 4];
            case 3:
                error_8 = _a.sent();
                console.error('Error fetching chat history:', error_8);
                res.status(500).json({ error: 'Failed to fetch chat history' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
// Add this endpoint
app.get('/api/chat/:chatId', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var chatId, chat, error_9;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                chatId = req.params.chatId;
                if (!chatId) {
                    return [2 /*return*/, res.status(400).json({ error: 'chatId is required' })];
                }
                return [4 /*yield*/, collections.chatHistoryCollection.findOne({
                        _id: chatId
                    })];
            case 1:
                chat = _a.sent();
                if (!chat) {
                    return [2 /*return*/, res.status(404).json({ error: 'Chat not found' })];
                }
                // Return the full chat with messages
                res.json({
                    id: chat._id,
                    messages: chat.messages || [],
                    timestamp: chat.timestamp
                });
                return [3 /*break*/, 3];
            case 2:
                error_9 = _a.sent();
                console.error('Error fetching chat:', error_9);
                res.status(500).json({ error: 'Failed to fetch chat' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Add a debug route to help identify if the server is running
app.get('/api/debug', function (req, res) {
    res.json({
        status: 'Server is running',
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
        headers: req.headers,
        vercelInfo: {
            isVercel: !!process.env.VERCEL,
            region: process.env.VERCEL_REGION,
            environment: process.env.VERCEL_ENV
        }
    });
});
// Implement the email endpoint
app.post('/api/emails', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, userId, sender, recipients, subject, body, metadata, emailData, result, emailId, emailContent, aiResponse, error_10;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 4, , 5]);
                _a = req.body, userId = _a.userId, sender = _a.sender, recipients = _a.recipients, subject = _a.subject, body = _a.body, metadata = _a.metadata;
                if (!userId || !subject || !body) {
                    return [2 /*return*/, res.status(400).json({ error: 'Missing required fields' })];
                }
                emailData = {
                    userId: userId,
                    sender: sender || '',
                    recipients: recipients || [],
                    subject: subject,
                    body: body,
                    timestamp: new Date().toISOString(),
                    isRead: false,
                    metadata: metadata
                };
                return [4 /*yield*/, collections.emailCollection.insertOne(emailData)];
            case 1:
                result = _b.sent();
                emailId = result.insertedId;
                emailContent = "\n      From: " + emailData.sender + "\n      Subject: " + emailData.subject + "\n      \n      " + emailData.body + "\n    ";
                return [4 /*yield*/, langflow_js_1.callLangflowAPI(emailContent, userId)];
            case 2:
                aiResponse = _b.sent();
                // Mark email as processed
                return [4 /*yield*/, collections.emailCollection.updateOne({ _id: emailId }, { $set: { isRead: true } })];
            case 3:
                // Mark email as processed
                _b.sent();
                res.status(201).json({
                    email: __assign({ id: emailId }, emailData),
                    aiResponse: aiResponse.text
                });
                return [3 /*break*/, 5];
            case 4:
                error_10 = _b.sent();
                console.error('Error processing email:', error_10);
                res.status(500).json({ error: 'Failed to process email' });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
// Implement get emails endpoint
app.get('/api/emails/:userId', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, cursor, emails, error_11;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                userId = req.params.userId;
                return [4 /*yield*/, collections.emailCollection.find({ userId: userId })];
            case 1:
                cursor = _a.sent();
                return [4 /*yield*/, cursor.toArray()];
            case 2:
                emails = _a.sent();
                res.json(emails);
                return [3 /*break*/, 4];
            case 3:
                error_11 = _a.sent();
                console.error('Error fetching emails:', error_11);
                res.status(500).json({ error: 'Failed to fetch emails' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
// Implement email scheduling endpoint
app.post('/api/emails/schedule', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, userId, recipients, subject, body, scheduledTime, scheduledEmail, result, error_12;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.body, userId = _a.userId, recipients = _a.recipients, subject = _a.subject, body = _a.body, scheduledTime = _a.scheduledTime;
                if (!userId || !recipients || !subject || !body || !scheduledTime) {
                    return [2 /*return*/, res.status(400).json({ error: 'Missing required fields' })];
                }
                scheduledEmail = {
                    userId: userId,
                    recipients: Array.isArray(recipients) ? recipients : [recipients],
                    subject: subject,
                    body: body,
                    scheduledTime: new Date(scheduledTime).toISOString(),
                    status: 'scheduled',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                return [4 /*yield*/, collections.scheduledEmailCollection.insertOne(scheduledEmail)];
            case 1:
                result = _b.sent();
                res.status(201).json({
                    id: result.insertedId,
                    message: 'Email scheduled successfully'
                });
                return [3 /*break*/, 3];
            case 2:
                error_12 = _b.sent();
                console.error('Error scheduling email:', error_12);
                res.status(500).json({ error: 'Failed to schedule email' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Add webhook endpoint for Stripe events
app.post('/api/stripe-webhook', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var sig, event, session, userId, email, currentMetrics, err_1;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                sig = req.headers['stripe-signature'];
                _c.label = 1;
            case 1:
                _c.trys.push([1, 6, , 7]);
                event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
                if (!(event.type === 'checkout.session.completed')) return [3 /*break*/, 5];
                session = event.data.object;
                userId = (_a = session.metadata) === null || _a === void 0 ? void 0 : _a.userId;
                email = (_b = session.metadata) === null || _b === void 0 ? void 0 : _b.email;
                if (!userId) return [3 /*break*/, 5];
                return [4 /*yield*/, collections.userMetricsCollection.findOne({ userId: userId })];
            case 2:
                currentMetrics = (_c.sent()) || {
                    dailyLimit: 5,
                    chatsUsed: 0,
                    isPro: false,
                    lastUpdated: new Date().toISOString()
                };
                // Update metrics
                return [4 /*yield*/, collections.userMetricsCollection.updateOne({ userId: userId }, {
                        $set: {
                            dailyLimit: currentMetrics.dailyLimit + 50,
                            lastPurchase: new Date().toISOString(),
                            lastUpdated: new Date().toISOString()
                        }
                    }, { upsert: true })];
            case 3:
                // Update metrics
                _c.sent();
                // Record purchase
                return [4 /*yield*/, collections.chatHistoryCollection.insertOne({
                        userId: userId,
                        type: 'purchase',
                        credits: 50,
                        amount: 9.99,
                        timestamp: new Date().toISOString()
                    })];
            case 4:
                // Record purchase
                _c.sent();
                _c.label = 5;
            case 5:
                res.json({ received: true });
                return [3 /*break*/, 7];
            case 6:
                err_1 = _c.sent();
                console.error('Webhook error:', err_1);
                res.status(400).send("Webhook Error: " + err_1.message);
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); });
// Tavus conversation creation endpoint - matches Tavus API documentation
app.post('/api/tavus/conversations', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, persona_id, conversation_name, conversational_context, properties, requestBody, baseUrls, lastError, response, _i, baseUrls_1, url, errorData, error_13, conversationData, error_14;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 11, , 12]);
                console.log('=== TAVUS DEBUG START ===');
                console.log('Request body:', JSON.stringify(req.body, null, 2));
                _a = req.body, persona_id = _a.persona_id, conversation_name = _a.conversation_name, conversational_context = _a.conversational_context, properties = _a.properties;
                console.log('Environment check:', {
                    hasApiKey: !!process.env.TAVUS_API_KEY,
                    apiKeyPreview: process.env.TAVUS_API_KEY ? process.env.TAVUS_API_KEY.substring(0, 8) + '...' : 'MISSING',
                    personaId: process.env.TAVUS_PERSONA_ID,
                    replicaId: process.env.TAVUS_REPLICA_ID
                });
                if (!persona_id) {
                    console.log('ERROR: Missing persona_id in request');
                    return [2 /*return*/, res.status(400).json({ error: 'persona_id is required' })];
                }
                requestBody = {
                    persona_id: persona_id,
                    // Don't include replica_id since persona pb1db14ac254 has a default replica
                    conversation_name: conversation_name || 'ConsumerAI Support',
                    conversational_context: conversational_context || 'You are a helpful customer service representative for ConsumerAI, a legal AI platform helping consumers with credit disputes and debt collection issues. Help users understand our platform features, pricing, legal templates (FCRA, FDCPA), and guide them through signup or platform usage. Be professional, empathetic, and concise.',
                    properties: __assign({ enable_recording: false, max_call_duration: 600, enable_transcription: true, language: 'english' }, properties)
                };
                console.log('Sending to Tavus API:', JSON.stringify(requestBody, null, 2));
                baseUrls = [
                    'https://tavusapi.com/v2/conversations',
                    'https://api.tavus.io/v2/conversations' // Backup URL in case there are regional differences
                ];
                lastError = void 0;
                response = void 0;
                _i = 0, baseUrls_1 = baseUrls;
                _b.label = 1;
            case 1:
                if (!(_i < baseUrls_1.length)) return [3 /*break*/, 9];
                url = baseUrls_1[_i];
                _b.label = 2;
            case 2:
                _b.trys.push([2, 7, , 8]);
                console.log("Attempting Tavus API call to: " + url);
                return [4 /*yield*/, fetch(url, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-api-key': process.env.TAVUS_API_KEY || ''
                        },
                        body: JSON.stringify(requestBody)
                    })];
            case 3:
                response = _b.sent();
                console.log("Tavus API response status from " + url + ": " + response.status);
                if (!response.ok) return [3 /*break*/, 4];
                // Success! Continue with normal flow
                return [3 /*break*/, 9];
            case 4: return [4 /*yield*/, response.text()];
            case 5:
                errorData = _b.sent();
                console.error("Tavus API error from " + url + ":", response.status, errorData);
                lastError = new Error("HTTP " + response.status + ": " + errorData);
                return [3 /*break*/, 8]; // Try next URL
            case 6: return [3 /*break*/, 8];
            case 7:
                error_13 = _b.sent();
                console.error("Network error with URL " + url + ":", error_13);
                lastError = error_13;
                return [3 /*break*/, 8]; // Try next URL
            case 8:
                _i++;
                return [3 /*break*/, 1];
            case 9:
                // Check if we got a successful response from any URL
                if (!response || !response.ok) {
                    console.error('All Tavus API URLs failed');
                    console.log('=== TAVUS DEBUG END (ERROR) ===');
                    throw lastError || new Error('All Tavus API endpoints failed');
                }
                return [4 /*yield*/, response.json()];
            case 10:
                conversationData = _b.sent();
                console.log('Tavus conversation created successfully:', conversationData);
                console.log('=== TAVUS DEBUG END (SUCCESS) ===');
                res.json(conversationData);
                return [3 /*break*/, 12];
            case 11:
                error_14 = _b.sent();
                console.error('Exception in Tavus endpoint:', error_14);
                console.log('=== TAVUS DEBUG END (EXCEPTION) ===');
                res.status(500).json({
                    error: 'Internal server error',
                    details: error_14 instanceof Error ? error_14.message : 'Unknown error'
                });
                return [3 /*break*/, 12];
            case 12: return [2 /*return*/];
        }
    });
}); });
// Get Tavus conversation status
app.get('/api/tavus/conversation/:conversationId', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var conversationId, response, conversationData, error_15;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                conversationId = req.params.conversationId;
                return [4 /*yield*/, fetch("https://tavusapi.com/v2/conversations/" + conversationId, {
                        headers: {
                            'x-api-key': process.env.TAVUS_API_KEY || ''
                        }
                    })];
            case 1:
                response = _a.sent();
                if (!response.ok) {
                    return [2 /*return*/, res.status(response.status).json({ error: 'Failed to get conversation status' })];
                }
                return [4 /*yield*/, response.json()];
            case 2:
                conversationData = _a.sent();
                res.json(conversationData);
                return [3 /*break*/, 4];
            case 3:
                error_15 = _a.sent();
                console.error('Error getting Tavus conversation:', error_15);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
// End Tavus conversation
app.post('/api/tavus/conversation/:conversationId/end', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var conversationId, response, result, error_16;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                conversationId = req.params.conversationId;
                return [4 /*yield*/, fetch("https://tavusapi.com/v2/conversations/" + conversationId + "/end", {
                        method: 'POST',
                        headers: {
                            'x-api-key': process.env.TAVUS_API_KEY || ''
                        }
                    })];
            case 1:
                response = _a.sent();
                if (!response.ok) {
                    return [2 /*return*/, res.status(response.status).json({ error: 'Failed to end conversation' })];
                }
                return [4 /*yield*/, response.json()];
            case 2:
                result = _a.sent();
                res.json(result);
                return [3 /*break*/, 4];
            case 3:
                error_16 = _a.sent();
                console.error('Error ending Tavus conversation:', error_16);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
// Start server
app.listen(port, function () {
    console.log("Server running on port " + port);
    console.log('Environment check:', {
        hasLangflowUrl: !!process.env.LANGFLOW_API_URL,
        hasLangflowKey: !!process.env.LANGFLOW_API_KEY,
        env: process.env.NODE_ENV,
        isVercel: !!process.env.VERCEL
    });
});
// Debug endpoint to clear a user's chat history (for testing)
app["delete"]('/api/debug/clear-user-data/:userId', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, chatHistoryResult, metricsResult, emailResult, error_17;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                userId = req.params.userId;
                console.log('Clearing all data for userId:', userId);
                if (!userId) {
                    return [2 /*return*/, res.status(400).json({ error: 'userId is required' })];
                }
                return [4 /*yield*/, collections.chatHistoryCollection.deleteMany({ userId: userId })];
            case 1:
                chatHistoryResult = _a.sent();
                return [4 /*yield*/, collections.userMetricsCollection.deleteMany({ userId: userId })];
            case 2:
                metricsResult = _a.sent();
                return [4 /*yield*/, collections.emailCollection.deleteMany({ userId: userId })];
            case 3:
                emailResult = _a.sent();
                res.json({
                    success: true,
                    message: "Cleared all data for user " + userId,
                    deletedCounts: {
                        chatHistory: chatHistoryResult.deletedCount,
                        metrics: metricsResult.deletedCount,
                        emails: emailResult.deletedCount
                    }
                });
                return [3 /*break*/, 5];
            case 4:
                error_17 = _a.sent();
                console.error('Error clearing user data:', error_17);
                res.status(500).json({ error: 'Failed to clear user data' });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
// Debug endpoint to initialize a new user with fresh data
app.post('/api/debug/init-user', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, newMetrics, error_18;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                userId = req.body.userId;
                console.log('Initializing fresh user data for userId:', userId);
                if (!userId) {
                    return [2 /*return*/, res.status(400).json({ error: 'userId is required' })];
                }
                newMetrics = {
                    userId: userId,
                    dailyLimit: 5,
                    chatsUsed: 0,
                    isPro: false,
                    lastUpdated: new Date().toISOString(),
                    createdAt: new Date().toISOString()
                };
                return [4 /*yield*/, collections.userMetricsCollection.updateOne({ userId: userId }, { $set: newMetrics }, { upsert: true })];
            case 1:
                _a.sent();
                res.json({
                    success: true,
                    message: "Initialized fresh data for user " + userId,
                    metrics: newMetrics
                });
                return [3 /*break*/, 3];
            case 2:
                error_18 = _a.sent();
                console.error('Error initializing user:', error_18);
                res.status(500).json({ error: 'Failed to initialize user' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Template-related endpoints
// Use template endpoint
app.post('/api/templates/use', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, userId, templateId, creditCost, currentMetrics, defaultMetrics, userMetrics, remainingCredits, updatedMetrics, templateUsage, error_19;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 4, , 5]);
                _a = req.body, userId = _a.userId, templateId = _a.templateId, creditCost = _a.creditCost;
                if (!userId || !templateId || !creditCost) {
                    return [2 /*return*/, res.status(400).json({ error: 'userId, templateId, and creditCost are required' })];
                }
                return [4 /*yield*/, collections.userMetricsCollection.findOne({ userId: userId })];
            case 1:
                currentMetrics = _b.sent();
                defaultMetrics = {
                    dailyLimit: 5,
                    chatsUsed: 0,
                    isPro: false,
                    lastUpdated: new Date().toISOString()
                };
                userMetrics = currentMetrics ? {
                    dailyLimit: currentMetrics.dailyLimit || 5,
                    chatsUsed: currentMetrics.chatsUsed || 0,
                    isPro: currentMetrics.isPro || false,
                    lastUpdated: currentMetrics.lastUpdated || new Date().toISOString()
                } : defaultMetrics;
                remainingCredits = userMetrics.dailyLimit - userMetrics.chatsUsed;
                if (remainingCredits < creditCost) {
                    return [2 /*return*/, res.status(400).json({
                            error: 'Insufficient credits',
                            required: creditCost,
                            available: remainingCredits
                        })];
                }
                updatedMetrics = __assign(__assign({}, userMetrics), { chatsUsed: userMetrics.chatsUsed + creditCost, lastUpdated: new Date().toISOString() });
                return [4 /*yield*/, collections.userMetricsCollection.updateOne({ userId: userId }, { $set: updatedMetrics }, { upsert: true })];
            case 2:
                _b.sent();
                templateUsage = {
                    userId: userId,
                    templateId: templateId,
                    creditCost: creditCost,
                    timestamp: new Date().toISOString(),
                    creditsRemaining: updatedMetrics.dailyLimit - updatedMetrics.chatsUsed
                };
                return [4 /*yield*/, collections.templateUsageCollection.insertOne(templateUsage)];
            case 3:
                _b.sent();
                res.json({
                    success: true,
                    creditsDeducted: creditCost,
                    creditsRemaining: updatedMetrics.dailyLimit - updatedMetrics.chatsUsed,
                    templateUsage: templateUsage
                });
                return [3 /*break*/, 5];
            case 4:
                error_19 = _b.sent();
                console.error('Error using template:', error_19);
                res.status(500).json({ error: 'Failed to use template' });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
// Get template usage history
app.get('/api/templates/usage/:userId', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, usage, error_20;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                userId = req.params.userId;
                if (!userId) {
                    return [2 /*return*/, res.status(400).json({ error: 'userId is required' })];
                }
                return [4 /*yield*/, collections.templateUsageCollection
                        .find({ userId: userId })
                        .sort({ timestamp: -1 })
                        .limit(50)
                        .toArray()];
            case 1:
                usage = _a.sent();
                res.json(usage);
                return [3 /*break*/, 3];
            case 2:
                error_20 = _a.sent();
                console.error('Error fetching template usage:', error_20);
                res.status(500).json({ error: 'Failed to fetch template usage' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Deduct credits endpoint (for general credit deduction)
app.post('/api/user-metrics/deduct', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, userId, amount, reason, currentMetrics, defaultMetrics, userMetrics, remainingCredits, updatedMetrics, error_21;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                _a = req.body, userId = _a.userId, amount = _a.amount, reason = _a.reason;
                if (!userId || !amount) {
                    return [2 /*return*/, res.status(400).json({ error: 'userId and amount are required' })];
                }
                return [4 /*yield*/, collections.userMetricsCollection.findOne({ userId: userId })];
            case 1:
                currentMetrics = _b.sent();
                defaultMetrics = {
                    dailyLimit: 5,
                    chatsUsed: 0,
                    isPro: false,
                    lastUpdated: new Date().toISOString()
                };
                userMetrics = currentMetrics ? {
                    dailyLimit: currentMetrics.dailyLimit || 5,
                    chatsUsed: currentMetrics.chatsUsed || 0,
                    isPro: currentMetrics.isPro || false,
                    lastUpdated: currentMetrics.lastUpdated || new Date().toISOString()
                } : defaultMetrics;
                remainingCredits = userMetrics.dailyLimit - userMetrics.chatsUsed;
                if (remainingCredits < amount) {
                    return [2 /*return*/, res.status(400).json({
                            error: 'Insufficient credits',
                            required: amount,
                            available: remainingCredits
                        })];
                }
                updatedMetrics = __assign(__assign({}, userMetrics), { chatsUsed: userMetrics.chatsUsed + amount, lastUpdated: new Date().toISOString() });
                return [4 /*yield*/, collections.userMetricsCollection.updateOne({ userId: userId }, { $set: updatedMetrics }, { upsert: true })];
            case 2:
                _b.sent();
                res.json({
                    success: true,
                    creditsDeducted: amount,
                    creditsRemaining: updatedMetrics.dailyLimit - updatedMetrics.chatsUsed,
                    reason: reason || 'General usage'
                });
                return [3 /*break*/, 4];
            case 3:
                error_21 = _b.sent();
                console.error('Error deducting credits:', error_21);
                res.status(500).json({ error: 'Failed to deduct credits' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
// Replace the checkout session endpoint with payment link endpoint
