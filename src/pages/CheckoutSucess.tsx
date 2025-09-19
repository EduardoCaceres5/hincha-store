// src/pages/CheckoutSuccess.tsx
import { Box, Button, Heading, Stack, Text } from '@chakra-ui/react'
import { Link as RouterLink, useSearchParams } from 'react-router-dom'

export default function CheckoutSuccess() {
  const [sp] = useSearchParams()
  const id = sp.get('id')

  return (
    <Box textAlign="center">
      <Heading size="lg" mb={3}>
        ¡Gracias por tu compra!
      </Heading>
      <Stack spacing={4} align="center">
        <Text>Tu orden fue registrada correctamente.</Text>
        {id && (
          <Text color="gray.600">
            Código de orden: <b>{id}</b>
          </Text>
        )}
        <Button as={RouterLink} to="/catalogo" colorScheme="teal">
          Volver al catálogo
        </Button>
      </Stack>
    </Box>
  )
}
