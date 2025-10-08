import { Box, Button, Center, Heading, Stack, Text, useColorModeValue } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { type ReactNode } from 'react'

const MotionStack = motion(Stack)
const MotionBox = motion(Box)

type Props = {
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  icon?: ReactNode
}

export default function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}: Props) {
  const bg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const textColor = useColorModeValue('gray.600', 'gray.400')

  return (
    <Center py={16}>
      <MotionStack
        spacing={6}
        align="center"
        maxW="lg"
        textAlign="center"
        border="2px dashed"
        borderColor={borderColor}
        p={{ base: 8, md: 12 }}
        borderRadius="3xl"
        boxShadow="lg"
        bg={bg}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <MotionBox
          fontSize="6xl"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          {icon}
        </MotionBox>
        <Heading size="lg" fontWeight="bold">
          {title}
        </Heading>
        {description && (
          <Text color={textColor} fontSize="md" lineHeight="tall">
            {description}
          </Text>
        )}
        {actionLabel && onAction && (
          <Button
            onClick={onAction}
            colorScheme="teal"
            size="lg"
            mt={2}
            _hover={{ transform: 'translateY(-2px)', boxShadow: 'xl' }}
            transition="all 0.2s"
          >
            {actionLabel}
          </Button>
        )}
      </MotionStack>
    </Center>
  )
}
