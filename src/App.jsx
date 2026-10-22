import { MotionConfig } from 'framer-motion'
import { LayoutProvider } from './lib/layout'
import { useMood } from './lib/mood'
import { Background } from './components/Background'
import { Particles } from './components/Particles'
import { Timeline } from './components/Timeline'
import { Conversations, Meeting, Moments, Opening, SomethingChanged, WhatNow } from './components/Chapters'
import { Finale } from './components/Finale'

function Experience() {
  const mood = useMood()
  return (
    <>
      <Background mood={mood} />
      <Particles scrollY={mood.scrollY} intensity={mood.finale} />
      <Timeline mood={mood} />
      <main className="story">
        <Opening />
        <Meeting />
        <Conversations />
        <Moments />
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
