import { useAuth } from '@/hooks/useAuth'
import type { JSX } from 'react'
import GuardNotice from './GuardNotice'

export default function RequireRole({
  roles,
  children,
}: {
  roles: Array<'admin' | 'seller'>
  children: JSX.Element
}) {
  const { token, me, loading } = useAuth()
  if (loading) return null
  if (!token)
    return (
      <GuardNotice
        need={roles.includes('admin') ? 'admin' : 'seller_or_admin'}
      />
    )
  if (!me?.role || !roles.includes(me.role as any)) {
    return (
      <GuardNotice
        need={roles.includes('admin') ? 'admin' : 'seller_or_admin'}
      />
    )
  }
  return children
}
