import { AuthProvider } from '@/hooks/useAuth'
import { CartProvider } from '@/hooks/useCart'
import { ChakraProvider } from '@chakra-ui/react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import theme from './chakra/theme'

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
