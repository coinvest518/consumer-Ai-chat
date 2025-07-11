"use strict";
exports.__esModule = true;
var react_1 = require("react");
var client_1 = require("react-dom/client");
var App_1 = require("./App");
require("./index.css");
require("./lib/debug-react"); // Import debug utility
// Add React to window for debugging purposes in production
if (typeof window !== 'undefined') {
    // @ts-ignore - Adding React to window for debugging
    window.React = react_1["default"];
    // @ts-ignore - Adding ReactDOM to window for debugging
    window.ReactDOM = client_1["default"];
}
client_1["default"].createRoot(document.getElementById('root')).render(react_1["default"].createElement(react_1["default"].StrictMode, null,
    react_1["default"].createElement(App_1["default"], null)));
