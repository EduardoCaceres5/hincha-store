import { RepeatIcon, ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons'
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Collapse,
  Flex,
  Grid,
  GridItem,
  Heading,
  IconButton,
  SimpleGrid,
  Spinner,
  Stat,
  StatArrow,
  StatHelpText,
  StatLabel,
  StatNumber,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react'
import { useCallback, useEffect, useState } from 'react'
import { useDashboardCache } from '@/hooks/useDashboardCache'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  getExpenseDistribution,
  getFinancialSummary,
  getFinancialTrend,
  getMonthlyComparison,
  getPerformanceIndicators,
  type DashboardFilters,
  type ExpenseCategory,
  type FinancialSummary as FinancialSummaryType,
  type FinancialTrend,
  type MonthlyComparison,
  type PerformanceIndicators as PerformanceIndicatorsType,
} from '@/services/dashboard'
import { DashboardFilters as DashboardFiltersComponent } from '@/admin/components/DashboardFilters'
import { FinancialSummary } from '@/admin/components/FinancialSummary'
import { FinancialTrendChart } from '@/admin/components/FinancialTrendChart'
import { MonthlyComparisonChart } from '@/admin/components/MonthlyComparisonChart'
import { ExpenseDistributionChart } from '@/admin/components/ExpenseDistributionChart'
import { PerformanceIndicators } from '@/admin/components/PerformanceIndicators'

export default function AdminDashboard() {
  const { stats, salesChart, topProducts, recentOrders, loading, refetch } =
    useDashboardCache()

  // Disclosure para collapse de filtros en móvil
  const { isOpen: isFiltersOpen, onToggle: onToggleFilters } = useDisclosure({
    defaultIsOpen: false,
  })

  // Estados para métricas financieras
  const [filters, setFilters] = useState<DashboardFilters>({
    dateRange: 'month',
  })
  const [financialSummary, setFinancialSummary] =
    useState<FinancialSummaryType | null>(null)
  const [financialTrend, setFinancialTrend] = useState<FinancialTrend[]>([])
  const [monthlyComparison, setMonthlyComparison] = useState<
    MonthlyComparison[]
  >([])
  const [expenseDistribution, setExpenseDistribution] = useState<
    ExpenseCategory[]
  >([])
  const [performanceIndicators, setPerformanceIndicators] =
    useState<PerformanceIndicatorsType | null>(null)
  const [financialLoading, setFinancialLoading] = useState(false)

  // Función para cargar métricas financieras
  const loadFinancialMetrics = useCallback(async () => {
    setFinancialLoading(true)
    try {
      const [summary, trend, monthly, expenses, performance] =
        await Promise.all([
          getFinancialSummary(filters),
          getFinancialTrend(filters),
          getMonthlyComparison(new Date().getFullYear()),
          getExpenseDistribution(filters),
          getPerformanceIndicators(filters),
        ])

      setFinancialSummary(summary)
      setFinancialTrend(trend)
      setMonthlyComparison(monthly)
      setExpenseDistribution(expenses)
      setPerformanceIndicators(performance)
    } catch (error) {
      console.error('Error al cargar métricas financieras:', error)
    } finally {
      setFinancialLoading(false)
    }
  }, [filters])

  // Cargar métricas al montar y cuando cambien los filtros
  useEffect(() => {
    loadFinancialMetrics()
  }, [loadFinancialMetrics])

  const handleFilterChange = (newFilters: DashboardFilters) => {
    setFilters(newFilters)
  }

  const cardBg = useColorModeValue('white', 'gray.800')
  const chartColor = useColorModeValue('#3182ce', '#63b3ed')

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG',
      minimumFractionDigits: 0,
    }).format(value)

  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: 'yellow',
      processing: 'blue',
      shipped: 'purple',
      delivered: 'green',
      cancelled: 'red',
    }
    return statusMap[status] || 'gray'
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" h="400px">
        <Spinner size="xl" />
      </Box>
    )
  }

  return (
    <Box>
      {/* Header with Refresh Button */}
      <Flex
        justifyContent="space-between"
        alignItems={{ base: "flex-start", sm: "center" }}
        mb={6}
        flexWrap="wrap"
        gap={3}
        direction={{ base: "column", sm: "row" }}
      >
        <Heading size={{ base: "md", md: "lg" }}>Dashboard Financiero</Heading>
        <Button
          leftIcon={<RepeatIcon />}
          onClick={() => {
            refetch()
            loadFinancialMetrics()
          }}
          isLoading={loading || financialLoading}
          colorScheme="blue"
          size="sm"
          width={{ base: "full", sm: "auto" }}
        >
          Recargar datos
        </Button>
      </Flex>

      {/* Filtros con collapse en móvil */}
      <Box mb={6}>
        {/* Botón para toggle en móvil */}
        <Button
          display={{ base: 'flex', md: 'none' }}
          onClick={onToggleFilters}
          width="full"
          variant="outline"
          rightIcon={isFiltersOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
          mb={isFiltersOpen ? 3 : 0}
          size="sm"
        >
          {isFiltersOpen ? 'Ocultar filtros' : 'Mostrar filtros'}
        </Button>

        {/* Filtros visibles en desktop, collapse en móvil */}
        <Box display={{ base: 'none', md: 'block' }}>
          <DashboardFiltersComponent onFilterChange={handleFilterChange} />
        </Box>
        <Collapse in={isFiltersOpen} animateOpacity>
          <Box display={{ base: 'block', md: 'none' }}>
            <DashboardFiltersComponent onFilterChange={handleFilterChange} />
          </Box>
        </Collapse>
      </Box>

      {/* Stats Cards */}
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={4} mb={6}>
        <Stat as={Card} p={4} bg={cardBg}>
          <StatLabel fontSize={{ base: 'sm', md: 'md' }}>Ventas hoy</StatLabel>
          <StatNumber fontSize={{ base: 'xl', md: '2xl' }}>
            {formatCurrency(stats?.salesToday || 0)}
          </StatNumber>
          <StatHelpText fontSize={{ base: 'xs', md: 'sm' }}>
            <StatArrow
              type={
                (stats?.salesTodayChange || 0) >= 0 ? 'increase' : 'decrease'
              }
            />
            {Math.abs(stats?.salesTodayChange || 0)}% vs. ayer
          </StatHelpText>
        </Stat>

        <Stat as={Card} p={4} bg={cardBg}>
          <StatLabel fontSize={{ base: 'sm', md: 'md' }}>
            Pedidos pendientes
          </StatLabel>
          <StatNumber fontSize={{ base: 'xl', md: '2xl' }}>
            {stats?.pendingOrders || 0}
          </StatNumber>
          <StatHelpText fontSize={{ base: 'xs', md: 'sm' }}>
            Requieren atención
          </StatHelpText>
        </Stat>

        <Stat as={Card} p={4} bg={cardBg}>
          <StatLabel fontSize={{ base: 'sm', md: 'md' }}>
            Productos activos
          </StatLabel>
          <StatNumber fontSize={{ base: 'xl', md: '2xl' }}>
            {stats?.activeProducts || 0}
          </StatNumber>
          <StatHelpText fontSize={{ base: 'xs', md: 'sm' }}>
            +{stats?.productsAddedToday || 0} hoy
          </StatHelpText>
        </Stat>

        <Stat as={Card} p={4} bg={cardBg}>
          <StatLabel fontSize={{ base: 'sm', md: 'md' }}>Usuarios</StatLabel>
          <StatNumber fontSize={{ base: 'xl', md: '2xl' }}>
            {stats?.totalUsers || 0}
          </StatNumber>
          <StatHelpText fontSize={{ base: 'xs', md: 'sm' }}>
            +{stats?.newUsersToday || 0} nuevos
          </StatHelpText>
        </Stat>
      </SimpleGrid>

      {/* Resumen Financiero */}
      <FinancialSummary data={financialSummary} />

      {/* Gráficos Financieros */}
      <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={6} mb={6}>
        <GridItem>
          <FinancialTrendChart data={financialTrend} />
        </GridItem>
        <GridItem>
          <ExpenseDistributionChart data={expenseDistribution} />
        </GridItem>
      </Grid>

      {/* Comparación Mensual */}
      <Box mb={6}>
        <MonthlyComparisonChart data={monthlyComparison} />
      </Box>

      {/* Indicadores de Rendimiento */}
      <Box mb={6}>
        <PerformanceIndicators data={performanceIndicators} />
      </Box>

      {/* Charts Originales */}
      <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={{ base: 4, md: 6 }} mb={6}>
        <GridItem>
          <Card bg={cardBg}>
            <CardHeader>
              <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight="semibold">
                Ventas de los últimos 7 días
              </Text>
            </CardHeader>
            <CardBody>
              {Array.isArray(salesChart) && salesChart.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={salesChart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis tick={{ fontSize: 10 }} width={60} />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{ fontSize: 11 }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line
                      type="monotone"
                      dataKey="sales"
                      stroke={chartColor}
                      strokeWidth={2}
                      name="Ventas"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Text textAlign="center" color="gray.500" py={8}>
                  No hay datos de ventas disponibles
                </Text>
              )}
            </CardBody>
          </Card>
        </GridItem>

        <GridItem>
          <Card bg={cardBg}>
            <CardHeader>
              <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight="semibold">
                Top 5 Productos
              </Text>
            </CardHeader>
            <CardBody>
              {Array.isArray(topProducts) && topProducts.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topProducts} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis
                      dataKey="title"
                      type="category"
                      width={70}
                      tick={{ fontSize: 9 }}
                    />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Bar dataKey="revenue" fill={chartColor} name="Ingresos" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Text textAlign="center" color="gray.500" py={8}>
                  No hay datos de productos disponibles
                </Text>
              )}
            </CardBody>
          </Card>
        </GridItem>
      </Grid>

      {/* Recent Orders */}
      <Card bg={cardBg}>
        <CardHeader>
          <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight="semibold">
            Pedidos recientes
          </Text>
        </CardHeader>
        <CardBody px={{ base: 2, md: 6 }}>
          <Box overflowX="auto" sx={{
            '&::-webkit-scrollbar': {
              height: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'gray.100',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'gray.400',
              borderRadius: '4px',
            },
          }}>
            <Table size="sm" variant="simple">
              <Thead>
                <Tr>
                  <Th fontSize="xs" whiteSpace="nowrap">Pedido</Th>
                  <Th fontSize="xs" whiteSpace="nowrap" display={{ base: 'none', sm: 'table-cell' }}>Cliente</Th>
                  <Th fontSize="xs" whiteSpace="nowrap">Estado</Th>
                  <Th fontSize="xs" whiteSpace="nowrap" display={{ base: 'none', md: 'table-cell' }}>Fecha</Th>
                  <Th isNumeric fontSize="xs" whiteSpace="nowrap">Total</Th>
                </Tr>
              </Thead>
              <Tbody>
                {Array.isArray(recentOrders) && recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <Tr key={order.id}>
                      <Td fontWeight="medium" fontSize="xs" whiteSpace="nowrap">
                        {order.orderNumber}
                      </Td>
                      <Td fontSize="xs" whiteSpace="nowrap" display={{ base: 'none', sm: 'table-cell' }}>
                        {order.customerName}
                      </Td>
                      <Td whiteSpace="nowrap">
                        <Badge
                          colorScheme={getStatusColor(order.status)}
                          fontSize="xx-small"
                        >
                          {order.status}
                        </Badge>
                      </Td>
                      <Td fontSize="xs" whiteSpace="nowrap" display={{ base: 'none', md: 'table-cell' }}>
                        {new Date(order.createdAt).toLocaleDateString('es-PY')}
                      </Td>
                      <Td isNumeric fontSize="xs" whiteSpace="nowrap">
                        {formatCurrency(order.total)}
                      </Td>
                    </Tr>
                  ))
                ) : (
                  <Tr>
                    <Td colSpan={5} textAlign="center" color="gray.500" fontSize="xs">
                      No hay pedidos recientes
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </Box>
        </CardBody>
      </Card>
    </Box>
  )
}
