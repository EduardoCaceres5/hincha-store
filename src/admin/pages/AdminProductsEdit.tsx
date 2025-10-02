import api from '@/services/api'
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  HStack,
  Icon,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  useColorModeValue as mode,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  useToast,
} from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { FaShirt } from 'react-icons/fa6'
import {
  FiAward,
  FiDollarSign,
  FiFileText,
  FiTag,
  FiUploadCloud,
} from 'react-icons/fi'
import { useNavigate, useParams } from 'react-router-dom'
import { z } from 'zod'

/** ====== Schema ====== */
const schema = z.object({
  title: z.string().min(3, 'Mínimo 3 caracteres'),
  basePrice: z.coerce.number().int().min(1000, 'Mínimo Gs. 1.000'),
  size: z.string().optional(),
  kit: z.enum(['HOME', 'AWAY', 'THIRD', 'RETRO']).optional(),
  quality: z.enum(['FAN', 'PLAYER']),
  seasonLabel: z.string().max(20, 'Máx. 20 caracteres').optional(),
  seasonStart: z.coerce
    .number()
    .int()
    .min(1900, 'Año inválido')
    .max(2100, 'Año inválido')
    .optional(),
  description: z.string().max(500, 'Máx. 500 caracteres').optional(),
  image: z.any().optional(),
})

type FormInput = z.input<typeof schema>
type FormData = z.output<typeof schema>

export default function EditProduct() {
  const { id } = useParams<{ id: string }>()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const toast = useToast()
  const nav = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormInput, any, FormData>({ resolver: zodResolver(schema) })

  useEffect(() => {
    ;(async () => {
      try {
        const { data } = await api.get(`/api/products/${id}`)
        reset({
          title: data.title,
          basePrice: data.basePrice,
          size: data.ProductVariant?.[0]?.name || '',
          kit: data.kit || undefined,
          quality: data.quality || 'FAN',
          seasonLabel: data.seasonLabel || '',
          seasonStart: data.seasonStart || undefined,
          description: data.description || '',
        })
        setPreview(data.imageUrl)
      } catch {
        toast({ title: 'No se pudo cargar el producto', status: 'error' })
      } finally {
        setLoading(false)
      }
    })()
  }, [id, toast, reset])

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('title', data.title)
      fd.append('basePrice', String(data.basePrice))
      if (data.description) fd.append('description', data.description)
      if (data.kit) fd.append('kit', data.kit)
      fd.append('quality', data.quality)
      if (data.seasonLabel) fd.append('seasonLabel', data.seasonLabel)
      if (typeof data.seasonStart === 'number') {
        fd.append('seasonStart', String(data.seasonStart))
      }
      if (data.image && (data.image as FileList).length > 0) {
        fd.append('image', (data.image as FileList)[0])
      }

      await api.put(`/api/products/${id}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      toast({ title: 'Producto actualizado', status: 'success' })
      nav('/admin/productos', { replace: true })
    } catch {
      toast({ title: 'No se pudo actualizar', status: 'error' })
    } finally {
      setSaving(false)
    }
  }

  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview)
    },
    [preview],
  )

  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0]
    if (preview) URL.revokeObjectURL(preview)
    setPreview(f ? URL.createObjectURL(f) : null)
  }

  const cardBg = mode('white', 'gray.800')
  const cardBorder = mode('gray.200', 'whiteAlpha.300')
  const dropBg = mode('gray.50', 'whiteAlpha.50')
  const dropBorder = mode('gray.300', 'whiteAlpha.300')

  if (loading) return null

  return (
    <Box>
      <Heading size="lg" mb={4}>
        Editar producto
      </Heading>

      <Card
        bg={cardBg}
        borderWidth="1px"
        borderColor={cardBorder}
        borderRadius="2xl"
        shadow="md"
      >
        <CardHeader pb={0}>
          <Stack spacing={1}>
            <Heading size="md">Detalles del producto</Heading>
            <Text color="gray.500">
              Actualizá la información del producto
            </Text>
          </Stack>
        </CardHeader>

        <CardBody>
          <Box as="form" onSubmit={handleSubmit(onSubmit)}>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
              {/* Columna izquierda: campos */}
              <Stack spacing={4}>
                <FormControl isInvalid={!!errors.title} isRequired>
                  <FormLabel>Título</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <Icon as={FiTag} color="gray.400" />
                    </InputLeftElement>
                    <Input
                      placeholder="Camiseta Real Madrid"
                      {...register('title')}
                    />
                  </InputGroup>
                  <FormErrorMessage>{errors.title?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.basePrice} isRequired>
                  <FormLabel>Precio base (Gs)</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <Icon as={FiDollarSign} color="gray.400" />
                    </InputLeftElement>
                    <Input
                      type="number"
                      min={0}
                      step="1000"
                      placeholder="250000"
                      {...register('basePrice', { valueAsNumber: true })}
                    />
                  </InputGroup>
                  <FormErrorMessage>
                    {errors.basePrice?.message}
                  </FormErrorMessage>
                </FormControl>

                <HStack spacing={4}>
                  <FormControl>
                    <FormLabel>Talle</FormLabel>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none">
                        <Icon as={FaShirt} color="gray.400" />
                      </InputLeftElement>
                      <Input
                        placeholder="P / M / G / XG"
                        {...register('size')}
                      />
                    </InputGroup>
                  </FormControl>

                  <FormControl isInvalid={!!errors.quality} isRequired>
                    <FormLabel>Calidad</FormLabel>
                    <Box position="relative">
                      <Icon
                        as={FiAward}
                        color="gray.400"
                        position="absolute"
                        left="12px"
                        top="50%"
                        transform="translateY(-50%)"
                        pointerEvents="none"
                      />
                      <Select
                        placeholder="Seleccionar"
                        pl="40px"
                        size="md"
                        {...register('quality')}
                      >
                        <option value="FAN">Fan</option>
                        <option value="PLAYER">Versión jugador</option>
                      </Select>
                    </Box>
                    <FormErrorMessage>
                      {errors.quality?.message}
                    </FormErrorMessage>
                  </FormControl>
                </HStack>

                <HStack spacing={4}>
                  <FormControl>
                    <FormLabel>Equipación</FormLabel>
                    <Select placeholder="Seleccionar" {...register('kit')}>
                      <option value="HOME">Titular</option>
                      <option value="AWAY">Alternativa</option>
                      <option value="THIRD">Tercera</option>
                      <option value="RETRO">Retro</option>
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Temporada</FormLabel>
                    <HStack>
                      <Input
                        placeholder="2024/25"
                        {...register('seasonLabel')}
                      />
                      <Input
                        type="number"
                        placeholder="2024"
                        {...register('seasonStart', { valueAsNumber: true })}
                      />
                    </HStack>
                  </FormControl>
                </HStack>

                <FormControl isInvalid={!!errors.description}>
                  <FormLabel>Descripción</FormLabel>
                  <InputGroup alignItems="flex-start">
                    <InputLeftElement pointerEvents="none" pt={3}>
                      <Icon as={FiFileText} color="gray.400" />
                    </InputLeftElement>
                    <Textarea pl="40px" rows={5} {...register('description')} />
                  </InputGroup>
                  <FormErrorMessage>
                    {errors.description?.message}
                  </FormErrorMessage>
                </FormControl>
              </Stack>

              {/* Columna derecha: imagen */}
              <Stack spacing={4}>
                <FormControl isInvalid={!!errors.image}>
                  <FormLabel>Nueva imagen (opcional)</FormLabel>

                  <Box
                    borderWidth="2px"
                    borderStyle="dashed"
                    borderColor={dropBorder}
                    bg={dropBg}
                    p={4}
                    borderRadius="xl"
                    textAlign="center"
                  >
                    <Stack align="center" spacing={2}>
                      <Icon as={FiUploadCloud} boxSize={8} color="teal.400" />
                      <Text fontWeight="medium">Seleccioná una imagen</Text>
                      <Input
                        type="file"
                        accept="image/*"
                        {...register('image')}
                        onChange={onFileChange}
                        size="sm"
                      />
                    </Stack>
                  </Box>

                  {preview && (
                    <Image
                      src={preview}
                      alt="Vista previa"
                      mt={3}
                      borderRadius="xl"
                      objectFit="cover"
                      w="100%"
                      maxH="280px"
                    />
                  )}
                  <FormErrorMessage>
                    {errors.image?.message as string}
                  </FormErrorMessage>
                </FormControl>

                <Divider />

                <Stack spacing={1} fontSize="sm" color="gray.500">
                  <Text>Recomendaciones:</Text>
                  <Text>• Formato JPG/PNG, 1500×1500, fondo claro.</Text>
                  <Text>• Mostrá el escudo o detalle principal.</Text>
                </Stack>
              </Stack>
            </SimpleGrid>

            <HStack justify="flex-end" spacing={3} mt={8}>
              <Button
                variant="ghost"
                onClick={() => nav('/admin/productos')}
                isDisabled={saving}
              >
                Cancelar
              </Button>
              <Button type="submit" colorScheme="teal" isLoading={saving}>
                Guardar cambios
              </Button>
            </HStack>
          </Box>
        </CardBody>
      </Card>
    </Box>
  )
}
