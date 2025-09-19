import { useAuth } from '@/hooks/useAuth'
import api from '@/services/api'
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons'
import {
  Box,
  Button,
  Checkbox,
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
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  remember: z.boolean().optional(),
})
type FormData = z.infer<typeof schema>

export default function Login() {
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const toast = useToast()
  const nav = useNavigate()
  const location = useLocation() as any
  const { setToken } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: { remember: true },
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const { email, password, remember } = data
      const { data: resp } = await api.post('/api/auth/login', {
        email,
        password,
      })
      setToken(resp.accessToken, remember)
      toast({
        title: 'Bienvenido',
        status: 'success',
        duration: 2500,
        isClosable: true,
      })
      const to = location.state?.from ?? '/dashboard'
      nav(to, { replace: true })
    } catch (e: any) {
      const msg =
        e?.response?.data?.error === 'INVALID_CREDENTIALS'
          ? 'Credenciales inválidas'
          : 'No se pudo iniciar sesión'
      toast({
        title: 'Error',
        description: msg,
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box maxW="sm" mx="auto">
      <Heading size="lg" mb={4}>
        Ingresar
      </Heading>
      <Stack as="form" spacing={4} onSubmit={handleSubmit(onSubmit)}>
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

        <Checkbox {...register('remember')}>
          Recordarme en este dispositivo
        </Checkbox>

        <Button
          type="submit"
          colorScheme="teal"
          isLoading={loading}
          isDisabled={!isValid}
        >
          Entrar
        </Button>

        <Button as={Link} to="/register" variant="link">
          Crear cuenta
        </Button>
      </Stack>
    </Box>
  )
}
