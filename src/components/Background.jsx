import { motion, useReducedMotion, useTransform } from 'framer-motion'

/** Deep black canvas with slow, parallaxing glows in rose, plum and wine. */
export function Background({ mood }) {
  const reduce = useReducedMotion()
  const { scrollY, warm, dark, finale } = mood
  const k = reduce ? 0 : 1
  // gentle drift tied to scroll: moves slower than the text, but never leaves the screen
  const t1 = useTransform(scrollY, (v) => Math.sin(v / 1400) * 140 * k)
  const t2 = useTransform(scrollY, (v) => Math.cos(v / 1900) * 180 * k)
  const t3 = useTransform(scrollY, (v) => Math.sin(v / 1100 + 1.7) * 110 * k)
  const dim = useTransform([dark, finale], ([d, f]) => d * 0.55 * (1 - f * 0.6))

  return (
    <div className="bg" aria-hidden="true">
      <motion.div className="bg-glow g1" style={{ y: t1 }} />
      <motion.div className="bg-glow g2" style={{ y: t2 }} />
      <motion.div className="bg-glow g3" style={{ y: t3 }} />
      <motion.div className="bg-warm" style={{ opacity: warm }} />
      <motion.div className="bg-dark" style={{ opacity: dim }} />
      <motion.div className="bg-finale" style={{ opacity: finale }} />
      <div className="bg-vignette" />
      <div className="bg-grain" />
    </div>
  )
}
