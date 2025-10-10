import { normalizeDate, getEpochDay } from './format.js'

export const getLastBusinessDay = (year, month) => {
  let lastDay = new Date(year, month + 1, 0) // Last day of month
  while (lastDay.getDay() === 0 || lastDay.getDay() === 6) {
    lastDay.setDate(lastDay.getDate() - 1) // Move to previous day if weekend
  }
  return lastDay
}

export const isPaymentDue = (currentDate, startDate, frequency) => {
  if (!startDate) return false
  
  const start = normalizeDate(startDate)
  const current = normalizeDate(currentDate)
  
  // Return false if dates are invalid
  if (!start || !current) return false
  
  // If current date is before start date, no payment is due
  if (current < start) return false
  
  // Calculate days difference
  const daysDiff = Math.floor((current - start) / (1000 * 60 * 60 * 24))
  
  switch (frequency) {
    case 'weekly':
      return daysDiff >= 0 && daysDiff % 7 === 0
    case 'bi-weekly':
      return daysDiff >= 0 && daysDiff % 14 === 0
    case 'monthly':
      // For monthly, check if it's the same day of month as start date
      // Handle month-end cases properly
      const startDay = start.getDate()
      const currentDay = current.getDate()
      const currentMonth = current.getMonth()
      const currentYear = current.getFullYear()
      
      // Get the last day of current month
      const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
      
      // If start date is beyond current month's days, use last day of month
      const targetDay = Math.min(startDay, lastDayOfMonth)
      
      return currentDay === targetDay && 
             (current.getFullYear() > start.getFullYear() || 
              current.getMonth() > start.getMonth() ||
              (current.getMonth() === start.getMonth() && current.getFullYear() === start.getFullYear()))
    case '15th-and-last':
      // Special case for 15th and last business day of month
      const currentMonth15th = current.getMonth()
      const currentYear15th = current.getFullYear()
      const currentDay15th = current.getDate()
      
      // If start date is after the 15th, wait until 15th of next month
      if (start.getDate() > 15 && current.getMonth() === start.getMonth() && current.getFullYear() === start.getFullYear()) {
        return false
      }
      
      // Check if current date is 15th of any month after start month
      if (currentDay15th === 15 && current >= start) {
        return true
      }
      
      // Check if current date is last business day of month
      const lastBusinessDay = getLastBusinessDay(currentYear15th, currentMonth15th)
      if (current.toDateString() === lastBusinessDay.toDateString() && current >= start) {
        return true
      }
      
      return false
    case 'one-time':
      // Trigger only on the exact date; does not recur
      return getEpochDay(current) === getEpochDay(start)
    default:
      return false
  }
}

export const calculateCashflow = (startingBalance, incomes, creditCards, recurringExpenses, oneTimeExpenses, days = 30) => {
  const today = new Date()
  const cashflowData = []
  
  // Process each day sequentially
  for (let i = 0; i < days; i++) {
    const currentDate = new Date(today)
    currentDate.setDate(today.getDate() + i)
    // Normalize to midnight for consistent date comparison
    currentDate.setHours(0, 0, 0, 0)
    
    let dailyIncome = 0
    let dailyExpenses = 0
    
    // Calculate income for this date (only active items)
    incomes.forEach(income => {
      // Skip if inactive
      if (income.isActive === false) return
      
      if (income.nextPayDate && income.amount && income.frequency) {
        if (isPaymentDue(currentDate, income.nextPayDate, income.frequency)) {
          dailyIncome += income.amount
        }
      }
    })
    
    // Calculate recurring expenses for this date (only active items)
    recurringExpenses.forEach(expense => {
      // Skip if inactive
      if (expense.isActive === false) return
      
      if (expense.nextDueDate && expense.amount && expense.frequency) {
        if (isPaymentDue(currentDate, expense.nextDueDate, expense.frequency)) {
          dailyExpenses += expense.amount
        }
      }
    })
    
    // Calculate credit card payments (only active items)
    creditCards.forEach(card => {
      // Skip if inactive
      if (card.isActive === false) return
      
      if (card.balance && (card.dueDate || card.payDate)) {
        const paymentDate = normalizeDate(card.payDate || card.dueDate)
        if (paymentDate && getEpochDay(currentDate) === getEpochDay(paymentDate)) {
          dailyExpenses += card.balance
        }
      }
    })
    
    // Calculate one-time expenses (only active items)
    oneTimeExpenses.forEach(expense => {
      // Skip if inactive
      if (expense.isActive === false) return
      
      if (expense.date && expense.amount) {
        const expenseDate = normalizeDate(expense.date)
        if (expenseDate && getEpochDay(currentDate) === getEpochDay(expenseDate)) {
          dailyExpenses += expense.amount
        }
      }
    })
    
    // Calculate net change and running balance
    const netChange = dailyIncome - dailyExpenses
    const runningBalance = i === 0 ? 
      startingBalance + netChange : 
      cashflowData[i-1].runningBalance + netChange
    
    cashflowData.push({
      date: new Date(currentDate),
      income: dailyIncome,
      expenses: dailyExpenses,
      netChange,
      runningBalance
    })
  }
  
  return cashflowData
}