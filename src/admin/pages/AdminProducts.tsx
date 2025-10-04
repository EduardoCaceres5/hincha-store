import {
  bulkDeleteProducts,
  deleteProduct,
  getMyProducts,
} from '@/services/myProducts'
import type { Product } from '@/types/product'
import { AddIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons' // NEW
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
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Link as RouterLink,
  useNavigate,
  useSearchParams,
} from 'react-router-dom'

const LIMIT = 12

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
    [selectedIds, allChecked],
  )

  const [confirmOneOpen, setConfirmOneOpen] = useState(false)
  const [deletingOne, setDeletingOne] = useState<string | null>(null)

  const [confirmBulkOpen, setConfirmBulkOpen] = useState(false)
  const [bulkLoading, setBulkLoading] = useState(false)

  const toast = useToast()
  const nav = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const cancelOneRef = useRef<HTMLButtonElement>(null)
  const cancelBulkRef = useRef<HTMLButtonElement>(null)

  // Leer ?page al montar
  useEffect(() => {
    const q = Number(searchParams.get('page') || '1')
    if (!Number.isNaN(q) && q > 0 && q !== page) setPage(q)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Escribir ?page cuando cambia
  useEffect(() => {
    setSearchParams((prev) => {
      const sp = new URLSearchParams(prev)
      if (page > 1) sp.set('page', String(page))
      else sp.delete('page')
      return sp
    })
  }, [page, setSearchParams])

  async function load() {
    setLoading(true)
    try {
      const d = await getMyProducts(page, LIMIT)
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

  const totalPages = useMemo(
    () => (data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1),
    [data],
  )

  function goToPage(n: number) {
    setPage((prev) => {
      const target = Math.max(1, Math.min(n, totalPages || 1))
      return target === prev ? prev : target
    })
  }

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
      // Si es el último de la página y hay páginas previas, retrocedemos
      const wasLastOnPage = (data?.items.length ?? 0) === 1 && page > 1

      await deleteProduct(deletingOne)
      toast({
        title: 'Producto eliminado',
        status: 'success',
        duration: 2500,
        isClosable: true,
      })
      setConfirmOneOpen(false)
      setDeletingOne(null)

      if (wasLastOnPage) {
        setPage((p) => p - 1) // disparará load()
      } else {
        load()
      }
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
      const wasWholePage =
        (data?.items.length ?? 0) === selectedIds.length && page > 1

      const { deleted } = await bulkDeleteProducts(selectedIds)
      toast({
        title: `Eliminados: ${deleted}`,
        status: 'success',
        duration: 2500,
        isClosable: true,
      })
      setConfirmBulkOpen(false)
      setSelected({})

      if (wasWholePage) {
        setPage((p) => p - 1)
      } else {
        load()
      }
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
        Productos
      </Heading>

      {/* Barra de acciones */}
      <Stack
        direction={{ base: 'column', md: 'row' }}
        justify="space-between"
        mb={3}
        spacing={3}
      >
        <HStack spacing={3} flexWrap="wrap">
          {/* NEW: botón agregar producto */}
          <Button
            as={RouterLink}
            to={`/admin/productos/agregar`}
            colorScheme="teal"
            leftIcon={<AddIcon />}
            size={{ base: 'sm', md: 'md' }}
          >
            Agregar producto
          </Button>
          <Text color="gray.600" fontSize={{ base: 'sm', md: 'md' }}>
            {selectedIds.length
              ? `${selectedIds.length} seleccionados`
              : 'Seleccioná productos para acciones masivas'}
          </Text>
        </HStack>

        <Button
          colorScheme="red"
          leftIcon={<DeleteIcon />}
          onClick={() => setConfirmBulkOpen(true)}
          isDisabled={!selectedIds.length}
          size={{ base: 'sm', md: 'md' }}
        >
          Eliminar seleccionados
        </Button>
      </Stack>

      {loading ? (
        <HStack py={8} justify="center">
          <Spinner />
        </HStack>
      ) : (
        <>
          {/* Vista móvil: Cards */}
          <Box display={{ base: 'block', md: 'none' }}>
            <Stack spacing={3}>
              {data?.items.map((p) => {
                const checked = !!selected[p.id]
                return (
                  <Box
                    key={p.id}
                    borderWidth="1px"
                    borderRadius="md"
                    p={3}
                    bg={checked ? 'red.50' : undefined}
                  >
                    <HStack align="start" spacing={3}>
                      <Checkbox
                        isChecked={checked}
                        onChange={(e) => toggleOne(p.id, e.target.checked)}
                      />
                      <Image
                        src={p.imageUrl}
                        alt={p.title}
                        boxSize="60px"
                        objectFit="cover"
                        borderRadius="md"
                      />
                      <Box flex="1">
                        <Text fontWeight="semibold" fontSize="sm" noOfLines={2}>
                          {p.title}
                        </Text>
                        <Text fontSize="sm" fontWeight="bold" mt={1}>
                          {p.basePrice.toLocaleString('es-PY')}
                        </Text>
                        <HStack fontSize="xs" color="gray.600" mt={1}>
                          <Text>{p.kit || '-'}</Text>
                          <Text>•</Text>
                          <Text>{p.quality || '-'}</Text>
                        </HStack>
                      </Box>
                      <HStack>
                        <IconButton
                          aria-label="Editar"
                          icon={<EditIcon />}
                          size="sm"
                          onClick={() => nav(`/admin/editar/${p.id}`)}
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
                    </HStack>
                  </Box>
                )
              })}
            </Stack>
          </Box>

          {/* Vista desktop: Tabla */}
          <Box display={{ base: 'none', md: 'block' }} overflowX="auto">
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
                  <Th>Equipación</Th>
                  <Th>Tipo</Th>
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
                      <Td isNumeric>{p.basePrice.toLocaleString('es-PY')}</Td>
                      <Td>{p.kit || '-'}</Td>
                      <Td>{p.quality || '-'}</Td>
                      <Td>
                        <HStack>
                          <IconButton
                            aria-label="Editar"
                            icon={<EditIcon />}
                            size="sm"
                            onClick={() => nav(`/admin/editar/${p.id}`)}
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
          </Box>

          {/* Barra de paginación */}
          {data?.total ? (
            <Stack
              mt={4}
              direction={{ base: 'column', md: 'row' }}
              justify="space-between"
              align="center"
              spacing={3}
            >
              <Text color="gray.600" fontSize={{ base: 'sm', md: 'md' }}>
                Mostrando {(page - 1) * (data?.limit ?? LIMIT) + 1}–
                {Math.min(page * (data?.limit ?? LIMIT), data.total)} de{' '}
                {data.total}
              </Text>
              <HStack flexWrap="wrap" justify="center">
                <Button
                  size="sm"
                  onClick={() => goToPage(1)}
                  isDisabled={page === 1}
                  display={{ base: 'none', md: 'inline-flex' }}
                >
                  « Primero
                </Button>
                <Button
                  size="sm"
                  onClick={() => goToPage(page - 1)}
                  isDisabled={page === 1}
                >
                  ‹ Anterior
                </Button>
                <Text fontSize={{ base: 'sm', md: 'md' }}>
                  Página {page} / {totalPages}
                </Text>
                <Button
                  size="sm"
                  onClick={() => goToPage(page + 1)}
                  isDisabled={page >= totalPages}
                >
                  Siguiente ›
                </Button>
                <Button
                  size="sm"
                  onClick={() => goToPage(totalPages)}
                  isDisabled={page >= totalPages}
                  display={{ base: 'none', md: 'inline-flex' }}
                >
                  Última »
                </Button>
              </HStack>
            </Stack>
          ) : null}
        </>
      )}

      {/* Confirmación eliminar UNO */}
      <AlertDialog
        isOpen={confirmOneOpen}
        leastDestructiveRef={cancelOneRef}
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
        leastDestructiveRef={cancelBulkRef}
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
