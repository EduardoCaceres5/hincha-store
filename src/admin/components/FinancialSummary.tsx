import {
  Card,
  CardBody,
  CardHeader,
  SimpleGrid,
  Stat,
  StatArrow,
  StatHelpText,
  StatLabel,
  StatNumber,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'
import type { FinancialSummary as FinancialSummaryType } from '@/services/dashboard'

interface FinancialSummaryProps {
  data: FinancialSummaryType | null
}

export function FinancialSummary({ data }: FinancialSummaryProps) {
  const cardBg = useColorModeValue('white', 'gray.800')
  const profitColor = useColorModeValue('green.500', 'green.300')
  const lossColor = useColorModeValue('red.500', 'red.300')

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

  return (
    <Card bg={cardBg} mb={6}>
      <CardHeader>
        <Text fontSize="lg" fontWeight="semibold">
          Resumen Financiero
        </Text>
      </CardHeader>
      <CardBody>
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={4}>
          <Stat>
            <StatLabel fontSize="sm">Ingresos Totales</StatLabel>
            <StatNumber fontSize="xl" color="green.500">
              {formatCurrency(data.totalRevenue)}
            </StatNumber>
            <StatHelpText fontSize="xs">
              <StatArrow
                type={data.revenueChange >= 0 ? 'increase' : 'decrease'}
              />
              {Math.abs(data.revenueChange).toFixed(1)}% vs. período anterior
            </StatHelpText>
          </Stat>

          <Stat>
            <StatLabel fontSize="sm">Egresos Totales</StatLabel>
            <StatNumber fontSize="xl" color="red.500">
              {formatCurrency(data.totalExpenses)}
            </StatNumber>
            <StatHelpText fontSize="xs">
              <StatArrow
                type={data.expenseChange >= 0 ? 'increase' : 'decrease'}
              />
              {Math.abs(data.expenseChange).toFixed(1)}% vs. período anterior
            </StatHelpText>
          </Stat>

          <Stat>
            <StatLabel fontSize="sm">Margen de Ganancia</StatLabel>
            <StatNumber fontSize="xl" color={isProfit ? profitColor : lossColor}>
              {formatCurrency(data.profitMargin)}
            </StatNumber>
            <StatHelpText fontSize="xs">
              {data.profitMarginPercentage.toFixed(1)}% de margen
            </StatHelpText>
          </Stat>

          <Stat>
            <StatLabel fontSize="sm">Tendencia</StatLabel>
            <StatNumber fontSize="xl">
              <StatArrow
                type={
                  data.totalRevenue > data.previousRevenue
                    ? 'increase'
                    : 'decrease'
                }
              />
            </StatNumber>
            <StatHelpText fontSize="xs">
              {data.totalRevenue > data.previousRevenue
                ? 'En crecimiento'
                : 'En descenso'}
            </StatHelpText>
          </Stat>
        </SimpleGrid>
      </CardBody>
    </Card>
  )
}
