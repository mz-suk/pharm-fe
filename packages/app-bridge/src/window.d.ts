export {}

declare global {
  interface Window {
    PharmApp?: {
      call?: (request: unknown) => Promise<unknown>
      emit?: (request: unknown) => void
      on?: (event: string, handler: (payload: unknown) => void) => () => void
    }
    FlutterWebView?: {
      postMessage: (message: string) => void
    }
    WellfyApp?: {
      callHandler?: (method: string, payload?: unknown) => Promise<unknown>
    }
  }
}
