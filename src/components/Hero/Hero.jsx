import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { personalInfo } from '../../data/projects'
import './Hero.css'

gsap.registerPlugin(useGSAP)

export default function Hero({ reducedMotion }) {
  const heroRef = useRef(null)
  const nameRef = useRef(null)
  const rolesRef = useRef(null)
  const bioRef = useRef(null)
  const ctaRef = useRef(null)
  const glowRef = useRef(null)
  const scrollIndicatorRef = useRef(null)
  const readyRef = useRef(false)

  useGSAP(() => {
    if (reducedMotion) return

    const nameChars = nameRef.current.querySelectorAll('.hero-name-char')
    const roleItems = rolesRef.current.querySelectorAll('.hero-role')
    const bioLines = bioRef.current.querySelectorAll('.hero-bio-line')

    gsap.set([rolesRef.current, bioRef.current, ctaRef.current, scrollIndicatorRef.current], {
      autoAlpha: 0,
      y: 24
    })

    gsap.set(glowRef.current, { scale: 0, opacity: 0 })

    const tl = gsap.timeline({
      delay: 0.5,
      defaults: { ease: 'power3.out' }
    })

    tl.to(glowRef.current, {
      scale: 1,
      opacity: 1,
      duration: 1.6,
      ease: 'power2.inOut'
    })
    .to(nameChars, {
      opacity: 1,
      y: 0,
      rotateX: 0,
      stagger: 0.06,
      duration: 0.8,
      ease: 'power4.out'
    }, '-=1.0')
    .to(rolesRef.current, {
      autoAlpha: 1,
      duration: 0.6,
      ease: 'power2.out'
    }, '-=0.3')
    .to(roleItems, {
      opacity: 1,
      stagger: 0.15,
      duration: 0.4
    }, '<')
    .to(bioRef.current, {
      autoAlpha: 1,
      duration: 0.6,
      ease: 'power2.out'
    }, '-=0.2')
    .to(bioLines, {
      opacity: 1,
      stagger: 0.1,
      duration: 0.5
    }, '<')
    .to(ctaRef.current, {
      autoAlpha: 1,
      y: 0,
      duration: 0.8,
      ease: 'power3.out'
    }, '-=0.1')
    .to(scrollIndicatorRef.current, {
      autoAlpha: 1,
      y: 0,
      duration: 0.6
    }, '-=0.4')

    readyRef.current = true
  }, { scope: heroRef })

  const controlsRef = useRef(null)

  const smoothScrollTo = (target) => {
    if (target) target.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section ref={heroRef} id="hero" className="hero" aria-label="Présentation">
      <div ref={glowRef} className="hero__glow" aria-hidden="true" />

      <div className="hero__content">
        <p className="hero__welcome">BIENVENUE DANS MON UNIVERS NUMÉRIQUE</p>

        <h1 ref={nameRef} className="hero__name" aria-label={personalInfo.name}>
          {personalInfo.name.split(' ').map((word, wi) => (
            <span key={wi} className="hero-name-word" aria-hidden="true">
              {word.split('').map((char, ci) => (
                <span key={ci} className="hero-name-char">
                  {char}
                </span>
              ))}
              {wi < personalInfo.name.split(' ').length - 1 && (
                <span className="hero-name-char">{'\u00A0'}</span>
              )}
            </span>
          ))}
        </h1>

        <div ref={rolesRef} className="hero__roles">
          {personalInfo.roles.map((role) => (
            <span key={role} className="hero-role">
              <span className="hero-role-sep" aria-hidden="true">•</span>
              {role}
            </span>
          ))}
        </div>

        <div ref={bioRef} className="hero__bio">
          {personalInfo.shortBio.split('. ').map((line, i, arr) => (
            <p key={i} className="hero-bio-line">
              {line}{i < arr.length - 1 ? '.' : ''}
            </p>
          ))}
        </div>

        <div ref={ctaRef} className="hero__cta">
          <a
            href="#projects"
            className="hero__cta-btn"
            onClick={(e) => {
              e.preventDefault()
              const el = document.getElementById('projects')
              smoothScrollTo(el)
            }}
            aria-label="Découvrir mes projets"
          >
            <span className="hero__cta-label">DÉCOUVRIR MES PROJETS</span>
            <span className="hero__cta-arrow">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </a>
          {personalInfo.cvUrl && (
            <a
              href={personalInfo.cvUrl}
              download
              className="hero__cta-btn hero__cta-btn--secondary"
              aria-label="Télécharger mon CV"
            >
              <span className="hero__cta-label">TÉLÉCHARGER CV</span>
              <span className="hero__cta-arrow">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </a>
          )}
        </div>
      </div>

      <div ref={scrollIndicatorRef} className="hero__scroll-indicator" aria-hidden="true">
        <span className="hero__scroll-line" />
      </div>
    </section>
  )
}