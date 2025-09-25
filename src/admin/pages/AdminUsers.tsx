import api from '@/services/api'
import { Badge, Box, Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react'
import { useEffect, useState } from 'react'

type Row = {
  id: string
  email: string
  role: 'user' | 'seller' | 'admin'
  createdAt: string
}

export default function AdminUsers() {
  const [items, setItems] = useState<Row[]>([])
  useEffect(() => {
    ;(async () => {
      const { data } = await api.get('/api/admin/users') // crea este endpoint protegido
      setItems(data.items || [])
    })()
  }, [])

  return (
    <Box>
      <Table size="sm">
        <Thead>
          <Tr>
            <Th>Email</Th>
            <Th>Rol</Th>
            <Th>Alta</Th>
          </Tr>
        </Thead>
        <Tbody>
          {items.map((u) => (
            <Tr key={u.id}>
              <Td>{u.email}</Td>
              <Td>
                <Badge>{u.role}</Badge>
              </Td>
              <Td>{new Date(u.createdAt).toLocaleDateString('es-PY')}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  )
}
