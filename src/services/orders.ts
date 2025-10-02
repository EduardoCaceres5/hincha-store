import api from '@/services/api'

export async function createOrder(payload: {
  name: string
  phone: string
  address: string
  notes?: string
  items: { productId: string; variantId: string | undefined; qty: number }[]
}) {
  const { data } = await api.post<{ id: string }>('/api/orders', payload)
  return data
}

export type OrderListItem = {
  id: string
  status: string
  name: string
  subtotal: number
  createdAt: string
  _count: { items: number }
}
export async function getMyOrders(page = 1, limit = 10) {
  const { data } = await api.get<{
    items: OrderListItem[]
    page: number
    limit: number
    total: number
  }>('/api/orders', { params: { page, limit } })
  return data
}

export type OrderDetail = {
  id: string
  status: string
  name: string
  phone: string
  address: string
  notes?: string | null
  subtotal: number
  createdAt: string
  items: {
    id: string
    productId: string
    title: string
    price: number
    quantity: number
    imageUrl: string
  }[]
}
export async function getOrder(id: string) {
  const { data } = await api.get<OrderDetail>(`/api/orders/${id}`)
  return data
}
