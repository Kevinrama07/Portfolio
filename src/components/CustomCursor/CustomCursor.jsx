import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useIsMobile, usePrefersReducedMotion } from '../../hooks/useDevice'
import './CustomCursor.css'

export default function CustomCursor() {
  const dotRef = useRef(null)
  const ringRef = useRef(null)
  const labelRef = useRef(null)
  const isMobile = useIsMobile(820)
  const reducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    if (isMobile || reducedMotion) return

    const dot = dotRef.current
    const ring = ringRef.current
    const label = labelRef.current

    document.body.style.cursor = 'none'
    let rafId = null
    let targetX = window.innerWidth / 2
    let targetY = window.innerHeight / 2
    let currentX = targetX
    let currentY = targetY

    const onMove = (e) => {
      targetX = e.clientX
      targetY = e.clientY
      gsap.to(dot, { x: targetX, y: targetY, duration: 0.15, ease: 'power2.out', force3D: true })
    }

    const loop = () => {
      currentX += (targetX - currentX) * 0.16
      currentY += (targetY - currentY) * 0.16
      gsap.set(ring, { x: currentX, y: currentY, force3D: true })
      rafId = requestAnimationFrame(loop)
    }

    const grow = () => {
      gsap.to(ring, { scale: 2.4, opacity: 0.35, duration: 0.35, ease: 'power3.out' })
      gsap.to(dot, { scale: 0.4, duration: 0.3, ease: 'power3.out' })
    }

    const shrink = () => {
      gsap.to(ring, { scale: 1, opacity: 0.6, duration: 0.35, ease: 'power3.out' })
      gsap.to(dot, { scale: 1, duration: 0.3, ease: 'power3.out' })
    }

    const showProjectLabel = () => {
      gsap.to(ring, { scale: 4.5, opacity: 1, backgroundColor: 'rgba(110, 231, 255, 0.9)', duration: 0.4, ease: 'power3.out' })
      gsap.to(label, { opacity: 1, duration: 0.25 })
    }

    const hideProjectLabel = () => {
      gsap.to(ring, { scale: 1, opacity: 0.6, backgroundColor: 'rgba(110, 231, 255, 0.15)', duration: 0.4, ease: 'power3.out' })
      gsap.to(label, { opacity: 0, duration: 0.2 })
    }

    const mouseOver = (e) => {
      if (e.target.closest('[data-project]')) {
        showProjectLabel()
      } else if (e.target.closest('a, button, [data-cursor]')) {
        grow()
      }
    }

    const mouseOut = (e) => {
      if (e.target.closest('[data-project]')) {
        hideProjectLabel()
      } else if (e.target.closest('a, button, [data-cursor]')) {
        shrink()
      }
    }

    const hide = () => gsap.to([ring, dot], { opacity: 0, duration: 0.2 })
    const show = () => gsap.to([ring, dot], { opacity: 1, duration: 0.2 })

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseover', mouseOver)
    document.addEventListener('mouseout', mouseOut)
    document.addEventListener('mouseleave', hide)
    document.addEventListener('mouseenter', show)
    loop()

    return () => {
      document.body.style.cursor = ''
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', mouseOver)
      document.removeEventListener('mouseout', mouseOut)
      document.removeEventListener('mouseleave', hide)
      document.removeEventListener('mouseenter', show)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [isMobile, reducedMotion])

  if (isMobile || reducedMotion) return null

  return (
    <>
      <div ref={ringRef} className="cursor-ring">
        <span ref={labelRef} className="cursor-label">VIEW PROJECT →</span>
      </div>
      <div ref={dotRef} className="cursor-dot" />
    </>
  )
}