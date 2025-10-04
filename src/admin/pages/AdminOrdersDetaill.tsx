import { getOrder, type OrderDetail } from '@/services/orders'
import { formatGs } from '@/utils/format'
import {
  Badge,
  Box,
  Button,
  Divider,
  Heading,
  HStack,
  Image,
  Skeleton,
  Stack,
  Text,
  useToast,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { Link as RouterLink, useParams } from 'react-router-dom'

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const toast = useToast()

  useEffect(() => {
    let cancel = false
    setLoading(true)
    ;(async () => {
      try {
        if (!id) return
        const o = await getOrder(id)
        if (!cancel) setOrder(o)
      } catch {
        toast({
          title: 'No se pudo cargar la orden',
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
  }, [id, toast])

  if (loading) {
    return (
      <Stack spacing={4}>
        <Skeleton h="28px" w="60%" />
        <Skeleton h="20px" w="40%" />
        <Skeleton h="150px" />
      </Stack>
    )
  }

  if (!order) return <Text color="red.500">Orden no encontrada.</Text>

  return (
    <Box>
      <Heading size={{ base: 'md', md: 'lg' }} mb={2}>
        Orden {order.id}
      </Heading>
      <Stack direction={{ base: 'column', sm: 'row' }} mb={4} spacing={2}>
        <Badge
          colorScheme={
            order.status === 'paid'
              ? 'green'
              : order.status === 'canceled'
                ? 'red'
                : 'yellow'
          }
          fontSize={{ base: 'xs', md: 'sm' }}
        >
          {order.status.toUpperCase()}
        </Badge>
        <Text color="gray.600" fontSize={{ base: 'sm', md: 'md' }}>
          Creada el {new Date(order.createdAt).toLocaleString('es-PY')}
        </Text>
      </Stack>

      <Stack
        direction={{ base: 'column', md: 'row' }}
        spacing={{ base: 6, md: 10 }}
        align="start"
      >
        {/* Envío / contacto */}
        <Stack flex="1" spacing={2}>
          <Heading size={{ base: 'sm', md: 'md' }}>Datos de contacto</Heading>
          <Text fontSize={{ base: 'sm', md: 'md' }}>
            <b>Nombre:</b> {order.name}
          </Text>
          <Text fontSize={{ base: 'sm', md: 'md' }}>
            <b>Teléfono:</b> {order.phone}
          </Text>
          <Text whiteSpace="pre-wrap" fontSize={{ base: 'sm', md: 'md' }}>
            <b>Dirección:</b> {order.address}
          </Text>
          {order.notes && (
            <Text whiteSpace="pre-wrap" fontSize={{ base: 'sm', md: 'md' }}>
              <b>Notas:</b> {order.notes}
            </Text>
          )}
        </Stack>

        {/* Items */}
        <Stack flex="1.5" spacing={4}>
          <Heading size={{ base: 'sm', md: 'md' }}>Items</Heading>
          <Stack spacing={3}>
            {order.items.map((it) => (
              <HStack key={it.id} align="start" spacing={{ base: 2, md: 4 }}>
                <Image
                  src={it.imageUrl}
                  alt={it.title}
                  boxSize={{ base: '60px', md: '72px' }}
                  objectFit="cover"
                  borderRadius="md"
                />
                <Box flex="1">
                  <Text
                    fontWeight="semibold"
                    noOfLines={2}
                    fontSize={{ base: 'sm', md: 'md' }}
                  >
                    {it.title}
                  </Text>
                  <Text color="gray.600" fontSize={{ base: 'xs', md: 'sm' }}>
                    x{it.quantity} · {formatGs(it.price)}
                  </Text>
                </Box>
                <Text
                  fontWeight="medium"
                  fontSize={{ base: 'sm', md: 'md' }}
                  whiteSpace="nowrap"
                >
                  {formatGs(it.price * it.quantity)}
                </Text>
              </HStack>
            ))}
          </Stack>
          <Divider />
          <HStack justify="space-between">
            <Text fontWeight="semibold" fontSize={{ base: 'sm', md: 'md' }}>
              Subtotal
            </Text>
            <Text fontWeight="bold" fontSize={{ base: 'md', md: 'lg' }}>
              {formatGs(order.subtotal)}
            </Text>
          </HStack>
        </Stack>
      </Stack>

      <Button
        as={RouterLink}
        to="/admin/pedidos"
        mt={6}
        variant="outline"
        colorScheme="teal"
        size={{ base: 'sm', md: 'md' }}
        width={{ base: 'full', sm: 'auto' }}
      >
        Volver a mis órdenes
      </Button>
    </Box>
  )
}
