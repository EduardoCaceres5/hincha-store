import api from '@/services/api'
export async function sellerGetOrders(params: {
  status?: string
  search?: string
  page?: number
  limit?: number
}) {
  const { data } = await api.get('/api/seller/orders', { params })
  return data
}
export async function sellerUpdateOrder(
  id: string,
  status: 'pending' | 'paid' | 'canceled',
) {
  const { data } = await api.patch(`/api/seller/orders/${id}`, { status })
  return data
}
