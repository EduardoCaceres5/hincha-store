import {
  createVariant,
  deleteVariant,
  getMyProducts,
  updateVariant,
} from '@/services/seller'
import { DeleteIcon } from '@chakra-ui/icons'
import {
  Badge,
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  NumberInput,
  NumberInputField,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure,
  useToast,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'

export default function SellerProducts() {
  const [items, setItems] = useState<any[]>([])
  const [selected, setSelected] = useState<any | null>(null)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [form, setForm] = useState({
    option: '',
    stock: 0,
    price: '' as any,
    sku: '',
  })
  const toast = useToast()

  async function load() {
    setItems(await getMyProducts())
  }
  useEffect(() => {
    load()
  }, [])

  function openCreate(p: any) {
    setSelected(p)
    setForm({ option: '', stock: 0, price: '', sku: '' })
    onOpen()
  }

  async function save() {
    try {
      if (!selected) return
      const payload: any = {
        option: form.option.trim(),
        stock: Number(form.stock) || 0,
        sku: form.sku?.trim() || undefined,
      }
      if (form.price !== '' && form.price !== null)
        payload.price = Number(form.price) || 0
      await createVariant(selected.id, payload)
      toast({ title: 'Variante creada', status: 'success' })
      onClose()
      load()
    } catch (e: any) {
      toast({
        title: 'No se pudo crear',
        description: String(e?.response?.data?.error || e),
        status: 'error',
      })
    }
  }

  async function quickUpdate(v: any, patch: any) {
    try {
      await updateVariant(v.id, patch)
      load()
    } catch {
      toast({ title: 'Error actualizando variante', status: 'error' })
    }
  }

  async function remove(v: any) {
    try {
      await deleteVariant(v.id)
      load()
    } catch {
      toast({ title: 'No se pudo eliminar', status: 'error' })
    }
  }

  return (
    <Box>
      <Heading size="lg" mb={4}>
        Mis productos
      </Heading>

      <Table size="sm" variant="simple">
        <Thead>
          <Tr>
            <Th>Producto</Th>
            <Th>Precio base</Th>
            <Th>Variantes</Th>
            <Th></Th>
          </Tr>
        </Thead>
        <Tbody>
          {items.map((p) => (
            <Tr key={p.id} verticalAlign="top">
              <Td>
                <Text fontWeight="semibold">{p.title}</Text>
                <Text fontSize="sm" color="gray.600">
                  {new Date(p.createdAt).toLocaleDateString()}
                </Text>
              </Td>
              <Td>Gs. {p.price.toLocaleString()}</Td>
              <Td>
                {p.variants.length === 0 ? (
                  <Badge colorScheme="gray">Sin variantes</Badge>
                ) : (
                  p.variants.map((v: any) => (
                    <HStack key={v.id} spacing={2} mb={2}>
                      <Badge>{v.option}</Badge>
                      <Text fontSize="sm">Stock:</Text>
                      <NumberInput
                        size="sm"
                        w="20"
                        value={v.stock}
                        min={0}
                        onChange={(_, val) =>
                          quickUpdate(v, { stock: Math.max(0, val || 0) })
                        }
                      >
                        <NumberInputField />
                      </NumberInput>
                      <Text fontSize="sm">Precio:</Text>
                      <NumberInput
                        size="sm"
                        w="24"
                        value={v.price ?? ''}
                        min={0}
                        onChange={(_, val) =>
                          quickUpdate(v, {
                            price: isNaN(val) ? null : Math.max(0, val || 0),
                          })
                        }
                      >
                        <NumberInputField />
                      </NumberInput>
                      <IconButton
                        aria-label="Eliminar"
                        size="sm"
                        icon={<DeleteIcon />}
                        onClick={() => remove(v)}
                      />
                    </HStack>
                  ))
                )}
              </Td>
              <Td>
                <Button size="sm" onClick={() => openCreate(p)}>
                  + Variante
                </Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Nueva variante para: {selected?.title}</ModalHeader>
          <ModalBody>
            <FormControl mb={3} isRequired>
              <FormLabel>Opción (ej: Talle:M)</FormLabel>
              <Input
                value={form.option}
                onChange={(e) =>
                  setForm((f) => ({ ...f, option: e.target.value }))
                }
              />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Stock</FormLabel>
              <NumberInput
                min={0}
                value={form.stock}
                onChange={(_, v) => setForm((f) => ({ ...f, stock: v || 0 }))}
              >
                <NumberInputField />
              </NumberInput>
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Precio (opcional)</FormLabel>
              <NumberInput
                min={0}
                value={form.price as any}
                onChange={(_, v) =>
                  setForm((f) => ({ ...f, price: isNaN(v) ? '' : v }))
                }
              >
                <NumberInputField />
              </NumberInput>
            </FormControl>
            <FormControl>
              <FormLabel>SKU (opcional)</FormLabel>
              <Input
                value={form.sku}
                onChange={(e) =>
                  setForm((f) => ({ ...f, sku: e.target.value }))
                }
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <HStack>
              <Button onClick={onClose} variant="ghost">
                Cancelar
              </Button>
              <Button colorScheme="teal" onClick={save}>
                Guardar
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}
