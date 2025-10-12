import {
  getOrder,
  updateOrderStatus,
  type OrderDetail,
} from '@/services/orders'
import { uploadImageViaBackend } from '@/services/upload'
import { formatGs } from '@/utils/format'
import {
  Badge,
  Box,
  Button,
  CloseButton,
  Divider,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  Heading,
  HStack,
  Icon,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  NumberInput,
  NumberInputField,
  Select,
  Skeleton,
  Stack,
  Text,
  useDisclosure,
  useToast,
  VStack,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import {
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiDownload,
  FiEdit,
  FiMapPin,
  FiPackage,
  FiPhone,
  FiTruck,
  FiUser,
} from 'react-icons/fi'
import { Link as RouterLink, useParams } from 'react-router-dom'
import OrderLocationMap from '@/components/OrderLocationMap'

// Helper functions
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

// Timeline data
function getTimelineSteps(currentStatus: string) {
  const allSteps = [
    { status: 'PENDING', label: 'Pendiente', icon: FiClock },
    { status: 'CONFIRMED', label: 'Confirmado', icon: FiCheckCircle },
    { status: 'PREPARING', label: 'Preparando', icon: FiPackage },
    { status: 'READY', label: 'Listo', icon: FiPackage },
    { status: 'DELIVERED', label: 'Entregado', icon: FiTruck },
  ]

  const statusOrder = [
    'PENDING',
    'CONFIRMED',
    'PREPARING',
    'READY',
    'DELIVERED',
  ]
  const currentIndex = statusOrder.indexOf(currentStatus.toUpperCase())

  return allSteps.map((step, idx) => ({
    ...step,
    isComplete: idx <= currentIndex,
    isCurrent: idx === currentIndex,
  }))
}

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [newStatus, setNewStatus] = useState('')
  const [depositAmount, setDepositAmount] = useState('')
  const [depositImage, setDepositImage] = useState<File | null>(null)
  const [depositImagePreview, setDepositImagePreview] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const {
    isOpen: isDepositOpen,
    onOpen: onDepositOpen,
    onClose: onDepositClose,
  } = useDisclosure()
  const toast = useToast()

  useEffect(() => {
    let cancel = false
    setLoading(true)
    ;(async () => {
      try {
        if (!id) return
        const o = await getOrder(id)
        if (!cancel) {
          setOrder(o)
          setNewStatus(o.status)
        }
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

  const handleStatusChange = async () => {
    if (!order || !id) return

    setIsUpdating(true)
    try {
      const updated = await updateOrderStatus(id, newStatus)
      setOrder(updated)
      toast({
        title: 'Estado actualizado',
        description: `El pedido ahora está en estado: ${getStatusLabel(newStatus)}`,
        status: 'success',
        isClosable: true,
      })
      onClose()
    } catch (error) {
      console.error('Error updating status:', error)
      toast({
        title: 'Error al actualizar',
        description: 'No se pudo actualizar el estado del pedido',
        status: 'error',
        isClosable: true,
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDepositImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Archivo inválido',
        description: 'Por favor selecciona una imagen',
        status: 'error',
        isClosable: true,
      })
      return
    }

    // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Archivo muy grande',
        description: 'La imagen no debe superar 5MB',
        status: 'error',
        isClosable: true,
      })
      return
    }

    setDepositImage(file)

    // Crear preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setDepositImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleDepositSubmit = async () => {
    if (!order || !id || !depositAmount || !order.totalPrice) return

    const amount = parseFloat(depositAmount)
    if (isNaN(amount) || amount <= 0 || amount > order.totalPrice) {
      toast({
        title: 'Monto inválido',
        description: 'Ingresa un monto válido entre 0 y el total del pedido',
        status: 'error',
        isClosable: true,
      })
      return
    }

    setIsUpdating(true)
    try {
      let depositImages: { imageUrl: string; imagePublicId?: string }[] | undefined

      // Subir imagen si existe
      if (depositImage) {
        try {
          const uploaded = await uploadImageViaBackend(depositImage)
          depositImages = [
            {
              imageUrl: uploaded.secure_url,
              imagePublicId: uploaded.public_id,
            },
          ]
        } catch (error) {
          console.error('Error uploading image:', error)
          toast({
            title: 'Error al subir imagen',
            description: 'No se pudo subir la imagen, pero se registrará la seña',
            status: 'warning',
            isClosable: true,
          })
        }
      }

      const updated = await updateOrderStatus(id, order.status, amount, depositImages)
      setOrder(updated)
      toast({
        title: 'Seña registrada',
        description: `Se registró una seña de ${formatGs(amount)}`,
        status: 'success',
        isClosable: true,
      })
      setDepositAmount('')
      setDepositImage(null)
      setDepositImagePreview(null)
      onDepositClose()
    } catch (error) {
      console.error('Error registering deposit:', error)
      toast({
        title: 'Error al registrar seña',
        description: 'No se pudo registrar la seña',
        status: 'error',
        isClosable: true,
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleExport = () => {
    // TODO: Implementar exportación
    toast({
      title: 'Exportando orden...',
      description: 'Funcionalidad en desarrollo',
      status: 'info',
      isClosable: true,
    })
  }

  if (loading) {
    return (
      <Stack spacing={6}>
        <Skeleton h="40px" w="70%" />
        <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
          <Skeleton h="100px" />
          <Skeleton h="100px" />
          <Skeleton h="100px" />
        </Grid>
        <Skeleton h="200px" />
        <Skeleton h="300px" />
      </Stack>
    )
  }

  if (!order) return <Text color="red.500">Orden no encontrada.</Text>

  const timelineSteps = getTimelineSteps(order.status)

  return (
    <Box pb={8}>
      {/* Header con información clave */}
      <Stack spacing={4} mb={6}>
        <HStack justify="space-between" flexWrap="wrap" gap={4}>
          <Box>
            <HStack spacing={3} mb={2}>
              <Heading size={{ base: 'md', md: 'lg' }}>
                Pedido #{order.id.slice(0, 8)}
              </Heading>
              <Badge
                colorScheme={getStatusColor(order.status)}
                fontSize={{ base: 'sm', md: 'md' }}
                px={3}
                py={1}
                borderRadius="full"
              >
                {getStatusLabel(order.status)}
              </Badge>
            </HStack>
            <Text color="gray.600" fontSize={{ base: 'sm', md: 'md' }}>
              Creado el {new Date(order.createdAt).toLocaleString('es-PY')}
            </Text>
          </Box>

          {/* Acciones rápidas desktop */}
          <HStack spacing={2} display={{ base: 'none', md: 'flex' }}>
            {!order.depositTransactionId && (
              <Button
                leftIcon={<Icon as={FiDollarSign} />}
                onClick={onDepositOpen}
                colorScheme="orange"
                variant="outline"
                size="sm"
              >
                Registrar Seña
              </Button>
            )}
            <Button
              leftIcon={<Icon as={FiEdit} />}
              onClick={onOpen}
              colorScheme="blue"
              variant="outline"
              size="sm"
            >
              Cambiar Estado
            </Button>
            <Button
              leftIcon={<Icon as={FiDownload} />}
              onClick={handleExport}
              colorScheme="teal"
              variant="outline"
              size="sm"
            >
              Exportar
            </Button>
          </HStack>
        </HStack>

        {/* Cards de información clave */}
        <Grid
          templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }}
          gap={4}
        >
          <Box
            borderWidth="1px"
            borderRadius="lg"
            p={4}
            bg="blue.50"
            borderColor="blue.200"
          >
            <Text fontSize="xs" color="gray.600" fontWeight="medium" mb={1}>
              Total del Pedido
            </Text>
            <Text fontSize="2xl" fontWeight="bold" color="blue.700">
              {formatGs(order.totalPrice)}
            </Text>
          </Box>
          <Box
            borderWidth="1px"
            borderRadius="lg"
            p={4}
            bg={
              order.depositAmount && order.depositPaidAt
                ? 'yellow.50'
                : order.balancePaidAt
                ? 'green.50'
                : 'gray.50'
            }
            borderColor={
              order.depositAmount && order.depositPaidAt
                ? 'yellow.200'
                : order.balancePaidAt
                ? 'green.200'
                : 'gray.200'
            }
          >
            <Text fontSize="xs" color="gray.600" fontWeight="medium" mb={1}>
              Estado de Pago
            </Text>
            <Text
              fontSize="lg"
              fontWeight="bold"
              color={
                order.balancePaidAt
                  ? 'green.700'
                  : order.depositAmount && order.depositPaidAt
                  ? 'yellow.700'
                  : 'gray.700'
              }
            >
              {order.balancePaidAt
                ? 'Pagado'
                : order.depositAmount && order.depositPaidAt
                ? 'Señado'
                : 'Pendiente'}
            </Text>
            {order.depositAmount && order.depositPaidAt && !order.balancePaidAt && order.totalPrice && (
              <Text fontSize="xs" color="orange.600" fontWeight="medium">
                Saldo: {formatGs(order.totalPrice - order.depositAmount)}
              </Text>
            )}
          </Box>
          <Box
            borderWidth="1px"
            borderRadius="lg"
            p={4}
            bg="purple.50"
            borderColor="purple.200"
          >
            <Text fontSize="xs" color="gray.600" fontWeight="medium" mb={1}>
              Productos
            </Text>
            <Text fontSize="2xl" fontWeight="bold" color="purple.700">
              {order.items.length}
            </Text>
            <Text fontSize="xs" color="gray.600">
              {order.items.reduce((sum, item) => sum + item.quantity, 0)}{' '}
              unidades
            </Text>
          </Box>
          <Box
            borderWidth="1px"
            borderRadius="lg"
            p={4}
            bg="green.50"
            borderColor="green.200"
          >
            <Text fontSize="xs" color="gray.600" fontWeight="medium" mb={1}>
              Estado Actual
            </Text>
            <Text fontSize="lg" fontWeight="bold" color="green.700">
              {getStatusLabel(order.status)}
            </Text>
          </Box>
        </Grid>
      </Stack>

      {/* Timeline de estados - Solo visible si no está cancelado */}
      {order.status !== 'CANCELLED' && (
        <Box
          mb={6}
          p={6}
          borderWidth="1px"
          borderRadius="lg"
          bg="white"
          _dark={{ bg: 'gray.800' }}
        >
          <Heading size="sm" mb={4}>
            Progreso del Pedido
          </Heading>
          <HStack
            spacing={0}
            justify="space-between"
            position="relative"
            display={{ base: 'none', md: 'flex' }}
          >
            {timelineSteps.map((step, idx) => (
              <VStack
                key={step.status}
                flex="1"
                spacing={2}
                position="relative"
              >
                <Box
                  position="relative"
                  zIndex={2}
                  bg={
                    step.isComplete
                      ? getStatusColor(step.status) + '.500'
                      : 'gray.200'
                  }
                  borderRadius="full"
                  p={3}
                  color="white"
                >
                  <Icon as={step.icon} boxSize={6} />
                </Box>
                <Text
                  fontSize="xs"
                  fontWeight={step.isCurrent ? 'bold' : 'medium'}
                  color={
                    step.isComplete
                      ? getStatusColor(step.status) + '.700'
                      : 'gray.500'
                  }
                  textAlign="center"
                >
                  {step.label}
                </Text>
                {idx < timelineSteps.length - 1 && (
                  <Box
                    position="absolute"
                    top="24px"
                    left="50%"
                    width="100%"
                    height="3px"
                    bg={
                      step.isComplete
                        ? getStatusColor(step.status) + '.500'
                        : 'gray.200'
                    }
                    zIndex={1}
                  />
                )}
              </VStack>
            ))}
          </HStack>

          {/* Timeline mobile - vertical */}
          <VStack
            align="stretch"
            spacing={4}
            display={{ base: 'flex', md: 'none' }}
          >
            {timelineSteps.map((step) => (
              <HStack key={step.status} spacing={3}>
                <Box
                  bg={
                    step.isComplete
                      ? getStatusColor(step.status) + '.500'
                      : 'gray.200'
                  }
                  borderRadius="full"
                  p={2}
                  color="white"
                  flexShrink={0}
                >
                  <Icon as={step.icon} boxSize={5} />
                </Box>
                <Text
                  fontSize="sm"
                  fontWeight={step.isCurrent ? 'bold' : 'medium'}
                  color={
                    step.isComplete
                      ? getStatusColor(step.status) + '.700'
                      : 'gray.500'
                  }
                >
                  {step.label}
                </Text>
              </HStack>
            ))}
          </VStack>
        </Box>
      )}

      {/* Grid principal - Cliente y Productos */}
      <Grid templateColumns={{ base: '1fr', lg: '1fr 1.5fr' }} gap={6} mb={6}>
        {/* Columna izquierda - Cliente y Envío */}
        <Stack spacing={6}>
          {/* Card de cliente */}
          <Box
            borderWidth="1px"
            borderRadius="lg"
            p={5}
            bg="white"
            _dark={{ bg: 'gray.800' }}
          >
            <HStack spacing={3} mb={4}>
              <Box bg="teal.500" borderRadius="full" p={3} color="white">
                <Icon as={FiUser} boxSize={5} />
              </Box>
              <Heading size="sm">Información del Cliente</Heading>
            </HStack>
            <VStack align="stretch" spacing={3}>
              <Box>
                <HStack spacing={2} color="gray.600" mb={1}>
                  <Icon as={FiUser} boxSize={4} />
                  <Text fontSize="xs" fontWeight="medium">
                    Nombre
                  </Text>
                </HStack>
                <Text fontSize="md" fontWeight="semibold">
                  {order.name}
                </Text>
              </Box>
              <Divider />
              <Box>
                <HStack spacing={2} color="gray.600" mb={1}>
                  <Icon as={FiPhone} boxSize={4} />
                  <Text fontSize="xs" fontWeight="medium">
                    Teléfono
                  </Text>
                </HStack>
                <Text fontSize="md" fontWeight="semibold">
                  {order.phone}
                </Text>
              </Box>
            </VStack>
          </Box>

          {/* Card de envío */}
          <Box
            borderWidth="1px"
            borderRadius="lg"
            p={5}
            bg="white"
            _dark={{ bg: 'gray.800' }}
          >
            <HStack spacing={3} mb={4}>
              <Box bg="orange.500" borderRadius="full" p={3} color="white">
                <Icon as={FiMapPin} boxSize={5} />
              </Box>
              <Heading size="sm">Información de Envío</Heading>
            </HStack>
            <VStack align="stretch" spacing={3}>
              <Box>
                <HStack spacing={2} color="gray.600" mb={1}>
                  <Icon as={FiMapPin} boxSize={4} />
                  <Text fontSize="xs" fontWeight="medium">
                    Dirección de Entrega
                  </Text>
                </HStack>
                <Text fontSize="sm" whiteSpace="pre-wrap">
                  {order.address}
                </Text>
              </Box>
              {order.notes && (
                <>
                  <Divider />
                  <Box>
                    <Text
                      fontSize="xs"
                      fontWeight="medium"
                      color="gray.600"
                      mb={1}
                    >
                      Notas Adicionales
                    </Text>
                    <Text
                      fontSize="sm"
                      whiteSpace="pre-wrap"
                      fontStyle="italic"
                    >
                      {order.notes}
                    </Text>
                  </Box>
                </>
              )}
              {order.lat && order.lng && (
                <>
                  <Divider />
                  <Box>
                    <Text
                      fontSize="xs"
                      fontWeight="medium"
                      color="gray.600"
                      mb={2}
                    >
                      Ubicación en el Mapa
                    </Text>
                    <OrderLocationMap lat={order.lat} lng={order.lng} />
                  </Box>
                </>
              )}
            </VStack>
          </Box>
        </Stack>

        {/* Columna derecha - Productos */}
        <Box
          borderWidth="1px"
          borderRadius="lg"
          p={5}
          bg="white"
          _dark={{ bg: 'gray.800' }}
        >
          <HStack spacing={3} mb={4}>
            <Box bg="purple.500" borderRadius="full" p={3} color="white">
              <Icon as={FiPackage} boxSize={5} />
            </Box>
            <Heading size="sm">Productos del Pedido</Heading>
          </HStack>

          <Stack spacing={4}>
            {order.items.map((item) => (
              <Box
                key={item.id}
                p={4}
                borderWidth="1px"
                borderRadius="md"
                _hover={{ bg: 'gray.50', _dark: { bg: 'gray.700' } }}
                transition="background 0.2s"
              >
                <HStack align="start" spacing={4}>
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    boxSize={{ base: '80px', md: '100px' }}
                    objectFit="cover"
                    borderRadius="md"
                    flexShrink={0}
                  />
                  <Box flex="1">
                    <Text
                      fontWeight="semibold"
                      fontSize={{ base: 'md', md: 'lg' }}
                      mb={2}
                      noOfLines={2}
                    >
                      {item.title}
                    </Text>
                    <HStack spacing={4} flexWrap="wrap">
                      <VStack align="start" spacing={0}>
                        <Text fontSize="xs" color="gray.600">
                          Precio Unit.
                        </Text>
                        <Text fontWeight="medium" fontSize="sm">
                          {formatGs(item.price)}
                        </Text>
                      </VStack>
                      <VStack align="start" spacing={0}>
                        <Text fontSize="xs" color="gray.600">
                          Cantidad
                        </Text>
                        <Text fontWeight="medium" fontSize="sm">
                          x{item.quantity}
                        </Text>
                      </VStack>
                      <VStack align="start" spacing={0}>
                        <Text fontSize="xs" color="gray.600">
                          Subtotal
                        </Text>
                        <Text
                          fontWeight="bold"
                          fontSize="md"
                          color="purple.600"
                        >
                          {formatGs(item.price * item.quantity)}
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>
                </HStack>
              </Box>
            ))}

            <Divider />

            {/* Total */}
            <HStack
              justify="space-between"
              p={4}
              bg="gray.50"
              borderRadius="md"
              _dark={{ bg: 'gray.700' }}
            >
              <Text fontWeight="bold" fontSize={{ base: 'lg', md: 'xl' }}>
                Total del Pedido
              </Text>
              <Text
                fontWeight="bold"
                fontSize={{ base: 'xl', md: '2xl' }}
                color="purple.600"
              >
                {formatGs(order.totalPrice)}
              </Text>
            </HStack>

            {/* Información de seña si existe */}
            {order.depositAmount && order.depositPaidAt && order.totalPrice && (
              <VStack
                align="stretch"
                spacing={2}
                p={4}
                bg="yellow.50"
                borderRadius="md"
                borderWidth="1px"
                borderColor="yellow.200"
              >
                <HStack justify="space-between">
                  <Text fontSize="sm" fontWeight="medium" color="gray.700">
                    Seña Pagada:
                  </Text>
                  <Text fontSize="md" fontWeight="bold" color="yellow.700">
                    {formatGs(order.depositAmount)}
                  </Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm" fontWeight="medium" color="gray.700">
                    Saldo Pendiente:
                  </Text>
                  <Text fontSize="md" fontWeight="bold" color="orange.600">
                    {formatGs(order.totalPrice - order.depositAmount)}
                  </Text>
                </HStack>
                <Text fontSize="xs" color="gray.600">
                  Fecha de seña:{' '}
                  {new Date(order.depositPaidAt).toLocaleDateString('es-PY', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
              </VStack>
            )}
          </Stack>
        </Box>
      </Grid>

      {/* Botones de acción mobile - sticky */}
      <Box
        position="sticky"
        bottom={0}
        left={0}
        right={0}
        p={4}
        bg="white"
        borderTopWidth="1px"
        display={{ base: 'block', md: 'none' }}
        zIndex={10}
        _dark={{ bg: 'gray.800' }}
      >
        <Stack spacing={2}>
          {!order.depositTransactionId && (
            <Button
              leftIcon={<Icon as={FiDollarSign} />}
              onClick={onDepositOpen}
              colorScheme="orange"
              width="full"
            >
              Registrar Seña
            </Button>
          )}
          <Button
            leftIcon={<Icon as={FiEdit} />}
            onClick={onOpen}
            colorScheme="blue"
            width="full"
          >
            Cambiar Estado
          </Button>
          <HStack spacing={2}>
            <Button
              leftIcon={<Icon as={FiDownload} />}
              onClick={handleExport}
              colorScheme="teal"
              variant="outline"
              flex="1"
            >
              Exportar
            </Button>
            <Button
              as={RouterLink}
              to="/admin/pedidos"
              variant="outline"
              colorScheme="gray"
              flex="1"
            >
              Volver
            </Button>
          </HStack>
        </Stack>
      </Box>

      {/* Botón volver desktop */}
      <Box display={{ base: 'none', md: 'block' }}>
        <Button
          as={RouterLink}
          to="/admin/pedidos"
          variant="outline"
          colorScheme="teal"
          leftIcon={<Icon as={FiPackage} />}
        >
          Volver a Pedidos
        </Button>
      </Box>

      {/* Modal para cambiar estado */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Cambiar Estado del Pedido</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align="stretch" spacing={4}>
              <Text fontSize="sm" color="gray.600">
                Pedido #{order.id.slice(0, 8)}
              </Text>
              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={2}>
                  Estado Actual:
                </Text>
                <Badge
                  colorScheme={getStatusColor(order.status)}
                  fontSize="md"
                  px={3}
                  py={1}
                >
                  {getStatusLabel(order.status)}
                </Badge>
              </Box>
              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={2}>
                  Nuevo Estado:
                </Text>
                <Select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <option value="PENDING">Pendiente</option>
                  <option value="CONFIRMED">Confirmado</option>
                  <option value="PREPARING">Preparando</option>
                  <option value="READY">Listo</option>
                  <option value="DELIVERED">Entregado</option>
                  <option value="CANCELLED">Cancelado</option>
                </Select>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancelar
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleStatusChange}
              isDisabled={newStatus === order.status}
              isLoading={isUpdating}
            >
              Actualizar Estado
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal para registrar seña */}
      <Modal isOpen={isDepositOpen} onClose={onDepositClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Registrar Seña</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align="stretch" spacing={4}>
              <Text fontSize="sm" color="gray.600">
                Pedido #{order.id.slice(0, 8)}
              </Text>
              <Box
                p={3}
                bg="blue.50"
                borderRadius="md"
                borderWidth="1px"
                borderColor="blue.200"
              >
                <HStack justify="space-between">
                  <Text fontSize="sm" fontWeight="medium" color="gray.700">
                    Total del pedido:
                  </Text>
                  <Text fontSize="lg" fontWeight="bold" color="blue.700">
                    {formatGs(order.totalPrice)}
                  </Text>
                </HStack>
              </Box>
              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="medium">
                  Monto de la seña (Gs)
                </FormLabel>
                <NumberInput
                  min={0}
                  max={order.totalPrice ?? undefined}
                  value={depositAmount}
                  onChange={(value) => setDepositAmount(value)}
                >
                  <NumberInputField
                    placeholder="Ej: 50000"
                    fontSize="md"
                  />
                </NumberInput>
                <Text fontSize="xs" color="gray.600" mt={1}>
                  Ingresa el monto de la seña que el cliente pagó
                </Text>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" fontWeight="medium">
                  Comprobante de pago (opcional)
                </FormLabel>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleDepositImageChange}
                  display="none"
                  id="deposit-image-input"
                />
                <label htmlFor="deposit-image-input">
                  <Button
                    as="span"
                    cursor="pointer"
                    size="sm"
                    variant="outline"
                    colorScheme="blue"
                    width="full"
                  >
                    {depositImage ? 'Cambiar imagen' : 'Subir comprobante'}
                  </Button>
                </label>
                <FormHelperText fontSize="xs">
                  Opcional: Sube una imagen del comprobante de pago (máx 5MB)
                </FormHelperText>

                {depositImagePreview && (
                  <Box mt={3} position="relative">
                    <Image
                      src={depositImagePreview}
                      alt="Preview"
                      maxH="200px"
                      objectFit="contain"
                      borderRadius="md"
                      borderWidth="1px"
                      borderColor="gray.200"
                    />
                    <CloseButton
                      position="absolute"
                      top={2}
                      right={2}
                      size="sm"
                      colorScheme="red"
                      bg="white"
                      onClick={() => {
                        setDepositImage(null)
                        setDepositImagePreview(null)
                      }}
                    />
                  </Box>
                )}
              </FormControl>
              {depositAmount && !isNaN(parseFloat(depositAmount)) && order.totalPrice && (
                <Box
                  p={3}
                  bg="yellow.50"
                  borderRadius="md"
                  borderWidth="1px"
                  borderColor="yellow.200"
                >
                  <VStack align="stretch" spacing={1}>
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.700">
                        Seña:
                      </Text>
                      <Text fontSize="md" fontWeight="semibold" color="yellow.700">
                        {formatGs(parseFloat(depositAmount))}
                      </Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.700">
                        Saldo restante:
                      </Text>
                      <Text fontSize="md" fontWeight="semibold" color="orange.600">
                        {formatGs(order.totalPrice - parseFloat(depositAmount))}
                      </Text>
                    </HStack>
                  </VStack>
                </Box>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onDepositClose}>
              Cancelar
            </Button>
            <Button
              colorScheme="orange"
              onClick={handleDepositSubmit}
              isDisabled={!depositAmount || parseFloat(depositAmount) <= 0}
              isLoading={isUpdating}
            >
              Registrar Seña
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}
