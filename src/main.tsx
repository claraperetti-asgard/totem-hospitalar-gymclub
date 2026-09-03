import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from './routes'

/* Totem: segurar o dedo não pode abrir o menu de contexto, e nada pode
   ser arrastado. CSS sozinho não resolve — o Chrome do Android dispara
   esses dois eventos mesmo com user-select desligado. */
document.addEventListener('contextmenu', (e) => e.preventDefault())
document.addEventListener('dragstart', (e) => e.preventDefault())

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <AppRoutes />
  </BrowserRouter>
)
