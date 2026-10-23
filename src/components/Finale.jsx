import { useState } from 'react'
import { AnimatePresence, motion, useTransform } from 'framer-motion'
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
        <Beat range={sch.introIn} lift={30}>
          <p className="finale-intro glow-text">{c.intro}</p>
        </Beat>
        <div className="finale-letter">
          {c.paragraphs.map((p, i) => (
            <Beat key={i} as="p" range={sch.paragraphs[i]} className="finale-paragraph" lift={18}>
              {p}
            </Beat>
          ))}
        </div>
        <Beat range={sch.buttonIn} className="ask-actions" lift={16}>
          <button className="btn btn-primary btn-rsvp" onClick={() => setOpen(true)}>
            {c.rsvpButton}
          </button>
        </Beat>
      </div>

      <FinaleHalo />
      <AnimatePresence>{open && <RsvpDocument onClose={() => setOpen(false)} />}</AnimatePresence>
    </Scene>
  )
}

function FinaleHalo() {
  const progress = useSceneProgress()
  const { introIn } = schedule.finale
  const opacity = useTransform(progress, [introIn[0], introIn[1]], [0, 1])
  return <motion.div className="finale-halo" style={{ opacity }} aria-hidden="true" />
}
