import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function initSectionReveals() {
  const prefersMotion = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!prefersMotion) return () => {}

  const regs = []

  document.querySelectorAll('[data-reveal]').forEach((el) => {
    const tween = gsap.fromTo(el,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          once: true
        }
      }
    )
    regs.push(tween)
  })

  document.querySelectorAll('[data-reveal-group]').forEach((group) => {
    const children = group.querySelectorAll('[data-reveal-child]')
    const tween = gsap.fromTo(children,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: group,
          start: 'top 85%',
          once: true
        }
      }
    )
    regs.push(tween)
  })

  return () => {
    regs.forEach((r) => {
      r.scrollTrigger && r.scrollTrigger.kill()
      r.kill && r.kill()
    })
  }
}

export function initParallax(container = document) {
  const prefersMotion = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!prefersMotion) return () => {}

  const regs = []

  container.querySelectorAll('[data-parallax]').forEach((el) => {
    const speed = parseFloat(el.dataset.parallax || '0.2')
    const tween = gsap.to(el, {
      yPercent: speed * 100,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    })
    regs.push(tween)
  })

  return () => {
    regs.forEach((r) => {
      r.scrollTrigger && r.scrollTrigger.kill()
      r.kill && r.kill()
    })
  }
}
