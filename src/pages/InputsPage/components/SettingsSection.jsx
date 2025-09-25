import { useState } from 'react'
import { useFinancialContext } from '../../../context/FinancialContext'
import { exportInputsCSV, importInputsCSV } from '../../../services/export/csv'

const SettingsSection = () => {
  const { 
    startingBalance, 
    setStartingBalance,
    incomes,
    setIncomes,
    creditCards,
    setCreditCards,
    recurringExpenses,
    setRecurringExpenses,
    oneTimeExpenses,
    setOneTimeExpenses,
    projectionDays
  } = useFinancialContext()
  
  const [showHelpModal, setShowHelpModal] = useState(false)

  const exportInputData = () => {
    exportInputsCSV({
      startingBalance,
      incomes,
      creditCards,
      recurringExpenses,
      oneTimeExpenses,
      projectionDays
    })
  }

  const importInputData = async (event) => {
    const file = event.target.files[0]
    if (file) {
      const result = await importInputsCSV(file)
      if (result) {
        setIncomes(result.incomes)
        setCreditCards(result.creditCards)
        setRecurringExpenses(result.recurringExpenses)
        setOneTimeExpenses(result.oneTimeExpenses)
        setStartingBalance(result.startingBalance)
      }
    }
    event.target.value = ''
  }

  return (
    <>
      <div className="card">
        <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
          <h3 style={{ margin: 0 }}>Data Management</h3>
          <div className="flex gap-md" style={{ alignItems: 'center' }}>
            <button className="download" onClick={exportInputData} aria-label="Export input data as CSV file">
              Export Data
            </button>
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

      {showHelpModal && (
        <div className="modal-overlay" onClick={() => setShowHelpModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Data Storage & Privacy</h2>
              <button 
                className="modal-close" 
                onClick={() => setShowHelpModal(false)}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <h3>How Your Data is Stored</h3>
              <p>
                Your financial data is stored locally in your browser's localStorage. 
                This means:
              </p>
              <ul>
                <li>Data never leaves your device unless you export it</li>
                <li>No servers or third parties have access to your information</li>
                <li>Data persists between browser sessions on the same device</li>
                <li>Clearing browser data will delete your saved information</li>
              </ul>
              
              <h3>Best Practices</h3>
              <ul>
                <li>Regularly export your data as a backup</li>
                <li>Store exports securely on your device</li>
                <li>Be cautious when using shared computers</li>
              </ul>
              
              <h3>Data Export/Import</h3>
              <p>
                The Export feature creates a CSV file with all your input data. 
                You can import this file later to restore your settings, making it 
                easy to backup or transfer data between devices.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default SettingsSection