import { useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion, useTransform } from 'framer-motion'
import { story } from '../data/story'
import { schedule } from '../lib/schedule'
import { Beat, Scene, useSceneProgress, Words } from './Scene'

const EASE = [0.22, 1, 0.36, 1]

/* ============ הפרק האחרון — ההזמנה לדייט ============ */
export function Finale() {
  const c = story.invitation
  const sch = schedule.finale
  const [answer, setAnswer] = useState(null) // null | 'yes' | 'maybe'

  return (
    <Scene id="finale" units={sch.U} className="finale">
      <Beat range={sch.introIn} out={sch.introOut} className="layer">
        <p className="opening-name glow-text">{c.intro}</p>
      </Beat>

      <div className="layer">
        <AnimatePresence mode="wait">
          {answer !== 'yes' ? (
            <motion.div
              key="ask"
              className="ask"
              exit={{ opacity: 0, scale: 0.96, filter: 'blur(8px)' }}
              transition={{ duration: 0.6, ease: EASE }}
            >
              <h2 className="invite-title glow-text">
                <Words text={c.question} range={sch.questionIn} />
              </h2>
              <Beat range={sch.buttonsIn} className="ask-actions" lift={16} blur={0}>
                <AnimatePresence mode="wait" initial={false}>
                  {answer === 'maybe' ? (
                    <motion.div
                      key="maybe"
                      className="maybe"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.7, ease: EASE }}
                    >
                      <p className="maybe-text">{c.maybeMessage}</p>
                      <WhatsApp text={c.whatsappMaybeText} />
                      <button className="btn btn-ghost btn-small" onClick={() => setAnswer('yes')}>
                        {c.changeMindButton}
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="buttons"
                      className="buttons"
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.4 }}
                    >
                      <button className="btn btn-primary" onClick={() => setAnswer('yes')}>
                        {c.yesButton}
                      </button>
                      <button className="btn btn-ghost" onClick={() => setAnswer('maybe')}>
                        {c.maybeButton}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Beat>
            </motion.div>
          ) : (
            <Celebration key="yes" />
          )}
        </AnimatePresence>
      </div>

      <FinaleHalo />
      {answer === 'yes' && <HeartsBurst />}
    </Scene>
  )
}

function FinaleHalo() {
  const progress = useSceneProgress()
  const { questionIn } = schedule.finale
  const opacity = useTransform(progress, [questionIn[0], questionIn[1]], [0, 1])
  return <motion.div className="finale-halo" style={{ opacity }} aria-hidden="true" />
}

function Celebration() {
  const c = story.invitation
  const fields = [
    ['מתי', c.details.date],
    ['באיזו שעה', c.details.time],
    ['איפה', c.details.place],
  ].filter(([, v]) => v)
  return (
    <motion.div
      className="celebration"
      initial={{ opacity: 0, scale: 0.92, filter: 'blur(10px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      transition={{ duration: 1.1, ease: EASE, delay: 0.15 }}
    >
      <motion.div
        className="celebration-heart"
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.25, 1] }}
        transition={{ duration: 1.1, ease: EASE, delay: 0.25 }}
      >
        <HeartIcon />
      </motion.div>
      <h2 className="invite-title glow-text">{c.yesMessage}</h2>

      <motion.div
        className="details"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.9 }}
      >
        {fields.length ? (
          <dl className="details-grid">
            {fields.map(([k, v]) => (
              <div key={k} className="details-row">
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="details-fallback">{c.detailsFallback}</p>
        )}
        {c.details.note ? <p className="details-note">{c.details.note}</p> : null}
      </motion.div>
      <WhatsApp text={c.whatsappYesText} delay={1.4} />
    </motion.div>
  )
}

function WhatsApp({ text, delay = 0.4 }) {
  const num = story.invitation.whatsappNumber.replace(/\D/g, '')
  if (!num) return null
  return (
    <motion.a
      className="btn btn-ghost btn-small"
      href={`https://wa.me/${num}?text=${encodeURIComponent(text)}`}
      target="_blank"
      rel="noreferrer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.8 }}
    >
      {story.invitation.whatsappButton}
    </motion.a>
  )
}

/** A soft burst of hearts, then a few that keep floating up. */
function HeartsBurst() {
  const reduce = useReducedMotion()
  const hearts = useMemo(() => {
    const rand = (a, b) => a + Math.random() * (b - a)
    const burst = Array.from({ length: reduce ? 0 : 26 }, (_, i) => ({
      id: `b${i}`,
      x: rand(-170, 170),
      y: rand(-380, -140),
      size: rand(12, 30),
      rot: rand(-40, 40),
      delay: rand(0, 0.35),
      dur: rand(2.2, 3.4),
      repeat: 0,
      fromBottom: false,
      hue: i % 3,
    }))
    const rising = Array.from({ length: reduce ? 6 : 14 }, (_, i) => ({
      id: `r${i}`,
      left: rand(4, 96),
      size: rand(10, 22),
      delay: 1 + rand(0, 6),
      dur: rand(6, 10),
      drift: rand(-40, 40),
      fromBottom: true,
      hue: i % 3,
    }))
    return [...burst, ...rising]
  }, [reduce])

  return (
    <div className="hearts" aria-hidden="true">
      {hearts.map((h) =>
        h.fromBottom ? (
          <motion.span
            key={h.id}
            className={`heart heart-h${h.hue}`}
            style={{ width: h.size, height: h.size, left: `${h.left}%`, bottom: -30 }}
            initial={{ y: 0, opacity: 0 }}
            animate={reduce ? { opacity: [0, 0.7, 0] } : { y: '-115vh', x: h.drift, opacity: [0, 0.8, 0.8, 0] }}
            transition={{ duration: h.dur, delay: h.delay, repeat: Infinity, ease: 'linear' }}
          >
            <HeartIcon />
          </motion.span>
        ) : (
          <motion.span
            key={h.id}
            className={`heart heart-burst heart-h${h.hue}`}
            style={{ width: h.size, height: h.size }}
            initial={{ x: 0, y: 0, scale: 0, opacity: 0, rotate: 0 }}
            animate={{ x: h.x, y: h.y, scale: [0, 1.2, 1], opacity: [0, 1, 0], rotate: h.rot }}
            transition={{ duration: h.dur, delay: h.delay, ease: EASE }}
          >
            <HeartIcon />
          </motion.span>
        )
      )}
    </div>
  )
}

function HeartIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="100%" height="100%">
      <path
        fill="currentColor"
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      />
    </svg>
  )
}
