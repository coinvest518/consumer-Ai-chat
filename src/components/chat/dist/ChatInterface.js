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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var use_toast_1 = require("@/hooks/use-toast");
var ChatMessage_1 = require("./ChatMessage");
var useChat_1 = require("@/hooks/useChat");
var framer_motion_1 = require("framer-motion");
var react_router_dom_1 = require("react-router-dom");
var AuthContext_1 = require("@/contexts/AuthContext");
var dialog_1 = require("@/components/ui/dialog");
var textarea_1 = require("@/components/ui/textarea");
var uuid_1 = require("uuid");
var AI_STEPS = {
    understanding: {
        icon: lucide_react_1.Brain,
        title: "Understanding Query",
        description: "Analyzing your question",
        color: "border-blue-500 text-blue-500"
    },
    processing: {
        icon: lucide_react_1.Loader2,
        title: "Processing",
        description: "Searching knowledge base",
        color: "border-purple-500 text-purple-500"
    },
    generating: {
        icon: lucide_react_1.MessageSquare,
        title: "Generating Response",
        description: "Crafting detailed answer",
        color: "border-green-500 text-green-500"
    }
};
function ChatInterface(_a) {
    var _this = this;
    var messages = _a.messages, onSendMessage = _a.onSendMessage, isLoading = _a.isLoading, showProgress = _a.showProgress, initialTemplate = _a.initialTemplate;
    var _b = react_1.useState(""), inputValue = _b[0], setInputValue = _b[1];
    var _c = react_1.useState(false), isDialogOpen = _c[0], setIsDialogOpen = _c[1];
    var _d = useChat_1.useChat(), sendMessage = _d.sendMessage, error = _d.error, chatLimits = _d.chatLimits, clearChat = _d.clearChat, setMessages = _d.setMessages;
    var user = AuthContext_1.useAuth().user;
    var _e = react_1.useState(null), currentStep = _e[0], setCurrentStep = _e[1];
    var _f = react_1.useState(0), progress = _f[0], setProgress = _f[1];
    var toast = use_toast_1.useToast().toast;
    var messagesEndRef = react_1.useRef(null);
    var navigate = react_router_dom_1.useNavigate();
    var _g = react_1.useState({
        subject: "",
        body: ""
    }), emailForm = _g[0], setEmailForm = _g[1];
    // Initialize input with template content if provided
    react_1.useEffect(function () {
        if (initialTemplate && initialTemplate.fullContent && !inputValue) {
            setInputValue(initialTemplate.fullContent);
        }
    }, [initialTemplate, inputValue]);
    // Auto-scroll to bottom when messages change
    react_1.useEffect(function () {
        var _a;
        (_a = messagesEndRef.current) === null || _a === void 0 ? void 0 : _a.scrollIntoView({ behavior: "smooth" });
    }, [messages]);
    // Reset thinking state when no message is being processed
    react_1.useEffect(function () {
        if (!isLoading) {
            setCurrentStep(null);
            setProgress(0);
        }
    }, [isLoading]);
    // Add error display
    react_1.useEffect(function () {
        if (error) {
            toast({
                title: "Error",
                description: error,
                variant: "destructive"
            });
        }
    }, [error, toast]);
    var remainingChats = chatLimits.dailyLimit - chatLimits.chatsUsedToday;
    var isLimitReached = !chatLimits.isProUser && chatLimits.chatsUsedToday >= chatLimits.dailyLimit;
    // Add clear chat button in header
    var handleClearChat = function () {
        clearChat();
        toast({
            title: "Chat Cleared",
            description: "Your chat history has been cleared"
        });
    };
    var handleSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var messageText, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    if (!inputValue.trim())
                        return [2 /*return*/];
                    // Prevent submission if limit reached
                    if (isLimitReached) {
                        toast({
                            title: "Daily Limit Reached",
                            description: "You've used all your credits. Purchase more to continue chatting.",
                            variant: "destructive"
                        });
                        return [2 /*return*/];
                    }
                    messageText = inputValue;
                    setInputValue("");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, 6, 7]);
                    setCurrentStep("understanding");
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 500); })];
                case 2:
                    _a.sent();
                    setCurrentStep("processing");
                    return [4 /*yield*/, onSendMessage(messageText)];
                case 3:
                    _a.sent();
                    setCurrentStep("generating");
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 500); })];
                case 4:
                    _a.sent();
                    setCurrentStep(null);
                    return [3 /*break*/, 7];
                case 5:
                    error_1 = _a.sent();
                    console.error("Chat error:", error_1);
                    toast({
                        title: "Error",
                        description: error_1.message || "Failed to send message. Please try again.",
                        variant: "destructive"
                    });
                    // Add the unsent message back to the input
                    setInputValue(messageText);
                    return [3 /*break*/, 7];
                case 6:
                    setCurrentStep(null);
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    var handleEmailSubmit = function () { return __awaiter(_this, void 0, void 0, function () {
        var newMessage, updatedMessages, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!emailForm.subject.trim() || !emailForm.body.trim()) {
                        toast({
                            title: "Incomplete form",
                            description: "Please provide both subject and body for the email",
                            variant: "destructive"
                        });
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    setCurrentStep('processing');
                    setProgress(33);
                    newMessage = {
                        id: uuid_1.v4(),
                        text: "Email for analysis",
                        sender: 'user',
                        type: 'email',
                        timestamp: Date.now(),
                        metadata: {
                            emailMetadata: {
                                subject: emailForm.subject,
                                body: emailForm.body,
                                sender: (user === null || user === void 0 ? void 0 : user.email) || '',
                                recipients: []
                            }
                        }
                    };
                    updatedMessages = __spreadArrays(messages, [newMessage]);
                    setMessages(updatedMessages);
                    // Send through chat flow
                    return [4 /*yield*/, onSendMessage(JSON.stringify({
                            type: 'email',
                            subject: emailForm.subject,
                            body: emailForm.body
                        }))];
                case 2:
                    // Send through chat flow
                    _a.sent();
                    // Reset form and close dialog
                    setEmailForm({
                        subject: "",
                        body: ""
                    });
                    setIsDialogOpen(false);
                    setCurrentStep(null);
                    setProgress(100);
                    toast({
                        title: "Email Added",
                        description: "Your email has been added to the chat for processing"
                    });
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    console.error('Error processing email:', error_2);
                    setCurrentStep(null);
                    setProgress(0);
                    toast({
                        title: "Error",
                        description: error_2 instanceof Error ? error_2.message : "An unexpected error occurred",
                        variant: "destructive"
                    });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var renderLimitStatus = function () {
        if (chatLimits.isProUser) {
            return React.createElement("div", { className: "text-sm text-gray-500" }, "Pro User: Unlimited Access");
        }
        return (React.createElement("div", { className: "p-4 text-center" },
            React.createElement("div", { className: "text-sm text-gray-600" }, !isLimitReached ? (remainingChats + " credit" + (remainingChats !== 1 ? 's' : '') + " remaining") : (React.createElement("div", { className: "text-red-500" }, "Daily limit reached. You've used all your credits."))),
            (remainingChats <= 2 || isLimitReached) && (React.createElement(button_1.Button, { variant: "default", className: "mt-2", onClick: function () { return window.location.href = 'https://consumer-ai.vercel.app/dashboard'; } }, "Get 50 More Credits"))));
    };
    console.log("ChatInterface received messages:", messages);
    var serviceLinks = [
        {
            name: "Tradeline Supply",
            description: "Authorized User Tradelines",
            icon: lucide_react_1.CreditCard,
            url: "https://www.tkqlhce.com/click-101325994-13520451",
            color: "bg-blue-500 hover:bg-blue-600"
        },
        {
            name: "Ava Finance",
            description: "Build Credit Fast",
            icon: lucide_react_1.TrendingUp,
            url: "https://meetava.sjv.io/anDyvY",
            color: "bg-purple-500 hover:bg-purple-600"
        },
        {
            name: "Notion AI",
            description: "Smart Workspace",
            icon: lucide_react_1.Bot,
            url: "https://affiliate.notion.so/5bs3ysbrqs3b-4y5a7",
            color: "bg-gray-800 hover:bg-gray-900"
        },
        {
            name: "Bright Data",
            description: "Web Data Platform",
            icon: lucide_react_1.Database,
            url: "https://brightdata.com",
            color: "bg-green-500 hover:bg-green-600"
        },
        {
            name: "ElevenLabs",
            description: "AI Voice Generation",
            icon: lucide_react_1.Mic,
            url: "https://try.elevenlabs.io/2dh4kqbqw25i",
            color: "bg-indigo-500 hover:bg-indigo-600"
        },
        {
            name: "Kikoff",
            description: "Credit Building",
            icon: lucide_react_1.CreditCard,
            url: "https://kikoff.com/refer/67PP77ZH",
            color: "bg-pink-500 hover:bg-pink-600"
        }
    ];
    var creditBuildingLinks = [
        {
            name: "Brigit",
            description: "Get $15 Free",
            icon: lucide_react_1.DollarSign,
            url: "https://brigit.app.link/cpFcNVSajub",
            color: "bg-orange-500 hover:bg-orange-600"
        },
        {
            name: "Grow Credit",
            description: "Build Credit History",
            icon: lucide_react_1.TrendingUp,
            url: "https://growcredit.com",
            color: "bg-teal-500 hover:bg-teal-600"
        },
        {
            name: "Credit Strong",
            description: "Credit Building Loans",
            icon: lucide_react_1.Building,
            url: "https://www.creditstrong.com",
            color: "bg-cyan-500 hover:bg-cyan-600"
        },
        {
            name: "RentReporter",
            description: "Special Discount",
            icon: lucide_react_1.BadgeCheck,
            url: "https://prf.hn/click/camref:1101l3G9fN",
            color: "bg-rose-500 hover:bg-rose-600"
        }
    ];
    return (React.createElement("div", { className: "max-w-4xl mx-auto relative space-y-6" },
        React.createElement("div", { className: "bg-white rounded-lg shadow-xl p-6" },
            React.createElement("h2", { className: "text-2xl font-semibold mb-6 text-center text-gray-800" }, "Recommended Financial Services"),
            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-6" }, serviceLinks.map(function (service, index) { return (React.createElement("a", { key: index, href: service.url, target: "_blank", rel: "noopener noreferrer", className: service.color + " text-white rounded-lg p-4 transition-transform hover:scale-105 flex flex-col items-center text-center space-y-2" },
                React.createElement(service.icon, { className: "h-8 w-8 mb-2" }),
                React.createElement("span", { className: "font-semibold" }, service.name),
                React.createElement("span", { className: "text-sm opacity-90" }, service.description))); })),
            React.createElement("h3", { className: "text-xl font-semibold mb-4 text-center text-gray-800" }, "Credit Building Tools"),
            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" }, creditBuildingLinks.map(function (tool, index) { return (React.createElement("a", { key: index, href: tool.url, target: "_blank", rel: "noopener noreferrer", className: tool.color + " text-white rounded-lg p-4 transition-transform hover:scale-105 flex flex-col items-center text-center space-y-2" },
                React.createElement(tool.icon, { className: "h-6 w-6 mb-1" }),
                React.createElement("span", { className: "font-semibold" }, tool.name),
                React.createElement("span", { className: "text-sm opacity-90" }, tool.description))); }))),
        React.createElement(framer_motion_1.motion.div, { className: "bg-white rounded-lg shadow-xl overflow-hidden", initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } },
            React.createElement("div", { className: "p-4 bg-primary text-white flex items-center justify-between" },
                React.createElement("div", { className: "flex items-center space-x-2" },
                    React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6", viewBox: "0 0 20 20", fill: "currentColor" },
                        React.createElement("path", { fillRule: "evenodd", d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z", clipRule: "evenodd" })),
                    React.createElement("span", { className: "font-medium text-lg" }, "ConsumerAI Assistant")),
                React.createElement("div", { className: "flex items-center space-x-2" },
                    React.createElement("span", { className: "inline-flex h-2 w-2 rounded-full bg-green-400" }),
                    React.createElement("span", { className: "text-sm" }, "Online")),
                React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: handleClearChat, className: "text-white hover:text-white/80" }, "Clear Chat")),
            React.createElement("div", { className: "h-96 p-4 overflow-y-auto bg-gray-50 space-y-4", id: "chat-container" },
                messages.length === 0 ? (React.createElement("div", { className: "text-center text-gray-500" }, "No messages yet")) : (messages.map(function (message, index) { return (React.createElement(ChatMessage_1["default"], { key: message.id || index, message: message })); })),
                currentStep && AI_STEPS[currentStep] && (React.createElement("div", { className: "flex items-center gap-2 p-3 bg-gray-100 rounded-lg border-l-4 " + AI_STEPS[currentStep].color },
                    (function () {
                        var Icon = AI_STEPS[currentStep].icon;
                        return React.createElement(Icon, { className: "w-4 h-4 animate-spin" });
                    })(),
                    React.createElement("div", { className: "flex flex-col text-left" },
                        React.createElement("span", { className: "text-sm font-semibold" }, AI_STEPS[currentStep].title),
                        React.createElement("span", { className: "text-xs text-gray-600" }, AI_STEPS[currentStep].description)))),
                React.createElement("div", { ref: messagesEndRef })),
            React.createElement("form", { onSubmit: handleSubmit, className: "p-4 border-t" },
                React.createElement("div", { className: "flex items-center gap-4 w-full" },
                    React.createElement("div", { className: "flex-1" },
                        React.createElement(input_1.Input, { type: "text", value: inputValue, onChange: function (e) { return setInputValue(e.target.value); }, disabled: isLimitReached, placeholder: isLimitReached
                                ? "Daily limit reached. Purchase more credits to continue."
                                : "Ask about consumer laws, credit reports, debt collection...", className: "w-full" })),
                    React.createElement("div", { className: "flex items-center gap-2" },
                        React.createElement(dialog_1.Dialog, { open: isDialogOpen, onOpenChange: setIsDialogOpen },
                            React.createElement(dialog_1.DialogTrigger, { asChild: true },
                                React.createElement(button_1.Button, { variant: "outline", className: "p-2 rounded-full h-10 w-10 flex items-center justify-center shrink-0", disabled: isLimitReached, title: "Add Email" },
                                    React.createElement(lucide_react_1.Mail, { className: "h-5 w-5" }))),
                            React.createElement(dialog_1.DialogContent, null,
                                React.createElement(dialog_1.DialogHeader, null,
                                    React.createElement(dialog_1.DialogTitle, null, "Add Email to Chat"),
                                    React.createElement(dialog_1.DialogDescription, null, "Paste an email you want the AI to analyze or process.")),
                                React.createElement("div", { className: "space-y-4 py-4" },
                                    React.createElement("div", { className: "space-y-2" },
                                        React.createElement("label", { className: "text-sm font-medium" }, "Email Subject"),
                                        React.createElement(input_1.Input, { value: emailForm.subject, onChange: function (e) { return setEmailForm(__assign(__assign({}, emailForm), { subject: e.target.value })); }, placeholder: "Enter email subject" })),
                                    React.createElement("div", { className: "space-y-2" },
                                        React.createElement("label", { className: "text-sm font-medium" }, "Email Body"),
                                        React.createElement(textarea_1.Textarea, { value: emailForm.body, onChange: function (e) { return setEmailForm(__assign(__assign({}, emailForm), { body: e.target.value })); }, placeholder: "Paste the email content here", rows: 8 }))),
                                React.createElement(dialog_1.DialogFooter, null,
                                    React.createElement(dialog_1.DialogClose, { asChild: true },
                                        React.createElement(button_1.Button, { variant: "outline" }, "Cancel")),
                                    React.createElement(button_1.Button, { onClick: handleEmailSubmit }, "Process Email")))),
                        React.createElement(button_1.Button, { type: "submit", className: "p-2 rounded-full h-10 w-10 flex items-center justify-center shrink-0", disabled: isLimitReached || !inputValue.trim() },
                            React.createElement(lucide_react_1.Send, { className: "h-5 w-5" }))))),
            renderLimitStatus())));
}
exports["default"] = ChatInterface;
