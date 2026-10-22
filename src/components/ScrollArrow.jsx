import { useLayoutEffect, useMemo, useRef } from 'react'
import { motion, useMotionValueEvent, useReducedMotion } from 'framer-motion'
import { story } from '../data/story'
import { ramp, sceneY, useMetrics } from '../lib/layout'
import { arrowEnd } from '../lib/schedule'

/** Where the arrowhead sits on screen, as a fraction of the screen height. */
const TIP = 0.8
/** How tall each half-circle is compared to how wide it is (1 = a true half-circle). */
const ROUNDNESS = 1.1
const SAMPLES_PER_SWING = 140

/**
 * Lays a snake of half-ellipses down the whole page, swinging left and right through the
 * middle of the screen. Returns the polyline plus, for every point, its y and its distance
 * along the line, so the scroll position can be turned into "how far the arrow has travelled".
 */
function buildPath(width, vh, start, end) {
  const cx = width / 2
  const rx = Math.min(width * 0.38, vh * 0.3)
  const count = Math.max(1, Math.round((end - start) / (rx * ROUNDNESS * 2)))
  const ry = (end - start) / count / 2
  const xs = []
  const ys = []
  const lens = []
  let total = 0
  for (let k = 0; k < count; k++) {
    const side = k % 2 === 0 ? -1 : 1
    const top = start + k * ry * 2
    for (let i = k === 0 ? 0 : 1; i <= SAMPLES_PER_SWING; i++) {
      const t = (i / SAMPLES_PER_SWING) * Math.PI
      const x = cx + side * rx * Math.sin(t)
      const y = top + ry * (1 - Math.cos(t))
      if (xs.length) total += Math.hypot(x - xs[xs.length - 1], y - ys[ys.length - 1])
      xs.push(x)
      ys.push(y)
      lens.push(total)
    }
  }
  let d = `M${xs[0].toFixed(1)} ${ys[0].toFixed(1)}`
  for (let i = 1; i < xs.length; i++) d += `L${xs[i].toFixed(1)} ${ys[i].toFixed(1)}`
  return { d, xs, ys, lens, total }
}

/** The point the arrow has reached once its tip is at height `y`, and the way it is heading. */
function pointAt(p, y) {
  const { xs, ys, lens } = p
  const last = ys.length - 1
  if (y <= ys[0]) return { len: 0, x: xs[0], y: ys[0], angle: Math.PI / 2 }
  let lo = 0
  let hi = last
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1
    if (ys[mid] < y) lo = mid
    else hi = mid
  }
  const f = ys[hi] === ys[lo] ? 0 : Math.min(1, (y - ys[lo]) / (ys[hi] - ys[lo]))
  const angle = Math.atan2(ys[hi] - ys[lo], xs[hi] - xs[lo])
  return {
    len: lens[lo] + (lens[hi] - lens[lo]) * f,
    x: xs[lo] + (xs[hi] - xs[lo]) * f,
    y: ys[lo] + (ys[hi] - ys[lo]) * f,
    angle,
  }
}

/**
 * The page's scroll indicator: a glowing arrow that travels down the page in half-circles
 * as she scrolls, drawing its path behind it, and bows out when the invitation appears.
 */
export function ScrollArrow({ scrollY }) {
  const { metrics } = useMetrics()
  const reduce = useReducedMotion()
  const delay = (0.9 + story.opening.lines.length * 1.5) * (reduce ? 0.25 : 1)
  const world = useRef(null)
  const line = useRef(null)
  const head = useRef(null)
  const fade = useRef(null)

  const { vh } = metrics
  const width = typeof window !== 'undefined' ? window.innerWidth : 400
  const finishY = sceneY(metrics, ...arrowEnd)
  const ready = Number.isFinite(finishY)

  const path = useMemo(
    () => (ready ? buildPath(width, vh, vh * TIP, finishY + vh * TIP) : null),
    [ready, width, vh, finishY]
  )

  const update = (sy) => {
    if (!path || !world.current) return
    const p = pointAt(path, sy + vh * TIP)
    world.current.setAttribute('transform', `translate(0 ${-sy})`)
    line.current.setAttribute('stroke-dasharray', `${p.len} ${path.total + vh}`)
    head.current.setAttribute('transform', `translate(${p.x} ${p.y - sy}) rotate(${(p.angle * 180) / Math.PI - 90})`)
    fade.current.style.opacity = String(1 - ramp(sy, finishY - vh * 0.6, finishY))
  }

  useMotionValueEvent(scrollY, 'change', update)
  useLayoutEffect(() => update(scrollY.get()))

  if (!path) return null

  return (
    <motion.div
      className="scroll-arrow"
      aria-hidden="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 1.4 }}
    >
      <div ref={fade} className="scroll-arrow-fade">
        <svg width={width} height={vh} viewBox={`0 0 ${width} ${vh}`}>
          <defs>
            {/* the trail fades away towards the top of the screen */}
            <linearGradient id="trailFade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fff" stopOpacity="0" />
              <stop offset={TIP * 0.55} stopColor="#fff" stopOpacity="0.55" />
              <stop offset={TIP} stopColor="#fff" stopOpacity="1" />
            </linearGradient>
            <mask id="trailMask" maskUnits="userSpaceOnUse" x="0" y="0" width={width} height={vh}>
              <rect width={width} height={vh} fill="url(#trailFade)" />
            </mask>
            <radialGradient id="arrowGlow">
              <stop offset="0" stopColor="#ffb3cf" stopOpacity="0.75" />
              <stop offset="1" stopColor="#ffb3cf" stopOpacity="0" />
            </radialGradient>
          </defs>
          <g mask="url(#trailMask)" className="arrow-line">
            <g ref={world}>
              <path ref={line} d={path.d} fill="none" stroke="#ffd6e7" strokeWidth="2.6" strokeLinecap="round" strokeDasharray={`0 ${path.total + vh}`} />
            </g>
          </g>
          <g ref={head}>
            <circle className={reduce ? undefined : 'arrow-glow'} r="26" fill="url(#arrowGlow)" />
            <path
              className="arrow-line"
              d="M-10 -13 L0 0 L10 -13"
              fill="none"
              stroke="#fff0f6"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        </svg>
      </div>
    </motion.div>
  )
}
