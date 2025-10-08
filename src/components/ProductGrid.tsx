import { SimpleGrid } from '@chakra-ui/react'
import type { Product } from '@/types/product'
import { motion } from 'framer-motion'
import ProductCard from './ProductCard'

const MotionDiv = motion.div

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export default function ProductGrid({ products }: { products: Product[] }) {
  return (
    <SimpleGrid
      as={motion.div}
      variants={container}
      initial="hidden"
      animate="show"
      columns={{ base: 2, sm: 2, md: 3, lg: 4 }}
      spacing={{ base: 3, md: 4 }}
    >
      {products.map((p) => (
        <MotionDiv key={p.id} variants={item}>
          <ProductCard product={p} />
        </MotionDiv>
      ))}
    </SimpleGrid>
  )
}
