import api from '@/services/api'
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Image,
  Input,
  Select,
  Stack,
  Textarea,
  useToast,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

export default function EditProduct() {
  const { id } = useParams<{ id: string }>()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [product, setProduct] = useState<any>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const toast = useToast()
  const nav = useNavigate()

  useEffect(() => {
    ;(async () => {
      try {
        const { data } = await api.get(`/api/products/${id}`)
        setProduct(data)
      } catch {
        toast({ title: 'No se pudo cargar el producto', status: 'error' })
      } finally {
        setLoading(false)
      }
    })()
  }, [id, toast])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!product) return
    setSaving(true)
    try {
      const form = new FormData(e.currentTarget)
      // si no se elige nueva imagen, no se envía "image"
      if (!(form.get('image') as File)?.size) form.delete('image')
      await api.put(`/api/products/${id}`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      toast({ title: 'Producto actualizado', status: 'success' })
      nav('/dashboard', { replace: true })
    } catch {
      toast({ title: 'No se pudo actualizar', status: 'error' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return null

  return (
    <Box>
      <Heading size="lg" mb={4}>
        Editar producto
      </Heading>
      <Box as="form" onSubmit={onSubmit}>
        <Stack spacing={4}>
          <FormControl isRequired>
            <FormLabel>Título</FormLabel>
            <Input name="title" defaultValue={product.title} />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Precio (Gs)</FormLabel>
            <Input type="number" name="price" defaultValue={product.price} />
          </FormControl>

          <FormControl>
            <FormLabel>Talle</FormLabel>
            <Input name="size" defaultValue={product.size || ''} />
          </FormControl>

          <FormControl>
            <FormLabel>Condición</FormLabel>
            <Select name="condition" defaultValue={product.condition || ''}>
              <option value="">—</option>
              <option value="Nuevo">Nuevo</option>
              <option value="Usado">Usado</option>
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>Descripción</FormLabel>
            <Textarea
              name="description"
              defaultValue={product.description || ''}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Nueva imagen (opcional)</FormLabel>
            <Input
              type="file"
              name="image"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (preview) URL.revokeObjectURL(preview)
                setPreview(f ? URL.createObjectURL(f) : null)
              }}
            />
            <Image
              src={preview || product.imageUrl}
              mt={2}
              maxH="220px"
              objectFit="cover"
              borderRadius="md"
            />
          </FormControl>

          <Button type="submit" colorScheme="teal" isLoading={saving}>
            Guardar cambios
          </Button>
        </Stack>
      </Box>
    </Box>
  )
}
