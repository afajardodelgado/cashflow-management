import { normalizeDate } from './format.js'

export const getFlowBreakdownData = (incomes, recurringExpenses, creditCards, oneTimeExpenses, projectionDays) => {
  // Calculate totals for the selected period
  const incomeBySource = {}
  const expensesByCategory = {}
  const creditCardExpenses = {}
  const oneTimeExpensesByName = {}
  
  let totalIncome = 0
  let totalExpenses = 0
  
  // Calculate income by source (only active items)
  incomes.forEach(income => {
    // Skip if inactive
    if (income.isActive === false) return
    
    if (income.name && income.amount) {
      const occurrences = Math.floor(projectionDays / (
        income.frequency === 'weekly' ? 7 : 
        income.frequency === 'bi-weekly' ? 14 :
        income.frequency === '15th-and-last' ? 15 : 30
      ))
      const totalAmount = income.amount * Math.max(1, occurrences)
      incomeBySource[income.name] = totalAmount
      totalIncome += totalAmount
    }
  })
  
  // Calculate recurring expenses by category (only active items)
  recurringExpenses.forEach(expense => {
    // Skip if inactive
    if (expense.isActive === false) return
    
    if (expense.name && expense.category && expense.amount) {
      const occurrences = Math.floor(projectionDays / (
        expense.frequency === 'weekly' ? 7 : 
        expense.frequency === 'bi-weekly' ? 14 : 30
      ))
      const totalAmount = expense.amount * Math.max(1, occurrences)
      expensesByCategory[expense.category] = (expensesByCategory[expense.category] || 0) + totalAmount
      totalExpenses += totalAmount
    }
  })
  
  // Calculate credit card expenses (only active items)
  creditCards.forEach(card => {
    // Skip if inactive
    if (card.isActive === false) return
    
    if (card.name && card.balance) {
      creditCardExpenses[card.name] = card.balance
      totalExpenses += card.balance
    }
  })
  
  // Calculate one-time expenses (only active items)
  oneTimeExpenses.forEach(expense => {
    // Skip if inactive
    if (expense.isActive === false) return
    
    if (expense.name && expense.amount && expense.date) {
      const expenseDate = normalizeDate(expense.date)
      const today = normalizeDate(new Date())
      const endDate = new Date(today.getTime() + projectionDays * 24 * 60 * 60 * 1000)
      
      if (expenseDate && expenseDate >= today && expenseDate <= endDate) {
        oneTimeExpensesByName[expense.name] = expense.amount
        totalExpenses += expense.amount
      }
    }
  })
  
  return {
    incomeBySource,
    expensesByCategory,
    creditCardExpenses,
    oneTimeExpensesByName,
    totalIncome,
    totalExpenses
  }
}

export const getSankeyData = (flowData) => {
  try {
    // Return empty data structure if no data
    if (flowData.totalIncome === 0 && flowData.totalExpenses === 0) {
      return {
        nodes: [
          { id: 'No Income Data' },
          { id: 'No Expense Data' }
        ],
        links: []
      }
    }
    
    // Create nodes for income sources and expense categories
    const incomeNodes = Object.keys(flowData.incomeBySource).map(name => ({ id: name }))
    const expenseNodes = [
      ...Object.keys(flowData.expensesByCategory).map(name => ({ id: name })),
      ...Object.keys(flowData.creditCardExpenses).map(name => ({ id: `${name} (Credit)` })),
      ...Object.keys(flowData.oneTimeExpensesByName).map(name => ({ id: `${name} (One-time)` }))
    ]
    
    const nodes = [...incomeNodes, ...expenseNodes]
    
    // Create links based on proportional distribution
    const links = []
    const totalIncome = flowData.totalIncome
    
    if (totalIncome > 0 && incomeNodes.length > 0 && expenseNodes.length > 0) {
      // Distribute income proportionally to expenses
      const allExpenses = {
        ...flowData.expensesByCategory,
        ...Object.fromEntries(
          Object.entries(flowData.creditCardExpenses).map(([k, v]) => [`${k} (Credit)`, v])
        ),
        ...Object.fromEntries(
          Object.entries(flowData.oneTimeExpensesByName).map(([k, v]) => [`${k} (One-time)`, v])
        )
      }
      
      Object.entries(flowData.incomeBySource).forEach(([incomeName, incomeAmount]) => {
        Object.entries(allExpenses).forEach(([expenseName, expenseAmount]) => {
          const proportionalAmount = (incomeAmount / totalIncome) * expenseAmount
          if (proportionalAmount > 0.01) { // Minimum threshold to avoid tiny links
            links.push({
              source: incomeName,
              target: expenseName,
              value: Math.round(proportionalAmount * 100) / 100 // Round to 2 decimal places
            })
          }
        })
      })
    }
    
    // Ensure we have valid data structure
    if (nodes.length === 0 || links.length === 0) {
      return {
        nodes: [
          { id: 'Add Income' },
          { id: 'Add Expenses' }
        ],
        links: []
      }
    }
    
    return { nodes, links }
  } catch (error) {
    console.error('Error generating Sankey data:', error)
    return {
      nodes: [
        { id: 'Error Loading Data' }
      ],
      links: []
    }
  }
}