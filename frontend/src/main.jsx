import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css'

// Polyfills for simple-peer
window.global = window;
window.process = {
  env: { DEBUG: undefined },
  version: '',
  nextTick: (cb) => setTimeout(cb, 0),
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
