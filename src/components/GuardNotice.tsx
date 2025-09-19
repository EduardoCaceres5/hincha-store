import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
} from '@chakra-ui/react'

export default function GuardNotice({
  need = 'admin',
}: {
  need: 'admin' | 'seller' | 'seller_or_admin'
}) {
  const title =
    need === 'admin'
      ? 'Acceso solo para administradores'
      : need === 'seller'
        ? 'Acceso solo para vendedores'
        : 'Acceso solo para vendedores o administradores'

  const desc =
    need === 'admin'
      ? 'No tenés permisos para ver esta sección. Contactá a un administrador.'
      : need === 'seller'
        ? 'Convertí tu cuenta a vendedor o solicitá permisos.'
        : 'Necesitás rol de vendedor o administrador para acceder.'

  return (
    <Alert status="warning" borderRadius="lg">
      <AlertIcon />
      <AlertTitle mr={2}>{title}</AlertTitle>
      <AlertDescription>{desc}</AlertDescription>
    </Alert>
  )
}
