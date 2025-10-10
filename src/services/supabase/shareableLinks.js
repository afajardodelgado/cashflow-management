// Shareable link service for read-only cashflow sharing
import { supabase, isSupabaseConfigured } from './client.js'

/**
 * Generate a random share token
 */
const generateShareToken = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  for (let i = 0; i < 12; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return token
}

/**
 * Create a shareable link for current cashflow data
 * @param {string|null} userId - User ID creating the link (null for guest users)
 * @param {object} data - Financial data snapshot to share
 * @param {number} expiresInDays - Optional expiration (default: 30 days)
 * @param {boolean} isGuest - Whether the user is a guest
 * @returns {Promise<{success: boolean, shareToken?: string, shareUrl?: string, error?: string}>}
 */
export const createShareableLink = async (userId, data, expiresInDays = 30, isGuest = false) => {
  try {
    if (!isSupabaseConfigured || !supabase) {
      return { 
        success: false, 
        error: 'Supabase not configured. Unable to create shareable links.' 
      }
    }

    // Generate unique token
    const shareToken = generateShareToken()
    
    // Calculate expiration date
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + expiresInDays)

    // Create snapshot of data (without sensitive info)
    const dataSnapshot = {
      startingBalance: data.startingBalance,
      incomes: data.incomes,
      creditCards: data.creditCards,
      recurringExpenses: data.recurringExpenses,
      oneTimeExpenses: data.oneTimeExpenses,
      projectionDays: data.projectionDays,
      showTransactionDaysOnly: data.showTransactionDaysOnly,
      chartType: data.chartType || 'line',
      sharedAt: new Date().toISOString()
    }

    // Insert into database
    const insertData = {
      share_token: shareToken,
      user_id: userId || null,  // Null for guest users
      data: dataSnapshot,
      expires_at: expiresAt.toISOString(),
      view_count: 0,
      created_by_guest: isGuest || !userId
    }

    const { data: insertedData, error } = await supabase
      .from('shared_cashflow_links')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('Error creating shareable link:', error)
      return { 
        success: false, 
        error: `Failed to create link: ${error.message}` 
      }
    }

    // Build shareable URL
    const baseUrl = window.location.origin
    const shareUrl = `${baseUrl}/shared/${shareToken}`

    console.log('✅ Created shareable link:', shareUrl)
    
    return { 
      success: true, 
      shareToken,
      shareUrl,
      expiresAt: expiresAt.toISOString()
    }
  } catch (error) {
    console.error('Error creating shareable link:', error)
    return { 
      success: false, 
      error: error.message 
    }
  }
}

/**
 * Get shared cashflow data by token
 * @param {string} shareToken - The share token from URL
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const getSharedData = async (shareToken) => {
  try {
    if (!isSupabaseConfigured || !supabase) {
      return { 
        success: false, 
        error: 'Unable to load shared data' 
      }
    }

    const { data, error } = await supabase
      .from('shared_cashflow_links')
      .select('*')
      .eq('share_token', shareToken)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return { 
          success: false, 
          error: 'This shared link does not exist or has been deleted' 
        }
      }
      console.error('Error fetching shared data:', error)
      return { 
        success: false, 
        error: `Failed to load: ${error.message}` 
      }
    }

    // Check if link has expired
    if (data.expires_at) {
      const expiresAt = new Date(data.expires_at)
      if (expiresAt < new Date()) {
        return { 
          success: false, 
          error: 'This shared link has expired' 
        }
      }
    }

    // Increment view count (fire and forget)
    supabase
      .from('shared_cashflow_links')
      .update({ view_count: (data.view_count || 0) + 1 })
      .eq('share_token', shareToken)
      .then(() => console.log('✅ Updated view count'))
      .catch(err => console.error('Failed to update view count:', err))

    console.log('✅ Loaded shared cashflow data')
    
    return { 
      success: true, 
      data: data.data,
      sharedAt: data.created_at,
      viewCount: data.view_count + 1
    }
  } catch (error) {
    console.error('Error getting shared data:', error)
    return { 
      success: false, 
      error: error.message 
    }
  }
}

/**
 * Get all shareable links created by a user
 * @param {string} userId - User ID
 * @returns {Promise<{success: boolean, links?: array, error?: string}>}
 */
export const getUserShareableLinks = async (userId) => {
  try {
    if (!isSupabaseConfigured || !supabase || !userId) {
      return { success: false, error: 'Not authorized' }
    }

    const { data, error } = await supabase
      .from('shared_cashflow_links')
      .select('id, share_token, created_at, expires_at, view_count')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching user links:', error)
      return { success: false, error: error.message }
    }

    return { success: true, links: data }
  } catch (error) {
    console.error('Error getting user links:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Delete a shareable link
 * @param {string} userId - User ID (for authorization)
 * @param {string} shareToken - Token to delete
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const deleteShareableLink = async (userId, shareToken) => {
  try {
    if (!isSupabaseConfigured || !supabase || !userId) {
      return { success: false, error: 'Not authorized' }
    }

    const { error } = await supabase
      .from('shared_cashflow_links')
      .delete()
      .eq('share_token', shareToken)
      .eq('user_id', userId)

    if (error) {
      console.error('Error deleting shareable link:', error)
      return { success: false, error: error.message }
    }

    console.log('✅ Deleted shareable link')
    return { success: true }
  } catch (error) {
    console.error('Error deleting shareable link:', error)
    return { success: false, error: error.message }
  }
}
