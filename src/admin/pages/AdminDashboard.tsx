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
} from '@chakra-ui/react'
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

export default function AdminDashboard() {
  const { stats, salesChart, topProducts, recentOrders, loading, refetch } =
    useDashboardCache()

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
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Heading size="lg">Dashboard</Heading>
        <Button
          leftIcon={<RepeatIcon />}
          onClick={refetch}
          isLoading={loading}
          colorScheme="blue"
          size="sm"
        >
          Recargar datos
        </Button>
      </Flex>

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

      {/* Charts */}
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
                <ResponsiveContainer
                  width="100%"
                  height={{ base: 250, md: 300 }}
                >
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
                <ResponsiveContainer
                  width="100%"
                  height={{ base: 250, md: 300 }}
                >
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
