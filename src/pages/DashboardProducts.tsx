import { type Product } from '@/hooks/useProducts'
import {
  bulkDeleteProducts,
  deleteProduct,
  getMyProducts,
} from '@/services/myProducts'
import { DeleteIcon, EditIcon } from '@chakra-ui/icons'
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  Checkbox,
  Heading,
  HStack,
  IconButton,
  Image,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useToast,
} from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function DashboardProducts() {
  const [data, setData] = useState<{
    items: Product[]
    page: number
    limit: number
    total: number
  } | null>(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const selectedIds = useMemo(
    () => Object.keys(selected).filter((id) => selected[id]),
    [selected],
  )
  const allChecked = useMemo(
    () =>
      data?.items.length ? data.items.every((p) => selected[p.id]) : false,
    [data, selected],
  )
  const indeterminate = useMemo(
    () => !!selectedIds.length && !allChecked,
    [selectedIds.length, allChecked],
  )

  const [confirmOneOpen, setConfirmOneOpen] = useState(false)
  const [deletingOne, setDeletingOne] = useState<string | null>(null)

  const [confirmBulkOpen, setConfirmBulkOpen] = useState(false)
  const [bulkLoading, setBulkLoading] = useState(false)

  const toast = useToast()
  const nav = useNavigate()

  async function load() {
    setLoading(true)
    try {
      const d = await getMyProducts(page, 12)
      setData(d)
      // limpiar selección de ítems que ya no están
      setSelected((prev) => {
        const next: Record<string, boolean> = {}
        d.items.forEach((p) => {
          if (prev[p.id]) next[p.id] = true
        })
        return next
      })
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    load()
  }, [page])

  function toggleAll() {
    if (!data?.items) return
    const next: Record<string, boolean> = {}
    if (!allChecked) {
      data.items.forEach((p) => {
        next[p.id] = true
      })
    }
    setSelected(next)
  }
  function toggleOne(id: string, checked: boolean) {
    setSelected((prev) => ({ ...prev, [id]: checked }))
  }

  async function onDeleteOne() {
    if (!deletingOne) return
    try {
      await deleteProduct(deletingOne)
      toast({
        title: 'Producto eliminado',
        status: 'success',
        duration: 2500,
        isClosable: true,
      })
      setConfirmOneOpen(false)
      setDeletingOne(null)
      load()
    } catch {
      toast({
        title: 'No se pudo eliminar',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  async function onBulkDelete() {
    setBulkLoading(true)
    try {
      const { deleted } = await bulkDeleteProducts(selectedIds)
      toast({
        title: `Eliminados: ${deleted}`,
        status: 'success',
        duration: 2500,
        isClosable: true,
      })
      setConfirmBulkOpen(false)
      setSelected({})
      load()
    } catch {
      toast({
        title: 'No se pudo eliminar la selección',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setBulkLoading(false)
    }
  }

  return (
    <Box>
      <Heading size="lg" mb={4}>
        Mis productos
      </Heading>

      <HStack justify="space-between" mb={3}>
        <Text color="gray.600">
          {selectedIds.length
            ? `${selectedIds.length} seleccionados`
            : 'Seleccioná productos para acciones masivas'}
        </Text>
        <Button
          colorScheme="red"
          leftIcon={<DeleteIcon />}
          onClick={() => setConfirmBulkOpen(true)}
          isDisabled={!selectedIds.length}
        >
          Eliminar seleccionados
        </Button>
      </HStack>

      {loading ? (
        <HStack py={8} justify="center">
          <Spinner />
        </HStack>
      ) : (
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th w="1%">
                <Checkbox
                  isChecked={allChecked}
                  isIndeterminate={indeterminate}
                  onChange={toggleAll}
                />
              </Th>
              <Th>Imagen</Th>
              <Th>Título</Th>
              <Th isNumeric>Precio</Th>
              <Th>Talle</Th>
              <Th>Condición</Th>
              <Th></Th>
            </Tr>
          </Thead>
          <Tbody>
            {data?.items.map((p) => {
              const checked = !!selected[p.id]
              return (
                <Tr key={p.id} bg={checked ? 'red.50' : undefined}>
                  <Td>
                    <Checkbox
                      isChecked={checked}
                      onChange={(e) => toggleOne(p.id, e.target.checked)}
                    />
                  </Td>
                  <Td>
                    <Image
                      src={p.imageUrl}
                      alt={p.title}
                      boxSize="64px"
                      objectFit="cover"
                      borderRadius="md"
                    />
                  </Td>
                  <Td>{p.title}</Td>
                  <Td isNumeric>{p.price.toLocaleString('es-PY')}</Td>
                  <Td>{p.size || '-'}</Td>
                  <Td>{p.condition || '-'}</Td>
                  <Td>
                    <HStack>
                      <IconButton
                        aria-label="Editar"
                        icon={<EditIcon />}
                        size="sm"
                        onClick={() => nav(`/dashboard/editar/${p.id}`)}
                      />
                      <IconButton
                        aria-label="Eliminar"
                        icon={<DeleteIcon />}
                        size="sm"
                        colorScheme="red"
                        onClick={() => {
                          setDeletingOne(p.id)
                          setConfirmOneOpen(true)
                        }}
                      />
                    </HStack>
                  </Td>
                </Tr>
              )
            })}
          </Tbody>
        </Table>
      )}

      {/* Confirmación eliminar UNO */}
      <AlertDialog
        isOpen={confirmOneOpen}
        leastDestructiveRef={undefined}
        onClose={() => setConfirmOneOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Eliminar producto
            </AlertDialogHeader>
            <AlertDialogBody>
              ¿Seguro que querés eliminar este producto?
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button onClick={() => setConfirmOneOpen(false)}>Cancelar</Button>
              <Button colorScheme="red" onClick={onDeleteOne} ml={3}>
                Eliminar
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Confirmación eliminar SELECCIONADOS */}
      <AlertDialog
        isOpen={confirmBulkOpen}
        leastDestructiveRef={undefined}
        onClose={() => setConfirmBulkOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Eliminar seleccionados
            </AlertDialogHeader>
            <AlertDialogBody>
              Vas a eliminar {selectedIds.length} producto(s). Esta acción no se
              puede deshacer.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button onClick={() => setConfirmBulkOpen(false)}>
                Cancelar
              </Button>
              <Button
                colorScheme="red"
                onClick={onBulkDelete}
                isLoading={bulkLoading}
                ml={3}
              >
                Eliminar
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  )
}
