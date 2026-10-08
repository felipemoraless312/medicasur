import { About, Closing, Hero, Journey, QuickActions, Services, Technology } from './_components/home-sections'
import { PendingSectionScroll } from './_components/scroll-link'

export default function HomePage() {
  return (
    <>
      <Hero />
      <QuickActions />
      <About />
      <Services />
      <Technology />
      <Journey />
      <Closing />
      <PendingSectionScroll />
    </>
  )
}

