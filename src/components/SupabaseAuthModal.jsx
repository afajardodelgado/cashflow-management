import { useState, useEffect } from 'react'
import { 
  signUp, 
  signIn, 
  resetPassword,
  validateEmail, 
  validatePassword,
  resendConfirmation 
} from '../lib/supabaseAuth.js'

const SupabaseAuthModal = ({ isOpen, onClose, onAuthenticated, mode = 'login' }) => {
  const [activeTab, setActiveTab] = useState(mode)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: [] })
  const [needsVerification, setNeedsVerification] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  // Password strength checker
  useEffect(() => {
    if (formData.password) {
      const validation = validatePassword(formData.password)
      const score = Math.max(0, 4 - validation.errors.length)
      setPasswordStrength({
        score,
        feedback: validation.errors
      })
    } else {
      setPasswordStrength({ score: 0, feedback: [] })
    }
  }, [formData.password])

  const clearForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: ''
    })
    setErrors({})
    setMessage({ text: '', type: '' })
    setNeedsVerification(false)
  }

  const switchTab = (tab) => {
    setActiveTab(tab)
    clearForm()
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
    // Clear message when user types
    if (message.text) {
      setMessage({ text: '', type: '' })
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (activeTab !== 'forgot') {
      if (!formData.password) {
        newErrors.password = 'Password is required'
      }
    }

    if (activeTab === 'signup') {
      const passwordValidation = validatePassword(formData.password)
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.errors[0]
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleLogin = async () => {
    if (!validateForm()) return

    setLoading(true)
    try {
      const result = await signIn(formData.email, formData.password)
      
      if (result.success) {
        onAuthenticated({
          userId: result.user.id,
          email: result.user.email,
          session: result.session
        })
        onClose()
        clearForm()
      } else {
        setMessage({ text: result.error, type: 'error' })
      }
    } catch (error) {
      setMessage({ text: 'An unexpected error occurred', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async () => {
    if (!validateForm()) return

    setLoading(true)
    try {
      const result = await signUp(formData.email, formData.password)
      
      if (result.success) {
        if (result.needsVerification) {
          setNeedsVerification(true)
          setMessage({ 
            text: result.message, 
            type: 'success' 
          })
        } else {
          // Auto-login if no verification needed
          onAuthenticated({
            userId: result.user.id,
            email: result.user.email,
            session: result.session
          })
          onClose()
          clearForm()
        }
      } else {
        setMessage({ text: result.error, type: 'error' })
      }
    } catch (error) {
      setMessage({ text: 'An unexpected error occurred', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setErrors({ email: 'Email is required' })
      return
    }

    if (!validateEmail(formData.email)) {
      setErrors({ email: 'Please enter a valid email address' })
      return
    }

    setLoading(true)
    try {
      const result = await resetPassword(formData.email)
      
      if (result.success) {
        setMessage({ text: result.message, type: 'success' })
      } else {
        setMessage({ text: result.error, type: 'error' })
      }
    } catch (error) {
      setMessage({ text: 'An unexpected error occurred', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleResendConfirmation = async () => {
    if (resendCooldown > 0) return

    setLoading(true)
    try {
      const result = await resendConfirmation(formData.email)
      
      if (result.success) {
        setMessage({ text: result.message, type: 'success' })
        setResendCooldown(60)
      } else {
        setMessage({ text: result.error, type: 'error' })
      }
    } catch (error) {
      setMessage({ text: 'Failed to resend confirmation', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength.score <= 1) return '#dc2626' // red
    if (passwordStrength.score <= 2) return '#f59e0b' // yellow
    return '#059669' // green
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength.score <= 1) return 'Weak'
    if (passwordStrength.score <= 2) return 'Medium'
    return 'Strong'
  }

  if (!isOpen) return null

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <div className="auth-modal-header">
          <h2>
            {activeTab === 'login' && 'Welcome Back'}
            {activeTab === 'signup' && 'Create Account'}
            {activeTab === 'forgot' && 'Reset Password'}
          </h2>
          <button className="auth-modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        {/* Tab Navigation */}
        {!needsVerification && (
          <div className="auth-tabs">
            <button
              className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => switchTab('login')}
              disabled={loading}
            >
              Log In
            </button>
            <button
              className={`auth-tab ${activeTab === 'signup' ? 'active' : ''}`}
              onClick={() => switchTab('signup')}
              disabled={loading}
            >
              Sign Up
            </button>
          </div>
        )}

        <div className="auth-modal-content">
          {message.text && (
            <div className={`auth-message ${message.type}`}>
              {message.text}
            </div>
          )}

          {/* Email Verification Needed */}
          {needsVerification && (
            <div>
              <p className="auth-description">
                Please check your email and click the verification link to complete your account setup.
                Didn't receive the email?
              </p>
              
              <button
                type="button"
                className="auth-button link"
                onClick={handleResendConfirmation}
                disabled={loading || resendCooldown > 0}
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Confirmation'}
              </button>
              
              <button
                type="button"
                className="auth-button link"
                onClick={() => switchTab('login')}
                disabled={loading}
              >
                Back to Login
              </button>
            </div>
          )}

          {/* Login Form */}
          {activeTab === 'login' && !needsVerification && (
            <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
              <div className="auth-field">
                <label htmlFor="login-email">Email</label>
                <input
                  id="login-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={loading}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
                {errors.email && <span id="email-error" className="auth-error">{errors.email}</span>}
              </div>

              <div className="auth-field">
                <label htmlFor="login-password">Password</label>
                <input
                  id="login-password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  disabled={loading}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                />
                {errors.password && <span id="password-error" className="auth-error">{errors.password}</span>}
              </div>

              <button type="submit" className="auth-button primary" disabled={loading}>
                {loading ? 'Logging in...' : 'Log In'}
              </button>

              <button
                type="button"
                className="auth-button link"
                onClick={() => switchTab('forgot')}
                disabled={loading}
              >
                Forgot your password?
              </button>
            </form>
          )}

          {/* Signup Form */}
          {activeTab === 'signup' && !needsVerification && (
            <form onSubmit={(e) => { e.preventDefault(); handleSignup(); }}>
              <div className="auth-field">
                <label htmlFor="signup-email">Email</label>
                <input
                  id="signup-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={loading}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
                {errors.email && <span id="email-error" className="auth-error">{errors.email}</span>}
              </div>

              <div className="auth-field">
                <label htmlFor="signup-password">Password</label>
                <input
                  id="signup-password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  disabled={loading}
                  aria-describedby={errors.password ? 'password-error' : 'password-strength'}
                />
                {formData.password && (
                  <div id="password-strength" className="password-strength">
                    <div className="password-strength-bar">
                      <div 
                        className="password-strength-fill"
                        style={{ 
                          width: `${(passwordStrength.score / 4) * 100}%`,
                          backgroundColor: getPasswordStrengthColor()
                        }}
                      />
                    </div>
                    <span style={{ color: getPasswordStrengthColor() }}>
                      {getPasswordStrengthText()}
                    </span>
                  </div>
                )}
                {errors.password && <span id="password-error" className="auth-error">{errors.password}</span>}
              </div>

              <div className="auth-field">
                <label htmlFor="confirm-password">Confirm Password</label>
                <input
                  id="confirm-password"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  disabled={loading}
                  aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
                />
                {errors.confirmPassword && <span id="confirm-password-error" className="auth-error">{errors.confirmPassword}</span>}
              </div>

              <button type="submit" className="auth-button primary" disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          )}

          {/* Forgot Password Form */}
          {activeTab === 'forgot' && !needsVerification && (
            <form onSubmit={(e) => { e.preventDefault(); handleForgotPassword(); }}>
              <p className="auth-description">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              <div className="auth-field">
                <label htmlFor="forgot-email">Email</label>
                <input
                  id="forgot-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={loading}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
                {errors.email && <span id="email-error" className="auth-error">{errors.email}</span>}
              </div>

              <button type="submit" className="auth-button primary" disabled={loading}>
                {loading ? 'Sending Link...' : 'Send Reset Link'}
              </button>

              <button
                type="button"
                className="auth-button link"
                onClick={() => switchTab('login')}
                disabled={loading}
              >
                Back to Login
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default SupabaseAuthModal