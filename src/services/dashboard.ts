import api from '@/services/api'

export type DashboardStats = {
  salesToday: number
  salesTodayChange: number
  pendingOrders: number
  activeProducts: number
  productsAddedToday: number
  totalUsers: number
  newUsersToday: number
}

export type SalesChartData = {
  date: string
  sales: number
}

export type TopProduct = {
  id: string
  title: string
  sales: number
  revenue: number
}

export type RecentOrder = {
  id: string
  orderNumber: string
  customerName: string
  status: string
  total: number
  createdAt: string
}

export async function getDashboardStats() {
  const { data } = await api.get<DashboardStats>('/api/admin/dashboard/stats')
  return data
}

export async function getSalesChart(days = 7) {
  const { data } = await api.get<SalesChartData[]>(
    '/api/admin/dashboard/sales-chart',
    { params: { days } }
  )
  return data
}

export async function getTopProducts(limit = 5) {
  const { data } = await api.get<TopProduct[]>(
    '/api/admin/dashboard/top-products',
    { params: { limit } }
  )
  return data
}

export async function getRecentOrders(limit = 10) {
  const { data } = await api.get<RecentOrder[]>(
    '/api/admin/dashboard/recent-orders',
    { params: { limit } }
  )
  return data
}
