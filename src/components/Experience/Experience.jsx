import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import './Experience.css'

gsap.registerPlugin(useGSAP)

const TIMELINE = [
  {
    year: '2024',
    title: 'Baccalauréat Série S',
    description: 'Obtention du Baccalauréat Scientifique. Acquisition de bases solides en mathématiques, physique et raisonnement logique.',
    tag: 'FORMATION'
  },
  {
    year: 'Mars 2025 - En cours',
    title: 'BTS SIO (Services Informatiques aux Organisations)',
    description: 'Formation en développement d\'applications, bases de données, réseaux et systèmes. Option SLAM (Solutions Logicielles et Applications Métiers).',
    tag: 'FORMATION'
  },
  {
    year: 'Août 2025',
    title: 'Projet scolaire - Système de gestion scolaire',
    description: 'Conception et développement d\'une application de gestion d\'établissement scolaire (étudiants, enseignants, emplois du temps).',
    tag: 'PROJET'
  },
  {
    year: 'Juillet 2026',
    title: 'Projets personnels - Plateformes web et mobiles',
    description: 'Développement de plusieurs projets concrets : Tantsaha Connect, MadaAgri, système de gestion de bibliothèque, applications web et mobiles.',
    tag: 'PROJET'
  },
  {
    year: 'Août 2026',
    title: 'Stage/Projet professionnel - Savanna Spices Madagascar',
    description: 'Conception et réalisation d\'une application desktop (Electron.js) pour la gestion du point de vente de l\'entreprise Savanna Spices Madagascar.',
    tag: 'EXPÉRIENCE'
  }
]

export default function Experience({ reducedMotion }) {
  const sectionRef = useRef(null)
  const lineRef = useRef(null)

  useGSAP(() => {
    if (reducedMotion) return

    TIMELINE.forEach((_, i) => {
      const dot = sectionRef.current.querySelector(`.exp-item[data-index="${i}"] .exp-dot`)
      const content = sectionRef.current.querySelector(`.exp-item[data-index="${i}"] .exp-content`)
      const item = sectionRef.current.querySelector(`.exp-item[data-index="${i}"]`)

      gsap.from(content, {
        x: i % 2 === 0 ? -60 : 60,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: item,
          start: 'top 75%',
          once: true
        }
      })

      gsap.to(item, {
        scrollTrigger: {
          trigger: item,
          start: 'top 80%',
          end: 'top 40%',
          scrub: true,
          onEnter: () => {
            dot.classList.add('exp-dot--active')
            gsap.to(dot, {
              scale: 1.4,
              duration: 0.3
            })
            gsap.to(item.querySelector('.exp-active-bar'), {
              scaleY: 1,
              duration: 0.4,
              ease: 'power2.out'
            })
          },
          onLeaveBack: () => {
            dot.classList.remove('exp-dot--active')
            gsap.to(dot, {
              scale: 1,
              duration: 0.3
            })
            gsap.to(item.querySelector('.exp-active-bar'), {
              scaleY: 0,
              duration: 0.3
            })
          }
        }
      })
    })

    gsap.to(lineRef.current, {
      scaleY: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 70%',
        end: 'bottom 60%',
        scrub: 1
      }
    })

  }, { scope: sectionRef })

  return (
    <section ref={sectionRef} id="experience" className="experience section" aria-label="Expérience">
      <div className="container">
        <p className="section-label">// PARCOURS</p>
        <h2 className="experience__heading">
          MON<span className="experience__heading-accent"> PARCOURS</span>
        </h2>

        <div className="experience__timeline">
          <div className="experience__line" ref={lineRef} />

          {TIMELINE.map((item, i) => (
            <div
              key={i}
              className={`exp-item ${i % 2 === 0 ? 'exp-item--left' : 'exp-item--right'}`}
              data-index={i}
            >
              <div className="exp-dot" />
              <div className="exp-active-bar" />
              <div className="exp-content glass">
                <div className="exp-content__header">
                  <span className="exp-year">{item.year}</span>
                  <span className="exp-tag">{item.tag}</span>
                </div>
                <h3 className="exp-title">{item.title}</h3>
                <p className="exp-desc">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}