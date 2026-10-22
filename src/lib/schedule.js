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
  return { U, out: norm(U)([0.05, 0.7]) }
}

function meetingSchedule() {
  const { paragraphs } = story.meeting
  const s = sequencer().wait(0.15)
  const title = s.take(0.45)
  s.wait(0.25)
  const lines = paragraphs.map(() => {
    const r = s.take(0.4)
    s.wait(0.18)
    return r
  })
  s.wait(0.6)
  const out = s.take(0.5)
  const U = s.wait(0.1).now
  const n = norm(U)
  return { U, title: n(title), lines: lines.map(n), out: n(out) }
}

function conversationsSchedule() {
  const { intro, closing } = story.conversations
  const s = sequencer().wait(0.15)
  const title = s.take(0.45)
  s.wait(0.2)
  const introLines = intro.map(() => {
    const r = s.take(0.4)
    s.wait(0.12)
    return r
  })
  s.wait(0.4)
  const introOut = s.take(0.35)
  s.wait(0.15)
  const closingIn = s.take(closing.wordByWord ? 0.8 : 0.45)
  s.wait(0.7)
  const closingOut = s.take(0.4)
  const U = s.wait(0.1).now
  const n = norm(U)
  return {
    U,
    title: n(title),
    introLines: introLines.map(n),
    introOut: n(introOut),
    closingIn: n(closingIn),
    closingOut: n(closingOut),
  }
}

function momentsSchedule() {
  const { items } = story.moments
  const s = sequencer().wait(0.15)
  const titleIn = s.take(0.55)
  s.wait(0.6)
  const titleOut = s.take(0.4)
  s.wait(0.1)
  const moments = items.map(() => {
    const inR = s.take(0.5)
    s.wait(0.75)
    const outR = s.take(0.4)
    s.wait(0.1)
    return { in: inR, out: outR }
  })
  const U = s.wait(0.05).now
  const n = norm(U)
  return {
    U,
    titleIn: n(titleIn),
    titleOut: n(titleOut),
    moments: moments.map((m) => ({ in: n(m.in), out: n(m.out) })),
  }
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
  const s = sequencer().wait(0.25)
  const introIn = s.take(0.5)
  s.wait(0.6)
  const introOut = s.take(0.4)
  s.wait(0.25)
  const questionIn = s.take(0.8)
  s.wait(0.05)
  const buttonsIn = s.take(0.4)
  const U = s.wait(0.25).now
  const n = norm(U)
  return { U, introIn: n(introIn), introOut: n(introOut), questionIn: n(questionIn), buttonsIn: n(buttonsIn) }
}

export const schedule = {
  opening: openingSchedule(),
  meeting: meetingSchedule(),
  conversations: conversationsSchedule(),
  moments: momentsSchedule(),
  changed: changedSchedule(),
  whatNow: whatNowSchedule(),
  finale: finaleSchedule(),
}

/** Where the scroll arrow is completely filled: the moment the invitation appears. */
export const arrowEnd = ['finale', schedule.finale.questionIn[0]]
