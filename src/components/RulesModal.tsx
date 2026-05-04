'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'

export default function RulesModal({
  className,
  label,
}: {
  className?: string
  label?: string
}) {
  const [open, setOpen] = useState(false)
  const t = useTranslations('rulesSection')
  const display = label ?? t('title')

  return (
    <>
      <button onClick={() => setOpen(true)} className={className ?? 'hover:text-white transition-colors'}>
        {display}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
          <div
            className="relative bg-[#12121A] border border-[#2a2a3a] rounded-2xl p-6 md:p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto z-10 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors text-xl leading-none"
              aria-label="Fermer"
            >
              ✕
            </button>
            <h2 className="font-bangers text-3xl md:text-4xl text-white mb-6 text-center">
              📜 {t('title')}
            </h2>
            <div className="space-y-3 text-sm md:text-base text-gray-400 leading-relaxed">
              <p>• {t('r1')}</p>
              <p>• {t('r2')}</p>
              <p>• {t('r3')}</p>
              <p>• <strong className="text-gray-300">{t('r4bold')}</strong> {t('r4end')}</p>
              <p>• {t('r5')}</p>
              <p>• {t('r6')}</p>
              <p>• {t('r7')}</p>
              <p className="pt-3 text-gray-600 text-xs">{t('organizer')}</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
