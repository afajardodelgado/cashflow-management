export const loadState = () => {
  try {
    // First check localStorage (preferred)
    const localData = localStorage.getItem('cashflowData')
    if (localData) {
      const data = JSON.parse(localData)
      
      // Check if migration is needed
      const version = data.version || 0 // Default to 0 for legacy data
      if (version < CURRENT_VERSION) {
        const migratedData = migrateState(data, version)
        migratedData.version = CURRENT_VERSION
        // Save migrated data
        localStorage.setItem('cashflowData', JSON.stringify(migratedData))
        return migratedData
      }
      
      return data
    }
    
    // Fallback to sessionStorage for migration
    const sessionData = sessionStorage.getItem('cashflowData')
    if (sessionData) {
      const data = JSON.parse(sessionData)
      
      // Migrate sessionStorage data to localStorage with version
      const versionedData = {
        ...data,
        version: CURRENT_VERSION
      }
      
      localStorage.setItem('cashflowData', JSON.stringify(versionedData))
      // Clear old sessionStorage
      sessionStorage.removeItem('cashflowData')
      return versionedData
    }
    
    return null
  } catch (error) {
    console.error('Error loading state:', error)
    return null
  }
}

const CURRENT_VERSION = 1

const migrateState = (data, fromVersion) => {
  let migratedData = { ...data }
  
  // Future migrations can be added here
  // Example: if (fromVersion < 2) { /* migration logic */ }
  
  return migratedData
}

export const saveState = (state) => {
  try {
    const dataToSave = {
      version: CURRENT_VERSION,
      startingBalance: state.startingBalance,
      incomes: state.incomes,
      creditCards: state.creditCards,
      recurringExpenses: state.recurringExpenses,
      oneTimeExpenses: state.oneTimeExpenses,
      projectionDays: state.projectionDays,
      showTransactionDaysOnly: state.showTransactionDaysOnly,
      activeTab: state.activeTab,
      chartType: state.chartType
    }
    
    localStorage.setItem('cashflowData', JSON.stringify(dataToSave))
  } catch (error) {
    console.error('Error saving state:', error)
  }
}

// Debounced save state to avoid excessive writes
let debounceTimeout = null
export const debouncedSaveState = (state, delay = 300) => {
  if (debounceTimeout) {
    clearTimeout(debounceTimeout)
  }
  
  debounceTimeout = setTimeout(() => {
    saveState(state)
    debounceTimeout = null
  }, delay)
}