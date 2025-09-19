import api from '@/services/api'
export async function adminGetOrders(params: {
  status?: string
  search?: string
  page?: number
  limit?: number
}) {
  const { data } = await api.get('/api/admin/orders', { params })
  return data
}
export async function adminUpdateOrder(
  id: string,
  status: 'pending' | 'paid' | 'canceled',
) {
  const { data } = await api.patch(`/api/admin/orders/${id}`, { status })
  return data
}
