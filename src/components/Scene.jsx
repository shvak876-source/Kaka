import { createContext, useContext, useRef } from 'react'
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import { useRegisterScene } from '../lib/layout'

const ProgressCtx = createContext(null)
export const useSceneProgress = () => useContext(ProgressCtx)

/**
 * A tall section with a sticky, full-screen stage.
 * `units` = how many screens of scrolling the scene lasts.
 */
export function Scene({ id, units, className = '', children }) {
  const ref = useRef(null)
  useRegisterScene(id, ref)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  // a light spring softens jumpy touch scrolling without feeling laggy
  const smooth = useSpring(scrollYProgress, { stiffness: 220, damping: 38, mass: 0.35, restDelta: 0.0002 })
  const progress = reduce ? scrollYProgress : smooth

  return (
    <section ref={ref} id={id} className={`scene ${className}`} style={{ height: `${(units + 1) * 100}vh` }}>
      <div className="stage">
        <ProgressCtx.Provider value={progress}>{children}</ProgressCtx.Provider>
      </div>
    </section>
  )
}

/**
 * Fades + lifts in over range[0..1], and (optionally) out over range[2..3],
 * tied directly to the scene's scroll progress. No blur: animating a filter on
 * every scroll frame is what makes phones stutter.
 */
export function Beat({ range, out, as = 'div', className, style, lift = 26, children, ...rest }) {
  const progress = useSceneProgress()
  const reduce = useReducedMotion()
  const [a, b] = range ?? [-2, -1]
  const [c, d] = out ?? [2, 3]
  const input = [a, b, c, d]
  const opacity = useTransform(progress, input, [0, 1, 1, 0])
  const y = useTransform(progress, input, reduce ? [0, 0, 0, 0] : [lift, 0, 0, -lift])
  const visibility = useTransform(opacity, (o) => (o < 0.002 ? 'hidden' : 'visible'))
  const Comp = motion[as]
  return (
    <Comp className={className} style={{ ...style, opacity, y, visibility }} {...rest}>
      {children}
    </Comp>
  )
}

/** Reveals a sentence word by word across `range`. */
export function Words({ text, range, className }) {
  const words = text.split(/\s+/).filter(Boolean)
  const [a, b] = range
  const n = words.length
  const span = b - a
  return (
    <span className={className}>
      {words.map((w, i) => {
        const s = a + (span * i) / (n + 0.6)
        const e = Math.min(b, s + (span * 1.6) / (n + 0.6))
        return (
          <span key={i}>
            <Word range={[s, e]}>{w}</Word>
            {i < n - 1 ? ' ' : ''}
          </span>
        )
      })}
    </span>
  )
}

function Word({ range, children }) {
  const progress = useSceneProgress()
  const reduce = useReducedMotion()
  const opacity = useTransform(progress, range, [0, 1])
  const y = useTransform(progress, range, reduce ? [0, 0] : [14, 0])
  return (
    <motion.span className="word" style={{ opacity, y }}>
      {children}
    </motion.span>
  )
}
