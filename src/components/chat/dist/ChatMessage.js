"use strict";
exports.__esModule = true;
var utils_1 = require("@/lib/utils");
var FormattedMessage_1 = require("./FormattedMessage");
var avatar_1 = require("@/components/ui/avatar");
var lucide_react_1 = require("lucide-react");
function ChatMessage(_a) {
    var _b;
    var message = _a.message;
    var isUser = message.sender === 'user';
    var isEmail = message.type === 'email';
    return (React.createElement("div", { className: utils_1.cn("flex w-full items-start gap-4 p-4 rounded-lg", isUser ? "bg-primary/10" : "bg-white") },
        React.createElement(avatar_1.Avatar, { className: "h-8 w-8" }, isUser ? (React.createElement(React.Fragment, null,
            React.createElement(avatar_1.AvatarImage, { src: "/user-avatar.png" }),
            React.createElement(avatar_1.AvatarFallback, null, "U"))) : (React.createElement(React.Fragment, null,
            React.createElement(avatar_1.AvatarImage, { src: "/ai-avatar.png" }),
            React.createElement(avatar_1.AvatarFallback, null, "AI")))),
        React.createElement("div", { className: "flex-1 space-y-2" }, isEmail && ((_b = message.metadata) === null || _b === void 0 ? void 0 : _b.emailMetadata) ? (React.createElement("div", { className: "space-y-2" },
            React.createElement("div", { className: "flex items-center gap-2 text-sm text-gray-500" },
                React.createElement(lucide_react_1.Mail, { className: "h-4 w-4" }),
                React.createElement("span", null, "Email Analysis")),
            React.createElement("div", { className: "border rounded-md p-3 bg-gray-50" },
                React.createElement("div", { className: "font-medium" },
                    "Subject: ",
                    message.metadata.emailMetadata.subject),
                React.createElement("div", { className: "mt-2 text-sm text-gray-600" }, message.metadata.emailMetadata.body)))) : (React.createElement(FormattedMessage_1.FormattedMessage, { content: message.text, isAI: !isUser })))));
}
exports["default"] = ChatMessage;
