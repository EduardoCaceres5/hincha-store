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
import { useNavigate, useParams } from 'react-router-dom'
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
  league: z
    .enum([
      'PREMIER_LEAGUE',
      'LA_LIGA',
      'LIGUE_1',
      'SERIE_A',
      'BUNDESLIGA',
      'LIGA_PROFESIONAL',
      'LIGA_SAUDI',
      'INTERNACIONAL',
    ])
    .optional(),

  seasonLabel: z.string().max(20, 'Máx. 20 caracteres').optional(),
  seasonStart: z.coerce
    .number()
    .int()
    .min(1900, 'Año inválido')
    .max(2100, 'Año inválido')
    .optional(),

  description: z.string().max(500, 'Máx. 500 caracteres').optional(),

  // Usamos z.any + refine para evitar fallas de instanceof cuando el ref de RHF se encadena
  images: z.any().optional(),
})

type FormInput = z.input<typeof schema>
type FormData = z.output<typeof schema>

export default function EditProduct() {
  const { id } = useParams<{ id: string }>()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [progress, setProgress] = useState(0)
  const [previews, setPreviews] = useState<string[]>([])
  const toast = useToast()
  const nav = useNavigate()
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<FormInput, any, FormData>({ resolver: zodResolver(schema) })

  // Registro encadenado para el input file
  const imagesReg = register('images')

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
          league: data.league || undefined,
          seasonLabel: data.seasonLabel || '',
          seasonStart: data.seasonStart || undefined,
          description: data.description || '',
        })
        // Si hay imágenes en el producto, las mostramos como preview
        if (data.imageUrl) {
          setPreviews([data.imageUrl])
        }
      } catch {
        toast({ title: 'No se pudo cargar el producto', status: 'error' })
      } finally {
        setLoading(false)
      }
    })()
  }, [id, toast, reset])

  useEffect(
    () => () => {
      previews.forEach((url) => {
        // Solo revocamos URLs de blob
        if (url.startsWith('blob:')) URL.revokeObjectURL(url)
      })
    },
    [previews],
  )

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setSaving(true)
    setProgress(0)
    try {
      const fd = new FormData()
      fd.append('title', data.title)
      fd.append('basePrice', String(data.basePrice))
      if (data.description) fd.append('description', data.description)

      // Nuevos metadatos
      if (data.kit) fd.append('kit', data.kit)
      fd.append('quality', data.quality) // requerido
      if (data.league) fd.append('league', data.league)
      if (data.seasonLabel) fd.append('seasonLabel', data.seasonLabel)
      if (typeof data.seasonStart === 'number') {
        fd.append('seasonStart', String(data.seasonStart))
      }

      // Imágenes múltiples (si se subieron nuevas)
      if (data.images && (data.images as FileList).length > 0) {
        const files = data.images as FileList
        Array.from(files).forEach((file) => {
          fd.append('images', file)
        })
      }

      // Variante por defecto (usa basePrice en backend si price=null/undefined)
      const variants = [
        {
          name: data.size ?? 'Única',
          stock: 1,
          price: null as unknown as number | null,
        },
      ]
      fd.append('variants', JSON.stringify(variants))

      await api.put(`/api/products/${id}`, fd, {
        onUploadProgress: (evt: AxiosProgressEvent) => {
          if (evt.total) setProgress(Math.round((evt.loaded * 100) / evt.total))
        },
      })

      toast({
        title: 'Producto actualizado',
        description: 'Los cambios se guardaron correctamente.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      nav('/admin/productos', { replace: true })
    } catch (e: any) {
      const status = e?.response?.status
      const msg = e?.response?.data?.error || 'Error al actualizar'
      toast({
        title: status === 401 ? 'Sesión requerida' : 'No se pudo actualizar',
        description:
          status === 401
            ? 'Iniciá sesión para actualizar productos.'
            : String(msg),
        status: 'error',
        duration: 4000,
        isClosable: true,
      })
    } finally {
      setSaving(false)
      setProgress(0)
    }
  }

  /** ====== Handlers ====== */
  const onPickFile = () => fileInputRef.current?.click()

  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const files = e.target.files
    if (!files) return
    previews.forEach((url) => {
      if (url.startsWith('blob:')) URL.revokeObjectURL(url)
    })
    const newPreviews = Array.from(files).map((f) => URL.createObjectURL(f))
    setPreviews(newPreviews)
  }

  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    if (!files || files.length === 0) return
    const dt = new DataTransfer()
    Array.from(files).forEach((f) => dt.items.add(f))
    const list = dt.files
    setValue('images', list as unknown as FileList, { shouldValidate: true })
    previews.forEach((url) => {
      if (url.startsWith('blob:')) URL.revokeObjectURL(url)
    })
    const newPreviews = Array.from(files).map((f) => URL.createObjectURL(f))
    setPreviews(newPreviews)
  }

  const removeImage = (index: number) => {
    const input = fileInputRef.current
    if (!input?.files) return
    const dt = new DataTransfer()
    Array.from(input.files).forEach((file, i) => {
      if (i !== index) dt.items.add(file)
    })
    const newList = dt.files
    setValue('images', newList as unknown as FileList, { shouldValidate: true })
    const urlToRevoke = previews[index]
    if (urlToRevoke.startsWith('blob:')) URL.revokeObjectURL(urlToRevoke)
    setPreviews(previews.filter((_, i) => i !== index))
  }

  /** ====== Estilos dependientes de tema ====== */
  const cardBg = mode('white', 'gray.800')
  const cardBorder = mode('gray.200', 'whiteAlpha.300')
  const dropBg = mode('gray.50', 'whiteAlpha.50')
  const dropBorder = mode('gray.300', 'whiteAlpha.300')
  const dropHover = mode('teal.100', 'teal.900')

  if (loading) return null

  return (
    <Box>
      <Heading size={{ base: 'md', md: 'lg' }} mb={4}>
        Editar producto
      </Heading>

      <Card
        bg={cardBg}
        borderWidth="1px"
        borderColor={cardBorder}
        borderRadius={{ base: 'lg', md: '2xl' }}
        shadow="md"
      >
        <CardHeader pb={0}>
          <Stack spacing={1}>
            <Heading size={{ base: 'sm', md: 'md' }}>
              Detalles del producto
            </Heading>
            <Text color="gray.500" fontSize={{ base: 'sm', md: 'md' }}>
              Actualizá la información del producto
            </Text>
          </Stack>
        </CardHeader>

        <CardBody>
          <Box as="form" onSubmit={handleSubmit(onSubmit)}>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 6, md: 8 }}>
              {/* Columna izquierda: campos */}
              <Stack spacing={4}>
                <FormControl isInvalid={!!errors.title} isRequired>
                  <FormLabel fontSize={{ base: 'sm', md: 'md' }}>
                    Título
                  </FormLabel>
                  <InputGroup size={{ base: 'md', md: 'lg' }}>
                    <InputLeftElement pointerEvents="none">
                      <Icon as={FiTag} color="gray.400" />
                    </InputLeftElement>
                    <Input
                      placeholder="Camiseta Real Madrid"
                      {...register('title')}
                    />
                  </InputGroup>
                  <FormErrorMessage fontSize="sm">
                    {errors.title?.message}
                  </FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.basePrice} isRequired>
                  <FormLabel fontSize={{ base: 'sm', md: 'md' }}>
                    Precio base (Gs)
                  </FormLabel>
                  <InputGroup size={{ base: 'md', md: 'lg' }}>
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
                  <FormErrorMessage fontSize="sm">
                    {errors.basePrice?.message}
                  </FormErrorMessage>
                </FormControl>

                <Stack direction={{ base: 'column', sm: 'row' }} spacing={4}>
                  <FormControl>
                    <FormLabel fontSize={{ base: 'sm', md: 'md' }}>
                      Talle
                    </FormLabel>
                    <Box position="relative">
                      <Icon
                        as={FaShirt}
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
                        size={{ base: 'md', md: 'lg' }}
                        {...register('size')}
                      >
                        <option value="P">P</option>
                        <option value="M">M</option>
                        <option value="G">G</option>
                        <option value="XG">XG</option>
                      </Select>
                    </Box>
                  </FormControl>

                  <FormControl isInvalid={!!errors.quality} isRequired>
                    <FormLabel fontSize={{ base: 'sm', md: 'md' }}>
                      Calidad
                    </FormLabel>
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
                        size={{ base: 'md', md: 'lg' }}
                        {...register('quality')}
                      >
                        <option value="FAN">Fan</option>
                        <option value="PLAYER_VERSION">Versión jugador</option>
                      </Select>
                    </Box>
                    <FormErrorMessage fontSize="sm">
                      {errors.quality?.message}
                    </FormErrorMessage>
                  </FormControl>
                </Stack>

                <Stack direction={{ base: 'column', sm: 'row' }} spacing={4}>
                  <FormControl>
                    <FormLabel fontSize={{ base: 'sm', md: 'md' }}>
                      Equipación
                    </FormLabel>
                    <Select
                      placeholder="Seleccionar"
                      size={{ base: 'md', md: 'lg' }}
                      {...register('kit')}
                    >
                      <option value="HOME">Titular</option>
                      <option value="AWAY">Alternativa</option>
                      <option value="THIRD">Tercera</option>
                      <option value="RETRO">Retro</option>
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize={{ base: 'sm', md: 'md' }}>
                      Temporada
                    </FormLabel>
                    <Input
                      placeholder="2024/25"
                      size={{ base: 'md', md: 'lg' }}
                      {...register('seasonLabel')}
                    />
                  </FormControl>
                </Stack>

                <FormControl>
                  <FormLabel fontSize={{ base: 'sm', md: 'md' }}>Liga</FormLabel>
                  <Select
                    placeholder="Seleccionar"
                    size={{ base: 'md', md: 'lg' }}
                    {...register('league')}
                  >
                    <option value="PREMIER_LEAGUE">Premier League</option>
                    <option value="LA_LIGA">La Liga</option>
                    <option value="LIGUE_1">Ligue 1</option>
                    <option value="SERIE_A">Serie A</option>
                    <option value="BUNDESLIGA">Bundesliga</option>
                    <option value="LIGA_PROFESIONAL">Liga Profesional</option>
                    <option value="LIGA_SAUDI">Liga Saudí</option>
                    <option value="INTERNACIONAL">Internacional</option>
                  </Select>
                </FormControl>

                <FormControl isInvalid={!!errors.description}>
                  <FormLabel fontSize={{ base: 'sm', md: 'md' }}>
                    Descripción
                  </FormLabel>
                  <InputGroup alignItems="flex-start">
                    <InputLeftElement pointerEvents="none" pt={3}>
                      <Icon as={FiFileText} color="gray.400" />
                    </InputLeftElement>
                    <Textarea
                      pl="40px"
                      rows={5}
                      fontSize={{ base: 'sm', md: 'md' }}
                      {...register('description')}
                    />
                  </InputGroup>
                  <FormErrorMessage fontSize="sm">
                    {errors.description?.message}
                  </FormErrorMessage>
                </FormControl>
              </Stack>

              {/* Columna derecha: uploader */}
              <Stack spacing={4}>
                <FormControl isInvalid={!!errors.images}>
                  <FormLabel fontSize={{ base: 'sm', md: 'md' }}>
                    Imágenes (múltiples)
                  </FormLabel>

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
                    p={{ base: 6, md: 8 }}
                    borderRadius="xl"
                    textAlign="center"
                  >
                    <Stack align="center" spacing={2}>
                      <Icon
                        as={FiUploadCloud}
                        boxSize={{ base: 10, md: 12 }}
                        color="teal.400"
                      />
                      <Text
                        fontWeight="medium"
                        fontSize={{ base: 'sm', md: 'md' }}
                      >
                        Arrastrá tus imágenes aquí
                      </Text>
                      <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.500">
                        o{' '}
                        <Box as="span" textDecoration="underline">
                          hacé clic para seleccionar
                        </Box>
                      </Text>

                      <Input
                        type="file"
                        accept="image/*"
                        multiple
                        // Registro encadenado: mantenemos el ref de RHF y el nuestro
                        {...imagesReg}
                        ref={(el) => {
                          imagesReg.ref(el)
                          if (el) fileInputRef.current = el
                        }}
                        onChange={(e) => {
                          imagesReg.onChange(e) // RHF necesita esto para tener FileList
                          onFileChange(e) // nuestro preview
                        }}
                        display="none"
                      />
                    </Stack>
                  </Box>

                  {previews.length > 0 && (
                    <SimpleGrid columns={{ base: 2, md: 2 }} spacing={3} mt={3}>
                      {previews.map((url, idx) => (
                        <Box key={idx} position="relative">
                          <Image
                            src={url}
                            alt={`Preview ${idx + 1}`}
                            borderRadius="xl"
                            objectFit="cover"
                            w="100%"
                            h={{ base: '120px', md: '150px' }}
                          />
                          {url.startsWith('blob:') && (
                            <Button
                              size="xs"
                              colorScheme="red"
                              position="absolute"
                              top={2}
                              right={2}
                              onClick={(e) => {
                                e.stopPropagation()
                                removeImage(idx)
                              }}
                            >
                              ✕
                            </Button>
                          )}
                        </Box>
                      ))}
                    </SimpleGrid>
                  )}
                  <FormErrorMessage fontSize="sm">
                    {errors.images?.message as string}
                  </FormErrorMessage>
                </FormControl>

                <Divider />

                <Stack spacing={1} fontSize={{ base: 'xs', md: 'sm' }} color="gray.500">
                  <Text>Recomendaciones:</Text>
                  <Text>• Formato JPG/PNG, 1500×1500, fondo claro.</Text>
                  <Text>• Mostrá el escudo o detalle principal.</Text>
                </Stack>
              </Stack>
            </SimpleGrid>

            {saving && (
              <Box mt={6}>
                <Progress value={progress} size="sm" borderRadius="md" />
                <Text mt={2} fontSize={{ base: 'xs', md: 'sm' }} color="gray.500">
                  Subiendo… {progress}%
                </Text>
              </Box>
            )}

            <Stack
              direction={{ base: 'column', sm: 'row' }}
              justify="flex-end"
              spacing={3}
              mt={8}
            >
              <Button
                variant="ghost"
                onClick={() => nav('/admin/productos')}
                isDisabled={saving}
                size={{ base: 'md', md: 'lg' }}
                width={{ base: 'full', sm: 'auto' }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                colorScheme="teal"
                isLoading={saving}
                size={{ base: 'md', md: 'lg' }}
                width={{ base: 'full', sm: 'auto' }}
              >
                Guardar cambios
              </Button>
            </Stack>
          </Box>
        </CardBody>
      </Card>
    </Box>
  )
}
