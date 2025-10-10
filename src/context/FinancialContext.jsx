import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { loadUserState, saveUserState } from '../services/supabase/storage'

const FinancialContext = createContext()

export const useFinancialContext = () => {
  const context = useContext(FinancialContext)
  if (!context) {
    throw new Error('useFinancialContext must be used within a FinancialProvider')
  }
  return context
}

export const FinancialProvider = ({ children, user, isGuest, initialData = null, readOnly = false }) => {
  const [startingBalance, setStartingBalance] = useState(initialData?.startingBalance || 0)
  const [incomes, setIncomes] = useState(initialData?.incomes || [])
  const [creditCards, setCreditCards] = useState(initialData?.creditCards || [])
  const [recurringExpenses, setRecurringExpenses] = useState(initialData?.recurringExpenses || [])
  const [oneTimeExpenses, setOneTimeExpenses] = useState(initialData?.oneTimeExpenses || [])
  const [projectionDays, setProjectionDays] = useState(initialData?.projectionDays || 90)
  const [showTransactionDaysOnly, setShowTransactionDaysOnly] = useState(initialData?.showTransactionDaysOnly || false)
  const [activeTab, setActiveTab] = useState(initialData?.activeTab || 'inputs')
  const [chartType, setChartType] = useState(initialData?.chartType || 'line')
  const [saveStatus, setSaveStatus] = useState({ message: '', isSuccess: false, isLoading: false })
  const [isLoading, setIsLoading] = useState(!initialData)

  const getCurrentState = useCallback(() => ({
    startingBalance,
    incomes,
    creditCards,
    recurringExpenses,
    oneTimeExpenses,
    projectionDays,
    showTransactionDaysOnly,
    activeTab,
    chartType
  }), [
    startingBalance,
    incomes,
    creditCards,
    recurringExpenses,
    oneTimeExpenses,
    projectionDays,
    showTransactionDaysOnly,
    activeTab,
    chartType
  ])

  const handleManualSave = useCallback(async () => {
    const userId = user?.userId || null
    const userEmail = user?.email || null
    
    setSaveStatus({ message: 'Saving...', isSuccess: false, isLoading: true })
    
    try {
      const result = await saveUserState(userId, userEmail, getCurrentState())
      setSaveStatus({ 
        message: result.message, 
        isSuccess: result.success, 
        isLoading: false 
      })
      
      setTimeout(() => {
        setSaveStatus({ message: '', isSuccess: false, isLoading: false })
      }, 3000)
    } catch (error) {
      setSaveStatus({ 
        message: 'Save failed: Network error', 
        isSuccess: false, 
        isLoading: false 
      })
      
      setTimeout(() => {
        setSaveStatus({ message: '', isSuccess: false, isLoading: false })
      }, 3000)
    }
  }, [user, getCurrentState])

  useEffect(() => {
    // Skip loading if initialData is provided (shared view mode)
    if (initialData) {
      setIsLoading(false)
      return
    }

    const loadData = async () => {
      setIsLoading(true)
      const userId = user?.userId || null
      const userEmail = user?.email || null
      
      const loadedData = await loadUserState(userId, userEmail)
      
      if (loadedData) {
        setStartingBalance(loadedData.startingBalance || 0)
        setIncomes(loadedData.incomes || [])
        setCreditCards(loadedData.creditCards || [])
        setRecurringExpenses(loadedData.recurringExpenses || [])
        setOneTimeExpenses(loadedData.oneTimeExpenses || [])
        setProjectionDays(loadedData.projectionDays || 90)
        setShowTransactionDaysOnly(loadedData.showTransactionDaysOnly || false)
        setChartType(loadedData.chartType || 'line')
      }
      
      setIsLoading(false)
    }
    
    loadData()
  }, [user, initialData])

  const addIncome = useCallback((income) => {
    setIncomes(prev => [...prev, { ...income, id: Date.now().toString() }])
  }, [])

  const updateIncome = useCallback((id, updates) => {
    setIncomes(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item))
  }, [])

  const deleteIncome = useCallback((id) => {
    setIncomes(prev => prev.filter(item => item.id !== id))
  }, [])

  const addCreditCard = useCallback((card) => {
    setCreditCards(prev => [...prev, { ...card, id: Date.now().toString() }])
  }, [])

  const updateCreditCard = useCallback((id, updates) => {
    setCreditCards(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item))
  }, [])

  const deleteCreditCard = useCallback((id) => {
    setCreditCards(prev => prev.filter(item => item.id !== id))
  }, [])

  const addRecurringExpense = useCallback((expense) => {
    setRecurringExpenses(prev => [...prev, { ...expense, id: Date.now().toString() }])
  }, [])

  const updateRecurringExpense = useCallback((id, updates) => {
    setRecurringExpenses(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item))
  }, [])

  const deleteRecurringExpense = useCallback((id) => {
    setRecurringExpenses(prev => prev.filter(item => item.id !== id))
  }, [])

  const addOneTimeExpense = useCallback((expense) => {
    setOneTimeExpenses(prev => [...prev, { ...expense, id: Date.now().toString() }])
  }, [])

  const updateOneTimeExpense = useCallback((id, updates) => {
    setOneTimeExpenses(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item))
  }, [])

  const deleteOneTimeExpense = useCallback((id) => {
    setOneTimeExpenses(prev => prev.filter(item => item.id !== id))
  }, [])

  const resetAllData = useCallback(() => {
    setStartingBalance(0)
    setIncomes([])
    setCreditCards([])
    setRecurringExpenses([])
    setOneTimeExpenses([])
    setProjectionDays(90)
    setShowTransactionDaysOnly(false)
    setChartType('line')
  }, [])

  const value = {
    startingBalance,
    setStartingBalance,
    incomes,
    setIncomes,
    addIncome,
    updateIncome,
    deleteIncome,
    creditCards,
    setCreditCards,
    addCreditCard,
    updateCreditCard,
    deleteCreditCard,
    recurringExpenses,
    setRecurringExpenses,
    addRecurringExpense,
    updateRecurringExpense,
    deleteRecurringExpense,
    oneTimeExpenses,
    setOneTimeExpenses,
    addOneTimeExpense,
    updateOneTimeExpense,
    deleteOneTimeExpense,
    projectionDays,
    setProjectionDays,
    showTransactionDaysOnly,
    setShowTransactionDaysOnly,
    activeTab,
    setActiveTab,
    chartType,
    setChartType,
    saveStatus,
    setSaveStatus,
    isLoading,
    user,
    isGuest,
    readOnly,
    handleManualSave,
    resetAllData,
    getCurrentState
  }

  return (
    <FinancialContext.Provider value={value}>
      {children}
    </FinancialContext.Provider>
  )
}