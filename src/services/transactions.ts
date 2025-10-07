import api from '@/services/api'

export type TransactionType = 'INCOME' | 'EXPENSE'

export type TransactionImage = {
  id: string
  transactionId: string
  imageUrl: string
  imagePublicId?: string | null
  order: number
  createdAt: string
}

export type Transaction = {
  id: string
  userId: string
  type: TransactionType
  amount: number
  description?: string | null
  category?: string | null
  occurredAt: string
  createdAt: string
  images?: TransactionImage[]
  // deprecated (mantener por compatibilidad)
  receiptUrl?: string | null
}

export type ListTransactionsParams = {
  page?: number
  limit?: number
  type?: TransactionType
  search?: string
  from?: string // ISO date
  to?: string // ISO date
  sortBy?: 'occurredAt' | 'createdAt' | 'amount'
  sortOrder?: 'asc' | 'desc'
}

export async function listTransactions(params: ListTransactionsParams = {}) {
  const { sortBy, sortOrder, from, to, ...rest } = params

  // Adaptar parámetros al formato del backend
  const backendParams: Record<string, any> = { ...rest }

  if (sortBy && sortOrder) {
    backendParams.sort = `${sortBy}:${sortOrder}`
  }

  if (from) backendParams.dateFrom = from
  if (to) backendParams.dateTo = to

  const { data } = await api.get('/api/transactions', { params: backendParams })
  return data as {
    items: Transaction[]
    page: number
    limit: number
    total: number
    incomeTotal?: number
    expenseTotal?: number
    balance?: number
  }
}

export async function createTransaction(input: {
  type: TransactionType
  amount: number
  description?: string
  category?: string
  occurredAt?: string // ISO
  images?: File[] // múltiples archivos de imagen
}) {
  const formData = new FormData()
  formData.append('type', input.type)
  formData.append('amount', String(input.amount))
  if (input.description) formData.append('description', input.description)
  if (input.category) formData.append('category', input.category)
  if (input.occurredAt) formData.append('occurredAt', input.occurredAt)

  // Agregar imágenes
  if (input.images) {
    input.images.forEach((file) => {
      formData.append('images', file)
    })
  }

  const { data } = await api.post('/api/transactions', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data as Transaction
}

export async function updateTransaction(
  id: string,
  input: {
    type?: TransactionType
    amount?: number
    description?: string | null
    category?: string | null
    occurredAt?: string // ISO
    newImages?: File[] // nuevas imágenes a agregar
    keepImageIds?: string[] // IDs de imágenes a mantener
  },
) {
  // Actualizar metadatos de la transacción
  const { data } = await api.patch(`/api/transactions/${id}`, {
    type: input.type,
    amount: input.amount,
    description: input.description,
    category: input.category,
    occurredAt: input.occurredAt,
  })

  // Si hay nuevas imágenes, subirlas
  if (input.newImages && input.newImages.length > 0) {
    const formData = new FormData()
    input.newImages.forEach((file) => {
      formData.append('images', file)
    })
    await api.post(`/api/transactions/${id}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  }

  return data as Transaction
}

export async function deleteTransaction(id: string) {
  const { data } = await api.delete(`/api/transactions/${id}`)
  return data as { deleted: number }
}

export async function deleteTransactionImage(
  transactionId: string,
  imageId: string,
) {
  const { data } = await api.delete(
    `/api/transactions/${transactionId}/images/${imageId}`,
  )
  return data
}

export async function bulkDeleteTransactions(ids: string[]) {
  const { data } = await api.post(`/api/transactions/bulk-delete`, { ids })
  return data as { deleted: number }
}


