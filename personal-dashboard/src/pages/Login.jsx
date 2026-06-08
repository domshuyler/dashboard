import { useState } from 'react'
import { supabase } from '../supabase'
import './Login.css'

function Login() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: false }
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSubmitted(true)
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-logo">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="40" height="40">
            <rect width="32" height="32" rx="6" fill="#0f0f0f"/>
            <rect x="5" y="5" width="9" height="9" rx="2" fill="#09bfbd"/>
            <rect x="18" y="5" width="9" height="9" rx="2" fill="#09bfbd" opacity="0.6"/>
            <rect x="5" y="18" width="9" height="9" rx="2" fill="#09bfbd" opacity="0.6"/>
            <rect x="18" y="18" width="9" height="9" rx="2" fill="#09bfbd" opacity="0.3"/>
          </svg>
        </div>

        {submitted ? (
          <div className="login-success">
            <div className="login-success-icon">✉</div>
            <h2>Check your email</h2>
            <p>We sent a magic link to <strong>{email}</strong>. Click it to sign in — no password needed.</p>
            <button className="login-btn-ghost" onClick={() => { setSubmitted(false); setEmail('') }}>
              Use a different email
            </button>
          </div>
        ) : (
          <>
            <h1>Dashboard</h1>
            <p className="login-subtitle">Enter your email to receive a sign-in link.</p>
            <form onSubmit={handleSubmit} className="login-form">
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
                required
              />
              {error && <div className="login-error">{error}</div>}
              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? 'Sending...' : 'Send magic link'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

export default Login
