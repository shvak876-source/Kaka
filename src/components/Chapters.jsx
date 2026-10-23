import { motion, useReducedMotion, useTransform } from 'framer-motion'
import { story } from '../data/story'
import { schedule } from '../lib/schedule'
import { Beat, Scene, useSceneProgress, Words } from './Scene'

const EASE = [0.22, 1, 0.36, 1]

/* ============ מסך פתיחה ============ */
export function Opening() {
  const reduce = useReducedMotion()
  const c = story.opening
  const sch = schedule.opening
  const d = reduce ? 0.25 : 1
  const appear = (delay) => ({
    initial: { opacity: 0, y: reduce ? 0 : 18, filter: reduce ? 'none' : 'blur(12px)' },
    animate: { opacity: 1, y: 0, filter: reduce ? 'none' : 'blur(0px)' },
    transition: { delay: delay * d, duration: reduce ? 0.6 : 1.8, ease: EASE },
  })
  return (
    <Scene id="opening" units={sch.U}>
      <Beat out={sch.out} className="layer" lift={40}>
        <motion.h1 className="opening-name glow-text" {...appear(0.3)}>
          {c.greeting}
        </motion.h1>
        <motion.p className="opening-line" {...appear(1.4)}>
          {c.line}
        </motion.p>
      </Beat>

      {/* hands over to the travelling scroll arrow as soon as she starts scrolling */}
      <Beat out={sch.hintOut} className="layer" lift={0} blur={0}>
        <div className="scroll-hint">
          <motion.span {...appear(2.4)}>{c.scrollHint}</motion.span>
          <motion.svg
            className={reduce ? 'scroll-hint-arrow' : 'scroll-hint-arrow scroll-hint-float'}
            viewBox="-10 -12 20 14"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <path d="M-7 -9 L0 0 L7 -9" fill="none" stroke="#fff0f6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </motion.svg>
        </div>
      </Beat>
    </Scene>
  )
}

/* ============ התמונה שממנה הכול התחיל ============ */
export function Meeting() {
  const c = story.meeting
  const sch = schedule.meeting
  return (
    <Scene id="meeting" units={sch.U}>
      <Beat out={sch.out} className="layer" lift={30} blur={6}>
        <Beat range={sch.title} className="title-block">
          <h2 className="chapter-title glow-text">{c.title}</h2>
        </Beat>
        <Beat range={sch.photo} className="photo-ring" lift={24}>
          <img src={`${import.meta.env.BASE_URL}${c.photo}`} alt="" />
        </Beat>
        <Beat as="p" range={sch.caption} className="photo-caption" lift={18}>
          {c.caption}
        </Beat>
      </Beat>
    </Scene>
  )
}

/* ============ השיחות ============ */
export function Conversations() {
  return <Line id="conversations" text={story.conversations.text} />
}

/* ============ לילה אחד ============ */
export function Night() {
  const c = story.night
  const sch = schedule.night
  return (
    <Scene id="night" units={sch.U}>
      <Beat out={sch.out} className="layer" lift={30} blur={6}>
        <Beat range={sch.title} className="title-block">
          <h2 className="chapter-title glow-text">{c.title}</h2>
        </Beat>
        <div className="bubbles">
          {c.messages.map((m, i) => (
            <Beat key={i} range={sch.bubbles[i]} className="bubble" lift={16} blur={4}>
              {m}
            </Beat>
          ))}
        </div>
      </Beat>
    </Scene>
  )
}

/* ============ חלק מהיום שלי ============ */
export function Moments() {
  const c = story.moments
  const sch = schedule.moments
  return (
    <Scene id="moments" units={sch.U}>
      <Beat out={sch.out} className="layer" blur={6}>
        <Beat as="p" range={sch.lead} className="whisper" lift={18}>
          {c.lead}
        </Beat>
        <p className="statement statement-after">
          <Words text={c.line} range={sch.line} />
        </p>
      </Beat>
    </Scene>
  )
}

/* ============ לקראת ההמשך ============ */
export function Announce() {
  return <Line id="announce" text={story.announce.text} />
}

/** A scene holding one sentence alone in the middle of the screen. */
function Line({ id, text }) {
  const sch = schedule[id]
  return (
    <Scene id={id} units={sch.U}>
      <Beat out={sch.out} className="layer" blur={6}>
        <p className="statement">
          <Words text={text} range={sch.in} />
        </p>
      </Beat>
    </Scene>
  )
}

/* ============ ההבנה ============ */
export function SomethingChanged() {
  const c = story.somethingChanged
  const sch = schedule.changed
  return (
    <Scene id="changed" units={sch.U}>
      {c.lines.map((l, i) => (
        <Beat key={i} range={sch.lines[i].in} out={sch.lines[i].out} className="layer">
          <p className="statement">{l}</p>
        </Beat>
      ))}
      <Beat out={sch.highlightOut} className="layer" blur={6}>
        <HighlightGlow range={sch.highlightIn} />
        <p className="statement statement-highlight">
          <Words text={c.highlight} range={sch.highlightIn} />
        </p>
      </Beat>
    </Scene>
  )
}

function HighlightGlow({ range }) {
  const progress = useSceneProgress()
  const opacity = useTransform(progress, [range[0] + (range[1] - range[0]) * 0.4, range[1]], [0, 1])
  const scale = useTransform(progress, [range[0], range[1]], [0.6, 1])
  return <motion.div className="highlight-glow" style={{ opacity, scale }} aria-hidden="true" />
}

/* ============ לקראת ההזמנה ============ */
export function WhatNow() {
  const c = story.whatNow
  const sch = schedule.whatNow
  return (
    <Scene id="whatNow" units={sch.U}>
      {c.lines.map((l, i) => (
        <Beat key={i} range={sch.lines[i].in} out={sch.lines[i].out} className="layer">
          <p className="statement">{l}</p>
        </Beat>
      ))}
      <Beat out={sch.questionOut} className="layer" blur={6}>
        <p className="statement statement-question">
          <Words text={c.question} range={sch.questionIn} />
        </p>
      </Beat>
    </Scene>
  )
}
