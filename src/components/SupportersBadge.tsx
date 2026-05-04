'use client'

// Badge inline à coller à côté d'un pseudo pour indiquer qu'il a boosted
export function SupporterBadge({ amount }: { amount: number }) {
  return (
    <span className="inline-flex items-center gap-1 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold px-2 py-0.5 rounded-full">
      💎 Supporter {amount > 0 && `· ${amount}€`}
    </span>
  )
}
