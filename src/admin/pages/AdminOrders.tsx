import api from '@/services/api'
import {
  Badge,
  Box,
  Button,
  HStack,
  Input,
  Select,
  Stack,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'

type OrderRow = {
  id: string
  name: string
  phone: string
  status: 'pending' | 'paid' | 'canceled'
  subtotal: number
  createdAt: string
}

export default function AdminOrders() {
  const [items, setItems] = useState<OrderRow[]>([])
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<string>('')
  const [search, setSearch] = useState('')

  async function load() {
    const { data } = await api.get('/api/admin/orders', {
      params: { page, status, search },
    })
    setItems(data.items || [])
  }

  useEffect(() => {
    load()
  }, [page, status])

  return (
    <Box>
      <HStack spacing={3} mb={4} align="center" wrap="wrap">
        <Input
          placeholder="Buscar por cliente"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select
          placeholder="Estado"
          w="200px"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="pending">Pendiente</option>
          <option value="paid">Pagado</option>
          <option value="canceled">Cancelado</option>
        </Select>
        <Button
          onClick={() => {
            setPage(1)
            load()
          }}
        >
          Buscar
        </Button>
      </HStack>

      <Table size="sm">
        <Thead>
          <Tr>
            <Th>Pedido</Th>
            <Th>Cliente</Th>
            <Th>Fecha</Th>
            <Th>Estado</Th>
            <Th isNumeric>Total</Th>
          </Tr>
        </Thead>
        <Tbody>
          {items.map((o) => (
            <Tr key={o.id}>
              <Td>{o.id}</Td>
              <Td>{o.name}</Td>
              <Td>{new Date(o.createdAt).toLocaleString('es-PY')}</Td>
              <Td>
                <Badge
                  colorScheme={
                    o.status === 'paid'
                      ? 'green'
                      : o.status === 'pending'
                        ? 'yellow'
                        : 'red'
                  }
                >
                  {o.status}
                </Badge>
              </Td>
              <Td isNumeric>{o.subtotal.toLocaleString('es-PY')}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Stack direction="row" justify="flex-end" mt={4}>
        <Button onClick={() => setPage((p) => Math.max(1, p - 1))}>
          Anterior
        </Button>
        <Button onClick={() => setPage((p) => p + 1)}>Siguiente</Button>
      </Stack>
    </Box>
  )
}
