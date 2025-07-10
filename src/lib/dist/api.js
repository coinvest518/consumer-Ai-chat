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
exports.api = void 0;
var utils_1 = require("./utils");
var API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
// Helper function to handle API responses
function handleResponse(response) {
    return __awaiter(this, void 0, Promise, function () {
        var error;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!!response.ok) return [3 /*break*/, 2];
                    return [4 /*yield*/, response.json()["catch"](function () { return ({ message: response.statusText }); })];
                case 1:
                    error = _a.sent();
                    throw new utils_1.ApiError(error.message || 'API request failed', error.details);
                case 2: return [2 /*return*/, response.json()];
            }
        });
    });
}
// Default headers for all API calls
var defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
};
exports.api = {
    getChatLimits: function (userId) { return __awaiter(void 0, void 0, Promise, function () {
        var response, data, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch(API_BASE_URL + "/user-metrics?userId=" + encodeURIComponent(userId), {
                            headers: defaultHeaders,
                            credentials: 'include'
                        })];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, handleResponse(response)];
                case 2:
                    data = _a.sent();
                    return [2 /*return*/, {
                            chatsUsed: data.chats_used,
                            dailyLimit: data.daily_limit,
                            remaining: data.daily_limit - data.chats_used,
                            isPro: data.is_pro,
                            lastUpdated: data.last_updated
                        }];
                case 3:
                    error_1 = _a.sent();
                    console.error('Get chat limits error:', error_1);
                    throw error_1 instanceof utils_1.ApiError ? error_1 : new utils_1.ApiError('Failed to fetch chat limits', error_1.message);
                case 4: return [2 /*return*/];
            }
        });
    }); },
    getChatHistory: function (userId) { return __awaiter(void 0, void 0, Promise, function () {
        var response, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fetch(API_BASE_URL + "/chat-history/" + encodeURIComponent(userId), {
                            headers: defaultHeaders,
                            credentials: 'include'
                        })];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, handleResponse(response)];
                case 2:
                    error_2 = _a.sent();
                    console.error('Get chat history error:', error_2);
                    throw error_2 instanceof utils_1.ApiError ? error_2 : new utils_1.ApiError('Failed to fetch chat history', error_2.message);
                case 3: return [2 /*return*/];
            }
        });
    }); },
    saveChat: function (chatData) { return __awaiter(void 0, void 0, Promise, function () {
        var response, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fetch(API_BASE_URL + "/chat", {
                            method: 'POST',
                            headers: defaultHeaders,
                            body: JSON.stringify(chatData),
                            credentials: 'include'
                        })];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, handleResponse(response)];
                case 2:
                    error_3 = _a.sent();
                    console.error('Save chat error:', error_3);
                    throw error_3 instanceof utils_1.ApiError ? error_3 : new utils_1.ApiError('Failed to save chat', error_3.message);
                case 3: return [2 /*return*/];
            }
        });
    }); },
    useTemplate: function (userId, templateData) { return __awaiter(void 0, void 0, Promise, function () {
        var response, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fetch(API_BASE_URL + "/template-usage", {
                            method: 'POST',
                            headers: defaultHeaders,
                            body: JSON.stringify({
                                userId: userId,
                                templateId: templateData.templateId,
                                creditCost: templateData.creditCost,
                                metadata: templateData.metadata
                            }),
                            credentials: 'include'
                        })];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, handleResponse(response)];
                case 2:
                    error_4 = _a.sent();
                    console.error('Use template error:', error_4);
                    throw error_4 instanceof utils_1.ApiError ? error_4 : new utils_1.ApiError('Failed to use template', error_4.message);
                case 3: return [2 /*return*/];
            }
        });
    }); },
    getTemplateUsage: function (userId) { return __awaiter(void 0, void 0, Promise, function () {
        var response, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fetch(API_BASE_URL + "/template-usage?userId=" + encodeURIComponent(userId), {
                            headers: defaultHeaders,
                            credentials: 'include'
                        })];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, handleResponse(response)];
                case 2:
                    error_5 = _a.sent();
                    console.error('Get template usage error:', error_5);
                    throw error_5 instanceof utils_1.ApiError ? error_5 : new utils_1.ApiError('Failed to fetch template usage', error_5.message);
                case 3: return [2 /*return*/];
            }
        });
    }); },
    sendEmail: function (userId, emailData) { return __awaiter(void 0, void 0, Promise, function () {
        var response, error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fetch(API_BASE_URL + "/emails", {
                            method: 'POST',
                            headers: defaultHeaders,
                            body: JSON.stringify(__assign(__assign({}, emailData), { userId: userId })),
                            credentials: 'include'
                        })];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, handleResponse(response)];
                case 2:
                    error_6 = _a.sent();
                    console.error('Send email error:', error_6);
                    throw error_6 instanceof utils_1.ApiError ? error_6 : new utils_1.ApiError('Failed to send email', error_6.message);
                case 3: return [2 /*return*/];
            }
        });
    }); },
    scheduleEmail: function (userId, emailData) { return __awaiter(void 0, void 0, Promise, function () {
        var response, error_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fetch(API_BASE_URL + "/emails", {
                            method: 'POST',
                            headers: defaultHeaders,
                            body: JSON.stringify(__assign(__assign({}, emailData), { userId: userId, type: 'scheduled' })),
                            credentials: 'include'
                        })];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, handleResponse(response)];
                case 2:
                    error_7 = _a.sent();
                    console.error('Schedule email error:', error_7);
                    throw error_7 instanceof utils_1.ApiError ? error_7 : new utils_1.ApiError('Failed to schedule email', error_7.message);
                case 3: return [2 /*return*/];
            }
        });
    }); },
    verifyPayment: function (sessionId) { return __awaiter(void 0, void 0, Promise, function () {
        var response, error_8;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fetch(API_BASE_URL + "/verify-payment?sessionId=" + encodeURIComponent(sessionId), {
                            headers: defaultHeaders,
                            credentials: 'include'
                        })];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, handleResponse(response)];
                case 2:
                    error_8 = _a.sent();
                    console.error('Payment verification error:', error_8);
                    throw error_8 instanceof utils_1.ApiError ? error_8 : new utils_1.ApiError('Failed to verify payment', error_8.message);
                case 3: return [2 /*return*/];
            }
        });
    }); },
    getUserData: function (userId) { return __awaiter(void 0, void 0, Promise, function () {
        var _a, metrics, chatHistory, templateUsage, emailsRes, purchasesRes, _b, emails, purchases, error_9;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, Promise.all([
                            exports.api.getChatLimits(userId),
                            exports.api.getChatHistory(userId),
                            exports.api.getTemplateUsage(userId),
                            fetch(API_BASE_URL + "/emails?userId=" + encodeURIComponent(userId), {
                                headers: defaultHeaders,
                                credentials: 'include'
                            }),
                            fetch(API_BASE_URL + "/purchases?userId=" + encodeURIComponent(userId), {
                                headers: defaultHeaders,
                                credentials: 'include'
                            })
                        ])];
                case 1:
                    _a = _c.sent(), metrics = _a[0], chatHistory = _a[1], templateUsage = _a[2], emailsRes = _a[3], purchasesRes = _a[4];
                    return [4 /*yield*/, Promise.all([
                            handleResponse(emailsRes),
                            handleResponse(purchasesRes)
                        ])];
                case 2:
                    _b = _c.sent(), emails = _b[0], purchases = _b[1];
                    return [2 /*return*/, {
                            metrics: {
                                user_id: userId,
                                daily_limit: metrics.dailyLimit,
                                chats_used: metrics.chatsUsed,
                                is_pro: metrics.isPro,
                                last_updated: metrics.lastUpdated
                            },
                            chatHistory: chatHistory,
                            templateUsage: templateUsage,
                            emails: emails,
                            purchases: purchases
                        }];
                case 3:
                    error_9 = _c.sent();
                    console.error('Get user data error:', error_9);
                    throw error_9 instanceof utils_1.ApiError ? error_9 : new utils_1.ApiError('Failed to fetch user data', error_9.message);
                case 4: return [2 /*return*/];
            }
        });
    }); }
};
