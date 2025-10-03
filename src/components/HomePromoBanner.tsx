import { Box, Button, Heading, HStack, SimpleGrid, Stack, Text, useColorModeValue as mode } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { FiTruck, FiStar, FiCheck } from 'react-icons/fi'

export default function HomePromoBanner() {
  const nav = useNavigate()

  return (
    <Box
      borderRadius="xl"
      p={{ base: 5, md: 6 }}
      bgGradient={mode(
        'linear(to-r, teal.500, teal.600)',
        'linear(to-r, teal.600, teal.700)'
      )}
      color="white"
    >
      <Stack
        direction={{ base: 'column', md: 'row' }}
        align="center"
        justify="space-between"
        spacing={4}
      >
        {/* Contenido */}
        <Box flex="1">
          <Heading size="md" mb={1}>
            Pasión hincha, calidad premium
          </Heading>
          <Text fontSize="sm" opacity={0.9} mb={2}>
            Diseños exclusivos para verdaderos fanáticos del fútbol
          </Text>
          <SimpleGrid columns={3} spacing={3} maxW={{ base: 'full', md: '420px' }}>
            <HStack spacing={1} align="start">
              <FiCheck size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
              <Text fontSize="xs" opacity={0.85}>
                <Text as="span" fontWeight="bold" display="block">100%</Text>
                Algodón Premium
              </Text>
            </HStack>
            <HStack spacing={1} align="start">
              <FiTruck size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
              <Text fontSize="xs" opacity={0.85}>
                <Text as="span" fontWeight="bold" display="block">Envíos</Text>
                A todo el país
              </Text>
            </HStack>
            <HStack spacing={1} align="start">
              <FiStar size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
              <Text fontSize="xs" opacity={0.85}>
                <Text as="span" fontWeight="bold" display="block">Diseños</Text>
                Exclusivos
              </Text>
            </HStack>
          </SimpleGrid>
        </Box>

        {/* CTA */}
        <Button
          size="md"
          variant="outline"
          borderColor="white"
          color="white"
          _hover={{ bg: 'whiteAlpha.200' }}
          onClick={() => nav('/nosotros')}
          flexShrink={0}
        >
          Conocer más
        </Button>
      </Stack>
    </Box>
  )
}
