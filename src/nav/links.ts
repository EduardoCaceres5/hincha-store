export function getNavLinks(role?: 'user' | 'seller' | 'admin') {
  const base = [
    { to: '/catalogo', label: 'Catálogo' },
    { to: '/nosotros', label: 'Nosotros' },
    { to: '/publicar', label: 'Publicar', roles: [] as const },
    {
      to: '/dashboard',
      label: 'Dashboard',
      roles: [] as const,
    },
    {
      to: '/vendedor/productos',
      label: 'Mis Productos',
      roles: [] as const,
    },
    {
      to: '/mis-ordenes',
      label: 'Mis órdenes',
      roles: ['user'] as const,
    },
    {
      to: '/vendedor/ordenes',
      label: 'Órdenes (Vendedor)',
      roles: [] as const,
    },
    {
      to: '/admin/ordenes',
      label: 'Órdenes (Admin)',
      roles: [] as const,
    },
  ]
  return base.filter(
    (l) => !l.roles || (role && (l.roles as readonly string[]).includes(role)),
  )
}
