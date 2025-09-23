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

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// (Opcional) Log en desarrollo para ver la URL final que sale
if (import.meta.env.DEV) {
  api.interceptors.request.use((cfg) => {
    // Ej: https://hincha-api.vercel.app + /api/products
    console.debug('[API]', cfg.baseURL, cfg.url)
    return cfg
  })
}

export default api
