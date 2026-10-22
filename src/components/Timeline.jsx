import { useState } from 'react'
import { motion, useMotionValueEvent, useReducedMotion, useTransform } from 'framer-motion'
import { ramp, sceneY, useMetrics } from '../lib/layout'
import { timelineEnd, timelineStops } from '../lib/schedule'

/** The glowing vertical line that fills with light as the story unfolds. */
export function Timeline({ mood }) {
  const { metrics, metricsRef } = useMetrics()
  const reduce = useReducedMotion()
  const { scrollY, warm } = mood
  const [pulse, setPulse] = useState(false)
  useMotionValueEvent(warm, 'change', (v) => setPulse(v > 0.5))

  const bounds = (m) => {
    const p0 = sceneY(m, ...timelineStops[0])
    const p1 = sceneY(m, ...timelineEnd)
    return [p0, p1]
  }

  const progress = useTransform(scrollY, (y) => {
    const [p0, p1] = bounds(metricsRef.current)
    return Number.isFinite(p0) && Number.isFinite(p1) ? ramp(y, p0, p1) : 0
  })
  const visible = useTransform(scrollY, (y) => {
    const { scenes, vh } = metricsRef.current
    if (!scenes.opening) return 0
    return ramp(y, scenes.opening.S + vh * 0.2, scenes.opening.E + vh * 0.1)
  })
  const fillScale = useTransform(progress, (v) => Math.max(0.0001, v))
  const headTop = useTransform(progress, (v) => `${v * 100}%`)
  const heartLit = useTransform(progress, (v) => ramp(v, 0.97, 1))
  const heartScale = useTransform(heartLit, (v) => 0.7 + v * 0.45)

  const [p0, p1] = bounds(metrics)
  const ready = Number.isFinite(p0) && Number.isFinite(p1) && p1 > p0
  const stops = ready
    ? timelineStops.map(([id, f, major]) => ({ at: (sceneY(metrics, id, f) - p0) / (p1 - p0), major }))
    : []

  return (
    <motion.div className={`timeline ${pulse && !reduce ? 'is-pulsing' : ''}`} style={{ opacity: visible }} aria-hidden="true">
      <div className="tl-track">
        <motion.div className="tl-fill" style={{ scaleY: fillScale }} />
        <motion.div className="tl-head" style={{ top: headTop }} />
        {stops.map((s, i) => (
          <Dot key={i} at={s.at} major={s.major} progress={progress} />
        ))}
        <motion.div className="tl-heart" style={{ opacity: useTransform(heartLit, (v) => 0.25 + v * 0.75), scale: heartScale }}>
          <HeartIcon />
          <motion.span className="tl-heart-glow" style={{ opacity: heartLit }} />
        </motion.div>
      </div>
    </motion.div>
  )
}

function Dot({ at, major, progress }) {
  const lit = useTransform(progress, (v) => ramp(v, at - 0.012, at + 0.004))
  const scale = useTransform(lit, (v) => (major ? 0.75 + v * 0.45 : 0.6 + v * 0.35))
  const glow = useTransform(lit, (v) => v)
  return (
    <div className={`tl-dot ${major ? 'major' : 'minor'}`} style={{ top: `${at * 100}%` }}>
      <motion.span className="tl-dot-core" style={{ scale, opacity: useTransform(lit, (v) => 0.3 + v * 0.7) }} />
      <motion.span className="tl-dot-glow" style={{ opacity: glow, scale }} />
    </div>
  )
}

export function HeartIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="100%" height="100%">
      <path
        fill="currentColor"
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      />
    </svg>
  )
}
