export function formatGs(value: number | null | undefined) {
  // Manejar valores inválidos
  if (value === null || value === undefined || isNaN(value)) {
    return 'Gs. 0'
  }

  return new Intl.NumberFormat('es-PY', {
    style: 'currency',
    currency: 'PYG',
    maximumFractionDigits: 0,
  }).format(value)
}
