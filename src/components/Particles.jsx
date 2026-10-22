import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'

const COLORS = ['255,150,190', '205,165,255', '255,205,215', '255,120,140']

function makeSprite(rgb) {
  const size = 64
  const c = document.createElement('canvas')
  c.width = c.height = size
  const g = c.getContext('2d')
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  grad.addColorStop(0, `rgba(255,255,255,1)`)
  grad.addColorStop(0.12, `rgba(${rgb},0.95)`)
  grad.addColorStop(0.4, `rgba(${rgb},0.25)`)
  grad.addColorStop(1, `rgba(${rgb},0)`)
  g.fillStyle = grad
  g.fillRect(0, 0, size, size)
  return c
}

/**
 * Small drifting motes of light on a canvas. `intensity` (MotionValue, 0..1)
 * brings in extra particles; `scrollY` adds a depth-based parallax.
 */
export function Particles({ scrollY, intensity }) {
  const ref = useRef(null)
  const reduce = useReducedMotion()

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    const sprites = COLORS.map(makeSprite)
    let w = 0
    let h = 0
    let dpr = 1
    let raf = 0
    let last = performance.now()
    let running = true

    const small = window.innerWidth < 700
    const base = small ? 34 : 60
    const max = Math.round(base * 2.6)
    const rand = (a, b) => a + Math.random() * (b - a)
    const parts = Array.from({ length: max }, (_, i) => ({
      x: Math.random(),
      y: Math.random(),
      r: rand(4, i % 9 === 0 ? 16 : 10),
      depth: rand(0.15, 1),
      vy: rand(0.004, 0.018),
      vx: rand(-0.004, 0.004),
      tw: rand(0.4, 1.4),
      ph: rand(0, Math.PI * 2),
      a: rand(0.25, 0.85),
      s: i % COLORS.length,
    }))

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()

    const draw = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const boost = intensity ? intensity.get() : 0
      const count = Math.round(base + (max - base) * boost)
      const sy = scrollY ? scrollY.get() : 0
      ctx.clearRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'lighter'
      const t = now / 1000
      for (let i = 0; i < count; i++) {
        const p = parts[i]
        if (!reduce) {
          p.y -= p.vy * dt * (0.6 + p.depth)
          p.x += p.vx * dt + Math.sin(t * 0.3 + p.ph) * 0.00025
          if (p.y < -0.05) p.y += 1.1
          if (p.x < -0.05) p.x += 1.1
          if (p.x > 1.05) p.x -= 1.1
        }
        // fade in the boosted particles smoothly
        const fadeIn = i < base ? 1 : Math.min(1, (base + (max - base) * boost - i) / 6)
        const twinkle = reduce ? 0.8 : 0.55 + 0.45 * Math.sin(t * p.tw + p.ph)
        const alpha = p.a * twinkle * fadeIn
        if (alpha <= 0.01) continue
        let py = (p.y * h - sy * 0.12 * p.depth) % (h * 1.1)
        if (py < -h * 0.05) py += h * 1.1
        const size = p.r * (0.6 + p.depth * 0.6)
        ctx.globalAlpha = alpha
        ctx.drawImage(sprites[p.s], p.x * w - size / 2, py - size / 2, size, size)
      }
      ctx.globalAlpha = 1
      if (running && !reduce) raf = requestAnimationFrame(draw)
    }

    const loop = () => {
      cancelAnimationFrame(raf)
      last = performance.now()
      raf = requestAnimationFrame(draw)
    }
    loop()

    // with reduced motion, redraw only when scrolling / boosting
    const unsubs = reduce ? [scrollY?.on('change', loop), intensity?.on('change', loop)] : []

    const onVis = () => {
      running = !document.hidden
      if (running) loop()
    }
    const onResize = () => {
      resize()
      if (reduce) loop()
    }
    window.addEventListener('resize', onResize)
    document.addEventListener('visibilitychange', onVis)
    return () => {
      running = false
      cancelAnimationFrame(raf)
      unsubs.forEach((u) => u && u())
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [reduce, scrollY, intensity])

  return <canvas ref={ref} className="particles" aria-hidden="true" />
}
