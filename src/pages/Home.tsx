import HeroSection from '@/components/HeroSection'
import HomePromoBanner from '@/components/HomePromoBanner'
import ProductGrid from '@/components/ProductGrid'
import api from '@/services/api'
import type { Product } from '@/types/product'
import {
  Box,
  Button,
  Container,
  Heading,
  HStack,
  SimpleGrid,
  Skeleton,
  Tag,
  Text,
  Wrap,
  WrapItem,
  useColorModeValue as mode,
  Icon,
  VStack,
} from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { FiTrendingUp, FiPackage, FiArrowRight } from 'react-icons/fi'

function SectionHeader({
  title,
  to,
  icon,
  subtitle
}: {
  title: string
  to?: string
  icon?: React.ElementType
  subtitle?: string
}) {
  const subtitleColor = mode('gray.600', 'gray.400')

  return (
    <HStack justify="space-between" mb={6} align="start">
      <VStack align="start" spacing={1}>
        <HStack spacing={2}>
          {icon && <Icon as={icon} boxSize={5} color="teal.500" />}
          <Heading size="lg" fontWeight="bold">{title}</Heading>
        </HStack>
        {subtitle && (
          <Text color={subtitleColor} fontSize="sm">
            {subtitle}
          </Text>
        )}
      </VStack>
      {to && (
        <Button
          as={RouterLink}
          to={to}
          variant="ghost"
          colorScheme="teal"
          rightIcon={<FiArrowRight />}
          size="sm"
        >
          Ver todo
        </Button>
      )}
    </HStack>
  )
}

export default function Home() {
  const nav = useNavigate()
  const [loadingNew, setLoadingNew] = useState(true)
  const [loadingTrend, setLoadingTrend] = useState(true)
  const [news, setNews] = useState<Product[]>([])
  const [trends, setTrends] = useState<Product[]>([])

  const bgColor = mode('gray.50', 'gray.900')
  const categoryBg = mode('white', 'gray.800')
  const categoryHoverBg = mode('gray.100', 'gray.700')
  const categoryBorder = mode('gray.200', 'gray.700')

  const categories = useMemo(
    () => [
      { name: 'Camisetas', emoji: '👕' },
      { name: 'Shorts', emoji: '🩳' },
      { name: 'Entrenamiento', emoji: '⚽' },
      { name: 'Accesorios', emoji: '🎒' },
    ],
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

      {/* Categorías mejoradas */}
      <Box bg={bgColor} py={8}>
        <Container maxW="container.xl">
          <VStack spacing={4} align="start">
            <Heading size="md">Explorar por categoría</Heading>
            <SimpleGrid
              columns={{ base: 2, md: 4 }}
              spacing={4}
              w="full"
            >
              {categories.map((c) => (
                <Box
                  key={c.name}
                  as="button"
                  p={6}
                  bg={categoryBg}
                  borderRadius="xl"
                  borderWidth="1px"
                  borderColor={categoryBorder}
                  _hover={{
                    bg: categoryHoverBg,
                    transform: 'translateY(-2px)',
                    boxShadow: 'lg',
                  }}
                  transition="all 0.2s"
                  onClick={() => nav(`/catalogo?search=${encodeURIComponent(c.name)}`)}
                >
                  <VStack spacing={2}>
                    <Text fontSize="3xl">{c.emoji}</Text>
                    <Text fontWeight="semibold" fontSize="sm">
                      {c.name}
                    </Text>
                  </VStack>
                </Box>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* Nuevos ingresos */}
      <Container maxW="container.xl" py={12}>
        <SectionHeader
          title="Nuevos ingresos"
          subtitle="Las últimas camisetas agregadas a la tienda"
          icon={FiPackage}
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
      <Box bg={bgColor} py={12}>
        <Container maxW="container.xl">
          <SectionHeader
            title="Tendencias"
            subtitle="Los productos más populares del momento"
            icon={FiTrendingUp}
            to="/catalogo?sort=price:desc"
          />
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
      </Box>

      {/* CTA vendedor */}
      <Container maxW="container.xl" py={12}>
        <HomePromoBanner />
      </Container>
    </Box>
  )
}
