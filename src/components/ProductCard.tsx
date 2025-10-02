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

export default function ProductCard({ product }: { product: Product }) {
  const nav = useNavigate()
  const { id, title, basePrice, size, type, imageUrl } = product

  // Miniatura cuadrada optimizada
  const thumb = cldUrl(imageUrl, {
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
              {size && (
                <Tag size="sm" variant="subtle">
                  {size}
                </Tag>
              )}
              {type && (
                <Tag
                  size="sm"
                  colorScheme={type === 'FAN' ? 'green' : 'orange'}
                >
                  {type}
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
