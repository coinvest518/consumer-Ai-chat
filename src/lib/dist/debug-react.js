"use strict";
// This file is used to debug React issues in production
// It provides information about the React version and environment
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
exports.__esModule = true;
var react_1 = require("react");
var react_dom_1 = require("react-dom");
var debugReact = function () {
    // Only run in browser environment
    if (typeof window === 'undefined')
        return;
    // Save the original console methods
    var originalConsole = __assign({}, console);
    try {
        // Create a debug element to attach to the DOM
        var debugElement = document.createElement('div');
        debugElement.id = 'react-debug-info';
        debugElement.style.display = 'none';
        document.body.appendChild(debugElement);
        // Log React version info
        console.log('React Debug Information:');
        console.log('React version:', react_1["default"].version);
        console.log('React available functions:', Object.keys(react_1["default"]));
        console.log('ReactDOM available functions:', Object.keys(react_dom_1["default"]));
        // Test if hooks are working
        var hookTest = false;
        try {
            // This is a simple check to see if React.useState exists and is a function
            hookTest = typeof react_1["default"].useState === 'function';
            console.log('React.useState exists and is a function:', hookTest);
        }
        catch (e) {
            console.error('Error testing React.useState:', e);
        }
        // Check for multiple React instances
        var moduleInstances_1 = new Set();
        try {
            // This is a hacky way to check for multiple React instances
            if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
                var renderers = window.__REACT_DEVTOOLS_GLOBAL_HOOK__.renderers;
                if (renderers && renderers.size > 0) {
                    console.log('Multiple React instances detected:', renderers.size);
                    renderers.forEach(function (renderer, id) {
                        if (renderer.version) {
                            moduleInstances_1.add(renderer.version);
                            console.log("React instance " + id + ": v" + renderer.version);
                        }
                    });
                }
                else {
                    console.log('No duplicate React instances detected via DevTools hook');
                }
            }
            else {
                console.log('React DevTools hook not found');
            }
        }
        catch (e) {
            console.error('Error checking React instances:', e);
        }
        // Store debug info on window for inspection
        window.__REACT_DEBUG_INFO__ = {
            version: react_1["default"].version,
            hasHooks: hookTest,
            multipleInstances: moduleInstances_1.size > 1,
            reactKeys: Object.keys(react_1["default"]),
            reactDomKeys: Object.keys(react_dom_1["default"]),
            timestamp: new Date().toISOString()
        };
        console.log('Debug info attached to window.__REACT_DEBUG_INFO__');
    }
    catch (err) {
        console.error('Error in React debug script:', err);
    }
    finally {
        // Restore original console
        console = originalConsole;
    }
};
// Execute immediately in production
if (process.env.NODE_ENV === 'production') {
    window.addEventListener('load', function () {
        setTimeout(debugReact, 1000);
    });
}
exports["default"] = debugReact;
