export const NAV_TAB_KEYS = ['home', 'winners', 'shop', 'supporters', 'dice', 'premium'] as const
export type NavTabKey = (typeof NAV_TAB_KEYS)[number]

export type NavTabs = Record<NavTabKey, boolean>

// Fallback si la table nav_settings n'existe pas encore : tout visible
// (le défaut « en veille » est porté par la ligne créée par la migration)
export const FALLBACK_NAV_TABS: NavTabs = {
  home: true,
  winners: true,
  shop: true,
  supporters: true,
  dice: true,
  premium: true,
}

export function sanitizeNavTabs(value: unknown): NavTabs {
  const tabs = { ...FALLBACK_NAV_TABS }
  if (value && typeof value === 'object') {
    for (const key of NAV_TAB_KEYS) {
      const v = (value as Record<string, unknown>)[key]
      if (typeof v === 'boolean') tabs[key] = v
    }
  }
  return tabs
}
