import { useCart } from '@/hooks/useCart'
import { createOrder } from '@/services/orders'
import { formatGs } from '@/utils/format'
import {
  Box,
  Button,
  Divider,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  HStack,
  Image,
  Input,
  Stack,
  Text,
  Textarea,
  useToast,
} from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  phone: z.string().min(6, 'Ingresá un teléfono válido'),
  address: z.string().min(5, 'Ingresá una dirección válida'),
  notes: z.string().optional(),
})
type FormData = z.infer<typeof schema>

export default function Checkout() {
  const { items, subtotal, clear } = useCart()
  const toast = useToast()
  const nav = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
  })

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
      const payload = {
        ...data,
        items: items.map((i) => ({
          id: i.id,
          variantId: i.variantId || undefined,
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
      <Heading size="lg" mb={4}>
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
          direction={{ base: 'column', md: 'row' }}
          align="start"
          spacing={10}
        >
          {/* Formulario */}
          <Box flex="1" as="form" onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={4}>
              <FormControl isRequired isInvalid={!!errors.name}>
                <FormLabel>Nombre y apellido</FormLabel>
                <Input {...register('name')} />
                <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isRequired isInvalid={!!errors.phone}>
                <FormLabel>Teléfono</FormLabel>
                <Input {...register('phone')} placeholder="+595 ..." />
                <FormErrorMessage>{errors.phone?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isRequired isInvalid={!!errors.address}>
                <FormLabel>Dirección</FormLabel>
                <Textarea {...register('address')} />
                <FormErrorMessage>{errors.address?.message}</FormErrorMessage>
              </FormControl>

              <FormControl>
                <FormLabel>Notas (opcional)</FormLabel>
                <Textarea
                  {...register('notes')}
                  placeholder="Indicaciones para la entrega, referencia, etc."
                />
              </FormControl>

              <Button
                type="submit"
                colorScheme="teal"
                isDisabled={!isValid}
                isLoading={isSubmitting}
              >
                Confirmar orden
              </Button>
            </Stack>
          </Box>

          {/* Resumen */}
          <Box
            w={{ base: '100%', md: '380px' }}
            border="1px"
            borderColor="gray.200"
            p={5}
            borderRadius="2xl"
            boxShadow="sm"
          >
            <Heading size="md" mb={3}>
              Resumen
            </Heading>
            <Stack spacing={3}>
              {items.map((i) => (
                <HStack key={i.id} align="start">
                  <Image
                    src={i.imageUrl}
                    alt={i.title}
                    boxSize="64px"
                    objectFit="cover"
                    borderRadius="md"
                  />
                  <Box flex="1">
                    <Text noOfLines={1} fontWeight="semibold">
                      {i.title}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      {i.size || '—'} · x{i.qty}
                    </Text>
                  </Box>
                  <Text>{formatGs(i.price * i.qty)}</Text>
                </HStack>
              ))}
              <Divider />
              <HStack justify="space-between">
                <Text fontWeight="semibold">Subtotal</Text>
                <Text fontWeight="bold">{formatGs(subtotal)}</Text>
              </HStack>
              {/* En el mínimo no calculamos envío/impuestos */}
            </Stack>
          </Box>
        </Stack>
      )}
    </Box>
  )
}
