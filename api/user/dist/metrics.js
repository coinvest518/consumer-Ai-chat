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
// Create Supabase client
var supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://ffvvesrqtdktayjwurwm.supabase.co';
var supabaseKey = process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmdnZlc3JxdGRrdGF5and1cndtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzODAxMDksImV4cCI6MjA2MDk1NjEwOX0._zC7055iriJSN3-HUTj71Bn_-auGn1WfrWDwqLPPUU4';
var supabase = supabase_js_1.createClient(supabaseUrl, supabaseKey);
function handler(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var userId, defaultMetrics, supabaseMetrics, _a, data, error, rawMetrics, error_1, _b, data, error, error_2, metrics, error_3;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    // Handle CORS
                    res.setHeader('Access-Control-Allow-Origin', '*');
                    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
                    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
                    if (req.method === 'OPTIONS') {
                        res.status(200).end();
                        return [2 /*return*/];
                    }
                    if (req.method !== 'GET') {
                        return [2 /*return*/, res.status(405).json({ error: 'Method not allowed' })];
                    }
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 10, , 11]);
                    userId = req.query.user_id;
                    if (!userId) {
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
                    supabaseMetrics = null;
                    _c.label = 2;
                case 2:
                    _c.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, supabase
                            .from('user_metrics')
                            .select('*')
                            .eq('user_id', userId)];
                case 3:
                    _a = _c.sent(), data = _a.data, error = _a.error;
                    if (error) {
                        console.error('Supabase metrics query error:', error);
                    }
                    else if (data && data.length > 0) {
                        rawMetrics = data[0];
                        // Map Supabase fields to expected format
                        supabaseMetrics = {
                            id: rawMetrics.id,
                            user_id: rawMetrics.user_id,
                            daily_limit: rawMetrics.daily_limit || 5,
                            chats_used: rawMetrics.chats_used || 0,
                            is_pro: rawMetrics.is_pro || false,
                            last_updated: rawMetrics.last_updated || rawMetrics.updated_at,
                            created_at: rawMetrics.created_at
                        };
                    }
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _c.sent();
                    console.error('Supabase metrics fetch error:', error_1);
                    return [3 /*break*/, 5];
                case 5:
                    if (!!supabaseMetrics) return [3 /*break*/, 9];
                    _c.label = 6;
                case 6:
                    _c.trys.push([6, 8, , 9]);
                    return [4 /*yield*/, supabase
                            .from('user_metrics')
                            .insert([defaultMetrics])
                            .select()
                            .single()];
                case 7:
                    _b = _c.sent(), data = _b.data, error = _b.error;
                    if (!error && data) {
                        supabaseMetrics = data;
                    }
                    return [3 /*break*/, 9];
                case 8:
                    error_2 = _c.sent();
                    console.error('Supabase metrics creation error:', error_2);
                    return [3 /*break*/, 9];
                case 9:
                    metrics = supabaseMetrics || defaultMetrics;
                    res.json(metrics);
                    return [3 /*break*/, 11];
                case 10:
                    error_3 = _c.sent();
                    console.error('Error fetching user metrics:', error_3);
                    res.status(500).json({ error: 'Failed to fetch user metrics' });
                    return [3 /*break*/, 11];
                case 11: return [2 /*return*/];
            }
        });
    });
}
exports["default"] = handler;
