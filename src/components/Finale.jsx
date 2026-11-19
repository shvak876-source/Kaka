import { useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useTransform } from 'framer-motion'
import { story } from '../data/story'
import { schedule } from '../lib/schedule'
import { Beat, Scene, useSceneProgress } from './Scene'
import { RsvpDocument } from './Rsvp'

/* ============ הסיום — ההזמנה לדייט ============ */
export function Finale() {
  const c = story.invitation
  const sch = schedule.finale
  const [open, setOpen] = useState(false)

  return (
    <Scene id="finale" units={sch.U} className="finale">
      <div className="layer">
        <Beat range={sch.introIn} lift={0}>
          <Handwriting text={c.intro} at={sch.introIn[0]} className="finale-intro glow-text" />
        </Beat>
        <div className="finale-letter">
          {c.paragraphs.map((p, i) => (
            <Beat key={i} as="p" range={sch.paragraphs[i]} className="finale-paragraph" lift={18}>
              {p}
            </Beat>
          ))}
        </div>
        <div className="heart-frame">
          <HeartLine range={sch.heart} />
          <Beat range={sch.buttonIn} className="heart-frame-button" lift={10}>
            <button className="btn btn-primary btn-rsvp" onClick={() => setOpen(true)}>
              {c.rsvpButton}
            </button>
          </Beat>
        </div>
      </div>

      <FinaleHalo />
      <AnimatePresence>{open && <RsvpDocument onClose={() => setOpen(false)} />}</AnimatePresence>
    </Scene>
  )
}

/**
 * The words write themselves from right to left, with a little glowing pen at the edge,
 * once she reaches them; scrolling back up rubs them out again.
 */
function Handwriting({ text, at, className }) {
  const progress = useSceneProgress()
  const reduce = useReducedMotion()
  const [written, setWritten] = useState(() => progress.get() > at)
  useMotionValueEvent(progress, 'change', (p) => setWritten(p > at))

  const duration = reduce ? 0 : 2.2
  const shown = { clipPath: 'inset(-20% 0% -20% 0%)' }
  const hidden = { clipPath: 'inset(-20% 0% -20% 100%)' }
  return (
    <p className={`handwriting ${className}`}>
      <motion.span
        className="handwriting-ink"
        initial={hidden}
        animate={written ? shown : hidden}
        transition={{ duration: written ? duration : 0.4, ease: [0.45, 0.05, 0.4, 1] }}
      >
        {text}
      </motion.span>
      {!reduce && (
        <motion.span
          className="handwriting-pen"
          aria-hidden="true"
          initial={{ right: '0%', opacity: 0 }}
          animate={written ? { right: ['0%', '100%'], opacity: [0, 1, 1, 0] } : { right: '0%', opacity: 0 }}
          transition={{ duration: written ? duration : 0.2, ease: [0.45, 0.05, 0.4, 1] }}
        />
      )}
    </p>
  )
}

/** The heart the scroll arrow turns into: drawn around the button, with a glowing tip leading the line. */
const HEART =
  'M100 50 C92 22 62 6 38 16 C10 28 4 66 26 96 C46 124 80 146 100 172 C120 146 154 124 174 96 C196 66 190 28 162 16 C138 6 108 22 100 50'

function HeartLine({ range }) {
  const progress = useSceneProgress()
  const path = useRef(null)
  const tip = useRef(null)
  const drawn = useTransform(progress, range, [0, 1])
  const opacity = useTransform(progress, [range[0], range[0] + 0.01], [0, 1])
  const tipOpacity = useTransform(progress, [range[0], range[0] + 0.01, range[1] - 0.02, range[1] + 0.03], [0, 1, 1, 0])

  const place = (f) => {
    if (!path.current || !tip.current) return
    const p = path.current.getPointAtLength(path.current.getTotalLength() * f)
    tip.current.setAttribute('transform', `translate(${p.x} ${p.y})`)
  }
  useMotionValueEvent(drawn, 'change', place)
  useLayoutEffect(() => place(drawn.get()))

  return (
    <svg className="heart-line" viewBox="-10 -6 220 192" aria-hidden="true">
      <defs>
        <radialGradient id="heartTipGlow">
          <stop offset="0" stopColor="#ffb3cf" stopOpacity="0.8" />
          <stop offset="1" stopColor="#ffb3cf" stopOpacity="0" />
        </radialGradient>
      </defs>
      <motion.path ref={path} d={HEART} style={{ pathLength: drawn, opacity }} />
      <motion.g ref={tip} style={{ opacity: tipOpacity }}>
        <circle r="10" fill="url(#heartTipGlow)" />
        <circle r="1.8" fill="#fff0f6" />
      </motion.g>
    </svg>
  )
}

function FinaleHalo() {
  const progress = useSceneProgress()
  const { introIn } = schedule.finale
  const opacity = useTransform(progress, [introIn[0], introIn[1]], [0, 1])
  return <motion.div className="finale-halo" style={{ opacity }} aria-hidden="true" />
}
