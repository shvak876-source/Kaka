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
 * tied directly to the scene's scroll progress.
 */
export function Beat({ range, out, as = 'div', className, style, lift = 26, blur = 8, children, ...rest }) {
  const progress = useSceneProgress()
  const reduce = useReducedMotion()
  const [a, b] = range ?? [-2, -1]
  const [c, d] = out ?? [2, 3]
  const input = [a, b, c, d]
  const opacity = useTransform(progress, input, [0, 1, 1, 0])
  const y = useTransform(progress, input, reduce ? [0, 0, 0, 0] : [lift, 0, 0, -lift])
  const filter = useTransform(
    progress,
    input,
    reduce || !blur ? ['none', 'none', 'none', 'none'] : [`blur(${blur}px)`, 'blur(0px)', 'blur(0px)', `blur(${blur * 0.75}px)`]
  )
  const visibility = useTransform(opacity, (o) => (o < 0.002 ? 'hidden' : 'visible'))
  const Comp = motion[as]
  return (
    <Comp className={className} style={{ ...style, opacity, y, filter, visibility }} {...rest}>
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
  const filter = useTransform(progress, range, reduce ? ['none', 'none'] : ['blur(6px)', 'blur(0px)'])
  return (
    <motion.span className="word" style={{ opacity, y, filter }}>
      {children}
    </motion.span>
  )
}

/** Moves children at a different rate than the text (subtle parallax). */
export function Parallax({ amount = 60, className, children }) {
  const progress = useSceneProgress()
  const reduce = useReducedMotion()
  const y = useTransform(progress, [0, 1], reduce ? [0, 0] : [amount, -amount])
  return (
    <motion.div className={className} style={{ y }}>
      {children}
    </motion.div>
  )
}
