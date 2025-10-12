import type { PerformanceIndicators as PerformanceIndicatorsType } from '@/services/dashboard'
import {
  Badge,
  Box,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Grid,
  GridItem,
  Icon,
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
import { motion } from 'framer-motion'
import { FiAward, FiTrendingUp } from 'react-icons/fi'

const MotionCard = motion(Card)
const MotionListItem = motion(ListItem)

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
    <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={{ base: 4, md: 6 }}>
      {/* Top Productos */}
      <GridItem>
        <MotionCard
          bg={cardBg}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          borderRadius={{ base: "xl", md: "2xl" }}
          boxShadow="lg"
        >
          <CardHeader pb={3}>
            <Flex align="center" gap={2}>
              <Icon as={FiAward} boxSize={{ base: 4, md: 5 }} color="yellow.500" />
              <Text fontSize={{ base: "md", md: "lg" }} fontWeight="bold">
                Top Productos por Ingresos
              </Text>
            </Flex>
          </CardHeader>
          <CardBody>
            <List spacing={{ base: 2, md: 3 }}>
              {data.topProducts?.map((product, index) => (
                <MotionListItem
                  key={product.id}
                  p={{ base: 3, md: 4 }}
                  borderWidth={1}
                  borderColor={borderColor}
                  borderRadius={{ base: "lg", md: "xl" }}
                  bgGradient={
                    index === 0
                      ? 'linear(to-r, yellow.50, orange.50)'
                      : undefined
                  }
                  _dark={{
                    bgGradient:
                      index === 0
                        ? 'linear(to-r, yellow.900, orange.900)'
                        : undefined,
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  _hover={{
                    transform: 'translateX(4px)',
                    boxShadow: 'md',
                  }}
                  style={{ transition: 'all 0.2s' }}
                >
                  <Flex justify="space-between" align="center" gap={2}>
                    <Box flex={1} minW={0}>
                      <Flex align="center" gap={2} mb={1} flexWrap="wrap">
                        <Badge
                          colorScheme={
                            index === 0
                              ? 'yellow'
                              : index === 1
                                ? 'gray'
                                : 'orange'
                          }
                          fontSize={{ base: "xx-small", md: "xs" }}
                          fontWeight="bold"
                          flexShrink={0}
                        >
                          #{index + 1}
                        </Badge>
                        <Text
                          fontWeight="semibold"
                          fontSize={{ base: "xs", md: "sm" }}
                          noOfLines={1}
                        >
                          {product.title}
                        </Text>
                      </Flex>
                      <Text fontSize={{ base: "xx-small", md: "xs" }} color="gray.500">
                        {product.sales} ventas
                      </Text>
                    </Box>
                    <Box textAlign="right" flexShrink={0}>
                      <Text
                        fontWeight="bold"
                        fontSize={{ base: "xs", md: "md" }}
                        color="green.500"
                        whiteSpace="nowrap"
                      >
                        {formatCurrency(product.revenue)}
                      </Text>
                      {product.growth !== 0 && (
                        <Text
                          fontSize={{ base: "xx-small", md: "xs" }}
                          color={product.growth > 0 ? 'green.500' : 'red.500'}
                          fontWeight="medium"
                        >
                          <StatArrow
                            type={product.growth > 0 ? 'increase' : 'decrease'}
                          />
                          {Math.abs(product.growth).toFixed(1)}%
                        </Text>
                      )}
                    </Box>
                  </Flex>
                </MotionListItem>
              ))}
            </List>
          </CardBody>
        </MotionCard>
      </GridItem>

      {/* Métricas de Rendimiento */}
      <GridItem>
        <MotionCard
          bg={cardBg}
          h="100%"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          borderRadius={{ base: "xl", md: "2xl" }}
          boxShadow="lg"
        >
          <CardHeader pb={3}>
            <Flex align="center" gap={2}>
              <Icon as={FiTrendingUp} boxSize={{ base: 4, md: 5 }} color="teal.500" />
              <Text fontSize={{ base: "md", md: "lg" }} fontWeight="bold">
                Indicadores de Rendimiento
              </Text>
            </Flex>
          </CardHeader>
          <CardBody>
            <Flex direction="column" gap={{ base: 4, md: 6 }}>
              <Box
                p={{ base: 3, md: 4 }}
                borderRadius={{ base: "lg", md: "xl" }}
                bgGradient="linear(to-r, purple.50, pink.50)"
                _dark={{ bgGradient: 'linear(to-r, purple.900, pink.900)' }}
              >
                <Stat>
                  <StatLabel fontSize={{ base: "xs", md: "sm" }} fontWeight="medium">
                    Tasa de Crecimiento Mensual
                  </StatLabel>
                  <StatNumber fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold">
                    {data.monthlyGrowthRate.toFixed(1)}%
                  </StatNumber>
                  <StatHelpText fontSize={{ base: "xs", md: "sm" }}>
                    <StatArrow
                      type={
                        data.monthlyGrowthRate >= 0 ? 'increase' : 'decrease'
                      }
                    />
                    {data.monthlyGrowthRate >= 0 ? 'Creciendo' : 'En descenso'}
                  </StatHelpText>
                </Stat>
              </Box>

              <Box
                p={{ base: 3, md: 4 }}
                borderRadius={{ base: "lg", md: "xl" }}
                bgGradient="linear(to-r, blue.50, cyan.50)"
                _dark={{ bgGradient: 'linear(to-r, blue.900, cyan.900)' }}
              >
                <Stat>
                  <StatLabel fontSize={{ base: "xs", md: "sm" }} fontWeight="medium">
                    Punto de Equilibrio
                  </StatLabel>
                  <StatNumber fontSize={{ base: "lg", md: "2xl" }} fontWeight="bold">
                    {formatCurrency(data.breakEvenPoint)}
                  </StatNumber>
                  <StatHelpText fontSize="xs">
                    Ventas necesarias para cubrir gastos
                  </StatHelpText>
                </Stat>
              </Box>

              <Box>
                <Text fontSize={{ base: "sm", md: "md" }} fontWeight="bold" mb={{ base: 3, md: 4 }}>
                  Categorías de Gastos
                </Text>
                {data.expenseCategories?.slice(0, 5).map((category) => (
                  <Box key={category.category} mb={{ base: 3, md: 4 }}>
                    <Flex justify="space-between" mb={2} gap={2}>
                      <Text
                        fontSize={{ base: "xs", md: "sm" }}
                        fontWeight="medium"
                        noOfLines={1}
                      >
                        {category.category}
                      </Text>
                      <Badge
                        colorScheme={
                          category.percentage > 50
                            ? 'red'
                            : category.percentage > 30
                              ? 'orange'
                              : 'green'
                        }
                        fontSize={{ base: "xx-small", md: "xs" }}
                        flexShrink={0}
                      >
                        {category.percentage.toFixed(1)}%
                      </Badge>
                    </Flex>
                    <Progress
                      value={category.percentage}
                      size={{ base: "sm", md: "md" }}
                      borderRadius="full"
                      colorScheme={
                        category.percentage > 50
                          ? 'red'
                          : category.percentage > 30
                            ? 'orange'
                            : 'green'
                      }
                      hasStripe
                      isAnimated
                    />
                  </Box>
                ))}
              </Box>
            </Flex>
          </CardBody>
        </MotionCard>
      </GridItem>
    </Grid>
  )
}
