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
exports.api = void 0;
var supabase_1 = require("./supabase");
// Helper function to handle Supabase responses
function handleSupabaseResponse(_a) {
    var data = _a.data, error = _a.error;
    return __awaiter(this, void 0, Promise, function () {
        return __generator(this, function (_b) {
            if (error) {
                console.error('API Error:', error);
                throw new Error(error.message || 'An error occurred');
            }
            return [2 /*return*/, data];
        });
    });
}
exports.api = {
    getChatLimits: function (userId) { return __awaiter(void 0, void 0, Promise, function () {
        var session, token, response, contentType, errorData, _a, data, error_1;
        var _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 9, , 10]);
                    return [4 /*yield*/, supabase_1.supabase.auth.getSession()];
                case 1:
                    session = _d.sent();
                    token = (_c = (_b = session === null || session === void 0 ? void 0 : session.data) === null || _b === void 0 ? void 0 : _b.session) === null || _c === void 0 ? void 0 : _c.access_token;
                    if (!token) {
                        throw new Error('No authentication token available');
                    }
                    return [4 /*yield*/, fetch("/api/user/metrics?user_id=" + userId, {
                            headers: {
                                'Authorization': "Bearer " + token,
                                'Content-Type': 'application/json'
                            }
                        })];
                case 2:
                    response = _d.sent();
                    contentType = response.headers.get('content-type');
                    if (!!response.ok) return [3 /*break*/, 7];
                    if (!(contentType === null || contentType === void 0 ? void 0 : contentType.includes('application/json'))) return [3 /*break*/, 4];
                    return [4 /*yield*/, response.json()];
                case 3:
                    _a = _d.sent();
                    return [3 /*break*/, 6];
                case 4: return [4 /*yield*/, response.text()];
                case 5:
                    _a = _d.sent();
                    _d.label = 6;
                case 6:
                    errorData = _a;
                    console.error('API Error Response:', {
                        status: response.status,
                        statusText: response.statusText,
                        error: errorData
                    });
                    // No need to return default metrics here as the backend handles that
                    throw new Error(typeof errorData === 'object' && errorData.error
                        ? errorData.error
                        : "HTTP error! status: " + response.status);
                case 7:
                    if (!(contentType === null || contentType === void 0 ? void 0 : contentType.includes('application/json'))) {
                        throw new Error('Invalid response format from server');
                    }
                    return [4 /*yield*/, response.json()];
                case 8:
                    data = _d.sent();
                    return [2 /*return*/, data];
                case 9:
                    error_1 = _d.sent();
                    console.error('Failed to fetch user metrics:', error_1);
                    throw error_1;
                case 10: return [2 /*return*/];
            }
        });
    }); },
    getChatHistory: function (userId) { return __awaiter(void 0, void 0, Promise, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = handleSupabaseResponse;
                    return [4 /*yield*/, supabase_1.supabase
                            .from('chat_history')
                            .select('*')
                            .eq('user_id', userId)
                            .order('created_at', { ascending: true })];
                case 1: return [2 /*return*/, _a.apply(void 0, [_b.sent()])];
            }
        });
    }); },
    saveChat: function (chatData) { return __awaiter(void 0, void 0, Promise, function () {
        var newMessage, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    newMessage = {
                        user_id: chatData.userId,
                        session_id: chatData.sessionId || crypto.randomUUID(),
                        message: chatData.message,
                        response: chatData.response,
                        message_type: 'chat',
                        metadata: chatData.metadata
                    };
                    _a = handleSupabaseResponse;
                    return [4 /*yield*/, supabase_1.supabase
                            .from('chat_history')
                            .insert([newMessage])
                            .select()
                            .single()];
                case 1: return [2 /*return*/, _a.apply(void 0, [_b.sent()])];
            }
        });
    }); },
    useTemplate: function (userId, templateData) { return __awaiter(void 0, void 0, Promise, function () {
        var _a, data, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, supabase_1.supabase.rpc('use_template', {
                        p_user_id: userId,
                        p_template_id: templateData.template_id,
                        p_credit_cost: templateData.credit_cost
                    })];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error)
                        throw error;
                    return [2 /*return*/, {
                            templateUsage: data,
                            remaining: templateData.credits_remaining - templateData.credit_cost
                        }];
            }
        });
    }); },
    getTemplateUsage: function (userId) { return __awaiter(void 0, void 0, Promise, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = handleSupabaseResponse;
                    return [4 /*yield*/, supabase_1.supabase
                            .from('template_usage')
                            .select('*')
                            .eq('user_id', userId)
                            .order('created_at', { ascending: false })];
                case 1: return [2 /*return*/, _a.apply(void 0, [_b.sent()])];
            }
        });
    }); },
    sendEmail: function (userId, emailData) { return __awaiter(void 0, void 0, Promise, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = handleSupabaseResponse;
                    return [4 /*yield*/, supabase_1.supabase
                            .from('emails')
                            .insert([{
                                user_id: userId,
                                recipients: emailData.recipients,
                                subject: emailData.subject,
                                body: emailData.body,
                                status: 'pending',
                                metadata: emailData.metadata
                            }])
                            .select()
                            .single()];
                case 1: return [2 /*return*/, _a.apply(void 0, [_b.sent()])];
            }
        });
    }); },
    scheduleEmail: function (userId, emailData) { return __awaiter(void 0, void 0, Promise, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = handleSupabaseResponse;
                    return [4 /*yield*/, supabase_1.supabase
                            .from('emails')
                            .insert([{
                                user_id: userId,
                                recipients: emailData.recipients,
                                subject: emailData.subject,
                                body: emailData.body,
                                status: 'pending',
                                scheduled_time: emailData.scheduledTime,
                                metadata: emailData.metadata
                            }])
                            .select()
                            .single()];
                case 1: return [2 /*return*/, _a.apply(void 0, [_b.sent()])];
            }
        });
    }); },
    verifyPayment: function (sessionId) { return __awaiter(void 0, void 0, Promise, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch("/api/verify-payment?sessionId=" + sessionId, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    })];
                case 1:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error('Failed to verify payment');
                    }
                    return [2 /*return*/, response.json()];
            }
        });
    }); },
    updateChatMetrics: function (userId) { return __awaiter(void 0, void 0, Promise, function () {
        var response, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fetch("/api/user/metrics?user_id=" + userId, {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        })];
                case 1:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error('Failed to update chat metrics');
                    }
                    return [2 /*return*/, response.json()];
                case 2:
                    error_2 = _a.sent();
                    console.error('Failed to update chat metrics:', error_2);
                    throw error_2;
                case 3: return [2 /*return*/];
            }
        });
    }); },
    getUserData: function (userId) { return __awaiter(void 0, void 0, Promise, function () {
        var _a, metrics, emails, purchases;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, Promise.all([
                        supabase_1.supabase
                            .from('user_metrics')
                            .select('*')
                            .eq('user_id', userId)
                            .single(),
                        supabase_1.supabase
                            .from('emails')
                            .select('*')
                            .eq('user_id', userId)
                            .order('created_at', { ascending: false }),
                        supabase_1.supabase
                            .from('purchases')
                            .select('*')
                            .eq('user_id', userId)
                            .order('created_at', { ascending: false })
                    ])];
                case 1:
                    _a = _b.sent(), metrics = _a[0].data, emails = _a[1].data, purchases = _a[2].data;
                    return [2 /*return*/, {
                            metrics: metrics || {
                                id: crypto.randomUUID(),
                                user_id: userId,
                                daily_limit: 5,
                                chats_used: 0,
                                is_pro: false,
                                last_updated: new Date().toISOString(),
                                created_at: new Date().toISOString()
                            },
                            emails: emails || [],
                            purchases: purchases || []
                        }];
            }
        });
    }); }
};
