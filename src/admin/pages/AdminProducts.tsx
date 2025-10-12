import {
  bulkDeleteProducts,
  deleteProduct,
  getMyProducts,
} from '@/services/myProducts'
import type { Product } from '@/types/product'
import { publishMissingProducts } from '@/services/instagram'
import { translateKit, translateQuality } from '@/utils/leagues'
import { AddIcon, CloseIcon, DeleteIcon, EditIcon, SearchIcon, ExternalLinkIcon } from '@chakra-ui/icons' // NEW
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Badge,
  Box,
  Button,
  Checkbox,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  Link,
  Select,
  Skeleton,
  SkeletonText,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
  useToast,
  VStack,
} from '@chakra-ui/react'
import { FaInstagram } from 'react-icons/fa'
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

  // Filtros y búsqueda
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [league, setLeague] = useState('')
  const [kit, setKit] = useState('')
  const [quality, setQuality] = useState('')
  const [sortBy, setSortBy] = useState('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Debounce para búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 500)
    return () => clearTimeout(timer)
  }, [search])

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

  // Estados para Instagram
  const [instagramLoading, setInstagramLoading] = useState(false)

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
      const d = await getMyProducts({
        page,
        limit: LIMIT,
        search: debouncedSearch || undefined,
        league: league || undefined,
        kit: kit || undefined,
        quality: quality || undefined,
        sortBy: sortBy || undefined,
        sortOrder,
      })
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

  // Resetear a página 1 cuando cambian los filtros
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, league, kit, quality, sortBy, sortOrder])

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearch, league, kit, quality, sortBy, sortOrder])

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

  // Función auxiliar para obtener URL de Instagram
  const getInstagramUrl = (postId: string) => {
    // Usar el endpoint de la API que redirige al permalink correcto
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || ''
    return `${apiBaseUrl}/api/instagram/permalink/${postId}`
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

  // Función para publicar productos faltantes en Instagram
  async function handlePublishMissing() {
    setInstagramLoading(true)

    try {
      const result = await publishMissingProducts()

      if (result.summary.total === 0) {
        toast({
          title: 'Todo al día',
          description: 'Todos los productos ya están publicados en Instagram',
          status: 'info',
          duration: 5000,
          isClosable: true,
        })
      } else if (result.summary.success > 0) {
        toast({
          title: '¡Publicación exitosa!',
          description: `${result.summary.success} producto(s) publicado(s) en Instagram`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        })
        // Recargar la lista para mostrar los nuevos estados
        load()
      }

      if (result.summary.errors > 0) {
        toast({
          title: 'Algunos errores',
          description: `${result.summary.errors} producto(s) tuvieron errores`,
          status: 'warning',
          duration: 5000,
          isClosable: true,
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'No se pudo publicar en Instagram',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setInstagramLoading(false)
    }
  }

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={4} flexWrap="wrap" gap={3}>
        <Heading size="lg">
          Productos
        </Heading>
        <Button
          leftIcon={<Icon as={FaInstagram} />}
          onClick={handlePublishMissing}
          isLoading={instagramLoading}
          colorScheme="purple"
          size="sm"
        >
          Publicar faltantes en IG
        </Button>
      </Flex>

      {/* Barra de búsqueda y filtros */}
      <Stack spacing={3} mb={4}>
        {/* Búsqueda */}
        <InputGroup size={{ base: 'sm', md: 'md' }}>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Buscar por título o equipo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </InputGroup>

        {/* Filtros y ordenamiento */}
        <Stack direction={{ base: 'column', md: 'row' }} spacing={3}>
          <Select
            placeholder="Todas las ligas"
            value={league}
            onChange={(e) => setLeague(e.target.value)}
            size={{ base: 'sm', md: 'md' }}
          >
            <option value="PREMIER_LEAGUE">Premier League</option>
            <option value="LA_LIGA">La Liga</option>
            <option value="LIGUE_1">Ligue 1</option>
            <option value="SERIE_A">Serie A</option>
            <option value="BUNDESLIGA">Bundesliga</option>
            <option value="LIGA_PROFESIONAL">Liga Profesional</option>
            <option value="INTERNACIONAL">Internacional</option>
            <option value="LIGA_SAUDI">Liga Saudi</option>
          </Select>

          <Select
            placeholder="Todas las equipaciones"
            value={kit}
            onChange={(e) => setKit(e.target.value)}
            size={{ base: 'sm', md: 'md' }}
          >
            <option value="HOME">Local</option>
            <option value="AWAY">Visitante</option>
            <option value="THIRD">Alternativa</option>
            <option value="RETRO">Retro</option>
          </Select>

          <Select
            placeholder="Todas las calidades"
            value={quality}
            onChange={(e) => setQuality(e.target.value)}
            size={{ base: 'sm', md: 'md' }}
          >
            <option value="FAN">Fan</option>
            <option value="PLAYER_VERSION">Versión Jugador</option>
          </Select>

          <Select
            value={`${sortBy}:${sortOrder}`}
            onChange={(e) => {
              const [newSortBy, newSortOrder] = e.target.value.split(':')
              setSortBy(newSortBy)
              setSortOrder(newSortOrder as 'asc' | 'desc')
            }}
            size={{ base: 'sm', md: 'md' }}
          >
            <option value=":desc">Más recientes</option>
            <option value="createdAt:asc">Más antiguos</option>
            <option value="title:asc">Título (A-Z)</option>
            <option value="title:desc">Título (Z-A)</option>
            <option value="basePrice:asc">Precio (menor)</option>
            <option value="basePrice:desc">Precio (mayor)</option>
          </Select>

          {/* Botón para limpiar filtros */}
          {(search || league || kit || quality || sortBy) && (
            <Button
              size={{ base: 'sm', md: 'md' }}
              variant="outline"
              leftIcon={<CloseIcon boxSize={3} />}
              onClick={() => {
                setSearch('')
                setLeague('')
                setKit('')
                setQuality('')
                setSortBy('')
                setSortOrder('desc')
              }}
              flexShrink={0}
              whiteSpace="nowrap"
            >
              Limpiar
            </Button>
          )}
        </Stack>
      </Stack>

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
        <>
          {/* Skeleton para móvil */}
          <Box display={{ base: 'block', md: 'none' }}>
            <Stack spacing={3}>
              {[1, 2, 3].map((i) => (
                <Box key={i} borderWidth="1px" borderRadius="md" p={3}>
                  <HStack align="start" spacing={3}>
                    <Skeleton boxSize="60px" borderRadius="md" />
                    <Box flex="1">
                      <SkeletonText noOfLines={2} spacing="2" />
                      <Skeleton height="20px" width="80px" mt={2} />
                    </Box>
                  </HStack>
                </Box>
              ))}
            </Stack>
          </Box>

          {/* Skeleton para desktop */}
          <Box display={{ base: 'none', md: 'block' }} overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th w="1%"></Th>
                  <Th>Imagen</Th>
                  <Th>Título</Th>
                  <Th isNumeric>Precio</Th>
                  <Th>Equipación</Th>
                  <Th>Tipo</Th>
                  <Th>Instagram</Th>
                  <Th></Th>
                </Tr>
              </Thead>
              <Tbody>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Tr key={i}>
                    <Td>
                      <Skeleton boxSize="16px" />
                    </Td>
                    <Td>
                      <Skeleton boxSize="64px" borderRadius="md" />
                    </Td>
                    <Td>
                      <Skeleton height="16px" width="200px" />
                    </Td>
                    <Td>
                      <Skeleton height="16px" width="80px" />
                    </Td>
                    <Td>
                      <Skeleton height="16px" width="60px" />
                    </Td>
                    <Td>
                      <Skeleton height="16px" width="60px" />
                    </Td>
                    <Td>
                      <Skeleton height="16px" width="60px" />
                    </Td>
                    <Td>
                      <HStack>
                        <Skeleton boxSize="32px" borderRadius="md" />
                        <Skeleton boxSize="32px" borderRadius="md" />
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </>
      ) : !data?.items.length ? (
        // Empty state
        <VStack py={12} spacing={4}>
          <Text fontSize="6xl" opacity={0.3}>
            📦
          </Text>
          <Heading size="md" color="gray.600">
            {search || league || kit || quality
              ? 'No se encontraron productos'
              : 'No hay productos aún'}
          </Heading>
          <Text color="gray.500" textAlign="center" maxW="md">
            {search || league || kit || quality ? (
              <>
                No hay productos que coincidan con los filtros aplicados.
                <br />
                Intentá con otros criterios de búsqueda.
              </>
            ) : (
              'Comenzá agregando tu primer producto para verlo en el catálogo.'
            )}
          </Text>
          {search || league || kit || quality ? (
            <Button
              leftIcon={<CloseIcon />}
              onClick={() => {
                setSearch('')
                setLeague('')
                setKit('')
                setQuality('')
                setSortBy('')
                setSortOrder('desc')
              }}
            >
              Limpiar filtros
            </Button>
          ) : (
            <Button
              as={RouterLink}
              to="/admin/productos/agregar"
              colorScheme="teal"
              leftIcon={<AddIcon />}
            >
              Agregar primer producto
            </Button>
          )}
        </VStack>
      ) : (
        <>
          {/* Vista móvil: Cards */}
          <Box display={{ base: 'block', md: 'none' }}>
            <Stack spacing={3}>
              {data.items.map((p) => {
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
                        bg="white"
                      />
                      <Box flex="1">
                        <Text fontWeight="semibold" fontSize="sm" noOfLines={2}>
                          {p.title}
                        </Text>
                        <Text fontSize="sm" fontWeight="bold" mt={1}>
                          {p.basePrice.toLocaleString('es-PY')}
                        </Text>
                        <HStack fontSize="xs" color="gray.600" mt={1}>
                          <Text>{p.kit ? translateKit(p.kit) : '-'}</Text>
                          <Text>•</Text>
                          <Text>{p.quality ? translateQuality(p.quality) : '-'}</Text>
                        </HStack>
                        {p.instagramPostId && (
                          <Link
                            href={getInstagramUrl(p.instagramPostId)}
                            isExternal
                            mt={1}
                          >
                            <Badge colorScheme="purple" fontSize="xs">
                              <Icon as={FaInstagram} mr={1} />
                              Ver en IG
                            </Badge>
                          </Link>
                        )}
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
                  <Th>Instagram</Th>
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
                          bg="white"
                        />
                      </Td>
                      <Td>{p.title}</Td>
                      <Td isNumeric>{p.basePrice.toLocaleString('es-PY')}</Td>
                      <Td>{p.kit ? translateKit(p.kit) : '-'}</Td>
                      <Td>{p.quality ? translateQuality(p.quality) : '-'}</Td>
                      <Td>
                        {p.instagramPostId ? (
                          <Tooltip label="Ver publicación en Instagram" placement="top">
                            <Link
                              href={getInstagramUrl(p.instagramPostId)}
                              isExternal
                            >
                              <Badge colorScheme="purple" fontSize="xs" cursor="pointer">
                                <Icon as={FaInstagram} mr={1} />
                                Publicado
                                <ExternalLinkIcon ml={1} boxSize={2.5} />
                              </Badge>
                            </Link>
                          </Tooltip>
                        ) : (
                          <Badge colorScheme="gray" fontSize="xs">
                            No publicado
                          </Badge>
                        )}
                      </Td>
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
