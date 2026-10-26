import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import './Skills.css'

gsap.registerPlugin(useGSAP)

const SKILLS = [
  { name: 'React', level: 90 },
  { name: 'React Native', level: 75 },
  { name: 'Node.js', level: 78 },
  { name: 'Express', level: 75 },
  { name: 'JavaScript', level: 85 },
  { name: 'TypeScript', level: 70 },
  { name: 'Three.js', level: 65 },
  { name: 'GSAP', level: 68 },
  { name: 'Angular', level: 50 },
  { name: 'Laravel', level: 35 },
  { name: 'PostgreSQL', level: 55 },
  { name: 'MySQL', level: 88 },
  { name: 'SQLite', level: 75 },
  { name: 'Git', level: 75 },
  { name: 'Python', level: 68 },
  { name: 'Django', level: 55 },
  { name: 'Java', level: 72 },
  { name: 'JSP', level: 60 },
  { name: 'Spring Boot', level: 66 },
  { name: 'Docker', level: 35 },
  { name: 'HTML5', level: 99 },
  { name: 'CSS3', level: 90 },
  { name: 'SASS', level: 60 },
  { name: 'Tailwind CSS', level: 60 },
  { name: 'Bootstrap', level: 55 },
  { name: 'Material UI', level: 60 },
  { name: 'Figma', level: 55 },
  { name: 'C', level: 35 }
];

const PAGE_SIZE = 7

export default function Skills({ reducedMotion }) {
  const sectionRef = useRef(null)
  const solarRef = useRef(null)
  const listRef = useRef(null)
  const [page, setPage] = useState(0)

  const pageCount = Math.ceil(SKILLS.length / PAGE_SIZE)
  const pageSkills = SKILLS.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE)

  const goToPage = (p) => {
    setPage(Math.max(0, Math.min(pageCount - 1, p)))
  }

  useEffect(() => {
    if (reducedMotion || !listRef.current) return
    gsap.fromTo(listRef.current.querySelectorAll('.skills-list-item'),
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: 'power2.out',
        overwrite: true
      }
    )
  }, [page, reducedMotion])

  useGSAP(() => {
    if (reducedMotion) return

    gsap.utils.toArray('.solar-planet').forEach((planet) => {
      planet.addEventListener('mouseenter', () => {
        gsap.to(planet, { scale: 1.15, duration: 0.4, ease: 'power2.out' })
        gsap.to(planet.querySelector('.solar-planet-name'), {
          opacity: 1,
          duration: 0.3
        })
      })

      planet.addEventListener('mouseleave', () => {
        gsap.to(planet, { scale: 1, duration: 0.4, ease: 'power2.out' })
        gsap.to(planet.querySelector('.solar-planet-name'), {
          opacity: 0,
          duration: 0.3
        })
      })
    })
  }, { scope: sectionRef })

  return (
    <section ref={sectionRef} id="skills" className="skills section" aria-label="Compétences">
      <div className="container">
        <p className="section-label">// COMPÉTENCES</p>

        <div className="skills__layout">
          <div className="skills__solar" ref={solarRef}>
            <p className="skills__sun-caption" aria-hidden="true">SURVOLEZ POUR DÉCOUVRIR</p>

            <div className="solar__orbit solar__orbit--1" aria-hidden="true" />
            <div className="solar__orbit solar__orbit--2" aria-hidden="true" />
            <div className="solar__orbit solar__orbit--3" aria-hidden="true" />
            <div className="solar__orbit solar__orbit--4" aria-hidden="true" />

            <div className="solar__sun" aria-hidden="true">
              <span className="solar__sun-label">TECHNO</span>
            </div>

            {SKILLS.map((skill, i) => {
              const skillName = typeof skill === 'string' ? skill : skill.name
              const angle = (i / SKILLS.length) * Math.PI * 2
              const orbitIndex = i % 4
              const radiusPct = [18, 28, 38, 48][orbitIndex]
              const x = Math.cos(angle) * radiusPct
              const y = Math.sin(angle) * radiusPct
              const orbitDuration = 16 + (i % 3) * 7
              return (
                <div
                  key={skillName}
                  className="solar-planet"
                  tabIndex={0}
                  role="img"
                  aria-label={skillName}
                  style={{
                    '--ox': `${x}%`,
                    '--oy': `${y}%`,
                    '--planet-col': i % 2 === 0 ? 'var(--primary)' : 'var(--secondary)',
                    '--orbit-dur': `${orbitDuration}s`
                  }}
                >
                  <span className="solar-planet-dot" />
                  <span className="solar-planet-name">{skillName}</span>
                </div>
              )
            })}
          </div>

          <div className="skills__aside">
            <h2 className="skills__title">
              <span className="skills__title-accent">TECHNOLOGIES </span>
              &
              <span className="skills__title-accent"> OUTILS</span>
            </h2>
            <p className="skills__text">
              Chaque technologie de mon stack est un outil que je maîtrise pour
              construire des expériences complètes — du développement backend
              robuste aux interfaces 3D les plus immersives.
            </p>

            <div className="skills-list" ref={listRef}>
              {pageSkills.map((skill, i) => {
                const globalIndex = page * PAGE_SIZE + i
                const skillName = typeof skill === 'string' ? skill : skill.name
                const skillLevel = typeof skill === 'string' ? 85 - (globalIndex % PAGE_SIZE) * 5 : skill.level
                return (
                  <div key={skillName} className="skills-list-item">
                    <span className="skills-list-num">{String(globalIndex + 1).padStart(2, '0')}</span>
                    <span className="skills-list-name">{skillName}</span>
                    <span className="skills-list-bar">
                      <span className="skills-list-bar-fill" style={{ width: `${skillLevel}%`, '--fill-col': globalIndex % 2 === 0 ? 'var(--primary)' : 'var(--secondary)' }} />
                    </span>
                    <span className="skills-list-level">{skillLevel}%</span>
                  </div>
                )
              })}
            </div>

            <div className="skills-pagination" role="navigation" aria-label="Pagination des compétences">
              <button
                type="button"
                className="skills-arrow"
                onClick={() => goToPage(page - 1)}
                disabled={page === 0}
                aria-label="Page précédente"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {Array.from({ length: pageCount }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`skills-page ${i === page ? 'skills-page--active' : ''}`}
                  onClick={() => goToPage(i)}
                  aria-label={`Page ${i + 1}`}
                  aria-current={i === page ? 'page' : undefined}
                >
                  {i + 1}
                </button>
              ))}

              <button
                type="button"
                className="skills-arrow"
                onClick={() => goToPage(page + 1)}
                disabled={page === pageCount - 1}
                aria-label="Page suivante"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}