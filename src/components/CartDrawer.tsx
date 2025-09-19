import { useCart } from '@/hooks/useCart'
import { formatGs } from '@/utils/format'
import { DeleteIcon } from '@chakra-ui/icons'
import {
  Box,
  Button,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  HStack,
  IconButton,
  Image,
  NumberInput,
  NumberInputField,
  Stack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'

type Props = {
  isOpen: boolean
  onClose: () => void
}

export default function CartDrawer({ isOpen, onClose }: Props) {
  const { items, setQty, remove, subtotal } = useCart()
  const bg = useColorModeValue('white', 'gray.900')

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="sm">
      <DrawerOverlay />
      <DrawerContent bg={bg}>
        <DrawerCloseButton />
        <DrawerHeader>Tu carrito</DrawerHeader>

        <DrawerBody>
          {items.length === 0 ? (
            <Stack spacing={3}>
              <Text color="gray.600">No tenés productos en el carrito.</Text>
              <Button
                as={RouterLink}
                to="/catalogo"
                onClick={onClose}
                colorScheme="teal"
                w="fit-content"
              >
                Ir al catálogo
              </Button>
            </Stack>
          ) : (
            <Stack spacing={4}>
              {items.map((it) => (
                <Box key={it.id}>
                  <HStack align="start" spacing={3}>
                    <Image
                      src={it.imageUrl}
                      alt={it.title}
                      boxSize="64px"
                      objectFit="cover"
                      borderRadius="md"
                    />
                    <Box flex="1">
                      <Text noOfLines={2} fontWeight="semibold">
                        {it.title}
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        {it.size || '—'}
                      </Text>
                      <HStack justify="space-between" mt={2}>
                        <Text fontWeight="semibold">{formatGs(it.price)}</Text>
                        <HStack>
                          <NumberInput
                            size="sm"
                            min={1}
                            max={99}
                            value={it.qty}
                            onChange={(_, v) => setQty(it.id, v || 1)}
                            w="16"
                          >
                            <NumberInputField />
                          </NumberInput>
                          <IconButton
                            aria-label="Quitar"
                            size="sm"
                            icon={<DeleteIcon />}
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => remove(it.id)}
                          />
                        </HStack>
                      </HStack>
                    </Box>
                  </HStack>
                  <Divider mt={3} />
                </Box>
              ))}
            </Stack>
          )}
        </DrawerBody>

        <DrawerFooter>
          <Stack w="full" spacing={3}>
            <HStack justify="space-between">
              <Text fontWeight="semibold">Subtotal</Text>
              <Text fontWeight="bold">{formatGs(subtotal)}</Text>
            </HStack>
            <HStack>
              <Button variant="outline" onClick={onClose} flex="1">
                Seguir comprando
              </Button>
              <Button
                as={RouterLink}
                to="/checkout"
                colorScheme="teal"
                flex="1"
                isDisabled={items.length === 0}
                onClick={onClose}
              >
                Ir al checkout
              </Button>
            </HStack>
          </Stack>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
