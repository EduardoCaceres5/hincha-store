import {
  Box,
  Container,
  HStack,
  Stack,
  Text,
  useColorModeValue as mode,
} from '@chakra-ui/react'

export default function AppFooter() {
  const border = mode('gray.200', 'whiteAlpha.300')
  const text = mode('gray.600', 'gray.400')

  return (
    <Box as="footer" borderTopWidth="1px" borderColor={border} py={4} mt={8}>
      <Container maxW="container.xl">
        <Stack
          direction={{ base: 'column', sm: 'row' }}
          spacing={{ base: 2, sm: 4 }}
          align={{ base: 'flex-start', sm: 'center' }}
          justify="space-between"
        >
          <Text color={text}>Hincha Store • v{__APP_VERSION__}</Text>
          <HStack spacing={2}>
            <Text color={text}>Desarrrollado por Zanka®</Text>
          </HStack>
        </Stack>
      </Container>
    </Box>
  )
}
