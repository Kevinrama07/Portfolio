import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { projects } from '../../data/projects'
import './Projects.css'

gsap.registerPlugin(ScrollTrigger, useGSAP)

function ProjectCard({ project, index, isMobile }) {
  const imgRef = useRef(null)

  const handleHover = (e) => {
    if (isMobile) return
    const card = e.currentTarget
    gsap.to(imgRef.current, {
      scale: 1.08,
      rotateY: 3,
      duration: 0.6,
      ease: 'power2.out'
    })
  }

  const handleLeave = (e) => {
    if (isMobile) return
    gsap.to(imgRef.current, {
      scale: 1,
      rotateY: 0,
      duration: 0.8,
      ease: 'power2.out'
    })
  }

  return (
    <article
      className={`project-card project-card--${index + 1}`}
      data-project
      onMouseEnter={handleHover}
      onMouseLeave={handleLeave}
    >
      <div className="project-card__image-wrap">
        <img
          ref={imgRef}
          src={project.image}
          alt={project.title}
          className="project-card__image"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />
        <div className="project-card__index" aria-hidden="true">
          {project.index}
        </div>
        <div className="project-card__overlay">
          <span className="project-card__overlay-index">PROJET {project.index}</span>
          <h3 className="project-card__overlay-title">{project.title}</h3>
        </div>
      </div>

      <div className="project-card__info">
        <div className="project-card__meta">
          <span className="project-card__year">{project.year}</span>
          <span className="project-card__tech">
            {project.technologies.slice(0, 3).join(' · ')}
            {project.technologies.length > 3 ? ' · …' : ''}
          </span>
        </div>

        <h3 className="project-card__title">{project.title}</h3>

        <p className="project-card__desc">{project.description}</p>

        <div className="project-card__links">
          {project.github && project.github !== 'https://' && project.github !== 'https://github.com/' ? (
            <a href={project.github} target="_blank" rel="noreferrer noopener" className="project-card__link">GITHUB</a>
          ) : null}
          {project.demo && project.demo !== 'https://' ? (
            <a href={project.demo} target="_blank" rel="noreferrer noopener" className="project-card__link">DÉMO</a>
          ) : null}
        </div>
      </div>
    </article>
  )
}

export default function Projects({ reducedMotion, isMobile }) {
  const sectionRef = useRef(null)
  const trackRef = useRef(null)

  useGSAP(() => {
    if (reducedMotion) {
      return
    }

    const track = trackRef.current
    if (!track) return

    const getAmount = () => {
      return -track.scrollWidth + window.innerWidth
    }

    const tween = gsap.to(track, {
      x: getAmount,
      ease: 'none',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top top',
        end: () => '+=' + (track.scrollWidth - window.innerWidth),
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          const progress = self.progress
          const progressBar = sectionRef.current.querySelector('.projects__progress-fill')
          if (progressBar) gsap.set(progressBar, { width: `${progress * 100}%` })

          if (isMobile) return

          const cards = track.querySelectorAll('.project-card')
          cards.forEach((card) => {
            const rect = card.getBoundingClientRect()
            const center = rect.left + rect.width / 2
            const viewportCenter = window.innerWidth / 2
            const distance = Math.abs(center - viewportCenter)
            const normalized = Math.min(distance / (window.innerWidth / 1.5), 1)

            gsap.set(card, {
              scale: 1 - normalized * 0.2,
              rotationY: (center > viewportCenter ? 1 : -1) * normalized * 10,
              filter: `blur(${normalized * 2}px)`,
              opacity: 1 - normalized * 0.4
            })
          })
        }
      }
    })

    if (isMobile) {
      gsap.set(track.querySelectorAll('.project-card'), {
        scale: 1,
        opacity: 1,
        filter: 'none',
        rotationY: 0
      })
    }

    return () => {
      tween.scrollTrigger && tween.scrollTrigger.kill()
      tween.kill()
    }
  }, { scope: sectionRef, dependencies: [isMobile] })

  return (
    <section ref={sectionRef} id="projects" className="projects" aria-label="Projets">
      <div className="projects__header container">
        <p className="section-label">// PROJETS</p>
        <h2 className="projects__heading">
          PROJETS<span className="projects__heading-accent"> RÉALISÉS</span>
        </h2>
        <p className="projects__subtitle">Faites défiler pour voir mes projets</p>
      </div>

      <div className="projects__track" ref={trackRef}>
        <div className="projects__track-inner">
          {projects.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} isMobile={isMobile} />
          ))}

          <div className="projects__end">
            <span className="projects__end-count">
              {String(projects.length).padStart(2, '0')} PROJETS
            </span>
          </div>
        </div>
      </div>

      <div className="projects__progress" aria-hidden="true">
        <div className="projects__progress-fill" />
      </div>
    </section>
  )
}