import api from '@/services/api'
import type { Product, ProductDetail } from '@/types/Product'

export async function getProduct(id: string) {
  const { data } = await api.get(`/api/products/${id}`)
  return data as {
    id: string
    title: string
    price: number
    description?: string
    imageUrl: string
    variants: {
      id: string
      name: string
      stock: number
      price?: number | null
    }[]
  }
}

export async function getRelatedProducts(p: Product, limit = 8) {
  const params: any = { limit }
  if (p.size) params.size = p.size
  if (!p.size && p.condition) params.condition = p.condition
  const { data } = await api.get<{ items: Product[] }>(`/api/products`, {
    params,
  })
  return (data.items || []).filter((x) => x.id !== p.id).slice(0, limit)
}

export async function getProductDetail(id: string) {
  const { data } = await api.get<ProductDetail>(`/api/products/${id}`)
  return data
}
