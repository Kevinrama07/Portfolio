import { useEffect, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Navbar from './components/Navbar/Navbar'
import Hero from './components/Hero/Hero'
import About from './components/About/About'
import Projects from './components/Projects/Projects'
import Skills from './components/Skills/Skills'
import Experience from './components/Experience/Experience'
import Contact from './components/Contact/Contact'
import ThreeScene from './components/ThreeScene/ThreeScene'
import { usePrefersReducedMotion, useIsMobile } from './hooks/useDevice'
import { useSmoothScroll } from './hooks/useSmoothScroll'
import { initSectionReveals, initParallax } from './animations/scrollAnimations'

gsap.registerPlugin(ScrollTrigger)

export default function App() {
  const reducedMotion = usePrefersReducedMotion()
  const isMobile = useIsMobile()
  const scrollToSection = useSmoothScroll(reducedMotion)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), reducedMotion ? 100 : 1600)
    return () => clearTimeout(timer)
  }, [reducedMotion])

  useEffect(() => {
    if (!loaded) return
    const cleanReveals = initSectionReveals()
    const cleanParallax = initParallax()
    return () => {
      cleanReveals && cleanReveals()
      cleanParallax && cleanParallax()
    }
  }, [loaded])

  useEffect(() => {
    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill())
    }
  }, [])

  return (
    <div className={`app ${loaded ? 'app--loaded' : ''}`}>

      {!loaded && (
        <div className="loader" aria-hidden="true">
          <div className="loader__core" />
          <span className="loader__label">CHARGEMENT</span>
        </div>
      )}

      <div className={`app__scene ${loaded ? 'app__scene--loaded' : ''}`}>
        <ThreeScene />
      </div>

      <Navbar reducedMotion={reducedMotion} onNavigate={scrollToSection} />

      <main>
        <Hero reducedMotion={reducedMotion} />
        <About reducedMotion={reducedMotion} />
        <Projects reducedMotion={reducedMotion} isMobile={isMobile} />
        <Skills reducedMotion={reducedMotion} />
        <Experience reducedMotion={reducedMotion} />
        <Contact reducedMotion={reducedMotion} />
      </main>
    </div>
  )
}