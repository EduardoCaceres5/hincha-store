import { useCart } from '@/hooks/useCart'
import { formatGs } from '@/utils/format'
import { DeleteIcon } from '@chakra-ui/icons'
import {
  Box,
  Button,
  Divider,
  Heading,
  HStack,
  IconButton,
  Image,
  NumberInput,
  NumberInputField,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useToast,
} from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'

export default function CartPage() {
  const { items, setQty, remove, clear, subtotal } = useCart()
  const toast = useToast()

  if (!items.length) {
    return (
      <Stack spacing={4}>
        <Heading size="lg">Tu carrito está vacío</Heading>
        <Text color="gray.600">Explorá el catálogo y agregá productos.</Text>
        <Button
          as={RouterLink}
          to="/catalogo"
          colorScheme="teal"
          w="fit-content"
        >
          Ir al catálogo
        </Button>
      </Stack>
    )
  }

  return (
    <Box>
      <Heading size="lg" mb={4}>
        Carrito
      </Heading>

      <Table variant="simple" size="sm">
        <Thead>
          <Tr>
            <Th>Producto</Th>
            <Th>Talle</Th>
            <Th isNumeric>Precio</Th>
            <Th isNumeric>Cantidad</Th>
            <Th isNumeric>Total</Th>
            <Th></Th>
          </Tr>
        </Thead>
        <Tbody>
          {items.map((it) => (
            <Tr key={it.id}>
              <Td>
                <HStack>
                  <Image
                    src={it.imageUrl}
                    alt={it.title}
                    boxSize="64px"
                    objectFit="cover"
                    borderRadius="md"
                  />
                  <Text noOfLines={2}>{it.title}</Text>
                </HStack>
              </Td>
              <Td>{it.size || '-'}</Td>
              <Td isNumeric>{formatGs(it.price)}</Td>
              <Td isNumeric>
                <NumberInput
                  min={1}
                  max={99}
                  value={it.qty}
                  onChange={(_, v) => setQty(it.id, v || 1)}
                  w="20"
                >
                  <NumberInputField />
                </NumberInput>
              </Td>
              <Td isNumeric>{formatGs(it.price * it.qty)}</Td>
              <Td>
                <IconButton
                  aria-label="Quitar"
                  icon={<DeleteIcon />}
                  size="sm"
                  colorScheme="red"
                  onClick={() => remove(it.id)}
                />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Divider my={6} />

      <HStack justify="space-between">
        <Button
          variant="outline"
          onClick={() => {
            clear()
            toast({ title: 'Carrito vaciado', status: 'info' })
          }}
        >
          Vaciar carrito
        </Button>
        <HStack>
          <Text fontSize="lg" fontWeight="semibold">
            Subtotal: {formatGs(subtotal)}
          </Text>
          <Button colorScheme="teal" as={RouterLink} to="/checkout">
            Continuar compra
          </Button>
        </HStack>
      </HStack>
    </Box>
  )
}
