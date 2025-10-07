import {
  Badge,
  Box,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Grid,
  GridItem,
  List,
  ListItem,
  Progress,
  Stat,
  StatArrow,
  StatHelpText,
  StatLabel,
  StatNumber,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'
import type { PerformanceIndicators as PerformanceIndicatorsType } from '@/services/dashboard'

interface PerformanceIndicatorsProps {
  data: PerformanceIndicatorsType | null
}

export function PerformanceIndicators({ data }: PerformanceIndicatorsProps) {
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG',
      minimumFractionDigits: 0,
    }).format(value)

  if (!data) {
    return (
      <Card bg={cardBg}>
        <CardBody>
          <Text textAlign="center" color="gray.500">
            No hay datos de rendimiento disponibles
          </Text>
        </CardBody>
      </Card>
    )
  }

  return (
    <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={6}>
      {/* Top Productos */}
      <GridItem>
        <Card bg={cardBg}>
          <CardHeader>
            <Text fontSize="lg" fontWeight="semibold">
              Top Productos por Ingresos
            </Text>
          </CardHeader>
          <CardBody>
            <List spacing={3}>
              {data.topProducts?.map((product, index) => (
                <ListItem
                  key={product.id}
                  p={3}
                  borderWidth={1}
                  borderColor={borderColor}
                  borderRadius="md"
                >
                  <Flex justify="space-between" align="center">
                    <Box>
                      <Flex align="center" gap={2}>
                        <Badge colorScheme="blue" fontSize="xs">
                          #{index + 1}
                        </Badge>
                        <Text fontWeight="medium" fontSize="sm">
                          {product.title}
                        </Text>
                      </Flex>
                      <Text fontSize="xs" color="gray.500" mt={1}>
                        {product.sales} ventas
                      </Text>
                    </Box>
                    <Box textAlign="right">
                      <Text fontWeight="bold" fontSize="sm" color="green.500">
                        {formatCurrency(product.revenue)}
                      </Text>
                      {product.growth !== 0 && (
                        <Text fontSize="xs" color={product.growth > 0 ? 'green.500' : 'red.500'}>
                          <StatArrow type={product.growth > 0 ? 'increase' : 'decrease'} />
                          {Math.abs(product.growth).toFixed(1)}%
                        </Text>
                      )}
                    </Box>
                  </Flex>
                </ListItem>
              ))}
            </List>
          </CardBody>
        </Card>
      </GridItem>

      {/* Métricas de Rendimiento */}
      <GridItem>
        <Card bg={cardBg} h="100%">
          <CardHeader>
            <Text fontSize="lg" fontWeight="semibold">
              Indicadores de Rendimiento
            </Text>
          </CardHeader>
          <CardBody>
            <Flex direction="column" gap={6}>
              <Stat>
                <StatLabel fontSize="sm">Tasa de Crecimiento Mensual</StatLabel>
                <StatNumber fontSize="2xl">
                  {data.monthlyGrowthRate.toFixed(1)}%
                </StatNumber>
                <StatHelpText>
                  <StatArrow
                    type={data.monthlyGrowthRate >= 0 ? 'increase' : 'decrease'}
                  />
                  {data.monthlyGrowthRate >= 0 ? 'Creciendo' : 'En descenso'}
                </StatHelpText>
              </Stat>

              <Stat>
                <StatLabel fontSize="sm">Punto de Equilibrio</StatLabel>
                <StatNumber fontSize="2xl">
                  {formatCurrency(data.breakEvenPoint)}
                </StatNumber>
                <StatHelpText fontSize="xs">
                  Ventas necesarias para cubrir gastos
                </StatHelpText>
              </Stat>

              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={3}>
                  Categorías de Gastos
                </Text>
                {data.expenseCategories?.slice(0, 5).map((category) => (
                  <Box key={category.category} mb={3}>
                    <Flex justify="space-between" mb={1}>
                      <Text fontSize="xs">{category.category}</Text>
                      <Text fontSize="xs" fontWeight="medium">
                        {category.percentage.toFixed(1)}%
                      </Text>
                    </Flex>
                    <Progress
                      value={category.percentage}
                      size="sm"
                      colorScheme={
                        category.percentage > 50
                          ? 'red'
                          : category.percentage > 30
                            ? 'orange'
                            : 'green'
                      }
                    />
                  </Box>
                ))}
              </Box>
            </Flex>
          </CardBody>
        </Card>
      </GridItem>
    </Grid>
  )
}
