import { useCart } from '@/hooks/useCart'
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
  useToast,
} from '@chakra-ui/react'
import { FiShoppingCart } from 'react-icons/fi'
import { Link as RouterLink } from 'react-router-dom'

export type Product = {
  id: string
  title: string
  price: number
  size?: string | null
  condition?: string | null
  imageUrl: string // puede ser secure_url o public_id
  createdAt: string
}

export default function ProductCard({ product }: { product: Product }) {
  const toast = useToast()
  const { add } = useCart()
  const { id, title, price, size, condition, imageUrl } = product

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
              {formatGs(price)}
            </Text>
            <HStack spacing={2}>
              {size && (
                <Tag size="sm" variant="subtle">
                  {size}
                </Tag>
              )}
              {condition && (
                <Tag
                  size="sm"
                  colorScheme={condition === 'Nuevo' ? 'green' : 'orange'}
                >
                  {condition}
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
            onClick={(e) => {
              e.preventDefault()
              add(
                { id, title, price, imageUrl: thumb, size: size ?? undefined },
                1,
              )
              toast({
                title: 'Agregado al carrito',
                description: `${title} fue añadido.`,
                status: 'success',
                duration: 2000,
                isClosable: true,
              })
            }}
          >
            Añadir
          </Button>
        </Stack>
      </CardBody>
    </LinkBox>
  )
}
