import { apiClient } from '../http/client'
import type { ApiSuccess, PageData } from '../types'

export interface ProductSummary {
  id: string
  name: string
  saleStatus: 'ON_SALE' | 'SOLD_OUT' | 'SUSPENDED'
}

export function getProducts() {
  return apiClient.request<ApiSuccess<PageData<ProductSummary>>>('/api/products')
}
