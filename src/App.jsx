import { useState, useEffect } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ComposedChart } from 'recharts'
import { ResponsiveSankey } from '@nivo/sankey'
import './App.css'

function App() {
  const [startingBalance, setStartingBalance] = useState(0)
  const [incomes, setIncomes] = useState([])
  const [creditCards, setCreditCards] = useState([])
  const [recurringExpenses, setRecurringExpenses] = useState([])
  const [oneTimeExpenses, setOneTimeExpenses] = useState([])
  const [projectionDays, setProjectionDays] = useState(30)
  const [showTransactionDaysOnly, setShowTransactionDaysOnly] = useState(false)
  const [activeTab, setActiveTab] = useState('inputs')
  const [chartType, setChartType] = useState('line')
  const [currentTaglineIndex, setCurrentTaglineIndex] = useState(0)
  const [showHelpModal, setShowHelpModal] = useState(false)

  // Load data from sessionStorage on component mount
  useEffect(() => {
    const savedData = sessionStorage.getItem('cashflowData')
    if (savedData) {
      const data = JSON.parse(savedData)
      setStartingBalance(data.startingBalance || 0)
      setIncomes(data.incomes || [])
      setCreditCards(data.creditCards || [])
      setRecurringExpenses(data.recurringExpenses || [])
      setOneTimeExpenses(data.oneTimeExpenses || [])
      setProjectionDays(data.projectionDays || 30)
      setShowTransactionDaysOnly(data.showTransactionDaysOnly || false)
      setActiveTab(data.activeTab || 'inputs')
      setChartType(data.chartType || 'line')
    }
  }, [])

  // Save data to sessionStorage whenever state changes
  useEffect(() => {
    const dataToSave = {
      startingBalance,
      incomes,
      creditCards,
      recurringExpenses,
      oneTimeExpenses,
      projectionDays,
      showTransactionDaysOnly,
      activeTab,
      chartType
    }
    sessionStorage.setItem('cashflowData', JSON.stringify(dataToSave))
  }, [startingBalance, incomes, creditCards, recurringExpenses, oneTimeExpenses, projectionDays, showTransactionDaysOnly, activeTab, chartType])

  const addIncome = () => {
    setIncomes([...incomes, {
      id: Date.now(),
      name: '',
      amount: 0,
      frequency: 'monthly',
      nextPayDate: ''
    }])
  }

  const updateIncome = (id, field, value) => {
    setIncomes(incomes.map(income => 
      income.id === id ? { ...income, [field]: value } : income
    ))
  }

  const removeIncome = (id) => {
    setIncomes(incomes.filter(income => income.id !== id))
  }

  const addCreditCard = () => {
    setCreditCards([...creditCards, {
      id: Date.now(),
      name: '',
      balance: 0,
      dueDate: '',
      payDate: ''
    }])
  }

  const updateCreditCard = (id, field, value) => {
    setCreditCards(creditCards.map(card => 
      card.id === id ? { ...card, [field]: value } : card
    ))
  }

  const removeCreditCard = (id) => {
    setCreditCards(creditCards.filter(card => card.id !== id))
  }

  const addRecurringExpense = () => {
    setRecurringExpenses([...recurringExpenses, {
      id: Date.now(),
      name: '',
      amount: 0,
      category: 'Other',
      frequency: 'monthly',
      nextDueDate: ''
    }])
  }

  const updateRecurringExpense = (id, field, value) => {
    setRecurringExpenses(recurringExpenses.map(expense => 
      expense.id === id ? { ...expense, [field]: value } : expense
    ))
  }

  const removeRecurringExpense = (id) => {
    setRecurringExpenses(recurringExpenses.filter(expense => expense.id !== id))
  }

  const addOneTimeExpense = () => {
    setOneTimeExpenses([...oneTimeExpenses, {
      id: Date.now(),
      name: '',
      amount: 0,
      category: 'Other',
      date: ''
    }])
  }

  const updateOneTimeExpense = (id, field, value) => {
    setOneTimeExpenses(oneTimeExpenses.map(expense => 
      expense.id === id ? { ...expense, [field]: value } : expense
    ))
  }

  const removeOneTimeExpense = (id) => {
    setOneTimeExpenses(oneTimeExpenses.filter(expense => expense.id !== id))
  }

  // Taglines collection
  const taglines = [
    "No judgement, no API integration, no Plaid",
    "We won't remind you how much you spent last summer",
    "I don't care if 6 months ago you overdid it in St. Tropez",
    "Don't care how many table services Plaid will remind you you have done 9 years ago",
    "That vintage wine collection? Not our business.",
    "We don't care about your art gallery splurges.",
    "We won't mention the boat you bought drunk.",
    "Those designer shoes from last spring? Forgotten.",
    "We don't judge your DoorDash addiction.",
    "Fresh start, fresh cash flow.",
    "We're not your financial therapist.",
    "Clean slate, dirty money welcome.",
    "No receipts, no regrets, no reminders.",
    "Your financial past can stay in therapy.",
    "We don't do financial archaeology.",
    "No transaction shaming since never.",
    "We won't connect to your mistakes.",
    "Your bank statements are safe from us.",
    "No access to your financial trauma.",
    "Overdid it in St. Tropez in 2017? We're not Plaid, we don't care.",
    "Blew your savings in St. Tropez? We're not your bank app.",
    "That St. Tropez summer of 2018? Not our circus, not our spreadsheet.",
    "St. Tropez bottle service bills? We don't keep receipts.",
    "Spent rent money in St. Tropez? We're not here to judge.",
    "Your St. Tropez yacht week disaster? Ancient history.",
    "Maxed out your cards in Mykonos? We're not Plaid, we don't remember.",
    "Went broke in Ibiza? We're not your banking app.",
    "That Coachella weekend that cost 3 months rent? We won't remind you.",
    "Tulum ate your emergency fund? We don't do financial autopsies.",
    "Your Miami boat party receipts? We don't sync with shame.",
    "Aspen ski trip broke the bank? We're not Mint, we don't mention it.",
    "That Cloud Nine champagne tab in Aspen? We won't bring it up.",
    "Spent your bonus in Dubai? We're not keeping score.",
    "Blew through savings in the Hamptons? We don't track regrets.",
    "Casa de Campo golf week emptied your account? We won't mention it.",
    "That Mayfair shopping spree? We're not your financial conscience.",
    "Loro Piana summer walks cost more than most cars? We don't care.",
    "Aspen powder days emptied your account? We won't remind you.",
    "That Aspen weekend cost more than your car? We're not Plaid, we don't judge.",
    "Spent Christmas money on Aspen lift tickets? Ancient history.",
    "Aspen après-ski bills broke the bank? We don't keep receipts.",
    "Your Aspen lodge weekend? We won't bring it up.",
    "Your Bagatelle brunch bills? We don't keep tabs.",
    "Dropped your rent money at Bagatelle? We're not your conscience.",
    "That Bagatelle champagne parade from 2018? We won't mention it.",
    "Seaspice ate your emergency fund? We don't do financial autopsies.",
    "That Seaspice dinner cost more than your mortgage? We won't remind you.",
    "Blew your savings on Seaspice weekends? We're not keeping track.",
    "Your Seaspice yacht party receipts? Not our problem.",
    "Medium Cool bottle service 2 months ago? We're not your transaction history.",
    "That Soho House weekend destroyed your budget? We don't care.",
    "Art Basel spending spree? We won't bring it up.",
    "That designer handbag impulse buy? We're not Plaid, we don't care.",
    "Invested in that friend's startup? We're not your transaction history.",
    "Splurged on that watch collection? We're not Plaid, we're not counting."
  ]

  // Get a truly random tagline index
  const getRandomTaglineIndex = () => {
    return Math.floor(Math.random() * taglines.length)
  }

  // Random tagline on page refresh
  useEffect(() => {
    setCurrentTaglineIndex(getRandomTaglineIndex())
  }, [])

  // Random tagline on tab change
  useEffect(() => {
    setCurrentTaglineIndex(getRandomTaglineIndex())
  }, [activeTab])

  // Random tagline on projection days change
  useEffect(() => {
    setCurrentTaglineIndex(getRandomTaglineIndex())
  }, [projectionDays])

  const calculateCashflow = (days = projectionDays) => {
    const today = new Date()
    const cashflowData = []
    
    // Helper function to get last business day of a month
    const getLastBusinessDay = (year, month) => {
      let lastDay = new Date(year, month + 1, 0) // Last day of month
      while (lastDay.getDay() === 0 || lastDay.getDay() === 6) {
        lastDay.setDate(lastDay.getDate() - 1) // Move to previous day if weekend
      }
      return lastDay
    }
    
    // Helper function to check if a date matches a recurring schedule
    const isPaymentDue = (currentDate, startDate, frequency) => {
      if (!startDate) return false
      
      const start = new Date(startDate)
      const current = new Date(currentDate)
      
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
        default:
          return false
      }
    }
    
    // Process each day sequentially
    for (let i = 0; i < days; i++) {
      const currentDate = new Date(today)
      currentDate.setDate(today.getDate() + i)
      
      let dailyIncome = 0
      let dailyExpenses = 0
      
      // Calculate income for this date
      incomes.forEach(income => {
        if (income.nextPayDate && income.amount && income.frequency) {
          if (isPaymentDue(currentDate, income.nextPayDate, income.frequency)) {
            dailyIncome += income.amount
          }
        }
      })
      
      // Calculate recurring expenses for this date
      recurringExpenses.forEach(expense => {
        if (expense.nextDueDate && expense.amount && expense.frequency) {
          if (isPaymentDue(currentDate, expense.nextDueDate, expense.frequency)) {
            dailyExpenses += expense.amount
          }
        }
      })
      
      // Calculate credit card payments (use payDate if provided, else dueDate)
      creditCards.forEach(card => {
        if (card.balance && (card.dueDate || card.payDate)) {
          const paymentDate = new Date(card.payDate || card.dueDate)
          if (currentDate.toDateString() === paymentDate.toDateString()) {
            dailyExpenses += card.balance
          }
        }
      })
      
      // Calculate one-time expenses
      oneTimeExpenses.forEach(expense => {
        if (expense.date && expense.amount) {
          const expenseDate = new Date(expense.date)
          if (currentDate.toDateString() === expenseDate.toDateString()) {
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

  // Format data for chart
  const getChartData = () => {
    const cashflowData = calculateCashflow(projectionDays)
    let filteredData = cashflowData
    
    // Filter to show only transaction days if toggle is enabled
    if (showTransactionDaysOnly) {
      filteredData = cashflowData.filter(day => day.income > 0 || day.expenses > 0)
    }
    
    return filteredData.map((day, index) => ({
      day: index + 1,
      date: day.date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' }),
      shortDate: `${day.date.getMonth() + 1}/${day.date.getDate()}`,
      balance: day.runningBalance,
      income: day.income,
      expenses: -day.expenses, // Negative for waterfall chart (goes down from zero)
      netChange: day.netChange
    }))
  }

  // Get filtered cashflow data for table display
  const getFilteredCashflowData = () => {
    const cashflowData = calculateCashflow(projectionDays)
    if (showTransactionDaysOnly) {
      return cashflowData.filter(day => day.income > 0 || day.expenses > 0)
    }
    return cashflowData
  }

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const actualExpenses = Math.abs(data.expenses) // Convert back to positive for display
      return (
        <div className="chart-tooltip">
          <p className="tooltip-date">{`${data.shortDate}: ${data.date}`}</p>
          <p className="tooltip-balance">
            Balance: <span className={data.balance < 0 ? 'negative' : 'positive'}>
              ${data.balance < 0 ? '(' + Math.abs(data.balance).toFixed(2) + ')' : data.balance.toFixed(2)}
            </span>
          </p>
          <p className="tooltip-income">Income: ${data.income.toFixed(2)}</p>
          <p className="tooltip-expenses">Expenses: ${actualExpenses.toFixed(2)}</p>
          <p className="tooltip-net">Net: ${data.netChange.toFixed(2)}</p>
        </div>
      )
    }
    return null
  }

  // Calculate flow breakdown data for visual display
  const getFlowBreakdownData = () => {
    // Calculate totals for the selected period
    const incomeBySource = {}
    const expensesByCategory = {}
    const creditCardExpenses = {}
    const oneTimeExpensesByName = {}
    
    let totalIncome = 0
    let totalExpenses = 0
    
    // Calculate income by source (simplified approach)
    incomes.forEach(income => {
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
    
    // Calculate recurring expenses by category
    recurringExpenses.forEach(expense => {
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
    
    // Calculate credit card expenses
    creditCards.forEach(card => {
      if (card.name && card.balance) {
        creditCardExpenses[card.name] = card.balance
        totalExpenses += card.balance
      }
    })
    
    // Calculate one-time expenses
    oneTimeExpenses.forEach(expense => {
      if (expense.name && expense.amount && expense.date) {
        const expenseDate = new Date(expense.date)
        const today = new Date()
        const endDate = new Date(today.getTime() + projectionDays * 24 * 60 * 60 * 1000)
        
        if (expenseDate >= today && expenseDate <= endDate) {
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

  // Generate Sankey diagram data
  const getSankeyData = () => {
    try {
      const flowData = getFlowBreakdownData()
      
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


  const exportToCSV = () => {
    const cashflowData = getFilteredCashflowData()
    
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

  const exportInputData = () => {
    const inputData = {
      startingBalance,
      incomes,
      creditCards,
      recurringExpenses,
      oneTimeExpenses,
      projectionDays
    }
    
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

  const importInputData = (event) => {
    const file = event.target.files[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const csvContent = e.target.result
        const lines = csvContent.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('#'))
        
        let currentSection = null
        let newStartingBalance = startingBalance
        let newProjectionDays = projectionDays
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
                  id: parseInt(incomeData[0]) || Date.now() + Math.random(),
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
                  id: parseInt(cardData[0]) || Date.now() + Math.random(),
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
                  id: parseInt(recurringData[0]) || Date.now() + Math.random(),
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
                  id: parseInt(onetimeData[0]) || Date.now() + Math.random(),
                  name: onetimeData[1].replace(/"/g, ''),
                  amount: parseFloat(onetimeData[2]) || 0,
                  category: onetimeData[3] || 'Other',
                  date: onetimeData[4] || ''
                })
              }
              break
          }
        }
        
        // Update state with imported data
        setStartingBalance(newStartingBalance)
        setProjectionDays(newProjectionDays)
        setIncomes(newIncomes)
        setCreditCards(newCreditCards)
        setRecurringExpenses(newRecurringExpenses)
        setOneTimeExpenses(newOneTimeExpenses)
        
        alert('Data imported successfully!')
      } catch (error) {
        console.error('Import error:', error)
        alert('Error importing data. Please check the file format.')
      }
    }
    reader.readAsText(file)
    
    // Reset the file input
    event.target.value = ''
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

  return (
    <div className="app-container">
      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'inputs' ? 'active' : ''}`}
          onClick={() => setActiveTab('inputs')}
        >
          Inputs
        </button>
        <button 
          className={`tab-button ${activeTab === 'projection' ? 'active' : ''}`}
          onClick={() => setActiveTab('projection')}
        >
          Projection
        </button>
        <button 
          className={`tab-button ${activeTab === 'insights' ? 'active' : ''}`}
          onClick={() => setActiveTab('insights')}
        >
          Insights
        </button>
        <button 
          className={`tab-button ${activeTab === 'export-pdf' ? 'active' : ''}`}
          onClick={() => setActiveTab('export-pdf')}
        >
          Export to PDF
        </button>
      </div>
      
      {activeTab === 'inputs' && (
      <div className="main-layout">
        {/* Left Panel - Inputs */}
        <div className="inputs-panel">
          <h2>Inputs</h2>
          
          <div className="card">
            <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
              <h3 style={{ margin: 0 }}>Data Management</h3>
              <div className="flex gap-md" style={{ alignItems: 'center' }}>
                <button className="download" onClick={exportInputData}>Export Data</button>
                <button 
                  className="download" 
                  onClick={() => document.getElementById('import-file-input').click()}
                >
                  Import Data
                </button>
                <input 
                  id="import-file-input"
                  type="file" 
                  accept=".csv" 
                  onChange={importInputData}
                  style={{ display: 'none' }}
                />
                <button 
                  className="help-btn" 
                  onClick={() => setShowHelpModal(true)}
                  style={{ 
                    backgroundColor: 'var(--white)', 
                    border: '1px solid var(--secondary-gray)', 
                    borderRadius: '50%',
                    fontSize: '0.75rem', 
                    cursor: 'pointer', 
                    padding: '0',
                    width: '1.5rem',
                    height: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--secondary-gray)',
                    fontWeight: '600'
                  }}
                  title="Help - Data Storage Info"
                >
                  ?
                </button>
              </div>
            </div>
            <p>Export your data to back it up locally, or import previously saved data.</p>
          </div>

          <div className="card">
            <h3>Starting Balance</h3>
            <input 
              type="number" 
              placeholder="$0.00" 
              value={startingBalance || ''}
              onChange={(e) => setStartingBalance(parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="card">
            <h3>Income Sources</h3>
            <p>Add salary and other income sources</p>
            
            {incomes.map(income => (
              <div key={income.id} className="income-item mb-md">
                <div className="flex gap-md mb-sm">
                  <div className="input-group">
                    <label>Income Name:</label>
                    <input 
                      type="text" 
                      placeholder="e.g., Salary, Freelance"
                      value={income.name}
                      onChange={(e) => updateIncome(income.id, 'name', e.target.value)}
                    />
                  </div>
                  <div className="input-group">
                    <label>Amount:</label>
                    <input 
                      type="number" 
                      placeholder="0.00"
                      value={income.amount || ''}
                      onChange={(e) => updateIncome(income.id, 'amount', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
                <div className="flex gap-md mb-sm">
                  <select 
                    value={income.frequency} 
                    onChange={(e) => updateIncome(income.id, 'frequency', e.target.value)}
                  >
                    <option value="weekly">Weekly</option>
                    <option value="bi-weekly">Bi-weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="15th-and-last">15th and Last of Month</option>
                  </select>
                  <input 
                    type="date" 
                    value={income.nextPayDate}
                    onChange={(e) => updateIncome(income.id, 'nextPayDate', e.target.value)}
                  />
                  <button className="remove-btn" onClick={() => removeIncome(income.id)}>Remove</button>
                </div>
              </div>
            ))}
            
            <button className="add-button" onClick={addIncome}>+ Add Income</button>
          </div>

          <div className="card">
            <h3>Credit Cards</h3>
            <p>Track credit card balances and due dates</p>
            
            {creditCards.map(card => (
              <div key={card.id} className="income-item mb-md">
                <div className="flex gap-md mb-sm">
                  <div className="input-group">
                    <label>Card Name:</label>
                    <input 
                      type="text" 
                      placeholder="e.g., Chase Sapphire"
                      value={card.name}
                      onChange={(e) => updateCreditCard(card.id, 'name', e.target.value)}
                    />
                  </div>
                  <div className="input-group">
                    <label>Balance:</label>
                    <input 
                      type="number" 
                      placeholder="0.00"
                      value={card.balance || ''}
                      onChange={(e) => updateCreditCard(card.id, 'balance', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
                <div className="flex gap-md mb-sm">
                  <div className="date-field">
                    <label>Due Date:</label>
                    <input 
                      type="date" 
                      value={card.dueDate}
                      onChange={(e) => updateCreditCard(card.id, 'dueDate', e.target.value)}
                    />
                  </div>
                  <div className="date-field">
                    <label>Pay Date:</label>
                    <input 
                      type="date" 
                      value={card.payDate}
                      onChange={(e) => updateCreditCard(card.id, 'payDate', e.target.value)}
                      placeholder="Optional - uses due date if empty"
                    />
                  </div>
                  <button className="remove-btn" onClick={() => removeCreditCard(card.id)}>Remove</button>
                </div>
                {/* Red alert if pay date is after due date */}
                {card.dueDate && card.payDate && new Date(card.payDate) > new Date(card.dueDate) && (
                  <div className="alert-danger">
                    ⚠️ Pay date is after due date - this may incur late fees!
                  </div>
                )}
              </div>
            ))}
            
            <button className="add-button" onClick={addCreditCard}>+ Add Credit Card</button>
          </div>

          <div className="card">
            <h3>Recurring Expenses</h3>
            <p>Monthly bills like rent, car payments, utilities</p>
            
            {recurringExpenses.map(expense => (
              <div key={expense.id} className="income-item mb-md">
                <div className="flex gap-md mb-sm">
                  <div className="input-group">
                    <label>Expense Name:</label>
                    <input 
                      type="text" 
                      placeholder="e.g., Rent, Car Payment"
                      value={expense.name}
                      onChange={(e) => updateRecurringExpense(expense.id, 'name', e.target.value)}
                    />
                  </div>
                  <div className="input-group">
                    <label>Amount:</label>
                    <input 
                      type="number" 
                      placeholder="0.00"
                      value={expense.amount || ''}
                      onChange={(e) => updateRecurringExpense(expense.id, 'amount', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
                <div className="flex gap-md mb-sm">
                  <select 
                    value={expense.category} 
                    onChange={(e) => updateRecurringExpense(expense.id, 'category', e.target.value)}
                  >
                    <option value="Housing">Housing</option>
                    <option value="Transportation">Transportation</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Insurance">Insurance</option>
                    <option value="Food">Food</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Other">Other</option>
                  </select>
                  <select 
                    value={expense.frequency} 
                    onChange={(e) => updateRecurringExpense(expense.id, 'frequency', e.target.value)}
                  >
                    <option value="weekly">Weekly</option>
                    <option value="bi-weekly">Bi-weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                  <input 
                    type="date" 
                    value={expense.nextDueDate}
                    onChange={(e) => updateRecurringExpense(expense.id, 'nextDueDate', e.target.value)}
                  />
                  <button className="remove-btn" onClick={() => removeRecurringExpense(expense.id)}>Remove</button>
                </div>
              </div>
            ))}
            
            <button className="add-button" onClick={addRecurringExpense}>+ Add Expense</button>
          </div>

          <div className="card">
            <h3>One-Time Expenses</h3>
            <p>Future expenses like vacations, repairs</p>
            
            {oneTimeExpenses.map(expense => (
              <div key={expense.id} className="income-item mb-md">
                <div className="flex gap-md mb-sm">
                  <div className="input-group">
                    <label>Expense Name:</label>
                    <input 
                      type="text" 
                      placeholder="e.g., Vacation, Car Repair"
                      value={expense.name}
                      onChange={(e) => updateOneTimeExpense(expense.id, 'name', e.target.value)}
                    />
                  </div>
                  <div className="input-group">
                    <label>Amount:</label>
                    <input 
                      type="number" 
                      placeholder="0.00"
                      value={expense.amount || ''}
                      onChange={(e) => updateOneTimeExpense(expense.id, 'amount', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
                <div className="flex gap-md mb-sm">
                  <select 
                    value={expense.category} 
                    onChange={(e) => updateOneTimeExpense(expense.id, 'category', e.target.value)}
                  >
                    <option value="Travel">Travel</option>
                    <option value="Medical">Medical</option>
                    <option value="Home Improvement">Home Improvement</option>
                    <option value="Emergency">Emergency</option>
                    <option value="Gift">Gift</option>
                    <option value="Other">Other</option>
                  </select>
                  <input 
                    type="date" 
                    value={expense.date}
                    onChange={(e) => updateOneTimeExpense(expense.id, 'date', e.target.value)}
                  />
                  <button className="remove-btn" onClick={() => removeOneTimeExpense(expense.id)}>Remove</button>
                </div>
              </div>
            ))}
            
            <button className="add-button" onClick={addOneTimeExpense}>+ Add One-Time Expense</button>
          </div>
        </div>

        {/* Right Panel - Projection */}
        <div className="projection-panel">
          <div className="projection-header">
            <h2>Cashflow Projection</h2>
            <button className="download" onClick={exportToCSV}>Export Cashflow CSV</button>
          </div>
          
          <div className="metric-card mb-md">
            <strong>Starting Balance: ${startingBalance.toFixed(2)}</strong>
          </div>

          {/* Projection Controls */}
          <div className="projection-controls mb-lg">
            <div className="control-group">
              <label htmlFor="projectionDays">Days to Show:</label>
              <select 
                id="projectionDays"
                value={projectionDays} 
                onChange={(e) => setProjectionDays(parseInt(e.target.value))}
              >
                <option value={15}>Next 15 Days</option>
                <option value={30}>Next 30 Days</option>
                <option value={60}>Next 60 Days</option>
                <option value={90}>Next 90 Days</option>
              </select>
            </div>
            <div className="control-group">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={showTransactionDaysOnly}
                  onChange={(e) => setShowTransactionDaysOnly(e.target.checked)}
                />
                Show Only Transaction Days
              </label>
            </div>
            <div className="control-group">
              <label htmlFor="chartType">Chart Type:</label>
              <select 
                id="chartType"
                value={chartType} 
                onChange={(e) => setChartType(e.target.value)}
              >
                <option value="line">Line Chart</option>
                <option value="bar">Bar Chart</option>
              </select>
            </div>
          </div>
          
          {/* Cashflow Graph */}
          <div className="cashflow-graph mb-lg">
            <h3>Balance Trend</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                {chartType === 'line' ? (
                  <LineChart data={getChartData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                    <XAxis 
                      dataKey="shortDate" 
                      tick={{ fontSize: 12 }}
                      interval={projectionDays <= 30 ? 1 : projectionDays <= 60 ? 6 : 6}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `$${value.toLocaleString()}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine y={0} stroke="#DC2626" strokeDasharray="2 2" />
                    <Line 
                      type="monotone" 
                      dataKey="balance" 
                      stroke="#2A623C" 
                      strokeWidth={2}
                      dot={{ fill: '#2A623C', strokeWidth: 1, r: 3 }}
                      activeDot={{ r: 5, fill: '#2A623C' }}
                    />
                  </LineChart>
                ) : (
                  <BarChart data={getChartData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                    <XAxis 
                      dataKey="shortDate" 
                      tick={{ fontSize: 12 }}
                      interval={projectionDays <= 30 ? 1 : projectionDays <= 60 ? 6 : 6}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `$${value.toLocaleString()}`}
                      domain={['dataMin', 'dataMax']}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine y={0} stroke="#374151" strokeWidth={2} />
                    <Bar 
                      dataKey="income" 
                      fill="#2A623C"
                      opacity={0.8}
                      name="Income"
                    />
                    <Bar 
                      dataKey="expenses" 
                      fill="#DC2626"
                      opacity={0.8}
                      name="Expenses"
                    />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Full Cashflow Table */}
          <div className="cashflow-table-section">
            <h3>Daily Breakdown</h3>
            <div className="cashflow-table">
              {getFilteredCashflowData().map((day, index) => (
                <div key={index} className="cashflow-row">
                  <div className="cashflow-data">
                    <div className="date-col">
                      {day.date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })}
                    </div>
                    <div className="income-col">
                      Income: ${day.income.toFixed(2)}
                    </div>
                    <div className="expense-col">
                      Expenses: ${day.expenses.toFixed(2)}
                    </div>
                    <div className="balance-col">
                      Balance: <span className={day.runningBalance < 0 ? 'negative' : ''}>
                        ${Math.abs(day.runningBalance).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      )}
      
      {activeTab === 'projection' && (
        <div className="projection-layout">
          <div className="projection-panel">
            <div className="projection-header">
              <h2>Cashflow Projection</h2>
              <button className="download" onClick={exportToCSV}>Export Cashflow CSV</button>
            </div>
            
            <div className="metric-card mb-md">
              <strong>Starting Balance: ${startingBalance.toFixed(2)}</strong>
            </div>

            {/* Projection Controls */}
            <div className="projection-controls mb-lg">
              <div className="control-group">
                <label htmlFor="projectionDays">Days to Show:</label>
                <select 
                  id="projectionDays"
                  value={projectionDays} 
                  onChange={(e) => setProjectionDays(parseInt(e.target.value))}
                >
                  <option value={15}>Next 15 Days</option>
                  <option value={30}>Next 30 Days</option>
                  <option value={60}>Next 60 Days</option>
                  <option value={90}>Next 90 Days</option>
                </select>
              </div>
              <div className="control-group">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={showTransactionDaysOnly}
                    onChange={(e) => setShowTransactionDaysOnly(e.target.checked)}
                  />
                  Show Only Transaction Days
                </label>
              </div>
            </div>
            
            {/* Cashflow Graph */}
            <div className="cashflow-graph mb-lg">
              <h3>Balance Trend</h3>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  {chartType === 'line' ? (
                    <LineChart data={getChartData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                      <XAxis 
                        dataKey="shortDate" 
                        tick={{ fontSize: 12 }}
                        interval={projectionDays <= 30 ? 1 : projectionDays <= 60 ? 6 : 6}
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => `$${value.toLocaleString()}`}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <ReferenceLine y={0} stroke="#DC2626" strokeDasharray="2 2" />
                      <Line 
                        type="monotone" 
                        dataKey="balance" 
                        stroke="#2A623C" 
                        strokeWidth={2}
                        dot={{ fill: '#2A623C', strokeWidth: 1, r: 3 }}
                        activeDot={{ r: 5, fill: '#2A623C' }}
                      />
                    </LineChart>
                  ) : (
                    <BarChart data={getChartData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                      <XAxis 
                        dataKey="shortDate" 
                        tick={{ fontSize: 12 }}
                        interval={projectionDays <= 30 ? 1 : projectionDays <= 60 ? 6 : 6}
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => `$${value.toLocaleString()}`}
                        domain={['dataMin', 'dataMax']}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <ReferenceLine y={0} stroke="#374151" strokeWidth={2} />
                      <Bar 
                        dataKey="income" 
                        fill="#2A623C"
                        opacity={0.8}
                        name="Income"
                      />
                      <Bar 
                        dataKey="expenses" 
                        fill="#DC2626"
                        opacity={0.8}
                        name="Expenses"
                      />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Full Cashflow Table */}
            <div className="cashflow-table-section">
              <h3>Daily Breakdown</h3>
              <div className="cashflow-table">
                {getFilteredCashflowData().map((day, index) => (
                  <div key={index} className="cashflow-row">
                    <div className="cashflow-data">
                      <div className="date-col">
                        {day.date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })}
                      </div>
                      <div className="income-col">
                        Income: ${day.income.toFixed(2)}
                      </div>
                      <div className="expense-col">
                        Expenses: ${day.expenses.toFixed(2)}
                      </div>
                      <div className="balance-col">
                        Balance: <span className={day.runningBalance < 0 ? 'negative' : ''}>
                          ${Math.abs(day.runningBalance).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'insights' && (
        <div className="insights-layout">
          {/* Summary Metrics */}
          <div className="summary-metrics">
            {(() => {
              const data = getFlowBreakdownData()
              const netCashFlow = data.totalIncome - data.totalExpenses
              
              return (
                <>
                  <div className="metric-box">
                    <h3>Total Income</h3>
                    <div className="metric-value positive">${data.totalIncome.toFixed(0)}</div>
                    <div className="metric-period">Next {projectionDays} days</div>
                  </div>
                  <div className="metric-box">
                    <h3>Total Expenses</h3>
                    <div className="metric-value negative">${data.totalExpenses.toFixed(0)}</div>
                    <div className="metric-period">Next {projectionDays} days</div>
                  </div>
                  <div className="metric-box">
                    <h3>Net Cash Flow</h3>
                    <div className={`metric-value ${netCashFlow >= 0 ? 'positive' : 'negative'}`}>
                      ${Math.abs(netCashFlow).toFixed(0)}
                    </div>
                    <div className="metric-period">{netCashFlow >= 0 ? 'Surplus' : 'Deficit'}</div>
                  </div>
                </>
              )
            })()} 
          </div>
          
          {/* Sankey Diagram */}
          <div className="sankey-section">
            <div className="sankey-container">
              <h2>Cash Flow Visualization</h2>
              <p>Income sources flowing to expenses for the next {projectionDays} days</p>
              
              <div className="sankey-chart">
                {(() => {
                  try {
                    const sankeyData = getSankeyData()
                    console.log('Sankey data:', sankeyData) // Debug log
                    
                    // Show message if no data
                    if (sankeyData.links.length === 0) {
                      return (
                        <div className="sankey-placeholder">
                          <div className="placeholder-content">
                            <h3>No Flow Data Available</h3>
                            <p>Add income sources and expenses in the Inputs tab to see the cash flow visualization.</p>
                          </div>
                        </div>
                      )
                    }
                    
                    return (
                      <ResponsiveSankey
                        data={sankeyData}
                        margin={{ top: 40, right: 160, bottom: 40, left: 50 }}
                        align="justify"
                        colors={{ scheme: 'set2' }}
                        nodeOpacity={1}
                        nodeHoverOthersOpacity={0.35}
                        nodeThickness={18}
                        nodeSpacing={24}
                        nodeBorderWidth={0}
                        linkOpacity={0.5}
                        linkHoverOthersOpacity={0.1}
                        enableLinkGradient={true}
                        labelPosition="outside"
                        labelOrientation="vertical"
                        labelTextColor={{ from: 'color', modifiers: [['darker', 1]] }}
                      />
                    )
                  } catch (error) {
                    console.error('Sankey render error:', error)
                    return (
                      <div className="sankey-placeholder">
                        <div className="placeholder-content">
                          <h3>Visualization Unavailable</h3>
                          <p>There was an error loading the cash flow diagram. Please check your data inputs.</p>
                        </div>
                      </div>
                    )
                  }
                })()}
              </div>
            </div>
          </div>
          
          {/* Traditional Flow Breakdown */}
          <div className="flow-breakdown-section">
            <div className="flow-breakdown-container">
              <h2>Income vs Expenses Breakdown</h2>
              <p>Detailed breakdown for the next {projectionDays} days</p>
              
              <div className="flow-breakdown">
            {(() => {
              const data = getFlowBreakdownData()
              return (
                <>
                  <div className="flow-column">
                    <h3>Income Sources</h3>
                    {Object.entries(data.incomeBySource).map(([name, amount]) => {
                      const percentage = data.totalIncome > 0 ? ((amount / data.totalIncome) * 100).toFixed(1) : 0
                      return (
                        <div key={name} className="flow-item income-item-flow">
                          <div className="flow-label">{name}</div>
                          <div className="flow-amount">${amount.toFixed(0)} ({percentage}%)</div>
                        </div>
                      )
                    })}
                    <div className="flow-total">
                      Total Income: ${data.totalIncome.toFixed(0)}
                    </div>
                  </div>
                  
                  <div className="flow-column">
                    <h3>Expense Categories</h3>
                    {[
                      ...Object.entries(data.expensesByCategory).map(([name, amount]) => ({ name, amount, type: 'category' })),
                      ...Object.entries(data.creditCardExpenses).map(([name, amount]) => ({ name, amount, type: 'credit' })),
                      ...Object.entries(data.oneTimeExpensesByName).map(([name, amount]) => ({ name, amount, type: 'onetime' }))
                    ].map(({ name, amount, type }) => {
                      const percentage = data.totalExpenses > 0 ? ((amount / data.totalExpenses) * 100).toFixed(1) : 0
                      return (
                        <div key={name} className={`flow-item expense-item-flow ${type}`}>
                          <div className="flow-label">{name}</div>
                          <div className="flow-amount">${amount.toFixed(0)} ({percentage}%)</div>
                        </div>
                      )
                    })}
                    <div className="flow-total">
                      Total Expenses: ${data.totalExpenses.toFixed(0)}
                    </div>
                  </div>
                </>
              )
            })()}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Tagline Footer */}
      <div className="tagline-footer">
        <div className="tagline-subtitle">
          It's about the next {projectionDays} days, judgement free cashflow
        </div>
        <div className="tagline-main">
          {taglines[currentTaglineIndex]}
        </div>
      </div>
    </div>
  )
}

export default App
