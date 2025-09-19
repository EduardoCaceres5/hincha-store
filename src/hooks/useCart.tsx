import { createContext, useContext, useMemo, useState } from 'react'

const KEY = 'hs:cart:v1'

export type CartItem = {
  id: string
  title: string
  price: number
  imageUrl: string
  size?: string | null
  qty: number
  variantId?: string | null
  option?: string | null
}

type CartCtx = {
  items: CartItem[]
  add: (item: Omit<CartItem, 'qty'>, qty?: number) => void
  remove: (id: string) => void
  clear: () => void
  setQty: (id: string, qty: number) => void
  count: number
  subtotal: number
}

const CartContext = createContext<CartCtx | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  // Hidratar de sessionStorage en el primer render
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      if (typeof window === 'undefined') return []
      const raw = window.sessionStorage.getItem(KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })

  // Helper: actualiza con función y persiste
  const update = (fn: (prev: CartItem[]) => CartItem[]) => {
    setItems((prev) => {
      const next = fn(prev)
      try {
        window.sessionStorage.setItem(KEY, JSON.stringify(next))
      } catch {}
      return next
    })
  }

  function add(item: Omit<CartItem, 'qty'>, qty = 1) {
    update((prev) => {
      const idx = prev.findIndex((i) => i.id === item.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = { ...next[idx], qty: Math.min(next[idx].qty + qty, 99) }
        return next
      }
      return [...prev, { ...item, qty: Math.min(qty, 99) }]
    })
  }

  const remove = (id: string) =>
    update((prev) => prev.filter((i) => i.id !== id))
  const clear = () => update(() => [])
  const setQty = (id: string, qty: number) =>
    update((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, qty: Math.max(1, Math.min(qty, 99)) } : i,
      ),
    )

  const count = useMemo(() => items.reduce((a, i) => a + i.qty, 0), [items])
  const subtotal = useMemo(
    () => items.reduce((a, i) => a + i.price * i.qty, 0),
    [items],
  )

  const value = useMemo(
    () => ({ items, add, remove, clear, setQty, count, subtotal }),
    [items, count, subtotal],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
