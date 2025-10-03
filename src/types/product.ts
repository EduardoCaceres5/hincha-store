// --- Enums ---
export type KitType = 'HOME' | 'AWAY' | 'THIRD' | 'RETRO'
export type ProductQuality = 'FAN' | 'PLAYER_VERSION'

// --- Imágenes ---
export interface ProductImage {
  id: string
  productId: string
  imageUrl: string
  imagePublicId?: string | null
  order: number
  createdAt: string
}

// --- Variantes ---
export interface ProductVariant {
  id: string
  productId: string
  name: string // ej: "S", "M", "L", "Única"
  sku?: string | null
  stock: number
  price?: number | null // override opcional de basePrice
  imageUrl?: string | null
}

// --- Producto ---
export interface Product {
  id: string
  title: string
  description?: string | null

  // Precios
  basePrice: number
  ProductVariant: ProductVariant[]

  // Metadatos nuevos
  seasonLabel?: string | null // ej: "2024/2025"
  seasonStart?: number | null // ej: 2024
  kit?: KitType | null // ej: HOME / AWAY / THIRD / RETRO
  quality?: ProductQuality | null // FAN o PLAYER_VERSION

  // Imágenes
  imageUrl: string // imagen principal (legacy/fallback)
  imagePublicId?: string | null
  ProductImage?: ProductImage[] // múltiples imágenes

  // Auditoría
  ownerId: string
  createdAt: string // ISO string (conviene tipar como string si llega vía API)
  updatedAt: string
}
