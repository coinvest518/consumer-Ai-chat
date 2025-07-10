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
var framer_motion_1 = require("framer-motion");
var ChatInterface_1 = require("@/components/chat/ChatInterface");
var react_1 = require("react");
var useChat_1 = require("@/hooks/useChat");
var button_1 = require("@/components/ui/button");
var react_router_dom_1 = require("react-router-dom");
var AuthContext_1 = require("@/contexts/AuthContext");
var use_toast_1 = require("@/hooks/use-toast");
var api_1 = require("@/lib/api");
// StepIndicator and AI_STEPS are defined and used in ChatInterface.tsx for progress UI.
// If you need to customize step UI, edit them in ChatInterface.tsx.
var Chat = function () {
    var chatId = react_router_dom_1.useParams().chatId;
    var _a = useChat_1.useChat(), messages = _a.messages, setMessages = _a.setMessages, sendMessage = _a.sendMessage, isLoading = _a.isLoading;
    var navigate = react_router_dom_1.useNavigate();
    var location = react_router_dom_1.useLocation();
    var user = AuthContext_1.useAuth().user;
    var toast = use_toast_1.useToast().toast;
    var _b = react_1.useState(null), initialTemplate = _b[0], setInitialTemplate = _b[1];
    // Check for template from navigation state
    react_1.useEffect(function () {
        var _a;
        if ((_a = location.state) === null || _a === void 0 ? void 0 : _a.template) {
            setInitialTemplate(location.state.template);
            // Show a notification about the template being applied
            toast({
                title: "Template Applied",
                description: "\"" + location.state.template.name + "\" is ready to use"
            });
        }
    }, [location.state, toast]);
    // Load existing chat if chatId exists
    react_1.useEffect(function () {
        var loadChat = function () { return __awaiter(void 0, void 0, void 0, function () {
            var chatHistory, currentChat, messages_1, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!chatId || !user)
                            return [2 /*return*/];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, api_1.api.getChatHistory(user.id)];
                    case 2:
                        chatHistory = _a.sent();
                        currentChat = chatHistory.find(function (chat) { return chat.session_id === chatId; });
                        if (!currentChat) {
                            throw new Error('Chat not found');
                        }
                        messages_1 = [
                            {
                                id: currentChat.id,
                                text: currentChat.message,
                                sender: "user",
                                type: "user",
                                timestamp: new Date(currentChat.created_at).getTime()
                            },
                            {
                                id: currentChat.id + "-response",
                                text: currentChat.response,
                                sender: "bot",
                                type: "ai",
                                timestamp: new Date(currentChat.created_at).getTime() + 1
                            },
                        ];
                        setMessages(messages_1);
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        console.error('Error loading chat:', error_1);
                        toast({
                            title: 'Error',
                            description: 'Failed to load chat history',
                            variant: 'destructive'
                        });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        loadChat();
    }, [chatId, setMessages, toast]);
    // Redirect if not authenticated
    if (!user) {
        navigate('/login');
        return null;
    }
    var handleDashboardClick = function () {
        navigate('/dashboard');
    };
    return (React.createElement(framer_motion_1.motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.3 }, className: "min-h-screen flex flex-col bg-gray-50" },
        React.createElement("header", { className: "w-full bg-white shadow-sm" },
            React.createElement("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4" },
                React.createElement(button_1.Button, { variant: "ghost", onClick: handleDashboardClick, className: "flex items-center gap-2" }, "\u2190 Back to Dashboard"))),
        React.createElement("main", { className: "flex-grow py-16" },
            React.createElement("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" },
                React.createElement("div", { className: "max-w-3xl mx-auto text-center mb-12" },
                    React.createElement("h2", { className: "text-3xl font-extrabold text-gray-900 sm:text-4xl" }, "Ask ConsumerAI"),
                    React.createElement("p", { className: "mt-4 text-lg text-gray-500" }, "Get answers to your consumer law questions instantly."),
                    initialTemplate && (React.createElement("div", { className: "mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200" },
                        React.createElement("p", { className: "text-sm text-blue-800" },
                            React.createElement("strong", null, initialTemplate.name),
                            " template is ready to use"),
                        React.createElement("p", { className: "text-xs text-blue-600 mt-1" }, initialTemplate.description)))),
                React.createElement(ChatInterface_1["default"], { messages: messages, onSendMessage: sendMessage, isLoading: isLoading, showProgress: true, initialTemplate: initialTemplate })))));
};
exports["default"] = Chat;
