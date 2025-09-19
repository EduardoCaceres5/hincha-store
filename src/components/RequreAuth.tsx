import { useAuth } from '@/hooks/useAuth'
import { Center, Spinner } from '@chakra-ui/react'
import { Navigate, useLocation } from 'react-router-dom'

export default function RequireAuth({ children }: { children: JSX.Element }) {
  const { token, loading } = useAuth()
  const loc = useLocation()

  if (loading) {
    return (
      <Center py={10}>
        <Spinner />
      </Center>
    )
  }
  if (!token) {
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />
  }
  return children
}
