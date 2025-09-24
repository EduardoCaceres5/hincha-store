const CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME

function isAbsolute(url: string) {
  try {
    const u = new URL(url)
    return !!u.protocol && !!u.host
  } catch {
    return false
  }
}

type TransformOpts = {
  w?: number
  h?: number
  crop?: 'fill' | 'fit' | 'thumb'
  gravity?: 'auto' | 'center' | 'faces'
  formatAuto?: boolean
  qualityAuto?: boolean
}

export function cldUrl(idOrUrl: string, opts: TransformOpts = {}) {
  if (!CLOUD) return idOrUrl // evita romper si falta el env
  if (isAbsolute(idOrUrl)) return idOrUrl

  const {
    w,
    h,
    crop = 'fill',
    gravity = 'auto',
    formatAuto = true,
    qualityAuto = true,
  } = opts

  const parts = []
  if (formatAuto) parts.push('f_auto')
  if (qualityAuto) parts.push('q_auto')
  if (crop) parts.push(`c_${crop}`)
  if (gravity) parts.push(`g_${gravity}`)
  if (w) parts.push(`w_${w}`)
  if (h) parts.push(`h_${h}`)

  const t = parts.join(',')
  return `https://res.cloudinary.com/${CLOUD}/image/upload/${t}/${idOrUrl}`
}
