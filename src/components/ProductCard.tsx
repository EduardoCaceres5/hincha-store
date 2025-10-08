import LeagueBadge from '@/components/LeagueBadge'
import type { Product } from '@/types/product'
import { cldUrl } from '@/utils/cdn'
import { formatGs } from '@/utils/format'
import { translateKit } from '@/utils/leagues'
import {
  AspectRatio,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  HStack,
  Image,
  LinkBox,
  LinkOverlay,
  Stack,
  Tag,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { FiShoppingCart } from 'react-icons/fi'
import { Link as RouterLink, useNavigate } from 'react-router-dom'

const MotionBox = motion(Box)
const MotionImage = motion(Image)

export default function ProductCard({ product }: { product: Product }) {
  const nav = useNavigate()
  const { id, title, basePrice, imageUrl, quality, kit, league, ProductImage } =
    product

  const stock = 10
  const showLeagueBadges = import.meta.env.VITE_ENABLE_LEAGUE_BADGES === 'true'

  const cardBg = useColorModeValue('white', 'gray.800')
  const priceColor = useColorModeValue('brand.700', 'brand.200')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  // Usar la primera imagen de ProductImage o imageUrl como fallback
  const mainImage =
    ProductImage && ProductImage.length > 0
      ? ProductImage[0].imageUrl
      : imageUrl

  // Miniatura cuadrada optimizada con blur
  const thumb = cldUrl(mainImage, {
    w: 600,
    h: 600,
    crop: 'fill',
    gravity: 'auto',
  })

  const thumbBlur = cldUrl(mainImage, {
    w: 50,
    h: 50,
    crop: 'fill',
    gravity: 'auto',
  })

  const isLowStock = stock !== undefined && stock > 0 && stock <= 5
  const isOutOfStock = stock !== undefined && stock === 0

  return (
    <LinkBox
      as={Card}
      overflow="hidden"
      borderRadius="2xl"
      boxShadow="sm"
      bg={cardBg}
      borderWidth="1px"
      borderColor={borderColor}
      _hover={{
        boxShadow: 'xl',
        transform: 'translateY(-4px)',
        borderColor: 'brand.400',
      }}
      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      position="relative"
    >
      <MotionBox
        position="relative"
        overflow="hidden"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.3 }}
      >
        <AspectRatio ratio={1}>
          <MotionImage
            src={thumb}
            alt={title}
            objectFit="cover"
            loading="lazy"
            fallbackSrc="/placeholder-product.svg"
            bg="white"
            filter={isOutOfStock ? 'grayscale(100%)' : 'none'}
            opacity={isOutOfStock ? 0.6 : 1}
            style={{
              backgroundImage: `url(${thumbBlur})`,
              backgroundSize: 'cover',
            }}
          />
        </AspectRatio>

        {showLeagueBadges && league && (
          <LeagueBadge league={league} size="sm" />
        )}

        {isOutOfStock && (
          <Badge
            position="absolute"
            top={4}
            right={4}
            colorScheme="red"
            fontSize="xs"
            px={3}
            py={1}
          >
            Agotado
          </Badge>
        )}

        {isLowStock && !isOutOfStock && (
          <Badge
            position="absolute"
            top={4}
            right={4}
            colorScheme="orange"
            fontSize="xs"
            px={3}
            py={1}
          >
            ¡Últimas {stock} unidades!
          </Badge>
        )}
      </MotionBox>

      <CardBody p={3}>
        <Stack spacing={2}>
          <LinkOverlay as={RouterLink} to={`/producto/${id}`}>
            <Text
              noOfLines={2}
              fontWeight="semibold"
              fontSize="sm"
              minH="40px"
              lineHeight="1.3"
            >
              {title}
            </Text>
          </LinkOverlay>

          <HStack spacing={1} flexWrap="wrap">
            {kit && (
              <Tag
                size="sm"
                colorScheme="purple"
                borderRadius="full"
                fontSize="xs"
              >
                {translateKit(kit)}
              </Tag>
            )}
            {quality && (
              <Tag
                size="sm"
                colorScheme={quality === 'PLAYER_VERSION' ? 'green' : 'blue'}
                borderRadius="full"
                fontSize="xs"
              >
                {quality === 'PLAYER_VERSION' ? 'Jugador' : 'Fan'}
              </Tag>
            )}
          </HStack>

          <Text fontSize="lg" fontWeight="bold" color={priceColor}>
            {formatGs(basePrice)}
          </Text>

          <Button
            leftIcon={<FiShoppingCart />}
            colorScheme="teal"
            size="sm"
            w="full"
            onClick={() => nav(`/producto/${id}`)}
            isDisabled={isOutOfStock}
            _hover={{
              transform: 'scale(1.02)',
            }}
          >
            {isOutOfStock ? 'No disponible' : 'Ver detalles'}
          </Button>
        </Stack>
      </CardBody>
    </LinkBox>
  )
}
