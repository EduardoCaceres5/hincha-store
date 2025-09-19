import { useEffect, useMemo, useState } from 'react'
import api from '@/services/api'

export type Product = {
  id: string
  title: string
  price: number
  size?: string | null
  condition?: string | null
  description?: string | null
  imageUrl: string
  createdAt: string
}

export type PageResp<T> = {
  items: T[]
  page: number
  limit: number
  total: number
}

export type CatalogFilters = {
  search?: string
  size?: string
  condition?: string
  sort?: 'price:asc' | 'price:desc' | 'createdAt:desc' | 'createdAt:asc'
}

function useDebounce<T>(value: T, ms = 350) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), ms)
    return () => clearTimeout(id)
  }, [value, ms])
  return debounced
}

export function useProducts(filters: CatalogFilters, page: number, limit = 12) {
  const [data, setData] = useState<PageResp<Product> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown>(null)

  const debouncedFilters = useDebounce(filters, 350)
  const params = useMemo(
    () => ({ ...debouncedFilters, page, limit }),
    [debouncedFilters, page, limit],
  )

  useEffect(() => {
    let cancel = false
    setLoading(true)
    ;(async () => {
      try {
        const { data } = await api.get<PageResp<Product>>('/api/products', {
          params,
        })
        if (!cancel) {
          setData(data)
          setError(null)
        }
      } catch (e) {
        if (!cancel) setError(e)
      } finally {
        if (!cancel) setLoading(false)
      }
    })()
    return () => {
      cancel = true
    }
  }, [params])

  return { data, loading, error }
}
