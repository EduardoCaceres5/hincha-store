import api from '@/services/api'

export async function uploadImageViaBackend(file: File) {
  const fd = new FormData()
  fd.append('image', file)
  const { data } = await api.post('/api/products/upload', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data as { secure_url: string; public_id: string }
}
