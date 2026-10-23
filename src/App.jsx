import { MotionConfig } from 'framer-motion'
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

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <LayoutProvider>
        <Experience />
      </LayoutProvider>
    </MotionConfig>
  )
}
