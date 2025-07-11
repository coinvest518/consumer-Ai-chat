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
        var session, token, endpoints, lastError, _i, endpoints_1, endpoint, headers, response, contentType, data, errorData, fetchError_1, error_1;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 15, , 16]);
                    return [4 /*yield*/, supabase_1.supabase.auth.getSession()];
                case 1:
                    session = _c.sent();
                    token = (_b = (_a = session === null || session === void 0 ? void 0 : session.data) === null || _a === void 0 ? void 0 : _a.session) === null || _b === void 0 ? void 0 : _b.access_token;
                    console.log('Fetching chat limits for user:', userId);
                    console.log('Auth token available:', !!token);
                    endpoints = [
                        "/api/user/metrics?user_id=" + userId,
                        "/api/user/metrics-simple?user_id=" + userId
                    ];
                    lastError = null;
                    _i = 0, endpoints_1 = endpoints;
                    _c.label = 2;
                case 2:
                    if (!(_i < endpoints_1.length)) return [3 /*break*/, 14];
                    endpoint = endpoints_1[_i];
                    _c.label = 3;
                case 3:
                    _c.trys.push([3, 12, , 13]);
                    console.log('Trying endpoint:', endpoint);
                    headers = {
                        'Content-Type': 'application/json'
                    };
                    // Add auth token if available
                    if (token) {
                        headers['Authorization'] = "Bearer " + token;
                    }
                    return [4 /*yield*/, fetch(endpoint, { headers: headers })];
                case 4:
                    response = _c.sent();
                    console.log('Response status for', endpoint, ':', response.status);
                    if (!response.ok) return [3 /*break*/, 8];
                    contentType = response.headers.get('content-type');
                    if (!(contentType === null || contentType === void 0 ? void 0 : contentType.includes('application/json'))) return [3 /*break*/, 6];
                    return [4 /*yield*/, response.json()];
                case 5:
                    data = _c.sent();
                    console.log('Received data from', endpoint, ':', data);
                    return [2 /*return*/, data];
                case 6:
                    console.log('Non-JSON response from', endpoint);
                    return [3 /*break*/, 13];
                case 7: return [3 /*break*/, 11];
                case 8:
                    if (!(response.status === 404)) return [3 /*break*/, 9];
                    console.log('Endpoint not found:', endpoint);
                    lastError = new Error("Endpoint " + endpoint + " not found");
                    return [3 /*break*/, 13]; // Try next endpoint
                case 9: return [4 /*yield*/, response.text()];
                case 10:
                    errorData = _c.sent();
                    console.error('API Error Response:', {
                        endpoint: endpoint,
                        status: response.status,
                        statusText: response.statusText,
                        error: errorData
                    });
                    lastError = new Error("HTTP error! status: " + response.status);
                    return [3 /*break*/, 13]; // Try next endpoint
                case 11: return [3 /*break*/, 13];
                case 12:
                    fetchError_1 = _c.sent();
                    console.error('Fetch error for', endpoint, ':', fetchError_1);
                    lastError = fetchError_1;
                    return [3 /*break*/, 13]; // Try next endpoint
                case 13:
                    _i++;
                    return [3 /*break*/, 2];
                case 14:
                    // If all endpoints fail, return default metrics
                    console.log('All API endpoints failed, returning default metrics. Last error:', lastError);
                    return [2 /*return*/, {
                            id: "metrics-" + userId,
                            user_id: userId,
                            daily_limit: 5,
                            chats_used: 0,
                            is_pro: false,
                            last_updated: new Date().toISOString(),
                            created_at: new Date().toISOString()
                        }];
                case 15:
                    error_1 = _c.sent();
                    console.error('Failed to fetch user metrics:', error_1);
                    // Return default metrics as fallback
                    return [2 /*return*/, {
                            id: "metrics-" + userId,
                            user_id: userId,
                            daily_limit: 5,
                            chats_used: 0,
                            is_pro: false,
                            last_updated: new Date().toISOString(),
                            created_at: new Date().toISOString()
                        }];
                case 16: return [2 /*return*/];
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
        var endpoints, _i, endpoints_2, endpoint, response, contentType, fetchError_2, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 9, , 10]);
                    endpoints = [
                        "/api/user/metrics?user_id=" + userId,
                        "/api/user/metrics-simple?user_id=" + userId
                    ];
                    _i = 0, endpoints_2 = endpoints;
                    _a.label = 1;
                case 1:
                    if (!(_i < endpoints_2.length)) return [3 /*break*/, 8];
                    endpoint = endpoints_2[_i];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 6, , 7]);
                    return [4 /*yield*/, fetch(endpoint, {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        })];
                case 3:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 5];
                    contentType = response.headers.get('content-type');
                    if (!(contentType === null || contentType === void 0 ? void 0 : contentType.includes('application/json'))) return [3 /*break*/, 5];
                    return [4 /*yield*/, response.json()];
                case 4: return [2 /*return*/, _a.sent()];
                case 5: return [3 /*break*/, 7];
                case 6:
                    fetchError_2 = _a.sent();
                    console.error('Fetch error for', endpoint, ':', fetchError_2);
                    return [3 /*break*/, 7];
                case 7:
                    _i++;
                    return [3 /*break*/, 1];
                case 8: 
                // If all endpoints fail, return default metrics
                return [2 /*return*/, {
                        id: "metrics-" + userId,
                        user_id: userId,
                        daily_limit: 5,
                        chats_used: 0,
                        is_pro: false,
                        last_updated: new Date().toISOString(),
                        created_at: new Date().toISOString()
                    }];
                case 9:
                    error_2 = _a.sent();
                    console.error('Failed to update chat metrics:', error_2);
                    // Return default metrics as fallback
                    return [2 /*return*/, {
                            id: "metrics-" + userId,
                            user_id: userId,
                            daily_limit: 5,
                            chats_used: 0,
                            is_pro: false,
                            last_updated: new Date().toISOString(),
                            created_at: new Date().toISOString()
                        }];
                case 10: return [2 /*return*/];
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
