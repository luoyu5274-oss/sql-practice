import { useState } from 'react'
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

export default function LoginPage() {
  const { register, login } = useAuth()
  const [isRegister, setIsRegister] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    const fn = isRegister ? register : login
    const result = await fn(username.trim(), password)
    if (result.status !== 'ok') {
      setError(result.message || '操作失败')
    }
    setSubmitting(false)
  }

  return (
    <div style={styles.outer}>
      {/* Subtle grid pattern background */}
      <div style={styles.gridBg} />

      <div style={styles.card}>
        {/* Logo area */}
        <div style={styles.logoRow}>
          <div style={styles.logoMark}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="6" fill={tokens.accent} />
              <path d="M8 10l6-4 6 4v8l-6 4-6-4V10z" stroke="#fff" strokeWidth="1.5"
                strokeLinejoin="round" fill="none" />
              <path d="M14 14v8" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M8 12l6 4 6-4" stroke="#fff" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
            </svg>
          </div>
        </div>

        <h1 style={styles.title}>SQL Practice</h1>
        <p style={styles.subtitle}>
          {isRegister ? 'Create your account' : 'Sign in to continue'}
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Username</label>
            <input
              style={styles.input}
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
              minLength={2}
              maxLength={20}
              autoComplete="username"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={4}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
            />
          </div>

          {error && (
            <div style={styles.errorBox}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                <circle cx="7" cy="7" r="6" stroke={tokens.danger} strokeWidth="1.5" />
                <path d="M7 4v3.5M7 10v.5" stroke={tokens.danger} strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            style={{
              ...styles.button,
              opacity: submitting ? 0.7 : 1,
              cursor: submitting ? 'wait' : 'pointer',
            }}
            disabled={submitting}
          >
            {submitting
              ? 'Loading...'
              : isRegister
                ? 'Create account'
                : 'Sign in'}
          </button>
        </form>

        <div style={styles.divider}>
          <span style={styles.dividerLine} />
          <span style={styles.dividerText}>
            {isRegister ? 'Already have an account?' : "Don't have an account?"}
          </span>
          <span style={styles.dividerLine} />
        </div>

        <button
          style={styles.switchButton}
          onClick={() => { setIsRegister(!isRegister); setError('') }}
        >
          {isRegister ? 'Sign in instead' : 'Create one'}
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
            style={{ marginLeft: 4 }}>
            <path d="M4.5 2.5l3.5 3.5-3.5 3.5" stroke="currentColor"
              strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Footer */}
      <p style={styles.footer}>
        180+ exercises · Instant validation · SQLBolt curriculum
      </p>
    </div>
  )
}

const styles = {
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
    MozOsxFontSmoothing: 'grayscale',
  },
  gridBg: {
    position: 'absolute',
    inset: 0,
    backgroundImage: `radial-gradient(circle, ${tokens.borderSubtle} 1px, transparent 1px)`,
    backgroundSize: '32px 32px',
    opacity: 0.4,
    pointerEvents: 'none',
  },
  card: {
    position: 'relative',
    width: '100%',
    maxWidth: '380px',
    padding: '40px 32px',
    background: tokens.surface,
    border: `1px solid ${tokens.border}`,
    borderRadius: '12px',
    zIndex: 1,
  },
  logoRow: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '24px',
  },
  logoMark: {
    width: '48px',
    height: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px',
    background: tokens.elevated,
    border: `1px solid ${tokens.border}`,
  },
  title: {
    fontSize: '24px',
    fontWeight: 510,
    color: tokens.textPrimary,
    textAlign: 'center',
    margin: '0 0 4px 0',
    letterSpacing: '-0.288px',
    fontFeatureSettings: "'cv01', 'ss03'",
  },
  subtitle: {
    fontSize: '15px',
    fontWeight: 400,
    color: tokens.textMuted,
    textAlign: 'center',
    margin: '0 0 28px 0',
    letterSpacing: '-0.165px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '12px',
    fontWeight: 510,
    color: tokens.textSecondary,
    letterSpacing: '0',
    fontFeatureSettings: "'cv01', 'ss03'",
    paddingLeft: '2px',
  },
  input: {
    padding: '10px 12px',
    fontSize: '14px',
    fontWeight: 400,
    color: tokens.textPrimary,
    background: tokens.elevated,
    border: `1px solid ${tokens.border}`,
    borderRadius: '6px',
    outline: 'none',
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
    fontFamily: 'inherit',
    letterSpacing: '-0.13px',
  },
  errorBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    padding: '10px 12px',
    background: 'rgba(229,72,77,0.08)',
    border: `1px solid rgba(229,72,77,0.2)`,
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 400,
    color: tokens.danger,
    letterSpacing: '-0.13px',
  },
  button: {
    padding: '10px 16px',
    fontSize: '14px',
    fontWeight: 510,
    color: '#fff',
    background: tokens.accent,
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background 0.15s ease',
    fontFamily: 'inherit',
    letterSpacing: '-0.13px',
    fontFeatureSettings: "'cv01', 'ss03'",
    marginTop: '4px',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    margin: '24px 0 16px 0',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    background: tokens.borderSubtle,
  },
  dividerText: {
    fontSize: '12px',
    fontWeight: 400,
    color: tokens.textSubtle,
    whiteSpace: 'nowrap',
    letterSpacing: '0',
  },
  switchButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: 400,
    color: tokens.textMuted,
    background: 'transparent',
    border: `1px solid ${tokens.borderSubtle}`,
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'color 0.15s ease, border-color 0.15s ease',
    fontFamily: 'inherit',
    letterSpacing: '-0.13px',
  },
  footer: {
    marginTop: '24px',
    fontSize: '12px',
    fontWeight: 400,
    color: tokens.textSubtle,
    textAlign: 'center',
    letterSpacing: '0',
    zIndex: 1,
  },
}
