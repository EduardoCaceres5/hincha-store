import {
  Box,
  Drawer,
  DrawerContent,
  DrawerOverlay,
  Flex,
  HStack,
  Icon,
  IconButton,
  Text,
  useColorModeValue as mode,
  useDisclosure,
} from '@chakra-ui/react'
import { useEffect } from 'react'
import { FiHome, FiMenu, FiPackage, FiShoppingBag } from 'react-icons/fi'
import { NavLink, Outlet, useLocation } from 'react-router-dom'

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
function Sidebar({ onSelect }: { onSelect?: () => void }) {
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
  const location = useLocation()

  // Cierra el drawer automáticamente al cambiar de ruta (mobile)
  useEffect(() => {
    if (isOpen) onClose()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  return (
    <Flex minH="100vh" bg={bg} px={{ base: 0, md: 2 }} py={{ base: 0, md: 2 }}>
      {/* Sidebar desktop fijo */}
      <Box
        display={{ base: 'none', md: 'block' }}
        position="sticky"
        top={{ base: 0, md: 2 }}
        h={{ base: '100vh', md: 'calc(100vh - 1rem)' }}
        borderRightWidth="1px"
        borderColor={border}
        borderRadius={{ base: 'none', md: 'lg' }}
        overflow="hidden"
      >
        <Sidebar />
      </Box>

      {/* Drawer mobile */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="xs">
        <DrawerOverlay />
        <DrawerContent>
          <Sidebar onSelect={onClose} />
        </DrawerContent>
      </Drawer>

      {/* Main */}
      <Box flex="1" display="flex" flexDirection="column" minH="100vh">
        <Flex
          h={14}
          align="center"
          px={4}
          gap={2}
          borderBottomWidth="1px"
          borderColor={border}
        >
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
