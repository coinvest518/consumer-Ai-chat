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
var react_1 = require("react");
var framer_motion_1 = require("framer-motion");
var card_1 = require("@/components/ui/card");
var lucide_react_1 = require("lucide-react");
var react_router_dom_1 = require("react-router-dom");
var button_1 = require("@/components/ui/button");
var api_1 = require("@/lib/api");
var AuthContext_1 = require("@/contexts/AuthContext");
var ThankYou = function () {
    var searchParams = react_router_dom_1.useSearchParams()[0];
    var navigate = react_router_dom_1.useNavigate();
    var user = AuthContext_1.useAuth().user;
    var _a = react_1.useState('loading'), status = _a[0], setStatus = _a[1];
    var _b = react_1.useState(''), errorMessage = _b[0], setErrorMessage = _b[1];
    react_1.useEffect(function () {
        var sessionId = searchParams.get('session_id');
        if (!sessionId) {
            setStatus('error');
            setErrorMessage('No session ID found');
            return;
        }
        var verifyPayment = function () { return __awaiter(void 0, void 0, void 0, function () {
            var result, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, api_1.api.verifyPayment(sessionId)];
                    case 1:
                        result = _a.sent();
                        if (result.paid) {
                            setStatus('success');
                            // If the user is not authenticated, redirect after a delay
                            if (!user) {
                                setTimeout(function () {
                                    navigate('/login', {
                                        state: {
                                            message: 'Please log in to access your Pro features',
                                            paymentSuccess: true
                                        }
                                    });
                                }, 3000);
                            }
                        }
                        else {
                            setStatus('error');
                            setErrorMessage('Payment verification failed');
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        err_1 = _a.sent();
                        console.error('Error verifying payment:', err_1);
                        setStatus('error');
                        setErrorMessage('Failed to verify payment');
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        verifyPayment();
    }, [searchParams, user, navigate]);
    if (status === 'loading') {
        return (React.createElement(framer_motion_1.motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
            React.createElement("div", { className: "min-h-screen w-full flex items-center justify-center bg-gray-50" },
                React.createElement(card_1.Card, { className: "w-full max-w-md mx-4" },
                    React.createElement(card_1.CardContent, { className: "pt-6 pb-6 flex flex-col items-center text-center" },
                        React.createElement(lucide_react_1.Loader2, { className: "h-8 w-8 text-primary animate-spin mb-4" }),
                        React.createElement("h1", { className: "text-2xl font-bold text-gray-900" }, "Verifying Your Purchase..."),
                        React.createElement("p", { className: "mt-4 text-sm text-gray-600" }, "Please wait while we verify your payment."))))));
    }
    if (status === 'error') {
        return (React.createElement(framer_motion_1.motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
            React.createElement("div", { className: "min-h-screen w-full flex items-center justify-center bg-gray-50" },
                React.createElement(card_1.Card, { className: "w-full max-w-md mx-4" },
                    React.createElement(card_1.CardContent, { className: "pt-6 pb-6 flex flex-col items-center text-center" },
                        React.createElement(lucide_react_1.XCircle, { className: "h-8 w-8 text-red-500 mb-4" }),
                        React.createElement("h1", { className: "text-2xl font-bold text-gray-900" }, "Payment Verification Failed"),
                        React.createElement("p", { className: "mt-4 text-sm text-gray-600 mb-8" }, errorMessage || 'We could not verify your payment. Please try again or contact support.'),
                        React.createElement(button_1.Button, { asChild: true },
                            React.createElement(react_router_dom_1.Link, { to: "/" }, "Return Home")))))));
    }
    return (React.createElement(framer_motion_1.motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
        React.createElement("div", { className: "min-h-screen w-full flex items-center justify-center bg-gray-50" },
            React.createElement(card_1.Card, { className: "w-full max-w-md mx-4" },
                React.createElement(card_1.CardContent, { className: "pt-6 pb-6 flex flex-col items-center text-center" },
                    React.createElement(lucide_react_1.CheckCircle, { className: "h-8 w-8 text-green-500 mb-4" }),
                    React.createElement("h1", { className: "text-2xl font-bold text-gray-900" }, "Thank You for Your Purchase!"),
                    React.createElement("p", { className: "mt-4 text-sm text-gray-600" },
                        "We've added ",
                        React.createElement("span", { className: "font-bold" }, "50 credits"),
                        " to your account. You can now continue asking more questions."),
                    !user && (React.createElement("p", { className: "mt-2 text-sm text-amber-600" }, "You'll be redirected to the login page shortly to access your additional credits.")),
                    React.createElement("div", { className: "mt-8" },
                        React.createElement(button_1.Button, { asChild: true, className: "w-full" },
                            React.createElement(react_router_dom_1.Link, { to: user ? "/chat" : "/login" }, user ? "Continue Chatting" : "Log In to Continue"))))))));
};
exports["default"] = ThankYou;
