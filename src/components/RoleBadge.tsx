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
    xs: '0.5rem',
    sm: '0.6rem',
    md: '0.65rem'
  }[size]

  const ml = {
    xs: 0.5,
    sm: 1.5,
    md: 2
  }[size]

  const px = {
    xs: 1.5,
    sm: 2,
    md: 2
  }[size]

  return (
    <Badge
      ml={ml}
      px={px}
      colorScheme={scheme}
      fontSize={fontSize}
      borderRadius="md"
      whiteSpace="nowrap"
    >
      {label}
    </Badge>
  )
}
