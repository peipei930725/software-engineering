// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { SkeletonTheme } from 'react-loading-skeleton'
import App from './App.jsx'
import './index.css' 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SkeletonTheme baseColor='#313131' highlightColor='#525252'>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </SkeletonTheme>
  </React.StrictMode>
)
