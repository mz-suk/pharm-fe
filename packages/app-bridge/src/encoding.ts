export function encodeBridgePayload(payload: unknown) {
  return JSON.stringify(payload)
}

export function decodeBridgePayload(payload: string) {
  return JSON.parse(payload) as unknown
}
