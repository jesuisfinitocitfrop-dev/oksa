'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'

type Phase = 'idle' | 'shaking' | 'flash' | 'opening' | 'revealed'

type Props = {
  locale: string
  dragonImage: string
}

const PARTICLES = [
  { angle: 0,   dist: 110, color: '#FFD700', size: 8,  shape: 'star' },
  { angle: 45,  dist: 130, color: '#FF6B00', size: 6,  shape: 'diamond' },
  { angle: 90,  dist: 100, color: '#FFD700', size: 10, shape: 'star' },
  { angle: 135, dist: 140, color: '#FFA500', size: 5,  shape: 'circle' },
  { angle: 180, dist: 120, color: '#FFD700', size: 8,  shape: 'diamond' },
  { angle: 225, dist: 115, color: '#FF4500', size: 6,  shape: 'star' },
  { angle: 270, dist: 135, color: '#FFD700', size: 9,  shape: 'star' },
  { angle: 315, dist: 125, color: '#FFA500', size: 7,  shape: 'diamond' },
  { angle: 22,  dist: 150, color: '#FFE566', size: 5,  shape: 'circle' },
  { angle: 157, dist: 145, color: '#FF6B00', size: 6,  shape: 'star' },
  { angle: 292, dist: 155, color: '#FFD700', size: 7,  shape: 'diamond' },
  { angle: 67,  dist: 160, color: '#FFA500', size: 5,  shape: 'circle' },
]

const BEAMS = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330]

function CSSGiftBox({ shaking }: { shaking: boolean }) {
  return (
    <div
      className={`relative ${shaking ? 'animate-box-shake' : 'animate-float'}`}
      style={{ width: 220, height: 220 }}
    >
      {/* Glow halo */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(255,215,0,0.35) 0%, rgba(255,107,0,0.15) 50%, transparent 70%)',
          filter: 'blur(20px)',
          transform: 'scale(1.3)',
        }}
      />

      {/* Box body */}
      <div
        className="absolute"
        style={{
          left: '15%', right: '15%',
          top: '38%', bottom: '8%',
          background: 'linear-gradient(135deg, #3d2a00 0%, #7a5200 40%, #3d2a00 100%)',
          borderRadius: '6px 6px 10px 10px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,215,0,0.2), 0 0 40px rgba(255,180,0,0.2)',
        }}
      >
        {/* Vertical ribbon on body */}
        <div style={{
          position: 'absolute', left: '50%', top: 0, bottom: 0, width: 24,
          transform: 'translateX(-50%)',
          background: 'linear-gradient(90deg, #cc8800, #FFD700, #FFA500, #FFD700, #cc8800)',
          boxShadow: '0 0 12px rgba(255,215,0,0.5)',
        }} />
        {/* Left panel highlight */}
        <div style={{
          position: 'absolute', left: 0, top: 0, width: '45%', bottom: 0,
          background: 'linear-gradient(90deg, transparent, rgba(255,200,0,0.08))',
          borderRadius: '6px 0 0 10px',
        }} />
      </div>

      {/* Box lid */}
      <div
        className="absolute"
        style={{
          left: '12%', right: '12%',
          top: '16%', height: '26%',
          background: 'linear-gradient(135deg, #4a3200 0%, #8c6200 40%, #4a3200 100%)',
          borderRadius: '8px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,215,0,0.3)',
        }}
      >
        {/* Horizontal ribbon on lid */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            position: 'absolute', left: 0, right: 0, height: 20, top: '50%',
            transform: 'translateY(-50%)',
            background: 'linear-gradient(180deg, #cc8800, #FFD700, #FFA500, #FFD700, #cc8800)',
            boxShadow: '0 0 10px rgba(255,215,0,0.4)',
          }} />
          {/* Vertical ribbon on lid */}
          <div style={{
            position: 'absolute', top: 0, bottom: 0, width: 20, left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(90deg, #cc8800, #FFD700, #FFA500, #FFD700, #cc8800)',
            boxShadow: '0 0 10px rgba(255,215,0,0.4)',
          }} />
        </div>
      </div>

      {/* Big bow */}
      <div
        className="absolute"
        style={{ top: '4%', left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}
      >
        {/* Left loop */}
        <div style={{
          position: 'absolute', right: '52%', top: -6,
          width: 38, height: 28,
          background: 'linear-gradient(135deg, #cc8800, #FFD700, #FFA500)',
          borderRadius: '50% 10% 50% 10%',
          transform: 'rotate(-15deg)',
          boxShadow: '0 0 14px rgba(255,215,0,0.5)',
        }} />
        {/* Right loop */}
        <div style={{
          position: 'absolute', left: '52%', top: -6,
          width: 38, height: 28,
          background: 'linear-gradient(225deg, #cc8800, #FFD700, #FFA500)',
          borderRadius: '10% 50% 10% 50%',
          transform: 'rotate(15deg)',
          boxShadow: '0 0 14px rgba(255,215,0,0.5)',
        }} />
        {/* Knot center */}
        <div style={{
          position: 'relative', zIndex: 2,
          width: 22, height: 22,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 35%, #fff8b0, #FFD700 40%, #cc8800)',
          boxShadow: '0 0 18px rgba(255,215,0,0.8), 0 0 4px rgba(255,255,255,0.5)',
        }} />
        {/* Ribbon tails */}
        <div style={{
          position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', gap: 8,
        }}>
          <div style={{
            width: 10, height: 18,
            background: 'linear-gradient(180deg, #FFD700, #cc8800)',
            borderRadius: '0 0 4px 8px', transform: 'rotate(-12deg)',
          }} />
          <div style={{
            width: 10, height: 18,
            background: 'linear-gradient(180deg, #FFD700, #cc8800)',
            borderRadius: '0 0 8px 4px', transform: 'rotate(12deg)',
          }} />
        </div>
      </div>

      {/* Corner ornaments */}
      {[
        { left: '13%', top: '38%' },
        { right: '13%', top: '38%' },
        { left: '13%', bottom: '8%' },
        { right: '13%', bottom: '8%' },
      ].map((pos, i) => (
        <div key={i} style={{
          position: 'absolute', ...pos,
          width: 8, height: 8,
          background: '#FFD700',
          borderRadius: '50%',
          boxShadow: '0 0 8px rgba(255,215,0,0.8)',
        }} />
      ))}

      {/* Floating sparkles */}
      {[
        { top: '10%', left: '8%',  size: 6, delay: '0s' },
        { top: '20%', right: '6%', size: 5, delay: '0.4s' },
        { top: '55%', left: '5%',  size: 4, delay: '0.8s' },
        { top: '70%', right: '8%', size: 7, delay: '0.2s' },
        { top: '85%', left: '20%', size: 5, delay: '1.2s' },
      ].map((s, i) => (
        <div key={i} style={{
          position: 'absolute', ...{ top: s.top, left: (s as any).left, right: (s as any).right },
          animation: `glowPulse 2s ease-in-out ${s.delay} infinite`,
        }}>
          <svg width={s.size * 2} height={s.size * 2} viewBox="0 0 24 24" fill="#FFD700" opacity={0.8}>
            <polygon points="12,2 13.5,10 22,12 13.5,14 12,22 10.5,14 2,12 10.5,10" />
          </svg>
        </div>
      ))}
    </div>
  )
}

export default function GiftBoxReveal({ locale, dragonImage }: Props) {
  const [phase, setPhase] = useState<Phase>('idle')
  const shakeTimer = useRef<NodeJS.Timeout | null>(null)
  const flashTimer = useRef<NodeJS.Timeout | null>(null)
  const openTimer  = useRef<NodeJS.Timeout | null>(null)

  function handleOpen() {
    if (phase !== 'idle') return
    setPhase('shaking')
    shakeTimer.current = setTimeout(() => {
      setPhase('flash')
      flashTimer.current = setTimeout(() => {
        setPhase('opening')
        openTimer.current = setTimeout(() => setPhase('revealed'), 900)
      }, 320)
    }, 900)
  }

  useEffect(() => () => {
    if (shakeTimer.current) clearTimeout(shakeTimer.current)
    if (flashTimer.current) clearTimeout(flashTimer.current)
    if (openTimer.current)  clearTimeout(openTimer.current)
  }, [])

  const isShaking   = phase === 'shaking'
  const isFlash     = phase === 'flash'
  const isOpening   = phase === 'opening'
  const isRevealed  = phase === 'revealed'
  const showBox     = phase === 'idle' || phase === 'shaking' || phase === 'flash'
  const showParticles = isOpening || isRevealed

  return (
    <div className="relative flex flex-col items-center select-none" style={{ minHeight: 320 }}>

      {/* ── FLASH OVERLAY ──────────────────────────────── */}
      {isFlash && (
        <div
          className="fixed inset-0 z-50 pointer-events-none animate-flash-in"
          style={{ background: 'radial-gradient(ellipse at center, #fff8e0 0%, rgba(255,215,0,0.55) 40%, transparent 70%)' }}
        />
      )}

      {/* ── LIGHT BEAMS ────────────────────────────────── */}
      {showParticles && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          {BEAMS.map((angle) => (
            <div
              key={angle}
              className="absolute origin-bottom animate-beam-spread"
              style={{
                width: 3,
                height: 280,
                background: `linear-gradient(to top, rgba(255,215,0,0.7), rgba(255,180,0,0.3), transparent)`,
                transform: `rotate(${angle}deg) translateY(-50%)`,
                transformOrigin: 'bottom center',
                bottom: '50%',
                animationDelay: `${(angle / 330) * 0.12}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* ── GLOW EXPLOSION ─────────────────────────────── */}
      {showParticles && (
        <div className="absolute flex items-center justify-center pointer-events-none z-10 animate-glow-explode"
          style={{ inset: 0, top: '35%' }}>
          <div style={{
            width: 140, height: 140, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,215,0,0.95) 0%, rgba(255,107,0,0.45) 50%, transparent 70%)',
          }} />
        </div>
      )}

      {/* ── BURST PARTICLES ────────────────────────────── */}
      {showParticles && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          {PARTICLES.map((p, i) => {
            const rad = (p.angle * Math.PI) / 180
            const tx  = Math.cos(rad) * p.dist
            const ty  = Math.sin(rad) * p.dist
            return (
              <div
                key={i}
                className="absolute animate-particle-burst"
                style={{ '--tx': `${tx}px`, '--ty': `${ty}px`, animationDelay: `${i * 0.03}s` } as React.CSSProperties}
              >
                {p.shape === 'star' && (
                  <svg width={p.size * 2} height={p.size * 2} viewBox="0 0 24 24" fill={p.color}>
                    <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
                  </svg>
                )}
                {p.shape === 'diamond' && (
                  <div style={{ width: p.size, height: p.size, background: p.color, transform: 'rotate(45deg)', boxShadow: `0 0 6px ${p.color}` }} />
                )}
                {p.shape === 'circle' && (
                  <div style={{ width: p.size, height: p.size, borderRadius: '50%', background: p.color, boxShadow: `0 0 8px ${p.color}` }} />
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ── GIFT BOX ───────────────────────────────────── */}
      {showBox && (
        <div className="relative z-30 flex flex-col items-center gap-4">
          <button
            onClick={handleOpen}
            disabled={phase !== 'idle'}
            className="relative focus:outline-none"
            aria-label="Ouvrir le cadeau"
          >
            <CSSGiftBox shaking={isShaking} />
          </button>

          {phase === 'idle' && (
            <p className="font-bangers text-xl text-gold-400/80 uppercase tracking-widest animate-pulse">
              🎁 Clique pour ouvrir !
            </p>
          )}
          {isShaking && (
            <p className="font-bangers text-xl text-gold-400 uppercase tracking-widest animate-pulse">
              ✨ Quelque chose arrive...
            </p>
          )}
        </div>
      )}

      {/* ── REVEAL ─────────────────────────────────────── */}
      {(isOpening || isRevealed) && (
        <div className={`relative z-40 flex flex-col items-center gap-5 ${isOpening ? 'animate-reveal-rise' : ''}`}>
          <p
            className="font-bangers text-2xl uppercase tracking-widest"
            style={{
              background: 'linear-gradient(135deg, #FFD700, #FF6B00)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 0 12px rgba(255,215,0,0.6))',
            }}
          >
            🎁 Choisis ton giveaway !
          </p>

          <div className="flex items-center gap-4 sm:gap-6">

            {/* Dragon — gratuit */}
            <Link href="#inscription" className="group flex flex-col items-center gap-2">
              <div
                className={`relative rounded-2xl overflow-hidden border-2 border-gold-400/50
                  group-hover:border-gold-400 transition-all duration-300 group-hover:scale-105
                  ${isOpening ? 'animate-card-rise' : ''}`}
                style={{ width: 150, height: 150, boxShadow: '0 0 30px rgba(255,215,0,0.25)' }}
              >
                <Image src={dragonImage} alt="Dragon" fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
                <div className="absolute bottom-2 inset-x-0 text-center">
                  <span className="font-bangers text-xs text-gold-400 tracking-wide">GRATUIT</span>
                </div>
              </div>
              <span className="bg-gold-400 text-cit-dark font-bangers text-sm px-5 py-1 rounded-full
                group-hover:bg-gold-300 transition-colors whitespace-nowrap shadow-[0_0_15px_rgba(255,215,0,0.4)]">
                🐉 Participer
              </span>
            </Link>

            {/* VS */}
            <div className="flex flex-col items-center gap-1 pb-8">
              <span className="font-bangers text-3xl text-white" style={{ textShadow: '0 0 20px rgba(255,255,255,0.4)' }}>
                VS
              </span>
              <div className="w-px h-6 bg-gradient-to-b from-white/30 to-transparent" />
            </div>

            {/* Headless — premium */}
            <Link href={`/${locale}/premium`} className="group flex flex-col items-center gap-2">
              <div
                className={`relative rounded-2xl overflow-hidden border-2 border-orange-500/50
                  group-hover:border-orange-400 transition-all duration-300 group-hover:scale-105
                  ${isOpening ? 'animate-card-rise' : ''}`}
                style={{ width: 150, height: 150, boxShadow: '0 0 30px rgba(255,140,0,0.25)', animationDelay: '0.12s' }}
              >
                <Image src="/images/Headlesshorseman.webp" alt="Headless Horseman" fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
                <div className="absolute bottom-2 inset-x-0 text-center">
                  <span className="font-bangers text-xs text-orange-400 tracking-wide">PREMIUM</span>
                </div>
              </div>
              <span className="bg-orange-500 text-white font-bangers text-sm px-5 py-1 rounded-full
                group-hover:bg-orange-400 transition-colors whitespace-nowrap shadow-[0_0_15px_rgba(255,140,0,0.4)]">
                🎃 Participer
              </span>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
