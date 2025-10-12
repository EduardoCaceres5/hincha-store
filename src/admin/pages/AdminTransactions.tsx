import {
  bulkDeleteTransactions,
  createTransaction,
  deleteTransaction,
  deleteTransactionImage,
  listTransactions,
  updateTransaction,
  type Transaction,
} from '@/services/transactions'
import { AddIcon, CloseIcon, DeleteIcon, SearchIcon, AttachmentIcon, ViewIcon, EditIcon } from '@chakra-ui/icons'
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
  Divider,
  FormControl,
  FormLabel,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
  useToast,
  Image,
  Badge,
} from '@chakra-ui/react'
import { useEffect, useMemo, useRef, useState } from 'react'

const LIMIT = 12

export default function AdminTransactions() {
  const [data, setData] = useState<{
    items: Transaction[]
    page: number
    limit: number
    total: number
    incomeTotal?: number
    expenseTotal?: number
    balance?: number
  } | null>(null)

  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  // filtros
  const [type, setType] = useState<'INCOME' | 'EXPENSE' | ''>('')
  const [search, setSearch] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [sortBy, setSortBy] = useState<'occurredAt' | 'createdAt' | 'amount'>(
    'occurredAt',
  )
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const selectedIds = useMemo(
    () => Object.keys(selected).filter((id) => selected[id]),
    [selected],
  )
  const allChecked = useMemo(
    () =>
      data?.items.length ? data.items.every((t) => selected[t.id]) : false,
    [data, selected],
  )
  const indeterminate = useMemo(
    () => !!selectedIds.length && !allChecked,
    [selectedIds, allChecked],
  )

  const toast = useToast()
  const cancelOneRef = useRef<HTMLButtonElement>(null)
  const cancelBulkRef = useRef<HTMLButtonElement>(null)

  const [confirmOneOpen, setConfirmOneOpen] = useState(false)
  const [deletingOne, setDeletingOne] = useState<string | null>(null)
  const [confirmBulkOpen, setConfirmBulkOpen] = useState(false)
  const [bulkLoading, setBulkLoading] = useState(false)

  // Modal create/edit
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [mType, setMType] = useState<'INCOME' | 'EXPENSE'>('INCOME')
  const [mDate, setMDate] = useState('')
  const [mAmount, setMAmount] = useState('')
  const [mDesc, setMDesc] = useState('')
  const [mCategory, setMCategory] = useState('')
  const [mImageFiles, setMImageFiles] = useState<File[]>([])
  const [mExistingImages, setMExistingImages] = useState<
    { url: string; id?: string }[]
  >([])
  const [mSaving, setMSaving] = useState(false)

  // Modal de preview de imágenes
  const [previewImages, setPreviewImages] = useState<string[]>([])
  const [previewOpen, setPreviewOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  function openPreview(images: string[], startIndex = 0) {
    setPreviewImages(images)
    setCurrentImageIndex(startIndex)
    setPreviewOpen(true)
  }

  function nextImage() {
    setCurrentImageIndex((prev) => (prev + 1) % previewImages.length)
  }

  function prevImage() {
    setCurrentImageIndex((prev) =>
      prev === 0 ? previewImages.length - 1 : prev - 1,
    )
  }

  async function load() {
    setLoading(true)
    try {
      const d = await listTransactions({
        page,
        limit: LIMIT,
        type: (type || undefined) as any,
        search: search || undefined,
        from: from || undefined,
        to: to || undefined,
        sortBy,
        sortOrder,
      })
      setData(d)
      setSelected((prev) => {
        const next: Record<string, boolean> = {}
        d.items.forEach((t) => {
          if (prev[t.id]) next[t.id] = true
        })
        return next
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setPage(1)
  }, [type, search, from, to, sortBy, sortOrder])

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, type, search, from, to, sortBy, sortOrder])

  const totalPages = useMemo(
    () =>
      data ? Math.max(1, Math.ceil(data.total / (data.limit || LIMIT))) : 1,
    [data],
  )

  function toggleAll() {
    if (!data?.items) return
    const next: Record<string, boolean> = {}
    if (!allChecked) data.items.forEach((t) => (next[t.id] = true))
    setSelected(next)
  }

  function toggleOne(id: string, checked: boolean) {
    setSelected((prev) => ({ ...prev, [id]: checked }))
  }

  async function onDeleteOne() {
    if (!deletingOne) return
    try {
      const wasLastOnPage = (data?.items.length ?? 0) === 1 && page > 1
      await deleteTransaction(deletingOne)
      toast({ title: 'Transacción eliminada', status: 'success' })
      setConfirmOneOpen(false)
      setDeletingOne(null)
      if (wasLastOnPage) setPage((p) => p - 1)
      else load()
    } catch {
      toast({ title: 'No se pudo eliminar', status: 'error' })
    }
  }

  async function onBulkDelete() {
    setBulkLoading(true)
    try {
      const wasWholePage =
        (data?.items.length ?? 0) === selectedIds.length && page > 1
      const { deleted } = await bulkDeleteTransactions(selectedIds)
      toast({ title: `Eliminados: ${deleted}`, status: 'success' })
      setConfirmBulkOpen(false)
      setSelected({})
      if (wasWholePage) setPage((p) => p - 1)
      else load()
    } catch {
      toast({ title: 'No se pudo eliminar la selección', status: 'error' })
    } finally {
      setBulkLoading(false)
    }
  }

  function openCreateModal(kind: 'INCOME' | 'EXPENSE') {
    setEditing(null)
    setMType(kind)
    setMDate(new Date().toISOString().slice(0, 10))
    setMAmount('')
    setMDesc('')
    setMCategory('')
    setMImageFiles([])
    setMExistingImages([])
    setModalOpen(true)
  }

  function openEditModal(t: Transaction) {
    setEditing(t)
    setMType(t.type)
    setMDate(new Date(t.occurredAt).toISOString().slice(0, 10))
    setMAmount(String(t.amount))
    setMDesc(t.description || '')
    setMCategory(t.category || '')
    setMImageFiles([])
    setMExistingImages(
      t.images?.map((img) => ({ url: img.imageUrl, id: img.id })) || [],
    )
    setModalOpen(true)
  }

  async function onSaveModal() {
    const amount = Number(String(mAmount).replace(/\D+/g, ''))
    if (!amount || amount <= 0)
      return toast({ title: 'Monto inválido', status: 'warning' })
    setMSaving(true)
    try {
      if (editing) {
        // Modo edición: actualizar transacción y manejar imágenes
        await updateTransaction(editing.id, {
          type: mType,
          amount,
          description: mDesc || null,
          category: mCategory || null,
          occurredAt: mDate ? new Date(mDate).toISOString() : undefined,
          newImages: mImageFiles.length > 0 ? mImageFiles : undefined,
        })

        // Eliminar imágenes que se quitaron
        const originalImageIds = editing.images?.map((img) => img.id) || []
        const keptImageIds = mExistingImages.map((img) => img.id).filter(Boolean)
        const toDelete = originalImageIds.filter((id) => !keptImageIds.includes(id))

        for (const imageId of toDelete) {
          if (imageId) {
            await deleteTransactionImage(editing.id, imageId)
          }
        }
      } else {
        // Modo creación: enviar todo junto
        await createTransaction({
          type: mType,
          amount,
          description: mDesc || undefined,
          category: mCategory || undefined,
          occurredAt: mDate ? new Date(mDate).toISOString() : undefined,
          images: mImageFiles.length > 0 ? mImageFiles : undefined,
        })
      }

      toast({
        title: editing ? 'Transacción actualizada' : 'Transacción creada',
        status: 'success',
      })
      setModalOpen(false)
      load()
    } catch (err) {
      console.error('Error al guardar transacción:', err)
      toast({ title: 'No se pudo guardar', status: 'error' })
    } finally {
      setMSaving(false)
    }
  }

  return (
    <Box>
      <Stack spacing={3} mb={4} direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'stretch', md: 'start' }}>
        <VStack align="start" spacing={0}>
          <Text fontSize="lg" fontWeight="semibold">
            Transacciones
          </Text>
          {data && (
            <Stack direction={{ base: 'column', sm: 'row' }} color="gray.600" fontSize={{ base: 'xs', md: 'sm' }} spacing={{ base: 1, sm: 2 }}>
              <Text>
                Ingresos: {(data.incomeTotal ?? 0).toLocaleString('es-PY')}
              </Text>
              <Text display={{ base: 'none', sm: 'block' }}>•</Text>
              <Text>
                Egresos: {(data.expenseTotal ?? 0).toLocaleString('es-PY')}
              </Text>
              <Text display={{ base: 'none', sm: 'block' }}>•</Text>
              <Text>
                Balance:{' '}
                {(
                  data.balance ??
                  (data.incomeTotal || 0) - (data.expenseTotal || 0)
                ).toLocaleString('es-PY')}
              </Text>
            </Stack>
          )}
        </VStack>
        <Stack direction={{ base: 'column', sm: 'row' }} spacing={2}>
          <Button
            leftIcon={<AddIcon />}
            colorScheme="teal"
            size={{ base: 'sm', md: 'md' }}
            onClick={() => openCreateModal('INCOME')}
            w={{ base: '100%', sm: 'auto' }}
          >
            Nuevo ingreso
          </Button>
          <Button
            leftIcon={<AddIcon />}
            colorScheme="orange"
            variant="outline"
            size={{ base: 'sm', md: 'md' }}
            onClick={() => openCreateModal('EXPENSE')}
            w={{ base: '100%', sm: 'auto' }}
          >
            Nuevo egreso
          </Button>
        </Stack>
      </Stack>

      {/* filtros */}
      <Stack spacing={3} mb={4}>
        <InputGroup size={{ base: 'sm', md: 'md' }}>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Buscar descripción o categoría"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </InputGroup>
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={3}>
          <Select
            placeholder="Tipo"
            value={type}
            onChange={(e) => setType(e.target.value as any)}
            size={{ base: 'sm', md: 'md' }}
          >
            <option value="INCOME">Ingreso</option>
            <option value="EXPENSE">Egreso</option>
          </Select>
          <Input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            size={{ base: 'sm', md: 'md' }}
          />
          <Input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            size={{ base: 'sm', md: 'md' }}
          />
          <Select
            value={`${sortBy}:${sortOrder}`}
            onChange={(e) => {
              const [sb, so] = e.target.value.split(':') as any
              setSortBy(sb)
              setSortOrder(so)
            }}
            size={{ base: 'sm', md: 'md' }}
          >
            <option value=":desc">Fecha (recientes)</option>
            <option value="occurredAt:asc">Fecha (antiguos)</option>
            <option value="amount:desc">Monto (mayor)</option>
            <option value="amount:asc">Monto (menor)</option>
          </Select>
        </SimpleGrid>
        {(type ||
          search ||
          from ||
          to ||
          sortBy !== 'occurredAt' ||
          sortOrder !== 'desc') && (
          <Button
            size={{ base: 'sm', md: 'md' }}
            variant="outline"
            leftIcon={<CloseIcon boxSize={3} />}
            onClick={() => {
              setType('')
              setSearch('')
              setFrom('')
              setTo('')
              setSortBy('occurredAt')
              setSortOrder('desc')
            }}
          >
            Limpiar
          </Button>
        )}
      </Stack>

      {/* tabla */}
      <Box overflowX="auto">
        <Table size="sm" variant="simple">
          <Thead>
            <Tr>
              <Th w="1%">
                <Checkbox
                  isChecked={allChecked}
                  isIndeterminate={indeterminate}
                  onChange={toggleAll}
                />
              </Th>
              <Th display={{ base: 'none', md: 'table-cell' }}>Comprobantes</Th>
              <Th>Fecha</Th>
              <Th display={{ base: 'none', sm: 'table-cell' }}>Tipo</Th>
              <Th isNumeric>Monto</Th>
              <Th display={{ base: 'none', lg: 'table-cell' }}>Descripción</Th>
              <Th display={{ base: 'none', lg: 'table-cell' }}>Categoría</Th>
              <Th></Th>
            </Tr>
          </Thead>
          <Tbody>
            {loading ? (
              <Tr>
                <Td colSpan={8}>
                  <Text color="gray.500">Cargando…</Text>
                </Td>
              </Tr>
            ) : !data?.items.length ? (
              <Tr>
                <Td colSpan={8}>
                  <Text color="gray.500">Sin resultados</Text>
                </Td>
              </Tr>
            ) : (
              data.items.map((t) => {
                const checked = !!selected[t.id]
                const imageUrls = t.images?.map((img) => img.imageUrl) || []
                return (
                  <Tr key={t.id} bg={checked ? 'red.50' : undefined}>
                    <Td>
                      <Checkbox
                        isChecked={checked}
                        onChange={(e) => toggleOne(t.id, e.target.checked)}
                      />
                    </Td>
                    <Td display={{ base: 'none', md: 'table-cell' }}>
                      {imageUrls.length > 0 ? (
                        <HStack spacing={1}>
                          <Image
                            src={imageUrls[0]}
                            alt="Comprobante"
                            boxSize="48px"
                            objectFit="cover"
                            borderRadius="md"
                            cursor="pointer"
                            onClick={() => openPreview(imageUrls, 0)}
                          />
                          {imageUrls.length > 1 && (
                            <IconButton
                              aria-label="Ver comprobantes"
                              icon={<ViewIcon />}
                              size="xs"
                              variant="outline"
                              onClick={() => openPreview(imageUrls, 0)}
                            />
                          )}
                        </HStack>
                      ) : (
                        <Text color="gray.400" fontSize="xs">
                          Sin comprobantes
                        </Text>
                      )}
                    </Td>
                    <Td fontSize={{ base: 'xs', md: 'sm' }}>
                      <VStack align="start" spacing={0}>
                        <Text>{new Date(t.occurredAt).toLocaleDateString('es-PY')}</Text>
                        <Badge
                          colorScheme={t.type === 'INCOME' ? 'green' : 'red'}
                          fontSize="xs"
                          display={{ base: 'inline-flex', sm: 'none' }}
                        >
                          {t.type === 'INCOME' ? 'Ing' : 'Egr'}
                        </Badge>
                      </VStack>
                    </Td>
                    <Td display={{ base: 'none', sm: 'table-cell' }}>
                      <Badge
                        colorScheme={t.type === 'INCOME' ? 'green' : 'red'}
                        fontSize="xs"
                      >
                        {t.type === 'INCOME' ? 'Ingreso' : 'Egreso'}
                      </Badge>
                    </Td>
                    <Td
                      isNumeric
                      color={t.type === 'INCOME' ? 'green.600' : 'red.600'}
                      fontWeight="semibold"
                      fontSize={{ base: 'xs', md: 'sm' }}
                    >
                      {t.amount.toLocaleString('es-PY')}
                    </Td>
                    <Td maxW="200px" isTruncated display={{ base: 'none', lg: 'table-cell' }}>
                      {t.description || '-'}
                    </Td>
                    <Td display={{ base: 'none', lg: 'table-cell' }}>{t.category || '-'}</Td>
                    <Td>
                      <Stack direction={{ base: 'column', sm: 'row' }} spacing={1}>
                        <IconButton
                          aria-label="Editar"
                          icon={<EditIcon />}
                          size="sm"
                          variant="outline"
                          onClick={() => openEditModal(t)}
                        />
                        <IconButton
                          aria-label="Eliminar"
                          icon={<DeleteIcon />}
                          size="sm"
                          colorScheme="red"
                          onClick={() => {
                            setDeletingOne(t.id)
                            setConfirmOneOpen(true)
                          }}
                        />
                      </Stack>
                    </Td>
                  </Tr>
                )
              })
            )}
          </Tbody>
        </Table>
      </Box>

      {/* acciones inferiores */}
      <Stack mt={4} direction={{ base: 'column', sm: 'row' }} justify="space-between" spacing={3}>
        <Text color="gray.600" fontSize={{ base: 'sm', md: 'md' }}>
          {selectedIds.length
            ? `${selectedIds.length} seleccionadas`
            : 'Seleccioná transacciones para eliminar'}
        </Text>
        <Button
          colorScheme="red"
          leftIcon={<DeleteIcon />}
          onClick={() => setConfirmBulkOpen(true)}
          isDisabled={!selectedIds.length}
          size={{ base: 'sm', md: 'md' }}
          w={{ base: '100%', sm: 'auto' }}
        >
          Eliminar seleccionadas
        </Button>
      </Stack>

      {/* paginación */}
      {data?.total ? (
        <Stack mt={4} direction={{ base: 'column', sm: 'row' }} justify="center" align="center" spacing={2}>
          <HStack spacing={2}>
            <Button size="sm" onClick={() => setPage(1)} isDisabled={page === 1} display={{ base: 'none', md: 'inline-flex' }}>
              « Primero
            </Button>
            <Button
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              isDisabled={page === 1}
            >
              ‹
            </Button>
            <Text fontSize={{ base: 'sm', md: 'md' }} minW="100px" textAlign="center">
              Pág. {page} / {totalPages}
            </Text>
            <Button
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              isDisabled={page >= totalPages}
            >
              ›
            </Button>
            <Button
              size="sm"
              onClick={() => setPage(totalPages)}
              isDisabled={page >= totalPages}
              display={{ base: 'none', md: 'inline-flex' }}
            >
              Última »
            </Button>
          </HStack>
        </Stack>
      ) : null}

      {/* confirm uno */}
      <AlertDialog
        isOpen={confirmOneOpen}
        leastDestructiveRef={cancelOneRef}
        onClose={() => setConfirmOneOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Eliminar transacción
            </AlertDialogHeader>
            <AlertDialogBody>
              ¿Seguro que querés eliminar esta transacción?
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button
                ref={cancelOneRef}
                onClick={() => setConfirmOneOpen(false)}
              >
                Cancelar
              </Button>
              <Button colorScheme="red" onClick={onDeleteOne} ml={3}>
                Eliminar
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* confirm seleccionadas */}
      <AlertDialog
        isOpen={confirmBulkOpen}
        leastDestructiveRef={cancelBulkRef}
        onClose={() => setConfirmBulkOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Eliminar seleccionadas
            </AlertDialogHeader>
            <AlertDialogBody>
              Vas a eliminar {selectedIds.length} transacción(es). Esta acción
              no se puede deshacer.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button
                ref={cancelBulkRef}
                onClick={() => setConfirmBulkOpen(false)}
              >
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

      {/* Modal create/edit */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} isCentered size={{ base: 'full', sm: 'md' }}>
        <ModalOverlay />
        <ModalContent mx={{ base: 0, sm: 4 }}>
          <ModalHeader>
            {editing ? 'Editar transacción' : 'Nueva transacción'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <FormControl>
                <FormLabel>Tipo</FormLabel>
                <Select
                  value={mType}
                  onChange={(e) => setMType(e.target.value as any)}
                  isDisabled={!editing}
                >
                  <option value="INCOME">Ingreso</option>
                  <option value="EXPENSE">Egreso</option>
                </Select>
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Fecha</FormLabel>
                <Input
                  type="date"
                  value={mDate}
                  onChange={(e) => setMDate(e.target.value)}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Monto (Gs)</FormLabel>
                <Input
                  type="number"
                  min={1}
                  step={1000}
                  value={mAmount}
                  onChange={(e) => setMAmount(e.target.value)}
                  placeholder="250000"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Descripción</FormLabel>
                <Input
                  value={mDesc}
                  onChange={(e) => setMDesc(e.target.value)}
                  placeholder="Detalle del movimiento"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Categoría</FormLabel>
                <Input
                  value={mCategory}
                  onChange={(e) => setMCategory(e.target.value)}
                  placeholder="Proveedor, envío, etc."
                />
              </FormControl>
              <Divider />
              <FormControl>
                <FormLabel>
                  Comprobantes (imágenes)
                  <Badge ml={2} colorScheme="gray">
                    {mExistingImages.length + mImageFiles.length}
                  </Badge>
                </FormLabel>

                {/* Imágenes existentes */}
                {mExistingImages.length > 0 && (
                  <VStack align="stretch" spacing={2} mb={3}>
                    <Text fontSize="sm" color="gray.600" fontWeight="semibold">
                      Imágenes actuales:
                    </Text>
                    <SimpleGrid columns={{ base: 2, md: 3 }} spacing={2}>
                      {mExistingImages.map((img, idx) => (
                        <Box
                          key={idx}
                          position="relative"
                          borderRadius="md"
                          overflow="hidden"
                          border="1px solid"
                          borderColor="gray.200"
                        >
                          <Image
                            src={img.url}
                            alt={`Imagen ${idx + 1}`}
                            objectFit="cover"
                            h="100px"
                            w="100%"
                          />
                          <IconButton
                            aria-label="Eliminar imagen"
                            icon={<CloseIcon />}
                            size="xs"
                            colorScheme="red"
                            position="absolute"
                            top={1}
                            right={1}
                            onClick={() => {
                              setMExistingImages((prev) =>
                                prev.filter((_, i) => i !== idx),
                              )
                            }}
                          />
                        </Box>
                      ))}
                    </SimpleGrid>
                  </VStack>
                )}

                {/* Nuevas imágenes a subir */}
                {mImageFiles.length > 0 && (
                  <VStack align="stretch" spacing={2} mb={3}>
                    <Text fontSize="sm" color="gray.600" fontWeight="semibold">
                      Nuevas imágenes:
                    </Text>
                    <SimpleGrid columns={{ base: 2, md: 3 }} spacing={2}>
                      {mImageFiles.map((file, idx) => (
                        <Box
                          key={idx}
                          position="relative"
                          borderRadius="md"
                          overflow="hidden"
                          border="1px solid"
                          borderColor="gray.200"
                        >
                          <Image
                            src={URL.createObjectURL(file)}
                            alt={`Nueva ${idx + 1}`}
                            objectFit="cover"
                            h="100px"
                            w="100%"
                          />
                          <IconButton
                            aria-label="Eliminar imagen"
                            icon={<CloseIcon />}
                            size="xs"
                            colorScheme="red"
                            position="absolute"
                            top={1}
                            right={1}
                            onClick={() => {
                              setMImageFiles((prev) =>
                                prev.filter((_, i) => i !== idx),
                              )
                            }}
                          />
                        </Box>
                      ))}
                    </SimpleGrid>
                  </VStack>
                )}

                {/* Input para agregar imágenes */}
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || [])
                    if (files.length > 0) {
                      setMImageFiles((prev) => [...prev, ...files])
                    }
                    // Limpiar input para permitir re-seleccionar
                    e.target.value = ''
                  }}
                  display="none"
                  id="transaction-images-input"
                />
                <Button
                  as="label"
                  htmlFor="transaction-images-input"
                  leftIcon={<AttachmentIcon />}
                  size="sm"
                  variant="outline"
                  cursor="pointer"
                  w="100%"
                >
                  Agregar imágenes
                </Button>
              </FormControl>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              colorScheme="teal"
              onClick={onSaveModal}
              isLoading={mSaving}
            >
              {editing ? 'Guardar cambios' : 'Crear'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal de preview de imágenes */}
      <Modal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        size="xl"
        isCentered
      >
        <ModalOverlay bg="blackAlpha.800" />
        <ModalContent bg="transparent" boxShadow="none">
          <ModalCloseButton color="white" />
          <ModalBody p={0}>
            <VStack spacing={4}>
              {previewImages.length > 0 && (
                <>
                  <Image
                    src={previewImages[currentImageIndex]}
                    alt={`Comprobante ${currentImageIndex + 1}`}
                    maxH="70vh"
                    objectFit="contain"
                    borderRadius="md"
                  />
                  {previewImages.length > 1 && (
                    <HStack
                      bg="white"
                      px={4}
                      py={2}
                      borderRadius="full"
                      spacing={3}
                    >
                      <IconButton
                        aria-label="Anterior"
                        icon={<CloseIcon transform="rotate(90deg)" />}
                        size="sm"
                        onClick={prevImage}
                        borderRadius="full"
                      />
                      <Text fontSize="sm" fontWeight="semibold">
                        {currentImageIndex + 1} / {previewImages.length}
                      </Text>
                      <IconButton
                        aria-label="Siguiente"
                        icon={<CloseIcon transform="rotate(-90deg)" />}
                        size="sm"
                        onClick={nextImage}
                        borderRadius="full"
                      />
                    </HStack>
                  )}
                </>
              )}
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  )
}
