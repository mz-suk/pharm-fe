export interface ApiSuccess<T> {
  code: 'OK'
  message: string
  data: T
}

export interface PageData<T> {
  items: T[]
  page: number
  size: number
  totalItems: number
  totalPages: number
}
