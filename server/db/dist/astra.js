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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
exports.__esModule = true;
exports.scheduleEmail = exports.getUserEmails = exports.storeEmail = exports.updateUserMetrics = exports.getChatSessionMessages = exports.getUserChatHistory = exports.storeChatMessage = exports.getScheduledEmailCollection = exports.getEmailCollection = exports.getUserMetricsCollection = exports.getChatHistoryCollection = exports.testConnection = exports.initAstra = exports.flowId = exports.astraDb = void 0;
var astra_db_ts_1 = require("@datastax/astra-db-ts");
var uuid_1 = require("uuid");
// Initialize the client with your token
var ASTRA_DB_APPLICATION_TOKEN = process.env.ASTRA_DB_APPLICATION_TOKEN;
var ASTRA_DB_ENDPOINT = process.env.ASTRA_DB_ENDPOINT;
// Add debug logging
console.log('Environment variables loaded:', {
    hasToken: !!ASTRA_DB_APPLICATION_TOKEN,
    hasEndpoint: !!ASTRA_DB_ENDPOINT,
    endpoint: ASTRA_DB_ENDPOINT
});
if (!ASTRA_DB_APPLICATION_TOKEN || !ASTRA_DB_ENDPOINT) {
    throw new Error("Missing required Astra DB environment variables");
}
// Initialize the client
var client = new astra_db_ts_1.DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
exports.astraDb = client.db(ASTRA_DB_ENDPOINT);
// AstraDB configuration
var FLOW_ID = process.env.FLOW_ID;
// Collection names
var CHAT_HISTORY_COLLECTION = 'chat_history';
var USER_METRICS_COLLECTION = 'user_metrics';
var EMAIL_COLLECTION = 'emails';
var SCHEDULED_EMAIL_COLLECTION = 'scheduled_emails';
exports.flowId = FLOW_ID;
// Initialize and check connection
exports.initAstra = function () { return __awaiter(void 0, void 0, void 0, function () {
    var collections, collectionNames, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 10, , 11]);
                return [4 /*yield*/, exports.astraDb.listCollections()];
            case 1:
                collections = _a.sent();
                console.log('Connected to AstraDB:', collections);
                collectionNames = collections.map(function (c) { return c.name || c; });
                if (!!collectionNames.includes(CHAT_HISTORY_COLLECTION)) return [3 /*break*/, 3];
                return [4 /*yield*/, exports.astraDb.createCollection(CHAT_HISTORY_COLLECTION)];
            case 2:
                _a.sent();
                console.log("Created " + CHAT_HISTORY_COLLECTION + " collection");
                _a.label = 3;
            case 3:
                if (!!collectionNames.includes(USER_METRICS_COLLECTION)) return [3 /*break*/, 5];
                return [4 /*yield*/, exports.astraDb.createCollection(USER_METRICS_COLLECTION)];
            case 4:
                _a.sent();
                console.log("Created " + USER_METRICS_COLLECTION + " collection");
                _a.label = 5;
            case 5:
                if (!!collectionNames.includes(EMAIL_COLLECTION)) return [3 /*break*/, 7];
                return [4 /*yield*/, exports.astraDb.createCollection(EMAIL_COLLECTION)];
            case 6:
                _a.sent();
                console.log("Created " + EMAIL_COLLECTION + " collection");
                _a.label = 7;
            case 7:
                if (!!collectionNames.includes(SCHEDULED_EMAIL_COLLECTION)) return [3 /*break*/, 9];
                return [4 /*yield*/, exports.astraDb.createCollection(SCHEDULED_EMAIL_COLLECTION)];
            case 8:
                _a.sent();
                console.log("Created " + SCHEDULED_EMAIL_COLLECTION + " collection");
                _a.label = 9;
            case 9: return [2 /*return*/, true];
            case 10:
                error_1 = _a.sent();
                console.error('Failed to connect to AstraDB:', error_1);
                return [2 /*return*/, false];
            case 11: return [2 /*return*/];
        }
    });
}); };
// Basic test function
exports.testConnection = function () { return __awaiter(void 0, void 0, void 0, function () {
    var collections, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, exports.astraDb.listCollections()];
            case 1:
                collections = _a.sent();
                console.log('Test connection successful. Available collections:', collections);
                return [2 /*return*/, true];
            case 2:
                error_2 = _a.sent();
                console.error('Test connection failed:', error_2);
                return [2 /*return*/, false];
            case 3: return [2 /*return*/];
        }
    });
}); };
// Get chat history collection
exports.getChatHistoryCollection = function () { return __awaiter(void 0, void 0, Promise, function () {
    return __generator(this, function (_a) {
        try {
            return [2 /*return*/, exports.astraDb.collection(CHAT_HISTORY_COLLECTION)];
        }
        catch (error) {
            console.error('Error getting chat history collection:', error);
            throw error;
        }
        return [2 /*return*/];
    });
}); };
// Get user metrics collection
exports.getUserMetricsCollection = function () { return __awaiter(void 0, void 0, Promise, function () {
    return __generator(this, function (_a) {
        try {
            return [2 /*return*/, exports.astraDb.collection(USER_METRICS_COLLECTION)];
        }
        catch (error) {
            console.error('Error getting user metrics collection:', error);
            throw error;
        }
        return [2 /*return*/];
    });
}); };
// Get email collection
exports.getEmailCollection = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        try {
            return [2 /*return*/, exports.astraDb.collection(EMAIL_COLLECTION)];
        }
        catch (error) {
            console.error('Error getting email collection:', error);
            throw error;
        }
        return [2 /*return*/];
    });
}); };
// Get scheduled email collection
exports.getScheduledEmailCollection = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        try {
            return [2 /*return*/, exports.astraDb.collection(SCHEDULED_EMAIL_COLLECTION)];
        }
        catch (error) {
            console.error('Error getting scheduled email collection:', error);
            throw error;
        }
        return [2 /*return*/];
    });
}); };
// Store a chat message
exports.storeChatMessage = function (userId, sessionId, message) { return __awaiter(void 0, void 0, void 0, function () {
    var collection, messageId, chatMessageDoc, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, exports.getChatHistoryCollection()];
            case 1:
                collection = _a.sent();
                messageId = uuid_1.v4();
                chatMessageDoc = {
                    _id: messageId,
                    userId: userId,
                    sessionId: sessionId,
                    timestamp: message.timestamp || new Date().toISOString(),
                    type: message.type,
                    text: message.text,
                    citation: message.citation,
                    actions: message.actions,
                    title: message.title
                };
                return [4 /*yield*/, collection.insertOne(chatMessageDoc)];
            case 2:
                _a.sent();
                return [2 /*return*/, messageId];
            case 3:
                error_3 = _a.sent();
                console.error('Error storing chat message:', error_3);
                throw error_3;
            case 4: return [2 /*return*/];
        }
    });
}); };
/**
 * Get chat history for a user
 * @param userId User ID to retrieve chat history for
 * @returns Array of chat message documents from AstraDB
 */
exports.getUserChatHistory = function (userId) { return __awaiter(void 0, void 0, Promise, function () {
    var collection, query, result, messages, result_1, result_1_1, doc, e_1_1, error_4;
    var e_1, _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 15, , 16]);
                return [4 /*yield*/, exports.getChatHistoryCollection()];
            case 1:
                collection = _b.sent();
                query = { userId: userId };
                return [4 /*yield*/, collection.find(query)];
            case 2:
                result = _b.sent();
                messages = [];
                _b.label = 3;
            case 3:
                _b.trys.push([3, 8, 9, 14]);
                result_1 = __asyncValues(result);
                _b.label = 4;
            case 4: return [4 /*yield*/, result_1.next()];
            case 5:
                if (!(result_1_1 = _b.sent(), !result_1_1.done)) return [3 /*break*/, 7];
                doc = result_1_1.value;
                messages.push(doc);
                _b.label = 6;
            case 6: return [3 /*break*/, 4];
            case 7: return [3 /*break*/, 14];
            case 8:
                e_1_1 = _b.sent();
                e_1 = { error: e_1_1 };
                return [3 /*break*/, 14];
            case 9:
                _b.trys.push([9, , 12, 13]);
                if (!(result_1_1 && !result_1_1.done && (_a = result_1["return"]))) return [3 /*break*/, 11];
                return [4 /*yield*/, _a.call(result_1)];
            case 10:
                _b.sent();
                _b.label = 11;
            case 11: return [3 /*break*/, 13];
            case 12:
                if (e_1) throw e_1.error;
                return [7 /*endfinally*/];
            case 13: return [7 /*endfinally*/];
            case 14: return [2 /*return*/, messages.sort(function (a, b) {
                    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
                })];
            case 15:
                error_4 = _b.sent();
                console.error('Error getting user chat history:', error_4);
                throw error_4;
            case 16: return [2 /*return*/];
        }
    });
}); };
/**
 * Get messages for a specific chat session
 * @param sessionId Session ID to retrieve messages for
 * @returns Array of chat message documents from AstraDB
 */
exports.getChatSessionMessages = function (sessionId) { return __awaiter(void 0, void 0, Promise, function () {
    var collection, query, result, messages, result_2, result_2_1, doc, e_2_1, error_5;
    var e_2, _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 15, , 16]);
                return [4 /*yield*/, exports.getChatHistoryCollection()];
            case 1:
                collection = _b.sent();
                query = { sessionId: sessionId };
                return [4 /*yield*/, collection.find(query)];
            case 2:
                result = _b.sent();
                messages = [];
                _b.label = 3;
            case 3:
                _b.trys.push([3, 8, 9, 14]);
                result_2 = __asyncValues(result);
                _b.label = 4;
            case 4: return [4 /*yield*/, result_2.next()];
            case 5:
                if (!(result_2_1 = _b.sent(), !result_2_1.done)) return [3 /*break*/, 7];
                doc = result_2_1.value;
                messages.push(doc);
                _b.label = 6;
            case 6: return [3 /*break*/, 4];
            case 7: return [3 /*break*/, 14];
            case 8:
                e_2_1 = _b.sent();
                e_2 = { error: e_2_1 };
                return [3 /*break*/, 14];
            case 9:
                _b.trys.push([9, , 12, 13]);
                if (!(result_2_1 && !result_2_1.done && (_a = result_2["return"]))) return [3 /*break*/, 11];
                return [4 /*yield*/, _a.call(result_2)];
            case 10:
                _b.sent();
                _b.label = 11;
            case 11: return [3 /*break*/, 13];
            case 12:
                if (e_2) throw e_2.error;
                return [7 /*endfinally*/];
            case 13: return [7 /*endfinally*/];
            case 14: return [2 /*return*/, messages.sort(function (a, b) {
                    return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
                })];
            case 15:
                error_5 = _b.sent();
                console.error('Error getting chat session messages:', error_5);
                throw error_5;
            case 16: return [2 /*return*/];
        }
    });
}); };
// Update user metrics (using legacy format for Astra)
exports.updateUserMetrics = function (userId, metrics) { return __awaiter(void 0, void 0, void 0, function () {
    var collection, existingMetrics, now, newMetrics, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 7, , 8]);
                return [4 /*yield*/, exports.getUserMetricsCollection()];
            case 1:
                collection = _a.sent();
                return [4 /*yield*/, collection.findOne({ userId: userId })];
            case 2:
                existingMetrics = _a.sent();
                now = new Date().toISOString();
                if (!existingMetrics) return [3 /*break*/, 4];
                // Update existing metrics document
                return [4 /*yield*/, collection.updateOne({ userId: userId }, { $set: __assign(__assign({}, metrics), { updatedAt: now }) })];
            case 3:
                // Update existing metrics document
                _a.sent();
                return [2 /*return*/, true];
            case 4:
                newMetrics = __assign({ userId: userId, questionsAsked: metrics.questionsAsked || 0, questionsRemaining: metrics.questionsRemaining || 5, isPro: metrics.isPro || false, createdAt: now, updatedAt: now }, metrics);
                return [4 /*yield*/, collection.insertOne(__assign({ _id: userId }, newMetrics))];
            case 5:
                _a.sent();
                return [2 /*return*/, true];
            case 6: return [3 /*break*/, 8];
            case 7:
                error_6 = _a.sent();
                console.error('Error updating user metrics:', error_6);
                throw error_6;
            case 8: return [2 /*return*/];
        }
    });
}); };
// Store a new email
exports.storeEmail = function (email) { return __awaiter(void 0, void 0, void 0, function () {
    var collection, emailId, emailDoc, error_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, exports.getEmailCollection()];
            case 1:
                collection = _a.sent();
                emailId = email._id || uuid_1.v4();
                emailDoc = {
                    _id: emailId,
                    userId: email.userId,
                    sender: email.sender,
                    recipients: email.recipients,
                    subject: email.subject,
                    body: email.body,
                    timestamp: email.timestamp || new Date().toISOString(),
                    isRead: email.isRead || false,
                    labels: email.labels || [],
                    metadata: email.metadata || {}
                };
                return [4 /*yield*/, collection.insertOne(emailDoc)];
            case 2:
                _a.sent();
                return [2 /*return*/, emailId];
            case 3:
                error_7 = _a.sent();
                console.error('Error storing email:', error_7);
                throw error_7;
            case 4: return [2 /*return*/];
        }
    });
}); };
// Get emails for a user
exports.getUserEmails = function (userId) { return __awaiter(void 0, void 0, void 0, function () {
    var collection, query, result, emails, result_3, result_3_1, doc, e_3_1, error_8;
    var e_3, _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 15, , 16]);
                return [4 /*yield*/, exports.getEmailCollection()];
            case 1:
                collection = _b.sent();
                query = { userId: userId };
                return [4 /*yield*/, collection.find(query)];
            case 2:
                result = _b.sent();
                emails = [];
                _b.label = 3;
            case 3:
                _b.trys.push([3, 8, 9, 14]);
                result_3 = __asyncValues(result);
                _b.label = 4;
            case 4: return [4 /*yield*/, result_3.next()];
            case 5:
                if (!(result_3_1 = _b.sent(), !result_3_1.done)) return [3 /*break*/, 7];
                doc = result_3_1.value;
                emails.push(doc);
                _b.label = 6;
            case 6: return [3 /*break*/, 4];
            case 7: return [3 /*break*/, 14];
            case 8:
                e_3_1 = _b.sent();
                e_3 = { error: e_3_1 };
                return [3 /*break*/, 14];
            case 9:
                _b.trys.push([9, , 12, 13]);
                if (!(result_3_1 && !result_3_1.done && (_a = result_3["return"]))) return [3 /*break*/, 11];
                return [4 /*yield*/, _a.call(result_3)];
            case 10:
                _b.sent();
                _b.label = 11;
            case 11: return [3 /*break*/, 13];
            case 12:
                if (e_3) throw e_3.error;
                return [7 /*endfinally*/];
            case 13: return [7 /*endfinally*/];
            case 14: return [2 /*return*/, emails.sort(function (a, b) {
                    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
                })];
            case 15:
                error_8 = _b.sent();
                console.error('Error getting user emails:', error_8);
                throw error_8;
            case 16: return [2 /*return*/];
        }
    });
}); };
// Schedule an email for future sending
exports.scheduleEmail = function (email) { return __awaiter(void 0, void 0, void 0, function () {
    var collection, emailId, emailDoc, error_9;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, exports.getScheduledEmailCollection()];
            case 1:
                collection = _a.sent();
                emailId = email._id || uuid_1.v4();
                emailDoc = {
                    _id: emailId,
                    userId: email.userId,
                    recipients: email.recipients,
                    subject: email.subject,
                    body: email.body,
                    scheduledTime: email.scheduledTime,
                    status: 'scheduled',
                    createdAt: email.createdAt || new Date().toISOString(),
                    updatedAt: email.updatedAt || new Date().toISOString()
                };
                return [4 /*yield*/, collection.insertOne(emailDoc)];
            case 2:
                _a.sent();
                return [2 /*return*/, emailId];
            case 3:
                error_9 = _a.sent();
                console.error('Error scheduling email:', error_9);
                throw error_9;
            case 4: return [2 /*return*/];
        }
    });
}); };
