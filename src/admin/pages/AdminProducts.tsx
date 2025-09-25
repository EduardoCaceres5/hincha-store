import api from '@/services/api'
import {
  Box,
  Button,
  HStack,
  IconButton,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi'

type Row = { id: string; title: string; price: number; createdAt: string }

export default function AdminProducts() {
  const [items, setItems] = useState<Row[]>([])
  async function load() {
    const { data } = await api.get('/api/products', { params: { limit: 50 } })
    setItems(data.items || [])
  }
  useEffect(() => {
    load()
  }, [])

  return (
    <Box>
      <HStack justify="space-between" mb={3}>
        <Button
          leftIcon={<FiPlus />}
          as="a"
          href="/publicar"
          colorScheme="teal"
        >
          Nuevo producto
        </Button>
      </HStack>

      <Table size="sm">
        <Thead>
          <Tr>
            <Th>Título</Th>
            <Th>Precio</Th>
            <Th>Fecha</Th>
            <Th></Th>
          </Tr>
        </Thead>
        <Tbody>
          {items.map((p) => (
            <Tr key={p.id}>
              <Td>{p.title}</Td>
              <Td>{p.price.toLocaleString('es-PY')}</Td>
              <Td>{new Date(p.createdAt).toLocaleDateString('es-PY')}</Td>
              <Td>
                <HStack>
                  <IconButton
                    aria-label="Editar"
                    icon={<FiEdit2 />}
                    size="sm"
                  />
                  <IconButton
                    aria-label="Eliminar"
                    icon={<FiTrash2 />}
                    size="sm"
                    colorScheme="red"
                  />
                </HStack>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  )
}
