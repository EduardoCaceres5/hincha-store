// src/components/AppFooter.tsx
import {
  Box,
  Container,
  Divider,
  HStack,
  IconButton,
  Link,
  useColorModeValue as mode,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react'
import { FiGithub, FiMail, FiTwitter } from 'react-icons/fi'
import { Link as RouterLink } from 'react-router-dom'

export default function AppFooter() {
  const pageBg = mode('gray.50', 'gray.900')
  const cardBg = mode('white', 'gray.800')
  const border = mode('gray.200', 'whiteAlpha.300')
  const heading = mode('gray.800', 'gray.100')
  const muted = mode('gray.600', 'gray.400')

  return (
    <Box
      as="footer"
      bg={pageBg}
      mt={12}
      borderTopWidth="1px"
      borderColor={border}
    >
      <Container
        maxW="container.xl"
        px={{ base: 4, md: 6 }}
        py={{ base: 8, md: 10 }}
      >
        {/* Secciones superiores */}
        <Box
          bg={cardBg}
          borderWidth="1px"
          borderColor={border}
          borderRadius="2xl"
          p={{ base: 5, md: 7 }}
        >
          <SimpleGrid
            columns={{ base: 1, sm: 2, md: 3 }}
            spacing={{ base: 6, md: 8 }}
          >
            {/* Marca */}
            <Stack spacing={2}>
              <Text fontWeight="bold" fontSize="lg" color={heading}>
                Hincha Store
              </Text>
              <Text fontSize="sm" color={muted}>
                Mercado para hinchas. Comprá y vendé camisetas, shorts y más.
              </Text>

              {/* Social (se ve lindo en mobile también) */}
              <HStack spacing={2} pt={2}>
                <IconButton
                  aria-label="Contacto por email"
                  as="a"
                  href="mailto:contacto@hincha.store"
                  icon={<FiMail />}
                  variant="ghost"
                  size="sm"
                />
                <IconButton
                  aria-label="GitHub"
                  as="a"
                  href="https://github.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  icon={<FiGithub />}
                  variant="ghost"
                  size="sm"
                />
                <IconButton
                  aria-label="Twitter"
                  as="a"
                  href="https://twitter.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  icon={<FiTwitter />}
                  variant="ghost"
                  size="sm"
                />
              </HStack>
            </Stack>

            {/* Navegación rápida */}
            <Stack spacing={2}>
              <Text fontWeight="semibold" color={heading}>
                Navegación
              </Text>
              <Link as={RouterLink} to="/catalogo" color={muted}>
                Catálogo
              </Link>
              <Link as={RouterLink} to="/publicar" color={muted}>
                Vender camiseta
              </Link>
              <Link as={RouterLink} to="/login" color={muted}>
                Ingresar
              </Link>
              <Link as={RouterLink} to="/carrito" color={muted}>
                Carrito
              </Link>
            </Stack>

            {/* Ayuda / Legales */}
            <Stack spacing={2}>
              <Text fontWeight="semibold" color={heading}>
                Ayuda
              </Text>
              <Link as={RouterLink} to="/soporte" color={muted}>
                Soporte
              </Link>
              <Link as={RouterLink} to="/terminos" color={muted}>
                Términos y condiciones
              </Link>
              <Link as={RouterLink} to="/privacidad" color={muted}>
                Privacidad
              </Link>
            </Stack>
          </SimpleGrid>

          <Divider my={{ base: 5, md: 7 }} borderColor={border} />

          {/* Barra inferior: súper responsive */}
          <Stack
            direction={{ base: 'column', sm: 'row' }}
            spacing={{ base: 2, sm: 4 }}
            align={{ base: 'flex-start', sm: 'center' }}
            justify="space-between"
          >
            <Text fontSize="sm" color={muted}>
              Hincha Store • v{__APP_VERSION__}
            </Text>
            <Text fontSize="sm" color={muted}>
              Powered by Zanka®
            </Text>
          </Stack>
        </Box>
      </Container>
    </Box>
  )
}
