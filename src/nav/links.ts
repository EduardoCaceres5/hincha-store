export function getNavLinks(role?: 'user' | 'seller' | 'admin') {
  const base = [
    { to: '/catalogo', label: 'Catálogo' },
    { to: '/publicar', label: 'Publicar', roles: ['seller', 'admin'] as const },
    {
      to: '/dashboard',
      label: 'Dashboard',
      roles: ['seller', 'admin'] as const,
    },
    {
      to: '/vendedor/productos',
      label: 'Mis Productos',
      roles: ['seller', 'admin'] as const,
    },
    {
      to: '/mis-ordenes',
      label: 'Mis órdenes',
      roles: ['user', 'seller', 'admin'] as const,
    },
    {
      to: '/vendedor/ordenes',
      label: 'Órdenes (Vendedor)',
      roles: ['admin'] as const,
    },
    {
      to: '/admin/ordenes',
      label: 'Órdenes (Admin)',
      roles: ['admin'] as const,
    },
  ]
  return base.filter(
    (l) => !l.roles || (role && (l.roles as readonly string[]).includes(role)),
  )
}
