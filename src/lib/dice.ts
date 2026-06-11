export const DICE_COLORS = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'] as const
export type DiceColor = (typeof DICE_COLORS)[number]

export const MAX_DICE = 6

export function isDiceColor(value: unknown): value is DiceColor {
  return typeof value === 'string' && (DICE_COLORS as readonly string[]).includes(value)
}

export type DiceConfig = {
  id: number
  enabled_colors: DiceColor[]
  forced_colors: (DiceColor | null)[]
  updated_at: string
}
