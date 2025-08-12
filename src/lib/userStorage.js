// User-specific storage extending the existing storage system
import { loadState as loadGuestState, saveState as saveGuestState } from './storage.js'

// Storage keys
const GUEST_STORAGE_KEY = 'cashflowData'
const getUserStorageKey = (userId) => `cashflowData_${userId}`

// Load user-specific state
export const loadUserState = (userId) => {
  try {
    if (!userId) {
      // Guest mode - use existing storage
      return loadGuestState()
    }
    
    const userKey = getUserStorageKey(userId)
    const userData = localStorage.getItem(userKey)
    
    if (userData) {
      const data = JSON.parse(userData)
      
      // Check if migration is needed (same as existing storage)
      const CURRENT_VERSION = 1
      const version = data.version || 0
      if (version < CURRENT_VERSION) {
        const migratedData = migrateUserState(data, version)
        migratedData.version = CURRENT_VERSION
        localStorage.setItem(userKey, JSON.stringify(migratedData))
        return migratedData
      }
      
      return data
    }
    
    // No user data found, return default state
    return null
  } catch (error) {
    console.error('Error loading user state:', error)
    return null
  }
}

// Save user-specific state
export const saveUserState = (userId, state) => {
  try {
    if (!userId) {
      // Guest mode - use existing storage
      return saveGuestState(state)
    }
    
    const userKey = getUserStorageKey(userId)
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
    
    localStorage.setItem(userKey, JSON.stringify(dataToSave))
    return true
  } catch (error) {
    console.error('Error saving user state:', error)
    return false
  }
}

// Migrate guest data to authenticated user
export const migrateGuestDataToUser = (userId) => {
  try {
    // Load existing guest data
    const guestData = loadGuestState()
    
    if (guestData && hasNonEmptyData(guestData)) {
      // Save guest data to user storage
      const success = saveUserState(userId, guestData)
      
      if (success) {
        // Clear guest data after successful migration
        localStorage.removeItem(GUEST_STORAGE_KEY)
        return { success: true, migrated: true }
      }
    }
    
    return { success: true, migrated: false }
  } catch (error) {
    console.error('Error migrating guest data:', error)
    return { success: false, error: 'Failed to migrate data' }
  }
}

// Check if data contains meaningful information (not just defaults)
const hasNonEmptyData = (data) => {
  if (!data) return false
  
  return (
    (data.startingBalance && data.startingBalance !== 0) ||
    (data.incomes && data.incomes.length > 0) ||
    (data.creditCards && data.creditCards.length > 0) ||
    (data.recurringExpenses && data.recurringExpenses.length > 0) ||
    (data.oneTimeExpenses && data.oneTimeExpenses.length > 0)
  )
}

// Migrate user state between versions
const migrateUserState = (data, fromVersion) => {
  let migratedData = { ...data }
  
  // Future migrations can be added here
  // Example: if (fromVersion < 2) { /* migration logic */ }
  
  return migratedData
}

// Debounced save for user storage
let debounceTimeout = null
export const debouncedSaveUserState = (userId, state, delay = 300) => {
  if (debounceTimeout) {
    clearTimeout(debounceTimeout)
  }
  
  debounceTimeout = setTimeout(() => {
    saveUserState(userId, state)
    debounceTimeout = null
  }, delay)
}

// Get all user data (for export)
export const exportUserData = (userId) => {
  try {
    const userData = loadUserState(userId)
    if (!userData) {
      return { success: false, error: 'No data found' }
    }
    
    return {
      success: true,
      data: {
        ...userData,
        exportedAt: new Date().toISOString(),
        userId: userId // Include user ID for reference
      }
    }
  } catch (error) {
    console.error('Error exporting user data:', error)
    return { success: false, error: 'Failed to export data' }
  }
}

// Import user data
export const importUserData = (userId, importedData) => {
  try {
    // Validate imported data structure
    if (!importedData || typeof importedData !== 'object') {
      return { success: false, error: 'Invalid data format' }
    }
    
    // Extract cashflow data (excluding metadata)
    const {
      exportedAt,
      userId: importedUserId,
      version,
      lastSaved,
      ...cashflowData
    } = importedData
    
    // Save the imported data
    const success = saveUserState(userId, cashflowData)
    
    if (success) {
      return { success: true }
    } else {
      return { success: false, error: 'Failed to save imported data' }
    }
  } catch (error) {
    console.error('Error importing user data:', error)
    return { success: false, error: 'Failed to import data' }
  }
}

// Delete user data
export const deleteUserData = (userId) => {
  try {
    const userKey = getUserStorageKey(userId)
    localStorage.removeItem(userKey)
    return { success: true }
  } catch (error) {
    console.error('Error deleting user data:', error)
    return { success: false, error: 'Failed to delete data' }
  }
}

// Get data synchronization status
export const getSyncStatus = (userId) => {
  try {
    const userData = loadUserState(userId)
    
    if (!userData) {
      return {
        lastSaved: null,
        hasUnsavedChanges: false,
        dataExists: false
      }
    }
    
    return {
      lastSaved: userData.lastSaved || null,
      hasUnsavedChanges: false, // This would be managed by the component
      dataExists: true
    }
  } catch (error) {
    console.error('Error getting sync status:', error)
    return {
      lastSaved: null,
      hasUnsavedChanges: false,
      dataExists: false
    }
  }
}

// List all user storage keys (for cleanup/debugging)
export const listUserStorageKeys = () => {
  const keys = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith('cashflowData_')) {
      keys.push(key)
    }
  }
  return keys
}

// Storage size calculation
export const getStorageSize = (userId = null) => {
  try {
    let totalSize = 0
    
    if (userId) {
      // Get size for specific user
      const userKey = getUserStorageKey(userId)
      const data = localStorage.getItem(userKey)
      totalSize = data ? new Blob([data]).size : 0
    } else {
      // Get total size for all cashflow data
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && (key === GUEST_STORAGE_KEY || key.startsWith('cashflowData_'))) {
          const data = localStorage.getItem(key)
          if (data) {
            totalSize += new Blob([data]).size
          }
        }
      }
    }
    
    return {
      bytes: totalSize,
      kilobytes: (totalSize / 1024).toFixed(2),
      megabytes: (totalSize / (1024 * 1024)).toFixed(2)
    }
  } catch (error) {
    console.error('Error calculating storage size:', error)
    return { bytes: 0, kilobytes: '0.00', megabytes: '0.00' }
  }
}