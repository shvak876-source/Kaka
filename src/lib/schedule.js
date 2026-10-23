import { story } from '../data/story'

/**
 * Every scene is described in "units": one unit = one screen-height of scrolling.
 * A scene of U units is (U + 1) screens tall: a sticky stage plus U screens of
 * scroll distance. Ranges are then normalized to 0..1 of the scene's scroll progress.
 */
function sequencer() {
  let cursor = 0
  return {
    at(x) {
      cursor = x
      return this
    },
    wait(d) {
      cursor += d
      return this
    },
    take(d) {
      const r = [cursor, cursor + d]
      cursor += d
      return r
    },
    get now() {
      return cursor
    },
  }
}

const norm = (U) => (r) => r.map((x) => x / U)

function openingSchedule() {
  const U = 0.85
  const n = norm(U)
  return { U, out: n([0.05, 0.7]), hintOut: n([0, 0.14]) }
}

function meetingSchedule() {
  const s = sequencer().wait(0.15)
  const title = s.take(0.45)
  s.wait(0.15)
  const photo = s.take(0.5)
  s.wait(0.15)
  const caption = s.take(0.45)
  s.wait(0.7)
  const out = s.take(0.5)
  const U = s.wait(0.1).now
  const n = norm(U)
  return { U, title: n(title), photo: n(photo), caption: n(caption), out: n(out) }
}

/** A single line that appears on its own, holds, and leaves. */
function lineSchedule() {
  const s = sequencer().wait(0.25)
  const textIn = s.take(0.7)
  s.wait(0.8)
  const out = s.take(0.45)
  const U = s.wait(0.1).now
  const n = norm(U)
  return { U, in: n(textIn), out: n(out) }
}

function nightSchedule() {
  const { messages } = story.night
  const s = sequencer().wait(0.2)
  const title = s.take(0.45)
  s.wait(0.25)
  const bubbles = messages.map(() => {
    const r = s.take(0.35)
    s.wait(0.3)
    return r
  })
  s.wait(0.5)
  const out = s.take(0.5)
  const U = s.wait(0.1).now
  const n = norm(U)
  return { U, title: n(title), bubbles: bubbles.map(n), out: n(out) }
}

function momentsSchedule() {
  const s = sequencer().wait(0.25)
  const lead = s.take(0.5)
  s.wait(0.25)
  const line = s.take(0.8)
  s.wait(0.9)
  const out = s.take(0.5)
  const U = s.wait(0.1).now
  const n = norm(U)
  return { U, lead: n(lead), line: n(line), out: n(out) }
}

function changedSchedule() {
  const { lines } = story.somethingChanged
  const s = sequencer().wait(0.3)
  const ls = lines.map(() => {
    const inR = s.take(0.5)
    s.wait(0.6)
    const outR = s.take(0.4)
    s.wait(0.2)
    return { in: inR, out: outR }
  })
  s.wait(0.1)
  const highlightIn = s.take(1)
  s.wait(0.9)
  const highlightOut = s.take(0.5)
  const U = s.wait(0.1).now
  const n = norm(U)
  return {
    U,
    lines: ls.map((l) => ({ in: n(l.in), out: n(l.out) })),
    highlightIn: n(highlightIn),
    highlightOut: n(highlightOut),
  }
}

function whatNowSchedule() {
  const { lines } = story.whatNow
  const s = sequencer().wait(0.35)
  const ls = lines.map(() => {
    const inR = s.take(0.5)
    s.wait(0.6)
    const outR = s.take(0.4)
    s.wait(0.25)
    return { in: inR, out: outR }
  })
  s.wait(0.5) // השהיה קצרה לפני השאלה
  const questionIn = s.take(0.9)
  s.wait(0.8)
  const questionOut = s.take(0.45)
  const U = s.wait(0.1).now
  const n = norm(U)
  return {
    U,
    lines: ls.map((l) => ({ in: n(l.in), out: n(l.out) })),
    questionIn: n(questionIn),
    questionOut: n(questionOut),
  }
}

function finaleSchedule() {
  const { paragraphs } = story.invitation
  const s = sequencer().wait(0.25)
  const introIn = s.take(0.5)
  s.wait(0.2)
  const paras = paragraphs.map(() => {
    const r = s.take(0.5)
    s.wait(0.15)
    return r
  })
  const buttonIn = s.take(0.35)
  const U = s.wait(0.25).now
  const n = norm(U)
  return { U, introIn: n(introIn), paragraphs: paras.map(n), buttonIn: n(buttonIn) }
}

export const schedule = {
  opening: openingSchedule(),
  meeting: meetingSchedule(),
  conversations: lineSchedule(),
  night: nightSchedule(),
  moments: momentsSchedule(),
  announce: lineSchedule(),
  changed: changedSchedule(),
  whatNow: whatNowSchedule(),
  finale: finaleSchedule(),
}

/** Where the scroll arrow bows out: the moment the invitation appears. */
export const arrowEnd = ['finale', schedule.finale.introIn[1]]
