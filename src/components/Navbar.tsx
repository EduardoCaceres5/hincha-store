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
import { FaInstagram } from 'react-icons/fa'
import {
  FiBox,
  FiGrid,
  FiLogOut,
  FiMoon,
  FiPackage,
  FiShoppingCart,
  FiSun,
  FiUser,
} from 'react-icons/fi'
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
      bgColor={useColorModeValue(
        'rgba(255,255,255,0.95)',
        'rgba(26,32,44,0.95)',
      )}
      boxShadow="sm"
    >
      <Flex h={{ base: 16, md: 24 }} align="center" px={{ base: 2, sm: 4, md: 8 }} gap={{ base: 1, sm: 2 }}>
        {/* Mobile menu button */}
        <Show below="md">
          <MobileMenu />
        </Show>

        {/* Logo */}
        <HStack
          as={RouterLink}
          to={me?.role === 'admin' ? '/admin' : '/'}
          spacing={3}
          _hover={{ textDecoration: 'none', transform: 'scale(1.02)' }}
          transition="transform 0.2s"
          flexShrink={1}
          minW={0}
          overflow="hidden"
        >
          <Box
            w={{ base: 32, sm: 40, md: 56 }}
            h={{ base: 8, sm: 10, md: 16 }}
            flexShrink={1}
            minW={0}
          >
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
        <HStack spacing={{ base: 0.5, sm: 1, md: 2 }} align="center" flexShrink={0}>
          <Show above="sm">
            <IconButton
              as="a"
              href="https://www.instagram.com/hinchastore_fut"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              variant="ghost"
              icon={<FaInstagram />}
              h={controlH}
              minH={controlH}
              w={controlH}
              borderRadius="lg"
              _hover={{
                color: '#E1306C',
                transform: 'scale(1.1)',
              }}
              transition="all 0.2s"
            />
          </Show>

          <IconButton
            aria-label="Tema"
            variant="ghost"
            icon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
            onClick={toggleColorMode}
            h={controlH}
            minH={controlH}
            w={controlH}
            minW={controlH}
            borderRadius="lg"
          />

          {/* Checkout */}
          <Box position="relative" flexShrink={0}>
            <IconButton
              aria-label="Carrito"
              variant="ghost"
              icon={<FiShoppingCart />}
              onClick={onOpen} // 👈 ABRE el drawer
              h={controlH}
              minH={controlH}
              w={controlH}
              minW={controlH}
              borderRadius="lg"
            />
            {count > 0 && (
              <Badge
                position="absolute"
                top="0"
                right="0"
                borderRadius="full"
                px={{ base: 1.5, sm: 2 }}
                fontSize={{ base: '0.6rem', sm: '0.7rem' }}
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
                px={{ base: 1, sm: 1.5, md: 3 }}
                bg={useColorModeValue('gray.100', 'gray.700')}
                _hover={{
                  bg: useColorModeValue('gray.200', 'gray.600'),
                }}
                _active={{
                  bg: useColorModeValue('gray.200', 'gray.600'),
                }}
                minW={0}
                maxW={{ base: 'auto', md: 'none' }}
                flexShrink={0}
              >
                <HStack spacing={{ base: 0.5, sm: 1, md: 2 }} overflow="hidden">
                  <Icon
                    as={FiUser}
                    boxSize={{ base: 3.5, sm: 4, md: 5 }}
                    color={useColorModeValue('gray.600', 'gray.400')}
                    flexShrink={0}
                  />
                  <Show above="md">
                    <VStack spacing={0} align="flex-start" overflow="hidden">
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
                    <Box flexShrink={0}>
                      <RoleBadge role={me?.role as any} size="xs" />
                    </Box>
                  </Show>
                </HStack>
              </MenuButton>
              <MenuList py={2} minW="220px">
                {me?.role === 'user' && (
                  <>
                    <MenuItem
                      as={RouterLink}
                      to="/mis-ordenes"
                      icon={<Icon as={FiPackage} />}
                    >
                      Mis pedidos
                    </MenuItem>
                  </>
                )}

                {me?.role === 'admin' && (
                  <>
                    <MenuItem
                      as={RouterLink}
                      to="/admin"
                      icon={<Icon as={FiGrid} />}
                    >
                      Dashboard
                    </MenuItem>
                    <MenuItem
                      as={RouterLink}
                      to="/admin/productos"
                      icon={<Icon as={FiBox} />}
                    >
                      Productos
                    </MenuItem>
                    <MenuItem
                      as={RouterLink}
                      to="/admin/Pedidos"
                      icon={<Icon as={FiPackage} />}
                    >
                      Pedidos
                    </MenuItem>
                  </>
                )}

                {(me?.role === 'user' || me?.role === 'admin') && (
                  <MenuDivider />
                )}

                <MenuItem
                  onClick={logout}
                  icon={<Icon as={FiLogOut} />}
                  color="red.500"
                >
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
