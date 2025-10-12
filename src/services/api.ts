// src/services/api.ts
import axios from 'axios'

const raw = (import.meta.env.VITE_API_BASE_URL ?? '').trim()

// Debe ser ABSOLUTA: https://hincha-api.vercel.app
if (!/^https?:\/\//i.test(raw)) {
  // Fallar rápido para detectar el error de config
  throw new Error(
    'VITE_API_BASE_URL debe ser una URL absoluta con http(s):// (ej: https://hincha-api.vercel.app)',
  )
}

// Quitamos slashes finales para evitar // dobles
const BASE = raw.replace(/\/+$/, '')

const api = axios.create({ baseURL: BASE })

// Interceptor de request: agregar token automáticamente
api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem('accessToken') ??
    sessionStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Interceptor de response: detectar sesión caducada (401) y sin permisos (403)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    const errorMessage = error?.response?.data?.message || error?.response?.data?.error

    // 401: Sesión caducada o token inválido
    if (status === 401) {
      // Limpiar tokens
      localStorage.removeItem('accessToken')
      sessionStorage.removeItem('accessToken')

      // Emitir evento personalizado para que AuthProvider lo escuche
      window.dispatchEvent(
        new CustomEvent('auth:session-expired', {
          detail: {
            message: errorMessage || 'Tu sesión ha expirado',
          },
        }),
      )
    }

    // 403: Sin permisos para acceder al recurso
    if (status === 403) {
      window.dispatchEvent(
        new CustomEvent('auth:forbidden', {
          detail: {
            message:
              errorMessage || 'No tienes permisos para realizar esta acción',
          },
        }),
      )
    }

    return Promise.reject(error)
  },
)

// (Opcional) Log en desarrollo para ver la URL final que sale
if (import.meta.env.DEV) {
  api.interceptors.request.use((cfg) => {
    // Ej: https://hincha-api.vercel.app + /api/products
    console.debug('[API]', cfg.baseURL, cfg.url)
    return cfg
  })
}

export default api
