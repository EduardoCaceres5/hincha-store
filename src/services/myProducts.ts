import api from '@/services/api'
import { type Product } from '@/hooks/useProducts'

export async function getMyProducts(page = 1, limit = 12) {
  const { data } = await api.get<{
    items: Product[]
    page: number
    limit: number
    total: number
  }>(`/api/my/products`, { params: { page, limit } })
  return data
}
export async function deleteProduct(id: string) {
  await api.delete(`/api/products/${id}`)
}
export async function updateProductJSON(id: string, payload: Partial<Product>) {
  const { data } = await api.put<Product>(`/api/products/${id}`, payload, {
    headers: { 'Content-Type': 'application/json' },
  })
  return data
}
export async function updateProductMultipart(id: string, form: FormData) {
  const { data } = await api.put<Product>(`/api/products/${id}`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function bulkDeleteProducts(ids: string[]) {
  const { data } = await api.post('/api/products/bulk-delete', { ids })
  return data as { deleted: number }
}
