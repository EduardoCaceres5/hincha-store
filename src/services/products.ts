import api from '@/services/api'
import type { Product } from '@/types/product'

type RelatedInput = Pick<Product, 'id' | 'kit' | 'quality'>

export async function getProduct(id: string) {
  const { data } = await api.get(`/api/products/${id}`)
  return data as {
    id: string
    title: string
    basePrice: number
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

export async function getRelatedProducts(p: RelatedInput, limit = 8) {
  const params: Record<string, unknown> = { limit }
  if (p.kit) params.kit = p.kit
  if (p.quality) params.quality = p.quality

  const { data } = await api.get<{ items: Product[] }>(`/api/products`, {
    params,
  })
  return (data.items || []).filter((x) => x.id !== p.id).slice(0, limit)
}
