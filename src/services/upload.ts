import api from '@/services/api'

// Subir imagen genérica
// NOTA: El backend espera que las imágenes ya estén subidas
// Esta es una función temporal hasta que se implemente un endpoint dedicado
export async function uploadImageViaBackend(file: File): Promise<{ secure_url: string; public_id: string }> {
  const fd = new FormData()
  fd.append('image', file)

  const { data } = await api.post('/api/upload', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

  return {
    secure_url: data.secure_url,
    public_id: data.public_id,
  }
}
