import logo from '@/assets/hincha-store-logo.png'
import CartDrawer from '@/components/CartDrawer'
import RoleBadge from '@/components/RoleBadge'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'
import { getNavLinks } from '@/nav/links'
import {
  Badge,
  Box,
  Button,
  Link as ChakraLink,
  Flex,
  HStack,
  IconButton,
  Image,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Show,
  Spacer,
  useColorMode,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react'
import { FiMoon, FiShoppingCart, FiSun } from 'react-icons/fi'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import MobileMenu from './Navbarmobile'

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  const { pathname } = useLocation()
  const active = pathname === to
  const color = useColorModeValue(
    active ? 'teal.600' : 'inherit',
    active ? 'teal.300' : 'inherit',
  )
  const hover = useColorModeValue('gray.100', 'gray.700')
  return (
    <ChakraLink
      as={RouterLink}
      to={to}
      px={3}
      py={2}
      borderRadius="md"
      fontWeight={active ? 'semibold' : 'medium'}
      color={color}
      _hover={{ textDecoration: 'none', bg: hover }}
    >
      {children}
    </ChakraLink>
  )
}

export default function Navbar() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { count } = useCart()
  const { token, me, loading, logout } = useAuth()
  const { colorMode, toggleColorMode } = useColorMode()
  const bg = useColorModeValue('white', 'gray.900')
  const border = useColorModeValue('gray.200', 'gray.700')
  const links = getNavLinks(me?.role as any)

  return (
    <Box
      position="sticky"
      top={0}
      zIndex={10}
      bg={bg}
      borderBottom="1px"
      borderColor={border}
    >
      <Flex h={{ base: 16, md: 20 }} align="center" px={{ base: 4, md: 6 }}>
        {/* Mobile menu button */}
        <Show below="md">
          <MobileMenu />
        </Show>

        {/* Logo */}
        <HStack
          as={RouterLink}
          to="/"
          spacing={3}
          _hover={{ textDecoration: 'none' }}
          flexShrink={0}
        >
          <Box w={{ base: 44, md: 52 }} h={{ base: 12, md: 14 }}>
            <Image
              src={logo}
              alt="Hincha Store"
              w="100%"
              h="100%"
              objectFit="contain"
              draggable={false}
              display="block"
            />
          </Box>
        </HStack>

        {/* Links (desktop) */}
        <Show above="md">
          <HStack as="nav" spacing={1} ml={6}>
            {links.map((l) => (
              <NavLink key={l.to} to={l.to}>
                {l.label}
              </NavLink>
            ))}
          </HStack>
        </Show>

        <Spacer />

        {/* Acciones derechas */}
        <HStack spacing={2}>
          <IconButton
            aria-label="Tema"
            variant="ghost"
            icon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
            onClick={toggleColorMode}
          />

          {/* Checkout */}
          <Box position="relative">
            <IconButton
              aria-label="Carrito"
              variant="ghost"
              icon={<FiShoppingCart />}
              onClick={onOpen} // 👈 ABRE el drawer
            />
            {count > 0 && (
              <Badge
                position="absolute"
                top="0"
                right="0"
                borderRadius="full"
                px={2}
                fontSize="0.7rem"
                colorScheme="teal"
                transform="translate(35%, -35%)"
              >
                {count}
              </Badge>
            )}
          </Box>

          {/* Cuenta */}
          {loading ? null : token ? (
            <Menu>
              <MenuButton as={Button} variant="ghost">
                {me?.name || me?.email}
                <RoleBadge role={me?.role as any} />
              </MenuButton>
              <MenuList>
                <MenuItem as={RouterLink} to="/mis-ordenes">
                  Mis órdenes
                </MenuItem>
                {(me?.role === 'seller' || me?.role === 'admin') && (
                  <>
                    <MenuItem as={RouterLink} to="/dashboard">
                      Dashboard
                    </MenuItem>
                    <MenuItem as={RouterLink} to="/vendedor/productos">
                      Mis productos
                    </MenuItem>
                    <MenuItem as={RouterLink} to="/vendedor/ordenes">
                      Órdenes (Vendedor)
                    </MenuItem>
                  </>
                )}
                {me?.role === 'admin' && (
                  <MenuItem as={RouterLink} to="/admin/ordenes">
                    Órdenes (Admin)
                  </MenuItem>
                )}
                <MenuItem onClick={logout}>Salir</MenuItem>
              </MenuList>
            </Menu>
          ) : (
            <>
              <Button as={RouterLink} to="/login" colorScheme="teal">
                Ingresar
              </Button>
            </>
          )}
        </HStack>
      </Flex>

      <CartDrawer isOpen={isOpen} onClose={onClose} />
    </Box>
  )
}
