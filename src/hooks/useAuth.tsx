import api from '@/services/api'
import { useToast } from '@chakra-ui/react'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

type AuthCtx = {
  token: string | null
  setToken: (t: string | null, remember?: boolean) => void
  me: { id: string; email: string; name?: string; role?: string } | null
  loading: boolean
  logout: () => void
}

const AuthContext = createContext<AuthCtx | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null)
  const [me, setMe] = useState<AuthCtx['me']>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const toast = useToast()

  // al montar: leer token desde storage
  useEffect(() => {
    const t =
      localStorage.getItem('accessToken') ??
      sessionStorage.getItem('accessToken')
    setTokenState(t)
    // No ponemos loading=false aquí, esperamos a verificar /api/me
    if (!t) setLoading(false)
  }, [])

  // Escuchar evento de sesión caducada (401)
  useEffect(() => {
    const handleSessionExpired = (event: Event) => {
      const customEvent = event as CustomEvent
      const message =
        customEvent.detail?.message || 'Tu sesión ha expirado'

      // Mostrar toast
      toast({
        title: 'Sesión caducada',
        description: message,
        status: 'warning',
        duration: 5000,
        isClosable: true,
        position: 'top',
      })

      // Limpiar estado
      setTokenState(null)
      setMe(null)

      // Redirigir al login
      navigate('/login', {
        replace: true,
        state: { sessionExpired: true },
      })
    }

    window.addEventListener('auth:session-expired', handleSessionExpired)
    return () => {
      window.removeEventListener('auth:session-expired', handleSessionExpired)
    }
  }, [navigate, toast])

  // Escuchar evento de sin permisos (403)
  useEffect(() => {
    const handleForbidden = (event: Event) => {
      const customEvent = event as CustomEvent
      const message =
        customEvent.detail?.message ||
        'No tienes permisos para realizar esta acción'

      // Mostrar toast de error
      toast({
        title: 'Acceso denegado',
        description: message,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      })
    }

    window.addEventListener('auth:forbidden', handleForbidden)
    return () => {
      window.removeEventListener('auth:forbidden', handleForbidden)
    }
  }, [toast])

  // cuando hay token, cargar /api/me
  useEffect(() => {
    let cancel = false
    ;(async () => {
      if (!token) {
        setMe(null)
        return
      }
      try {
        const { data } = await api.get('/api/me')
        if (!cancel) {
          setMe(data)
          setLoading(false)
        }
      } catch (e: any) {
        // Solo borrar token si realmente es 401
        const status = e?.response?.status
        if (!cancel) {
          if (status === 401) {
            setMe(null)
            setTokenState(null)
            localStorage.removeItem('accessToken')
            sessionStorage.removeItem('accessToken')
          } else {
            // Error transitorio -> NO borres el token
            console.warn('useAuth: /api/me falló, pero no es 401:', status)
          }
          setLoading(false)
        }
      }
    })()
    return () => {
      cancel = true
    }
  }, [token])

  function setToken(t: string | null, remember = false) {
    setTokenState(t)
    localStorage.removeItem('accessToken')
    sessionStorage.removeItem('accessToken')
    if (t) {
      ;(remember ? localStorage : sessionStorage).setItem('accessToken', t)
    }
  }

  function logout() {
    setToken(null)
    navigate('/login', { replace: true })
  }

  const value = useMemo(
    () => ({ token, setToken, me, loading, logout }),
    [token, me, loading],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
