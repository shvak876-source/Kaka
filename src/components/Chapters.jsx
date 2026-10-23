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
        <motion.h1 className="opening-name glow-text" {...appear(0.4)}>
          {c.greeting}
        </motion.h1>
        <motion.p className="opening-line" {...appear(1.6)}>
          {c.line}
        </motion.p>
        <motion.div className="scroll-hint" {...appear(3)}>
          <span className={reduce ? undefined : 'scroll-hint-float'}>{c.scrollHint}</span>
        </motion.div>
      </Beat>
    </Scene>
  )
}

/* ============ פרק ראשון — הרגע שבו הכרנו ============ */
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

/* ============ פרק שני — השיחות הראשונות ============ */
export function Conversations() {
  const c = story.conversations
  const sch = schedule.conversations
  return (
    <Scene id="conversations" units={sch.U}>
      <Beat out={sch.introOut} className="layer" blur={6}>
        <Beat range={sch.title} className="title-block">
          <h2 className="chapter-title glow-text">{c.title}</h2>
        </Beat>
        <div className="paragraphs">
          {c.intro.map((p, i) => (
            <Beat key={i} as="p" range={sch.introLines[i]} className="story-line" lift={18}>
              {p}
            </Beat>
          ))}
        </div>
      </Beat>

      <Beat out={sch.closingOut} className="layer" blur={6}>
        <p className="statement">
          {c.closing.wordByWord ? (
            <Words text={c.closing.text} range={sch.closingIn} />
          ) : (
            <Beat as="span" range={sch.closingIn}>
              {c.closing.text}
            </Beat>
          )}
        </p>
      </Beat>
    </Scene>
  )
}

/* ============ פרק שלישי — הרגעים הקטנים ============ */
export function Moments() {
  const c = story.moments
  const sch = schedule.moments
  return (
    <Scene id="moments" units={sch.U}>
      <Beat range={sch.titleIn} out={sch.titleOut} className="layer">
        <h2 className="chapter-title chapter-title-long glow-text">{c.title}</h2>
      </Beat>

      {c.items.map((text, i) => (
        <Beat key={i} range={sch.moments[i].in} out={sch.moments[i].out} className="layer" lift={34}>
          <p className="statement">{text}</p>
        </Beat>
      ))}
    </Scene>
  )
}

/* ============ פרק רביעי — משהו השתנה ============ */
export function SomethingChanged() {
  const c = story.somethingChanged
  const sch = schedule.changed
  return (
    <Scene id="changed" units={sch.U}>
      {c.lines.map((l, i) => (
        <Beat key={i} range={sch.lines[i].in} out={sch.lines[i].out} className="layer">
          <p className={i === 0 ? 'whisper' : 'statement'}>{l}</p>
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

/* ============ פרק חמישי — ומה עכשיו? ============ */
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
