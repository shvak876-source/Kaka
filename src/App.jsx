import { useCallback, useEffect, useState } from 'react'
import { MotionConfig } from 'framer-motion'
import { Disguise } from './components/Disguise'
import { LayoutProvider } from './lib/layout'
import { useMood } from './lib/mood'
import { Background } from './components/Background'
import { Particles } from './components/Particles'
import { ScrollArrow } from './components/ScrollArrow'
import { Announce, Conversations, Meeting, Moments, Night, Opening, SomethingChanged, WhatNow } from './components/Chapters'
import { Finale } from './components/Finale'

function Experience() {
  const mood = useMood()
  return (
    <>
      <Background mood={mood} />
      <Particles scrollY={mood.scrollY} intensity={mood.finale} />
      <ScrollArrow scrollY={mood.scrollY} />
      <main className="story">
        <Opening />
        <Meeting />
        <Conversations />
        <Night />
        <Moments />
        <Announce />
        <SomethingChanged />
        <WhatNow />
        <Finale />
      </main>
    </>
  )
}

// ?skip goes straight to the story, for checking it without filling the survey every time
const skip = typeof location !== 'undefined' && new URLSearchParams(location.search).has('skip')

export default function App() {
  const [opened, setOpened] = useState(skip)
  const [disguised, setDisguised] = useState(!skip)
  useEffect(() => {
    if (skip) document.title = 'לנגה ❤️'
  }, [])
  const open = useCallback(() => {
    setOpened(true)
    document.title = 'לנגה ❤️'
    document.querySelector('meta[name=theme-color]')?.setAttribute('content', '#050307')
  }, [])
  const done = useCallback(() => setDisguised(false), [])

  // nothing scrolls until the disguise is gone
  useEffect(() => {
    if (!disguised) return
    const html = document.documentElement
    html.style.overflow = 'hidden'
    return () => {
      html.style.overflow = ''
      window.scrollTo(0, 0)
    }
  }, [disguised])

  return (
    <MotionConfig reducedMotion="user">
      {opened && (
        <LayoutProvider>
          <Experience />
        </LayoutProvider>
      )}
      {disguised && <Disguise onOpen={open} onDone={done} />}
    </MotionConfig>
  )
}
