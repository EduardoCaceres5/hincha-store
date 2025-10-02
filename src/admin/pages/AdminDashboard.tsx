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
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={4} mb={6}>
        <Stat as={Card} p={4} bg={cardBg}>
          <StatLabel>Ventas hoy</StatLabel>
          <StatNumber>{formatCurrency(stats?.salesToday || 0)}</StatNumber>
          <StatHelpText>
            <StatArrow
              type={
                (stats?.salesTodayChange || 0) >= 0 ? 'increase' : 'decrease'
              }
            />
            {Math.abs(stats?.salesTodayChange || 0)}% vs. ayer
          </StatHelpText>
        </Stat>

        <Stat as={Card} p={4} bg={cardBg}>
          <StatLabel>Pedidos pendientes</StatLabel>
          <StatNumber>{stats?.pendingOrders || 0}</StatNumber>
          <StatHelpText>Requieren atención</StatHelpText>
        </Stat>

        <Stat as={Card} p={4} bg={cardBg}>
          <StatLabel>Productos activos</StatLabel>
          <StatNumber>{stats?.activeProducts || 0}</StatNumber>
          <StatHelpText>+{stats?.productsAddedToday || 0} hoy</StatHelpText>
        </Stat>

        <Stat as={Card} p={4} bg={cardBg}>
          <StatLabel>Usuarios</StatLabel>
          <StatNumber>{stats?.totalUsers || 0}</StatNumber>
          <StatHelpText>+{stats?.newUsersToday || 0} nuevos</StatHelpText>
        </Stat>
      </SimpleGrid>

      {/* Charts */}
      <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6} mb={6}>
        <GridItem>
          <Card bg={cardBg}>
            <CardHeader>
              <Text fontSize="lg" fontWeight="semibold">
                Ventas de los últimos 7 días
              </Text>
            </CardHeader>
            <CardBody>
              {Array.isArray(salesChart) && salesChart.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={salesChart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Legend />
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
              <Text fontSize="lg" fontWeight="semibold">
                Top 5 Productos
              </Text>
            </CardHeader>
            <CardBody>
              {Array.isArray(topProducts) && topProducts.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topProducts} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="title" type="category" width={80} />
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
          <Text fontSize="lg" fontWeight="semibold">
            Pedidos recientes
          </Text>
        </CardHeader>
        <CardBody>
          <Table size="sm">
            <Thead>
              <Tr>
                <Th>Pedido</Th>
                <Th>Cliente</Th>
                <Th>Estado</Th>
                <Th>Fecha</Th>
                <Th isNumeric>Total</Th>
              </Tr>
            </Thead>
            <Tbody>
              {Array.isArray(recentOrders) && recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <Tr key={order.id}>
                    <Td fontWeight="medium">{order.orderNumber}</Td>
                    <Td>{order.customerName}</Td>
                    <Td>
                      <Badge colorScheme={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </Td>
                    <Td>
                      {new Date(order.createdAt).toLocaleDateString('es-PY')}
                    </Td>
                    <Td isNumeric>{formatCurrency(order.total)}</Td>
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
        </CardBody>
      </Card>
    </Box>
  )
}
