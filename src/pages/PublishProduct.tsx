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

/** ====== Schema ====== */
const schema = z.object({
  title: z.string().min(3, 'Mínimo 3 caracteres'),
  price: z.coerce.number().min(1000, 'Mínimo Gs. 1.000'),
  size: z.string().optional(),
  condition: z.enum(['Nuevo', 'Usado']).optional(),
  description: z.string().max(500, 'Máx. 500 caracteres').optional(),
  image: z
    .instanceof(FileList)
    .refine((f) => f?.length === 1, 'Subí una imagen'),
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
      fd.append('price', String(data.price))
      if (data.size) fd.append('size', data.size)
      if (data.condition) fd.append('condition', data.condition)
      if (data.description) fd.append('description', data.description)
      fd.append('image', data.image[0])

      // Al menos una variante por defecto (talle o “Única”)
      const variants = [
        { name: data.size ?? 'Única', stock: 1, price: data.price },
      ]
      fd.append('variants', JSON.stringify(variants))

      await api.post('/api/products', fd, {
        onUploadProgress: (evt: AxiosProgressEvent) => {
          if (evt.total) setProgress(Math.round((evt.loaded * 100) / evt.total))
        },
      })

      reset()
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

  /** ====== Dropzone handlers ====== */
  const onPickFile = () => fileInputRef.current?.click()
  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0]
    if (preview) URL.revokeObjectURL(preview)
    setPreview(f ? URL.createObjectURL(f) : null)
  }
  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault()
    if (!e.dataTransfer.files?.length) return
    const file = e.dataTransfer.files[0]
    // construir FileList vía DataTransfer para setValue
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
                      placeholder="Camiseta versión jugador"
                      {...register('title')}
                    />
                  </InputGroup>
                  <FormErrorMessage>{errors.title?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.price} isRequired>
                  <FormLabel>Precio (Gs)</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <Icon as={FiDollarSign} color="gray.400" />
                    </InputLeftElement>
                    <Input
                      type="number"
                      min={0}
                      step="1000"
                      placeholder="250000"
                      {...register('price', { valueAsNumber: true })}
                    />
                  </InputGroup>
                  <FormErrorMessage>{errors.price?.message}</FormErrorMessage>
                </FormControl>

                <HStack spacing={4}>
                  <FormControl>
                    <FormLabel>Talle</FormLabel>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none">
                        <Icon as={FaShirt} color="gray.400" />
                      </InputLeftElement>
                      <Input placeholder="M / L / XL" {...register('size')} />
                    </InputGroup>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Condición</FormLabel>
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
                        pl="40px" // espacio para el icono
                        size="md"
                        {...register('condition')}
                      >
                        <option value="Nuevo">Nuevo</option>
                        <option value="Usado">Usado</option>
                      </Select>
                    </Box>
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
                        {...register('image')}
                        ref={(el) => {
                          // mantener ref de RHF + ref local para click programático
                          if (el) fileInputRef.current = el
                        }}
                        onChange={onFileChange}
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
                  <FormErrorMessage>{errors.image?.message}</FormErrorMessage>
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
