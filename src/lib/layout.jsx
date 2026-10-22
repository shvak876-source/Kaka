import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

/**
 * Keeps track of where every scene sits in the document, so global effects
 * (timeline, background mood, particles) can be driven by the page scroll.
 * Each entry: S = scrollY where the scene's sticky stage locks, E = where it releases.
 */
const RegisterCtx = createContext(null)
const MetricsCtx = createContext(null)

function readMetrics(els) {
  const vh = window.innerHeight
  const scenes = {}
  els.forEach((el, id) => {
    const top = el.getBoundingClientRect().top + window.scrollY
    const height = el.offsetHeight
    scenes[id] = { S: top, E: Math.max(top + 1, top + height - vh), height }
  })
  return { vh, scenes }
}

export function LayoutProvider({ children }) {
  const els = useRef(new Map())
  const metricsRef = useRef({ vh: typeof window !== 'undefined' ? window.innerHeight : 800, scenes: {} })
  const [metrics, setMetrics] = useState(metricsRef.current)
  const frame = useRef(0)

  const measure = useCallback(() => {
    cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(() => {
      const next = readMetrics(els.current)
      metricsRef.current = next
      setMetrics(next)
    })
  }, [])

  const register = useCallback(
    (id, el) => {
      els.current.set(id, el)
      measure()
      return () => {
        els.current.delete(id)
        measure()
      }
    },
    [measure]
  )

  useEffect(() => {
    const ro = new ResizeObserver(measure)
    ro.observe(document.body)
    window.addEventListener('resize', measure)
    window.addEventListener('orientationchange', measure)
    document.fonts?.ready.then(measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
      window.removeEventListener('orientationchange', measure)
    }
  }, [measure])

  const metricsValue = useMemo(() => ({ metrics, metricsRef }), [metrics])

  return (
    <RegisterCtx.Provider value={register}>
      <MetricsCtx.Provider value={metricsValue}>{children}</MetricsCtx.Provider>
    </RegisterCtx.Provider>
  )
}

export function useRegisterScene(id, ref) {
  const register = useContext(RegisterCtx)
  useLayoutEffect(() => register(id, ref.current), [id, ref, register])
}

export function useMetrics() {
  return useContext(MetricsCtx)
}

/* ---------- small math helpers for scroll-driven values ---------- */

export const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v)
export const ramp = (v, a, b) => clamp01((v - a) / (b - a || 1))

/** 0 before a, rises to 1 at b, holds until c, falls to 0 at d */
export const bump = (v, a, b, c, d) => (v < c ? ramp(v, a, b) : 1 - ramp(v, c, d))

/** scrollY at a given fraction of a scene's progress */
export const sceneY = (m, id, f) => {
  const s = m.scenes[id]
  return s ? s.S + (s.E - s.S) * f : NaN
}
