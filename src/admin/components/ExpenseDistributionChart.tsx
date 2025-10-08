import {
  Card,
  CardBody,
  CardHeader,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import type { ExpenseCategory } from '@/services/dashboard'

interface ExpenseDistributionChartProps {
  data: ExpenseCategory[]
}

const COLORS = ['#F56565', '#ED8936', '#ECC94B', '#48BB78', '#4299E1', '#9F7AEA']

export function ExpenseDistributionChart({
  data,
}: ExpenseDistributionChartProps) {
  const cardBg = useColorModeValue('white', 'gray.800')

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG',
      minimumFractionDigits: 0,
    }).format(value)

  const chartData = data?.map((item) => ({
    name: item.category,
    value: item.amount,
    percentage: item.percentage,
  }))

  const CustomTooltip = ({ active, payload }: {
    active?: boolean
    payload?: Array<{
      name: string
      value: number
      fill: string
      payload: { percentage: number }
    }>
  }) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            backgroundColor: 'white',
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
          }}
        >
          <p style={{ margin: 0, fontWeight: 'bold' }}>{payload[0].name}</p>
          <p style={{ margin: '4px 0 0 0', color: payload[0].fill }}>
            {formatCurrency(payload[0].value)}
          </p>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px' }}>
            {payload[0].payload.percentage.toFixed(1)}%
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <Card bg={cardBg}>
      <CardHeader>
        <Text fontSize="lg" fontWeight="semibold">
          Distribución de Egresos por Categoría
        </Text>
      </CardHeader>
      <CardBody>
        {chartData && chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(props: any) => {
                  const { name, percentage } = props
                  return `${name} (${Number(percentage).toFixed(0)}%)`
                }}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((_entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 12 }}
                formatter={(value: any, entry: any) =>
                  `${value} - ${formatCurrency(entry?.payload?.value || 0)}`
                }
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <Text textAlign="center" color="gray.500" py={8}>
            No hay datos de distribución de egresos disponibles
          </Text>
        )}
      </CardBody>
    </Card>
  )
}
