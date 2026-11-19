import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { story } from '../data/story'

const EASE = [0.22, 1, 0.36, 1]

/**
 * The story starts dressed up as a plain, innocent little questionnaire. With every answer a little
 * more colour leaks in; on "send" it glitches, splits down the middle and the story opens behind it.
 * `onOpen` fires as the split starts (so the story mounts and plays its intro as it is revealed),
 * `onDone` once the disguise is completely gone.
 */
export function Disguise({ onOpen, onDone }) {
  const c = story.disguise
  const reduce = useReducedMotion()
  const [step, setStep] = useState(0)
  const [answer, setAnswer] = useState(null)
  // survey → sending → glitch → split
  const [phase, setPhase] = useState('survey')
  const last = step === c.questions.length - 1
  const q = c.questions[step]

  useEffect(() => {
    if (phase === 'sending') {
      const t = setTimeout(() => setPhase('glitch'), reduce ? 300 : 1300)
      return () => clearTimeout(t)
    }
    if (phase === 'glitch') {
      const t = setTimeout(() => {
        setPhase('split')
        onOpen()
      }, reduce ? 200 : 1500)
      return () => clearTimeout(t)
    }
    if (phase === 'split') {
      const t = setTimeout(onDone, reduce ? 500 : 1700)
      return () => clearTimeout(t)
    }
  }, [phase, reduce, onOpen, onDone])

  const next = () => {
    if (answer === null) return
    if (last) setPhase('sending')
    else {
      setStep(step + 1)
      setAnswer(null)
    }
  }

  const split = phase === 'split'
  const half = (side) => ({
    initial: false,
    animate: split ? { x: `${side * 105}%` } : { x: 0 },
    transition: { duration: reduce ? 0.4 : 1.5, ease: [0.7, 0, 0.2, 1] },
  })

  return (
    <div className={`disguise tint-${step}${phase === 'glitch' ? ' glitching' : ''}`} role="dialog" aria-label={c.title}>
      {/* the grey curtain, in two halves that slide apart */}
      <motion.div className="disguise-half left" {...half(-1)} />
      <motion.div className="disguise-half right" {...half(1)} />
      {split && <motion.div className="disguise-seam" initial={{ scaleY: 0, opacity: 1 }} animate={{ scaleY: 1, opacity: 0 }} transition={{ duration: 1.2, ease: EASE }} />}

      <AnimatePresence>
        {!split && (
          <motion.div
            className="survey"
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.35 }}
          >
            <div className="survey-head">
              <span className="survey-logo" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="100%" height="100%">
                  {step < 2 ? (
                    <rect x="4" y="4" width="16" height="16" rx="4" fill="currentColor" />
                  ) : (
                    <path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  )}
                </svg>
              </span>
              <div>
                <p className="survey-title">{c.title}</p>
                <p className="survey-ticket">{c.ticket}</p>
              </div>
            </div>

            <div className="survey-progress">
              <span style={{ width: `${((step + (phase === 'survey' ? 0 : 1)) / c.questions.length) * 100}%` }} />
            </div>

            {phase === 'survey' ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="survey-count">
                    שאלה {step + 1} מתוך {c.questions.length}
                  </p>
                  <p className="survey-q">{q.q}</p>
                  <div className="survey-options" role="radiogroup">
                    {q.options.map((o, i) => (
                      <button
                        key={i}
                        type="button"
                        role="radio"
                        aria-checked={answer === i}
                        className={`survey-option${answer === i ? ' picked' : ''}`}
                        onClick={() => setAnswer(i)}
                      >
                        <span className="survey-radio" aria-hidden="true" />
                        {o}
                      </button>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            ) : (
              <div className="survey-status">
                {phase === 'sending' ? (
                  <>
                    <span className="survey-spinner" aria-hidden="true" />
                    {c.sending}
                  </>
                ) : (
                  <span className="survey-oops">{c.oops}</span>
                )}
              </div>
            )}

            {phase === 'survey' && (
              <button type="button" className="survey-next" disabled={answer === null} onClick={next}>
                {last ? c.submit : c.next}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
