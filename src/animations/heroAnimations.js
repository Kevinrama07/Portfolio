import gsap from 'gsap'

export function heroReveal(selector = '.hero__content', delay = 0.5) {
  const nameChars = document.querySelectorAll('.hero-name-char')
  const roles = document.querySelectorAll('.hero-role')
  const bioLines = document.querySelectorAll('.hero-bio-line')
  const cta = document.querySelector('.hero__cta-btn')
  const scroll = document.querySelector('.hero__scroll-indicator')

  gsap.set([...roles, ...bioLines, cta, scroll], { autoAlpha: 0 })

  const tl = gsap.timeline({ delay })

  tl.to(nameChars, {
    opacity: 1,
    y: 0,
    rotateX: 0,
    stagger: 0.06,
    duration: 0.8,
    ease: 'power4.out'
  })
  .to(roles, {
    autoAlpha: 1,
    stagger: 0.1,
    duration: 0.4,
    ease: 'power2.out'
  }, '-=0.3')
  .to(bioLines, {
    autoAlpha: 1,
    stagger: 0.15,
    duration: 0.5
  }, '-=0.2')
  .to(cta, {
    autoAlpha: 1,
    y: 0,
    duration: 0.8,
    ease: 'power3.out'
  }, '-=0.1')
  .to(scroll, {
    autoAlpha: 1,
    duration: 0.6
  }, '-=0.4')

  return tl
}

export function cameraIntro(cameraRef, glowRef) {
  if (!cameraRef.current) return

  const tl = gsap.timeline({ delay: 0.3 })

  tl.fromTo(cameraRef.current.position,
    { z: 8 },
    { z: 5, duration: 2.2, ease: 'power2.inOut' }
  )
  .to(
    { v: 0 },
    {
      v: 1,
      duration: 1.5,
      ease: 'power2.inOut',
      onUpdate: function () {
        if (glowRef.current) {
          glowRef.current.style.opacity = this.targets()[0].v * 0.8
        }
      }
    },
    0
  )

  return tl
}
