"use strict";
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
var express_adapter_1 = require("./express-adapter");
var _dispute_ai_1 = require("./_dispute-ai");
var supabase_js_1 = require("@supabase/supabase-js");
var app = express_1["default"]();
// Initialize Supabase client
var supabaseUrl = process.env.SUPABASE_URL;
var supabaseKey = process.env.SUPABASE_SERVICE_KEY;
if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
}
var supabase = supabase_js_1.createClient(supabaseUrl, supabaseKey);
// Middleware
app.use(express_1["default"].json());
app.use(cors_1["default"]({
    origin: process.env.NODE_ENV === 'production'
        ? ['https://consumerai.info', 'https://www.consumerai.info', 'https://consumer-ai.vercel.app', 'https://consumer-ai-chat.vercel.app', 'https://consumer-ai-chat-git-main.vercel.app', 'https://consumerai.com']
        : ['http://localhost:5173'],
    credentials: true
}));
// Health check endpoint
app.get('/api/health', function (req, res) {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// User metrics endpoint
app.get('/api/user/metrics', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, authHeader, token, authError, _a, data, error, defaultMetrics, insertError, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 6, , 7]);
                userId = req.query.user_id;
                if (!userId) {
                    return [2 /*return*/, res.status(400).json({ error: 'User ID is required' })];
                }
                authHeader = req.headers.authorization;
                if (!authHeader) {
                    console.error('No authorization header provided');
                    return [2 /*return*/, res.status(401).json({ error: 'Authorization required' })];
                }
                token = authHeader.replace('Bearer ', '');
                return [4 /*yield*/, supabase.auth.setSession({
                        access_token: token,
                        refresh_token: ''
                    })];
            case 1:
                authError = (_b.sent()).error;
                if (authError) {
                    console.error('Auth error:', authError);
                    return [2 /*return*/, res.status(401).json({ error: 'Invalid authentication' })];
                }
                return [4 /*yield*/, supabase
                        .from('user_metrics')
                        .select('*')
                        .eq('user_id', userId)
                        .single()];
            case 2:
                _a = _b.sent(), data = _a.data, error = _a.error;
                if (!error) return [3 /*break*/, 5];
                console.error('Supabase error:', {
                    code: error.code,
                    message: error.message,
                    details: error.details,
                    hint: error.hint
                });
                if (!(error.code === 'PGRST116')) return [3 /*break*/, 4];
                defaultMetrics = {
                    id: crypto.randomUUID(),
                    user_id: userId,
                    daily_limit: 5,
                    chats_used: 0,
                    is_pro: false,
                    last_updated: new Date().toISOString(),
                    created_at: new Date().toISOString()
                };
                return [4 /*yield*/, supabase
                        .from('user_metrics')
                        .insert([defaultMetrics])];
            case 3:
                insertError = (_b.sent()).error;
                if (insertError) {
                    console.error('Failed to create default metrics:', insertError);
                    return [2 /*return*/, res.status(500).json({ error: 'Failed to create default metrics' })];
                }
                return [2 /*return*/, res.json(defaultMetrics)];
            case 4: return [2 /*return*/, res.status(500).json({
                    error: 'Database error',
                    details: error.message
                })];
            case 5:
                res.json(data);
                return [3 /*break*/, 7];
            case 6:
                error_1 = _b.sent();
                console.error('Server error:', error_1);
                res.status(500).json({
                    error: 'Internal server error',
                    details: error_1 instanceof Error ? error_1.message : String(error_1)
                });
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); });
// Chat endpoint
app.post('/api/chat', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, message, sessionId, userId, response, error_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.body, message = _a.message, sessionId = _a.sessionId, userId = _a.userId;
                if (!message || !sessionId || !userId) {
                    return [2 /*return*/, res.status(400).json({
                            error: 'Missing required fields: message, sessionId, and userId are required'
                        })];
                }
                return [4 /*yield*/, _dispute_ai_1.callAgentAPI(message, sessionId, userId)];
            case 1:
                response = _b.sent();
                res.json(response);
                return [3 /*break*/, 3];
            case 2:
                error_2 = _b.sent();
                console.error('Chat error:', error_2);
                res.status(500).json({ error: 'Internal server error' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Clear chat session
app.post('/api/chat/clear', function (req, res) {
    var sessionId = req.body.sessionId;
    if (!sessionId) {
        return res.status(400).json({ error: 'Session ID is required' });
    }
    var cleared = _dispute_ai_1.clearChatSessionMemory(sessionId);
    res.json({ cleared: cleared });
});
// Clear all chat sessions
app.post('/api/chat/clear-all', function (req, res) {
    _dispute_ai_1.clearAllChatSessionMemories();
    res.json({ cleared: true });
});
// Export the handler for Vercel
exports["default"] = express_adapter_1.expressAdapter(app);
