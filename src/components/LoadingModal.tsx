import logo from '@/assets/hincha-store-logo-mini.png'
import {
  Center,
  Image,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Text,
  VStack,
} from '@chakra-ui/react'

interface LoadingModalProps {
  isOpen: boolean
  message?: string
}

export default function LoadingModal({
  isOpen,
  message = 'Cargando...',
}: LoadingModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}}
      isCentered
      closeOnOverlayClick={false}
    >
      <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(4px)" />
      <ModalContent bg="white" boxShadow="xl" borderRadius="lg" maxW="180px">
        <ModalBody py={4} px={3}>
          <Center>
            <VStack spacing={3}>
              <Image
                src={logo}
                alt="Hincha Store"
                boxSize="45px"
                sx={{
                  '@keyframes spin': {
                    from: { transform: 'rotate(0deg)' },
                    to: { transform: 'rotate(360deg)' },
                  },
                  animation: 'spin 1s linear infinite',
                }}
              />
              <Text fontSize="sm" fontWeight="medium" color="gray.700">
                {message}
              </Text>
            </VStack>
          </Center>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
