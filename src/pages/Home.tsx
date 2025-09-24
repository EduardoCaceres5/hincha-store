import HomePromoBanner from '@/components/HomePromoBanner'
import ProductGrid from '@/components/ProductGrid'
import api from '@/services/api'
import {
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  Skeleton,
  Stack,
  Tag,
  Text,
  Wrap,
  WrapItem,
} from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import { FiPlusCircle, FiSearch } from 'react-icons/fi'
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
      <Box
        bgGradient="linear(to-b, teal.50, white)"
        py={{ base: 8, md: 14 }}
        borderBottom="1px solid"
        borderColor="gray.100"
      >
        <Container maxW="container.xl">
          <Stack spacing={5} align="center" textAlign="center">
            <Heading size={{ base: 'lg', md: 'xl' }}>
              Camisetas de Hinchas, para Hinchas
            </Heading>
            <Text color="gray.600" maxW="680px">
              Descubrí camisetas, shorts y equipos de tus clubes favoritos.
              Comprá o vendé en minutos.
            </Text>

            <InputGroup maxW="640px">
              <InputLeftElement pointerEvents="none">
                <Icon as={FiSearch} />
              </InputLeftElement>
              <Input
                bg="white"
                size="lg"
                placeholder="Buscar por club, jugador o temporada…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    nav(`/catalogo?search=${encodeURIComponent(q)}`)
                  }
                }}
              />
            </InputGroup>

            <Wrap spacing={2} justify="center">
              {quickTags.map((t) => (
                <WrapItem key={t}>
                  <Tag
                    size="md"
                    variant="subtle"
                    colorScheme="teal"
                    cursor="pointer"
                    onClick={() =>
                      nav(`/catalogo?search=${encodeURIComponent(t)}`)
                    }
                  >
                    {t}
                  </Tag>
                </WrapItem>
              ))}
            </Wrap>

            <HStack spacing={3} pt={2}>
              <Button
                leftIcon={<FiPlusCircle />}
                colorScheme="teal"
                onClick={() => nav('/publicar')}
              >
                Vender una camiseta
              </Button>
              <Button variant="outline" onClick={() => nav('/catalogo')}>
                Ver catálogo
              </Button>
            </HStack>
          </Stack>
        </Container>
      </Box>

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
      <Box bg="gray.50" py={10} mt={6}>
        <Container maxW="container.lg">
          <HomePromoBanner />
        </Container>
      </Box>
    </Box>
  )
}
