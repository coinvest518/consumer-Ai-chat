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
var supabase_js_1 = require("@supabase/supabase-js");
// Create Supabase client with environment variables
var supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
var supabaseKey = process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
// Log environment status
console.log('Supabase config status:', {
    hasSupabaseUrl: !!supabaseUrl,
    hasSupabaseKey: !!supabaseKey,
    supabaseUrlPrefix: (supabaseUrl === null || supabaseUrl === void 0 ? void 0 : supabaseUrl.substring(0, 30)) + '...',
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: !!process.env.VERCEL
});
var supabase = supabaseUrl && supabaseKey ? supabase_js_1.createClient(supabaseUrl, supabaseKey) : null;
function handler(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var allowedOrigins, origin, userId, defaultMetrics, _a, data, error, metrics, _b, newData, insertError, metrics, insertError_1, error_1, error_2, fallbackMetrics;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    // Add detailed logging for debugging
                    console.log('User Metrics API Route Hit:', req.method, req.url);
                    console.log('Query params:', req.query);
                    console.log('Supabase client available:', !!supabase);
                    allowedOrigins = ['https://consumerai.info', 'https://www.consumerai.info'];
                    origin = req.headers.origin;
                    if (origin && allowedOrigins.includes(origin)) {
                        res.setHeader('Access-Control-Allow-Origin', origin);
                        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
                        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
                        res.setHeader('Access-Control-Allow-Credentials', 'true');
                    }
                    if (req.method === 'OPTIONS') {
                        res.status(200).end();
                        return [2 /*return*/];
                    }
                    if (req.method !== 'GET') {
                        console.log('Method not allowed:', req.method);
                        return [2 /*return*/, res.status(405).json({ error: 'Method not allowed' })];
                    }
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 10, , 11]);
                    userId = req.query.user_id;
                    console.log('User ID from query:', userId);
                    if (!userId) {
                        console.log('Missing user ID');
                        return [2 /*return*/, res.status(400).json({ error: 'User ID is required' })];
                    }
                    defaultMetrics = {
                        id: "metrics-" + userId,
                        user_id: userId,
                        daily_limit: 5,
                        chats_used: 0,
                        is_pro: false,
                        last_updated: new Date().toISOString(),
                        created_at: new Date().toISOString()
                    };
                    // If Supabase is not available, return default metrics
                    if (!supabase) {
                        console.log('Supabase client not available, returning default metrics');
                        return [2 /*return*/, res.status(200).json(defaultMetrics)];
                    }
                    _c.label = 2;
                case 2:
                    _c.trys.push([2, 8, , 9]);
                    return [4 /*yield*/, supabase
                            .from('user_metrics')
                            .select('id, user_id, created_at')
                            .eq('user_id', userId)
                            .maybeSingle()];
                case 3:
                    _a = _c.sent(), data = _a.data, error = _a.error;
                    if (error) {
                        console.error('Supabase metrics query error:', error);
                        // Return defaults if there's an error
                        console.log('Returning default metrics due to query error');
                        return [2 /*return*/, res.status(200).json(defaultMetrics)];
                    }
                    if (!data) return [3 /*break*/, 4];
                    metrics = {
                        id: data.id,
                        user_id: data.user_id,
                        created_at: data.created_at,
                        // Provide default values for fields that don't exist in the table
                        daily_limit: 5,
                        chats_used: 0,
                        is_pro: false,
                        last_updated: new Date().toISOString()
                    };
                    console.log('Returning merged metrics from Supabase:', metrics);
                    return [2 /*return*/, res.status(200).json(metrics)];
                case 4:
                    _c.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, supabase
                            .from('user_metrics')
                            .insert([{ user_id: userId }])
                            .select('id, user_id, created_at')
                            .single()];
                case 5:
                    _b = _c.sent(), newData = _b.data, insertError = _b.error;
                    if (!insertError && newData) {
                        metrics = {
                            id: newData.id,
                            user_id: newData.user_id,
                            created_at: newData.created_at,
                            daily_limit: 5,
                            chats_used: 0,
                            is_pro: false,
                            last_updated: new Date().toISOString()
                        };
                        console.log('Created new metrics record and returning:', metrics);
                        return [2 /*return*/, res.status(200).json(metrics)];
                    }
                    else {
                        console.error('Failed to create metrics record:', insertError);
                        console.log('Returning default metrics due to insert error');
                        return [2 /*return*/, res.status(200).json(defaultMetrics)];
                    }
                    return [3 /*break*/, 7];
                case 6:
                    insertError_1 = _c.sent();
                    console.error('Error creating metrics record:', insertError_1);
                    console.log('Returning default metrics due to insert exception');
                    return [2 /*return*/, res.status(200).json(defaultMetrics)];
                case 7: return [3 /*break*/, 9];
                case 8:
                    error_1 = _c.sent();
                    console.error('Supabase metrics fetch error:', error_1);
                    console.log('Returning default metrics due to fetch exception');
                    return [2 /*return*/, res.status(200).json(defaultMetrics)];
                case 9: return [3 /*break*/, 11];
                case 10:
                    error_2 = _c.sent();
                    console.error('Error in metrics handler:', error_2);
                    fallbackMetrics = {
                        id: "fallback-" + req.query.user_id,
                        user_id: req.query.user_id,
                        daily_limit: 5,
                        chats_used: 0,
                        is_pro: false,
                        last_updated: new Date().toISOString(),
                        created_at: new Date().toISOString()
                    };
                    res.status(200).json(fallbackMetrics);
                    return [3 /*break*/, 11];
                case 11: return [2 /*return*/];
            }
        });
    });
}
exports["default"] = handler;
