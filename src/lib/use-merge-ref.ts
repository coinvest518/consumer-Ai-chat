// Import React carefully to avoid issues in different environments
let React;
try {
  React = require('react');
} catch (e) {
  // Handle dynamic import in ESM context
  try {
    // @ts-ignore - This is intentional for ESM compatibility
    React = window.React;
  } catch (e) {
    // Fallback to empty object if React is not available
    React = {};
  }
}

// Create safer versions of hooks with extensive null checking
const safeReactHooks = {
  useLayoutEffect: (callback: Function, deps?: any[]) => {
    if (typeof window !== 'undefined' && React && typeof React.useLayoutEffect === 'function') {
      return React.useLayoutEffect(callback, deps);
    } else if (React && typeof React.useEffect === 'function') {
      return React.useEffect(callback, deps);
    } else {
      // No-op function for SSR or when React is not available
      return function() {};
    }
  },
  useEffect: (callback: Function, deps?: any[]) => {
    if (React && typeof React.useEffect === 'function') {
      return React.useEffect(callback, deps);
    } else {
      // No-op function when React is not available
      return function() {};
    }
  },
  useRef: (initialValue: any) => {
    if (React && typeof React.useRef === 'function') {
      return React.useRef(initialValue);
    } else {
      // Return a simple object that mimics a ref when React is not available
      return { current: initialValue };
    }
  }
};

// Safe version of useLayoutEffect that falls back to useEffect during SSR
const useIsomorphicLayoutEffect = safeReactHooks.useLayoutEffect;

// Helper function to assign a value to a ref
const assignRef = (ref: any, value: any) => {
  if (ref == null) return;
  
  if (typeof ref === 'function') {
    try {
      ref(value);
    } catch (error) {
      console.error('Error calling ref as function:', error);
    }
    return;
  }
  
  try {
    ref.current = value;
  } catch (error) {
    console.error('Cannot assign value to ref', error);
  }
};

// Simple useCallback implementation for ref stability
const useCallbackRef = <T>(value: T, callback: (newValue: T) => void) => {
  const ref = safeReactHooks.useRef(value);
  
  safeReactHooks.useEffect(() => {
    if (ref.current !== value) {
      try {
        callback(value);
        ref.current = value;
      } catch (error) {
        console.error('Error in callback ref:', error);
      }
    }
  }, [value, callback]);
  
  return ref;
};

// WeakMap to track current values for cleanup
const currentValues = typeof WeakMap !== 'undefined' ? new WeakMap() : {
  // Fallback implementation for environments without WeakMap
  _map: new Map(),
  set: function(key: any, value: any) {
    try {
      this._map.set(key, value);
    } catch (e) {
      console.error('Failed to set value in WeakMap fallback:', e);
    }
  },
  get: function(key: any) {
    try {
      return this._map.get(key);
    } catch (e) {
      console.error('Failed to get value from WeakMap fallback:', e);
      return undefined;
    }
  },
  has: function(key: any) {
    try {
      return this._map.has(key);
    } catch (e) {
      console.error('Failed to check value in WeakMap fallback:', e);
      return false;
    }
  },
  delete: function(key: any) {
    try {
      return this._map.delete(key);
    } catch (e) {
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
export function useMergeRefs(refs: any[], defaultValue?: any) {
  // Filter out null/undefined refs to avoid errors
  const validRefs = Array.isArray(refs) ? refs.filter(ref => ref != null) : [];
  
  const callbackRef = useCallbackRef(defaultValue || null, (newValue) => {
    try {
      validRefs.forEach(ref => assignRef(ref, newValue));
    } catch (error) {
      console.error('Error assigning refs in useMergeRefs:', error);
    }
  });

  // Handle refs changes - added or removed
  useIsomorphicLayoutEffect(() => {
    try {
      const oldValue = currentValues.get(callbackRef);
      if (oldValue) {
        const prevRefs = new Set(oldValue);
        const nextRefs = new Set(validRefs);
        const current = callbackRef.current;
        
        // Clean up refs that are no longer in the array
        prevRefs.forEach(ref => {
          if (!nextRefs.has(ref)) {
            assignRef(ref, null);
          }
        });
        
        // Assign current value to new refs
        nextRefs.forEach(ref => {
          if (!prevRefs.has(ref)) {
            assignRef(ref, current);
          }
        });
      }
      
      currentValues.set(callbackRef, validRefs);
    } catch (error) {
      console.error('Error in useMergeRefs effect:', error);
    }
  }, [validRefs]);

  return callbackRef;
}
