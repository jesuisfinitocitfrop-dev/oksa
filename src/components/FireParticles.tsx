'use client'

import { useEffect, useRef } from 'react'

export default function FireParticles() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const containerEl = containerRef.current
    if (!containerEl) return
    const container: HTMLDivElement = containerEl

    const colors = ['#FFD700', '#FF8C00', '#FF6B00', '#FF4500', '#FFA500']
    const particles: HTMLDivElement[] = []

    function createParticle() {
      const p = document.createElement('div')
      p.className = 'ember'
      const size = Math.random() * 4 + 2
      p.style.cssText = `
        position: fixed;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        box-shadow: 0 0 ${size * 2}px ${colors[Math.floor(Math.random() * colors.length)]};
        left: ${Math.random() * 100}vw;
        bottom: -10px;
        pointer-events: none;
        z-index: 0;
        opacity: 1;
      `
      container.appendChild(p)
      particles.push(p)

      const duration = Math.random() * 3000 + 2000
      const drift = (Math.random() - 0.5) * 100

      p.animate(
        [
          { transform: 'translateY(0) translateX(0) scale(1)', opacity: 1 },
          { transform: `translateY(-50vh) translateX(${drift / 2}px) scale(0.8)`, opacity: 0.7, offset: 0.5 },
          { transform: `translateY(-100vh) translateX(${drift}px) scale(0.2)`, opacity: 0 },
        ],
        { duration, easing: 'ease-out', fill: 'forwards' }
      ).onfinish = () => {
        p.remove()
        const idx = particles.indexOf(p)
        if (idx > -1) particles.splice(idx, 1)
      }
    }

    const interval = setInterval(createParticle, 150)
    return () => {
      clearInterval(interval)
      particles.forEach(p => p.remove())
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    />
  )
}
