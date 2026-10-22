import { useScroll, useTransform } from 'framer-motion'
import { bump, ramp, useMetrics } from './layout'

/**
 * Global "mood" of the page, derived from scroll position:
 *  warm   – rosy/red glow during chapter 4
 *  dark   – the screen dims from chapter 5 onwards
 *  finale – soft light fills the final scene
 */
export function useMood() {
  const { scrollY } = useScroll()
  const { metricsRef } = useMetrics()

  const warm = useTransform(scrollY, (y) => {
    const { scenes: s, vh } = metricsRef.current
    if (!s.changed) return 0
    return bump(y, s.changed.S - vh * 0.7, s.changed.S + vh * 0.2, s.changed.E - vh * 0.2, s.changed.E + vh * 0.6)
  })

  const dark = useTransform(scrollY, (y) => {
    const { scenes: s, vh } = metricsRef.current
    if (!s.whatNow) return 0
    return ramp(y, s.whatNow.S - vh * 0.5, s.whatNow.S + vh * 0.5)
  })

  const finale = useTransform(scrollY, (y) => {
    const { scenes: s, vh } = metricsRef.current
    if (!s.finale) return 0
    return ramp(y, s.finale.S - vh * 0.4, s.finale.S + (s.finale.E - s.finale.S) * 0.65)
  })

  return { scrollY, warm, dark, finale }
}
