import { useState, useEffect, useMemo } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ComposedChart } from 'recharts'
import { ResponsiveSankey } from '@nivo/sankey'
import './App.css'
import { calculateCashflow } from './lib/cashflow.js'
import { getFlowBreakdownData, getSankeyData } from './lib/analysis.js'
import { exportProjectionCSV, exportInputsCSV, importInputsCSV } from './lib/csv.js'
import { formatShortDate, formatChartCurrency, formatNegativeCurrency } from './lib/format.js'
import { loadUserState, debouncedSaveUserState, saveUserState } from './lib/supabaseStorage.js'
import ChartErrorBoundary from './components/ChartErrorBoundary.jsx'
import SupabaseAuthGuard from './components/SupabaseAuthGuard.jsx'

function CashflowApp({ user, isGuest }) {
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
  const [saveStatus, setSaveStatus] = useState({ message: '', isSuccess: false, isLoading: false })

  // Handle keyboard navigation for tabs
  const handleTabKeyDown = (event, tabName) => {
    const tabs = ['inputs', 'projection', 'insights', 'export-pdf']
    const currentIndex = tabs.indexOf(activeTab)
    
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault()
        const prevIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1
        setActiveTab(tabs[prevIndex])
        break
      case 'ArrowRight':
        event.preventDefault()
        const nextIndex = currentIndex === tabs.length - 1 ? 0 : currentIndex + 1
        setActiveTab(tabs[nextIndex])
        break
      case 'Home':
        event.preventDefault()
        setActiveTab(tabs[0])
        break
      case 'End':
        event.preventDefault()
        setActiveTab(tabs[tabs.length - 1])
        break
    }
  }

  // Manual save function
  const handleManualSave = async () => {
    const userId = user ? user.userId : null
    const userEmail = user ? user.email : null
    
    setSaveStatus({ message: 'Saving...', isSuccess: false, isLoading: true })
    
    const currentState = {
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
    
    try {
      const result = await saveUserState(userId, userEmail, currentState)
      setSaveStatus({ 
        message: result.message, 
        isSuccess: result.success, 
        isLoading: false 
      })
      
      // Clear message after 3 seconds
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
  }

  // Load user-specific data on component mount
  useEffect(() => {
    const loadData = async () => {
      const userId = user ? user.userId : null
      const userEmail = user ? user.email : null
      const savedData = await loadUserState(userId, userEmail)
      
      if (savedData) {
        setStartingBalance(savedData.startingBalance || 0)
        setIncomes(savedData.incomes || [])
        setCreditCards(savedData.creditCards || [])
        setRecurringExpenses(savedData.recurringExpenses || [])
        setOneTimeExpenses(savedData.oneTimeExpenses || [])
        setProjectionDays(savedData.projectionDays || 30)
        setShowTransactionDaysOnly(savedData.showTransactionDaysOnly || false)
        setActiveTab(savedData.activeTab || 'inputs')
        setChartType(savedData.chartType || 'line')
      }
    }
    
    loadData()
  }, [user])

  // Save user-specific data whenever state changes (debounced)
  useEffect(() => {
    const userId = user ? user.userId : null
    const userEmail = user ? user.email : null
    debouncedSaveUserState(userId, userEmail, {
      startingBalance,
      incomes,
      creditCards,
      recurringExpenses,
      oneTimeExpenses,
      projectionDays,
      showTransactionDaysOnly,
      activeTab,
      chartType
    })
  }, [user, startingBalance, incomes, creditCards, recurringExpenses, oneTimeExpenses, projectionDays, showTransactionDaysOnly, activeTab, chartType])

  const addIncome = () => {
    setIncomes([...incomes, {
      id: crypto.randomUUID(),
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
      id: crypto.randomUUID(),
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
      id: crypto.randomUUID(),
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
      id: crypto.randomUUID(),
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

  // Memoized cashflow data calculation
  const getCashflowData = useMemo(() => {
    return calculateCashflow(startingBalance, incomes, creditCards, recurringExpenses, oneTimeExpenses, projectionDays)
  }, [startingBalance, incomes, creditCards, recurringExpenses, oneTimeExpenses, projectionDays])

  // Memoized chart data calculation
  const getChartData = useMemo(() => {
    const cashflowData = getCashflowData
    let filteredData = cashflowData
    
    // Filter to show only transaction days if toggle is enabled
    if (showTransactionDaysOnly) {
      filteredData = cashflowData.filter(day => day.income > 0 || day.expenses > 0)
    }
    
    return filteredData.map((day, index) => ({
      day: index + 1,
      date: day.date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' }),
      shortDate: formatShortDate(day.date),
      balance: day.runningBalance,
      income: day.income,
      expenses: -day.expenses, // Negative for waterfall chart (goes down from zero)
      netChange: day.netChange
    }))
  }, [getCashflowData, showTransactionDaysOnly])

  // Memoized filtered cashflow data for table display
  const getFilteredCashflowData = useMemo(() => {
    const cashflowData = getCashflowData
    if (showTransactionDaysOnly) {
      return cashflowData.filter(day => day.income > 0 || day.expenses > 0)
    }
    return cashflowData
  }, [getCashflowData, showTransactionDaysOnly])

  // Memoized estimated balance calculation
  const getEstimatedBalance = useMemo(() => {
    const cashflowData = getCashflowData
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
  }, [getCashflowData, startingBalance])

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

  // Memoized flow breakdown calculation
  const getFlowBreakdown = useMemo(() => {
    return getFlowBreakdownData(incomes, recurringExpenses, creditCards, oneTimeExpenses, projectionDays)
  }, [incomes, recurringExpenses, creditCards, oneTimeExpenses, projectionDays])

  // Memoized Sankey diagram data
  const getSankeyDiagramData = useMemo(() => {
    const flowData = getFlowBreakdown
    return getSankeyData(flowData)
  }, [getFlowBreakdown])


  const exportToCSV = () => {
    exportProjectionCSV(getFilteredCashflowData)
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
    exportInputsCSV(inputData)
  }

  const importInputData = (event) => {
    const file = event.target.files[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const csvContent = e.target.result
        const importedData = importInputsCSV(csvContent)
        
        // Update state with imported data
        setStartingBalance(importedData.startingBalance)
        setProjectionDays(importedData.projectionDays)
        setIncomes(importedData.incomes)
        setCreditCards(importedData.creditCards)
        setRecurringExpenses(importedData.recurringExpenses)
        setOneTimeExpenses(importedData.oneTimeExpenses)
        
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
  

  return (
    <div className="app-container">
      {/* Tab Navigation with Save Button */}
      <div className="tab-navigation-wrapper">
        <div className="tab-navigation" role="tablist" aria-label="Cashflow management sections">
        <button 
          role="tab"
          id="tab-inputs"
          aria-controls="panel-inputs"
          aria-selected={activeTab === 'inputs'}
          tabIndex={activeTab === 'inputs' ? 0 : -1}
          className={`tab-button ${activeTab === 'inputs' ? 'active' : ''}`}
          onClick={() => setActiveTab('inputs')}
          onKeyDown={(e) => handleTabKeyDown(e, 'inputs')}
        >
          Inputs
        </button>
        <button 
          role="tab"
          id="tab-projection"
          aria-controls="panel-projection"
          aria-selected={activeTab === 'projection'}
          tabIndex={activeTab === 'projection' ? 0 : -1}
          className={`tab-button ${activeTab === 'projection' ? 'active' : ''}`}
          onClick={() => setActiveTab('projection')}
          onKeyDown={(e) => handleTabKeyDown(e, 'projection')}
        >
          Projection
        </button>
        <button 
          role="tab"
          id="tab-insights"
          aria-controls="panel-insights"
          aria-selected={activeTab === 'insights'}
          tabIndex={activeTab === 'insights' ? 0 : -1}
          className={`tab-button ${activeTab === 'insights' ? 'active' : ''}`}
          onClick={() => setActiveTab('insights')}
          onKeyDown={(e) => handleTabKeyDown(e, 'insights')}
        >
          Insights
        </button>
        <button 
          role="tab"
          id="tab-export-pdf"
          aria-controls="panel-export-pdf"
          aria-selected={activeTab === 'export-pdf'}
          tabIndex={activeTab === 'export-pdf' ? 0 : -1}
          className={`tab-button ${activeTab === 'export-pdf' ? 'active' : ''}`}
          onClick={() => setActiveTab('export-pdf')}
          onKeyDown={(e) => handleTabKeyDown(e, 'export-pdf')}
        >
          Export to PDF
        </button>
        </div>
        
        {/* Manual Save Button */}
        <div className="save-section">
          <button 
            className={`save-button ${saveStatus.isLoading ? 'loading' : ''} ${saveStatus.isSuccess ? 'success' : ''}`}
            onClick={handleManualSave}
            disabled={saveStatus.isLoading}
          >
            {saveStatus.isLoading ? 'Saving...' : 'Save'}
          </button>
          {saveStatus.message && (
            <div className={`save-status ${saveStatus.isSuccess ? 'success' : 'error'}`}>
              {saveStatus.message}
            </div>
          )}
        </div>
      </div>
      
      {activeTab === 'inputs' && (
      <div role="tabpanel" id="panel-inputs" aria-labelledby="tab-inputs" className="main-layout">
        {/* Left Panel - Inputs */}
        <div className="inputs-panel">
          <h2>Inputs</h2>
          
          <div className="card">
            <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
              <h3 style={{ margin: 0 }}>Data Management</h3>
              <div className="flex gap-md" style={{ alignItems: 'center' }}>
                <button className="download" onClick={exportInputData} aria-label="Export input data as CSV file">Export Data</button>
                <button 
                  className="download" 
                  onClick={() => document.getElementById('import-file-input').click()}
                  aria-label="Import input data from CSV file"
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
            <label htmlFor="starting-balance">
              <h3>Starting Balance</h3>
            </label>
            <input 
              id="starting-balance"
              type="number" 
              placeholder="$0.00" 
              value={startingBalance || ''}
              onChange={(e) => setStartingBalance(parseFloat(e.target.value) || 0)}
              aria-describedby="starting-balance-desc"
            />
            <div id="starting-balance-desc" className="sr-only">
              Enter your current account balance in dollars
            </div>
          </div>

          <div className="card">
            <h3>Income Sources</h3>
            <p>Add salary and other income sources</p>
            
            {incomes.map(income => (
              <div key={income.id} className="income-item mb-md">
                <div className="flex gap-md mb-sm">
                  <div className="input-group">
                    <label htmlFor={`income-name-${income.id}`}>Income Name:</label>
                    <input 
                      id={`income-name-${income.id}`}
                      type="text" 
                      placeholder="e.g., Salary, Freelance"
                      value={income.name}
                      onChange={(e) => updateIncome(income.id, 'name', e.target.value)}
                      aria-describedby={`income-name-desc-${income.id}`}
                    />
                    <div id={`income-name-desc-${income.id}`} className="sr-only">
                      Name for this income source
                    </div>
                  </div>
                  <div className="input-group">
                    <label htmlFor={`income-amount-${income.id}`}>Amount:</label>
                    <input 
                      id={`income-amount-${income.id}`}
                      type="number" 
                      placeholder="0.00"
                      value={income.amount || ''}
                      onChange={(e) => updateIncome(income.id, 'amount', parseFloat(e.target.value) || 0)}
                      aria-describedby={`income-amount-desc-${income.id}`}
                    />
                    <div id={`income-amount-desc-${income.id}`} className="sr-only">
                      Dollar amount for this income source
                    </div>
                  </div>
                </div>
                <div className="flex gap-md mb-sm">
                  <div className="input-group">
                    <label htmlFor={`income-frequency-${income.id}`} className="sr-only">Payment Frequency</label>
                    <select 
                      id={`income-frequency-${income.id}`}
                      value={income.frequency} 
                      onChange={(e) => updateIncome(income.id, 'frequency', e.target.value)}
                      aria-label="Payment frequency"
                    >
                      <option value="weekly">Weekly</option>
                      <option value="bi-weekly">Bi-weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="15th-and-last">15th and Last of Month</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label htmlFor={`income-date-${income.id}`} className="sr-only">Next Payment Date</label>
                    <input 
                      id={`income-date-${income.id}`}
                      type="date" 
                      value={income.nextPayDate}
                      onChange={(e) => updateIncome(income.id, 'nextPayDate', e.target.value)}
                      aria-label="Next payment date"
                    />
                  </div>
                  <button 
                    className="remove-btn" 
                    onClick={() => removeIncome(income.id)}
                    aria-label={`Remove ${income.name || 'income source'}`}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            
            <button className="add-button" onClick={addIncome} aria-label="Add new income source">+ Add Income</button>
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
                    Warning: Pay date is after due date - this may incur late fees!
                  </div>
                )}
              </div>
            ))}
            
            <button className="add-button" onClick={addCreditCard} aria-label="Add new credit card">+ Add Credit Card</button>
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
            
            <button className="add-button" onClick={addRecurringExpense} aria-label="Add new recurring expense">+ Add Expense</button>
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
            
            <button className="add-button" onClick={addOneTimeExpense} aria-label="Add new one-time expense">+ Add One-Time Expense</button>
          </div>
        </div>

        {/* Right Panel - Projection */}
        <div className="projection-panel">
          <div className="projection-header">
            <h2>Cashflow Projection</h2>
            <button className="download" onClick={exportToCSV}>Export Cashflow CSV</button>
          </div>
          
          {/* Balance Summary */}
          <div className="balance-summary mb-md">
            <div className="metric-card">
              <div className="balance-label">Starting Balance</div>
              <div className="balance-amount">${startingBalance.toFixed(2)}</div>
            </div>
            <div className="metric-card">
              {(() => {
                const estimated = getEstimatedBalance
                const month = estimated.date.getMonth() + 1
                const day = estimated.date.getDate()
                const shortDate = `${month}/${day}`
                const balanceText = estimated.balance < 0 ? 
                  `($${Math.abs(estimated.balance).toFixed(2)})` : 
                  `$${estimated.balance.toFixed(2)}`
                return (
                  <>
                    <div className="balance-label">Estimated Balance on {shortDate}</div>
                    <div className={`balance-amount ${estimated.balance < 0 ? 'negative' : ''}`}>
                      {balanceText}
                    </div>
                  </>
                )
              })()} 
            </div>
          </div>

          {/* Projection Controls */}
          <div className="projection-controls mb-lg">
            <div className="control-group">
              <label htmlFor="projectionDays">Days to Show:</label>
              <select 
                id="projectionDays"
                value={projectionDays} 
                onChange={(e) => setProjectionDays(parseInt(e.target.value))}
                aria-describedby="projection-days-desc"
              >
                <option value={15}>Next 15 Days</option>
                <option value={30}>Next 30 Days</option>
                <option value={60}>Next 60 Days</option>
                <option value={90}>Next 90 Days</option>
              </select>
              <div id="projection-days-desc" className="sr-only">
                Select how many days to project into the future
              </div>
            </div>
            <div className="control-group">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={showTransactionDaysOnly}
                  onChange={(e) => setShowTransactionDaysOnly(e.target.checked)}
                  aria-describedby="transaction-days-desc"
                />
                Show Only Transaction Days
              </label>
              <div id="transaction-days-desc" className="sr-only">
                Filter to show only days with income or expenses
              </div>
            </div>
            <div className="control-group">
              <label htmlFor="chartType">Chart Type:</label>
              <select 
                id="chartType"
                value={chartType} 
                onChange={(e) => setChartType(e.target.value)}
                aria-describedby="chart-type-desc"
              >
                <option value="line">Line Chart</option>
                <option value="bar">Bar Chart</option>
              </select>
              <div id="chart-type-desc" className="sr-only">
                Choose between line or bar chart visualization
              </div>
            </div>
          </div>
          
          {/* Cashflow Graph */}
          <div className="cashflow-graph mb-lg">
            <h3 id="balance-trend-heading">Balance Trend</h3>
            <div className="chart-container" role="img" aria-labelledby="balance-trend-heading" aria-describedby="balance-trend-desc">
              <div id="balance-trend-desc" className="sr-only">
                Interactive chart showing projected account balance over time with income and expenses
              </div>
              <ChartErrorBoundary>
                <ResponsiveContainer width="100%" height={300}>
                  {chartType === 'line' ? (
                    <LineChart data={getChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                      <XAxis 
                        dataKey="shortDate" 
                        tick={{ fontSize: 12 }}
                        interval={projectionDays <= 30 ? 1 : projectionDays <= 60 ? 6 : 6}
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        tickFormatter={formatChartCurrency}
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
                    <BarChart data={getChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                      <XAxis 
                        dataKey="shortDate" 
                        tick={{ fontSize: 12 }}
                        interval={projectionDays <= 30 ? 1 : projectionDays <= 60 ? 6 : 6}
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        tickFormatter={formatChartCurrency}
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
              </ChartErrorBoundary>
            </div>
          </div>
          
          {/* Full Cashflow Table */}
          <div className="cashflow-table-section">
            <h3 id="daily-breakdown-heading">Daily Breakdown</h3>
            <div 
              className="cashflow-table" 
              role="table" 
              aria-labelledby="daily-breakdown-heading"
              aria-describedby="daily-breakdown-desc"
            >
              <div id="daily-breakdown-desc" className="sr-only">
                Table showing daily income, expenses, and running balance for each day in the projection period
              </div>
              {getFilteredCashflowData.map((day, index) => (
                <div key={index} className="cashflow-row" role="row">
                  <div className="cashflow-data">
                    <div className="date-col" role="cell" aria-label={`Date: ${day.date.toLocaleDateString()}`}>
                      {day.date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })}
                    </div>
                    <div className="income-col" role="cell" aria-label={`Income: $${day.income.toFixed(2)}`}>
                      Income: ${day.income.toFixed(2)}
                    </div>
                    <div className="expense-col" role="cell" aria-label={`Expenses: $${day.expenses.toFixed(2)}`}>
                      Expenses: ${day.expenses.toFixed(2)}
                    </div>
                    <div className="balance-col" role="cell" aria-label={`Running balance: ${day.runningBalance < 0 ? 'negative ' : ''}$${Math.abs(day.runningBalance).toFixed(2)}`}>
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
        <div role="tabpanel" id="panel-projection" aria-labelledby="tab-projection" className="projection-layout">
          <div className="projection-panel">
            <div className="projection-header">
              <h2>Cashflow Projection</h2>
              <button className="download" onClick={exportToCSV} aria-label="Export cashflow projection data as CSV file">Export Cashflow CSV</button>
            </div>
            
            {/* Balance Summary */}
            <div className="balance-summary mb-md">
              <div className="metric-card">
                <div className="balance-label">Starting Balance</div>
                <div className="balance-amount">${startingBalance.toFixed(2)}</div>
              </div>
              <div className="metric-card">
                {(() => {
                  const estimated = getEstimatedBalance
                  const month = estimated.date.getMonth() + 1
                  const day = estimated.date.getDate()
                  const shortDate = `${month}/${day}`
                  const balanceText = estimated.balance < 0 ? 
                    `($${Math.abs(estimated.balance).toFixed(2)})` : 
                    `$${estimated.balance.toFixed(2)}`
                  return (
                    <>
                      <div className="balance-label">Estimated Balance on {shortDate}</div>
                      <div className={`balance-amount ${estimated.balance < 0 ? 'negative' : ''}`}>
                        {balanceText}
                      </div>
                    </>
                  )
                })()} 
              </div>
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
                <ChartErrorBoundary>
                  <ResponsiveContainer width="100%" height={300}>
                    {chartType === 'line' ? (
                      <LineChart data={getChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                        <XAxis 
                          dataKey="shortDate" 
                          tick={{ fontSize: 12 }}
                          interval={projectionDays <= 30 ? 1 : projectionDays <= 60 ? 6 : 6}
                        />
                        <YAxis 
                          tick={{ fontSize: 12 }}
                          tickFormatter={formatChartCurrency}
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
                      <BarChart data={getChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                        <XAxis 
                          dataKey="shortDate" 
                          tick={{ fontSize: 12 }}
                          interval={projectionDays <= 30 ? 1 : projectionDays <= 60 ? 6 : 6}
                        />
                        <YAxis 
                          tick={{ fontSize: 12 }}
                          tickFormatter={formatChartCurrency}
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
                </ChartErrorBoundary>
              </div>
            </div>
            
            {/* Full Cashflow Table */}
            <div className="cashflow-table-section">
              <h3>Daily Breakdown</h3>
              <div className="cashflow-table">
                {getFilteredCashflowData.map((day, index) => (
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
        <div role="tabpanel" id="panel-insights" aria-labelledby="tab-insights" className="insights-layout">
          {/* Summary Metrics */}
          <div className="summary-metrics">
            {(() => {
              const data = getFlowBreakdown
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
                    const sankeyData = getSankeyDiagramData
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
                      <ChartErrorBoundary>
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
                      </ChartErrorBoundary>
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
              const data = getFlowBreakdown
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

// Main App component with authentication
function App() {
  return (
    <SupabaseAuthGuard>
      {({ user, isGuest }) => (
        <CashflowApp user={user} isGuest={isGuest} />
      )}
    </SupabaseAuthGuard>
  )
}

export default App
