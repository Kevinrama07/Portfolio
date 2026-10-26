import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function initHorizontalGallery(sectionSelector, trackSelector, { isMobile = false } = {}) {
  const section = document.querySelector(sectionSelector)
  const track = document.querySelector(trackSelector)
  if (!section || !track) return () => {}

  const prefersMotion = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!prefersMotion) return () => {}

  const getDistance = () => track.scrollWidth - window.innerWidth

  const tween = gsap.to(track, {
    x: () => -getDistance(),
    ease: 'none',
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: () => '+=' + getDistance(),
      pin: true,
      scrub: 1,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const cards = track.querySelectorAll('.project-card')
        cards.forEach((card) => {
          const rect = card.getBoundingClientRect()
          const center = rect.left + rect.width / 2
          const vCenter = window.innerWidth / 2
          const distance = Math.min(Math.abs(center - vCenter) / (window.innerWidth / 1.5), 1)

          gsap.set(card, {
            scale: 1 - distance * 0.2,
            rotationY: (center > vCenter ? 1 : -1) * distance * 10,
            filter: `blur(${distance * 2}px)`,
            opacity: 1 - distance * 0.4
          })
        })
      }
    }
  })

  return () => {
    tween.scrollTrigger && tween.scrollTrigger.kill()
    tween.kill()
  }
}
