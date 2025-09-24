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
import { FiPlusCircle, FiSearch } from 'react-icons/fi'
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
    >
      <Container maxW="container.xl">
        <Stack spacing={5} align="center" textAlign="center">
          <Heading size={{ base: 'lg', md: 'xl' }}>
            Camisetas de hinchas, para hinchas
          </Heading>

          <Text color={subtitleColor} maxW="680px">
            Descubrí camisetas, shorts y equipos de tus clubes favoritos. Comprá
            o vendé en minutos.
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
              leftIcon={<FiPlusCircle />}
              colorScheme="teal"
              onClick={() => nav('/publicar')}
            >
              Vender camiseta
            </Button>

            <Button
              variant="outline"
              colorScheme="teal"
              borderColor={mode('teal.200', 'teal.500')}
              _hover={{ bg: mode('teal.50', 'whiteAlpha.200') }}
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
