import type { League } from '@/types/product'
import { getLeagueBadge, translateLeague } from '@/utils/leagues'
import { Box, Image } from '@chakra-ui/react'

interface LeagueBadgeProps {
  league: League
  size?: 'xs' | 'sm' | 'md' | 'lg'
}

const SIZES = {
  xs: { container: '32px', image: '40px' },
  sm: { container: '50px', image: '65px' },
  md: { container: '64px', image: '80px' },
  lg: { container: '80px', image: '100px' },
}

export default function LeagueBadge({ league, size = 'sm' }: LeagueBadgeProps) {
  const badgeUrl = getLeagueBadge(league)

  if (!badgeUrl) return null

  const { container, image } = SIZES[size]

  return (
    <Box
      position="absolute"
      top={{ base: 2, md: 4 }}
      right={{ base: 2, md: 4 }}
      bg="white"
      borderRadius="full"
      boxShadow="lg"
      w={container}
      h={container}
      display="flex"
      alignItems="center"
      justifyContent="center"
      overflow="hidden"
    >
      <Image
        src={badgeUrl}
        alt={translateLeague(league)}
        boxSize={image}
        objectFit="contain"
      />
    </Box>
  )
}
