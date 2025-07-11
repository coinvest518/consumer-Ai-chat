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
function handler(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var userId, defaultMetrics, supabase, _a, data, error, rawMetrics, supabaseMetrics, error_1, error_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log('Metrics API route hit:', req.method, req.url);
                    console.log('Query params:', req.query);
                    // Handle CORS
                    res.setHeader('Access-Control-Allow-Origin', '*');
                    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
                    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
                    if (req.method === 'OPTIONS') {
                        res.status(200).end();
                        return [2 /*return*/];
                    }
                    if (req.method !== 'GET') {
                        console.log('Method not allowed:', req.method);
                        return [2 /*return*/, res.status(405).json({ error: 'Method not allowed' })];
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 6, , 7]);
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
                    if (!(supabaseUrl && supabaseKey)) return [3 /*break*/, 5];
                    supabase = supabase_js_1.createClient(supabaseUrl, supabaseKey);
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, supabase
                            .from('user_metrics')
                            .select('*')
                            .eq('user_id', userId)];
                case 3:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error) {
                        console.error('Supabase metrics query error:', error);
                    }
                    else if (data && data.length > 0) {
                        rawMetrics = data[0];
                        supabaseMetrics = {
                            id: rawMetrics.id,
                            user_id: rawMetrics.user_id,
                            daily_limit: rawMetrics.daily_limit || 5,
                            chats_used: rawMetrics.chats_used || 0,
                            is_pro: rawMetrics.is_pro || false,
                            last_updated: rawMetrics.last_updated || rawMetrics.updated_at,
                            created_at: rawMetrics.created_at
                        };
                        console.log('Returning Supabase metrics:', supabaseMetrics);
                        return [2 /*return*/, res.status(200).json(supabaseMetrics)];
                    }
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _b.sent();
                    console.error('Supabase metrics fetch error:', error_1);
                    return [3 /*break*/, 5];
                case 5:
                    console.log('Returning default metrics:', defaultMetrics);
                    res.status(200).json(defaultMetrics);
                    return [3 /*break*/, 7];
                case 6:
                    error_2 = _b.sent();
                    console.error('Error fetching user metrics:', error_2);
                    res.status(500).json({
                        error: 'Failed to fetch user metrics',
                        details: error_2 instanceof Error ? error_2.message : 'Unknown error'
                    });
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
}
exports["default"] = handler;
