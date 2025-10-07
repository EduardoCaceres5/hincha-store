import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Select,
  useColorModeValue,
} from '@chakra-ui/react'
import { useState } from 'react'
import type { DateRange, DashboardFilters } from '@/services/dashboard'

interface DashboardFiltersProps {
  onFilterChange: (filters: DashboardFilters) => void
}

export function DashboardFilters({ onFilterChange }: DashboardFiltersProps) {
  const [dateRange, setDateRange] = useState<DateRange>('month')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [productCategory, setProductCategory] = useState('')
  const [expenseType, setExpenseType] = useState('')

  const cardBg = useColorModeValue('white', 'gray.800')

  const handleApplyFilters = () => {
    onFilterChange({
      dateRange,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      productCategory: productCategory || undefined,
      expenseType: expenseType || undefined,
    })
  }

  const handleReset = () => {
    setDateRange('month')
    setStartDate('')
    setEndDate('')
    setProductCategory('')
    setExpenseType('')
    onFilterChange({
      dateRange: 'month',
    })
  }

  return (
    <Box bg={cardBg} p={4} borderRadius="md" mb={6}>
      <Flex
        gap={4}
        direction={{ base: 'column', md: 'row' }}
        align={{ base: 'stretch', md: 'flex-end' }}
      >
        <FormControl>
          <FormLabel fontSize="sm">Rango de tiempo</FormLabel>
          <Select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as DateRange)}
            size="sm"
          >
            <option value="day">Día</option>
            <option value="week">Semana</option>
            <option value="month">Mes</option>
            <option value="year">Año</option>
            <option value="custom">Personalizado</option>
          </Select>
        </FormControl>

        {dateRange === 'custom' && (
          <>
            <FormControl>
              <FormLabel fontSize="sm">Fecha inicio</FormLabel>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                size="sm"
              />
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm">Fecha fin</FormLabel>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                size="sm"
              />
            </FormControl>
          </>
        )}

        <FormControl>
          <FormLabel fontSize="sm">Categoría de producto</FormLabel>
          <Select
            value={productCategory}
            onChange={(e) => setProductCategory(e.target.value)}
            placeholder="Todas"
            size="sm"
          >
            <option value="camisetas">Camisetas</option>
            <option value="pantalones">Pantalones</option>
            <option value="accesorios">Accesorios</option>
            <option value="zapatillas">Zapatillas</option>
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel fontSize="sm">Tipo de egreso</FormLabel>
          <Select
            value={expenseType}
            onChange={(e) => setExpenseType(e.target.value)}
            placeholder="Todos"
            size="sm"
          >
            <option value="inventory">Inventario</option>
            <option value="shipping">Envíos</option>
            <option value="marketing">Marketing</option>
            <option value="operations">Operaciones</option>
            <option value="other">Otros</option>
          </Select>
        </FormControl>

        <HStack spacing={2}>
          <Button colorScheme="blue" onClick={handleApplyFilters} size="sm">
            Aplicar
          </Button>
          <Button variant="outline" onClick={handleReset} size="sm">
            Limpiar
          </Button>
        </HStack>
      </Flex>
    </Box>
  )
}
