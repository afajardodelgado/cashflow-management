import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('inputs')
  const [startingBalance, setStartingBalance] = useState(0)
  const [incomes, setIncomes] = useState([])
  const [creditCards, setCreditCards] = useState([])
  const [recurringExpenses, setRecurringExpenses] = useState([])
  const [oneTimeExpenses, setOneTimeExpenses] = useState([])

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
    }
  }, [])

  // Save data to localStorage whenever state changes
  useEffect(() => {
    const dataToSave = {
      startingBalance,
      incomes,
      creditCards,
      recurringExpenses,
      oneTimeExpenses
    }
    localStorage.setItem('cashflowData', JSON.stringify(dataToSave))
  }, [startingBalance, incomes, creditCards, recurringExpenses, oneTimeExpenses])

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
      autoPayment: true
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

  const calculateCashflow = () => {
    const today = new Date()
    const cashflowData = []
    
    // Create 90 days of projection
    for (let i = 0; i < 90; i++) {
      const currentDate = new Date(today)
      currentDate.setDate(today.getDate() + i)
      
      let dailyIncome = 0
      let dailyExpenses = 0
      
      // Calculate income for this date
      incomes.forEach(income => {
        if (income.nextPayDate && income.amount) {
          const payDate = new Date(income.nextPayDate)
          const daysDiff = Math.floor((currentDate - payDate) / (1000 * 60 * 60 * 24))
          
          let shouldPay = false
          if (income.frequency === 'weekly' && daysDiff >= 0 && daysDiff % 7 === 0) {
            shouldPay = true
          } else if (income.frequency === 'bi-weekly' && daysDiff >= 0 && daysDiff % 14 === 0) {
            shouldPay = true
          } else if (income.frequency === 'monthly' && daysDiff >= 0 && currentDate.getDate() === payDate.getDate()) {
            shouldPay = true
          }
          
          if (shouldPay) {
            dailyIncome += income.amount
          }
        }
      })
      
      // Calculate recurring expenses for this date
      recurringExpenses.forEach(expense => {
        if (expense.nextDueDate && expense.amount) {
          const dueDate = new Date(expense.nextDueDate)
          const daysDiff = Math.floor((currentDate - dueDate) / (1000 * 60 * 60 * 24))
          
          let shouldPay = false
          if (expense.frequency === 'weekly' && daysDiff >= 0 && daysDiff % 7 === 0) {
            shouldPay = true
          } else if (expense.frequency === 'bi-weekly' && daysDiff >= 0 && daysDiff % 14 === 0) {
            shouldPay = true
          } else if (expense.frequency === 'monthly' && daysDiff >= 0 && currentDate.getDate() === dueDate.getDate()) {
            shouldPay = true
          }
          
          if (shouldPay) {
            dailyExpenses += expense.amount
          }
        }
      })
      
      // Calculate credit card payments
      creditCards.forEach(card => {
        if (card.dueDate && card.balance && card.autoPayment) {
          const dueDate = new Date(card.dueDate)
          if (currentDate.toDateString() === dueDate.toDateString()) {
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

  const exportToCSV = () => {
    const cashflowData = calculateCashflow()
    
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
    <div className="container">
      <h1>Cashflow Management</h1>
      
      <nav className="nav-tabs mb-lg">
        <button 
          className={`nav-tab ${activeTab === 'inputs' ? 'active' : ''}`}
          onClick={() => setActiveTab('inputs')}
        >
          Inputs
        </button>
        <button 
          className={`nav-tab ${activeTab === 'projection' ? 'active' : ''}`}
          onClick={() => setActiveTab('projection')}
        >
          Projection
        </button>
        <button 
          className={`nav-tab ${activeTab === 'export' ? 'active' : ''}`}
          onClick={() => setActiveTab('export')}
        >
          Export
        </button>
      </nav>

      <main>
        {activeTab === 'inputs' && (
          <div className="flex flex-col gap-lg">
            <div className="card">
              <h2>Starting Balance</h2>
              <div className="flex gap-md">
                <input 
                  type="number" 
                  placeholder="$0.00" 
                  value={startingBalance || ''}
                  onChange={(e) => setStartingBalance(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="card">
              <h2>Income Sources</h2>
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
                    </select>
                    <input 
                      type="date" 
                      value={income.nextPayDate}
                      onChange={(e) => updateIncome(income.id, 'nextPayDate', e.target.value)}
                    />
                    <button onClick={() => removeIncome(income.id)}>Remove</button>
                  </div>
                </div>
              ))}
              
              <button onClick={addIncome}>+ Add Income</button>
            </div>

            <div className="card">
              <h2>Credit Cards</h2>
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
                    <input 
                      type="date" 
                      value={card.dueDate}
                      onChange={(e) => updateCreditCard(card.id, 'dueDate', e.target.value)}
                    />
                    <label className="flex gap-sm">
                      <input 
                        type="checkbox" 
                        checked={card.autoPayment}
                        onChange={(e) => updateCreditCard(card.id, 'autoPayment', e.target.checked)}
                      />
                      Auto-pay on due date
                    </label>
                    <button onClick={() => removeCreditCard(card.id)}>Remove</button>
                  </div>
                </div>
              ))}
              
              <button onClick={addCreditCard}>+ Add Credit Card</button>
            </div>

            <div className="card">
              <h2>Recurring Expenses</h2>
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
                    <button onClick={() => removeRecurringExpense(expense.id)}>Remove</button>
                  </div>
                </div>
              ))}
              
              <button onClick={addRecurringExpense}>+ Add Expense</button>
            </div>

            <div className="card">
              <h2>One-Time Expenses</h2>
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
                    <button onClick={() => removeOneTimeExpense(expense.id)}>Remove</button>
                  </div>
                </div>
              ))}
              
              <button onClick={addOneTimeExpense}>+ Add One-Time Expense</button>
            </div>
          </div>
        )}

        {activeTab === 'projection' && (
          <div className="card">
            <h2>90-Day Cashflow Projection</h2>
            <div className="metric-card mb-md">
              <strong>Starting Balance: ${startingBalance.toFixed(2)}</strong>
            </div>
            
            <div className="cashflow-table">
              {calculateCashflow().slice(0, 10).map((day, index) => (
                <div key={index} className="cashflow-row">
                  <div className="flex gap-md">
                    <div className="date-col">
                      {day.date.toLocaleDateString()}
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
              
              <div className="mt-md">
                <p><em>Showing first 10 days. Full 90-day projection available in CSV export.</em></p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'export' && (
          <div className="card">
            <h2>Export Data</h2>
            <p>Download your 90-day cashflow projections as a CSV file</p>
            <div className="metric-card mb-md">
              <strong>Export includes:</strong>
              <ul>
                <li>Daily dates for 90 days</li>
                <li>Income amounts per day</li>
                <li>Expense amounts per day</li>
                <li>Net change per day</li>
                <li>Running balance per day</li>
              </ul>
            </div>
            <button className="download" onClick={exportToCSV}>Download CSV</button>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
