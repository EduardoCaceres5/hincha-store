import { useAuth } from '@/hooks/useAuth'
import { getNavLinks } from '@/nav/links'
import { HamburgerIcon } from '@chakra-ui/icons'
import {
  Button,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  IconButton,
  Stack,
  useDisclosure,
} from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'

export default function MobileMenu() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { token, me, logout } = useAuth()
  const links = getNavLinks(me?.role as any)

  return (
    <>
      <IconButton
        aria-label="Menú"
        icon={<HamburgerIcon />}
        variant="ghost"
        onClick={onOpen}
      />
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Menú</DrawerHeader>
          <DrawerBody>
            <Stack spacing={2}>
              {links.map((l) => (
                <Button
                  key={l.to}
                  as={RouterLink}
                  to={l.to}
                  variant="ghost"
                  onClick={onClose}
                >
                  {l.label}
                </Button>
              ))}
            </Stack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )
}
