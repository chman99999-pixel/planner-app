import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import HubGate from './HubGate.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HubGate>
      <App />
    </HubGate>
  </React.StrictMode>,
)
