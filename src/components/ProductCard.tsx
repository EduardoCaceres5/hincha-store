import { useCart } from '@/hooks/useCart'
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
  imageUrl: string
  createdAt: string
}

export default function ProductCard({ product }: { product: Product }) {
  const toast = useToast()
  const { add } = useCart()
  const { id, title, price, size, condition, imageUrl } = product

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
          src={imageUrl}
          alt={title}
          objectFit="cover"
          fallbackSrc="https://via.placeholder.com/600x600?text=Producto"
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
              e.preventDefault() // no navegar al detalle
              add({ id, title, price, imageUrl, size: size ?? undefined }, 1)
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
