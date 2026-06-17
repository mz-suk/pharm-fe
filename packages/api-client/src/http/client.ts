import { normalizeApiError, normalizeNetworkError } from '../errors'

export interface ApiClientOptions {
  baseUrl?: string
  fetcher?: typeof fetch
}

export interface ApiRequestInit extends RequestInit {
  parseJson?: boolean
}

export function createApiClient(options: ApiClientOptions = {}) {
  const baseUrl = options.baseUrl ?? ''
  const fetcher = options.fetcher ?? fetch

  async function request<T>(path: string, init: ApiRequestInit = {}): Promise<T> {
    const headers = new Headers(init.headers)

    if (isJsonStringBody(init.body) && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json')
    }

    let response: Response

    try {
      response = await fetcher(`${baseUrl}${path}`, {
        ...init,
        headers,
        credentials: init.credentials ?? 'include',
      })
    } catch (error) {
      throw normalizeNetworkError(error)
    }

    const body = await parseResponse(response, init.parseJson ?? true)

    if (!response.ok) {
      throw normalizeApiError(response.status, body)
    }

    return body as T
  }

  return { request }
}

export const apiClient = createApiClient()

function isJsonStringBody(body: BodyInit | null | undefined): body is string {
  if (typeof body !== 'string') {
    return false
  }

  try {
    JSON.parse(body)
    return true
  } catch {
    return false
  }
}

async function parseResponse(response: Response, parseJson: boolean) {
  if (!parseJson || response.status === 204) {
    return undefined
  }

  const text = await response.text()

  if (text.length === 0) {
    return undefined
  }

  try {
    return JSON.parse(text) as unknown
  } catch (error) {
    throw normalizeApiError(response.status, undefined, error)
  }
}
