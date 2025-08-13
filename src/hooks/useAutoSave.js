import { useEffect, useRef } from 'react'
import { useFinancialContext } from '../context/FinancialContext'
import { debouncedSaveUserState } from '../services/supabase/storage'

export const useAutoSave = (delay = 2000) => {
  const { getCurrentState, user } = useFinancialContext()
  const timeoutRef = useRef(null)

  useEffect(() => {
    const userId = user?.userId || null
    const userEmail = user?.email || null

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      const state = getCurrentState()
      debouncedSaveUserState(userId, userEmail, state)
    }, delay)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [getCurrentState, user, delay])
}