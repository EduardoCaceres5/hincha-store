import {
  Box,
  Card,
  CardBody,
  CardHeader,
  SimpleGrid,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react'

export default function AdminDashboard() {
  return (
    <Box>
      <SimpleGrid columns={{ base: 1, md: 4 }} gap={4} mb={6}>
        <Stat as={Card} p={4}>
          <StatLabel>Ventas hoy</StatLabel>
          <StatNumber>Gs. 2.450.000</StatNumber>
          <StatHelpText>+12% vs. ayer</StatHelpText>
        </Stat>
        <Stat as={Card} p={4}>
          <StatLabel>Pedidos pendientes</StatLabel>
          <StatNumber>8</StatNumber>
          <StatHelpText>—</StatHelpText>
        </Stat>
        <Stat as={Card} p={4}>
          <StatLabel>Productos activos</StatLabel>
          <StatNumber>132</StatNumber>
          <StatHelpText>+3 hoy</StatHelpText>
        </Stat>
        <Stat as={Card} p={4}>
          <StatLabel>Usuarios</StatLabel>
          <StatNumber>1.204</StatNumber>
          <StatHelpText>+5 nuevos</StatHelpText>
        </Stat>
      </SimpleGrid>

      <Card>
        <CardHeader>Pedidos recientes</CardHeader>
        <CardBody>
          <Table size="sm">
            <Thead>
              <Tr>
                <Th>Pedido</Th>
                <Th>Cliente</Th>
                <Th>Estado</Th>
                <Th isNumeric>Total</Th>
              </Tr>
            </Thead>
            <Tbody>
              <Tr>
                <Td>#ORD-00123</Td>
                <Td>Juan Pérez</Td>
                <Td>pending</Td>
                <Td isNumeric>450.000</Td>
              </Tr>
            </Tbody>
          </Table>
        </CardBody>
      </Card>
    </Box>
  )
}
