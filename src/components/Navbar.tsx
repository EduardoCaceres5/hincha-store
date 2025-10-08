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
  Icon,
  IconButton,
  Image,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Show,
  Spacer,
  Text,
  VStack,
  useBreakpointValue,
  useColorMode,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react'
import { FiMoon, FiShoppingCart, FiSun, FiUser, FiPackage, FiGrid, FiBox, FiLogOut } from 'react-icons/fi'
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

  const controlH = useBreakpointValue({ base: 9, md: 10 })

  return (
    <Box
      position="sticky"
      top={0}
      zIndex={10}
      bg={bg}
      borderBottom="1px"
      borderColor={border}
      backdropFilter="blur(10px)"
      bgColor={useColorModeValue('rgba(255,255,255,0.95)', 'rgba(26,32,44,0.95)')}
      boxShadow="sm"
    >
      <Flex h={{ base: 16, md: 24 }} align="center" px={{ base: 4, md: 8 }}>
        {/* Mobile menu button */}
        <Show below="md">
          <MobileMenu />
        </Show>

        {/* Logo */}
        <HStack
          as={RouterLink}
          to="/"
          spacing={3}
          _hover={{ textDecoration: 'none', transform: 'scale(1.02)' }}
          transition="transform 0.2s"
          flexShrink={0}
        >
          <Box w={{ base: 40, md: 56 }} h={{ base: 10, md: 16 }}>
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
        <HStack spacing={2} align="center">
          <IconButton
            aria-label="Tema"
            variant="ghost"
            icon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
            onClick={toggleColorMode}
            h={controlH}
            minH={controlH}
            w={controlH}
            borderRadius="lg"
          />

          {/* Checkout */}
          <Box position="relative">
            <IconButton
              aria-label="Carrito"
              variant="ghost"
              icon={<FiShoppingCart />}
              onClick={onOpen} // 👈 ABRE el drawer
              h={controlH}
              minH={controlH}
              w={controlH}
              borderRadius="lg"
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
              <MenuButton
                as={Button}
                variant="ghost"
                h={controlH}
                minH={controlH}
                borderRadius="lg"
                px={{ base: 2, md: 3 }}
                bg={useColorModeValue('gray.100', 'gray.700')}
                _hover={{
                  bg: useColorModeValue('gray.200', 'gray.600'),
                }}
                _active={{
                  bg: useColorModeValue('gray.200', 'gray.600'),
                }}
              >
                <HStack spacing={2}>
                  <Icon
                    as={FiUser}
                    boxSize={{ base: 4, md: 5 }}
                    color={useColorModeValue('gray.600', 'gray.400')}
                  />
                  <Show above="md">
                    <VStack spacing={0} align="flex-start">
                      <Text
                        fontSize="sm"
                        fontWeight="medium"
                        lineHeight="1.2"
                        noOfLines={1}
                        maxW="150px"
                      >
                        {me?.name || me?.email}
                      </Text>
                      <Box ml={-2}>
                        <RoleBadge role={me?.role as any} size="sm" />
                      </Box>
                    </VStack>
                  </Show>
                  <Show below="md">
                    <RoleBadge role={me?.role as any} size="xs" />
                  </Show>
                </HStack>
              </MenuButton>
              <MenuList py={2} minW="220px">
                {me?.role === 'user' && (
                  <>
                    <MenuItem as={RouterLink} to="/mis-ordenes" icon={<Icon as={FiPackage} />}>
                      Mis pedidos
                    </MenuItem>
                  </>
                )}

                {me?.role === 'admin' && (
                  <>
                    <MenuItem as={RouterLink} to="/admin" icon={<Icon as={FiGrid} />}>
                      Dashboard
                    </MenuItem>
                    <MenuItem as={RouterLink} to="/admin/productos" icon={<Icon as={FiBox} />}>
                      Productos
                    </MenuItem>
                    <MenuItem as={RouterLink} to="/admin/Pedidos" icon={<Icon as={FiPackage} />}>
                      Pedidos
                    </MenuItem>
                  </>
                )}

                {(me?.role === 'user' || me?.role === 'admin') && <MenuDivider />}

                <MenuItem onClick={logout} icon={<Icon as={FiLogOut} />} color="red.500">
                  Salir
                </MenuItem>
              </MenuList>
            </Menu>
          ) : null}
        </HStack>
      </Flex>

      <CartDrawer isOpen={isOpen} onClose={onClose} />
    </Box>
  )
}
