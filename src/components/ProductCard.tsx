import type { Product } from '@/types/product'
import { cldUrl } from '@/utils/cdn'
import { formatGs } from '@/utils/format'
import {
  AspectRatio,
  Button,
  Card,
  CardBody,
  Divider,
  HStack,
  Image,
  LinkBox,
  LinkOverlay,
  Stack,
  Tag,
  Text,
} from '@chakra-ui/react'
import { FiShoppingCart } from 'react-icons/fi'
import { Link as RouterLink, useNavigate } from 'react-router-dom'

const translateKit = (kit: string) => {
  const translations: Record<string, string> = {
    HOME: 'Titular',
    AWAY: 'Alternativa',
    THIRD: 'Tercera',
    RETRO: 'Retro',
  }
  return translations[kit] || kit
}

export default function ProductCard({ product }: { product: Product }) {
  const nav = useNavigate()
  const {
    id,
    title,
    basePrice,
    imageUrl,
    quality,
    kit,
    ProductVariant,
    ProductImage,
  } = product

  // Obtener el primer talle disponible si existe
  const firstVariant = ProductVariant?.[0]
  const size = firstVariant?.name !== 'Única' ? firstVariant?.name : undefined

  // Usar la primera imagen de ProductImage o imageUrl como fallback
  const mainImage =
    ProductImage && ProductImage.length > 0
      ? ProductImage[0].imageUrl
      : imageUrl

  // Miniatura cuadrada optimizada
  const thumb = cldUrl(mainImage, {
    w: 600,
    h: 600,
    crop: 'fill',
    gravity: 'auto',
  })

  return (
    <LinkBox
      as={Card}
      overflow="hidden"
      borderRadius="2xl"
      boxShadow="sm"
      _hover={{ boxShadow: 'md', transform: 'translateY(-2px)' }}
      transition="all 0.15s ease"
    >
      <AspectRatio ratio={1}>
        <Image
          src={thumb}
          alt={title}
          objectFit="cover"
          loading="lazy"
          fallbackSrc="/placeholder-product.svg"
        />
      </AspectRatio>

      <CardBody>
        <Stack spacing={2}>
          <LinkOverlay as={RouterLink} to={`/producto/${id}`}>
            <Text noOfLines={1} fontWeight="semibold">
              {title}
            </Text>
          </LinkOverlay>

          <HStack justify="space-between" align="center">
            <Text fontSize="lg" fontWeight="bold">
              {formatGs(basePrice)}
            </Text>
            <HStack spacing={2}>
              {kit && (
                <Tag size="sm" colorScheme="purple">
                  {translateKit(kit)}
                </Tag>
              )}
              {quality && (
                <Tag
                  size="sm"
                  colorScheme={quality === 'PLAYER_VERSION' ? 'green' : 'blue'}
                >
                  {quality === 'PLAYER_VERSION' ? 'Jugador' : 'Fan'}
                </Tag>
              )}
            </HStack>
          </HStack>

          <Divider />

          <Button
            leftIcon={<FiShoppingCart />}
            colorScheme="teal"
            size="sm"
            w="full"
            onClick={() => nav(`/producto/${id}`)}
          >
            Añadir
          </Button>
        </Stack>
      </CardBody>
    </LinkBox>
  )
}
