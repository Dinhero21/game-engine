
import type CommandHelper from '../util/command'
import { type AsyncVoid } from '../util/event'

export const PREFIX = '/'

export type Command = (helper: CommandHelper) => AsyncVoid

export const COMMAND_MAP = new Map<string, Command>()

export function registerCommand (name: string, command: Command): void {
  COMMAND_MAP.set(name, command)
}
