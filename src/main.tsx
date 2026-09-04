import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { CalculatorPage } from './pages/calculator-page/CalculatorPage'
import './global.css'

const rootElement = document.getElementById('root')

if (rootElement === null) {
  throw new Error('Could not find the root element with id "root".')
}

createRoot(rootElement).render(
  <StrictMode>
    <CalculatorPage />
  </StrictMode>,
)
