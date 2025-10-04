import logo from '@/assets/hincha-store-logo.png'
import { useAuth } from '@/hooks/useAuth'
import {
  Badge,
  Box,
  Button,
  Drawer,
  DrawerContent,
  DrawerOverlay,
  Flex,
  HStack,
  Icon,
  IconButton,
  Image,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Show,
  Spacer,
  Text,
  VStack,
  useColorMode,
  useColorModeValue as mode,
  useDisclosure,
} from '@chakra-ui/react'
import { useEffect } from 'react'
import {
  FiHome,
  FiLogOut,
  FiMenu,
  FiMoon,
  FiPackage,
  FiShoppingBag,
  FiSun,
  FiUser,
} from 'react-icons/fi'
import { NavLink, Outlet, useLocation, Link as RouterLink, useNavigate } from 'react-router-dom'
import RoleBadge from '@/components/RoleBadge'

function SidebarLink({
  to,
  icon,
  children,
  exact = false, // 👈 controla "end"
  onClick,
}: {
  to: string
  icon: any
  children: React.ReactNode
  exact?: boolean
  onClick?: () => void
}) {
  // Hooks aquí arriba (OK)
  const hoverBg = mode('gray.100', 'whiteAlpha.200')
  const activeBg = mode('gray.100', 'whiteAlpha.200')

  return (
    <NavLink
      to={to}
      end={exact}
      style={{ textDecoration: 'none' }}
      onClick={onClick}
    >
      {({ isActive }) => (
        <HStack
          spacing={3}
          px={4}
          py={2.5}
          borderRadius="lg"
          _hover={{ bg: hoverBg }}
          bg={isActive ? activeBg : undefined}
        >
          <Icon as={icon} />
          <Text fontWeight="medium">{children}</Text>
        </HStack>
      )}
    </NavLink>
  )
}
function Sidebar({ onSelect, userName }: { onSelect?: () => void; userName?: string }) {
  const border = mode('gray.200', 'whiteAlpha.300')
  return (
    <Box
      as="nav"
      aria-label="Sidebar"
      w={{ base: 'full', md: 64 }}
      borderRightWidth="1px"
      borderColor={border}
      p={4}
    >
      <Box mb={4}>
        <Text fontWeight="bold" fontSize="lg">
          Hincha Admin
        </Text>
        {userName && (
          <Text fontSize="sm" color="gray.500" mt={1}>
            {userName}
          </Text>
        )}
      </Box>

      <SidebarLink to="/admin" icon={FiHome} exact onClick={onSelect}>
        Dashboard
      </SidebarLink>
      <SidebarLink to="/admin/productos" icon={FiPackage} onClick={onSelect}>
        Productos
      </SidebarLink>
      <SidebarLink to="/admin/pedidos" icon={FiShoppingBag} onClick={onSelect}>
        Pedidos
      </SidebarLink>
    </Box>
  )
}

export default function AdminLayout() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const bg = mode('gray.50', 'gray.900')
  const border = mode('gray.200', 'whiteAlpha.300')
  const headerBg = mode('white', 'gray.900')
  const location = useLocation()
  const navigate = useNavigate()
  const { me, logout } = useAuth()
  const { colorMode, toggleColorMode } = useColorMode()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  // Cierra el drawer automáticamente al cambiar de ruta (mobile)
  useEffect(() => {
    if (isOpen) onClose()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  return (
    <Flex minH="100vh" bg={bg} flexDirection="column">
      {/* Header superior unificado */}
      <Box
        position="sticky"
        top={0}
        zIndex={20}
        bg={headerBg}
        borderBottom="1px"
        borderColor={border}
      >
        <Flex h={{ base: 16, md: 20 }} align="center" px={{ base: 4, md: 6 }}>
          {/* Mobile menu button */}
          <Show below="md">
            <IconButton
              aria-label="Abrir menú"
              variant="ghost"
              icon={<FiMenu />}
              onClick={onOpen}
              mr={2}
            />
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

          <Spacer />

          {/* Acciones derechas */}
          <HStack spacing={2} align="center">
            <IconButton
              aria-label="Tema"
              variant="ghost"
              icon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
              onClick={toggleColorMode}
              h={{ base: 9, md: 10 }}
              minH={{ base: 9, md: 10 }}
              w={{ base: 9, md: 10 }}
              borderRadius="lg"
            />

            {/* Cuenta */}
            <Menu>
              <MenuButton
                as={Button}
                variant="ghost"
                h={{ base: 9, md: 10 }}
                minH={{ base: 9, md: 10 }}
                borderRadius="lg"
                px={{ base: 2, md: 3 }}
                bg={mode('gray.100', 'gray.700')}
                _hover={{
                  bg: mode('gray.200', 'gray.600'),
                }}
                _active={{
                  bg: mode('gray.200', 'gray.600'),
                }}
              >
                <HStack spacing={2}>
                  <Icon
                    as={FiUser}
                    boxSize={{ base: 4, md: 5 }}
                    color={mode('gray.600', 'gray.400')}
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
                <MenuItem
                  as={RouterLink}
                  to="/"
                  icon={<Icon as={FiHome} />}
                >
                  Ir a la tienda
                </MenuItem>
                <MenuItem
                  onClick={handleLogout}
                  icon={<Icon as={FiLogOut} />}
                  color="red.500"
                >
                  Salir
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </Flex>
      </Box>

      <Flex flex="1" px={{ base: 0, md: 2 }} py={{ base: 0, md: 2 }}>
        {/* Sidebar desktop fijo */}
        <Box
          display={{ base: 'none', md: 'block' }}
          position="sticky"
          top={{ base: 0, md: '5.5rem' }}
          h={{ base: '100vh', md: 'calc(100vh - 6.5rem)' }}
          borderRightWidth="1px"
          borderColor={border}
          borderRadius={{ base: 'none', md: 'lg' }}
          overflow="hidden"
        >
          <Sidebar userName={me?.name || me?.email} />
        </Box>

        {/* Drawer mobile */}
        <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="xs">
          <DrawerOverlay />
          <DrawerContent>
            <Sidebar onSelect={onClose} userName={me?.name || me?.email} />
          </DrawerContent>
        </Drawer>

        {/* Main */}
        <Box flex="1" display="flex" flexDirection="column">
          <Box as="main" p={{ base: 4, md: 6 }} flex="1">
            <Outlet />
          </Box>
        </Box>
      </Flex>
    </Flex>
  )
}
