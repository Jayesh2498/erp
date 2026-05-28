import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/providers/AuthProvider'
import { SunsetGradientText } from '@/components/ui-kit'
import { tokens } from '@/components/ui-kit/tokens'
import { Loader2, Building2, Mail, Lock, ChevronRight } from 'lucide-react'

type Step = 'workspace' | 'email' | 'password'

export default function Login() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState<Step>('workspace')
  const [workspace, setWorkspace] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [companyName, setCompanyName] = useState('')

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true })
  }, [isAuthenticated, navigate])

  useEffect(() => {
    document.title = 'Login | ERP'
  }, [])

  const validateWorkspace = () => {
    setError('')
    if (!workspace.trim()) {
      setError('Please enter your workspace ID.')
      return
    }
    if (workspace.trim().toUpperCase() !== 'DEMO') {
      setError('Workspace not found. Try "DEMO".')
      return
    }
    setCompanyName('Stark Industries Pvt Ltd')
    setStep('email')
  }

  const validateEmail = () => {
    setError('')
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email.')
      return
    }
    setStep('password')
  }

  const handleLogin = async () => {
    setError('')
    setLoading(true)
    try {
      await login(workspace, email, password)
      navigate('/dashboard', { replace: true })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (step === 'workspace') validateWorkspace()
      else if (step === 'email') validateEmail()
      else handleLogin()
    }
  }

  const inputStyle: React.CSSProperties = {
    background: tokens.glass.inputBg,
    border: `1px solid ${error ? tokens.color.danger : tokens.glass.inputBorder}`,
    borderRadius: tokens.radius.sm,
    outline: 'none',
    color: tokens.color.text1,
    width: '100%',
    padding: '12px 16px 12px 44px',
    fontSize: 14,
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'rgb(var(--bg-page))' }}
    >
      {/* Background decoration */}
      <div
        style={{
          position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
          background: 'radial-gradient(ellipse at 30% 20%, rgba(255,142,83,0.08) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(255,107,107,0.06) 0%, transparent 60%)',
        }}
      />

      <div className="relative z-10 w-full max-w-sm animate-fade-in">
        {/* Brand */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-xl mb-4 text-white text-2xl font-bold"
            style={{ background: 'var(--gradient-sunset)', boxShadow: 'var(--shadow-sunset)' }}
          >
            E
          </div>
          <SunsetGradientText as="h1" className="text-2xl font-bold block">
            ERP
          </SunsetGradientText>
          <p className="text-sm mt-1" style={{ color: tokens.color.text3 }}>
            Stark Industries — Smart Business Suite
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: tokens.glass.bg,
            backdropFilter: tokens.glass.blur,
            WebkitBackdropFilter: tokens.glass.blur,
            border: `1px solid ${tokens.glass.border}`,
            borderRadius: tokens.radius.lg,
            boxShadow: tokens.shadow.lg,
            overflow: 'hidden',
            padding: '32px 28px',
          }}
        >
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            {(['workspace', 'email', 'password'] as Step[]).map((s, i) => (
              <React.Fragment key={s}>
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    background: step === s || (s === 'workspace' && step !== 'workspace') || (s === 'email' && step === 'password')
                      ? 'var(--gradient-sunset)' : tokens.glass.inputBg,
                    color: step === s || (s === 'workspace' && step !== 'workspace') || (s === 'email' && step === 'password')
                      ? 'white' : tokens.color.text3,
                    border: `1px solid ${tokens.glass.border}`,
                    boxShadow: step === s ? tokens.shadow.sunset : 'none',
                  }}
                >
                  {i + 1}
                </div>
                {i < 2 && (
                  <div style={{ flex: 1, height: 1, background: tokens.glass.border }} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Step content */}
          {step === 'workspace' && (
            <div className="animate-fade-in">
              <h2 className="text-base font-semibold mb-1" style={{ color: tokens.color.text1 }}>
                Enter your workspace
              </h2>
              <p className="text-xs mb-5" style={{ color: tokens.color.text3 }}>
                Hint: try <strong>DEMO</strong>
              </p>
              <div className="relative">
                <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: tokens.color.text3 }} />
                <input
                  autoFocus
                  type="text"
                  placeholder="Workspace ID"
                  value={workspace}
                  onChange={e => setWorkspace(e.target.value)}
                  onKeyDown={handleKeyDown}
                  style={inputStyle}
                  onFocus={e => { e.currentTarget.style.borderColor = tokens.glass.inputFocusBorder; e.currentTarget.style.boxShadow = `0 0 0 3px ${tokens.glass.inputFocusShadow}` }}
                  onBlur={e => { e.currentTarget.style.borderColor = tokens.glass.inputBorder; e.currentTarget.style.boxShadow = '' }}
                />
              </div>
            </div>
          )}

          {step === 'email' && (
            <div className="animate-fade-in">
              <h2 className="text-base font-semibold mb-1" style={{ color: tokens.color.text1 }}>
                {companyName}
              </h2>
              <p className="text-xs mb-5" style={{ color: tokens.color.text3 }}>
                Try admin@demo.com / manager@demo.com / staff@demo.com
              </p>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: tokens.color.text3 }} />
                <input
                  autoFocus
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                  style={inputStyle}
                  onFocus={e => { e.currentTarget.style.borderColor = tokens.glass.inputFocusBorder; e.currentTarget.style.boxShadow = `0 0 0 3px ${tokens.glass.inputFocusShadow}` }}
                  onBlur={e => { e.currentTarget.style.borderColor = tokens.glass.inputBorder; e.currentTarget.style.boxShadow = '' }}
                />
              </div>
            </div>
          )}

          {step === 'password' && (
            <div className="animate-fade-in">
              <h2 className="text-base font-semibold mb-1" style={{ color: tokens.color.text1 }}>
                Welcome back
              </h2>
              <p className="text-xs mb-5" style={{ color: tokens.color.text3 }}>
                {email} · <button onClick={() => setStep('email')} style={{ color: tokens.color.sunsetOrange, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 'inherit' }}>Change</button>
              </p>
              <p className="text-xs mb-3" style={{ color: tokens.color.text3 }}>
                Password: <strong>demo1234</strong>
              </p>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: tokens.color.text3 }} />
                <input
                  autoFocus
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  style={inputStyle}
                  onFocus={e => { e.currentTarget.style.borderColor = tokens.glass.inputFocusBorder; e.currentTarget.style.boxShadow = `0 0 0 3px ${tokens.glass.inputFocusShadow}` }}
                  onBlur={e => { e.currentTarget.style.borderColor = tokens.glass.inputBorder; e.currentTarget.style.boxShadow = '' }}
                />
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="text-xs font-medium mt-3 animate-fade-in" style={{ color: tokens.color.danger }}>
              {error}
            </p>
          )}

          {/* CTA button */}
          <button
            type="button"
            disabled={loading}
            className="mt-5 w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-white rounded-pill transition-all duration-150"
            style={{
              background: 'var(--gradient-sunset)',
              boxShadow: tokens.shadow.sunset,
              opacity: loading ? 0.8 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
            onClick={step === 'workspace' ? validateWorkspace : step === 'email' ? validateEmail : handleLogin}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.boxShadow = tokens.button.primaryHoverShadow }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = tokens.shadow.sunset }}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            {step === 'password' ? 'Sign In' : 'Continue'}
            {!loading && <ChevronRight size={16} />}
          </button>

          {step !== 'workspace' && (
            <button
              type="button"
              className="mt-3 w-full text-xs py-2 font-medium transition-colors"
              style={{ color: tokens.color.text3, background: 'none', border: 'none', cursor: 'pointer' }}
              onClick={() => { setStep('workspace'); setError(''); setEmail(''); setPassword('') }}
              onMouseEnter={e => { e.currentTarget.style.color = tokens.color.text2 }}
              onMouseLeave={e => { e.currentTarget.style.color = tokens.color.text3 }}
            >
              ← Back to workspace
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
