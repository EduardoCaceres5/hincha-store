import { getMyOrders, type OrderListItem } from '@/services/orders'
import { formatGs } from '@/utils/format'
import { CloseIcon, SearchIcon, ViewIcon } from '@chakra-ui/icons'
import {
  Badge,
  Box,
  Button,
  Grid,
  Heading,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Skeleton,
  SkeletonText,
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
import { useEffect, useMemo, useState } from 'react'
import { Link as RouterLink, useSearchParams } from 'react-router-dom'

const LIMIT = 10

// Helper para traducir estados
function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: 'Pendiente',
    CONFIRMED: 'Confirmado',
    PREPARING: 'Preparando',
    READY: 'Listo',
    DELIVERED: 'Entregado',
    CANCELLED: 'Cancelado',
  }
  return labels[status.toUpperCase()] || status
}

// Helper para obtener color por estado
function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: 'yellow',
    CONFIRMED: 'blue',
    PREPARING: 'purple',
    READY: 'green',
    DELIVERED: 'teal',
    CANCELLED: 'red',
  }
  return colors[status.toUpperCase()] || 'gray'
}

// Helper para verificar si es un pedido reciente (últimas 24h)
function isRecentOrder(createdAt: string): boolean {
  const now = new Date().getTime()
  const orderTime = new Date(createdAt).getTime()
  const hoursDiff = (now - orderTime) / (1000 * 60 * 60)
  return hoursDiff <= 24
}

// Helper para formatear monto con color
function getAmountColor(amount: number): string {
  if (amount >= 500000) return 'green.600' // Montos altos
  if (amount >= 200000) return 'blue.600' // Montos medios
  return 'gray.700' // Montos normales
}

// Helper para obtener el estado de pago
function getPaymentStatus(order: OrderListItem): {
  label: string
  color: string
  description?: string
} {
  // Si se pagó el saldo completo
  if (order.balancePaidAt) {
    return { label: 'Pagado', color: 'green' }
  }
  // Si hay seña pagada pero aún no se pagó el saldo
  if (order.depositAmount && order.depositPaidAt && order.totalPrice) {
    const balance = order.totalPrice - order.depositAmount
    return {
      label: 'Señado',
      color: 'yellow',
      description: `Saldo: ${formatGs(balance)}`,
    }
  }
  // Sin seña ni pago
  return { label: 'Pendiente', color: 'gray' }
}

export default function Orders() {
  const [data, setData] = useState<{
    items: OrderListItem[]
    page: number
    limit: number
    total: number
  } | null>(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  // Filtros y búsqueda
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sortBy, setSortBy] = useState('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const toast = useToast()
  const [searchParams, setSearchParams] = useSearchParams()

  // Debounce para búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 500)
    return () => clearTimeout(timer)
  }, [search])

  // Leer ?page al montar
  useEffect(() => {
    const q = Number(searchParams.get('page') || '1')
    if (!Number.isNaN(q) && q > 0 && q !== page) setPage(q)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Escribir ?page cuando cambia
  useEffect(() => {
    setSearchParams((prev) => {
      const sp = new URLSearchParams(prev)
      if (page > 1) sp.set('page', String(page))
      else sp.delete('page')
      return sp
    })
  }, [page, setSearchParams])

  // Resetear a página 1 cuando cambian los filtros
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, statusFilter, sortBy, sortOrder])

  useEffect(() => {
    let cancel = false
    setLoading(true)
    ;(async () => {
      try {
        const d = await getMyOrders(page, LIMIT)
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

  // Filtrado y ordenamiento local
  const filteredAndSortedItems = useMemo(() => {
    if (!data?.items) return []

    let filtered = [...data.items]

    // Búsqueda
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase()
      filtered = filtered.filter(
        (o) =>
          o.id.toLowerCase().includes(searchLower) ||
          o.name.toLowerCase().includes(searchLower)
      )
    }

    // Filtro por estado
    if (statusFilter) {
      filtered = filtered.filter((o) => o.status === statusFilter)
    }

    // Ordenamiento
    if (sortBy === 'createdAt') {
      filtered.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime()
        const dateB = new Date(b.createdAt).getTime()
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA
      })
    } else if (sortBy === 'subtotal') {
      filtered.sort((a, b) =>
        sortOrder === 'asc' ? a.subtotal - b.subtotal : b.subtotal - a.subtotal
      )
    } else if (sortBy === 'items') {
      filtered.sort((a, b) =>
        sortOrder === 'asc'
          ? a._count.items - b._count.items
          : b._count.items - a._count.items
      )
    }

    return filtered
  }, [data?.items, debouncedSearch, statusFilter, sortBy, sortOrder])

  // Estadísticas de pedidos
  const stats = useMemo(() => {
    if (!data?.items) return null

    const pending = data.items.filter(o => o.status === 'PENDING').length
    const confirmed = data.items.filter(o => o.status === 'CONFIRMED').length
    const preparing = data.items.filter(o => o.status === 'PREPARING').length
    const ready = data.items.filter(o => o.status === 'READY').length
    const delivered = data.items.filter(o => o.status === 'DELIVERED').length
    const cancelled = data.items.filter(o => o.status === 'CANCELLED').length

    return { pending, confirmed, preparing, ready, delivered, cancelled }
  }, [data?.items])

  const totalPages = useMemo(
    () => (data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1),
    [data]
  )

  function goToPage(n: number) {
    setPage((prev) => {
      const target = Math.max(1, Math.min(n, totalPages || 1))
      return target === prev ? prev : target
    })
  }

  return (
    <Box>
      <Heading size="lg" mb={4}>
        Pedidos
      </Heading>

      {/* Card de estadísticas */}
      {stats && (
        <Grid
          templateColumns={{
            base: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(6, 1fr)',
          }}
          gap={3}
          mb={4}
        >
          <Box
            borderWidth="1px"
            borderRadius="md"
            p={3}
            bg="yellow.50"
            borderColor="yellow.200"
          >
            <Text fontSize="xs" color="gray.600" fontWeight="medium">
              Pendientes
            </Text>
            <Text fontSize="2xl" fontWeight="bold" color="yellow.700">
              {stats.pending}
            </Text>
          </Box>
          <Box
            borderWidth="1px"
            borderRadius="md"
            p={3}
            bg="blue.50"
            borderColor="blue.200"
          >
            <Text fontSize="xs" color="gray.600" fontWeight="medium">
              Confirmados
            </Text>
            <Text fontSize="2xl" fontWeight="bold" color="blue.700">
              {stats.confirmed}
            </Text>
          </Box>
          <Box
            borderWidth="1px"
            borderRadius="md"
            p={3}
            bg="purple.50"
            borderColor="purple.200"
          >
            <Text fontSize="xs" color="gray.600" fontWeight="medium">
              Preparando
            </Text>
            <Text fontSize="2xl" fontWeight="bold" color="purple.700">
              {stats.preparing}
            </Text>
          </Box>
          <Box
            borderWidth="1px"
            borderRadius="md"
            p={3}
            bg="green.50"
            borderColor="green.200"
          >
            <Text fontSize="xs" color="gray.600" fontWeight="medium">
              Listos
            </Text>
            <Text fontSize="2xl" fontWeight="bold" color="green.700">
              {stats.ready}
            </Text>
          </Box>
          <Box
            borderWidth="1px"
            borderRadius="md"
            p={3}
            bg="teal.50"
            borderColor="teal.200"
          >
            <Text fontSize="xs" color="gray.600" fontWeight="medium">
              Entregados
            </Text>
            <Text fontSize="2xl" fontWeight="bold" color="teal.700">
              {stats.delivered}
            </Text>
          </Box>
          <Box
            borderWidth="1px"
            borderRadius="md"
            p={3}
            bg="red.50"
            borderColor="red.200"
          >
            <Text fontSize="xs" color="gray.600" fontWeight="medium">
              Cancelados
            </Text>
            <Text fontSize="2xl" fontWeight="bold" color="red.700">
              {stats.cancelled}
            </Text>
          </Box>
        </Grid>
      )}

      {/* Barra de búsqueda y filtros */}
      <Stack spacing={3} mb={4}>
        {/* Búsqueda */}
        <InputGroup size={{ base: 'sm', md: 'md' }}>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Buscar por ID o nombre del cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </InputGroup>

        {/* Filtros y ordenamiento */}
        <Stack direction={{ base: 'column', md: 'row' }} spacing={3}>
          <Select
            placeholder="Todos los estados"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            size={{ base: 'sm', md: 'md' }}
          >
            <option value="PENDING">Pendiente</option>
            <option value="CONFIRMED">Confirmado</option>
            <option value="PREPARING">Preparando</option>
            <option value="READY">Listo</option>
            <option value="DELIVERED">Entregado</option>
            <option value="CANCELLED">Cancelado</option>
          </Select>

          <Select
            value={`${sortBy}:${sortOrder}`}
            onChange={(e) => {
              const [newSortBy, newSortOrder] = e.target.value.split(':')
              setSortBy(newSortBy)
              setSortOrder(newSortOrder as 'asc' | 'desc')
            }}
            size={{ base: 'sm', md: 'md' }}
          >
            <option value=":desc">Más recientes</option>
            <option value="createdAt:asc">Más antiguos</option>
            <option value="subtotal:desc">Mayor monto</option>
            <option value="subtotal:asc">Menor monto</option>
            <option value="items:desc">Más items</option>
            <option value="items:asc">Menos items</option>
          </Select>

          {/* Botón para limpiar filtros */}
          {(search || statusFilter || sortBy) && (
            <Button
              size={{ base: 'sm', md: 'md' }}
              variant="outline"
              leftIcon={<CloseIcon boxSize={3} />}
              onClick={() => {
                setSearch('')
                setStatusFilter('')
                setSortBy('')
                setSortOrder('desc')
              }}
              flexShrink={0}
              whiteSpace="nowrap"
            >
              Limpiar
            </Button>
          )}
        </Stack>

        {/* Contador de resultados */}
        {(search || statusFilter || sortBy) && data && (
          <Text fontSize="sm" color="gray.600">
            Mostrando {filteredAndSortedItems.length} de {data.items.length}{' '}
            pedidos en esta página
          </Text>
        )}
      </Stack>

      {loading ? (
        <>
          {/* Skeleton para móvil */}
          <Box display={{ base: 'block', md: 'none' }}>
            <Stack spacing={3}>
              {[1, 2, 3].map((i) => (
                <Box key={i} borderWidth="1px" borderRadius="md" p={4}>
                  <VStack align="stretch" spacing={2}>
                    <HStack justify="space-between">
                      <Skeleton height="16px" width="100px" />
                      <Skeleton height="20px" width="80px" borderRadius="md" />
                    </HStack>
                    <Skeleton height="14px" width="120px" />
                    <HStack justify="space-between">
                      <Skeleton height="14px" width="60px" />
                      <SkeletonText noOfLines={1} width="80px" />
                    </HStack>
                    <Skeleton height="32px" width="full" borderRadius="md" />
                  </VStack>
                </Box>
              ))}
            </Stack>
          </Box>

          {/* Skeleton para desktop */}
          <Box display={{ base: 'none', md: 'block' }} overflowX="auto">
            <Table size="sm" variant="simple">
              <Thead>
                <Tr>
                  <Th>Orden</Th>
                  <Th>Fecha</Th>
                  <Th>Estado</Th>
                  <Th>Pago</Th>
                  <Th isNumeric>Items</Th>
                  <Th isNumeric>Total</Th>
                  <Th></Th>
                </Tr>
              </Thead>
              <Tbody>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Tr key={i}>
                    <Td>
                      <Skeleton height="16px" width="80px" />
                    </Td>
                    <Td>
                      <Skeleton height="16px" width="140px" />
                    </Td>
                    <Td>
                      <Skeleton height="16px" width="80px" />
                    </Td>
                    <Td>
                      <Skeleton height="16px" width="60px" />
                    </Td>
                    <Td>
                      <Skeleton height="16px" width="40px" />
                    </Td>
                    <Td>
                      <Skeleton height="16px" width="80px" />
                    </Td>
                    <Td>
                      <Skeleton height="32px" width="60px" borderRadius="md" />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </>
      ) : !data?.items.length || !filteredAndSortedItems.length ? (
        // Empty state
        <VStack py={12} spacing={4}>
          <Text fontSize="6xl" opacity={0.3}>
            📦
          </Text>
          <Heading size="md" color="gray.600">
            {!data?.items.length
              ? 'No hay pedidos aún'
              : 'No se encontraron pedidos'}
          </Heading>
          <Text color="gray.500" textAlign="center" maxW="md">
            {!data?.items.length ? (
              'Aún no tenés pedidos registrados.'
            ) : (
              <>
                No hay pedidos que coincidan con los filtros aplicados.
                <br />
                Intentá con otros criterios de búsqueda.
              </>
            )}
          </Text>
          {(search || statusFilter || sortBy) && (
            <Button
              leftIcon={<CloseIcon />}
              onClick={() => {
                setSearch('')
                setStatusFilter('')
                setSortBy('')
                setSortOrder('desc')
              }}
            >
              Limpiar filtros
            </Button>
          )}
        </VStack>
      ) : (
        <>
          {/* Vista móvil: Cards */}
          <Box display={{ base: 'block', md: 'none' }}>
            <Stack spacing={3}>
              {filteredAndSortedItems.map((o) => (
                <Box key={o.id} borderWidth="1px" borderRadius="md" p={4}>
                  <VStack align="stretch" spacing={2}>
                    <HStack justify="space-between" flexWrap="wrap" gap={1}>
                      <HStack>
                        <Text fontSize="xs" fontWeight="semibold" color="gray.600">
                          #{o.id.slice(0, 8)}…
                        </Text>
                        {isRecentOrder(o.createdAt) && (
                          <Badge colorScheme="orange" fontSize="2xs">
                            Nuevo
                          </Badge>
                        )}
                      </HStack>
                      <Badge colorScheme={getStatusColor(o.status)}>
                        {getStatusLabel(o.status)}
                      </Badge>
                    </HStack>
                    <Text fontSize="xs" color="gray.600">
                      {o.name}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {new Date(o.createdAt).toLocaleDateString('es-PY', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                    <HStack justify="space-between">
                      <Text fontSize="sm">
                        {o._count.items} item{o._count.items !== 1 ? 's' : ''}
                      </Text>
                      <Text
                        fontSize="sm"
                        fontWeight="bold"
                        color={getAmountColor(o.totalPrice ?? 0)}
                      >
                        {formatGs(o.totalPrice)}
                      </Text>
                    </HStack>
                    {(() => {
                      const paymentStatus = getPaymentStatus(o)
                      return (
                        <HStack justify="space-between" align="center">
                          <Text fontSize="xs" color="gray.600">
                            Pago:
                          </Text>
                          <Badge colorScheme={paymentStatus.color} fontSize="xs">
                            {paymentStatus.label}
                          </Badge>
                        </HStack>
                      )
                    })()}
                    {(() => {
                      const paymentStatus = getPaymentStatus(o)
                      return paymentStatus.description ? (
                        <Text fontSize="xs" color="orange.600" fontWeight="medium">
                          {paymentStatus.description}
                        </Text>
                      ) : null
                    })()}
                    <Button
                      as={RouterLink}
                      to={`/admin/pedido/${o.id}`}
                      size="sm"
                      variant="outline"
                      colorScheme="teal"
                      width="full"
                      leftIcon={<ViewIcon />}
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
                  <Th>Cliente</Th>
                  <Th>Fecha</Th>
                  <Th>Estado</Th>
                  <Th>Pago</Th>
                  <Th isNumeric>Items</Th>
                  <Th isNumeric>Total</Th>
                  <Th></Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredAndSortedItems.map((o) => (
                  <Tr
                    key={o.id}
                    _hover={{ bg: 'teal.50', _dark: { bg: 'teal.900' } }}
                    transition="background 0.2s"
                    cursor="pointer"
                  >
                    <Td>
                      <HStack spacing={1}>
                        <Text>{o.id.slice(0, 8)}…</Text>
                        {isRecentOrder(o.createdAt) && (
                          <Badge colorScheme="orange" fontSize="2xs">
                            Nuevo
                          </Badge>
                        )}
                      </HStack>
                    </Td>
                    <Td>{o.name}</Td>
                    <Td fontSize="xs">
                      {new Date(o.createdAt).toLocaleString('es-PY', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Td>
                    <Td>
                      <Badge colorScheme={getStatusColor(o.status)}>
                        {getStatusLabel(o.status)}
                      </Badge>
                    </Td>
                    <Td>
                      {(() => {
                        const paymentStatus = getPaymentStatus(o)
                        return (
                          <VStack align="start" spacing={0}>
                            <Badge colorScheme={paymentStatus.color} fontSize="xs">
                              {paymentStatus.label}
                            </Badge>
                            {paymentStatus.description && (
                              <Text fontSize="2xs" color="orange.600" fontWeight="medium">
                                {paymentStatus.description}
                              </Text>
                            )}
                          </VStack>
                        )
                      })()}
                    </Td>
                    <Td isNumeric>{o._count.items}</Td>
                    <Td isNumeric>
                      <Text fontWeight="semibold" color={getAmountColor(o.totalPrice ?? 0)}>
                        {formatGs(o.totalPrice)}
                      </Text>
                    </Td>
                    <Td>
                      <Button
                        as={RouterLink}
                        to={`/admin/pedido/${o.id}`}
                        size="sm"
                        variant="outline"
                        colorScheme="teal"
                        leftIcon={<ViewIcon />}
                      >
                        Ver
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>

          {/* Barra de paginación */}
          {data?.total ? (
            <Stack
              mt={4}
              direction={{ base: 'column', md: 'row' }}
              justify="space-between"
              align="center"
              spacing={3}
            >
              <Text color="gray.600" fontSize={{ base: 'sm', md: 'md' }}>
                Mostrando {(page - 1) * (data?.limit ?? LIMIT) + 1}–
                {Math.min(page * (data?.limit ?? LIMIT), data.total)} de{' '}
                {data.total}
              </Text>
              <HStack flexWrap="wrap" justify="center">
                <Button
                  size="sm"
                  onClick={() => goToPage(1)}
                  isDisabled={page === 1}
                  display={{ base: 'none', md: 'inline-flex' }}
                >
                  « Primero
                </Button>
                <Button
                  size="sm"
                  onClick={() => goToPage(page - 1)}
                  isDisabled={page === 1}
                >
                  ‹ Anterior
                </Button>
                <Text fontSize={{ base: 'sm', md: 'md' }}>
                  Página {page} / {totalPages}
                </Text>
                <Button
                  size="sm"
                  onClick={() => goToPage(page + 1)}
                  isDisabled={page >= totalPages}
                >
                  Siguiente ›
                </Button>
                <Button
                  size="sm"
                  onClick={() => goToPage(totalPages)}
                  isDisabled={page >= totalPages}
                  display={{ base: 'none', md: 'inline-flex' }}
                >
                  Última »
                </Button>
              </HStack>
            </Stack>
          ) : null}
        </>
      )}
    </Box>
  )
}
