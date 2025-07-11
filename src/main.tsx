import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import './lib/debug-react' // Import debug utility

// Add React to window for debugging purposes in production
if (typeof window !== 'undefined') {
  // @ts-ignore - Adding React to window for debugging
  window.React = React;
  // @ts-ignore - Adding ReactDOM to window for debugging
  window.ReactDOM = ReactDOM;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
