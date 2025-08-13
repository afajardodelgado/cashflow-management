import { useMemo } from 'react'
import { useFinancialContext } from '../context/FinancialContext'
import { calculateCashflow } from '../services/calculations/cashflow'
import { formatShortDate } from '../lib/format'

export const useCashflowCalculations = () => {
  const {
    startingBalance,
    incomes,
    creditCards,
    recurringExpenses,
    oneTimeExpenses,
    projectionDays,
    showTransactionDaysOnly
  } = useFinancialContext()

  const cashflowData = useMemo(() => {
    return calculateCashflow(startingBalance, incomes, creditCards, recurringExpenses, oneTimeExpenses, projectionDays)
  }, [startingBalance, incomes, creditCards, recurringExpenses, oneTimeExpenses, projectionDays])

  const chartData = useMemo(() => {
    let filteredData = cashflowData
    
    if (showTransactionDaysOnly) {
      filteredData = cashflowData.filter(day => day.income > 0 || day.expenses > 0)
    }
    
    return filteredData.map((day, index) => ({
      day: index + 1,
      date: day.date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' }),
      shortDate: formatShortDate(day.date),
      balance: day.runningBalance,
      income: day.income,
      expenses: -day.expenses,
      netChange: day.netChange
    }))
  }, [cashflowData, showTransactionDaysOnly])

  const filteredCashflowData = useMemo(() => {
    if (showTransactionDaysOnly) {
      return cashflowData.filter(day => day.income > 0 || day.expenses > 0)
    }
    return cashflowData
  }, [cashflowData, showTransactionDaysOnly])

  const estimatedBalance = useMemo(() => {
    if (cashflowData.length === 0) {
      return {
        balance: startingBalance,
        date: new Date()
      }
    }
    
    const finalDay = cashflowData[cashflowData.length - 1]
    return {
      balance: finalDay.runningBalance,
      date: finalDay.date
    }
  }, [cashflowData, startingBalance])

  return {
    cashflowData,
    chartData,
    filteredCashflowData,
    estimatedBalance
  }
}