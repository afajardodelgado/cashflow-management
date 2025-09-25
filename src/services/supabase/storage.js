// Supabase storage for user cashflow data - replaces localStorage
import { supabase, isSupabaseConfigured } from './client.js'
import { loadState as loadGuestState, saveState as saveGuestState } from '../../lib/storage.js'

// Debounced save functionality
const debouncedSaves = new Map()

// Load user-specific state from Supabase
export const loadUserState = async (userId, userEmail) => {
  try {
    if (!userId || !isSupabaseConfigured || !supabase) {
      // Guest mode - use existing localStorage
      return loadGuestState()
    }
    
    const { data, error } = await supabase
      .from('user_cashflow_data')
      .select('data')
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116' || error.code === 'PGRST301') {
        // Table doesn't exist or no data found - return default state
        console.log('No user data found, starting fresh')
        return null
      }
      console.error('Error loading user state from Supabase:', error)
      return null
    }

    if (data?.data) {
      console.log('✅ Loaded user data from Supabase')
      return data.data
    }
    
    return null
  } catch (error) {
    console.error('Error loading user state:', error)
    // Fallback to localStorage if Supabase fails
    return loadGuestState()
  }
}

// Save user-specific state to Supabase
export const saveUserState = async (userId, userEmail, state) => {
  try {
    if (!userId || !isSupabaseConfigured || !supabase) {
      // Guest mode - use existing localStorage
      saveGuestState(state)
      return { success: true, message: 'Saved locally (guest mode or no Supabase)' }
    }

    const dataToSave = {
      version: 1,
      startingBalance: state.startingBalance,
      incomes: state.incomes,
      creditCards: state.creditCards,
      recurringExpenses: state.recurringExpenses,
      oneTimeExpenses: state.oneTimeExpenses,
      projectionDays: state.projectionDays,
      showTransactionDaysOnly: state.showTransactionDaysOnly,
      activeTab: state.activeTab,
      chartType: state.chartType,
      lastSaved: Date.now()
    }

    // Use upsert with user_id (now that we have proper RLS policies)
    const { data, error } = await supabase
      .from('user_cashflow_data')
      .upsert({
        user_id: userId,
        user_email: userEmail, // Keep for reference
        data: dataToSave
      }, {
        onConflict: 'user_id'
      })

    if (error) {
      console.error('Error saving to Supabase:', error)
      // Fallback to localStorage
      saveGuestState(state)
      return { success: false, message: `Save failed: ${error.message}` }
    }

    console.log('✅ Saved user data to Supabase')
    return { success: true, message: 'Saved to cloud database' }
  } catch (error) {
    console.error('Error saving user state:', error)
    // Fallback to localStorage
    saveGuestState(state)
    return { success: false, message: `Save failed: ${error.message}` }
  }
}

// Debounced save to prevent excessive API calls
export const debouncedSaveUserState = (userId, userEmail, state, delay = 1000) => {
  const key = userEmail || 'guest'
  
  // Clear existing timeout
  if (debouncedSaves.has(key)) {
    clearTimeout(debouncedSaves.get(key))
  }
  
  // Set new timeout
  const timeoutId = setTimeout(() => {
    saveUserState(userId, userEmail, state)
    debouncedSaves.delete(key)
  }, delay)
  
  debouncedSaves.set(key, timeoutId)
}

// Migrate data from localStorage to Supabase when user signs up
export const migrateGuestDataToUser = async (userId, userEmail, guestData) => {
  try {
    if (!guestData || !userId) return false
    
    console.log('🔄 Migrating guest data to user account...')
    
    const result = await saveUserState(userId, userEmail, guestData)
    
    if (result.success) {
      console.log('✅ Successfully migrated guest data to user account')
      // Clear guest data from localStorage after successful migration
      localStorage.removeItem('cashflowData')
      return true
    }
    
    return false
  } catch (error) {
    console.error('Error migrating guest data:', error)
    return false
  }
}

// Check if user has existing data in Supabase
export const userHasExistingData = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_cashflow_data')
      .select('id')
      .eq('user_id', userId)
      .single()

    return !error && !!data
  } catch (error) {
    return false
  }
}