"use strict";
exports.__esModule = true;
exports.useMergeRefs = void 0;
// Import React carefully to avoid issues in different environments
var React;
try {
    React = require('react');
}
catch (e) {
    // Handle dynamic import in ESM context
    try {
        // @ts-ignore - This is intentional for ESM compatibility
        React = window.React;
    }
    catch (e) {
        // Fallback to empty object if React is not available
        React = {};
    }
}
// Create safer versions of hooks with extensive null checking
var safeReactHooks = {
    useLayoutEffect: function (callback, deps) {
        if (typeof window !== 'undefined' && React && typeof React.useLayoutEffect === 'function') {
            return React.useLayoutEffect(callback, deps);
        }
        else if (React && typeof React.useEffect === 'function') {
            return React.useEffect(callback, deps);
        }
        else {
            // No-op function for SSR or when React is not available
            return function () { };
        }
    },
    useEffect: function (callback, deps) {
        if (React && typeof React.useEffect === 'function') {
            return React.useEffect(callback, deps);
        }
        else {
            // No-op function when React is not available
            return function () { };
        }
    },
    useRef: function (initialValue) {
        if (React && typeof React.useRef === 'function') {
            return React.useRef(initialValue);
        }
        else {
            // Return a simple object that mimics a ref when React is not available
            return { current: initialValue };
        }
    }
};
// Safe version of useLayoutEffect that falls back to useEffect during SSR
var useIsomorphicLayoutEffect = safeReactHooks.useLayoutEffect;
// Helper function to assign a value to a ref
var assignRef = function (ref, value) {
    if (ref == null)
        return;
    if (typeof ref === 'function') {
        try {
            ref(value);
        }
        catch (error) {
            console.error('Error calling ref as function:', error);
        }
        return;
    }
    try {
        ref.current = value;
    }
    catch (error) {
        console.error('Cannot assign value to ref', error);
    }
};
// Simple useCallback implementation for ref stability
var useCallbackRef = function (value, callback) {
    var ref = safeReactHooks.useRef(value);
    safeReactHooks.useEffect(function () {
        if (ref.current !== value) {
            try {
                callback(value);
                ref.current = value;
            }
            catch (error) {
                console.error('Error in callback ref:', error);
            }
        }
    }, [value, callback]);
    return ref;
};
// WeakMap to track current values for cleanup
var currentValues = typeof WeakMap !== 'undefined' ? new WeakMap() : {
    // Fallback implementation for environments without WeakMap
    _map: new Map(),
    set: function (key, value) {
        try {
            this._map.set(key, value);
        }
        catch (e) {
            console.error('Failed to set value in WeakMap fallback:', e);
        }
    },
    get: function (key) {
        try {
            return this._map.get(key);
        }
        catch (e) {
            console.error('Failed to get value from WeakMap fallback:', e);
            return undefined;
        }
    },
    has: function (key) {
        try {
            return this._map.has(key);
        }
        catch (e) {
            console.error('Failed to check value in WeakMap fallback:', e);
            return false;
        }
    },
    "delete": function (key) {
        try {
            return this._map["delete"](key);
        }
        catch (e) {
            console.error('Failed to delete value in WeakMap fallback:', e);
            return false;
        }
    }
};
/**
 * Merges two or more refs together providing a single interface to set their value
 * @param refs Array of refs to merge
 * @param defaultValue Optional default value for the refs
 * @returns A new ref object that updates all provided refs
 */
function useMergeRefs(refs, defaultValue) {
    // Filter out null/undefined refs to avoid errors
    var validRefs = Array.isArray(refs) ? refs.filter(function (ref) { return ref != null; }) : [];
    var callbackRef = useCallbackRef(defaultValue || null, function (newValue) {
        try {
            validRefs.forEach(function (ref) { return assignRef(ref, newValue); });
        }
        catch (error) {
            console.error('Error assigning refs in useMergeRefs:', error);
        }
    });
    // Handle refs changes - added or removed
    useIsomorphicLayoutEffect(function () {
        try {
            var oldValue = currentValues.get(callbackRef);
            if (oldValue) {
                var prevRefs_1 = new Set(oldValue);
                var nextRefs_1 = new Set(validRefs);
                var current_1 = callbackRef.current;
                // Clean up refs that are no longer in the array
                prevRefs_1.forEach(function (ref) {
                    if (!nextRefs_1.has(ref)) {
                        assignRef(ref, null);
                    }
                });
                // Assign current value to new refs
                nextRefs_1.forEach(function (ref) {
                    if (!prevRefs_1.has(ref)) {
                        assignRef(ref, current_1);
                    }
                });
            }
            currentValues.set(callbackRef, validRefs);
        }
        catch (error) {
            console.error('Error in useMergeRefs effect:', error);
        }
    }, [validRefs]);
    return callbackRef;
}
exports.useMergeRefs = useMergeRefs;
