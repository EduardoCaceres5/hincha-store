import { SimpleGrid } from '@chakra-ui/react'
import type { Product } from '@/types/product'
import ProductCard from './ProductCard'

export default function ProductGrid({ products }: { products: Product[] }) {
  return (
    <SimpleGrid
      columns={{ base: 2, sm: 2, md: 3, lg: 4 }}
      spacing={{ base: 3, md: 4 }}
    >
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </SimpleGrid>
  )
}
