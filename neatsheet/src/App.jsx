import { useState } from 'react'
import { NavLink, Route, Routes } from 'react-router-dom'
import { db } from './lib/instantdb'
import FraudDashboardPage from './pages/FraudDashboardPage'
import HomePage from './pages/HomePage'
import StatementsPage from './pages/StatementsPage'
import UploadPage from './pages/UploadPage'

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/upload', label: 'Upload Data' },
  { to: '/statements', label: 'Financial Statements' },
  { to: '/fraud-scanner', label: 'Fraud Scanner Dashboard' },
]

function AuthScreen() {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState('email')
  const [message, setMessage] = useState('')
  const [errorText, setErrorText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function sendCode() {
    setErrorText('')
    setMessage('')
    setIsSubmitting(true)
    try {
      await db.auth.sendMagicCode({ email: email.trim() })
      setStep('code')
      setMessage('Verification code sent. Check your email.')
    } catch (error) {
      setErrorText(error?.body?.message || error?.message || 'Unable to send verification code.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function verifyCode() {
    setErrorText('')
    setMessage('')
    setIsSubmitting(true)
    try {
      await db.auth.signInWithMagicCode({ email: email.trim(), code: code.trim() })
      setMessage('Signed in successfully.')
    } catch (error) {
      setErrorText(error?.body?.message || error?.message || 'Invalid verification code.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-emerald-50 px-4 py-12">
      <div className="mx-auto max-w-md rounded-xl bg-white p-6 shadow-sm ring-1 ring-emerald-200">
        <h1 className="text-2xl font-bold text-emerald-950">Sign in to Auditmatic</h1>
        <p className="mt-2 text-sm text-emerald-800">
          Enter your email to receive a one-time verification code.
        </p>
        <div className="mt-4 space-y-3">
          <label className="block text-sm font-medium text-emerald-900">
            Email
            <input
              type="email"
              className="mt-1 w-full rounded-md border border-emerald-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              placeholder="you@company.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={step === 'code'}
            />
          </label>

          {step === 'code' && (
            <label className="block text-sm font-medium text-emerald-900">
              Verification code
              <input
                type="text"
                className="mt-1 w-full rounded-md border border-emerald-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                placeholder="6-digit code"
                value={code}
                onChange={(event) => setCode(event.target.value)}
              />
            </label>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {step === 'email' ? (
            <button
              type="button"
              onClick={sendCode}
              disabled={!email.trim() || isSubmitting}
              className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Sending...' : 'Send verification code'}
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={verifyCode}
                disabled={!code.trim() || isSubmitting}
                className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? 'Verifying...' : 'Sign in'}
              </button>
              <button
                type="button"
                onClick={sendCode}
                disabled={isSubmitting}
                className="rounded-md bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-800 hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Resend code
              </button>
            </>
          )}
        </div>

        {message && <p className="mt-3 text-sm text-emerald-700">{message}</p>}
        {errorText && <p className="mt-3 text-sm text-rose-700">{errorText}</p>}
      </div>
    </main>
  )
}

function App() {
  const auth = db.useAuth()

  if (auth.isLoading) {
    return (
      <main className="min-h-screen bg-emerald-50 px-4 py-12">
        <div className="mx-auto max-w-md rounded-xl bg-white p-6 text-sm text-emerald-800 shadow-sm ring-1 ring-emerald-200">
          Loading authentication...
        </div>
      </main>
    )
  }

  if (auth.error) {
    return (
      <main className="min-h-screen bg-emerald-50 px-4 py-12">
        <div className="mx-auto max-w-md rounded-xl bg-white p-6 text-sm text-rose-700 shadow-sm ring-1 ring-rose-200">
          Authentication error: {auth.error.message}
        </div>
      </main>
    )
  }

  if (!auth.user) {
    return <AuthScreen />
  }

  return (
    <main className="min-h-screen bg-emerald-50 px-4 py-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-emerald-200">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-xl font-bold text-emerald-950">Auditmatic</h1>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <nav className="flex flex-wrap gap-2">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `rounded-md px-3 py-2 text-sm font-medium ${
                        isActive
                          ? 'bg-emerald-700 text-white'
                          : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800">
                  {auth.user.email}
                </span>
                <button
                  type="button"
                  onClick={() => db.auth.signOut()}
                  className="rounded-md bg-emerald-200 px-3 py-2 text-sm font-medium text-emerald-900 hover:bg-emerald-300"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </header>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/upload" element={<UploadPage userEmail={auth.user.email} />} />
          <Route path="/statements" element={<StatementsPage />} />
          <Route path="/fraud-scanner" element={<FraudDashboardPage />} />
        </Routes>
      </div>
    </main>
  )
}

export default App
