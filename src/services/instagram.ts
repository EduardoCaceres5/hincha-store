// src/services/instagram.ts
import api from './api'

export interface PublishMissingResult {
  productId: string
  title: string
  status: 'success' | 'error' | 'skipped'
  instagramPostId?: string
  error?: string
}

export interface PublishMissingResponse {
  message: string
  summary: {
    total: number
    success: number
    errors: number
    skipped: number
  }
  results: PublishMissingResult[]
}

/**
 * Publica en Instagram solo los productos que no tienen instagramPostId
 */
export async function publishMissingProducts(): Promise<PublishMissingResponse> {
  const response = await api.post<PublishMissingResponse>(
    '/api/admin/instagram/publish-missing'
  )
  return response.data
}
