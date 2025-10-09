import api from '@/services/api'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'

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

  // al montar: leer token desde storage
  useEffect(() => {
    const t =
      localStorage.getItem('accessToken') ??
      sessionStorage.getItem('accessToken')
    setTokenState(t)
    // No ponemos loading=false aquí, esperamos a verificar /api/me
    if (!t) setLoading(false)
  }, [])

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
