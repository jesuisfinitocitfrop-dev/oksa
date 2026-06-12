export const NAV_TAB_KEYS = ['home', 'winners', 'shop', 'supporters', 'dice', 'premium'] as const
export type NavTabKey = (typeof NAV_TAB_KEYS)[number]

export type NavTabs = Record<NavTabKey, boolean>

// État par défaut tant que l'admin n'a rien sauvegardé :
// Accueil, Color Dice et Premium visibles, le reste en veille
export const DEFAULT_NAV_TABS: NavTabs = {
  home: true,
  winners: false,
  shop: false,
  supporters: false,
  dice: true,
  premium: true,
}

export function sanitizeNavTabs(value: unknown): NavTabs {
  const tabs = { ...DEFAULT_NAV_TABS }
  if (value && typeof value === 'object') {
    for (const key of NAV_TAB_KEYS) {
      const v = (value as Record<string, unknown>)[key]
      if (typeof v === 'boolean') tabs[key] = v
    }
  }
  return tabs
}
