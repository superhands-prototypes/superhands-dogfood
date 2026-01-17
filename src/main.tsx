import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from '@/providers/theme-provider'
import { MockAuthProvider } from '@/providers/mock-auth'
import { TooltipProvider } from '@/components/ui/tooltip'
import App from './App'
import './index.css'

/**
 * Detect when embedded in the menubar preview.
 * BrowserRouter tries to call history.replaceState() with the prototype's URL,
 * but the document origin is the menubar's localhost - causing a cross-origin
 * security error. MemoryRouter keeps routing in memory without touching browser history.
 */
function isEmbeddedInMenubar(): boolean {
  try {
    // Check if we're in an iframe (cross-origin will throw, which also indicates embedding)
    return window.self !== window.top
  } catch {
    // Cross-origin iframe access throws - we're definitely embedded
    return true
  }
}

const Router = isEmbeddedInMenubar() ? MemoryRouter : BrowserRouter

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <ThemeProvider>
        <MockAuthProvider>
          <TooltipProvider delayDuration={0}>
            <App />
          </TooltipProvider>
        </MockAuthProvider>
      </ThemeProvider>
    </Router>
  </StrictMode>,
)
