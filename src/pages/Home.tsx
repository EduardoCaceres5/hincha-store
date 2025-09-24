import HeroSection from '@/components/HeroSection'
import HomePromoBanner from '@/components/HomePromoBanner'
import ProductGrid from '@/components/ProductGrid'
import api from '@/services/api'
import {
  Box,
  Button,
  Container,
  Heading,
  HStack,
  SimpleGrid,
  Skeleton,
  Tag,
  Wrap,
  WrapItem,
} from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'

type Product = {
  id: string
  title: string
  price: number
  imageUrl: string
  size?: string | null
  condition?: string | null
  createdAt: string
}

function SectionHeader({ title, to }: { title: string; to?: string }) {
  return (
    <HStack justify="space-between" mb={3}>
      <Heading size="md">{title}</Heading>
      {to && (
        <Button as={RouterLink} to={to} variant="link" colorScheme="teal">
          Ver todo →
        </Button>
      )}
    </HStack>
  )
}

export default function Home() {
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const [loadingNew, setLoadingNew] = useState(true)
  const [loadingTrend, setLoadingTrend] = useState(true)
  const [news, setNews] = useState<Product[]>([])
  const [trends, setTrends] = useState<Product[]>([])

  // Sugerencias rápidas (chips)
  const quickTags = useMemo(
    () => ['Albirroja', 'Boca', 'Real Madrid', 'Libertad', 'Inter', 'Retro'],
    [],
  )
  const categories = useMemo(
    () => ['Camisetas', 'Shorts', 'Entrenamiento', 'Accesorios'],
    [],
  )

  useEffect(() => {
    let cancel = false
    ;(async () => {
      try {
        setLoadingNew(true)
        const { data } = await api.get<{ items: Product[] }>('/api/products', {
          params: { sort: 'createdAt:desc', limit: 12 },
        })
        if (!cancel) setNews(data.items || [])
      } finally {
        if (!cancel) setLoadingNew(false)
      }
    })()
    ;(async () => {
      try {
        setLoadingTrend(true)
        // de momento usamos price:desc como “tendencia”; cambia cuando tengas métrica real
        const { data } = await api.get<{ items: Product[] }>('/api/products', {
          params: { sort: 'price:desc', limit: 8 },
        })
        if (!cancel) setTrends(data.items || [])
      } finally {
        if (!cancel) setLoadingTrend(false)
      }
    })()
    return () => {
      cancel = true
    }
  }, [])

  return (
    <Box>
      {/* Hero */}
      <HeroSection />

      {/* Categorías / filtros rápidos */}
      <Container maxW="container.xl" py={6}>
        <Wrap spacing={3}>
          {categories.map((c) => (
            <WrapItem key={c}>
              <Tag
                size="lg"
                colorScheme="gray"
                variant="subtle"
                cursor="pointer"
                onClick={() => nav(`/catalogo?search=${encodeURIComponent(c)}`)}
              >
                {c}
              </Tag>
            </WrapItem>
          ))}
        </Wrap>
      </Container>

      {/* Nuevos ingresos */}
      <Container maxW="container.xl" py={4}>
        <SectionHeader
          title="Nuevos ingresos"
          to="/catalogo?sort=createdAt:desc"
        />
        {loadingNew ? (
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} height="320px" borderRadius="xl" />
            ))}
          </SimpleGrid>
        ) : (
          <ProductGrid products={news} />
        )}
      </Container>

      {/* Tendencias */}
      <Container maxW="container.xl" py={8}>
        <SectionHeader title="Tendencias" to="/catalogo?sort=price:desc" />
        {loadingTrend ? (
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} height="320px" borderRadius="xl" />
            ))}
          </SimpleGrid>
        ) : (
          <ProductGrid products={trends} />
        )}
      </Container>

      {/* CTA vendedor */}
      <Box py={10} mt={6}>
        <Container maxW="container.lg">
          <HomePromoBanner />
        </Container>
      </Box>
    </Box>
  )
}
