import {
  Box,
  Drawer,
  DrawerContent,
  Flex,
  HStack,
  Icon,
  IconButton,
  useColorModeValue as mode,
  Text,
  useDisclosure,
} from '@chakra-ui/react'
import {
  FiHome,
  FiMenu,
  FiPackage,
  FiShoppingBag,
  FiUsers,
} from 'react-icons/fi'
import { NavLink, Outlet } from 'react-router-dom'

function SidebarLink({ to, icon, children }: any) {
  const active = ({ isActive }: any) =>
    isActive ? { bg: mode('gray.100', 'whiteAlpha.200') } : undefined
  return (
    <NavLink to={to} style={{ textDecoration: 'none' }}>
      {({ isActive }) => (
        <HStack
          spacing={3}
          px={4}
          py={2.5}
          borderRadius="lg"
          _hover={{ bg: mode('gray.100', 'whiteAlpha.200') }}
          bg={isActive ? mode('gray.100', 'whiteAlpha.200') : undefined}
        >
          <Icon as={icon} />
          <Text fontWeight="medium">{children}</Text>
        </HStack>
      )}
    </NavLink>
  )
}

function Sidebar() {
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
      <Text fontWeight="bold" fontSize="lg" mb={4}>
        Hincha Admin
      </Text>
      <SidebarLink to="/admin" icon={FiHome}>
        Dashboard
      </SidebarLink>
      <SidebarLink to="/admin/pedidos" icon={FiShoppingBag}>
        Pedidos
      </SidebarLink>
      <SidebarLink to="/admin/productos" icon={FiPackage}>
        Productos
      </SidebarLink>
      <SidebarLink to="/admin/usuarios" icon={FiUsers}>
        Usuarios
      </SidebarLink>
    </Box>
  )
}

export default function AdminLayout() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const bg = mode('gray.50', 'gray.900')

  return (
    <Flex minH="100vh" bg={bg}>
      {/* Sidebar desktop */}
      <Box display={{ base: 'none', md: 'block' }}>
        <Sidebar />
      </Box>

      {/* Drawer mobile */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="xs">
        <DrawerContent>
          <Sidebar />
        </DrawerContent>
      </Drawer>

      {/* Main */}
      <Box flex="1" display="flex" flexDirection="column">
        <Flex h={14} align="center" px={4} gap={2} borderBottomWidth="1px">
          <IconButton
            display={{ base: 'inline-flex', md: 'none' }}
            aria-label="Abrir menú"
            variant="ghost"
            icon={<FiMenu />}
            onClick={onOpen}
          />
          <Text fontWeight="semibold">Panel administrativo</Text>
        </Flex>
        <Box as="main" p={{ base: 4, md: 6 }} flex="1">
          <Outlet />
        </Box>
      </Box>
    </Flex>
  )
}
