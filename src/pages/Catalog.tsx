import EmptyState from '@/components/EmptyState'
import ProductGrid from '@/components/ProductGrid'
import { type CatalogFilters, useProducts } from '@/hooks/useProducts'
import { SearchIcon } from '@chakra-ui/icons'
import {
  Box,
  Button,
  Center,
  Heading,
  HStack,
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
      size: sp.get('size') || undefined,
      condition: sp.get('condition') || undefined,
      sort: (sp.get('sort') as CatalogFilters['sort']) || 'createdAt:desc',
    }),
    [],
  )
  const [filters, setFilters] = useState<CatalogFilters>(initialFilters)
  const [page, setPage] = useState<number>(Number(sp.get('page') || 1))
  const limit = 12

  useEffect(() => {
    const q = new URLSearchParams()
    if (filters.search) q.set('search', filters.search)
    if (filters.size) q.set('size', filters.size)
    if (filters.condition) q.set('condition', filters.condition)
    if (filters.sort) q.set('sort', filters.sort)
    q.set('page', String(page))
    setSp(q, { replace: true })
  }, [filters, page, setSp])

  const { data, loading, error } = useProducts(filters, page, limit)

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
  function onSizeChange(v: string) {
    setPage(1)
    setFilters((f) => ({ ...f, size: v || undefined }))
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
          placeholder="Talle"
          defaultValue={filters.size}
          onChange={(e) => onSizeChange(e.target.value)}
          maxW="36"
        >
          <option value="S">S</option>
          <option value="M">M</option>
          <option value="L">L</option>
          <option value="XL">XL</option>
        </Select>
        <Select
          placeholder="Condición"
          defaultValue={filters.condition}
          onChange={(e) => onCondChange(e.target.value)}
          maxW="40"
        >
          <option value="Nuevo">Nuevo</option>
          <option value="Usado">Usado</option>
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
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              isDisabled={page === 1}
            >
              Anterior
            </Button>
            <Text>
              {' '}
              Página {data.page} de {totalPages}{' '}
            </Text>
            <Button
              onClick={() => setPage((p) => (p < totalPages ? p + 1 : p))}
              isDisabled={page >= totalPages}
            >
              Siguiente
            </Button>
          </HStack>
        </>
      )}
    </Box>
  )
}
