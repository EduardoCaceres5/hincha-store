import api from '@/services/api'
import { login } from '@/services/auth'
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons'
import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Stack,
  useToast,
} from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'

const schema = z
  .object({
    name: z.string().min(2, 'Mínimo 2 caracteres').max(60, 'Máx. 60'),
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Mínimo 6 caracteres'),
    confirm: z.string().min(6, 'Mínimo 6 caracteres'),
  })
  .refine((data) => data.password === data.confirm, {
    message: 'Las contraseñas no coinciden',
    path: ['confirm'],
  })

type FormData = z.infer<typeof schema>

export default function Register() {
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const toast = useToast()
  const nav = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange', // habilita isValid en tiempo real
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      // 1) Registrar
      await api.post('/api/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password,
      })

      // 2) Login automático
      await login(data.email, data.password)

      // 3) Toast de éxito + redirección
      toast({
        title: 'Cuenta creada',
        description: 'Bienvenido/a. Te llevamos a tu dashboard.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      nav('/dashboard', { replace: true })
    } catch (e: any) {
      const code = e?.response?.data?.error
      const description =
        code === 'EMAIL_IN_USE'
          ? 'Ese email ya está en uso.'
          : 'No se pudo crear la cuenta. Intentá de nuevo.'
      toast({
        title: 'Error al registrar',
        description,
        status: 'error',
        duration: 4000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box maxW="sm" mx="auto">
      <Heading size="lg" mb={4}>
        Crear cuenta
      </Heading>

      <Stack as="form" spacing={4} onSubmit={handleSubmit(onSubmit)}>
        <FormControl isRequired isInvalid={!!errors.name}>
          <FormLabel>Nombre</FormLabel>
          <Input placeholder="Tu nombre" {...register('name')} />
          <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isRequired isInvalid={!!errors.email}>
          <FormLabel>Email</FormLabel>
          <Input
            type="email"
            placeholder="tucorreo@dominio.com"
            {...register('email')}
          />
          <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isRequired isInvalid={!!errors.password}>
          <FormLabel>Contraseña</FormLabel>
          <InputGroup>
            <Input
              type={showPwd ? 'text' : 'password'}
              {...register('password')}
            />
            <InputRightElement>
              <IconButton
                aria-label={
                  showPwd ? 'Ocultar contraseña' : 'Mostrar contraseña'
                }
                variant="ghost"
                size="sm"
                icon={showPwd ? <ViewOffIcon /> : <ViewIcon />}
                onClick={() => setShowPwd((s) => !s)}
              />
            </InputRightElement>
          </InputGroup>
          <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isRequired isInvalid={!!errors.confirm}>
          <FormLabel>Confirmar contraseña</FormLabel>
          <InputGroup>
            <Input
              type={showConfirm ? 'text' : 'password'}
              {...register('confirm')}
            />
            <InputRightElement>
              <IconButton
                aria-label={
                  showConfirm ? 'Ocultar confirmación' : 'Mostrar confirmación'
                }
                variant="ghost"
                size="sm"
                icon={showConfirm ? <ViewOffIcon /> : <ViewIcon />}
                onClick={() => setShowConfirm((s) => !s)}
              />
            </InputRightElement>
          </InputGroup>
          <FormErrorMessage>{errors.confirm?.message}</FormErrorMessage>
        </FormControl>

        <Button
          type="submit"
          colorScheme="teal"
          isLoading={loading}
          isDisabled={!isValid}
        >
          Registrarme
        </Button>
      </Stack>
    </Box>
  )
}
