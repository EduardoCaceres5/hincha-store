import { getMyOrders, type OrderListItem } from '@/services/orders'
import { formatGs } from '@/utils/format'
import {
  Box,
  Button,
  Heading,
  HStack,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useToast,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'

export default function Orders() {
  const [data, setData] = useState<{
    items: OrderListItem[]
    page: number
    limit: number
    total: number
  } | null>(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const toast = useToast()

  useEffect(() => {
    let cancel = false
    setLoading(true)
    ;(async () => {
      try {
        const d = await getMyOrders(page, 10)
        if (!cancel) setData(d)
      } catch {
        toast({
          title: 'No se pudieron cargar tus órdenes',
          status: 'error',
          isClosable: true,
        })
      } finally {
        if (!cancel) setLoading(false)
      }
    })()
    return () => {
      cancel = true
    }
  }, [page, toast])

  if (loading)
    return (
      <HStack justify="center" py={10}>
        <Spinner />
      </HStack>
    )

  if (!data || data.total === 0) {
    return (
      <Box>
        <Heading size="lg" mb={4}>
          Pedidos
        </Heading>
        <Text color="gray.600">Aún no tenés pedidos.</Text>
      </Box>
    )
  }

  const totalPages = Math.max(1, Math.ceil(data.total / data.limit))

  return (
    <Box>
      <Heading size="lg" mb={4}>
        Pedidos
      </Heading>
      <Table size="sm" variant="simple">
        <Thead>
          <Tr>
            <Th>Orden</Th>
            <Th>Fecha</Th>
            <Th>Estado</Th>
            <Th isNumeric>Items</Th>
            <Th isNumeric>Total</Th>
            <Th></Th>
          </Tr>
        </Thead>
        <Tbody>
          {data.items.map((o) => (
            <Tr key={o.id}>
              <Td>{o.id.slice(0, 8)}…</Td>
              <Td>{new Date(o.createdAt).toLocaleString('es-PY')}</Td>
              <Td>{o.status}</Td>
              <Td isNumeric>{o._count.items}</Td>
              <Td isNumeric>{formatGs(o.subtotal)}</Td>
              <Td>
                <Button
                  as={RouterLink}
                  to={`/admin/pedido/${o.id}`}
                  size="sm"
                  variant="outline"
                  colorScheme="teal"
                >
                  Ver
                </Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <HStack justify="center" mt={6}>
        <Button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          isDisabled={page === 1}
        >
          Anterior
        </Button>
        <Text>
          {' '}
          Página {data.page} de {totalPages}{' '}
        </Text>
        <Button
          onClick={() => setPage((p) => (p < totalPages ? p + 1 : p))}
          isDisabled={page >= totalPages}
        >
          Siguiente
        </Button>
      </HStack>
    </Box>
  )
}
