'use client'
import { useEffect, useRef, useCallback } from 'react'

const W = 700
const H = 240
const GND = 188       // y of ground line
const CHAR_X = 70
const CHAR_W = 40
const CHAR_H = 58
const GRAVITY = 0.7
const JUMP_V = -14

type ObstacleKind = 'ground' | 'meowl'

interface Obstacle {
  x: number
  w: number
  h: number
  kind: ObstacleKind
  gy: number   // actual y top of the hitbox
}

interface GameState {
  phase: 'idle' | 'running' | 'dead'
  cy: number
  vy: number
  jumpsLeft: number
  obstacles: Obstacle[]
  score: number
  speed: number
  frame: number
  spawnIn: number
  hi: number
}

function makeState(): GameState {
  return {
    phase: 'idle',
    cy: GND - CHAR_H,
    vy: 0,
    jumpsLeft: 2,
    obstacles: [],
    score: 0,
    speed: 5.5,
    frame: 0,
    spawnIn: 90,
    hi: 0,
  }
}

// ── Roblox-inspired background ──────────────────────────────────────────────
function drawBackground(ctx: CanvasRenderingContext2D, offset: number) {
  // Sky gradient (dark like the Roblox game)
  const sky = ctx.createLinearGradient(0, 0, 0, GND)
  sky.addColorStop(0, '#06060f')
  sky.addColorStop(1, '#0d1a2e')
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, W, GND)

  // Stars
  for (let i = 0; i < 35; i++) {
    const sx = ((i * 139 + offset * 0.04) % W + W) % W
    const sy = (i * 53 + 7) % (GND - 60)
    ctx.fillStyle = `rgba(255,255,255,${0.1 + (i % 3) * 0.1})`
    ctx.beginPath()
    ctx.arc(sx, sy, i % 5 === 0 ? 1.5 : 0.8, 0, Math.PI * 2)
    ctx.fill()
  }

  // Building silhouettes (parallax, slow scroll)
  const bldgOffset = (offset * 0.15) % W
  const buildings = [
    { x: 0,   w: 80,  h: 70 },
    { x: 90,  w: 55,  h: 95 },
    { x: 155, w: 100, h: 60 },
    { x: 265, w: 70,  h: 110 },
    { x: 345, w: 90,  h: 80 },
    { x: 445, w: 65,  h: 100 },
    { x: 520, w: 110, h: 70 },
    { x: 640, w: 80,  h: 90 },
    // repeat for seamless loop
    { x: 700, w: 80,  h: 70 },
    { x: 790, w: 55,  h: 95 },
    { x: 855, w: 100, h: 60 },
  ]
  for (const b of buildings) {
    const bx = ((b.x - bldgOffset) % (W + 300) + W + 300) % (W + 300) - 200
    // Building body
    ctx.fillStyle = '#0e1520'
    ctx.fillRect(bx, GND - b.h, b.w, b.h)
    // Windows
    ctx.fillStyle = '#fbbf2422'
    const cols = Math.floor(b.w / 18)
    const rows = Math.floor(b.h / 20)
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if ((r + c + Math.floor(b.x / 30)) % 3 !== 0) continue
        ctx.fillStyle = Math.random() > 0.7 ? '#fbbf2444' : '#fbbf2418'
        ctx.fillRect(bx + 5 + c * 18, GND - b.h + 8 + r * 20, 10, 12)
      }
    }
  }

  // Green ground
  const gGrad = ctx.createLinearGradient(0, GND, 0, GND + 52)
  gGrad.addColorStop(0, '#166534')
  gGrad.addColorStop(0.3, '#15803d')
  gGrad.addColorStop(1, '#052e16')
  ctx.fillStyle = gGrad
  ctx.fillRect(0, GND, W, H - GND)

  // Ground top edge highlight
  ctx.strokeStyle = '#22c55e'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(0, GND)
  ctx.lineTo(W, GND)
  ctx.stroke()

  // Dirt pattern
  ctx.strokeStyle = '#14532d'
  ctx.lineWidth = 1
  for (let i = 0; i < 20; i++) {
    const gx = ((i * 48 - offset) % W + W) % W
    ctx.beginPath()
    ctx.moveTo(gx, GND + 8)
    ctx.lineTo(gx + 20, GND + 8)
    ctx.stroke()
  }
}

// ── Tung Tung Sahur (canvas fallback / used if PNG not ready) ───────────────
function drawTungTung(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | null,
  x: number,
  y: number,
  frame: number,
  inAir: boolean,
) {
  if (img?.complete && img.naturalWidth > 0) {
    // Use PNG sprite
    ctx.drawImage(img, x - 4, y, CHAR_W + 8, CHAR_H)
    return
  }

  // ── Canvas fallback (blocky Tung Tung) ─────────────────────────────────
  const cx = x + CHAR_W / 2
  const legSwing = inAir ? 0 : Math.sin(frame * 0.25) * 8

  // Shadow
  ctx.save()
  ctx.globalAlpha = 0.18
  ctx.fillStyle = '#000'
  ctx.beginPath()
  ctx.ellipse(cx, GND + 3, 16, 4, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  // Legs
  const legY = y + CHAR_H - 16
  ctx.fillStyle = '#92400e'
  ctx.fillRect(x + 6, legY, 10, 14 + legSwing)
  ctx.fillRect(x + CHAR_W - 16, legY, 10, 14 - legSwing)
  ctx.fillStyle = '#431407'
  ctx.fillRect(x + 2, legY + 13 + legSwing, 16, 5)
  ctx.fillRect(x + CHAR_W - 18, legY + 13 - legSwing, 16, 5)

  // Body — waffle texture (orange blocks)
  const cols = 3, rows = 4
  const bw = (CHAR_W - 4) / cols
  const bh = 28 / rows
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      ctx.fillStyle = (r + c) % 2 === 0 ? '#d97706' : '#b45309'
      ctx.fillRect(x + 2 + c * bw + 1, y + 2 + r * bh + 1, bw - 2, bh - 2)
    }
  }

  // Head — waffle blocks
  const hcols = 3, hrows = 3
  const hw = (CHAR_W - 2) / hcols
  const hh = 22 / hrows
  for (let r = 0; r < hrows; r++) {
    for (let c = 0; c < hcols; c++) {
      ctx.fillStyle = (r + c) % 2 === 0 ? '#f59e0b' : '#d97706'
      ctx.fillRect(x + 1 + c * hw + 1, y - 24 + r * hh + 1, hw - 2, hh - 2)
    }
  }

  // Eyes (dark squares)
  ctx.fillStyle = '#1c1917'
  ctx.fillRect(x + 7, y - 18, 8, 7)
  ctx.fillRect(x + CHAR_W - 15, y - 18, 8, 7)
  ctx.fillStyle = 'white'
  ctx.fillRect(x + 8, y - 17, 3, 3)
  ctx.fillRect(x + CHAR_W - 14, y - 17, 3, 3)

  // Mouth/beard block
  ctx.fillStyle = '#92400e'
  ctx.fillRect(x + 8, y - 8, CHAR_W - 16, 7)

  // Arms
  const armSwing = inAir ? -3 : Math.sin(frame * 0.25) * 5
  ctx.fillStyle = '#d97706'
  ctx.fillRect(x - 10, y + 4 + armSwing, 12, 8)
  ctx.fillRect(x + CHAR_W - 2, y + 4 - armSwing, 12, 8)
}

// ── Meowl (cat-owl) obstacle ─────────────────────────────────────────────────
function drawMeowl(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | null,
  x: number,
  y: number,
  w: number,
  h: number,
  frame: number,
) {
  const wingFlap = Math.sin(frame * 0.3) * 5
  const cx = x + w / 2

  if (img?.complete && img.naturalWidth > 0) {
    // Use PNG sprite
    ctx.save()
    ctx.translate(cx, y + h / 2)
    // Gentle flap motion
    ctx.translate(0, Math.sin(frame * 0.15) * 3)
    ctx.drawImage(img, -w / 2, -h / 2, w, h)
    ctx.restore()
    return
  }

  // ── Canvas fallback (blocky Meowl) ───────────────────────────────────
  ctx.save()
  ctx.translate(cx, y + h / 2 + Math.sin(frame * 0.15) * 3)

  // Wings (brown feathers, animated flap)
  ctx.fillStyle = '#92400e'
  // Left wing
  ctx.beginPath()
  ctx.moveTo(-w / 2 - 2, 0)
  ctx.lineTo(-w / 2 - 18, -wingFlap - 8)
  ctx.lineTo(-w / 2 - 14, wingFlap + 4)
  ctx.closePath()
  ctx.fill()
  // Right wing
  ctx.beginPath()
  ctx.moveTo(w / 2 + 2, 0)
  ctx.lineTo(w / 2 + 18, -wingFlap - 8)
  ctx.lineTo(w / 2 + 14, wingFlap + 4)
  ctx.closePath()
  ctx.fill()

  // Body (cream/white)
  ctx.fillStyle = '#fef3c7'
  ctx.beginPath()
  ctx.ellipse(0, 5, w / 2 - 2, h / 2 - 4, 0, 0, Math.PI * 2)
  ctx.fill()

  // Brown fur overlay on top
  ctx.fillStyle = '#a16207'
  ctx.beginPath()
  ctx.ellipse(0, -4, w / 2 - 4, h / 3, 0, 0, Math.PI)
  ctx.fill()

  // Ears (pointy cat ears)
  ctx.fillStyle = '#a16207'
  ctx.beginPath()
  ctx.moveTo(-10, -h / 2 + 6)
  ctx.lineTo(-16, -h / 2 - 8)
  ctx.lineTo(-4, -h / 2 + 2)
  ctx.closePath()
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(10, -h / 2 + 6)
  ctx.lineTo(16, -h / 2 - 8)
  ctx.lineTo(4, -h / 2 + 2)
  ctx.closePath()
  ctx.fill()

  // Face
  ctx.fillStyle = '#fef3c7'
  ctx.beginPath()
  ctx.ellipse(0, -2, 12, 12, 0, 0, Math.PI * 2)
  ctx.fill()

  // Eyes (green)
  ctx.fillStyle = '#16a34a'
  ctx.beginPath()
  ctx.arc(-5, -4, 4, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(5, -4, 4, 0, Math.PI * 2)
  ctx.fill()
  // Pupils
  ctx.fillStyle = '#1c1917'
  ctx.beginPath()
  ctx.arc(-5, -4, 2, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(5, -4, 2, 0, Math.PI * 2)
  ctx.fill()
  // Eye shine
  ctx.fillStyle = 'white'
  ctx.beginPath()
  ctx.arc(-4, -5, 1, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(6, -5, 1, 0, Math.PI * 2)
  ctx.fill()

  // Nose
  ctx.fillStyle = '#f9a8d4'
  ctx.beginPath()
  ctx.arc(0, 0, 2, 0, Math.PI * 2)
  ctx.fill()

  // Mouth
  ctx.strokeStyle = '#78350f'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(0, 2)
  ctx.lineTo(-3, 5)
  ctx.moveTo(0, 2)
  ctx.lineTo(3, 5)
  ctx.stroke()

  // Feet/claws
  ctx.fillStyle = '#a16207'
  ctx.fillRect(-8, h / 2 - 6, 6, 6)
  ctx.fillRect(2, h / 2 - 6, 6, 6)

  ctx.restore()
}

export default function TungTungGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gsRef = useRef<GameState>(makeState())
  const rafRef = useRef<number>(0)
  const tungImg = useRef<HTMLImageElement | null>(null)
  const meowlImg = useRef<HTMLImageElement | null>(null)

  // Load PNG sprites
  useEffect(() => {
    const t = new Image()
    t.src = '/images/tung_tung.png'
    t.onload = () => { tungImg.current = t }

    const m = new Image()
    m.src = '/images/meowl.png'
    m.onload = () => { meowlImg.current = m }
  }, [])

  const action = useCallback(() => {
    const s = gsRef.current
    if (s.phase === 'idle' || s.phase === 'dead') {
      const hi = s.hi
      Object.assign(s, makeState())
      s.hi = hi
      s.phase = 'running'
      s.vy = JUMP_V
      s.jumpsLeft = 1
    } else if (s.phase === 'running' && s.jumpsLeft > 0) {
      s.vy = JUMP_V
      s.jumpsLeft--
    }
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault()
        action()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [action])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    const loop = () => {
      const s = gsRef.current

      drawBackground(ctx, s.score * 2)

      if (s.phase === 'idle') {
        drawTungTung(ctx, tungImg.current, CHAR_X, GND - CHAR_H, s.frame++, false)

        ctx.fillStyle = '#fbbf24'
        ctx.font = 'bold 26px Bangers, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('TUNG TUNG RUN !', W / 2, H / 2 - 30)
        ctx.fillStyle = '#9ca3af'
        ctx.font = '14px Inter, sans-serif'
        ctx.fillText('Appuie sur Espace ou clique pour jouer', W / 2, H / 2 - 8)
        ctx.fillStyle = '#6b7280'
        ctx.font = '12px Inter, sans-serif'
        ctx.fillText('Double saut autorisé  •  Évite les Meowl !', W / 2, H / 2 + 12)
      } else {
        s.frame++

        // Physics
        s.vy += GRAVITY
        s.cy += s.vy
        if (s.cy >= GND - CHAR_H) {
          s.cy = GND - CHAR_H
          s.vy = 0
          s.jumpsLeft = 2
        }

        // Spawn obstacles
        s.spawnIn--
        if (s.spawnIn <= 0) {
          // 30% chance of Meowl, 70% ground obstacle
          const isMeowl = Math.random() < 0.30
          if (isMeowl) {
            const h = 30 + Math.random() * 14
            const w = 36
            // Meowl appears at 2 heights:
            // high (pass under = y is low on screen) or mid (must jump)
            const isHigh = Math.random() < 0.5
            const gy = isHigh
              ? GND - CHAR_H - 40         // high: pass under
              : GND - CHAR_H - 10         // mid: must jump
            s.obstacles.push({ x: W + 20, w, h, kind: 'meowl', gy })
          } else {
            const h = 36 + Math.random() * 44
            const w = 28 + Math.random() * 12
            s.obstacles.push({ x: W + 20, w, h, kind: 'ground', gy: GND - h })
          }
          const gap = Math.max(42, 80 - (s.speed - 5.5) * 5)
          s.spawnIn = gap + Math.random() * 55
        }

        // Move & draw obstacles
        s.obstacles = s.obstacles.filter(o => o.x > -100)
        for (const o of s.obstacles) {
          o.x -= s.speed
          if (o.kind === 'meowl') {
            drawMeowl(ctx, meowlImg.current, o.x, o.gy, o.w, o.h, s.frame)
          } else {
            drawGroundObstacle(ctx, o)
          }
        }

        // Draw character
        const inAir = s.cy < GND - CHAR_H - 2
        drawTungTung(ctx, tungImg.current, CHAR_X, s.cy, s.frame, inAir)

        // Collision (forgiving hitbox)
        const cx1 = CHAR_X + 8, cy1 = s.cy + 8
        const cw1 = CHAR_W - 16, ch1 = CHAR_H - 16
        for (const o of s.obstacles) {
          const ox = o.x + 5, oy = o.gy + 5
          const ow = o.w - 10, oh = o.h - 8
          if (cx1 < ox + ow && cx1 + cw1 > ox && cy1 < oy + oh && cy1 + ch1 > oy) {
            if (s.phase === 'running') {
              s.phase = 'dead'
              if (s.score > s.hi) s.hi = s.score
            }
          }
        }

        // Score & speed
        if (s.phase === 'running') {
          s.score++
          s.speed = 5.5 + s.score * 0.0025
        }

        // HUD
        const scoreStr = String(Math.floor(s.score / 10)).padStart(5, '0')
        ctx.fillStyle = s.phase === 'dead' ? '#ef4444' : 'rgba(251,191,36,0.6)'
        ctx.font = 'bold 17px monospace'
        ctx.textAlign = 'right'
        ctx.fillText(scoreStr, W - 12, 22)
        if (s.hi > 0) {
          ctx.fillStyle = 'rgba(75,85,99,0.65)'
          ctx.font = '12px monospace'
          ctx.fillText(`HI ${String(Math.floor(s.hi / 10)).padStart(5, '0')}`, W - 12, 38)
        }
      }

      if (s.phase === 'dead') {
        ctx.fillStyle = 'rgba(0,0,0,0.6)'
        ctx.fillRect(0, 0, W, H)
        ctx.fillStyle = '#ef4444'
        ctx.font = 'bold 28px Bangers, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('GAME OVER', W / 2, H / 2 - 16)
        ctx.fillStyle = '#fbbf24'
        ctx.font = 'bold 16px monospace'
        ctx.fillText(`Score : ${String(Math.floor(s.score / 10)).padStart(5, '0')}`, W / 2, H / 2 + 10)
        ctx.fillStyle = '#9ca3af'
        ctx.font = '13px Inter, sans-serif'
        ctx.fillText('Espace / Clic pour rejouer', W / 2, H / 2 + 34)
      }

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-full overflow-x-auto rounded-xl">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          onClick={action}
          className="rounded-xl border border-cit-border cursor-pointer block mx-auto"
          style={{ touchAction: 'none', maxWidth: '100%' }}
          onTouchStart={e => { e.preventDefault(); action() }}
        />
      </div>
      <p className="text-gray-600 text-xs">
        Espace / Clic pour sauter · Double saut · Évite les Meowl !
      </p>
    </div>
  )
}

// Brainrot ground obstacle (stylized green cactus)
function drawGroundObstacle(ctx: CanvasRenderingContext2D, obs: Obstacle) {
  const cx = obs.x + obs.w / 2
  const top = obs.gy

  // Main trunk
  ctx.fillStyle = '#15803d'
  ctx.fillRect(cx - 6, top, 12, obs.h)

  if (obs.h >= 45) {
    ctx.fillRect(cx - 24, top + 16, 20, 8)
    ctx.fillRect(cx - 24, top + 6, 8, 20)
    ctx.fillRect(cx + 4, top + 22, 20, 8)
    ctx.fillRect(cx + 16, top + 12, 8, 20)
  }

  // Top cap
  ctx.fillRect(cx - 9, top - 4, 18, 10)

  // Highlight strip
  ctx.fillStyle = '#22c55e'
  ctx.fillRect(cx - 3, top + 2, 4, obs.h - 6)
}
