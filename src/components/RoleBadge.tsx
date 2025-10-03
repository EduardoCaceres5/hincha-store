import { Badge } from '@chakra-ui/react'

export default function RoleBadge({
  role,
  size = 'md',
}: {
  role?: 'user' | 'seller' | 'admin'
  size?: 'xs' | 'sm' | 'md'
}) {
  if (!role || role === 'user') return null
  const scheme = role === 'admin' ? 'purple' : 'blue'
  const label = role === 'admin' ? 'ADMIN' : 'VENDEDOR'

  const fontSize = {
    xs: '0.55rem',
    sm: '0.6rem',
    md: '0.65rem'
  }[size]

  return (
    <Badge ml={2} colorScheme={scheme} fontSize={fontSize} borderRadius="md">
      {label}
    </Badge>
  )
}
