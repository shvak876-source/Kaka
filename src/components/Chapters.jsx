import { motion, useReducedMotion, useTransform } from 'framer-motion'
import { story } from '../data/story'
import { schedule } from '../lib/schedule'
import { Beat, Parallax, Scene, useSceneProgress, Words } from './Scene'

const EASE = [0.22, 1, 0.36, 1]

function ChapterMark({ label, date }) {
  return (
    <div className="chapter-mark">
      <span className="chapter-label">{label}</span>
      {date ? <span className="chapter-date">{date}</span> : null}
    </div>
  )
}

/* ============ מסך פתיחה ============ */
export function Opening() {
  const reduce = useReducedMotion()
  const { lines, scrollHint } = story.opening
  const sch = schedule.opening
  const d = reduce ? 0.25 : 1
  const appear = (i) => ({
    initial: { opacity: 0, y: reduce ? 0 : 18, filter: reduce ? 'none' : 'blur(12px)' },
    animate: { opacity: 1, y: 0, filter: reduce ? 'none' : 'blur(0px)' },
    transition: { delay: (0.9 + i * 1.5) * d, duration: reduce ? 0.6 : 1.8, ease: EASE },
  })
  return (
    <Scene id="opening" units={sch.U}>
      <Beat out={sch.out} className="layer" lift={40}>
        <motion.h1 className="opening-name glow-text" {...appear(0)}>
          {lines[0]}
        </motion.h1>
        {lines.slice(1).map((l, i) => (
          <motion.p key={i} className="opening-line" {...appear(i + 1)}>
            {l}
          </motion.p>
        ))}
      </Beat>
      <Beat out={[0, sch.out[1] * 0.5]} className="layer layer-bottom" lift={10} blur={0}>
        <motion.div
          className="scroll-hint"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: (0.9 + lines.length * 1.5) * d, duration: 1.2 }}
        >
          <span>{scrollHint}</span>
          <span className="scroll-arrow">↓</span>
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
      <Parallax className="deco deco-ring" amount={90} />
      <Beat out={sch.out} className="layer" lift={30} blur={6}>
        <Beat range={sch.title} className="title-block">
          <ChapterMark label={c.label} date={c.date} />
          <h2 className="chapter-title glow-text">{c.title}</h2>
        </Beat>
        <div className="paragraphs">
          {c.paragraphs.map((p, i) => (
            <Beat key={i} as="p" range={sch.lines[i]} className="story-line" lift={18}>
              {p}
            </Beat>
          ))}
        </div>
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
      <Parallax className="deco deco-bubbles" amount={120}>
        <span />
        <span />
        <span />
      </Parallax>

      <Beat out={sch.introOut} className="layer" blur={6}>
        <Beat range={sch.title} className="title-block">
          <ChapterMark label={c.label} date={c.date} />
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

      <Beat out={sch.bubblesOut} className="layer" lift={40} blur={4}>
        <div className="chat">
          {c.chat.map((m, i) => (
            <Bubble key={i} from={m.from} range={sch.bubbles[i]}>
              {m.text}
            </Bubble>
          ))}
        </div>
      </Beat>

      {sch.shots && (
        <Beat range={sch.shots.in} out={sch.shots.out} className="layer">
          <div className={`shots shots-${Math.min(3, c.screenshots.length)}`}>
            {c.screenshots.slice(0, 3).map((src, i) => (
              <div className="shot" key={i} style={{ '--i': i }}>
                <img src={src} alt="" loading="lazy" />
              </div>
            ))}
          </div>
        </Beat>
      )}

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

function Bubble({ from, range, children }) {
  const progress = useSceneProgress()
  const reduce = useReducedMotion()
  const opacity = useTransform(progress, range, [0, 1])
  const scale = useTransform(progress, range, reduce ? [1, 1] : [0.85, 1])
  const y = useTransform(progress, range, reduce ? [0, 0] : [22, 0])
  return (
    <motion.div className={`bubble bubble-${from}`} style={{ opacity, scale, y }}>
      {children}
    </motion.div>
  )
}

/* ============ פרק שלישי — הרגעים הקטנים ============ */
export function Moments() {
  const c = story.moments
  const sch = schedule.moments
  return (
    <Scene id="moments" units={sch.U}>
      <Beat range={sch.titleIn} out={sch.titleOut} className="layer">
        <ChapterMark label={c.label} />
        <h2 className="chapter-title chapter-title-long glow-text">{c.title}</h2>
      </Beat>

      {c.items.map((m, i) => (
        <Beat key={i} range={sch.moments[i].in} out={sch.moments[i].out} className="layer" lift={34}>
          <article className="moment">
            {m.image ? (
              <Parallax className="moment-photo" amount={18}>
                <img src={m.image} alt={m.title} loading="lazy" />
              </Parallax>
            ) : (
              <div className="moment-index" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </div>
            )}
            {m.date ? <span className="chapter-date">{m.date}</span> : null}
            <h3 className="moment-title">{m.title}</h3>
            <p className="moment-text">{m.text}</p>
          </article>
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
