export const exportProjectionCSV = (cashflowData) => {
  // Create CSV headers
  const headers = ['Date', 'Income', 'Expenses', 'Net Change', 'Running Balance']
  
  // Create CSV rows
  const csvRows = [
    headers.join(','),
    ...cashflowData.map(day => [
      day.date.toLocaleDateString(),
      day.income.toFixed(2),
      day.expenses.toFixed(2),
      day.netChange.toFixed(2),
      day.runningBalance.toFixed(2)
    ].join(','))
  ]
  
  // Create and download the file
  const csvContent = csvRows.join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `cashflow-projection-${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  window.URL.revokeObjectURL(url)
}

export const exportInputsCSV = (data) => {
  const { startingBalance, incomes, creditCards, recurringExpenses, oneTimeExpenses, projectionDays } = data
  
  // Create CSV content with structured sections
  const csvLines = []
  
  // Header
  csvLines.push('# Cashflow Management - Input Data Export')
  csvLines.push(`# Exported on: ${new Date().toISOString()}`)
  csvLines.push('')
  
  // Starting Balance
  csvLines.push('[STARTING_BALANCE]')
  csvLines.push('Amount')
  csvLines.push(startingBalance.toString())
  csvLines.push('')
  
  // Projection Days
  csvLines.push('[PROJECTION_DAYS]')
  csvLines.push('Days')
  csvLines.push(projectionDays.toString())
  csvLines.push('')
  
  // Income Sources
  csvLines.push('[INCOME_SOURCES]')
  csvLines.push('ID,Name,Amount,Frequency,NextPayDate')
  incomes.forEach(income => {
    csvLines.push(`${income.id},"${income.name}",${income.amount},${income.frequency},${income.nextPayDate}`)
  })
  csvLines.push('')
  
  // Credit Cards
  csvLines.push('[CREDIT_CARDS]')
  csvLines.push('ID,Name,Balance,DueDate,PayDate')
  creditCards.forEach(card => {
    csvLines.push(`${card.id},"${card.name}",${card.balance},${card.dueDate},${card.payDate}`)
  })
  csvLines.push('')
  
  // Recurring Expenses
  csvLines.push('[RECURRING_EXPENSES]')
  csvLines.push('ID,Name,Amount,Category,Frequency,NextDueDate')
  recurringExpenses.forEach(expense => {
    csvLines.push(`${expense.id},"${expense.name}",${expense.amount},${expense.category},${expense.frequency},${expense.nextDueDate}`)
  })
  csvLines.push('')
  
  // One-Time Expenses
  csvLines.push('[ONE_TIME_EXPENSES]')
  csvLines.push('ID,Name,Amount,Category,Date')
  oneTimeExpenses.forEach(expense => {
    csvLines.push(`${expense.id},"${expense.name}",${expense.amount},${expense.category},${expense.date}`)
  })
  
  // Create and download the file
  const csvContent = csvLines.join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `cashflow-input-data-${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  window.URL.revokeObjectURL(url)
}

// Helper function to parse CSV line with proper comma handling
const parseCsvLine = (line) => {
  const result = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }
  result.push(current)
  
  return result
}

export const importInputsCSV = async (input) => {
  let csvText = ''
  if (typeof input === 'string') {
    csvText = input
  } else if (input && typeof input.text === 'function') {
    // File or Blob
    csvText = await input.text()
  } else {
    return null
  }

  const lines = csvText.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('#'))
  
  let currentSection = null
  let newStartingBalance = 0
  let newProjectionDays = 90
  let newIncomes = []
  let newCreditCards = []
  let newRecurringExpenses = []
  let newOneTimeExpenses = []
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    
    // Check for section headers
    if (line.startsWith('[') && line.endsWith(']')) {
      currentSection = line.slice(1, -1)
      continue
    }
    
    // Skip header rows (contains column names)
    if (line.includes('ID,Name') || line.includes('Amount') || line.includes('Days')) {
      continue
    }
    
    // Process data based on current section
    switch (currentSection) {
      case 'STARTING_BALANCE':
        const balance = parseFloat(line)
        if (!isNaN(balance)) newStartingBalance = balance
        break
        
      case 'PROJECTION_DAYS':
        const days = parseInt(line)
        if (!isNaN(days) && days > 0) newProjectionDays = days
        break
        
      case 'INCOME_SOURCES':
        const incomeData = parseCsvLine(line)
        if (incomeData.length >= 5) {
          newIncomes.push({
            id: parseInt(incomeData[0]) || crypto.randomUUID(),
            name: incomeData[1].replace(/"/g, ''),
            amount: parseFloat(incomeData[2]) || 0,
            frequency: incomeData[3] || 'monthly',
            nextPayDate: incomeData[4] || ''
          })
        }
        break
        
      case 'CREDIT_CARDS':
        const cardData = parseCsvLine(line)
        if (cardData.length >= 5) {
          newCreditCards.push({
            id: parseInt(cardData[0]) || crypto.randomUUID(),
            name: cardData[1].replace(/"/g, ''),
            balance: parseFloat(cardData[2]) || 0,
            dueDate: cardData[3] || '',
            payDate: cardData[4] || ''
          })
        }
        break
        
      case 'RECURRING_EXPENSES':
        const recurringData = parseCsvLine(line)
        if (recurringData.length >= 6) {
          newRecurringExpenses.push({
            id: parseInt(recurringData[0]) || crypto.randomUUID(),
            name: recurringData[1].replace(/"/g, ''),
            amount: parseFloat(recurringData[2]) || 0,
            category: recurringData[3] || 'Other',
            frequency: recurringData[4] || 'monthly',
            nextDueDate: recurringData[5] || ''
          })
        }
        break
        
      case 'ONE_TIME_EXPENSES':
        const onetimeData = parseCsvLine(line)
        if (onetimeData.length >= 5) {
          newOneTimeExpenses.push({
            id: parseInt(onetimeData[0]) || crypto.randomUUID(),
            name: onetimeData[1].replace(/"/g, ''),
            amount: parseFloat(onetimeData[2]) || 0,
            category: onetimeData[3] || 'Other',
            date: onetimeData[4] || ''
          })
        }
        break
    }
  }
  
  return {
    startingBalance: newStartingBalance,
    projectionDays: newProjectionDays,
    incomes: newIncomes,
    creditCards: newCreditCards,
    recurringExpenses: newRecurringExpenses,
    oneTimeExpenses: newOneTimeExpenses
  }
}