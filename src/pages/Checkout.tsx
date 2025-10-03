import LocationMap from '@/components/LocationMap'
import { useCart } from '@/hooks/useCart'
import { createOrder } from '@/services/orders'
import { formatGs } from '@/utils/format'
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Divider,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  HStack,
  Image,
  Input,
  Select,
  Stack,
  Text,
  Textarea,
  useColorModeValue,
  useToast,
  VStack,
} from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { z } from 'zod'

const COUNTRY_CODES = [{ code: '+595', country: 'Paraguay', flag: '🇵🇾' }]

const schema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  countryCode: z.string(),
  phone: z.string().min(6, 'Ingresá un teléfono válido'),
  address: z.string().min(5, 'Ingresá una dirección válida'),
  notes: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
})

type FormData = z.infer<typeof schema>

export default function Checkout() {
  const { items, subtotal, clear } = useCart()
  const toast = useToast()
  const nav = useNavigate()

  const cardBg = useColorModeValue('white', 'gray.800')
  const cardBorderColor = useColorModeValue('gray.200', 'gray.700')

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      countryCode: '+595',
    },
  })

  const lat = watch('lat')
  const lng = watch('lng')

  const handleLocationSelect = (newLat: number, newLng: number) => {
    setValue('lat', newLat)
    setValue('lng', newLng)
  }

  const onSubmit = async (data: FormData) => {
    if (items.length === 0) {
      toast({
        title: 'Tu carrito está vacío',
        status: 'info',
        duration: 2000,
        isClosable: true,
      })
      return
    }
    try {
      const fullPhone = data.countryCode + data.phone
      const payload = {
        name: data.name,
        phone: fullPhone,
        address: data.address,
        notes: data.notes,
        lat: data.lat,
        lng: data.lng,
        items: items.map((i) => ({
          productId: i.id,
          variantId: i.size || undefined,
          qty: i.qty,
        })),
      }
      const { id } = await createOrder(payload)
      clear()
      toast({
        title: 'Orden creada',
        status: 'success',
        duration: 2000,
        isClosable: true,
      })
      nav(`/checkout/success?id=${id}`, { replace: true })
    } catch (e: any) {
      const msg = e?.response?.data?.error || 'No se pudo crear la orden'
      toast({
        title: 'Error',
        description: String(msg),
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  return (
    <Box>
      <Heading size="lg" mb={6}>
        Checkout
      </Heading>

      {items.length === 0 ? (
        <Stack>
          <Text>Tu carrito está vacío.</Text>
          <Button
            as={RouterLink}
            to="/catalogo"
            colorScheme="teal"
            w="fit-content"
          >
            Volver al catálogo
          </Button>
        </Stack>
      ) : (
        <Stack
          direction={{ base: 'column', lg: 'row' }}
          align="start"
          spacing={8}
        >
          {/* Formulario */}
          <Box flex="1" as="form" onSubmit={handleSubmit(onSubmit)} w="full">
            <VStack spacing={6} align="stretch">
              {/* Card: Información Personal */}
              <Card
                bg={cardBg}
                borderColor={cardBorderColor}
                borderWidth="1px"
                boxShadow="md"
              >
                <CardBody>
                  <Heading size="md" mb={4}>
                    Información Personal
                  </Heading>
                  <VStack spacing={4} align="stretch">
                    <FormControl isRequired isInvalid={!!errors.name}>
                      <FormLabel>Nombre y apellido</FormLabel>
                      <Input {...register('name')} />
                      <FormErrorMessage>
                        {errors.name?.message}
                      </FormErrorMessage>
                    </FormControl>

                    <FormControl isRequired isInvalid={!!errors.phone}>
                      <FormLabel>Teléfono</FormLabel>
                      <HStack spacing={3}>
                        <Controller
                          name="countryCode"
                          control={control}
                          render={({ field }) => (
                            <Select {...field} w="140px">
                              {COUNTRY_CODES.map((c) => (
                                <option key={c.code} value={c.code}>
                                  {c.flag} {c.code}
                                </option>
                              ))}
                            </Select>
                          )}
                        />
                        <Input
                          {...register('phone')}
                          flex="1"
                          placeholder="981234567"
                        />
                      </HStack>
                      <FormErrorMessage>
                        {errors.phone?.message}
                      </FormErrorMessage>
                    </FormControl>
                  </VStack>
                </CardBody>
              </Card>

              {/* Card: Dirección de Entrega */}
              <Card
                bg={cardBg}
                borderColor={cardBorderColor}
                borderWidth="1px"
                boxShadow="md"
              >
                <CardBody>
                  <Heading size="md" mb={4}>
                    Dirección de Entrega
                  </Heading>
                  <VStack spacing={4} align="stretch">
                    <FormControl isRequired isInvalid={!!errors.address}>
                      <FormLabel>Dirección</FormLabel>
                      <Textarea {...register('address')} rows={3} />
                      <FormErrorMessage>
                        {errors.address?.message}
                      </FormErrorMessage>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Ubicación en el mapa</FormLabel>
                      <Text fontSize="sm" color="gray.600" mb={2}>
                        Hacé click en el mapa para marcar tu ubicación exacta
                      </Text>
                      <LocationMap
                        onLocationSelect={handleLocationSelect}
                        lat={lat}
                        lng={lng}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Notas (opcional)</FormLabel>
                      <Textarea
                        {...register('notes')}
                        placeholder="Indicaciones para la entrega, referencia, etc."
                        rows={3}
                      />
                    </FormControl>
                  </VStack>
                </CardBody>
              </Card>

              <Button
                type="submit"
                colorScheme="teal"
                size="lg"
                isDisabled={!isValid}
                isLoading={isSubmitting}
              >
                Confirmar orden
              </Button>
            </VStack>
          </Box>

          {/* Resumen del pedido */}
          <Box
            w={{ base: '100%', lg: '420px' }}
            position={{ base: 'relative', lg: 'sticky' }}
            top={{ base: 0, lg: 'calc(80px + 1rem)' }}
            alignSelf="flex-start"
            maxH={{ lg: 'calc(100vh - 80px - 2rem)' }}
            overflowY={{ lg: 'auto' }}
          >
            <Card
              boxShadow="lg"
              bg={cardBg}
              borderWidth="1px"
              borderColor={cardBorderColor}
            >
              <CardBody>
                <Heading size="md" mb={4}>
                  Resumen del Pedido
                </Heading>
                <VStack spacing={4} align="stretch">
                  {items.map((i) => (
                    <Box key={`${i.id}-${i.size}`} position="relative">
                      <HStack align="start" spacing={3}>
                        <Box position="relative">
                          <Image
                            src={i.imageUrl}
                            alt={i.title}
                            boxSize="80px"
                            objectFit="cover"
                            borderRadius="md"
                          />
                          <Badge
                            position="absolute"
                            top="-8px"
                            right="-8px"
                            colorScheme="teal"
                            borderRadius="full"
                            px={2}
                            fontSize="xs"
                          >
                            {i.qty}
                          </Badge>
                        </Box>
                        <VStack align="start" flex="1" spacing={1}>
                          <Text
                            fontWeight="semibold"
                            fontSize="sm"
                            noOfLines={2}
                          >
                            {i.title}
                          </Text>
                          <Text fontSize="xs" color="gray.600">
                            Talle: {i.size || '—'}
                          </Text>
                          <HStack spacing={2} fontSize="sm">
                            <Text color="gray.600">
                              {formatGs(i.price)} × {i.qty}
                            </Text>
                          </HStack>
                          <Text fontWeight="bold" color="teal.600">
                            {formatGs(i.price * i.qty)}
                          </Text>
                        </VStack>
                      </HStack>
                    </Box>
                  ))}

                  <Divider />

                  <HStack justify="space-between" fontSize="lg">
                    <Text fontWeight="bold">Total</Text>
                    <Text fontWeight="bold" color="teal.500" fontSize="2xl">
                      {formatGs(subtotal)}
                    </Text>
                  </HStack>

                  <Box
                    bg={useColorModeValue('blue.50', 'blue.900')}
                    p={3}
                    borderRadius="md"
                  >
                    <Text
                      fontSize="sm"
                      color={useColorModeValue('blue.800', 'blue.200')}
                    >
                      El costo de envío se coordinará por WhatsApp
                    </Text>
                  </Box>
                </VStack>
              </CardBody>
            </Card>
          </Box>
        </Stack>
      )}
    </Box>
  )
}
