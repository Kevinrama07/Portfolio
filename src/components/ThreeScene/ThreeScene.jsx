import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useMemo, useRef, useEffect, useState } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import gsap from 'gsap'
import { useIsMobile, usePrefersReducedMotion } from '../../hooks/useDevice'

gsap.registerPlugin(ScrollTrigger)

// ---------------------------------------------------------------------------
// Conception des traits géographiques (lat/long) + points de données (villes)
// ---------------------------------------------------------------------------
function buildGlobeDetails(radius) {
  const latLines = []
  const longLines = []
  const cities = []

  // Parallèles (latitudes) — pas de 20°, inclut les pôles pour fermer la sphère
  for (let lat = -80; lat <= 80; lat += 20) {
    const phi = (lat * Math.PI) / 180
    const points = []
    for (let lng = 0; lng <= 360; lng += 3) {
      const theta = (lng * Math.PI) / 180
      const x = radius * Math.cos(phi) * Math.cos(theta)
      const y = radius * Math.sin(phi)
      const z = radius * Math.cos(phi) * Math.sin(theta)
      points.push(new THREE.Vector3(x, y, z))
    }
    latLines.push(points)
  }

  // Méridiens (longitudes) — pas de 20° également, grille régulière 20°/20°
  // (2 demi-méridiens par tranche de 20° pour couvrir les 360°)
  for (let lng = 0; lng < 360; lng += 10) {
    const theta = (lng * Math.PI) / 180
    const points = []
    for (let lat = -90; lat <= 90; lat += 3) {
      const phi = (lat * Math.PI) / 180
      const x = radius * Math.cos(phi) * Math.cos(theta)
      const y = radius * Math.sin(phi)
      const z = radius * Math.cos(phi) * Math.sin(theta)
      points.push(new THREE.Vector3(x, y, z))
    }
    longLines.push(points)
  }

  // Points de données / "villes"
  const citySpecs = [
    [30, 10], [-70, 40], [75, 30], [-30, -20], [120, 25],
    [14, 45], [100, 10], [-120, 35], [50, 55], [-50, -10],
    [140, -35], [25, -25], [-95, 40], [10, 50], [90, 55]
  ]
  citySpecs.forEach(([lng, lat]) => {
    const phi = (lat * Math.PI) / 180
    const theta = (lng * Math.PI) / 180
    const x = radius * Math.cos(phi) * Math.cos(theta)
    const y = radius * Math.sin(phi)
    const z = radius * Math.cos(phi) * Math.sin(theta)
    cities.push(new THREE.Vector3(x, y, z))
  })

  return { latLines, longLines, cities }
}

// ---------------------------------------------------------------------------
// Matériau shader holographique pour la sphère de base
// ---------------------------------------------------------------------------
const HOLO_VERT = `
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewDir = normalize(-mvPosition.xyz);
    gl_Position = projectionMatrix * mvPosition;
  }
`

const HOLO_FRAG = `
  uniform float uTime;
  uniform float uOpacity;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uRim;
  varying vec3 vNormal;
  varying vec3 vViewDir;

  void main() {
    float rim = 1.0 - abs(dot(vNormal, vViewDir));
    float fresnel = pow(rim, 1.6);

    float pulse = 0.7 + 0.3 * sin(uTime * 0.4);
    vec3 core = mix(uColorB, uColorA, pulse);
    vec3 glow = mix(uColorA, uRim, fresnel * 0.6);

    vec3 color = mix(core, glow, fresnel * 0.8);
    float alpha = (0.08 + fresnel * 0.6) * uOpacity;

    gl_FragColor = vec4(color, alpha);
  }
`

function HaloSphere({ radius, r, reduced, theme }) {
  const matRef = useRef()
  const colors = theme === 'light'
    ? { a: new THREE.Color('#0ea5e9'), b: new THREE.Color('#bae6fd'), rim: new THREE.Color('#0369a1') }
    : { a: new THREE.Color('#1e90ff'), b: new THREE.Color('#020617'), rim: new THREE.Color('#dbeafe') }

  useFrame(({ clock }) => {
    if (matRef.current && !reduced) {
      matRef.current.uniforms.uTime.value = clock.getElapsedTime() * 0.6
    }
  })

  useEffect(() => {
    if (matRef.current) {
      matRef.current.uniforms.uColorA.value.copy(colors.a)
      matRef.current.uniforms.uColorB.value.copy(colors.b)
      matRef.current.uniforms.uRim.value.copy(colors.rim)
    }
  }, [theme])

  return (
    <mesh scale={[r, r, r]}>
      <sphereGeometry args={[radius, 64, 64]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={HOLO_VERT}
        fragmentShader={HOLO_FRAG}
        transparent
        depthWrite={false}
        uniforms={{
          uTime: { value: 0 },
          uOpacity: { value: 1 },
          uColorA: { value: colors.a },
          uColorB: { value: colors.b },
          uRim: { value: colors.rim }
        }}
      />
    </mesh>
  )
}

// ---------------------------------------------------------------------------
// Globe : traits géo, wireframe, villes, connexions
// ---------------------------------------------------------------------------
function Globe({ radius, reduced, theme }) {
  const groupRef = useRef()
  const cityPointsRef = useRef()
  const linesRef = useRef()
  const lineColors = theme === 'light' ? { lat: '#38bdf8', lng: '#8b5cf6' } : { lat: '#3b82f6', lng: '#2563eb' }

  const { latLines, longLines, cities } = useMemo(() => buildGlobeDetails(radius), [radius])

  const connections = useMemo(() => [], [cities, radius])

  // pulsing des villes
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const globe = groupRef.current
    if (globe) {
      // rotation lente multi-axes (légère)
      globe.rotation.y += (reduced ? 0 : 0.003)
      globe.rotation.x = Math.sin(t * 0.12) * 0.06
    }
  })

  return (
    <group ref={groupRef}>
      {/* sphère de base holographique */}
      <HaloSphere radius={1} r={radius} reduced={reduced} theme={theme} />

      {/* coquille de traits géographiques (grille lat/long uniquement) */}
      <group>
        {latLines.map((pts, i) => (
          <line key={`lat-${i}`}>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[new Float32Array(pts.flatMap((p) => [p.x, p.y, p.z])), 3]} />
            </bufferGeometry>
            <lineBasicMaterial color={lineColors.lat} transparent opacity={theme === 'light' ? 0.16 : 0.22} depthWrite={false} />
          </line>
        ))}

        {longLines.map((pts, i) => (
          <line key={`lng-${i}`}>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[new Float32Array(pts.flatMap((p) => [p.x, p.y, p.z])), 3]} />
            </bufferGeometry>
            <lineBasicMaterial color={lineColors.lng} transparent opacity={theme === 'light' ? 0.14 : 0.2} depthWrite={false} />
          </line>
        ))}
      </group>
    </group>
  )
}

// ---------------------------------------------------------------------------
// Anneaux orbitaux
// ---------------------------------------------------------------------------
function Rings({ radius, reduced, theme }) {
  const groupRef = useRef()
  const speeds = [0.004, -0.006, 0.003]
  const configs = theme === 'light'
    ? [
        { r: radius * 1.6, color: '#38bdf8', opacity: 0.32, tube: 0.0032 },
        { r: radius * 1.9, color: '#8b5cf6', opacity: 0.24, tube: 0.0026 },
        { r: radius * 2.25, color: '#38bdf8', opacity: 0.16, tube: 0.002 }
      ]
    : [
        { r: radius * 1.6, color: '#2563eb', opacity: 0.42, tube: 0.0035 },
        { r: radius * 1.9, color: '#1d4ed8', opacity: 0.32, tube: 0.0028 },
        { r: radius * 2.25, color: '#1e40af', opacity: 0.24, tube: 0.002 }
      ]

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const g = groupRef.current
    if (!g) return
    g.children.forEach((child, i) => {
      if (reduced) return
      if (child.isMesh) {
        child.rotation.x = Math.PI / 2 + Math.sin(t * 0.2 + i * 2) * 0.12
        child.rotation.z += speeds[i % speeds.length]
      }
    })
  })

  return (
    <group ref={groupRef}>
      {configs.map((c, i) => (
        <mesh key={i} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[c.r, c.tube, 16, 128]} />
          <meshBasicMaterial color={c.color} transparent opacity={c.opacity} depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}

// ---------------------------------------------------------------------------
// Particules orbitales en halo
// ---------------------------------------------------------------------------
function OrbitalParticles({ count, reduced, theme }) {
  const pointsRef = useRef()
  const velocities = useRef([])
  const color = theme === 'light' ? '#38bdf8' : '#2563eb'

  const { positions, base } = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const speeds = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      const radius = 2.8 + Math.random() * 3.8
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      pos[i * 3 + 2] = radius * Math.cos(phi)
      speeds[i] = (0.003 + Math.random() * 0.008) * (Math.random() < 0.5 ? -1 : 1)
    }
    return { positions: pos, base: speeds }
  }, [count])

  velocities.current = base

  useFrame(() => {
    const points = pointsRef.current
    if (!points || reduced) return
    const attr = points.geometry.attributes.position
    for (let i = 0; i < count; i++) {
      const x = attr.array[i * 3]
      const z = attr.array[i * 3 + 2]
      const s = velocities.current[i]
      const nx = x * Math.cos(s) - z * Math.sin(s)
      const nz = x * Math.sin(s) + z * Math.cos(s)
      attr.array[i * 3] = nx
      attr.array[i * 3 + 2] = nz
    }
    attr.needsUpdate = true
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={0.025}
        sizeAttenuation
        transparent
        opacity={theme === 'light' ? 0.32 : 0.4}
        depthWrite={false}
      />
    </points>
  )
}

// ---------------------------------------------------------------------------
// État global de l'animation (position, rotation, scale, opacité globaux)
// ---------------------------------------------------------------------------
function useGlobeState() {
  const state = useRef({
    pos: { x: 0, y: 0, z: 0 },
    rot: { x: 0, y: 0, z: 0 },
    scale: 1,
    opacity: 1,
    speed: 1
  })
  return state
}

// ---------------------------------------------------------------------------
// Objet central orchestré par le scroll + la souris
// ---------------------------------------------------------------------------
function CentralObject({ mouse, velocity, state, radius, isMobile, reduced, theme }) {
  const outerRef = useRef()
  const spinRef = useRef()
  const globalOpacity = useRef(1)
  const lastAppliedOpacity = useRef(null)

  // rotation continue propre (spin interne), vitesse pilotée par le scroll
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const outer = outerRef.current
    const spin = spinRef.current
    if (!outer || !spin) return

    const s = state.current

    if (reduced) {
      outer.rotation.x = s.rot.x
      outer.rotation.y = s.rot.y
      outer.rotation.z = s.rot.z
      outer.position.x = s.pos.x
      outer.position.y = s.pos.y
      outer.position.z = s.pos.z
      outer.scale.set(s.scale, s.scale, s.scale)
      globalOpacity.current = s.opacity
      if (lastAppliedOpacity.current === null || Math.abs(globalOpacity.current - lastAppliedOpacity.current) > 0.001) {
        applyOpacity(outer, globalOpacity.current, reduced)
        lastAppliedOpacity.current = globalOpacity.current
      }
      return
    }

    // rotation lente multi-axes + inclinaison (mouvement organique via sinus)
    const organicX = Math.sin(t * 0.11) * (isMobile ? 0.025 : 0.05)
    const organicZ = Math.cos(t * 0.13) * (isMobile ? 0.02 : 0.04)
    outer.rotation.x = s.rot.x + organicX
    outer.rotation.y = s.rot.y + organicZ
    outer.rotation.z = s.rot.z + Math.sin(t * 0.09) * (isMobile ? 0.02 : 0.03)

    // spin interne continu
    spin.rotation.y += 0.0018 * s.speed

    // mouvement vertical organique (flottement)
    const bob = Math.sin(t * 0.18) * (isMobile ? 0.015 : 0.06)
    outer.position.y = s.pos.y + bob

    // parallax / suivi souris (subtile)
    const mx = mouse.current.x
    const my = mouse.current.y
    const parallaxX = isMobile ? mx * 0.5 : mx * 0.55
    const parallaxY = isMobile ? my * 0.4 : my * 0.35
    const targetX = s.pos.x + parallaxX
    const targetY = s.pos.y + bob + parallaxY
    const targetScale = s.scale * (1 + (-Math.max(0, velocity.current - 1)) * 0.02)

    // lerp doux
    outer.position.x = THREE.MathUtils.lerp(outer.position.x, targetX, 0.06)
    outer.position.y = THREE.MathUtils.lerp(outer.position.y, targetY, 0.06)
    outer.position.z = THREE.MathUtils.lerp(outer.position.z, s.pos.z, 0.05)

    const sc = THREE.MathUtils.lerp(outer.scale.x, targetScale, 0.06)
    outer.scale.set(sc, sc, sc)

    // opacité globale
    globalOpacity.current = THREE.MathUtils.lerp(globalOpacity.current, s.opacity, 0.06)
    const g = globalOpacity.current
    if (lastAppliedOpacity.current === null || Math.abs(g - lastAppliedOpacity.current) > 0.002) {
      applyOpacity(outer, g, reduced)
      lastAppliedOpacity.current = g
    }
  })

  return (
    <group ref={outerRef}>
      <group ref={spinRef}>
        <Globe radius={radius} reduced={reduced} theme={theme} />
      </group>
      <Rings radius={radius} reduced={reduced} theme={theme} />
    </group>
  )
}

// Applique l'opacité globale en snapshot (la valeur globalOpacity
// s'ease déjà dans le useFrame, on applique donc directement base * target)
function applyOpacity(root, target, reduced) {
  root.traverse((child) => {
    if (child.isMesh || child.isLine || child.isPoints) {
      const mat = child.material
      if (mat) {
        if (mat.userData.baseOpacity === undefined) {
          mat.userData.baseOpacity = mat.transparent && mat.opacity !== undefined ? mat.opacity : 1
        }
        const base = mat.userData.baseOpacity
        if (mat.isShaderMaterial && mat.uniforms && mat.uniforms.uOpacity) {
          mat.uniforms.uOpacity.value = base * target
        } else if (mat.transparent && mat.opacity !== undefined) {
          mat.opacity = base * target
        }
      }
    }
  })
}

// ---------------------------------------------------------------------------
// Rig caméra avec scroll-choreography par section
// ---------------------------------------------------------------------------
function ScrollDrive({ state, isMobile, sections, isReady, reduced }) {
  const { camera, size, invalidate } = useThree()

  useEffect(() => {
    if (!isReady) return
    const baseZ = isMobile ? 5.0 : 5.8
    camera.position.set(0, 0, baseZ)
    const aspect = size.width / size.height
    const mobileFov = 2 * Math.atan((4.32 / 2) / (baseZ * aspect)) * (180 / Math.PI)
    camera.fov = isMobile ? THREE.MathUtils.clamp(mobileFov, 58, 82) : 55
    camera.updateProjectionMatrix()

    const frames = [
      { x: 0, y: 0, z: 0, ry: 0.4, rx: 0.05, scale: isMobile ? 0.88 : 1.175, opacity: 0.525, speed: 0.85 },
      { x: 0, y: 0, z: 0, ry: 1.1, rx: 0.175, scale: isMobile ? 0.84 : 1.075, opacity: 0.65, speed: 1.05 },
      { x: 0, y: 0, z: 0, ry: 3.3, rx: 0.025, scale: isMobile ? 0.8 : 0.975, opacity: 0.675, speed: 1.1 },
      { x: 0, y: 0, z: 0, ry: 2.3, rx: 0.175, scale: isMobile ? 0.78 : 0.925, opacity: 0.775, speed: 1.375 },
      { x: 0, y: 0, z: 0, ry: 4.2, rx: 0.025, scale: isMobile ? 0.76 : 0.875, opacity: 0.575, speed: 0.675 },
      { x: 0, y: 0, z: 0, ry: 4.9, rx: 0.125, scale: isMobile ? 0.74 : 0.875, opacity: 0.475, speed: 0.575 }
    ]
    const elements = sections.map((selector) => document.querySelector(selector)).filter(Boolean)

    const updatePose = () => {
      if (!elements.length) return

      const viewportCenter = window.scrollY + window.innerHeight / 2
      const anchors = elements.map((element, index) => ({
        position: element.getBoundingClientRect().top + window.scrollY + element.offsetHeight / 2,
        frame: frames[index]
      }))

      if (viewportCenter <= anchors[0].position || anchors.length === 1) {
        applyPose(state.current, anchors[0].frame, anchors[0].frame, 0)
        return
      }

      const nextIndex = anchors.findIndex((anchor, index) => index > 0 && viewportCenter <= anchor.position)
      if (nextIndex === -1) {
        const lastFrame = anchors[anchors.length - 1].frame
        applyPose(state.current, lastFrame, lastFrame, 0)
        return
      }

      const previous = anchors[nextIndex - 1]
      const next = anchors[nextIndex]
      const progress = THREE.MathUtils.clamp(
        (viewportCenter - previous.position) / (next.position - previous.position),
        0,
        1
      )
      const eased = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2
      applyPose(state.current, previous.frame, next.frame, eased)
    }

    const refresh = () => {
      updatePose()
      if (reduced) invalidate()
    }

    const trigger = ScrollTrigger.create({
      start: 0,
      end: () => ScrollTrigger.maxScroll(window),
      onUpdate: refresh,
      onRefresh: refresh
    })
    refresh()

    return () => {
      trigger.kill()
    }
  }, [camera, invalidate, isMobile, isReady, reduced, sections, size.width, size.height])

  useFrame(() => {
    camera.lookAt(0, 0, 0)
  })

  return null
}

function lerp(a, b, t) {
  return a + (b - a) * t
}

function applyPose(state, from, to, progress) {
  state.pos.x = lerp(from.x, to.x, progress)
  state.pos.y = lerp(from.y, to.y, progress)
  state.pos.z = lerp(from.z, to.z, progress)
  state.rot.y = lerp(from.ry, to.ry, progress)
  state.rot.x = lerp(from.rx, to.rx, progress)
  state.scale = lerp(from.scale, to.scale, progress)
  state.opacity = lerp(from.opacity, to.opacity, progress)
  state.speed = lerp(from.speed, to.speed, progress)
}

// ---------------------------------------------------------------------------
// Scène principale
// ---------------------------------------------------------------------------
function SceneContent({ mouse, velocity, state, isMobile, reduced, isReady, theme }) {
  const radius = isMobile ? 1.8 : 2.2
  const sections = ['#hero', '#about', '#projects', '#skills', '#experience', '#contact']
  return (
    <>
      <ambientLight intensity={theme === 'light' ? 0.8 : 0.5} />
      <directionalLight position={[4, 6, 5]} intensity={theme === 'light' ? 1.2 : 1.6} color={theme === 'light' ? '#38bdf8' : '#1e90ff'} />
      <directionalLight position={[-5, -4, -3]} intensity={theme === 'light' ? 0.9 : 1.2} color={theme === 'light' ? '#8b5cf6' : '#2563eb'} />
      <pointLight position={[0, 0, 6]} intensity={theme === 'light' ? 8 : 12} color="#ffffff" />
      <CentralObject mouse={mouse} velocity={velocity} state={state} radius={radius} isMobile={isMobile} reduced={reduced} theme={theme} />
      <ScrollDrive state={state} isMobile={isMobile} sections={sections} isReady={isReady} reduced={reduced} />
    </>
  )
}

// ---------------------------------------------------------------------------
// Composant exporté
// ---------------------------------------------------------------------------
export default function ThreeScene() {
  const mouse = useRef({ x: 0, y: 0 })
  const velocity = useRef(1)
  const state = useGlobeState()
  const [ready, setReady] = useState(false)
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'dark'
    return document.documentElement.getAttribute('data-theme') || 'dark'
  })
  const isMobile = useIsMobile()
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark'
      setTheme(current)
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    let lastX = null
    let lastY = null
    let lastT = performance.now()
    const handler = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1
      if (lastX !== null) {
        const now = performance.now()
        const dt = Math.max(1, now - lastT)
        const dx = e.clientX - lastX
        const dy = e.clientY - lastY
        const mag = Math.sqrt(dx * dx + dy * dy) / dt
        velocity.current = THREE.MathUtils.clamp(1 + mag * 4, 1, 1.6)
      }
      lastX = e.clientX
      lastY = e.clientY
      lastT = performance.now()
    }
    const touchHandler = (e) => {
      if (e.touches.length > 0) {
        const t = e.touches[0]
        mouse.current.x = (t.clientX / window.innerWidth) * 2 - 1
        mouse.current.y = -(t.clientY / window.innerHeight) * 2 + 1
        if (lastX !== null) {
          const now = performance.now()
          const dt = Math.max(1, now - lastT)
          const dx = t.clientX - lastX
          const dy = t.clientY - lastY
          const mag = Math.sqrt(dx * dx + dy * dy) / dt
          velocity.current = THREE.MathUtils.clamp(1 + mag * 4, 1, 1.6)
        }
        lastX = t.clientX
        lastY = t.clientY
        lastT = performance.now()
      }
    }
    window.addEventListener('mousemove', handler)
    window.addEventListener('touchmove', touchHandler, { passive: true })
    return () => {
      window.removeEventListener('mousemove', handler)
      window.removeEventListener('touchmove', touchHandler)
    }
  }, [])

  useEffect(() => {
    if (!isMobile) return
    let ticking = false
    const handler = (e) => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(() => {
          const gamma = e.gamma || 0
          const beta = e.beta || 0
          mouse.current.x = THREE.MathUtils.clamp(gamma / 45, -1, 1)
          mouse.current.y = THREE.MathUtils.clamp((beta - 45) / 45, -1, 1)
          ticking = false
        })
      }
    }
    if (typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then((perm) => { if (perm === 'granted') window.addEventListener('deviceorientation', handler) })
        .catch(() => {})
    } else {
      window.addEventListener('deviceorientation', handler)
    }
    return () => window.removeEventListener('deviceorientation', handler)
  }, [isMobile])

  useEffect(() => {
    // attendre que ScrollTrigger soit prêt (scope global GSAP)
    const id = setTimeout(() => setReady(true), reduced ? 200 : 400)
    return () => clearTimeout(id)
  }, [reduced])

  const dpr = isMobile ? [1, 1.5] : [1, 2]

  return (
    <div className="webgl-canvas" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, isMobile ? 5.0 : 5.8], fov: isMobile ? 56 : 55 }}
        dpr={dpr}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: 'high-performance'
        }}
        frameloop={reduced ? 'demand' : 'always'}
      >
        <SceneContent
          mouse={mouse}
          velocity={velocity}
          state={state}
          isMobile={isMobile}
          reduced={reduced}
          isReady={ready}
          theme={theme}
        />
      </Canvas>
    </div>
  )
}
