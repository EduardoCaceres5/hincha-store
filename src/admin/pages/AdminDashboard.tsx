import { RepeatIcon } from '@chakra-ui/icons'
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Grid,
  GridItem,
  Heading,
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
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CloseButton,
  VStack,
  HStack,
  Icon,
} from '@chakra-ui/react'
import { FaInstagram } from 'react-icons/fa'
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
import {
  publishMissingProducts,
  type PublishMissingResponse,
} from '@/services/instagram'

export default function AdminDashboard() {
  const { stats, salesChart, topProducts, recentOrders, loading, refetch } =
    useDashboardCache()

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

  // Estados para Instagram
  const [instagramLoading, setInstagramLoading] = useState(false)
  const [instagramResult, setInstagramResult] =
    useState<PublishMissingResponse | null>(null)
  const toast = useToast()

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

  // Función para publicar productos faltantes en Instagram
  const handlePublishMissing = async () => {
    setInstagramLoading(true)
    setInstagramResult(null)

    try {
      const result = await publishMissingProducts()
      setInstagramResult(result)

      if (result.summary.total === 0) {
        toast({
          title: 'Todo al día',
          description: 'Todos los productos ya están publicados en Instagram',
          status: 'info',
          duration: 5000,
          isClosable: true,
        })
      } else if (result.summary.success > 0) {
        toast({
          title: '¡Publicación exitosa!',
          description: `${result.summary.success} producto(s) publicado(s) en Instagram`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        })
      }

      if (result.summary.errors > 0) {
        toast({
          title: 'Algunos errores',
          description: `${result.summary.errors} producto(s) tuvieron errores`,
          status: 'warning',
          duration: 5000,
          isClosable: true,
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'No se pudo publicar en Instagram',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setInstagramLoading(false)
    }
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
      <Flex justifyContent="space-between" alignItems="center" mb={6} flexWrap="wrap" gap={3}>
        <Heading size="lg">Dashboard Financiero</Heading>
        <HStack spacing={2}>
          <Button
            leftIcon={<Icon as={FaInstagram} />}
            onClick={handlePublishMissing}
            isLoading={instagramLoading}
            colorScheme="purple"
            size="sm"
          >
            Publicar faltantes
          </Button>
          <Button
            leftIcon={<RepeatIcon />}
            onClick={() => {
              refetch()
              loadFinancialMetrics()
            }}
            isLoading={loading || financialLoading}
            colorScheme="blue"
            size="sm"
          >
            Recargar datos
          </Button>
        </HStack>
      </Flex>

      {/* Instagram Result Alert */}
      {instagramResult && instagramResult.summary.total > 0 && (
        <Alert
          status={
            instagramResult.summary.errors === 0
              ? 'success'
              : instagramResult.summary.success > 0
              ? 'warning'
              : 'error'
          }
          variant="subtle"
          mb={6}
          borderRadius="md"
        >
          <AlertIcon />
          <Box flex="1">
            <AlertTitle>
              {instagramResult.message}
            </AlertTitle>
            <AlertDescription display="block">
              <VStack align="start" spacing={1} mt={2}>
                <Text fontSize="sm">
                  ✅ Exitosos: {instagramResult.summary.success} | ❌ Errores:{' '}
                  {instagramResult.summary.errors} | ⚠️ Saltados:{' '}
                  {instagramResult.summary.skipped}
                </Text>
                {instagramResult.results.filter((r) => r.status === 'error')
                  .length > 0 && (
                  <Box fontSize="xs" color="red.600" mt={2}>
                    <Text fontWeight="bold">Errores:</Text>
                    {instagramResult.results
                      .filter((r) => r.status === 'error')
                      .map((r, i) => (
                        <Text key={i}>
                          • {r.title}: {r.error}
                        </Text>
                      ))}
                  </Box>
                )}
              </VStack>
            </AlertDescription>
          </Box>
          <CloseButton
            alignSelf="flex-start"
            position="relative"
            right={-1}
            top={-1}
            onClick={() => setInstagramResult(null)}
          />
        </Alert>
      )}

      {/* Filtros */}
      <DashboardFiltersComponent onFilterChange={handleFilterChange} />

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
      <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6} mb={6}>
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
                      tick={{ fontSize: 12 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
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
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis
                      dataKey="title"
                      type="category"
                      width={80}
                      tick={{ fontSize: 10 }}
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
        <CardBody>
          <Box overflowX="auto">
            <Table size="sm">
              <Thead>
                <Tr>
                  <Th fontSize={{ base: 'xs', md: 'sm' }}>Pedido</Th>
                  <Th fontSize={{ base: 'xs', md: 'sm' }}>Cliente</Th>
                  <Th fontSize={{ base: 'xs', md: 'sm' }}>Estado</Th>
                  <Th fontSize={{ base: 'xs', md: 'sm' }}>Fecha</Th>
                  <Th isNumeric fontSize={{ base: 'xs', md: 'sm' }}>
                    Total
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {Array.isArray(recentOrders) && recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <Tr key={order.id}>
                      <Td fontWeight="medium" fontSize={{ base: 'xs', md: 'sm' }}>
                        {order.orderNumber}
                      </Td>
                      <Td fontSize={{ base: 'xs', md: 'sm' }}>
                        {order.customerName}
                      </Td>
                      <Td>
                        <Badge
                          colorScheme={getStatusColor(order.status)}
                          fontSize={{ base: 'xs', md: 'sm' }}
                        >
                          {order.status}
                        </Badge>
                      </Td>
                      <Td fontSize={{ base: 'xs', md: 'sm' }}>
                        {new Date(order.createdAt).toLocaleDateString('es-PY')}
                      </Td>
                      <Td isNumeric fontSize={{ base: 'xs', md: 'sm' }}>
                        {formatCurrency(order.total)}
                      </Td>
                    </Tr>
                  ))
                ) : (
                  <Tr>
                    <Td colSpan={5} textAlign="center" color="gray.500">
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
