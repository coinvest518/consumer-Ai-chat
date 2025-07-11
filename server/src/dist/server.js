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
var dotenv_1 = require("dotenv");
var dispute_ai_js_1 = require("./dispute-ai.js");
var astra_js_1 = require("../db/astra.js");
var supabase_js_1 = require("../db/supabase.js");
// Load environment variables from parent directory (root .env)
dotenv_1.config({ path: '../.env' });
// Ensure we have access to environment variables with both naming conventions
// For server-side code, use non-VITE variables if available, otherwise fall back to VITE ones
process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
process.env.ASTRA_DB_APPLICATION_TOKEN = process.env.ASTRA_DB_APPLICATION_TOKEN || process.env.VITE_ASTRA_DB_APPLICATION_TOKEN;
process.env.ASTRA_DB_ENDPOINT = process.env.ASTRA_DB_ENDPOINT || process.env.VITE_ASTRA_DB_ENDPOINT;
process.env.FLOW_ID = process.env.FLOW_ID || process.env.VITE_FLOW_ID;
process.env.SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
process.env.SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
var app = express_1["default"]();
var port = process.env.PORT || 3000;
// CORS configuration
var allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://consumerai.info',
    'https://www.consumerai.info'
];
app.use(cors_1["default"]({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express_1["default"].json());
// Health check endpoint
app.get('/api/health', function (_, res) {
    res.json({ status: 'ok' });
});
// Chat endpoint
app.post('/api/chat', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, message, sessionId, userId, response, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.body, message = _a.message, sessionId = _a.sessionId, userId = _a.userId;
                if (!message || !sessionId || !userId) {
                    return [2 /*return*/, res.status(400).json({
                            error: 'Missing required fields'
                        })];
                }
                return [4 /*yield*/, dispute_ai_js_1.callAgentAPI(message, sessionId, userId)];
            case 1:
                response = _b.sent();
                res.json(response);
                return [3 /*break*/, 3];
            case 2:
                error_1 = _b.sent();
                console.error('Chat error:', error_1);
                res.status(500).json({
                    error: 'Internal server error'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Clear session endpoint
app["delete"]('/api/chat/session/:sessionId', function (req, res) {
    var sessionId = req.params.sessionId;
    var success = dispute_ai_js_1.clearChatSessionMemory(sessionId);
    res.json({ success: success });
});
// Clear all sessions endpoint
app["delete"]('/api/chat/sessions', function (_, res) {
    dispute_ai_js_1.clearAllChatSessionMemories();
    res.json({ success: true });
});
// User metrics endpoint
app.get('/api/user/metrics', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, defaultMetrics, supabaseMetrics, _a, data, error, error_2, astraMetrics, astraCollection, error_3, metrics, error_4;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 12, , 13]);
                userId = req.query.user_id;
                if (!userId) {
                    return [2 /*return*/, res.status(400).json({ error: 'User ID is required' })];
                }
                defaultMetrics = {
                    userId: userId,
                    questionsAsked: 0,
                    questionsRemaining: 5,
                    isPro: false,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                supabaseMetrics = null;
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                return [4 /*yield*/, supabase_js_1.supabase
                        .from('user_metrics')
                        .select('*')
                        .eq('user_id', userId)];
            case 2:
                _a = _b.sent(), data = _a.data, error = _a.error;
                if (error) {
                    console.error('Supabase metrics query error:', error);
                }
                else if (data && data.length > 0) {
                    supabaseMetrics = data[0];
                }
                return [3 /*break*/, 4];
            case 3:
                error_2 = _b.sent();
                console.error('Supabase metrics fetch error:', error_2);
                return [3 /*break*/, 4];
            case 4:
                astraMetrics = null;
                _b.label = 5;
            case 5:
                _b.trys.push([5, 10, , 11]);
                return [4 /*yield*/, astra_js_1.getUserMetricsCollection()];
            case 6:
                astraCollection = _b.sent();
                return [4 /*yield*/, astraCollection.findOne({ userId: userId })];
            case 7:
                astraMetrics = _b.sent();
                if (!!astraMetrics) return [3 /*break*/, 9];
                return [4 /*yield*/, astra_js_1.updateUserMetrics(userId, defaultMetrics)];
            case 8:
                _b.sent();
                astraMetrics = defaultMetrics;
                _b.label = 9;
            case 9: return [3 /*break*/, 11];
            case 10:
                error_3 = _b.sent();
                console.error('Astra metrics error:', error_3);
                return [3 /*break*/, 11];
            case 11:
                metrics = supabaseMetrics || astraMetrics || defaultMetrics;
                res.json(metrics);
                return [3 /*break*/, 13];
            case 12:
                error_4 = _b.sent();
                console.error('Error fetching user metrics:', error_4);
                res.status(500).json({ error: 'Failed to fetch user metrics' });
                return [3 /*break*/, 13];
            case 13: return [2 /*return*/];
        }
    });
}); });
// Start server if not running in Vercel
if (!process.env.VERCEL) {
    app.listen(port, function () {
        console.log("Server running on port " + port);
    });
}
// Export for Vercel
exports["default"] = app;
