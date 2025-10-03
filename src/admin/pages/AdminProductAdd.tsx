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
  Progress,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  useToast,
} from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import type { AxiosProgressEvent } from 'axios'
import { useEffect, useRef, useState } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { FaShirt } from 'react-icons/fa6'
import {
  FiAward,
  FiDollarSign,
  FiFileText,
  FiTag,
  FiUploadCloud,
} from 'react-icons/fi'
import { z } from 'zod'

/** ====== Schema (actualizado con nuevos campos) ====== */
const schema = z.object({
  title: z.string().min(3, 'Mínimo 3 caracteres'),

  basePrice: z.coerce.number().int().min(1000, 'Mínimo Gs. 1.000'),

  size: z.string().optional(), // seguimos creando 1 variante con este nombre
  kit: z.enum(['HOME', 'AWAY', 'THIRD', 'RETRO']).optional(),
  quality: z.enum(['FAN', 'PLAYER_VERSION'], {
    message: 'Seleccioná la calidad',
  }),

  seasonLabel: z.string().max(20, 'Máx. 20 caracteres').optional(),
  seasonStart: z.coerce
    .number()
    .int()
    .min(1900, 'Año inválido')
    .max(2100, 'Año inválido')
    .optional(),

  description: z.string().max(500, 'Máx. 500 caracteres').optional(),

  // Usamos z.any + refine para evitar fallas de instanceof cuando el ref de RHF se encadena
  image: z
    .any()
    .refine(
      (v) =>
        v &&
        typeof v === 'object' &&
        'length' in v &&
        (v as FileList).length === 1,
      'Subí una imagen',
    ),
})

type FormInput = z.input<typeof schema>
type FormData = z.output<typeof schema>

/** ====== Componente ====== */
export default function PublishProduct() {
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [preview, setPreview] = useState<string | null>(null)
  const toast = useToast()
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<FormInput, any, FormData>({ resolver: zodResolver(schema) })

  // Registro encadenado para el input file
  const imageReg = register('image')

  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview)
    },
    [preview],
  )

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setLoading(true)
    setProgress(0)
    try {
      const fd = new FormData()
      fd.append('title', data.title)
      fd.append('basePrice', String(data.basePrice))
      if (data.description) fd.append('description', data.description)

      // Nuevos metadatos
      if (data.kit) fd.append('kit', data.kit)
      fd.append('quality', data.quality) // requerido
      if (data.seasonLabel) fd.append('seasonLabel', data.seasonLabel)
      if (typeof data.seasonStart === 'number') {
        fd.append('seasonStart', String(data.seasonStart))
      }

      // Imagen
      fd.append('image', (data.image as FileList)[0])

      // Variante por defecto (usa basePrice en backend si price=null/undefined)
      const variants = [
        {
          name: data.size ?? 'Única',
          stock: 1,
          price: null as unknown as number | null,
        },
      ]
      fd.append('variants', JSON.stringify(variants))

      await api.post('/api/products', fd, {
        onUploadProgress: (evt: AxiosProgressEvent) => {
          if (evt.total) setProgress(Math.round((evt.loaded * 100) / evt.total))
        },
      })

      reset()
      if (preview) URL.revokeObjectURL(preview)
      setPreview(null)

      toast({
        title: 'Producto publicado',
        description: 'Tu producto ya está visible en el catálogo.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (e: any) {
      const status = e?.response?.status
      const msg = e?.response?.data?.error || 'Error al publicar'
      toast({
        title: status === 401 ? 'Sesión requerida' : 'No se pudo publicar',
        description:
          status === 401
            ? 'Iniciá sesión para publicar productos.'
            : String(msg),
        status: 'error',
        duration: 4000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
      setProgress(0)
    }
  }

  /** ====== Estilos dependientes de tema ====== */
  const cardBg = mode('white', 'gray.800')
  const cardBorder = mode('gray.200', 'whiteAlpha.300')
  const dropBg = mode('gray.50', 'whiteAlpha.50')
  const dropBorder = mode('gray.300', 'whiteAlpha.300')
  const dropHover = mode('teal.100', 'teal.900')

  /** ====== Handlers ====== */
  const onPickFile = () => fileInputRef.current?.click()

  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0]
    if (preview) URL.revokeObjectURL(preview)
    setPreview(f ? URL.createObjectURL(f) : null)
  }

  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    const dt = new DataTransfer()
    dt.items.add(file)
    const list = dt.files
    setValue('image', list as unknown as FileList, { shouldValidate: true })
    if (preview) URL.revokeObjectURL(preview)
    setPreview(URL.createObjectURL(file))
  }

  return (
    <Box>
      <Heading size="lg" mb={4}>
        Publicar producto
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
              Completá la información y subí una imagen
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
                        <option value="PLAYER_VERSION">Versión jugador</option>
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

              {/* Columna derecha: uploader */}
              <Stack spacing={4}>
                <FormControl isInvalid={!!errors.image} isRequired>
                  <FormLabel>Imagen</FormLabel>

                  <Box
                    onClick={onPickFile}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={onDrop}
                    cursor="pointer"
                    borderWidth="2px"
                    borderStyle="dashed"
                    borderColor={dropBorder}
                    bg={dropBg}
                    _hover={{ bg: dropHover, borderColor: 'teal.400' }}
                    transition="all .15s ease"
                    p={4}
                    borderRadius="xl"
                    textAlign="center"
                  >
                    <Stack align="center" spacing={2}>
                      <Icon as={FiUploadCloud} boxSize={8} color="teal.400" />
                      <Text fontWeight="medium">Arrastrá tu imagen aquí</Text>
                      <Text fontSize="sm" color="gray.500">
                        o{' '}
                        <Box as="span" textDecoration="underline">
                          hacé clic para seleccionar
                        </Box>
                      </Text>

                      <Input
                        type="file"
                        accept="image/*"
                        // Registro encadenado: mantenemos el ref de RHF y el nuestro
                        {...imageReg}
                        ref={(el) => {
                          imageReg.ref(el)
                          if (el) fileInputRef.current = el
                        }}
                        onChange={(e) => {
                          imageReg.onChange(e) // RHF necesita esto para tener FileList
                          onFileChange(e) // nuestro preview
                        }}
                        display="none"
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

            {loading && (
              <Box mt={6}>
                <Progress value={progress} size="sm" borderRadius="md" />
                <Text mt={2} fontSize="sm" color="gray.500">
                  Subiendo… {progress}%
                </Text>
              </Box>
            )}

            <HStack justify="flex-end" spacing={3} mt={8}>
              <Button
                variant="ghost"
                onClick={() => {
                  reset()
                  if (preview) URL.revokeObjectURL(preview)
                  setPreview(null)
                }}
                isDisabled={loading}
              >
                Limpiar
              </Button>
              <Button type="submit" colorScheme="teal" isLoading={loading}>
                Publicar
              </Button>
            </HStack>
          </Box>
        </CardBody>
      </Card>
    </Box>
  )
}
