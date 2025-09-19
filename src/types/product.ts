export type Product = {
  id: string
  title: string
  price: number
  imageUrl: string
  size?: string
  condition?: 'Nuevo' | 'Usado' | string
  description?: string
  createdAt: string
}

export type ProductVariant = {
  id: string
  option: string
  price?: number | null
  stock: number
}
export type ProductDetail = {
  id: string
  title: string
  price: number
  description?: string | null
  imageUrl: string
  variants: ProductVariant[]
}
