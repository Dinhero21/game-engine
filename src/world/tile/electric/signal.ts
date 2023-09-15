const ACTIVE_SIGNAL_SET = new Set<symbol>()

export function isSignalActive (signal: symbol): boolean {
  return ACTIVE_SIGNAL_SET.has(signal)
}

export function activateSignal (signal: symbol): void {
  ACTIVE_SIGNAL_SET.add(signal)
}

export function deactivateSignal (signal: symbol): void {
  ACTIVE_SIGNAL_SET.delete(signal)
}
