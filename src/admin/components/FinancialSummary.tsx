import type { FinancialSummary as FinancialSummaryType } from '@/services/dashboard'
import {
  Box,
  Card,
  CardBody,
  Icon,
  SimpleGrid,
  Stat,
  StatArrow,
  StatHelpText,
  StatLabel,
  StatNumber,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { FiDollarSign, FiTrendingDown, FiTrendingUp } from 'react-icons/fi'

const MotionCard = motion(Card)

interface FinancialSummaryProps {
  data: FinancialSummaryType | null
}

export function FinancialSummary({ data }: FinancialSummaryProps) {
  const cardBg = useColorModeValue('white', 'gray.800')

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG',
      minimumFractionDigits: 0,
    }).format(value)

  if (!data) {
    return (
      <Card bg={cardBg} mb={6}>
        <CardBody>
          <Text textAlign="center" color="gray.500">
            No hay datos financieros disponibles
          </Text>
        </CardBody>
      </Card>
    )
  }

  const isProfit = data.profitMargin >= 0

  const statCards = [
    {
      label: 'Ingresos Totales',
      value: formatCurrency(data.totalRevenue),
      change: data.revenueChange,
      icon: FiTrendingUp,
      gradient: 'linear(to-br, green.400, green.600)',
      iconBg: 'green.500',
    },
    {
      label: 'Egresos Totales',
      value: formatCurrency(data.totalExpenses),
      change: data.expenseChange,
      icon: FiTrendingDown,
      gradient: 'linear(to-br, red.400, red.600)',
      iconBg: 'red.500',
    },
    {
      label: 'Margen de Ganancia',
      value: formatCurrency(data.profitMargin),
      change: data.profitMarginPercentage,
      icon: FiDollarSign,
      gradient: isProfit
        ? 'linear(to-br, teal.400, teal.600)'
        : 'linear(to-br, orange.400, orange.600)',
      iconBg: isProfit ? 'teal.500' : 'orange.500',
    },
  ]

  return (
    <Box mb={6}>
      <Text fontSize="2xl" fontWeight="bold" mb={4}>
        Resumen Financiero
      </Text>
      <SimpleGrid columns={{ base: 1, md: 3 }} gap={6}>
        {statCards.map((stat, index) => (
          <MotionCard
            key={stat.label}
            bgGradient={stat.gradient}
            color="white"
            overflow="hidden"
            position="relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            _hover={{
              transform: 'translateY(-4px)',
              boxShadow: '2xl',
            }}
            style={{ transition: 'all 0.3s' }}
          >
            <CardBody>
              <Box position="relative" zIndex={1}>
                <Box
                  position="absolute"
                  top={-2}
                  right={-2}
                  opacity={0.2}
                  fontSize="6xl"
                >
                  <Icon as={stat.icon} />
                </Box>
                <Stat>
                  <StatLabel
                    fontSize="sm"
                    fontWeight="medium"
                    opacity={0.9}
                    mb={2}
                  >
                    {stat.label}
                  </StatLabel>
                  <StatNumber fontSize="3xl" fontWeight="bold" mb={2}>
                    {stat.value}
                  </StatNumber>
                  <StatHelpText fontSize="sm" color="whiteAlpha.900" m={0}>
                    <StatArrow
                      type={stat.change >= 0 ? 'increase' : 'decrease'}
                    />
                    {Math.abs(stat.change).toFixed(1)}%
                    {stat.label === 'Margen de Ganancia'
                      ? ' de margen'
                      : ' vs. período anterior'}
                  </StatHelpText>
                </Stat>
              </Box>
            </CardBody>
          </MotionCard>
        ))}
      </SimpleGrid>
    </Box>
  )
}
