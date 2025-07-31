import { useState } from 'react'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('inputs')

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
                <input type="number" placeholder="$0.00" />
              </div>
            </div>

            <div className="card">
              <h2>Income Sources</h2>
              <p>Add salary and other income sources</p>
              <button>+ Add Income</button>
            </div>

            <div className="card">
              <h2>Credit Cards</h2>
              <p>Track credit card balances and due dates</p>
              <button>+ Add Credit Card</button>
            </div>

            <div className="card">
              <h2>Recurring Expenses</h2>
              <p>Monthly bills like rent, car payments, utilities</p>
              <button>+ Add Expense</button>
            </div>

            <div className="card">
              <h2>One-Time Expenses</h2>
              <p>Future expenses like vacations, repairs</p>
              <button>+ Add One-Time Expense</button>
            </div>
          </div>
        )}

        {activeTab === 'projection' && (
          <div className="card">
            <h2>90-Day Cashflow Projection</h2>
            <p>Your projected daily cashflow will appear here</p>
            <div className="metric-card">
              <strong>Current Balance: $0.00</strong>
            </div>
          </div>
        )}

        {activeTab === 'export' && (
          <div className="card">
            <h2>Export Data</h2>
            <p>Download your cashflow projections</p>
            <button className="download">Download CSV</button>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
