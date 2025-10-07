import LeagueBadge from '@/components/LeagueBadge'
import type { Product } from '@/types/product'
import { cldUrl } from '@/utils/cdn'
import { formatGs } from '@/utils/format'
import { translateKit } from '@/utils/leagues'
import {
  AspectRatio,
  Box,
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

export default function ProductCard({ product }: { product: Product }) {
  const nav = useNavigate()
  const { id, title, basePrice, imageUrl, quality, kit, league, ProductImage } =
    product

  const showLeagueBadges = import.meta.env.VITE_ENABLE_LEAGUE_BADGES === 'true'

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
      <Box position="relative">
        <AspectRatio ratio={1}>
          <Image
            src={thumb}
            alt={title}
            objectFit="cover"
            loading="lazy"
            fallbackSrc="/placeholder-product.svg"
            bg="white"
          />
        </AspectRatio>

        {showLeagueBadges && league && <LeagueBadge league={league} size="sm" />}
      </Box>

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
