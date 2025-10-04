import { getMyOrders, type OrderListItem } from '@/services/orders'
import { formatGs } from '@/utils/format'
import {
  Badge,
  Box,
  Button,
  Heading,
  HStack,
  Spinner,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useToast,
  VStack,
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

      {/* Vista móvil: Cards */}
      <Box display={{ base: 'block', md: 'none' }}>
        <Stack spacing={3}>
          {data.items.map((o) => (
            <Box key={o.id} borderWidth="1px" borderRadius="md" p={4}>
              <VStack align="stretch" spacing={2}>
                <HStack justify="space-between">
                  <Text fontSize="xs" fontWeight="semibold" color="gray.600">
                    #{o.id.slice(0, 8)}…
                  </Text>
                  <Badge colorScheme="teal">{o.status}</Badge>
                </HStack>
                <Text fontSize="sm" color="gray.600">
                  {new Date(o.createdAt).toLocaleDateString('es-PY')}
                </Text>
                <HStack justify="space-between">
                  <Text fontSize="sm">
                    {o._count.items} item{o._count.items !== 1 ? 's' : ''}
                  </Text>
                  <Text fontSize="sm" fontWeight="bold">
                    {formatGs(o.subtotal)}
                  </Text>
                </HStack>
                <Button
                  as={RouterLink}
                  to={`/admin/pedido/${o.id}`}
                  size="sm"
                  variant="outline"
                  colorScheme="teal"
                  width="full"
                >
                  Ver detalle
                </Button>
              </VStack>
            </Box>
          ))}
        </Stack>
      </Box>

      {/* Vista desktop: Tabla */}
      <Box display={{ base: 'none', md: 'block' }} overflowX="auto">
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
      </Box>

      <HStack justify="center" mt={6} flexWrap="wrap">
        <Button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          isDisabled={page === 1}
          size={{ base: 'sm', md: 'md' }}
        >
          Anterior
        </Button>
        <Text fontSize={{ base: 'sm', md: 'md' }}>
          Página {data.page} de {totalPages}
        </Text>
        <Button
          onClick={() => setPage((p) => (p < totalPages ? p + 1 : p))}
          isDisabled={page >= totalPages}
          size={{ base: 'sm', md: 'md' }}
        >
          Siguiente
        </Button>
      </HStack>
    </Box>
  )
}
