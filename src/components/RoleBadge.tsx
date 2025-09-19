import { Badge } from '@chakra-ui/react'

export default function RoleBadge({
  role,
}: {
  role?: 'user' | 'seller' | 'admin'
}) {
  if (!role || role === 'user') return null
  const scheme = role === 'admin' ? 'purple' : 'blue'
  const label = role === 'admin' ? 'ADMIN' : 'VENDEDOR'
  return (
    <Badge ml={2} colorScheme={scheme} fontSize="0.65rem" borderRadius="md">
      {label}
    </Badge>
  )
}
