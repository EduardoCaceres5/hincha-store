import ProductGrid from '@/components/ProductGrid'
import { useCart } from '@/hooks/useCart'
import { type Product } from '@/hooks/useProducts'
import { getProduct, getRelatedProducts } from '@/services/products'
import { formatGs } from '@/utils/format'
import {
  AspectRatio,
  Badge,
  Box,
  Button,
  Divider,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Image,
  Select,
  Skeleton,
  Stack,
  Tag,
  Text,
  useToast,
} from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import { Link as RouterLink, useParams } from 'react-router-dom'

type Variant = {
  id: string
  name: string
  stock: number
  price?: number | null
}

type ProductWithVariants = Product & {
  variants?: Variant[]
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const { add } = useCart()
  const toast = useToast()
  const [product, setProduct] = useState<ProductWithVariants | null>(null)
  const [related, setRelated] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [variantId, setVariantId] = useState<string>('')

  useEffect(() => {
    let cancel = false
    ;(async () => {
      if (!id) return
      setLoading(true)
      try {
        const p = await getProduct(id)
        if (cancel) return
        setProduct(p as ProductWithVariants)
        // preseleccionar la primera variante disponible si hay
        const first = (p as ProductWithVariants).variants?.[0]?.id ?? ''
        setVariantId(first)

        const r = await getRelatedProducts({
          id: p.id,
          // estos dos pueden venir de p si tu API los devuelve, o de tu estado si los tenés
          size: (p as any).size,
          condition: (p as any).condition,
        })
        if (!cancel) setRelated(r)
      } catch {
        if (!cancel) {
          toast({
            title: 'No se pudo cargar el producto',
            status: 'error',
            isClosable: true,
          })
        }
      } finally {
        if (!cancel) setLoading(false)
      }
    })()
    return () => {
      cancel = true
    }
  }, [id, toast])

  const selectedVariant = useMemo(
    () => product?.variants?.find((v) => v.id === variantId),
    [product, variantId],
  )

  const unitPrice = useMemo(
    () => selectedVariant?.price ?? product?.price ?? 0,
    [selectedVariant, product],
  )

  if (loading) {
    return (
      <Stack direction={{ base: 'column', md: 'row' }} spacing={6}>
        <Skeleton w={{ base: '100%', md: '50%' }} h="420px" />
        <Stack flex="1" spacing={4}>
          <Skeleton h="28px" w="70%" />
          <Skeleton h="20px" w="40%" />
          <Skeleton h="20px" w="50%" />
          <Skeleton h="48px" w="180px" />
        </Stack>
      </Stack>
    )
  }

  if (!product) return <Text color="red.500">Producto no encontrado.</Text>

  return (
    <Box>
      <Stack direction={{ base: 'column', md: 'row' }} spacing={8}>
        <Box flex="1">
          <AspectRatio ratio={1}>
            <Image
              src={product.imageUrl}
              alt={product.title}
              objectFit="cover"
              borderRadius="2xl"
            />
          </AspectRatio>
        </Box>

        <Stack flex="1" spacing={4}>
          <Heading size="lg" noOfLines={2}>
            {product.title}
          </Heading>

          <Text fontSize="2xl" fontWeight="bold">
            {formatGs(unitPrice)}
          </Text>

          {/* Etiquetas legacy (si aún existen en tu modelo base) */}
          <HStack>
            {product.size && <Tag>{product.size}</Tag>}
            {product.condition && (
              <Tag
                colorScheme={product.condition === 'Nuevo' ? 'green' : 'orange'}
              >
                {product.condition}
              </Tag>
            )}
          </HStack>

          {/* Variantes (talles) */}
          {product.variants && product.variants.length > 0 && (
            <FormControl maxW="sm">
              <FormLabel>Talle / Variante</FormLabel>
              <HStack spacing={4} align="center">
                <Select
                  value={variantId}
                  onChange={(e) => setVariantId(e.target.value)}
                >
                  {product.variants.map((v) => (
                    <option key={v.id} value={v.id} disabled={v.stock <= 0}>
                      {v.name} {v.stock <= 0 ? '(Sin stock)' : ''}
                    </option>
                  ))}
                </Select>

                {selectedVariant && (
                  <Badge
                    colorScheme={selectedVariant.stock > 0 ? 'green' : 'red'}
                  >
                    {selectedVariant.stock > 0
                      ? `Stock: ${selectedVariant.stock}`
                      : 'Sin stock'}
                  </Badge>
                )}
              </HStack>
            </FormControl>
          )}

          {product.description && (
            <Text whiteSpace="pre-wrap">{product.description}</Text>
          )}

          <HStack pt={2} spacing={3}>
            <Button
              colorScheme="teal"
              isDisabled={
                (product.variants &&
                  product.variants.length > 0 &&
                  !selectedVariant) ||
                (selectedVariant && selectedVariant.stock <= 0)
              }
              onClick={() => {
                // Si tu CartItem ya soporta variantId, descomenta y ajusta:
                // add(
                //   {
                //     id: product.id,            // productId
                //     variantId: selectedVariant?.id!, // 👈 requiere tipo en tu CartItem
                //     title: `${product.title}${selectedVariant ? ` (${selectedVariant.name})` : ''}`,
                //     price: unitPrice,
                //     imageUrl: product.imageUrl,
                //     size: selectedVariant?.name,
                //   },
                //   1
                // )

                // Versión compatible con tu hook actual (sin variantId):
                add(
                  {
                    id: product.id,
                    title: `${product.title}${selectedVariant ? ` (${selectedVariant.name})` : ''}`,
                    price: unitPrice,
                    imageUrl: product.imageUrl,
                    size: selectedVariant?.name ?? product.size ?? undefined,
                  },
                  1,
                )

                toast({
                  title: 'Agregado al carrito',
                  status: 'success',
                  duration: 2000,
                  isClosable: true,
                })
              }}
            >
              Agregar al carrito
            </Button>

            <Button variant="outline" as={RouterLink} to="/publicar">
              Vender algo similar
            </Button>
          </HStack>

          <Text fontSize="sm" color="gray.500">
            Publicado: {new Date(product.createdAt).toLocaleDateString('es-PY')}
          </Text>
        </Stack>
      </Stack>

      <Divider my={10} />

      <Heading size="md" mb={4}>
        Productos relacionados
      </Heading>
      {related.length > 0 ? (
        <ProductGrid products={related} />
      ) : (
        <Text color="gray.500">No hay productos relacionados por ahora.</Text>
      )}
    </Box>
  )
}
