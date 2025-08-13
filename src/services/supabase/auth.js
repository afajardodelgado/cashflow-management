// Supabase Authentication - replaces custom auth system
import { supabase } from './supabase.js'

// Sign up with email and password
export const signUp = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    })

    if (error) {
      return { 
        success: false, 
        error: error.message,
        needsVerification: false
      }
    }

    // Check if user needs email verification
    if (data?.user && !data.session) {
      return {
        success: true,
        user: data.user,
        needsVerification: true,
        message: 'Please check your email and click the verification link to complete signup.'
      }
    }

    return {
      success: true,
      user: data.user,
      session: data.session,
      needsVerification: false
    }
  } catch (error) {
    return { 
      success: false, 
      error: 'Network error. Please try again.',
      needsVerification: false
    }
  }
}

// Sign in with email and password
export const signIn = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      return { 
        success: false, 
        error: error.message 
      }
    }

    return {
      success: true,
      user: data.user,
      session: data.session
    }
  } catch (error) {
    return { 
      success: false, 
      error: 'Network error. Please try again.' 
    }
  }
}

// Sign out
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: 'Network error. Please try again.' }
  }
}

// Reset password
export const resetPassword = async (email) => {
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return {
      success: true,
      message: 'Password reset email sent. Please check your inbox.'
    }
  } catch (error) {
    return { success: false, error: 'Network error. Please try again.' }
  }
}

// Update password (after reset)
export const updatePassword = async (newPassword) => {
  try {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return {
      success: true,
      message: 'Password updated successfully!'
    }
  } catch (error) {
    return { success: false, error: 'Network error. Please try again.' }
  }
}

// Get current session
export const getCurrentSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Error getting session:', error)
      return null
    }

    return session
  } catch (error) {
    console.error('Error getting session:', error)
    return null
  }
}

// Get current user
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('Error getting user:', error)
      return null
    }

    return user
  } catch (error) {
    console.error('Error getting user:', error)
    return null
  }
}

// Listen to auth state changes
export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session)
  })
}

// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Password validation
export const validatePassword = (password) => {
  const errors = []
  
  if (password.length < 6) {
    errors.push('Password must be at least 6 characters long')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Resend confirmation email
export const resendConfirmation = async (email) => {
  try {
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email: email
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return {
      success: true,
      message: 'Confirmation email sent! Please check your inbox.'
    }
  } catch (error) {
    return { success: false, error: 'Network error. Please try again.' }
  }
}