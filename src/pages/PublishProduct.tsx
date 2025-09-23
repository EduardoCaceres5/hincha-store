import api from '@/services/api'
import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Image,
  Input,
  Progress,
  Select,
  Stack,
  Textarea,
  useToast, // 👈 useToast
} from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import type { AxiosProgressEvent } from 'axios'
import { useEffect, useState } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { z } from 'zod'

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

// Tipos derivados del schema
type FormInput = z.input<typeof schema> // price: unknown (entrada cruda)
type FormData = z.output<typeof schema> // price: number  (post-coerción)

export default function PublishProduct() {
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [preview, setPreview] = useState<string | null>(null)
  const toast = useToast() // 👈

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormInput, any, FormData>({
    resolver: zodResolver(schema),
  })

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

      await api.post('/api/products', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
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

  return (
    <Box>
      <Heading size="lg" mb={4}>
        Publicar producto
      </Heading>
      <Box as="form" onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={4}>
          <FormControl isInvalid={!!errors.title} isRequired>
            <FormLabel>Título</FormLabel>
            <Input
              {...register('title')}
              placeholder="Camiseta versión jugador"
            />
            <FormErrorMessage>{errors.title?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.price} isRequired>
            <FormLabel>Precio (Gs)</FormLabel>
            <Input type="number" min={0} {...register('price')} />
            <FormErrorMessage>{errors.price?.message}</FormErrorMessage>
          </FormControl>

          <FormControl>
            <FormLabel>Talle</FormLabel>
            <Input {...register('size')} placeholder="M / L / XL" />
          </FormControl>

          <FormControl>
            <FormLabel>Condición</FormLabel>
            <Select placeholder="Seleccionar" {...register('condition')}>
              <option value="Nuevo">Nuevo</option>
              <option value="Usado">Usado</option>
            </Select>
          </FormControl>

          <FormControl isInvalid={!!errors.description}>
            <FormLabel>Descripción</FormLabel>
            <Textarea {...register('description')} />
            <FormErrorMessage>{errors.description?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.image} isRequired>
            <FormLabel>Imagen</FormLabel>
            <Input
              type="file"
              accept="image/*"
              {...register('image')}
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (preview) URL.revokeObjectURL(preview)
                setPreview(f ? URL.createObjectURL(f) : null)
              }}
            />
            {preview && (
              <Image
                src={preview}
                alt="preview"
                mt={2}
                maxH="200px"
                objectFit="contain"
              />
            )}
            <FormErrorMessage>{errors.image?.message}</FormErrorMessage>
          </FormControl>

          {loading && <Progress value={progress} size="sm" borderRadius="md" />}

          <Button type="submit" colorScheme="teal" isLoading={loading}>
            Publicar
          </Button>
        </Stack>
      </Box>
    </Box>
  )
}
