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
var react_1 = require("react");
var react_router_dom_1 = require("react-router-dom");
var framer_motion_1 = require("framer-motion");
var AuthContext_1 = require("@/contexts/AuthContext");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var api_1 = require("@/lib/api");
var lucide_react_1 = require("lucide-react");
var ChatList_1 = require("../components/ChatList");
var TemplateSidebar_1 = require("../components/TemplateSidebar");
var TavusChatbot_1 = require("../components/TavusChatbot");
var useChat_1 = require("../hooks/useChat");
var use_toast_1 = require("@/hooks/use-toast");
var Dashboard = function () {
    var navigate = react_router_dom_1.useNavigate();
    var _a = AuthContext_1.useAuth(), user = _a.user, signOut = _a.signOut, authLoading = _a.loading;
    var _b = react_1.useState([]), chatHistory = _b[0], setChatHistory = _b[1];
    var _c = react_1.useState(true), loading = _c[0], setLoading = _c[1];
    var _d = react_1.useState(null), error = _d[0], setError = _d[1];
    var chatSessions = useChat_1.useChat().chatSessions;
    var _e = react_1.useState(false), isUpgradeLoading = _e[0], setIsUpgradeLoading = _e[1];
    var _f = react_1.useState(false), isSidebarOpen = _f[0], setIsSidebarOpen = _f[1];
    var toast = use_toast_1.useToast().toast;
    var _g = react_1.useState({
        dailyLimit: 5,
        chatsUsed: 0,
        remaining: 5
    }), metrics = _g[0], setMetrics = _g[1];
    react_1.useEffect(function () {
        if (!authLoading && !user) {
            navigate('/login', { replace: true });
            return;
        }
        var fetchChatHistory = function () { return __awaiter(void 0, void 0, void 0, function () {
            var response, chats, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, 3, 4]);
                        if (!user)
                            return [2 /*return*/];
                        return [4 /*yield*/, api_1.api.getChatHistory(user.id)];
                    case 1:
                        response = _a.sent();
                        chats = (response || []).map(function (item) {
                            var _a, _b, _c, _d;
                            return ({
                                id: (_b = (_a = item.id) !== null && _a !== void 0 ? _a : item._id) !== null && _b !== void 0 ? _b : '',
                                userId: (_c = item.userId) !== null && _c !== void 0 ? _c : '',
                                messages: ((_d = item.messages) !== null && _d !== void 0 ? _d : []).map(function (msg) { return ({
                                    id: msg.id,
                                    text: msg.text,
                                    sender: msg.sender,
                                    type: msg.type === 'user' || msg.type === 'ai' ? msg.type : msg.sender === 'user' ? 'user' : 'ai',
                                    timestamp: msg.timestamp || Date.now()
                                }); }),
                                timestamp: item.timestamp,
                                createdAt: item.createdAt,
                                updatedAt: item.updatedAt,
                                _id: item._id
                            });
                        });
                        setChatHistory(chats);
                        setError(null);
                        return [3 /*break*/, 4];
                    case 2:
                        err_1 = _a.sent();
                        console.error('Error fetching chat history:', err_1);
                        setError('No chat history found. Start a new chat!');
                        setChatHistory([]);
                        return [3 /*break*/, 4];
                    case 3:
                        setLoading(false);
                        return [7 /*endfinally*/];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        var fetchMetrics = function () { return __awaiter(void 0, void 0, void 0, function () {
            var metricsData, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!user)
                            return [2 /*return*/];
                        console.log('Dashboard: Fetching metrics for user:', user.id);
                        return [4 /*yield*/, api_1.api.getChatLimits(user.id)];
                    case 1:
                        metricsData = _a.sent();
                        console.log('Dashboard: Received metrics data:', metricsData);
                        setMetrics({
                            dailyLimit: metricsData.daily_limit || 5,
                            chatsUsed: metricsData.chats_used || 0,
                            remaining: (metricsData.daily_limit || 5) - (metricsData.chats_used || 0)
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        err_2 = _a.sent();
                        console.error('Dashboard: Error fetching metrics:', err_2);
                        // Set default metrics on error to avoid blocking the dashboard
                        setMetrics({
                            dailyLimit: 5,
                            chatsUsed: 0,
                            remaining: 5
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        if (user) {
            fetchChatHistory();
            fetchMetrics();
        }
    }, [user, authLoading, navigate]);
    var handleNewChat = function (e) {
        e.preventDefault();
        e.stopPropagation();
        navigate('/chat');
    };
    var handleChatClick = function (chatId) {
        var safeId = chatId.replace(/[^a-zA-Z0-9-]/g, '');
        navigate("/chat/" + safeId);
    };
    var handleLogout = function (e) { return __awaiter(void 0, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    e.stopPropagation();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, signOut()];
                case 2:
                    _a.sent();
                    navigate('/', { replace: true });
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error('Logout error:', error_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleGetMoreCredits = function () {
        try {
            setIsUpgradeLoading(true);
            // Redirect to the fixed Stripe payment link
            window.location.href = 'https://buy.stripe.com/9AQeYP2cUcq0eA0bIU';
        }
        catch (error) {
            console.error('Error:', error);
            toast({
                title: "Error",
                description: "Failed to redirect to payment page",
                variant: "destructive"
            });
        }
        finally {
            setIsUpgradeLoading(false);
        }
    };
    var handleSidebarToggle = function () {
        setIsSidebarOpen(!isSidebarOpen);
    };
    var handleTemplateSelect = function (template) {
        // Navigate to chat with the template pre-loaded
        navigate('/chat', {
            state: {
                template: template,
                templateContent: template.fullContent,
                templateType: template.type
            }
        });
    };
    var refetchMetrics = function () { return __awaiter(void 0, void 0, void 0, function () {
        var metricsData, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    if (!user)
                        return [2 /*return*/];
                    return [4 /*yield*/, api_1.api.getChatLimits(user.id)];
                case 1:
                    metricsData = _a.sent();
                    setMetrics({
                        dailyLimit: metricsData.daily_limit || 5,
                        chatsUsed: metricsData.chats_used || 0,
                        remaining: (metricsData.daily_limit || 5) - (metricsData.chats_used || 0)
                    });
                    return [3 /*break*/, 3];
                case 2:
                    err_3 = _a.sent();
                    console.error('Error fetching metrics:', err_3);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    if (authLoading || loading) {
        return (react_1["default"].createElement("div", { className: "flex justify-center items-center min-h-screen" },
            react_1["default"].createElement("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-primary" })));
    }
    if (error) {
        return (react_1["default"].createElement("div", { className: "container mx-auto p-4" },
            react_1["default"].createElement(card_1.Card, { className: "p-4 text-center text-red-600" }, error)));
    }
    return (react_1["default"].createElement(framer_motion_1.motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
        react_1["default"].createElement(TemplateSidebar_1["default"], { isOpen: isSidebarOpen, onToggle: handleSidebarToggle, onTemplateSelect: handleTemplateSelect, userCredits: metrics.remaining, onCreditUpdate: refetchMetrics }),
        react_1["default"].createElement("div", { className: "min-h-screen bg-gray-50 transition-all duration-300 " + (isSidebarOpen ? 'lg:ml-96' : '') },
            react_1["default"].createElement("div", { className: "p-6" },
                react_1["default"].createElement("div", { className: "max-w-6xl mx-auto" },
                    react_1["default"].createElement("div", { className: "flex justify-between items-center mb-8" },
                        react_1["default"].createElement("div", { className: "flex items-center gap-4" },
                            react_1["default"].createElement(button_1.Button, { variant: "outline", size: "sm", onClick: handleSidebarToggle, className: "flex items-center gap-2" },
                                react_1["default"].createElement(lucide_react_1.Menu, { className: "w-4 h-4" }),
                                react_1["default"].createElement(lucide_react_1.FileText, { className: "w-4 h-4" }),
                                "Templates"),
                            react_1["default"].createElement("h1", { className: "text-3xl font-bold" }, "Dashboard")),
                        react_1["default"].createElement("div", { className: "flex gap-4" },
                            react_1["default"].createElement(button_1.Button, { onClick: handleNewChat }, "New Chat"),
                            react_1["default"].createElement(button_1.Button, { variant: "outline", onClick: handleLogout }, "Logout"))),
                    react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6 mb-8" },
                        react_1["default"].createElement(card_1.Card, null,
                            react_1["default"].createElement(card_1.CardHeader, null,
                                react_1["default"].createElement(card_1.CardTitle, null, "Usage Stats")),
                            react_1["default"].createElement(card_1.CardContent, null,
                                react_1["default"].createElement("div", { className: "flex flex-col gap-2" },
                                    react_1["default"].createElement("div", { className: "flex justify-between items-center" },
                                        react_1["default"].createElement("span", { className: "text-gray-600" }, "Questions Remaining:"),
                                        react_1["default"].createElement("span", { className: "font-medium" },
                                            metrics.remaining,
                                            "/",
                                            metrics.dailyLimit)),
                                    react_1["default"].createElement("div", { className: "flex justify-between items-center" },
                                        react_1["default"].createElement("span", { className: "text-gray-600" }, "Questions Asked:"),
                                        react_1["default"].createElement("span", { className: "font-medium" }, metrics.chatsUsed)),
                                    react_1["default"].createElement("div", { className: "mt-4" },
                                        react_1["default"].createElement(button_1.Button, { variant: "outline", className: "w-full", onClick: handleGetMoreCredits, disabled: isUpgradeLoading }, isUpgradeLoading ? 'Processing...' : 'Get 50 More Credits ($9.99)'))))),
                        react_1["default"].createElement(card_1.Card, null,
                            react_1["default"].createElement(card_1.CardHeader, null,
                                react_1["default"].createElement(card_1.CardTitle, null, "Account Summary")),
                            react_1["default"].createElement(card_1.CardContent, null,
                                react_1["default"].createElement("div", { className: "flex flex-col gap-2" },
                                    react_1["default"].createElement("div", { className: "flex justify-between items-center" },
                                        react_1["default"].createElement("span", { className: "text-gray-600" }, "Email:"),
                                        react_1["default"].createElement("span", { className: "font-medium" }, user === null || user === void 0 ? void 0 : user.email)),
                                    react_1["default"].createElement("div", { className: "flex justify-between items-center" },
                                        react_1["default"].createElement("span", { className: "text-gray-600" }, "Total Chats:"),
                                        react_1["default"].createElement("span", { className: "font-medium" }, chatHistory.length)),
                                    react_1["default"].createElement("div", { className: "flex justify-between items-center" },
                                        react_1["default"].createElement("span", { className: "text-gray-600" }, "Joined:"),
                                        react_1["default"].createElement("span", { className: "font-medium" }, (user === null || user === void 0 ? void 0 : user.created_at) ? new Date(user.created_at).toLocaleDateString() : 'N/A')))))),
                    react_1["default"].createElement("h2", { className: "text-2xl font-bold mb-4" }, "Recent Chats"),
                    (chatHistory.length === 0 && chatSessions.length === 0) ? (react_1["default"].createElement(card_1.Card, null,
                        react_1["default"].createElement(card_1.CardContent, { className: "flex flex-col items-center justify-center p-8" },
                            react_1["default"].createElement("p", { className: "text-gray-500 mb-4" }, "You haven't started any chats yet"),
                            react_1["default"].createElement(button_1.Button, { onClick: handleNewChat }, "Start Your First Chat")))) : (react_1["default"].createElement(ChatList_1["default"], { sessions: chatSessions.length > 0 ? chatSessions : chatHistory.map(function (chat) {
                            var _a;
                            return ({
                                id: chat.id,
                                sessionId: chat.id,
                                title: 'Chat',
                                lastMessage: ((_a = chat.messages[chat.messages.length - 1]) === null || _a === void 0 ? void 0 : _a.text) || '',
                                updatedAt: new Date(chat.timestamp || Date.now()),
                                messageCount: chat.messages.length,
                                messages: chat.messages.map(function (msg) { return (__assign(__assign({}, msg), { type: msg.type, sender: msg.sender })); })
                            });
                        }) })))),
            react_1["default"].createElement(TavusChatbot_1["default"], null))));
};
exports["default"] = Dashboard;
