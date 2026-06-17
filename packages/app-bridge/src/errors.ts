export type AppBridgeErrorCode = 'UNSUPPORTED_METHOD' | 'NATIVE_ERROR' | 'TIMEOUT' | 'CANCELLED' | 'INVALID_RESPONSE'

export class AppBridgeError extends Error {
  code: AppBridgeErrorCode
  cause?: unknown

  constructor(code: AppBridgeErrorCode, message: string, cause?: unknown) {
    super(message)
    this.name = 'AppBridgeError'
    this.code = code

    if (cause !== undefined) {
      this.cause = cause
    }
  }
}
