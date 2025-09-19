import api from '@/services/api'

export async function getMyProducts() {
  const { data } = await api.get<{ items: any[] }>('/api/seller/products')
  return data.items
}

export async function createVariant(
  productId: string,
  payload: { option: string; stock: number; price?: number; sku?: string },
) {
  const { data } = await api.post(
    `/api/seller/products/${productId}/variants`,
    payload,
  )
  return data
}

export async function updateVariant(
  variantId: string,
  payload: Partial<{
    option: string
    stock: number
    price: number | null
    sku: string | null
  }>,
) {
  const { data } = await api.patch(`/api/seller/variants/${variantId}`, payload)
  return data
}

export async function deleteVariant(variantId: string) {
  await api.delete(`/api/seller/variants/${variantId}`)
}
