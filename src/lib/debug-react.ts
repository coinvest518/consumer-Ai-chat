// This file is used to debug React issues in production
// It provides information about the React version and environment

import React from 'react';
import ReactDOM from 'react-dom';

declare global {
  interface Window {
    __REACT_DEVTOOLS_GLOBAL_HOOK__?: {
      renderers?: Map<any, any>;
      [key: string]: any;
    };
    __REACT_DEBUG_INFO__?: any;
  }
}

const debugReact = () => {
  // Only run in browser environment
  if (typeof window === 'undefined') return;

  // Save the original console methods
  const originalConsole = { ...console };
  
  try {
    // Create a debug element to attach to the DOM
    const debugElement = document.createElement('div');
    debugElement.id = 'react-debug-info';
    debugElement.style.display = 'none';
    document.body.appendChild(debugElement);
    
    // Log React version info
    console.log('React Debug Information:');
    console.log('React version:', React.version);
    console.log('React available functions:', Object.keys(React));
    console.log('ReactDOM available functions:', Object.keys(ReactDOM));
    
    // Test if hooks are working
    let hookTest = false;
    try {
      // This is a simple check to see if React.useState exists and is a function
      hookTest = typeof React.useState === 'function';
      console.log('React.useState exists and is a function:', hookTest);
    } catch (e) {
      console.error('Error testing React.useState:', e);
    }
    
    // Check for multiple React instances
    const moduleInstances = new Set();
    try {
      // This is a hacky way to check for multiple React instances
      if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
        const renderers = window.__REACT_DEVTOOLS_GLOBAL_HOOK__.renderers;
        if (renderers && renderers.size > 0) {
          console.log('Multiple React instances detected:', renderers.size);
          renderers.forEach((renderer, id) => {
            if (renderer.version) {
              moduleInstances.add(renderer.version);
              console.log(`React instance ${id}: v${renderer.version}`);
            }
          });
        } else {
          console.log('No duplicate React instances detected via DevTools hook');
        }
      } else {
        console.log('React DevTools hook not found');
      }
    } catch (e) {
      console.error('Error checking React instances:', e);
    }
    
    // Store debug info on window for inspection
    window.__REACT_DEBUG_INFO__ = {
      version: React.version,
      hasHooks: hookTest,
      multipleInstances: moduleInstances.size > 1,
      reactKeys: Object.keys(React),
      reactDomKeys: Object.keys(ReactDOM),
      timestamp: new Date().toISOString()
    };
    
    console.log('Debug info attached to window.__REACT_DEBUG_INFO__');
  } catch (err) {
    console.error('Error in React debug script:', err);
  } finally {
    // Restore original console
    console = originalConsole;
  }
};

// Execute immediately in production
if (process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    setTimeout(debugReact, 1000);
  });
}

export default debugReact;
