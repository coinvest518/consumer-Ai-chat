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
var _supabase_1 = require("./_supabase");
function handler(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var userId, _a, metrics, error, _b, userId, amount, reason, action, _c, currentMetrics, fetchError, metrics, remaining, updateError, usageError, error_1;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    // Add CORS headers
                    res.setHeader('Access-Control-Allow-Credentials', 'true');
                    res.setHeader('Access-Control-Allow-Origin', '*');
                    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
                    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
                    // Handle preflight requests
                    if (req.method === 'OPTIONS') {
                        return [2 /*return*/, res.status(200).end()];
                    }
                    console.log('user-metrics API called:', {
                        method: req.method,
                        query: req.query,
                        body: req.body
                    });
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 9, , 10]);
                    if (!(req.method === 'GET')) return [3 /*break*/, 3];
                    userId = req.query.userId;
                    if (!userId || typeof userId !== 'string') {
                        return [2 /*return*/, res.status(400).json({ error: 'userId is required' })];
                    }
                    console.log('Fetching metrics for user:', userId);
                    return [4 /*yield*/, _supabase_1.supabase
                            .from('user_metrics')
                            .select('*')
                            .eq('user_id', userId)
                            .single()];
                case 2:
                    _a = _d.sent(), metrics = _a.data, error = _a.error;
                    if (error && error.code !== 'PGRST116') {
                        console.error('Error fetching metrics:', error);
                        return [2 /*return*/, res.status(500).json({ error: 'Failed to fetch user metrics' })];
                    }
                    console.log('Fetched metrics:', metrics);
                    // Return default metrics if none exist
                    return [2 /*return*/, res.json(metrics || {
                            user_id: userId,
                            daily_limit: 5,
                            chats_used: 0,
                            is_pro: false,
                            last_updated: new Date().toISOString()
                        })];
                case 3:
                    if (!(req.method === 'POST')) return [3 /*break*/, 8];
                    _b = req.body, userId = _b.userId, amount = _b.amount, reason = _b.reason, action = _b.action;
                    if (!userId) {
                        return [2 /*return*/, res.status(400).json({ error: 'userId is required' })];
                    }
                    console.log('Processing POST request:', { userId: userId, amount: amount, reason: reason, action: action });
                    return [4 /*yield*/, _supabase_1.supabase
                            .from('user_metrics')
                            .select('*')
                            .eq('user_id', userId)
                            .single()];
                case 4:
                    _c = _d.sent(), currentMetrics = _c.data, fetchError = _c.error;
                    if (fetchError && fetchError.code !== 'PGRST116') {
                        console.error('Error fetching metrics:', fetchError);
                        return [2 /*return*/, res.status(500).json({ error: 'Failed to fetch user metrics' })];
                    }
                    metrics = currentMetrics || {
                        user_id: userId,
                        daily_limit: 5,
                        chats_used: 0,
                        is_pro: false,
                        last_updated: new Date().toISOString()
                    };
                    // Handle credit deduction
                    if (action === 'deduct') {
                        if (!amount || amount <= 0) {
                            return [2 /*return*/, res.status(400).json({ error: 'Invalid deduction amount' })];
                        }
                        remaining = metrics.daily_limit - metrics.chats_used;
                        if (remaining < amount) {
                            return [2 /*return*/, res.status(403).json({
                                    error: 'Insufficient credits',
                                    required: amount,
                                    available: remaining
                                })];
                        }
                        metrics.chats_used += amount;
                    }
                    return [4 /*yield*/, _supabase_1.supabase
                            .from('user_metrics')
                            .upsert(__assign(__assign({}, metrics), { last_updated: new Date().toISOString() }))];
                case 5:
                    updateError = (_d.sent()).error;
                    if (updateError) {
                        console.error('Error updating metrics:', updateError);
                        return [2 /*return*/, res.status(500).json({ error: 'Failed to update user metrics' })];
                    }
                    if (!(action === 'deduct' && reason === 'template')) return [3 /*break*/, 7];
                    return [4 /*yield*/, _supabase_1.supabase
                            .from('template_usage')
                            .insert([{
                                user_id: userId,
                                template_id: req.body.templateId || 'unknown',
                                credit_cost: amount,
                                credits_remaining: metrics.daily_limit - metrics.chats_used,
                                metadata: { reason: reason }
                            }])];
                case 6:
                    usageError = (_d.sent()).error;
                    if (usageError) {
                        console.error('Error logging template usage:', usageError);
                    }
                    _d.label = 7;
                case 7: return [2 /*return*/, res.json({
                        success: true,
                        metrics: metrics,
                        remaining: metrics.daily_limit - metrics.chats_used
                    })];
                case 8: return [2 /*return*/, res.status(405).json({ error: 'Method not allowed' })];
                case 9:
                    error_1 = _d.sent();
                    console.error('Error in user-metrics API:', error_1);
                    return [2 /*return*/, res.status(500).json({
                            error: 'Internal server error',
                            details: error_1.message || String(error_1)
                        })];
                case 10: return [2 /*return*/];
            }
        });
    });
}
exports["default"] = handler;
