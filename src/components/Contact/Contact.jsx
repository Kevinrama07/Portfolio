import { useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { personalInfo } from '../../data/projects'
import './Contact.css'

gsap.registerPlugin(useGSAP)

export default function Contact({ reducedMotion }) {
  const sectionRef = useRef(null)
  const magneticRef = useRef(null)
  const headingRef = useRef(null)
  const formRef = useRef(null)
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' })
  const [status, setStatus] = useState({ type: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus({ type: '', message: '' })

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
      setStatus({ type: 'error', message: 'Veuillez remplir tous les champs.' })
      return
    }
    if (!emailRegex.test(formData.email.trim())) {
      setStatus({ type: 'error', message: 'Veuillez saisir une adresse e-mail valide.' })
      return
    }

    setIsSubmitting(true)

    try {
        const response = await fetch('https://formspree.io/f/xpwrzqpo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(formData)
        })

        if (response.ok) {
          setStatus({ type: 'success', message: 'Message envoyé avec succès ! Je vous répondrai bientôt.' })
          setFormData({ name: '', email: '', subject: '', message: '' })
        } else {
          const data = await response.json().catch(() => ({}))
          if (data.errors) {
            setStatus({ type: 'error', message: data.errors.map((err) => err.message).join(', ') })
          } else {
            setStatus({ type: 'error', message: "Erreur lors de l'envoi. Veuillez réessayer ou m'envoyer un email directement." })
          }
        }
      } catch (error) {
        setStatus({ type: 'error', message: "Erreur lors de l'envoi. Veuillez réessayer ou m'envoyer un email directement." })
      } finally {
      setIsSubmitting(false)
    }
  }

  useGSAP(() => {
    if (reducedMotion) return

    gsap.from(headingRef.current, {
      y: 60,
      opacity: 0,
      duration: 1.2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 70%',
        once: true
      }
    })

    gsap.from('.contact-link', {
      y: 30,
      opacity: 0,
      stagger: 0.15,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.contact-links',
        start: 'top 85%',
        once: true
      }
    })

    gsap.from('.contact-form', {
      y: 40,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.contact-form',
        start: 'top 85%',
        once: true
      }
    })

    const magnetic = magneticRef.current
    if (!magnetic) return

    const strength = 0.35

    const onMove = (e) => {
      const rect = magnetic.getBoundingClientRect()
      const x = e.clientX - rect.left - rect.width / 2
      const y = e.clientY - rect.top - rect.height / 2
      gsap.to(magnetic, {
        x: x * strength,
        y: y * strength,
        duration: 0.5,
        ease: 'power2.out'
      })
      gsap.to(magnetic.querySelector('.contact-cta-btn'), {
        scale: 1.05,
        duration: 0.3,
        ease: 'power2.out'
      })
    }

    const onLeave = () => {
      gsap.to(magnetic, {
        x: 0,
        y: 0,
        duration: 0.8,
        ease: 'elastic.out(1, 0.4)'
      })
      gsap.to(magnetic.querySelector('.contact-cta-btn'), {
        scale: 1,
        duration: 0.4,
        ease: 'power2.out'
      })
    }

    magnetic.addEventListener('mousemove', onMove)
    magnetic.addEventListener('mouseleave', onLeave)

    return () => {
      magnetic.removeEventListener('mousemove', onMove)
      magnetic.removeEventListener('mouseleave', onLeave)
    }
  }, { scope: sectionRef })

  return (
    <section ref={sectionRef} id="contact" className="contact section" aria-label="Contact">
      <div className="container contact__inner">
        <h2 ref={headingRef} className="contact__heading">
          CRÉONS<br />
          <span className="contact__heading-accent">QUELQUE CHOSE D'EXCEPTIONNEL.</span>
        </h2>

        <p className="contact__subtitle">Discutons de votre projet</p>

        <form ref={formRef} className="contact-form" onSubmit={handleSubmit} noValidate aria-label="Formulaire de contact">
          <div className="contact-form__row">
            <div className="contact-form__group">
              <label htmlFor="name" className="contact-form__label">Nom complet</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="contact-form__input"
                placeholder="Votre nom"
                required
                aria-required="true"
              />
            </div>
            <div className="contact-form__group">
              <label htmlFor="email" className="contact-form__label">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="contact-form__input"
                placeholder="votre@email.com"
                required
                aria-required="true"
              />
            </div>
          </div>
          <div className="contact-form__group">
            <label htmlFor="subject" className="contact-form__label">Sujet</label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className="contact-form__input"
              placeholder="Sujet de votre message"
              required
              aria-required="true"
            />
          </div>
          <div className="contact-form__group">
            <label htmlFor="message" className="contact-form__label">Message</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              className="contact-form__textarea"
              rows="6"
              placeholder="Écrivez votre message ici..."
              required
              aria-required="true"
            />
          </div>
          {status.message && (
            <div className={`contact-form__status contact-form__status--${status.type}`} role="alert">
              {status.message}
            </div>
          )}
          <button type="submit" className="contact-form__submit" disabled={isSubmitting}>
            {isSubmitting ? 'ENVOI EN COURS...' : 'ENVOYER LE MESSAGE'}
            <span className="contact-form__submit-arrow">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </button>
        </form>

        <div className="contact__divider">
          <span>OU</span>
        </div>

        <div className="contact__magnetic" ref={magneticRef}>
          <a href={`mailto:${personalInfo.email}`} className="contact-cta-btn" aria-label="Envoyer un email directement">
            <span className="contact-cta-glow" />
            M'ENVOYER UN EMAIL
            <span className="contact-cta-arrow">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M7 17L17 7M17 7H8M17 7v9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </a>
        </div>

        <div className="contact-links">
          <a href={`mailto:${personalInfo.email}`} className="contact-link">
            <span className="contact-link__icon">✉</span>
            <span className="contact-link__label">EMAIL</span>
            <span className="contact-link__value">{personalInfo.email}</span>
          </a>
          <a href={personalInfo.github} target="_blank" rel="noreferrer noopener" className="contact-link">
            <span className="contact-link__icon">⌬</span>
            <span className="contact-link__label">GITHUB</span>
            <span className="contact-link__value">github.com/kevinrama07</span>
          </a>
          <a href={personalInfo.linkedin} target="_blank" rel="noreferrer noopener" className="contact-link">
            <span className="contact-link__icon">◈</span>
            <span className="contact-link__label">LINKEDIN</span>
            <span className="contact-link__value">linkedin.com/in/kevin-ramamonjisoa-511404379</span>
          </a>
          {personalInfo.cvUrl && (
            <a href={personalInfo.cvUrl} download className="contact-link">
              <span className="contact-link__icon">↓</span>
              <span className="contact-link__label">CV</span>
              <span className="contact-link__value">Télécharger mon CV</span>
            </a>
          )}
        </div>

        <footer className="contact__footer">
          <p>© {new Date().getFullYear()} KEVIN RAMAMONJISOA — PORTFOLIO 2026</p>
          <p className="contact__footer-note">CONÇU & DÉVELOPPÉ AVEC PASSION</p>
        </footer>
      </div>
    </section>
  )
}