import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import './App.css'

function App() {
  const [startingBalance, setStartingBalance] = useState(0)
  const [incomes, setIncomes] = useState([])
  const [creditCards, setCreditCards] = useState([])
  const [recurringExpenses, setRecurringExpenses] = useState([])
  const [oneTimeExpenses, setOneTimeExpenses] = useState([])
  const [projectionDays, setProjectionDays] = useState(30)
  const [showTransactionDaysOnly, setShowTransactionDaysOnly] = useState(false)

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('cashflowData')
    if (savedData) {
      const data = JSON.parse(savedData)
      setStartingBalance(data.startingBalance || 0)
      setIncomes(data.incomes || [])
      setCreditCards(data.creditCards || [])
      setRecurringExpenses(data.recurringExpenses || [])
      setOneTimeExpenses(data.oneTimeExpenses || [])
      setProjectionDays(data.projectionDays || 30)
      setShowTransactionDaysOnly(data.showTransactionDaysOnly || false)
    }
  }, [])

  // Save data to localStorage whenever state changes
  useEffect(() => {
    const dataToSave = {
      startingBalance,
      incomes,
      creditCards,
      recurringExpenses,
      oneTimeExpenses,
      projectionDays,
      showTransactionDaysOnly
    }
    localStorage.setItem('cashflowData', JSON.stringify(dataToSave))
  }, [startingBalance, incomes, creditCards, recurringExpenses, oneTimeExpenses, projectionDays, showTransactionDaysOnly])

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
      balance: day.runningBalance,
      income: day.income,
      expenses: day.expenses,
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
      return (
        <div className="chart-tooltip">
          <p className="tooltip-date">{`Day ${label}: ${data.date}`}</p>
          <p className="tooltip-balance">
            Balance: <span className={data.balance < 0 ? 'negative' : 'positive'}>
              ${data.balance < 0 ? '(' + Math.abs(data.balance).toFixed(2) + ')' : data.balance.toFixed(2)}
            </span>
          </p>
          <p className="tooltip-income">Income: ${data.income.toFixed(2)}</p>
          <p className="tooltip-expenses">Expenses: ${data.expenses.toFixed(2)}</p>
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

  return (
    <div className="app-container">
      
      <div className="main-layout">
        {/* Left Panel - Inputs */}
        <div className="inputs-panel">
          <h2>Inputs</h2>
          
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
                  <input 
                    type="text" 
                    placeholder="Income name (e.g., Salary)"
                    value={income.name}
                    onChange={(e) => updateIncome(income.id, 'name', e.target.value)}
                  />
                  <input 
                    type="number" 
                    placeholder="Amount"
                    value={income.amount || ''}
                    onChange={(e) => updateIncome(income.id, 'amount', parseFloat(e.target.value) || 0)}
                  />
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
            
            <button onClick={addIncome}>+ Add Income</button>
          </div>

          <div className="card">
            <h3>Credit Cards</h3>
            <p>Track credit card balances and due dates</p>
            
            {creditCards.map(card => (
              <div key={card.id} className="income-item mb-md">
                <div className="flex gap-md mb-sm">
                  <input 
                    type="text" 
                    placeholder="Card name (e.g., Chase Sapphire)"
                    value={card.name}
                    onChange={(e) => updateCreditCard(card.id, 'name', e.target.value)}
                  />
                  <input 
                    type="number" 
                    placeholder="Balance"
                    value={card.balance || ''}
                    onChange={(e) => updateCreditCard(card.id, 'balance', parseFloat(e.target.value) || 0)}
                  />
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
            
            <button onClick={addCreditCard}>+ Add Credit Card</button>
          </div>

          <div className="card">
            <h3>Recurring Expenses</h3>
            <p>Monthly bills like rent, car payments, utilities</p>
            
            {recurringExpenses.map(expense => (
              <div key={expense.id} className="income-item mb-md">
                <div className="flex gap-md mb-sm">
                  <input 
                    type="text" 
                    placeholder="Expense name (e.g., Rent)"
                    value={expense.name}
                    onChange={(e) => updateRecurringExpense(expense.id, 'name', e.target.value)}
                  />
                  <input 
                    type="number" 
                    placeholder="Amount"
                    value={expense.amount || ''}
                    onChange={(e) => updateRecurringExpense(expense.id, 'amount', parseFloat(e.target.value) || 0)}
                  />
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
            
            <button onClick={addRecurringExpense}>+ Add Expense</button>
          </div>

          <div className="card">
            <h3>One-Time Expenses</h3>
            <p>Future expenses like vacations, repairs</p>
            
            {oneTimeExpenses.map(expense => (
              <div key={expense.id} className="income-item mb-md">
                <div className="flex gap-md mb-sm">
                  <input 
                    type="text" 
                    placeholder="Expense name (e.g., Vacation)"
                    value={expense.name}
                    onChange={(e) => updateOneTimeExpense(expense.id, 'name', e.target.value)}
                  />
                  <input 
                    type="number" 
                    placeholder="Amount"
                    value={expense.amount || ''}
                    onChange={(e) => updateOneTimeExpense(expense.id, 'amount', parseFloat(e.target.value) || 0)}
                  />
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
            
            <button onClick={addOneTimeExpense}>+ Add One-Time Expense</button>
          </div>
        </div>

        {/* Right Panel - Projection */}
        <div className="projection-panel">
          <div className="projection-header">
            <h2>Cashflow Projection</h2>
            <button className="download" onClick={exportToCSV}>Export CSV</button>
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
                <LineChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                  <XAxis 
                    dataKey="day" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(day) => `Day ${day}`}
                    interval="preserveStartEnd"
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
      
      {/* Flow Breakdown - Full Width Bottom Section */}
      <div className="sankey-section">
        <div className="sankey-container">
          <h2>Income vs Expenses Breakdown</h2>
          <p>Totals for the next {projectionDays} days</p>
          
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
  )
}

export default App
