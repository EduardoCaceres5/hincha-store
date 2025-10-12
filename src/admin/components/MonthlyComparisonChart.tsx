import {
  Card,
  CardBody,
  CardHeader,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { MonthlyComparison } from '@/services/dashboard'

interface MonthlyComparisonChartProps {
  data: MonthlyComparison[]
}

export function MonthlyComparisonChart({ data }: MonthlyComparisonChartProps) {
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
          Comparación Mensual
        </Text>
      </CardHeader>
      <CardBody>
        {data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 10 }} width={60} />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ fontSize: 11 }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="revenue" fill={revenueColor} name="Ingresos" />
              <Bar dataKey="expenses" fill={expenseColor} name="Egresos" />
              <Bar dataKey="profit" fill={profitColor} name="Ganancia" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <Text textAlign="center" color="gray.500" py={8}>
            No hay datos de comparación mensual disponibles
          </Text>
        )}
      </CardBody>
    </Card>
  )
}
