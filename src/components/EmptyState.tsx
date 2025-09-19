import { Box, Button, Center, Heading, Stack, Text } from '@chakra-ui/react'
import { type ReactNode } from 'react'

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
  return (
    <Center py={16}>
      <Stack
        spacing={4}
        align="center"
        maxW="lg"
        textAlign="center"
        border="1px"
        borderColor="gray.200"
        p={10}
        borderRadius="2xl"
        boxShadow="sm"
        bg="white"
      >
        <Box fontSize="5xl">{icon}</Box>
        <Heading size="md">{title}</Heading>
        {description && <Text color="gray.600">{description}</Text>}
        {actionLabel && onAction && (
          <Button onClick={onAction} colorScheme="teal">
            {actionLabel}
          </Button>
        )}
      </Stack>
    </Center>
  )
}
