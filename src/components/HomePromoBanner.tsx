import { Box, Button, Heading, Stack, Text } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'

export default function HomePromoBanner() {
  const nav = useNavigate()
  return (
    <Box
      borderRadius="2xl"
      p={{ base: 6, md: 8 }}
      bgGradient="linear(to-r, teal.500, teal.400)"
      color="white"
    >
      <Stack
        direction={{ base: 'column', md: 'row' }}
        align="center"
        justify="space-between"
        spacing={4}
      >
        <Box>
          <Heading size="md">¿Tenés algo para vender?</Heading>
          <Text opacity={0.95}>
            Publicá tu camiseta en minutos y llegá a más hinchas.
          </Text>
        </Box>
        <Button
          size="lg"
          colorScheme="blackAlpha"
          onClick={() => nav('/publicar')}
        >
          Publicar ahora
        </Button>
      </Stack>
    </Box>
  )
}
