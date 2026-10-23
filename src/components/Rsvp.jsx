import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { story } from '../data/story'

const EASE = [0.22, 1, 0.36, 1]
/** How much she has to draw (in px of stroke) before it counts as a signature, so a stray tap doesn't. */
const MIN_INK = 60

/** A first name and a last name: at least two words of two letters or more. */
const isFullName = (name) => name.trim().split(/\s+/).filter((w) => w.length >= 2).length >= 2

/* ============ מסמך אישור ההגעה ============ */
export function RsvpDocument({ onClose }) {
  const c = story.invitation.rsvp
  const [name, setName] = useState('')
  const [signed, setSigned] = useState(false)
  const [done, setDone] = useState(false)
  const ready = isFullName(name) && signed

  // the story keeps scrolling underneath otherwise
  useEffect(() => {
    const html = document.documentElement
    const prev = html.style.overflow
    html.style.overflow = 'hidden'
    return () => {
      html.style.overflow = prev
    }
  }, [])

  const confirm = (e) => {
    e.preventDefault()
    if (ready) setDone(true)
  }

  return createPortal(
    <motion.div
      className="rsvp-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rsvp-title"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="rsvp-scroll">
        <motion.form
          className="rsvp-card"
          onSubmit={confirm}
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.97 }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <button type="button" className="rsvp-close" onClick={onClose} aria-label={c.close}>
            ×
          </button>

          <div className="rsvp-head">
            <span className="rsvp-heart">
              <HeartIcon />
            </span>
            <p className="rsvp-kicker">{c.kicker}</p>
            <h2 id="rsvp-title" className="rsvp-title">
              {c.title}
            </h2>
          </div>

          <dl className="rsvp-details">
            {c.details.map(([k, v]) => (
              <div key={k} className="rsvp-row">
                <dt>{k}:</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>

          <label className="rsvp-field">
            <span className="rsvp-label">
              {c.nameLabel} <span className="rsvp-required">*</span>
            </span>
            <input
              className="rsvp-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={c.namePlaceholder}
              autoComplete="name"
              required
              disabled={done}
            />
          </label>

          <div className="rsvp-field">
            <span className="rsvp-label">
              {c.signatureLabel} <span className="rsvp-required">*</span>
            </span>
            <SignaturePad hint={c.signatureHint} clearLabel={c.clear} onChange={setSigned} locked={done} />
          </div>

          {done ? (
            <motion.div
              className="rsvp-success"
              role="status"
              initial={{ opacity: 0, y: 14, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, ease: EASE }}
            >
              <p className="rsvp-success-title">{c.successTitle}</p>
              <p className="rsvp-success-text">{c.successText}</p>
              <WhatsApp name={name} />
            </motion.div>
          ) : (
            <button type="submit" className="btn btn-primary rsvp-confirm" disabled={!ready}>
              {c.confirm}
            </button>
          )}
        </motion.form>
      </div>
      {done && <Burst />}
    </motion.div>,
    document.body
  )
}

/** A canvas she signs on with her finger (or mouse), with a button to start over. */
function SignaturePad({ hint, clearLabel, onChange, locked }) {
  const wrap = useRef(null)
  const canvas = useRef(null)
  const stroke = useRef(null)
  const ink = useRef(0)
  const [empty, setEmpty] = useState(true)

  const reset = () => {
    const cv = canvas.current
    cv.getContext('2d').clearRect(0, 0, cv.width, cv.height)
    ink.current = 0
    setEmpty(true)
    onChange(false)
  }

  // sizes the canvas to its box in device pixels; a new width means starting over
  useLayoutEffect(() => {
    let width = 0
    const fit = () => {
      // layout size, not the bounding box: the card is still scaling in on the first call
      const { offsetWidth: w, offsetHeight: h } = wrap.current
      if (w === width) return
      width = w
      const dpr = Math.min(window.devicePixelRatio || 1, 3)
      const cv = canvas.current
      cv.width = Math.round(w * dpr)
      cv.height = Math.round(h * dpr)
      const ctx = cv.getContext('2d')
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.lineWidth = 2.4
      ctx.strokeStyle = '#7a1f45'
      ink.current = 0
      setEmpty(true)
      onChange(false)
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(wrap.current)
    return () => ro.disconnect()
  }, [onChange])

  const point = (e) => {
    const cv = canvas.current
    const r = cv.getBoundingClientRect()
    return { x: ((e.clientX - r.left) * cv.offsetWidth) / r.width, y: ((e.clientY - r.top) * cv.offsetHeight) / r.height }
  }

  const down = (e) => {
    if (locked) return
    e.preventDefault()
    canvas.current.setPointerCapture(e.pointerId)
    const p = point(e)
    stroke.current = p
    const ctx = canvas.current.getContext('2d')
    ctx.beginPath()
    ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2)
    ctx.fillStyle = ctx.strokeStyle
    ctx.fill()
    setEmpty(false)
  }

  const move = (e) => {
    const last = stroke.current
    if (!last) return
    const p = point(e)
    const ctx = canvas.current.getContext('2d')
    ctx.beginPath()
    ctx.moveTo(last.x, last.y)
    ctx.lineTo(p.x, p.y)
    ctx.stroke()
    ink.current += Math.hypot(p.x - last.x, p.y - last.y)
    stroke.current = p
    if (ink.current >= MIN_INK) onChange(true)
  }

  const up = () => {
    stroke.current = null
  }

  return (
    <div className={`signature${locked ? ' signature-locked' : ''}`}>
      <div ref={wrap} className="signature-pad">
        <canvas
          ref={canvas}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          aria-label={hint}
        />
        {empty && <span className="signature-hint">{hint}</span>}
        <span className="signature-line" aria-hidden="true" />
      </div>
      {!locked && (
        <button type="button" className="signature-clear" onClick={reset} disabled={empty}>
          {clearLabel}
        </button>
      )}
    </div>
  )
}

function WhatsApp({ name }) {
  const c = story.invitation
  const num = c.whatsappNumber.replace(/\D/g, '')
  if (!num) return null
  return (
    <a
      className="btn btn-ghost btn-small rsvp-whatsapp"
      href={`https://wa.me/${num}?text=${encodeURIComponent(`${c.whatsappText}\n${name.trim()}`)}`}
      target="_blank"
      rel="noreferrer"
    >
      {c.whatsappButton}
    </a>
  )
}

/** Hearts and sparkles bursting over the document, then a few hearts that keep floating up. */
function Burst() {
  const reduce = useReducedMotion()
  const items = useMemo(() => {
    const rand = (a, b) => a + Math.random() * (b - a)
    const burst = Array.from({ length: reduce ? 0 : 34 }, (_, i) => ({
      id: `b${i}`,
      kind: i % 3 === 2 ? 'spark' : 'heart',
      x: rand(-180, 180),
      y: rand(-360, 160),
      size: i % 3 === 2 ? rand(10, 20) : rand(14, 32),
      rot: rand(-50, 50),
      delay: rand(0, 0.4),
      dur: rand(1.8, 3),
      hue: i % 3,
    }))
    const rising = Array.from({ length: reduce ? 6 : 16 }, (_, i) => ({
      id: `r${i}`,
      kind: i % 4 === 3 ? 'spark' : 'heart',
      left: rand(4, 96),
      size: rand(10, 22),
      delay: 0.8 + rand(0, 5),
      dur: rand(6, 10),
      drift: rand(-40, 40),
      rising: true,
      hue: i % 3,
    }))
    return [...burst, ...rising]
  }, [reduce])

  return (
    <div className="hearts" aria-hidden="true">
      {items.map((h) => {
        const cls = h.kind === 'spark' ? 'spark' : `heart heart-h${h.hue}`
        const Icon = h.kind === 'spark' ? SparkIcon : HeartIcon
        return h.rising ? (
          <motion.span
            key={h.id}
            className={cls}
            style={{ width: h.size, height: h.size, left: `${h.left}%`, bottom: -30 }}
            initial={{ y: 0, opacity: 0 }}
            animate={reduce ? { opacity: [0, 0.7, 0] } : { y: '-115vh', x: h.drift, opacity: [0, 0.85, 0.85, 0] }}
            transition={{ duration: h.dur, delay: h.delay, repeat: Infinity, ease: 'linear' }}
          >
            <Icon />
          </motion.span>
        ) : (
          <motion.span
            key={h.id}
            className={`${cls} burst-item`}
            style={{ width: h.size, height: h.size }}
            initial={{ x: 0, y: 0, scale: 0, opacity: 0, rotate: 0 }}
            animate={{ x: h.x, y: h.y, scale: [0, 1.25, 1], opacity: [0, 1, 0], rotate: h.rot }}
            transition={{ duration: h.dur, delay: h.delay, ease: EASE }}
          >
            <Icon />
          </motion.span>
        )
      })}
    </div>
  )
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%">
      <path fill="currentColor" d="M12 0 C13 8 16 11 24 12 C16 13 13 16 12 24 C11 16 8 13 0 12 C8 11 11 8 12 0Z" />
    </svg>
  )
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%">
      <path
        fill="currentColor"
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      />
    </svg>
  )
}
