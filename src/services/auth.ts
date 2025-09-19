import api from '@/services/api'

export async function login(email: string, password: string) {
  const { data } = await api.post('/api/auth/login', { email, password })
  localStorage.setItem('accessToken', data.accessToken)
  return data
}
export function logout() {
  localStorage.removeItem('accessToken')
}
export function getToken() {
  return localStorage.getItem('accessToken')
}
