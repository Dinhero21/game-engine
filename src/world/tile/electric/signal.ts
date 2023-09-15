import { type TileInstance } from '../base'

// Signals are just TileInstances capable of being active

const ACTIVE_SIGNAL_SET = new WeakSet<TileInstance>()

export function isSignalActive (signal: TileInstance): boolean {
  return ACTIVE_SIGNAL_SET.has(signal)
}

export function activateSignal (signal: TileInstance): void {
  ACTIVE_SIGNAL_SET.add(signal)
}

export function deactivateSignal (signal: TileInstance): void {
  ACTIVE_SIGNAL_SET.delete(signal)
}
