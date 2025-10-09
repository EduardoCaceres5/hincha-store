import {
  Box,
  Container,
  Divider,
  Heading,
  Icon,
  SimpleGrid,
  Stack,
  Text,
  VStack,
  useColorModeValue as mode,
} from '@chakra-ui/react'
import { useEffect } from 'react'
import {
  FiCheck,
  FiHeart,
  FiPackage,
  FiShield,
  FiStar,
  FiTruck,
} from 'react-icons/fi'

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: any
  title: string
  description: string
}) {
  const cardBg = mode('white', 'gray.800')
  const borderColor = mode('gray.200', 'gray.700')

  return (
    <Box
      p={6}
      bg={cardBg}
      borderRadius="xl"
      borderWidth="1px"
      borderColor={borderColor}
    >
      <Icon as={icon} boxSize={8} color="teal.500" mb={3} />
      <Heading size="sm" mb={2}>
        {title}
      </Heading>
      <Text fontSize="sm" color={mode('gray.600', 'gray.400')}>
        {description}
      </Text>
    </Box>
  )
}

function ValueItem({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <Box>
      <Heading size="sm" mb={1}>
        {title}
      </Heading>
      <Text fontSize="sm" color={mode('gray.600', 'gray.400')}>
        {description}
      </Text>
    </Box>
  )
}

export default function About() {
  const bgColor = mode('gray.50', 'gray.900')

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <Box>
      {/* Hero Section */}
      <Box
        py={{ base: 8, md: 12 }}
        bgGradient={mode(
          'linear(to-r, teal.500, teal.600)',
          'linear(to-r, teal.600, teal.700)',
        )}
        color="white"
        borderRadius="xl"
        mb={8}
      >
        <Container maxW="container.lg">
          <VStack spacing={4} textAlign="center">
            <Heading size={{ base: 'lg', md: 'xl' }}>
              Pasión hincha, calidad premium
            </Heading>
            <Text fontSize={{ base: 'md', md: 'lg' }} maxW="2xl" opacity={0.95}>
              Somos una marca dedicada a los verdaderos fanáticos del fútbol.
              Tenemos camisetas y equipos deportivos con diseños exclusivos y la
              mejor calidad para que lleves tus colores con orgullo.
            </Text>
          </VStack>
        </Container>
      </Box>

      {/* Nuestra Misión */}
      <Container maxW="container.lg" mb={12}>
        <VStack spacing={6} align="start">
          <Heading size="lg">Nuestra Misión</Heading>
          <Text fontSize="md" color={mode('gray.700', 'gray.300')}>
            En Hincha Store, creemos que cada camiseta cuenta una historia.
            Nuestra misión es ofrecer productos de la más alta calidad que
            representen la pasión y el orgullo de ser hincha. Trabajamos con
            materiales premium y diseños exclusivos para que puedas expresar tu
            amor por el fútbol de la mejor manera.
          </Text>
        </VStack>
      </Container>

      {/* Por qué elegirnos */}
      <Box bg={bgColor} py={12} mb={12} borderRadius="xl">
        <Container maxW="container.lg">
          <Heading size="lg" mb={8} textAlign="center">
            ¿Por qué elegirnos?
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            <FeatureCard
              icon={FiCheck}
              title="Calidad Premium"
              description="100% algodón de primera calidad. Costuras reforzadas y acabados profesionales en cada prenda."
            />
            <FeatureCard
              icon={FiTruck}
              title="Envíos a todo el país"
              description="Llega a tu casa estés donde estés. Envíos rápidos y seguros con seguimiento en tiempo real."
            />
            <FeatureCard
              icon={FiStar}
              title="Diseños Exclusivos"
              description="Creaciones únicas que no encontrarás en otro lado. Ediciones limitadas y diseños personalizados."
            />
            <FeatureCard
              icon={FiHeart}
              title="Hecho con pasión"
              description="Cada producto es creado por hinchas, para hinchas. Entendemos lo que significa llevar los colores."
            />
            <FeatureCard
              icon={FiShield}
              title="Garantía de satisfacción"
              description="Si no estás 100% satisfecho, te devolvemos tu dinero. Tu confianza es nuestra prioridad."
            />
            <FeatureCard
              icon={FiPackage}
              title="Atención personalizada"
              description="Nuestro equipo está disponible para ayudarte en cada paso de tu compra."
            />
          </SimpleGrid>
        </Container>
      </Box>

      {/* Nuestros Valores */}
      <Container maxW="container.lg" mb={12}>
        <Heading size="lg" mb={8}>
          Nuestros Valores
        </Heading>
        <Stack spacing={6}>
          <ValueItem
            title="Calidad ante todo"
            description="No transigimos en calidad. Cada producto pasa por controles rigurosos para garantizar que cumpla con nuestros altos estándares."
          />
          <Divider />
          <ValueItem
            title="Pasión por el fútbol"
            description="El fútbol es más que un deporte, es una forma de vida. Compartimos la pasión de nuestros clientes y la reflejamos en cada diseño."
          />
          <Divider />
          <ValueItem
            title="Compromiso con el cliente"
            description="Tu satisfacción es nuestro éxito. Trabajamos constantemente para mejorar tu experiencia de compra."
          />
          <Divider />
          <ValueItem
            title="Innovación constante"
            description="Siempre buscamos nuevas formas de sorprenderte con diseños frescos y productos innovadores."
          />
        </Stack>
      </Container>

      {/* Cómo funciona */}
      <Box bg={bgColor} py={12} borderRadius="xl">
        <Container maxW="container.lg">
          <Heading size="lg" mb={8} textAlign="center">
            ¿Cómo funciona?
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
            <VStack spacing={3}>
              <Box
                bg="teal.500"
                color="white"
                borderRadius="full"
                w={12}
                h={12}
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontWeight="bold"
                fontSize="xl"
              >
                1
              </Box>
              <Heading size="sm">Explorá el catálogo</Heading>
              <Text
                fontSize="sm"
                textAlign="center"
                color={mode('gray.600', 'gray.400')}
              >
                Navegá por nuestra colección de camisetas y encontrá la que
                representa tu pasión.
              </Text>
            </VStack>

            <VStack spacing={3}>
              <Box
                bg="teal.500"
                color="white"
                borderRadius="full"
                w={12}
                h={12}
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontWeight="bold"
                fontSize="xl"
              >
                2
              </Box>
              <Heading size="sm">Hacé tu pedido</Heading>
              <Text
                fontSize="sm"
                textAlign="center"
                color={mode('gray.600', 'gray.400')}
              >
                Seleccioná tu talle, agregá al carrito y completá tu compra de
                forma segura.
              </Text>
            </VStack>

            <VStack spacing={3}>
              <Box
                bg="teal.500"
                color="white"
                borderRadius="full"
                w={12}
                h={12}
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontWeight="bold"
                fontSize="xl"
              >
                3
              </Box>
              <Heading size="sm">Recibilo en tu casa</Heading>
              <Text
                fontSize="sm"
                textAlign="center"
                color={mode('gray.600', 'gray.400')}
              >
                Tu pedido llega rápido y seguro. ¡Listo para lucir tus colores!
              </Text>
            </VStack>
          </SimpleGrid>
        </Container>
      </Box>
    </Box>
  )
}
