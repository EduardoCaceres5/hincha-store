import api from '@/services/api'

export async function createOrder(payload: {
  name: string
  phone: string
  address: string
  notes?: string
  lat?: number
  lng?: number
  items: { productId: string; variantId: string | undefined; qty: number }[]
}) {
  const { data } = await api.post<{ id: string }>('/api/orders', payload)
  return data
}

export type OrderListItem = {
  id: string
  status: string
  name: string
  phone: string
  subtotal: number
  totalPrice: number | null
  depositAmount?: number | null
  depositPaidAt?: string | null
  balancePaidAt?: string | null
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
  lat?: number | null
  lng?: number | null
  subtotal: number
  totalPrice: number | null
  depositAmount?: number | null
  depositPaidAt?: string | null
  depositTransactionId?: string | null
  balancePaidAt?: string | null
  balanceTransactionId?: string | null
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

export async function updateOrderStatus(
  id: string,
  status: string,
  depositAmount?: number,
  depositImages?: { imageUrl: string; imagePublicId?: string }[]
) {
  const payload: {
    status?: string
    depositAmount?: number
    depositImages?: { imageUrl: string; imagePublicId?: string }[]
  } = {}
  // Convertir status a MAYÚSCULAS para el backend
  if (status) payload.status = status.toUpperCase()
  if (depositAmount !== undefined) payload.depositAmount = depositAmount
  if (depositImages) payload.depositImages = depositImages

  const { data } = await api.patch<OrderDetail>(
    `/api/admin/orders/${id}`,
    payload
  )
  return data
}
