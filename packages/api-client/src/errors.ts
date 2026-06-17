export interface ApiFieldError {
  field?: string
  code: string
  message: string
}

export interface ApiError {
  status: number
  code: string
  message: string
  traceId?: string
  fieldErrors?: ApiFieldError[]
  cause?: unknown
}

interface ApiErrorResponse {
  code?: string
  message?: string
  traceId?: string
  requestId?: string
  errors?: ApiFieldError[]
}

export class PharmApiError extends Error implements ApiError {
  status: number
  code: string
  traceId?: string
  fieldErrors?: ApiFieldError[]

  constructor(error: ApiError) {
    super(error.message)
    this.name = 'PharmApiError'
    this.status = error.status
    this.code = error.code
    this.cause = error.cause

    if (error.traceId !== undefined) {
      this.traceId = error.traceId
    }

    if (error.fieldErrors !== undefined) {
      this.fieldErrors = error.fieldErrors
    }
  }
}

export function normalizeApiError(status: number, body: unknown, cause?: unknown): PharmApiError {
  const errorBody = isApiErrorResponse(body) ? body : undefined
  const traceId = errorBody?.traceId ?? errorBody?.requestId

  return new PharmApiError({
    status,
    code: errorBody?.code ?? codeFromStatus(status),
    message: errorBody?.message ?? '요청을 처리하지 못했습니다.',
    ...(traceId !== undefined ? { traceId } : {}),
    ...(errorBody?.errors !== undefined ? { fieldErrors: errorBody.errors } : {}),
    ...(cause !== undefined ? { cause } : {}),
  })
}

export function normalizeNetworkError(cause: unknown): PharmApiError {
  return new PharmApiError({
    status: 0,
    code: 'NETWORK_ERROR',
    message: '네트워크 연결을 확인해 주세요.',
    cause,
  })
}

function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  return typeof value === 'object' && value !== null
}

function codeFromStatus(status: number) {
  if (status === 401) return 'AUTH_REQUIRED'
  if (status === 403) return 'FORBIDDEN'
  if (status >= 500) return 'SYSTEM_ERROR'
  return 'UNKNOWN_ERROR'
}
