import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '@/providers/theme-provider'
import { MockAuthProvider } from '@/providers/mock-auth'
import { TooltipProvider } from '@/components/ui/tooltip'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <MockAuthProvider>
          <TooltipProvider delayDuration={0}>
            <App />
          </TooltipProvider>
        </MockAuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
