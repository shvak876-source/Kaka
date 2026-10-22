import { motion, useReducedMotion, useSpring, useTransform } from 'framer-motion'
import { story } from '../data/story'
import { ramp, sceneY, useMetrics } from '../lib/layout'
import { arrowEnd } from '../lib/schedule'

const BODY = 'M460 290 C 280 300, 100 520, 80 850 C 68 1020, 82 1150, 104 1240'
const HEAD = 'M79 1188 L104 1242 L120 1184'
const TAIL = 'M106 1250 C 142 1350, 192 1440, 252 1530'

/**
 * The page's scroll indicator: a hand-drawn arrow that stays on screen for the whole story.
 * A faint outline draws itself on load; as she scrolls, light pours through it, and the
 * arrowhead lights up when she reaches the invitation.
 */
export function ScrollArrow({ scrollY }) {
  const { metricsRef } = useMetrics()
  const reduce = useReducedMotion()
  const delay = (0.9 + story.opening.lines.length * 1.5) * (reduce ? 0.25 : 1)

  const raw = useTransform(scrollY, (y) => {
    const end = sceneY(metricsRef.current, ...arrowEnd)
    return Number.isFinite(end) && end > 0 ? ramp(y, 0, end) : 0
  })
  const smooth = useSpring(raw, { stiffness: 220, damping: 38, mass: 0.35, restDelta: 0.0002 })
  const fill = reduce ? raw : smooth
  const body = useTransform(fill, [0, 0.9], [0, 1])
  const head = useTransform(fill, [0.9, 0.96], [0, 1])
  const tail = useTransform(fill, [0.96, 1], [0, 1])
  const lit = useTransform(fill, [0.9, 1], [0, 1])
  const hide = (v) => (v < 0.001 ? 0 : 1)

  const draw = (extra, duration) => ({
    initial: { pathLength: reduce ? 1 : 0, opacity: 0 },
    animate: { pathLength: 1, opacity: 1 },
    transition: {
      pathLength: { delay: delay + extra, duration: reduce ? 0 : duration, ease: [0.65, 0, 0.35, 1] },
      opacity: { delay: delay + extra, duration: 0.3 },
    },
  })
  const line = { fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' }

  return (
    <div className="scroll-arrow" aria-hidden="true">
      <svg viewBox="0 0 920 1530" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="arrowStroke" gradientUnits="userSpaceOnUse" x1="0" y1="290" x2="0" y2="1245">
            <stop offset="0" stopColor="#ffd0e3" />
            <stop offset="1" stopColor="#fff0f6" />
          </linearGradient>
          <linearGradient id="arrowTail" gradientUnits="userSpaceOnUse" x1="0" y1="1250" x2="0" y2="1530">
            <stop offset="0" stopColor="#ffd0e3" stopOpacity="0.8" />
            <stop offset="1" stopColor="#ffd0e3" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="arrowGlow">
            <stop offset="0" stopColor="#ffb3cf" stopOpacity="0.7" />
            <stop offset="1" stopColor="#ffb3cf" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* the empty outline */}
        <g className="arrow-track">
          <motion.path d={BODY} stroke="#f3c6dc" strokeWidth="2.4" {...line} {...draw(0, 2.2)} />
          <motion.path d={HEAD} stroke="#f3c6dc" strokeWidth="2.6" {...line} {...draw(2.1, 0.45)} />
          <motion.path d={TAIL} stroke="url(#arrowTail)" strokeWidth="2" {...line} {...draw(2.4, 1.2)} />
        </g>

        {/* the light that fills it with the scroll */}
        <g className="arrow-fill">
          <motion.path d={BODY} stroke="url(#arrowStroke)" strokeWidth="4" {...line} style={{ pathLength: body, opacity: useTransform(body, hide) }} />
          <motion.path d={HEAD} stroke="#fff0f6" strokeWidth="4.4" {...line} style={{ pathLength: head, opacity: useTransform(head, hide) }} />
          <motion.path d={TAIL} stroke="url(#arrowTail)" strokeWidth="3" {...line} style={{ pathLength: tail, opacity: useTransform(tail, hide) }} />
        </g>

        {/* the glow at the tip brightens as the arrow fills */}
        <motion.g style={{ opacity: useTransform(lit, (v) => 0.45 + v * 0.55) }}>
          <motion.circle
            className={reduce ? undefined : 'arrow-glow'}
            cx="102"
            cy="1236"
            r="56"
            fill="url(#arrowGlow)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 2.2, duration: 0.8 }}
          />
        </motion.g>
      </svg>
    </div>
  )
}
