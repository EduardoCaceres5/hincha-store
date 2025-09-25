export function getNavLinks(role?: 'user' | 'seller' | 'admin') {
  const base = [
    { to: '/catalogo', label: 'Catálogo', roles: ['user'] as const },
  ]
  return base.filter(
    (l) => !l.roles || (role && (l.roles as readonly string[]).includes(role)),
  )
}
