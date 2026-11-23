import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { resolveRouteFromPath } from './features/routing/resolve-route'
import { AdvancedCalculatorPage } from './pages/advanced-calculator-page/AdvancedCalculatorPage'
import { CalculatorPage } from './pages/calculator-page/CalculatorPage'
import './global.css'

const rootElement = document.getElementById('root')

if (rootElement === null) {
  throw new Error('Could not find the root element with id "root".')
}

const route = resolveRouteFromPath(window.location.pathname)

createRoot(rootElement).render(
  <StrictMode>
    {route === 'advancedCalculator' ? (
      <AdvancedCalculatorPage />
    ) : (
      <CalculatorPage />
    )}
  </StrictMode>,
)
