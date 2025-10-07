import EmptyState from '@/components/EmptyState'
import LoadingModal from '@/components/LoadingModal'
import ProductGrid from '@/components/ProductGrid'
import { useProducts, type CatalogFilters } from '@/hooks/useProducts'
import { SearchIcon } from '@chakra-ui/icons'
import {
  Box,
  Button,
  Center,
  HStack,
  Heading,
  Input,
  Select,
  Spinner,
  Text,
  useToast,
} from '@chakra-ui/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

export default function Catalog() {
  const [sp, setSp] = useSearchParams()
  const toast = useToast()
  const initialFilters: CatalogFilters = useMemo(
    () => ({
      search: sp.get('search') || undefined,
      condition: sp.get('condition') || undefined,
      sort: (sp.get('sort') as CatalogFilters['sort']) || 'createdAt:desc',
    }),
    [],
  )
  const [filters, setFilters] = useState<CatalogFilters>(initialFilters)
  const [page, setPage] = useState<number>(Number(sp.get('page') || 1))
  const [isChangingPage, setIsChangingPage] = useState(false)
  const limit = 12

  useEffect(() => {
    const q = new URLSearchParams()
    if (filters.search) q.set('search', filters.search)
    if (filters.condition) q.set('condition', filters.condition)
    if (filters.sort) q.set('sort', filters.sort)
    q.set('page', String(page))
    setSp(q, { replace: true })
  }, [filters, page, setSp])

  const { data, loading, error } = useProducts(filters, page, limit)

  // Resetear el loader cuando termina de cargar y hacer scroll arriba
  useEffect(() => {
    if (!loading && isChangingPage) {
      // Delay mínimo para asegurar que el modal sea visible
      const timer = setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
        setIsChangingPage(false)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [loading, isChangingPage])

  // --- Toast de error (una sola vez por cambio de error) ---
  const lastErrorRef = useRef<any>(null)
  useEffect(() => {
    if (error && error !== lastErrorRef.current) {
      lastErrorRef.current = error
      toast({
        title: 'Error al cargar productos',
        description: 'Reintentá más tarde o ajustá los filtros.',
        status: 'error',
        duration: 3500,
        isClosable: true,
      })
    }
  }, [error, toast])

  // --- Toast de “sin resultados” (cuando termina de cargar y total=0) ---
  const emptyToastShown = useRef(false)
  useEffect(() => {
    if (!loading && data && data.total === 0 && !emptyToastShown.current) {
      emptyToastShown.current = true
      toast({
        title: 'Sin resultados',
        description: 'No encontramos productos para esos filtros.',
        status: 'info',
        duration: 2500,
        isClosable: true,
      })
    }
    // Si luego hay resultados, reseteamos el flag
    if (data && data.total > 0) emptyToastShown.current = false
  }, [loading, data, toast])

  // Handlers
  function onSearchChange(v: string) {
    setPage(1)
    setFilters((f) => ({ ...f, search: v || undefined }))
  }
  function onCondChange(v: string) {
    setPage(1)
    setFilters((f) => ({ ...f, condition: v || undefined }))
  }
  function onSortChange(v: string) {
    setPage(1)
    setFilters((f) => ({ ...f, sort: (v as any) || 'createdAt:desc' }))
  }

  function clearAll() {
    setFilters({ sort: 'createdAt:desc' })
    setPage(1)
    const q = new URLSearchParams()
    q.set('sort', 'createdAt:desc')
    setSp(q, { replace: true })
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1

  return (
    <Box>
      <Heading size="lg" mb={4}>
        Catálogo
      </Heading>

      <HStack spacing={3} mb={4} align="stretch">
        <Input
          defaultValue={filters.search}
          placeholder="Buscar..."
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <Select
          placeholder="Calidad"
          defaultValue={filters.condition}
          onChange={(e) => onCondChange(e.target.value)}
          maxW="40"
        >
          <option value="Fan">Fan</option>
          <option value="Jugador">Versión Jugador</option>
        </Select>
        <Select
          defaultValue={filters.sort}
          onChange={(e) => onSortChange(e.target.value)}
          maxW="44"
        >
          <option value="createdAt:desc">Más recientes</option>
          <option value="price:asc">Precio ↑</option>
          <option value="price:desc">Precio ↓</option>
        </Select>
      </HStack>

      {loading && (
        <Center py={10}>
          <Spinner />
        </Center>
      )}

      {!loading && data && data.total === 0 && (
        <EmptyState
          title="Sin resultados"
          description="No encontramos productos para esos filtros. Probá ajustarlos."
          actionLabel="Limpiar filtros"
          onAction={clearAll}
          icon={<SearchIcon />}
        />
      )}

      {data && data.total > 0 && (
        <>
          <ProductGrid products={data.items} />
          <HStack justify="center" mt={6}>
            <Button
              onClick={() => {
                setIsChangingPage(true)
                setPage((p) => Math.max(1, p - 1))
              }}
              isDisabled={page === 1 || isChangingPage}
            >
              Anterior
            </Button>
            <Text>
              {' '}
              Página {data.page} de {totalPages}{' '}
            </Text>
            <Button
              onClick={() => {
                setIsChangingPage(true)
                setPage((p) => (p < totalPages ? p + 1 : p))
              }}
              isDisabled={page >= totalPages || isChangingPage}
            >
              Siguiente
            </Button>
          </HStack>
        </>
      )}

      {/* Modal de carga al cambiar de página */}
      <LoadingModal isOpen={isChangingPage} message="Cargando productos..." />
    </Box>
  )
}
