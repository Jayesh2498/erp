import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '@/providers/ThemeProvider'
import { SidebarProvider } from '@/providers/SidebarProvider'
import { AuthProvider } from '@/providers/AuthProvider'
import { ToastProvider } from '@/components/ui-kit'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <ThemeProvider>
      <SidebarProvider>
        <AuthProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </AuthProvider>
      </SidebarProvider>
    </ThemeProvider>
  </BrowserRouter>,
)
