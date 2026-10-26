import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useIsMobile } from '../../hooks/useDevice'
import './Navbar.css'

const NAV_ITEMS = ['accueil', 'a-propos', 'projets', 'competences', 'parcours', 'contact']

export default function Navbar({ reducedMotion, onNavigate }) {
  const navRef = useRef(null)
  const linksRef = useRef([])
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'dark'
    let stored = null
    try {
      stored = localStorage.getItem('theme')
    } catch (e) {}
    if (stored === 'light' || stored === 'dark') return stored
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  })
  const isMobile = useIsMobile(768)

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 80)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (reducedMotion) return

    linksRef.current.forEach((link) => {
      if (!link) return
      const line = link.querySelector('.nav-underline')

      link.addEventListener('mouseenter', () => {
        gsap.to(line, {
          scaleX: 1,
          duration: 0.4,
          ease: 'power2.out'
        })
        gsap.to(linkText(link), {
          color: 'var(--primary)',
          y: -2,
          duration: 0.3,
          ease: 'power2.out'
        })
      })

      link.addEventListener('mouseleave', () => {
        gsap.to(line, {
          scaleX: 0,
          duration: 0.4,
          ease: 'power2.out'
        })
        gsap.to(linkText(link), {
          color: 'var(--text-primary)',
          y: 0,
          duration: 0.3,
          ease: 'power2.out'
        })
      })
    })
  }, [reducedMotion])

  useEffect(() => {
    if (!isMobile) return
    document.body.classList.toggle('no-scroll', menuOpen)
    return () => document.body.classList.remove('no-scroll')
  }, [menuOpen, isMobile])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', theme === 'light' ? '#f8fafc' : '#0a0a0f')
    try {
      localStorage.setItem('theme', theme)
    } catch (e) {}
  }, [theme])

  useEffect(() => {
    if (!isMobile) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMenuOpen(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isMobile])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  const linkText = (link) => link.querySelector('.nav-link-text')

  useEffect(() => {
    const links = document.querySelectorAll('.nav-link-text')
    links.forEach((link) => {
      gsap.set(link, { color: 'var(--text-primary)' })
    })
  }, [theme])

  const scrollTo = (id) => (e) => {
    e.preventDefault()
    let targetId = id
    if (id === 'accueil') targetId = 'hero'
    else if (id === 'a-propos') targetId = 'about'
    else if (id === 'projets') targetId = 'projects'
    else if (id === 'competences') targetId = 'skills'
    else if (id === 'parcours') targetId = 'experience'
    else if (id === 'contact') targetId = 'contact'
    const el = document.getElementById(targetId === 'hero' && id === 'accueil' ? 'hero' : (id === 'a-propos' ? 'about' : id === 'projets' ? 'projects' : id === 'competences' ? 'skills' : id === 'parcours' ? 'experience' : id === 'contact' ? 'contact' : targetId))
    if (el) {
      onNavigate(el)
      setMenuOpen(false)
    }
  }

  return (
    <>
      <a href="#hero" className="skip-link">Aller au contenu principal</a>
      <nav
        ref={navRef}
        className={`navbar ${scrolled ? 'navbar--scrolled' : ''} ${menuOpen ? 'navbar--open' : ''}`}
        aria-label="Navigation principale"
      >
      <div className="container navbar__inner">
        <a href="#hero" onClick={scrollTo('accueil')} className="navbar__logo" aria-label="Retour à l'accueil">
          <span className="navbar__logo-dot" />
          KR
        </a>

        {isMobile ? (
          <div className="navbar__actions">
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              aria-pressed={theme === 'light'}
              aria-label={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
              title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
            >
              <span className="theme-toggle__icon" aria-hidden="true">
                {theme === 'dark' ? '☀' : '☾'}
              </span>
            </button>
            <button
              className={`hamburger ${menuOpen ? 'hamburger--open' : ''}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={menuOpen}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        ) : (
          <div className="navbar__right">
            <ul className="navbar__links">
              {NAV_ITEMS.map((item, i) => (
                <li key={item}>
                  <a
                    ref={(el) => (linksRef.current[i] = el)}
                    href={`#${item}`}
                    onClick={scrollTo(item)}
                    className="nav-link"
                    style={{ '--i': i }}
                  >
                    <span className="nav-link-text">{item.toUpperCase()}</span>
                    <span className="nav-underline" />
                  </a>
                </li>
              ))}
            </ul>
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              aria-pressed={theme === 'light'}
              aria-label={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
              title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
            >
              <span className="theme-toggle__icon" aria-hidden="true">
                {theme === 'dark' ? '☀' : '☾'}
              </span>
            </button>
          </div>
        )}
      </div>

      {isMobile && (
        <div className="navbar__mobile-menu" role="menu">
          <ul>
            {NAV_ITEMS.map((item, i) => (
              <li key={item} role="none">
                <a
                  href={`#${item}`}
                  onClick={scrollTo(item)}
                  className="nav-mobile-link"
                  role="menuitem"
                  style={{ '--i': i }}
                >
                  <span className="nav-mobile-link-num">0{i + 1}</span>
                  {item.toUpperCase()}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
    </>
  )
}