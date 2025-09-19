import { adminGetOrders, adminUpdateOrder } from '@/services/adminOrders'
import { sellerGetOrders, sellerUpdateOrder } from '@/services/sellerOrders'
import { formatGs } from '@/utils/format'
import {
  Badge,
  Box,
  Button,
  Heading,
  HStack,
  Input,
  Select,
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

type Mode = 'admin' | 'seller'

export default function ManageOrders({ mode }: { mode: Mode }) {
  const [status, setStatus] = useState<string>('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const toast = useToast()

  async function load() {
    setLoading(true)
    try {
      const fn = mode === 'admin' ? adminGetOrders : sellerGetOrders
      const d = await fn({
        status: status || undefined,
        search: search || undefined,
        page,
        limit: 20,
      })
      setData(d)
    } catch {
      toast({ title: 'Error cargando órdenes', status: 'error' })
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    load()
  }, [status, page])

  async function update(
    id: string,
    newStatus: 'pending' | 'paid' | 'canceled',
  ) {
    try {
      const fn = mode === 'admin' ? adminUpdateOrder : sellerUpdateOrder
      await fn(id, newStatus)
      toast({ title: 'Estado actualizado', status: 'success' })
      load()
    } catch {
      toast({ title: 'No se pudo actualizar', status: 'error' })
    }
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1

  return (
    <Box>
      <Heading size="lg" mb={4}>
        {mode === 'admin' ? 'Órdenes (Admin)' : 'Órdenes (Vendedor)'}
      </Heading>

      <HStack mb={4} spacing={3}>
        <Select
          placeholder="Estado"
          value={status}
          onChange={(e) => {
            setPage(1)
            setStatus(e.target.value)
          }}
          maxW="48"
        >
          <option value="pending">Pendientes</option>
          <option value="paid">Pagadas</option>
          <option value="canceled">Canceladas</option>
        </Select>
        <Input
          placeholder="Buscar (nombre, teléfono, id...)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button
          onClick={() => {
            setPage(1)
            load()
          }}
        >
          Buscar
        </Button>
      </HStack>

      {loading ? (
        <Spinner />
      ) : (
        <>
          <Table size="sm" variant="simple">
            <Thead>
              <Tr>
                <Th>Orden</Th>
                <Th>Cliente</Th>
                <Th>Teléfono</Th>
                <Th>Fecha</Th>
                <Th isNumeric>Items</Th>
                <Th isNumeric>Subtotal</Th>
                <Th>Estado</Th>
                <Th>Acciones</Th>
              </Tr>
            </Thead>
            <Tbody>
              {data?.items.map((o: any) => (
                <Tr key={o.id}>
                  <Td>{o.id.slice(0, 8)}…</Td>
                  <Td>{o.name}</Td>
                  <Td>{o.phone}</Td>
                  <Td>{new Date(o.createdAt).toLocaleString('es-PY')}</Td>
                  <Td isNumeric>{o._count?.items ?? o.items?.length ?? 0}</Td>
                  <Td isNumeric>{formatGs(o.subtotal)}</Td>
                  <Td>
                    <Badge
                      colorScheme={
                        o.status === 'paid'
                          ? 'green'
                          : o.status === 'canceled'
                            ? 'red'
                            : 'yellow'
                      }
                    >
                      {o.status}
                    </Badge>
                  </Td>
                  <Td>
                    <HStack>
                      <Button
                        size="xs"
                        onClick={() => update(o.id, 'paid')}
                        colorScheme="green"
                        variant="outline"
                      >
                        Marcar pagada
                      </Button>
                      <Button
                        size="xs"
                        onClick={() => update(o.id, 'canceled')}
                        colorScheme="red"
                        variant="outline"
                      >
                        Cancelar
                      </Button>
                      <Button
                        size="xs"
                        onClick={() => update(o.id, 'pending')}
                        variant="outline"
                      >
                        Pendiente
                      </Button>
                    </HStack>
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
              Página {data?.page} de {totalPages}{' '}
            </Text>
            <Button
              onClick={() => setPage((p) => (p < totalPages ? p + 1 : p))}
              isDisabled={page >= totalPages}
            >
              Siguiente
            </Button>
          </HStack>
        </>
      )}
    </Box>
  )
}
