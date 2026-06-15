import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'

// ── Linear-inspired dark design tokens ──
const tokens = {
  bg: '#08090a',
  surface: '#0f1011',
  elevated: '#191a1b',
  textPrimary: '#f7f8f8',
  textSecondary: '#d0d6e0',
  textMuted: '#8a8f98',
  textSubtle: '#62666d',
  accent: '#5e6ad2',
  accentLight: '#7170ff',
  accentHover: '#828fff',
  border: 'rgba(255,255,255,0.08)',
  borderSubtle: 'rgba(255,255,255,0.05)',
  danger: '#e5484d',
  success: '#10b981',
}

// ── Floating 3D shape definitions ──
const shapes = [
  { type: 'cube', size: 60, x: '10%', y: '15%', duration: 20, delay: 0, opacity: 0.06 },
  { type: 'octa', size: 40, x: '85%', y: '20%', duration: 25, delay: 3, opacity: 0.05 },
  { type: 'cube', size: 80, x: '75%', y: '70%', duration: 30, delay: 6, opacity: 0.04 },
  { type: 'pyramid', size: 50, x: '20%', y: '75%', duration: 22, delay: 9, opacity: 0.05 },
  { type: 'cube', size: 35, x: '50%', y: '10%', duration: 18, delay: 2, opacity: 0.07 },
  { type: 'octa', size: 55, x: '90%', y: '55%', duration: 28, delay: 5, opacity: 0.04 },
  { type: 'pyramid', size: 45, x: '5%', y: '50%', duration: 24, delay: 8, opacity: 0.05 },
]

// ── Particle dots ──
const particles = Array.from({ length: 30 }, (_, i) => ({
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: 1 + Math.random() * 2,
  duration: 8 + Math.random() * 12,
  delay: Math.random() * 10,
  opacity: 0.15 + Math.random() * 0.25,
}))

export default function LoginPage() {
  const { register, login } = useAuth()
  const [isRegister, setIsRegister] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 })
  const cardRef = useRef(null)

  // Mouse parallax tilt
  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = e.clientX / window.innerWidth
      const y = e.clientY / window.innerHeight
      setMousePos({ x, y })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    const fn = isRegister ? register : login
    const result = await fn(username.trim(), password)
    if (result.status !== 'ok') setError(result.message || '操作失败')
    setSubmitting(false)
  }

  const tiltX = (mousePos.y - 0.5) * 3
  const tiltY = (mousePos.x - 0.5) * 3

  return (
    <div style={s.outer}>
      {/* Animated aurora glow */}
      <div style={s.aurora} />

      {/* Floating 3D shapes */}
      {shapes.map((shape, i) => (
        <Shape3D key={i} {...shape} />
      ))}

      {/* Floating particles */}
      {particles.map((p, i) => (
        <div
          key={`p${i}`}
          style={{
            ...s.particle,
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            animation: `driftUp ${p.duration}s ${p.delay}s infinite linear`,
          }}
        />
      ))}

      {/* Grid overlay */}
      <div style={s.gridBg} />

      {/* Card with 3D tilt */}
      <div
        ref={cardRef}
        style={{
          ...s.card,
          transform: `perspective(800px) rotateX(${-tiltX}deg) rotateY(${tiltY}deg)`,
          transition: 'transform 0.3s ease-out',
        }}
      >
        {/* Card inner glow */}
        <div style={s.cardGlow} />

        <div style={s.logoRow}>
          <div style={s.logoMark}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="6" fill={tokens.accent} />
              <path d="M8 10l6-4 6 4v8l-6 4-6-4V10z" stroke="#fff"
                strokeWidth="1.5" strokeLinejoin="round" fill="none" />
              <path d="M14 14v8" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M8 12l6 4 6-4" stroke="#fff" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
            </svg>
          </div>
        </div>

        <h1 style={s.title}>SQL Practice</h1>
        <p style={s.subtitle}>
          {isRegister ? 'Create your account' : 'Sign in to continue'}
        </p>

        <form onSubmit={handleSubmit} style={s.form}>
          <div style={s.inputGroup}>
            <label style={s.label}>Username</label>
            <input style={s.input} type="text" placeholder="Enter your username"
              value={username} onChange={e => setUsername(e.target.value)}
              required autoFocus minLength={2} maxLength={20} autoComplete="username" />
          </div>
          <div style={s.inputGroup}>
            <label style={s.label}>Password</label>
            <input style={s.input} type="password" placeholder="Enter your password"
              value={password} onChange={e => setPassword(e.target.value)}
              required minLength={4}
              autoComplete={isRegister ? 'new-password' : 'current-password'} />
          </div>

          {error && (
            <div style={s.errorBox}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
                style={{ flexShrink: 0, marginTop: 1 }}>
                <circle cx="7" cy="7" r="6" stroke={tokens.danger} strokeWidth="1.5" />
                <path d="M7 4v3.5M7 10v.5" stroke={tokens.danger}
                  strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <button type="submit" style={{
            ...s.button,
            opacity: submitting ? 0.7 : 1,
            cursor: submitting ? 'wait' : 'pointer',
          }} disabled={submitting}>
            {submitting ? 'Loading...' : isRegister ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <div style={s.divider}>
          <span style={s.dividerLine} />
          <span style={s.dividerText}>
            {isRegister ? 'Already have an account?' : "Don't have an account?"}
          </span>
          <span style={s.dividerLine} />
        </div>

        <button style={s.switchButton}
          onClick={() => { setIsRegister(!isRegister); setError('') }}>
          {isRegister ? 'Sign in instead' : 'Create one'}
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
            style={{ marginLeft: 4 }}>
            <path d="M4.5 2.5l3.5 3.5-3.5 3.5" stroke="currentColor"
              strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <p style={s.footer}>
        180+ exercises · Instant validation · SQLBolt curriculum
      </p>

      {/* Inject keyframes */}
      <style>{animations}</style>
    </div>
  )
}

// ── 3D Shape Component ──
function Shape3D({ type, size, x, y, duration, delay, opacity }) {
  const half = size / 2
  const faceStyle = {
    position: 'absolute',
    width: size,
    height: size,
    border: '1px solid rgba(94,106,210,0.15)',
    background: 'rgba(94,106,210,0.03)',
    backfaceVisibility: 'hidden',
  }

  return (
    <div style={{
      position: 'absolute',
      left: x, top: y,
      width: size, height: size,
      transformStyle: 'preserve-3d',
      animation: `float3D ${duration}s ${delay}s infinite ease-in-out`,
      opacity,
      pointerEvents: 'none',
      zIndex: 0,
    }}>
      {type === 'cube' && (
        <>
          <div style={{ ...faceStyle, transform: `translateZ(${half}px)` }} />
          <div style={{ ...faceStyle, transform: `rotateY(180deg) translateZ(${half}px)` }} />
          <div style={{ ...faceStyle, transform: `rotateY(90deg) translateZ(${half}px)` }} />
          <div style={{ ...faceStyle, transform: `rotateY(-90deg) translateZ(${half}px)` }} />
          <div style={{ ...faceStyle, transform: `rotateX(90deg) translateZ(${half}px)` }} />
          <div style={{ ...faceStyle, transform: `rotateX(-90deg) translateZ(${half}px)` }} />
        </>
      )}
      {type === 'octa' && (
        <>
          <div style={{ ...faceStyle, clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
            transform: `rotateY(0deg) translateZ(${half}px)` }} />
          <div style={{ ...faceStyle, clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
            transform: `rotateY(90deg) translateZ(${half}px)` }} />
          <div style={{ ...faceStyle, clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
            transform: `rotateY(180deg) translateZ(${half}px)` }} />
          <div style={{ ...faceStyle, clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
            transform: `rotateY(270deg) translateZ(${half}px)` }} />
        </>
      )}
      {type === 'pyramid' && (
        <>
          <div style={{
            ...faceStyle,
            clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)',
            transform: `rotateY(60deg) rotateX(30deg) translateZ(${half * 0.7}px)`,
          }} />
          <div style={{
            ...faceStyle,
            clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)',
            transform: `rotateY(180deg) rotateX(30deg) translateZ(${half * 0.7}px)`,
          }} />
          <div style={{
            ...faceStyle,
            clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)',
            transform: `rotateY(300deg) rotateX(30deg) translateZ(${half * 0.7}px)`,
          }} />
          <div style={{
            position: 'absolute', width: size, height: size,
            background: 'rgba(94,106,210,0.04)',
            transform: `rotateX(90deg) translateZ(${half * 0.3}px)`,
          }} />
        </>
      )}
    </div>
  )
}

// ── CSS Animations ──
const animations = `
@keyframes float3D {
  0%, 100% { transform: rotateX(0deg) rotateY(0deg) translateY(0px); }
  25% { transform: rotateX(180deg) rotateY(90deg) translateY(-20px); }
  50% { transform: rotateX(360deg) rotateY(180deg) translateY(0px); }
  75% { transform: rotateX(180deg) rotateY(270deg) translateY(20px); }
}

@keyframes driftUp {
  0% { transform: translateY(0) scale(1); opacity: 0; }
  10% { opacity: 0.3; }
  90% { opacity: 0.3; }
  100% { transform: translateY(-120px) scale(0.5); opacity: 0; }
}

@keyframes auroraPulse {
  0%, 100% { opacity: 0.3; transform: scale(1) rotate(0deg); }
  50% { opacity: 0.5; transform: scale(1.1) rotate(3deg); }
}
`

// ── Styles ──
const s = {
  outer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: tokens.bg,
    padding: '24px',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    WebkitFontSmoothing: 'antialiased',
    perspective: '800px',
  },
  aurora: {
    position: 'absolute',
    width: '600px',
    height: '600px',
    borderRadius: '50%',
    background: `radial-gradient(circle, rgba(94,106,210,0.12) 0%, transparent 70%)`,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    animation: 'auroraPulse 8s ease-in-out infinite',
    pointerEvents: 'none',
    filter: 'blur(40px)',
    zIndex: 0,
  },
  gridBg: {
    position: 'absolute',
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
    `,
    backgroundSize: '48px 48px',
    maskImage: 'radial-gradient(circle at 50% 50%, black 30%, transparent 70%)',
    WebkitMaskImage: 'radial-gradient(circle at 50% 50%, black 30%, transparent 70%)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  particle: {
    position: 'absolute',
    borderRadius: '50%',
    background: tokens.accentLight,
    pointerEvents: 'none',
    zIndex: 0,
  },
  card: {
    position: 'relative',
    width: '100%',
    maxWidth: '380px',
    padding: '40px 32px',
    background: tokens.surface,
    border: `1px solid ${tokens.border}`,
    borderRadius: '12px',
    zIndex: 2,
    transformStyle: 'preserve-3d',
  },
  cardGlow: {
    position: 'absolute',
    inset: '-1px',
    borderRadius: '13px',
    background: `linear-gradient(135deg, ${tokens.accent}20, transparent 40%, ${tokens.accentLight}10 60%, transparent)`,
    zIndex: -1,
    opacity: 0.6,
  },
  logoRow: {
    display: 'flex', justifyContent: 'center', marginBottom: '24px',
  },
  logoMark: {
    width: '48px', height: '48px', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    borderRadius: '8px', background: tokens.elevated,
    border: `1px solid ${tokens.border}`,
  },
  title: {
    fontSize: '24px', fontWeight: 510, color: tokens.textPrimary,
    textAlign: 'center', margin: '0 0 4px 0',
    letterSpacing: '-0.288px', fontFeatureSettings: "'cv01','ss03'",
  },
  subtitle: {
    fontSize: '15px', fontWeight: 400, color: tokens.textMuted,
    textAlign: 'center', margin: '0 0 28px 0', letterSpacing: '-0.165px',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: {
    fontSize: '12px', fontWeight: 510, color: tokens.textSecondary,
    letterSpacing: '0', fontFeatureSettings: "'cv01','ss03'", paddingLeft: '2px',
  },
  input: {
    padding: '10px 12px', fontSize: '14px', fontWeight: 400,
    color: tokens.textPrimary, background: tokens.elevated,
    border: `1px solid ${tokens.border}`, borderRadius: '6px',
    outline: 'none', transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
    fontFamily: 'inherit', letterSpacing: '-0.13px',
  },
  errorBox: {
    display: 'flex', alignItems: 'flex-start', gap: '8px',
    padding: '10px 12px', background: 'rgba(229,72,77,0.08)',
    border: '1px solid rgba(229,72,77,0.2)', borderRadius: '6px',
    fontSize: '13px', fontWeight: 400, color: tokens.danger, letterSpacing: '-0.13px',
  },
  button: {
    padding: '10px 16px', fontSize: '14px', fontWeight: 510,
    color: '#fff', background: tokens.accent, border: 'none',
    borderRadius: '6px', cursor: 'pointer', transition: 'background 0.15s ease',
    fontFamily: 'inherit', letterSpacing: '-0.13px',
    fontFeatureSettings: "'cv01','ss03'", marginTop: '4px',
  },
  divider: {
    display: 'flex', alignItems: 'center', gap: '12px',
    margin: '24px 0 16px 0',
  },
  dividerLine: { flex: 1, height: '1px', background: tokens.borderSubtle },
  dividerText: {
    fontSize: '12px', fontWeight: 400, color: tokens.textSubtle,
    whiteSpace: 'nowrap', letterSpacing: '0',
  },
  switchButton: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: '100%', padding: '8px 16px', fontSize: '14px', fontWeight: 400,
    color: tokens.textMuted, background: 'transparent',
    border: `1px solid ${tokens.borderSubtle}`, borderRadius: '6px',
    cursor: 'pointer', transition: 'color 0.15s ease, border-color 0.15s ease',
    fontFamily: 'inherit', letterSpacing: '-0.13px',
  },
  footer: {
    marginTop: '24px', fontSize: '12px', fontWeight: 400,
    color: tokens.textSubtle, textAlign: 'center',
    letterSpacing: '0', zIndex: 1,
  },
}
