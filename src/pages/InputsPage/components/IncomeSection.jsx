import { useFinancialContext } from '../../../context/FinancialContext'

const IncomeSection = () => {
  const { incomes, addIncome, updateIncome, deleteIncome } = useFinancialContext()

  const handleUpdateIncome = (id, field, value) => {
    updateIncome(id, { [field]: value })
  }

  return (
    <div className="card">
      <h3>Income Sources</h3>
      <p>Add salary and other income sources</p>
      
      {incomes.map(income => (
        <div key={income.id} className="income-item mb-md">
          <div className="income-grid mb-sm">
            <div className="input-group">
              <label htmlFor={`income-name-${income.id}`}>Income Name:</label>
              <input 
                id={`income-name-${income.id}`}
                type="text" 
                placeholder="e.g., Salary, Freelance"
                value={income.name}
                onChange={(e) => handleUpdateIncome(income.id, 'name', e.target.value)}
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
                onChange={(e) => handleUpdateIncome(income.id, 'amount', parseFloat(e.target.value) || 0)}
                aria-describedby={`income-amount-desc-${income.id}`}
              />
              <div id={`income-amount-desc-${income.id}`} className="sr-only">
                Dollar amount for this income source
              </div>
            </div>
            <button 
              className="remove-btn" 
              onClick={() => deleteIncome(income.id)}
              aria-label={`Remove ${income.name || 'income source'}`}
            >
              Remove
            </button>
            <div className="input-group">
              <label htmlFor={`income-frequency-${income.id}`}>Frequency</label>
              <select 
                id={`income-frequency-${income.id}`}
                value={income.frequency} 
                onChange={(e) => handleUpdateIncome(income.id, 'frequency', e.target.value)}
                aria-label="Payment frequency"
              >
                <option value="weekly">Weekly</option>
                <option value="bi-weekly">Bi-weekly</option>
                <option value="monthly">Monthly</option>
                <option value="15th-and-last">15th and Last of Month</option>
                <option value="one-time">One Time</option>
              </select>
            </div>
            <div className="input-group">
              <label htmlFor={`income-date-${income.id}`}>Date</label>
              <input 
                id={`income-date-${income.id}`}
                type="date" 
                value={income.nextPayDate}
                onChange={(e) => handleUpdateIncome(income.id, 'nextPayDate', e.target.value)}
                aria-label="Next payment date"
              />
            </div>
          </div>
        </div>
      ))}
      
      <button 
        className="add-button" 
        onClick={() => addIncome({ 
          name: '', 
          amount: 0, 
          frequency: 'monthly', 
          nextPayDate: new Date().toISOString().split('T')[0] 
        })} 
        aria-label="Add new income source"
      >
        + Add Income
      </button>
    </div>
  )
}

export default IncomeSection