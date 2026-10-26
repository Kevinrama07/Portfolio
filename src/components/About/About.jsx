import { Fragment, useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { personalInfo } from '../../data/projects'
import './About.css'

gsap.registerPlugin(useGSAP)

export default function About({ reducedMotion }) {
  const aboutRef = useRef(null)
  const textRef = useRef(null)
  const visualRef = useRef(null)
  const phraseRef = useRef(null)
  const taglineRef = useRef(null)

  useGSAP(() => {
    if (reducedMotion) return

    const words = phraseRef.current.querySelectorAll('.about-word')
    gsap.set(words, { opacity: 0.03 })

    gsap.to(words, {
      opacity: 1,
      stagger: 0.08,
      ease: 'none',
      scrollTrigger: {
        trigger: phraseRef.current,
        start: 'top 80%',
        end: 'bottom 40%',
        scrub: true
      }
    })

    gsap.from(textRef.current, {
      x: -120,
      opacity: 0,
      duration: 1.2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: aboutRef.current,
        start: 'top 70%',
        once: true
      }
    })

    gsap.from(visualRef.current, {
      x: 120,
      opacity: 0,
      duration: 1.2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: aboutRef.current,
        start: 'top 70%',
        once: true
      }
    })

    gsap.from(taglineRef.current, {
      y: 40,
      opacity: 0,
      duration: 1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: taglineRef.current,
        start: 'top 85%',
        once: true
      }
    })

    gsap.from(aboutRef.current.querySelectorAll('.about-stat'), {
      y: 30,
      opacity: 0,
      stagger: 0.15,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.about__stats',
        start: 'top 85%',
        once: true
      }
    })
  }, { scope: aboutRef })

  return (
    <section ref={aboutRef} id="about" className="about section" aria-label="À propos">
      <div className="container">
        <p className="section-label">// À PROPOS</p>

        <div className="about__grid">
          <div ref={textRef} className="about__text">
            <h2 ref={phraseRef} className="about__phrase">
              {personalInfo.tagline.split(/\s+/).map((word, i) => (
                <Fragment key={i}>
                  <span className="about-word">{word}</span>
                  {' '}
                </Fragment>
              ))}
            </h2>

            <p ref={taglineRef} className="about__description">
              Développeur Full-Stack et Créatif basé à Madagascar, spécialisé dans la création d'applications web et mobiles performantes, d'interfaces immersives et d'expériences 3D. À la recherche d'un stage ou d'une alternance en développement web/mobile pour mettre en pratique mes compétences et contribuer à des projets concrets.
            </p>
            <p className="about__description" style={{ marginTop: '1rem' }}>
              Spécialités : React, React Native, Node.js, Three.js, bases de données relationnelles et conception d'interfaces. Disponible immédiatement.
            </p>
          </div>

          <div ref={visualRef} className="about__visual" aria-hidden="true">
            <div className="about__orb">
              <span className="about__orb-ring about__orb-ring--outer" />
              <span className="about__orb-ring about__orb-ring--inner" />
              <span className="about__orb-core" />
            </div>
            <div className="about__stats">
              <div className="about-stat">
                <strong>10+</strong>
                <span>PROJETS RÉALISÉS</span>
              </div>
              <div className="about-stat">
                <strong>28+</strong>
                <span>TECHNOLOGIES</span>
              </div>
              <div className="about-stat">
                <strong>100%</strong>
                <span>MOTIVÉ</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}