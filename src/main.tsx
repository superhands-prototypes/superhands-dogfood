import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from '@/providers/theme-provider'
import { MockAuthProvider } from '@/providers/mock-auth'
import { TooltipProvider } from '@/components/ui/tooltip'
import App from './App'
import './index.css'

/**
 * Detect when embedded in menubar preview (cross-origin iframe).
 * BrowserRouter calls history.replaceState() with the prototype's URL,
 * but the document origin is the menubar's localhost - causing a security error.
 * MemoryRouter keeps routing in memory without touching browser history.
 */
function isEmbeddedPreview(): boolean {
  // Check for /preview path (menubar proxy serves content here)
  if (window.location.pathname.startsWith('/preview')) return true

  // Fallback: detect iframe embedding (cross-origin access throws)
  try {
    return window.self !== window.top
  } catch {
    return true
  }
}

const Router = isEmbeddedPreview() ? MemoryRouter : BrowserRouter

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
