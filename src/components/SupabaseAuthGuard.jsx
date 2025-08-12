import { useState, useEffect } from 'react'
import { getCurrentSession, getCurrentUser, onAuthStateChange, signOut } from '../lib/supabaseAuth.js'
import { migrateGuestDataToUser } from '../lib/supabaseStorage.js'
import { loadState as loadGuestState } from '../lib/storage.js'
import SupabaseAuthModal from './SupabaseAuthModal.jsx'

const SupabaseAuthGuard = ({ children }) => {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [isGuest, setIsGuest] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState('login')

  // Initialize auth state
  useEffect(() => {
    initializeAuth()
    
    // Listen to auth state changes
    const { data: { subscription } } = onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event, session)
      
      if (event === 'SIGNED_IN' && session) {
        const user = session.user
        setUser({
          userId: user.id,
          email: user.email,
          emailConfirmed: user.email_confirmed_at !== null
        })
        setSession(session)
        setIsGuest(false)
        setShowAuthModal(false)
        
        // Migrate guest data if available
        await handleDataMigration(user.id, user.email)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setSession(null)
        setIsGuest(true)
      }
      
      setLoading(false)
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const initializeAuth = async () => {
    try {
      const session = await getCurrentSession()
      
      if (session?.user) {
        const user = session.user
        setUser({
          userId: user.id,
          email: user.email,
          emailConfirmed: user.email_confirmed_at !== null
        })
        setSession(session)
        setIsGuest(false)
      } else {
        setIsGuest(true)
      }
    } catch (error) {
      console.error('Error initializing auth:', error)
      setIsGuest(true)
    } finally {
      setLoading(false)
    }
  }

  const handleDataMigration = async (userId, userEmail) => {
    try {
      // Check if user has guest data to migrate
      const guestData = loadGuestState()
      if (guestData && Object.keys(guestData).length > 0) {
        console.log('🔄 Migrating guest data to user account...')
        const success = await migrateGuestDataToUser(userId, userEmail, guestData)
        if (success) {
          console.log('✅ Guest data migration completed')
        }
      }
    } catch (error) {
      console.error('Error during data migration:', error)
    }
  }

  const handleAuthenticated = (userData) => {
    setUser(userData)
    setShowAuthModal(false)
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      // Auth state change will be handled by the listener
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const openAuthModal = (mode = 'login') => {
    setAuthMode(mode)
    setShowAuthModal(true)
  }

  if (loading) {
    return (
      <div className="auth-loading">
        <div className="auth-loading-content">
          <div className="auth-loading-spinner"></div>
          <h2>Loading...</h2>
          <p>Checking authentication status</p>
        </div>
      </div>
    )
  }

  // Render based on auth state
  if (isGuest) {
    return (
      <>
        {/* Guest Status Bar */}
        <div className="auth-status-bar">
          <div className="auth-status-content">
            <div className="auth-status-user">
              <span className="auth-status-icon">👤</span>
              <span>Guest Mode</span>
              <span className="auth-status-badge guest">Data saved locally</span>
            </div>
            <div className="auth-status-actions">
              <button 
                className="auth-status-button"
                onClick={() => openAuthModal('login')}
              >
                Log In
              </button>
              <button 
                className="auth-status-button primary"
                onClick={() => openAuthModal('signup')}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>

        {/* Main App Content */}
        <div className="auth-app-content with-status-bar">
          {children({ user: null, isGuest: true })}
        </div>

        {/* Auth Modal */}
        <SupabaseAuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onAuthenticated={handleAuthenticated}
          mode={authMode}
        />
      </>
    )
  }

  // Authenticated user
  return (
    <>
      {/* Authenticated Status Bar */}
      <div className="auth-status-bar">
        <div className="auth-status-content">
          <div className="auth-status-user">
            <span className="auth-status-icon">👤</span>
            <span>{user.email}</span>
            <span className="auth-status-badge">
              {user.emailConfirmed ? 'Verified' : 'Unverified'}
            </span>
          </div>
          <div className="auth-status-actions">
            <button 
              className="auth-status-button"
              onClick={handleSignOut}
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main App Content */}
      <div className="auth-app-content with-status-bar">
        {children({ user, isGuest: false })}
      </div>
    </>
  )
}

export default SupabaseAuthGuard