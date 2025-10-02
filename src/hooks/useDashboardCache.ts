import { useCallback, useEffect, useState } from 'react'
import {
  getDashboardStats,
  getSalesChart,
  getTopProducts,
  getRecentOrders,
  type DashboardStats,
  type SalesChartData,
  type TopProduct,
  type RecentOrder,
} from '@/services/dashboard'
import { logger } from '@/utils/logger'

const CACHE_KEY = 'dashboard_cache'
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

type CachedData = {
  stats: DashboardStats | null
  salesChart: SalesChartData[]
  topProducts: TopProduct[]
  recentOrders: RecentOrder[]
  timestamp: number
}

export function useDashboardCache() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [salesChart, setSalesChart] = useState<SalesChartData[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [loading, setLoading] = useState(true)

  // Cargar datos desde localStorage
  const loadFromCache = useCallback((): CachedData | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (!cached) return null

      const data: CachedData = JSON.parse(cached)
      const now = Date.now()

      // Verificar si el caché es válido
      if (now - data.timestamp < CACHE_DURATION) {
        logger.success('Usando datos del caché (localStorage)')
        return data
      }

      logger.warn('Caché expirado, limpiando...')
      localStorage.removeItem(CACHE_KEY)
      return null
    } catch (error) {
      logger.error('Error al cargar caché:', error)
      localStorage.removeItem(CACHE_KEY)
      return null
    }
  }, [])

  // Guardar datos en localStorage
  const saveToCache = useCallback((data: Omit<CachedData, 'timestamp'>) => {
    try {
      const cacheData: CachedData = {
        ...data,
        timestamp: Date.now(),
      }
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData))
      logger.info('Datos guardados en caché')
    } catch (error) {
      logger.error('Error al guardar caché:', error)
    }
  }, [])

  // Fetch datos del backend
  const fetchData = useCallback(
    async (forceRefresh = false) => {
      // Intentar cargar desde caché si no es refresh forzado
      if (!forceRefresh) {
        const cached = loadFromCache()
        if (cached) {
          setStats(cached.stats)
          setSalesChart(cached.salesChart)
          setTopProducts(cached.topProducts)
          setRecentOrders(cached.recentOrders)
          setLoading(false)
          return
        }
      }

      logger.info('Consultando datos del backend...')
      try {
        setLoading(true)
        const [statsData, chartData, productsData, ordersData] =
          await Promise.all([
            getDashboardStats(),
            getSalesChart(7),
            getTopProducts(5),
            getRecentOrders(10),
          ])

        const normalizedStats = statsData || null
        const normalizedChart = Array.isArray(chartData) ? chartData : []
        const normalizedProducts = Array.isArray(productsData)
          ? productsData
          : []
        const normalizedOrders = Array.isArray(ordersData) ? ordersData : []

        setStats(normalizedStats)
        setSalesChart(normalizedChart)
        setTopProducts(normalizedProducts)
        setRecentOrders(normalizedOrders)

        // Guardar en caché
        saveToCache({
          stats: normalizedStats,
          salesChart: normalizedChart,
          topProducts: normalizedProducts,
          recentOrders: normalizedOrders,
        })
        logger.success('Datos actualizados correctamente')
      } catch (error) {
        logger.error('Error al obtener datos del dashboard:', error)
        setStats(null)
        setSalesChart([])
        setTopProducts([])
        setRecentOrders([])
      } finally {
        setLoading(false)
      }
    },
    [loadFromCache, saveToCache],
  )

  // Cargar datos al montar
  useEffect(() => {
    fetchData()
  }, []) // Solo se ejecuta una vez al montar

  return {
    stats,
    salesChart,
    topProducts,
    recentOrders,
    loading,
    refetch: () => fetchData(true),
  }
}
