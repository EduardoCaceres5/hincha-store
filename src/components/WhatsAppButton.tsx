import { Box, Icon, useColorModeValue as mode } from '@chakra-ui/react'
import { FaWhatsapp } from 'react-icons/fa'

export default function WhatsAppButton() {
  const phoneNumber = import.meta.env.VITE_WHATSAPP_PHONE
  const message = '¡Hola! Me gustaría obtener más información sobre los productos.'
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`

  const bgColor = mode('green.500', 'green.400')
  const hoverBg = mode('green.600', 'green.500')

  // No mostrar el botón si no hay número configurado
  if (!phoneNumber) return null

  return (
    <Box
      as="a"
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      position="fixed"
      bottom={{ base: '20px', md: '30px' }}
      right={{ base: '20px', md: '30px' }}
      width={{ base: '56px', md: '60px' }}
      height={{ base: '56px', md: '60px' }}
      backgroundColor={bgColor}
      borderRadius="full"
      display="flex"
      alignItems="center"
      justifyContent="center"
      boxShadow="0 4px 12px rgba(0, 0, 0, 0.15)"
      cursor="pointer"
      transition="all 0.3s"
      zIndex={1000}
      _hover={{
        backgroundColor: hoverBg,
        transform: 'scale(1.1)',
        boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
      }}
      _active={{
        transform: 'scale(0.95)',
      }}
    >
      <Icon as={FaWhatsapp} boxSize={{ base: '30px', md: '32px' }} color="white" />
    </Box>
  )
}
