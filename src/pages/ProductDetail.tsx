import ProductGrid from '@/components/ProductGrid'
import { useCart } from '@/hooks/useCart'
import { getProduct, getRelatedProducts } from '@/services/products'
import type { Product, ProductVariant } from '@/types/product'
import { formatGs } from '@/utils/format'
import {
  AspectRatio,
  Badge,
  Box,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  Collapse,
  Divider,
  FormControl,
  FormHelperText,
  FormLabel,
  HStack,
  Heading,
  Icon,
  Image,
  Input,
  InputGroup,
  InputRightElement,
  NumberInput,
  NumberInputField,
  SimpleGrid,
  Skeleton,
  Stack,
  Switch,
  Tag,
  TagLabel,
  Text,
  Tooltip,
  Wrap,
  WrapItem,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import { FiCheck, FiShield, FiTruck } from 'react-icons/fi'
import { ImBlocked } from 'react-icons/im'
import { useParams } from 'react-router-dom'

type ProductWithVariants = Product & {
  variants?: ProductVariant[]
  images?: string[]
}

const PATCHES = [
  { id: 'liga', label: 'Parche de Liga', price: 15000 },
  { id: 'campeon', label: 'Parche Campeón', price: 20000 },
  { id: 'respect', label: 'Parche RESPECT', price: 10000 },
]

const CUSTOMIZATION_FEE = 0
const SIZES = ['P', 'M', 'G', 'XG'] as const

const CUSTOMIZATION_ENABLED = import.meta.env.VITE_ENABLE_PRODUCT_CUSTOMIZATION === 'true'

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const { add } = useCart()
  const toast = useToast()

  const [product, setProduct] = useState<ProductWithVariants | null>(null)
  const [related, setRelated] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [variantId, setVariantId] = useState<string>('')
  const [selectedSize, setSelectedSize] = useState<string>('')

  const [customized, setCustomized] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customNumber, setCustomNumber] = useState<string>('') // string para input
  const [selectedPatches, setSelectedPatches] = useState<string[]>([])

  const PATCH_PREVIEW_SIZE = { base: '72px', md: '96px' }
  const PATCH_PREVIEW_PAD = { base: '6px', md: '8px' }

  const hasLeaguePatch = useMemo(
    () => selectedPatches.includes('liga'),
    [selectedPatches],
  )
  const setHasLeaguePatch = (on: boolean) => {
    setSelectedPatches((prev) => {
      const without = prev.filter((p) => p !== 'liga')
      return on ? [...without, 'liga'] : without
    })
  }

  const leaguePatchUrl = useMemo(() => '/parches/argentina.png', [])

  const activeBg = useColorModeValue('teal.50', 'teal.900')
  const activeBorder = useColorModeValue('teal.400', 'teal.300')
  const inactiveBorder = useColorModeValue('gray.200', 'gray.600')
  const activeText = useColorModeValue('teal.700', 'teal.200')
  const inactiveText = useColorModeValue('gray.700', 'gray.300')
  const breadcrumbColor = useColorModeValue('gray.600', 'whiteAlpha.600')
  const cardBg = useColorModeValue('white', 'whiteAlpha.50')
  const cardBorder = useColorModeValue('gray.200', 'whiteAlpha.200')
  const imageBorder = useColorModeValue('gray.200', 'whiteAlpha.200')
  const trustTextColor = useColorModeValue('gray.600', 'whiteAlpha.700')
  const helperTextColor = useColorModeValue('gray.500', 'whiteAlpha.700')
  const switchLabelColor = useColorModeValue('gray.600', 'whiteAlpha.700')

  useEffect(() => {
    let cancel = false
    ;(async () => {
      if (!id) return
      setLoading(true)
      try {
        const p = await getProduct(id)
        if (cancel) return

        const prod = p as unknown as ProductWithVariants
        setProduct(prod)

        const firstVar = prod.ProductVariant?.[0]?.id ?? ''
        setVariantId(firstVar)

        setSelectedSize(((prod as any).size as string) ?? '')

        setSelectedImage(prod.imageUrl)

        const r = await getRelatedProducts({
          id: p.id,
          kit: (p as any).kit,
          quality: (p as any).quality,
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
    () =>
      product?.ProductVariant?.find((v: { id: string }) => v.id === variantId),
    [product, variantId],
  )

  const unitPrice = useMemo(
    () => selectedVariant?.price ?? product?.basePrice ?? 0,
    [selectedVariant, product],
  )

  const patchesExtra = useMemo(() => {
    return selectedPatches.reduce((sum, pid) => {
      const p = PATCHES.find((x) => x.id === pid)
      return sum + (p?.price ?? 0)
    }, 0)
  }, [selectedPatches])

  const customizationExtra = useMemo(() => {
    if (!customized) return 0
    return CUSTOMIZATION_FEE
  }, [customized])

  const finalPrice = useMemo(
    () => unitPrice + patchesExtra + customizationExtra,
    [unitPrice, patchesExtra, customizationExtra],
  )

  const canAdd =
    !!product &&
    (!product.ProductVariant?.length ||
      (selectedVariant && selectedVariant.stock > 0)) &&
    (!customized ||
      customNumber === '' ||
      (!isNaN(Number(customNumber)) &&
        Number(customNumber) >= 0 &&
        Number(customNumber) <= 99))

  if (loading) {
    return (
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
        <Skeleton w="100%" h="520px" rounded="2xl" />
        <Skeleton w="100%" h="520px" rounded="2xl" />
      </SimpleGrid>
    )
  }

  if (!product) return <Text color="red.500">Producto no encontrado.</Text>

  const images = (product.images && product.images.length > 0
    ? product.images
    : [product.imageUrl]) ?? [product.imageUrl]

  return (
    <Box>
      {/* Encabezado simple tipo breadcrumb */}
      <HStack spacing={2} mb={3} color={breadcrumbColor} fontSize="sm">
        <Text>Catálogo</Text>
        <Text>›</Text>
        <Text noOfLines={1}>{product.title}</Text>
      </HStack>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
        {/* Galería */}
        <Stack>
          <AspectRatio ratio={1}>
            <Image
              src={selectedImage ?? product.imageUrl}
              alt={product.title}
              objectFit="cover"
              rounded="2xl"
              border="1px solid"
              borderColor={imageBorder}
            />
          </AspectRatio>

          {images.length > 1 && (
            <HStack spacing={3}>
              {images.map((src, i) => (
                <AspectRatio key={i} ratio={1} w="88px">
                  <Image
                    src={src}
                    alt={`vista ${i + 1}`}
                    objectFit="cover"
                    rounded="xl"
                    border="2px solid"
                    borderColor={
                      (selectedImage ?? product.imageUrl) === src
                        ? 'teal.400'
                        : 'whiteAlpha.300'
                    }
                    cursor="pointer"
                    onClick={() => setSelectedImage(src)}
                    _hover={{ borderColor: 'teal.300' }}
                  />
                </AspectRatio>
              ))}
            </HStack>
          )}
        </Stack>

        {/* Panel derecho */}
        <Card
          variant="outline"
          bg={cardBg}
          borderColor={cardBorder}
          rounded="2xl"
          shadow="lg"
          position="relative"
        >
          <CardBody>
            {/* Contenido con padding extra abajo para no quedar tapado por el footer sticky */}
            <Box pb="132px">
              {/* Título y badge */}
              <HStack align="baseline" justify="space-between" mb={1}>
                <HStack spacing={3}>
                  <Heading size="lg" noOfLines={1}>
                    {product.title}
                  </Heading>
                  {product.kit && (
                    <Badge colorScheme="purple" rounded="md" px={2}>
                      {product.kit}
                    </Badge>
                  )}
                </HStack>
              </HStack>

              {/* Precio */}
              <Text fontSize="3xl" fontWeight="bold" mt={2} mb={4}>
                {formatGs(finalPrice)}
              </Text>

              {/* Tamaño - chips (solo si NO hay variantes) */}
              {!(
                product.ProductVariant && product.ProductVariant.length > 0
              ) && (
                <Box mb={4}>
                  <Text fontWeight="semibold" mb={2}>
                    Tamaño
                  </Text>
                  <Wrap>
                    {SIZES.map((t) => (
                      <WrapItem key={t}>
                        <Tag
                          size="lg"
                          variant={selectedSize === t ? 'solid' : 'subtle'}
                          colorScheme={selectedSize === t ? 'teal' : 'gray'}
                          rounded="full"
                          px={4}
                          py={2}
                          cursor="pointer"
                          onClick={() => setSelectedSize(t)}
                          transition="all .2s ease"
                        >
                          <TagLabel>{t}</TagLabel>
                        </Tag>
                      </WrapItem>
                    ))}
                  </Wrap>
                </Box>
              )}

              {/* Variantes */}
              {product.ProductVariant && product.ProductVariant.length > 0 && (
                <Box mb={4}>
                  <Text fontWeight="semibold" mb={2}>
                    Talle
                  </Text>
                  <Wrap>
                    {product.ProductVariant.map((v) => {
                      const isActive = v.id === variantId
                      const isOut = v.stock <= 0
                      return (
                        <WrapItem key={v.id}>
                          <Tag
                            size="lg"
                            variant={isActive ? 'solid' : 'subtle'}
                            colorScheme={
                              isOut ? 'gray' : isActive ? 'teal' : 'gray'
                            }
                            rounded="full"
                            px={4}
                            py={2}
                            opacity={isOut ? 0.5 : 1}
                            cursor={isOut ? 'not-allowed' : 'pointer'}
                            onClick={() => !isOut && setVariantId(v.id)}
                            transition="all .2s ease"
                          >
                            <TagLabel>
                              {v.name} {isOut ? '(Sin stock)' : ''}
                            </TagLabel>
                          </Tag>
                        </WrapItem>
                      )
                    })}
                  </Wrap>
                </Box>
              )}

              <Divider my={4} borderColor={cardBorder} />

              {/* Personalización */}
              {CUSTOMIZATION_ENABLED && (
              <Box>
                <HStack justify="space-between" mb={2}>
                  <Text fontWeight="semibold">Personalización</Text>
                  <HStack>
                    <Text fontSize="sm" color={switchLabelColor}>
                      No
                    </Text>
                    <Switch
                      isChecked={customized}
                      onChange={(e) => setCustomized(e.target.checked)}
                      colorScheme="teal"
                    />
                    <Text fontSize="sm" color={switchLabelColor}>
                      Sí
                    </Text>
                  </HStack>
                </HStack>

                <Collapse in={customized} animateOpacity>
                  <Stack gap={3} maxW="sm">
                    <FormControl>
                      <FormLabel>Nombre</FormLabel>
                      <InputGroup>
                        <Input
                          placeholder="NOMBRE"
                          value={customName}
                          onChange={(e) =>
                            setCustomName(e.target.value.toUpperCase())
                          }
                          maxLength={12}
                        />
                        <InputRightElement
                          fontSize="xs"
                          color={helperTextColor}
                          pointerEvents="none"
                        >
                          {customName.length}/12
                        </InputRightElement>
                      </InputGroup>
                      <FormHelperText color={helperTextColor}>
                        Máx. 12 caracteres. Solo letras.
                      </FormHelperText>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Número</FormLabel>
                      <NumberInput
                        min={0}
                        max={99}
                        value={customNumber}
                        onChange={(value) => setCustomNumber(value)}
                      >
                        <NumberInputField placeholder="0–99" />
                      </NumberInput>
                      <FormHelperText color={helperTextColor}>
                        Números permitidos: 0 a 99.
                      </FormHelperText>
                    </FormControl>

                    {/* Parche de liga como cards */}
                    <FormControl>
                      <FormLabel>Parche de liga</FormLabel>
                      <ButtonGroup isAttached w="full">
                        {/* SIN PARCHE */}
                        <Button
                          flex={1}
                          size="lg"
                          height="auto"
                          py={3}
                          px={4}
                          variant={hasLeaguePatch ? 'outline' : 'solid'}
                          borderWidth={hasLeaguePatch ? '1px' : '2px'}
                          borderColor={
                            hasLeaguePatch ? inactiveBorder : activeBorder
                          }
                          boxShadow={
                            hasLeaguePatch
                              ? 'none'
                              : '0 0 0 3px rgba(56,178,172,0.2)'
                          }
                          bg={!hasLeaguePatch ? activeBg : undefined}
                          onClick={() => setHasLeaguePatch(false)}
                        >
                          <Stack spacing={2} align="center">
                            <Text
                              fontWeight="semibold"
                              color={
                                !hasLeaguePatch ? activeText : inactiveText
                              }
                            >
                              Sin parche
                            </Text>
                            <Box
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              w={PATCH_PREVIEW_SIZE}
                              h={PATCH_PREVIEW_SIZE}
                              bg="white"
                              rounded="md"
                              border="1px solid"
                              borderColor="blackAlpha.200"
                              transition="transform .15s ease"
                              _hover={{ transform: 'scale(1.03)' }}
                            >
                              <Icon
                                as={ImBlocked}
                                boxSize={{ base: 8, md: 10 }}
                                color="blackAlpha.500"
                              />
                            </Box>
                          </Stack>
                        </Button>

                        {/* CON PARCHE */}
                        <Button
                          flex={1}
                          size="lg"
                          height="auto"
                          py={3}
                          px={4}
                          colorScheme="teal"
                          variant={hasLeaguePatch ? 'solid' : 'outline'}
                          borderWidth={hasLeaguePatch ? '2px' : '1px'}
                          borderColor={
                            hasLeaguePatch ? activeBorder : inactiveBorder
                          }
                          boxShadow={
                            hasLeaguePatch
                              ? '0 0 0 3px rgba(56,178,172,0.2)'
                              : 'none'
                          }
                          bg={hasLeaguePatch ? activeBg : undefined}
                          onClick={() => setHasLeaguePatch(true)}
                          position="relative"
                        >
                          {hasLeaguePatch && (
                            <Box
                              position="absolute"
                              top={2}
                              right={2}
                              bg="teal.400"
                              color="white"
                              borderRadius="full"
                              w="18px"
                              h="18px"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              boxShadow="sm"
                            >
                              <FiCheck size={12} />
                            </Box>
                          )}

                          <Stack spacing={2} align="center">
                            <Text
                              fontWeight="semibold"
                              color={hasLeaguePatch ? activeText : inactiveText}
                            >
                              Con parche
                            </Text>
                            <Box
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              w={PATCH_PREVIEW_SIZE}
                              h={PATCH_PREVIEW_SIZE}
                              bg="white"
                              rounded="md"
                              p={PATCH_PREVIEW_PAD}
                              border="1px solid"
                              borderColor="blackAlpha.200"
                              transition="transform .15s ease"
                              _hover={{ transform: 'scale(1.03)' }}
                            >
                              <Image
                                src={leaguePatchUrl}
                                alt="Liga"
                                objectFit="contain"
                                maxW="100%"
                                maxH="100%"
                                draggable={false}
                              />
                            </Box>
                          </Stack>
                        </Button>
                      </ButtonGroup>
                    </FormControl>
                  </Stack>
                </Collapse>
              </Box>
              )}
            </Box>

            {/* FOOTER STICKY DENTRO DE LA CARD */}
            <Box
              position="sticky"
              bottom="0"
              zIndex={1}
              mx={-6} // igual al padding horizontal del CardBody
              px={6}
              pt={3}
              pb="calc(env(safe-area-inset-bottom, 0px) + 12px)"
            >
              <Tooltip
                label="Selecciona una talla"
                isDisabled={!!selectedSize || !SIZES.length}
              >
                <Button
                  colorScheme="teal"
                  size="lg"
                  w="full"
                  isDisabled={
                    !canAdd ||
                    (product.ProductVariant &&
                      product.ProductVariant.length > 0 &&
                      !selectedVariant)
                  }
                  onClick={() => {
                    const extrasLabel = [
                      selectedSize || undefined,
                      selectedVariant ? selectedVariant.name : undefined,
                      customized && customName ? `N:${customName}` : undefined,
                      customized && customNumber !== ''
                        ? `#${customNumber}`
                        : undefined,
                      selectedPatches.length
                        ? `Parches:${selectedPatches.length}`
                        : undefined,
                    ]
                      .filter(Boolean)
                      .join(' • ')

                    const titleWithExtras = extrasLabel
                      ? `${product.title} (${extrasLabel})`
                      : product.title

                    add(
                      {
                        id: product.id,
                        variantId: selectedVariant?.id,
                        title: titleWithExtras,
                        price: finalPrice,
                        imageUrl: product.imageUrl,
                        size:
                          (selectedSize || selectedVariant?.name) ?? undefined,
                        customName: customized
                          ? customName || undefined
                          : undefined,
                        customNumber:
                          customized && customNumber !== ''
                            ? Number(customNumber)
                            : undefined,
                        patches: selectedPatches,
                      } as any,
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
              </Tooltip>

              <Divider my={6} borderColor={cardBorder} />

              {/* Trust signals + fecha (se quedan arriba del footer) */}
              <Stack gap={3}>
                <HStack
                  spacing={6}
                  color={trustTextColor}
                  fontSize="sm"
                  justify="center"
                >
                  <HStack>
                    <Icon as={FiShield} />
                    <Text>Pago seguro</Text>
                  </HStack>
                  <HStack>
                    <Icon as={FiTruck} />
                    <Text>Entrega 24 – 48h</Text>
                  </HStack>
                </HStack>

                <Divider borderColor={cardBorder} />
              </Stack>
            </Box>
          </CardBody>
        </Card>
      </SimpleGrid>

      <Divider my={10} borderColor={cardBorder} />

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
