import { AuthProvider } from '@/hooks/useAuth'
import { CartProvider } from '@/hooks/useCart'
import { ChakraProvider } from '@chakra-ui/react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import theme from './chakra/theme'
import { registerSW } from 'virtual:pwa-register'

const rootEl = document.getElementById('root')
if (!rootEl) {
  throw new Error(
    'Root element not found: asegúrate de que index.html contiene <div id="root"></div>',
  )
}

const routerExtraProps = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  },
} as any

// Registrar Service Worker para PWA
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('Nueva versión disponible. ¿Recargar?')) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    console.log('App lista para funcionar offline')
  },
})

ReactDOM.createRoot(rootEl).render(
  <ChakraProvider theme={theme}>
    <BrowserRouter {...routerExtraProps}>
      <AuthProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </ChakraProvider>,
)
