import {
  Card,
  CardBody,
  CardHeader,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { FinancialTrend } from '@/services/dashboard'

interface FinancialTrendChartProps {
  data: FinancialTrend[]
}

export function FinancialTrendChart({ data }: FinancialTrendChartProps) {
  const cardBg = useColorModeValue('white', 'gray.800')
  const revenueColor = useColorModeValue('#48BB78', '#68D391')
  const expenseColor = useColorModeValue('#F56565', '#FC8181')
  const profitColor = useColorModeValue('#4299E1', '#63B3ED')

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG',
      minimumFractionDigits: 0,
    }).format(value)

  return (
    <Card bg={cardBg}>
      <CardHeader>
        <Text fontSize={{ base: "md", md: "lg" }} fontWeight="semibold">
          Evolución de Ingresos y Egresos
        </Text>
      </CardHeader>
      <CardBody>
        {data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 10 }} width={60} />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ fontSize: 11 }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke={revenueColor}
                strokeWidth={2}
                name="Ingresos"
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke={expenseColor}
                strokeWidth={2}
                name="Egresos"
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="profit"
                stroke={profitColor}
                strokeWidth={2}
                name="Ganancia"
                dot={{ r: 4 }}
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <Text textAlign="center" color="gray.500" py={8}>
            No hay datos de tendencias disponibles
          </Text>
        )}
      </CardBody>
    </Card>
  )
}
