import { SimpleGrid } from '@chakra-ui/react'
import ProductCard, { type Product } from './ProductCard'

export default function ProductGrid({ products }: { products: Product[] }) {
  return (
    <SimpleGrid columns={{ base: 2, sm: 2, md: 3, lg: 4 }} spacing={4}>
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </SimpleGrid>
  )
}
