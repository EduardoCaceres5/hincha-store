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
  useColorModeValue as mode,
  Stack,
  Tag,
  Text,
  Wrap,
  WrapItem,
} from '@chakra-ui/react'
import { useMemo, useState } from 'react'
import { FiSearch } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'

export default function HeroSection() {
  const nav = useNavigate()
  const [q, setQ] = useState('')

  const quickTags = useMemo(
    () => ['Albirroja', 'Boca', 'Real Madrid', 'Libertad', 'Inter', 'Retro'],
    [],
  )

  const borderColor = mode('gray.100', 'whiteAlpha.200')
  const subtitleColor = mode('gray.600', 'gray.300')
  const inputBg = mode('white', 'whiteAlpha.100')
  const inputBorder = mode('gray.200', 'whiteAlpha.300')
  const inputHover = mode('gray.300', 'whiteAlpha.400')
  const iconColor = mode('gray.500', 'gray.400')
  const placeholder = mode('gray.500', 'gray.400')
  const textColor = mode('gray.900', 'gray.100')

  return (
    <Box
      py={{ base: 8, md: 14 }}
      borderBottomWidth="1px"
      borderColor={borderColor}
      position="relative"
      overflow="hidden"
    >
      {/* Pattern de fondo con iconos de camisetas */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        opacity={mode(0.08, 0.05)}
        pointerEvents="none"
      >
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="shirt-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              {/* Camiseta de fútbol con cuello en V */}
              <g transform="translate(25, 15)">
                {/* Mangas */}
                <path
                  d="M5 8 L0 12 L0 22 L5 20 L10 18 L10 10 Z"
                  fill="currentColor"
                  opacity="0.5"
                />
                <path
                  d="M45 8 L50 12 L50 22 L45 20 L40 18 L40 10 Z"
                  fill="currentColor"
                  opacity="0.5"
                />
                {/* Cuerpo principal */}
                <path
                  d="M10 10 L15 5 L20 3 L25 3 L30 3 L35 5 L40 10 L40 55 L10 55 Z"
                  fill="currentColor"
                  opacity="0.6"
                />
                {/* Cuello en V */}
                <path
                  d="M20 3 L25 15 L30 3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                  opacity="0.7"
                />
              </g>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#shirt-pattern)" />
        </svg>
      </Box>

      <Container maxW="container.xl" position="relative" zIndex={1}>
        <Stack spacing={5} align="center" textAlign="center">
          <Heading size={{ base: 'lg', md: 'xl' }}>
            Camisetas de hinchas, para hinchas
          </Heading>

          <Text color={subtitleColor} maxW="680px">
            Descubrí camisetas, shorts y equipos de tus clubes favoritos. Comprá
            en minutos.
          </Text>

          <InputGroup maxW="640px">
            <InputLeftElement pointerEvents="none">
              <Icon as={FiSearch} color={iconColor} />
            </InputLeftElement>
            <Input
              bg={inputBg}
              borderColor={inputBorder}
              _hover={{ borderColor: inputHover }}
              _focus={{
                borderColor: mode('teal.500', 'teal.300'),
                boxShadow: mode(
                  '0 0 0 1px var(--chakra-colors-teal-500)',
                  '0 0 0 1px var(--chakra-colors-teal-300)',
                ),
              }}
              color={textColor}
              _placeholder={{ color: placeholder }}
              size="lg"
              placeholder="Buscar por club, jugador o temporada…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter')
                  nav(`/catalogo?search=${encodeURIComponent(q)}`)
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
              leftIcon={<FiSearch />}
              colorScheme="teal"
              onClick={() => nav('/catalogo')}
            >
              Ver catálogo
            </Button>
          </HStack>
        </Stack>
      </Container>
    </Box>
  )
}
