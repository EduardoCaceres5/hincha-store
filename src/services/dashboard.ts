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

// Nuevos tipos para métricas financieras
export type FinancialSummary = {
  totalRevenue: number
  totalExpenses: number
  profitMargin: number
  profitMarginPercentage: number
  revenueChange: number
  expenseChange: number
  previousRevenue: number
  previousExpenses: number
}

export type FinancialTrend = {
  date: string
  revenue: number
  expenses: number
  profit: number
}

export type MonthlyComparison = {
  month: string
  revenue: number
  expenses: number
  profit: number
}

export type ExpenseCategory = {
  category: string
  amount: number
  percentage: number
}

export type PerformanceIndicators = {
  topProducts: Array<{
    id: string
    title: string
    revenue: number
    sales: number
    growth: number
  }>
  expenseCategories: ExpenseCategory[]
  monthlyGrowthRate: number
  breakEvenPoint: number
}

export type DateRange = 'day' | 'week' | 'month' | 'year' | 'custom'

export type DashboardFilters = {
  dateRange: DateRange
  startDate?: string
  endDate?: string
  productCategory?: string
  expenseType?: string
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

// Nuevas funciones para métricas financieras
export async function getFinancialSummary(filters: DashboardFilters) {
  const { data } = await api.get<FinancialSummary>(
    '/api/admin/dashboard/financial-summary',
    { params: filters }
  )
  return data
}

export async function getFinancialTrend(filters: DashboardFilters) {
  const { data } = await api.get<FinancialTrend[]>(
    '/api/admin/dashboard/financial-trend',
    { params: filters }
  )
  return data
}

export async function getMonthlyComparison(year?: number) {
  const { data } = await api.get<MonthlyComparison[]>(
    '/api/admin/dashboard/monthly-comparison',
    { params: { year } }
  )
  return data
}

export async function getExpenseDistribution(filters: DashboardFilters) {
  const { data } = await api.get<ExpenseCategory[]>(
    '/api/admin/dashboard/expense-distribution',
    { params: filters }
  )
  return data
}

export async function getPerformanceIndicators(filters: DashboardFilters) {
  const { data } = await api.get<PerformanceIndicators>(
    '/api/admin/dashboard/performance',
    { params: filters }
  )
  return data
}
