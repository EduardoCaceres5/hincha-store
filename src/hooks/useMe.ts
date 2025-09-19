import { useEffect, useState } from 'react'
import api from '@/services/api'

export function useMe() {
  const [me, setMe] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    ;(async () => {
      try {
        const { data } = await api.get('/api/me')
        setMe(data)
      } catch {
        setMe(null)
      } finally {
        setLoading(false)
      }
    })()
  }, [])
  return { me, loading }
}
