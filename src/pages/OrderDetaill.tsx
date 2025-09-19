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

export default function OrderDetailPage() {
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
      <Heading size="lg" mb={2}>
        Orden {order.id}
      </Heading>
      <HStack mb={4}>
        <Badge
          colorScheme={
            order.status === 'paid'
              ? 'green'
              : order.status === 'canceled'
                ? 'red'
                : 'yellow'
          }
        >
          {order.status.toUpperCase()}
        </Badge>
        <Text color="gray.600">
          Creada el {new Date(order.createdAt).toLocaleString('es-PY')}
        </Text>
      </HStack>

      <Stack
        direction={{ base: 'column', md: 'row' }}
        spacing={10}
        align="start"
      >
        {/* Envío / contacto */}
        <Stack flex="1" spacing={2}>
          <Heading size="md">Datos de contacto</Heading>
          <Text>
            <b>Nombre:</b> {order.name}
          </Text>
          <Text>
            <b>Teléfono:</b> {order.phone}
          </Text>
          <Text whiteSpace="pre-wrap">
            <b>Dirección:</b> {order.address}
          </Text>
          {order.notes && (
            <Text whiteSpace="pre-wrap">
              <b>Notas:</b> {order.notes}
            </Text>
          )}
        </Stack>

        {/* Items */}
        <Stack flex="1.5" spacing={4}>
          <Heading size="md">Items</Heading>
          <Stack spacing={3}>
            {order.items.map((it) => (
              <HStack key={it.id} align="start">
                <Image
                  src={it.imageUrl}
                  alt={it.title}
                  boxSize="72px"
                  objectFit="cover"
                  borderRadius="md"
                />
                <Box flex="1">
                  <Text fontWeight="semibold" noOfLines={2}>
                    {it.title}
                  </Text>
                  <Text color="gray.600">
                    x{it.quantity} · {formatGs(it.price)}
                  </Text>
                </Box>
                <Text>{formatGs(it.price * it.quantity)}</Text>
              </HStack>
            ))}
          </Stack>
          <Divider />
          <HStack justify="space-between">
            <Text fontWeight="semibold">Subtotal</Text>
            <Text fontWeight="bold">{formatGs(order.subtotal)}</Text>
          </HStack>
        </Stack>
      </Stack>

      <Button
        as={RouterLink}
        to="/mis-ordenes"
        mt={6}
        variant="outline"
        colorScheme="teal"
      >
        Volver a mis órdenes
      </Button>
    </Box>
  )
}
