import { useFinancialContext } from '../../../context/FinancialContext'

const ExpenseSection = () => {
  const { 
    recurringExpenses, 
    addRecurringExpense, 
    updateRecurringExpense, 
    deleteRecurringExpense,
    oneTimeExpenses,
    addOneTimeExpense,
    updateOneTimeExpense,
    deleteOneTimeExpense
  } = useFinancialContext()

  const handleUpdateRecurringExpense = (id, field, value) => {
    updateRecurringExpense(id, { [field]: value })
  }

  const handleUpdateOneTimeExpense = (id, field, value) => {
    updateOneTimeExpense(id, { [field]: value })
  }

  return (
    <>
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
                  onChange={(e) => handleUpdateRecurringExpense(expense.id, 'name', e.target.value)}
                />
              </div>
              <div className="input-group">
                <label>Amount:</label>
                <input 
                  type="number" 
                  placeholder="0.00"
                  value={expense.amount || ''}
                  onChange={(e) => handleUpdateRecurringExpense(expense.id, 'amount', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
            <div className="flex gap-md mb-sm">
              <select 
                value={expense.category} 
                onChange={(e) => handleUpdateRecurringExpense(expense.id, 'category', e.target.value)}
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
                onChange={(e) => handleUpdateRecurringExpense(expense.id, 'frequency', e.target.value)}
              >
                <option value="weekly">Weekly</option>
                <option value="bi-weekly">Bi-weekly</option>
                <option value="monthly">Monthly</option>
              </select>
              <input 
                type="date" 
                value={expense.nextDueDate}
                onChange={(e) => handleUpdateRecurringExpense(expense.id, 'nextDueDate', e.target.value)}
              />
              <button 
                className="remove-btn" 
                onClick={() => deleteRecurringExpense(expense.id)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
        
        <button 
          className="add-button" 
          onClick={() => addRecurringExpense({
            name: '',
            amount: 0,
            category: 'Housing',
            frequency: 'monthly',
            nextDueDate: new Date().toISOString().split('T')[0]
          })} 
          aria-label="Add new recurring expense"
        >
          + Add Expense
        </button>
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
                  onChange={(e) => handleUpdateOneTimeExpense(expense.id, 'name', e.target.value)}
                />
              </div>
              <div className="input-group">
                <label>Amount:</label>
                <input 
                  type="number" 
                  placeholder="0.00"
                  value={expense.amount || ''}
                  onChange={(e) => handleUpdateOneTimeExpense(expense.id, 'amount', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
            <div className="flex gap-md mb-sm">
              <select 
                value={expense.category} 
                onChange={(e) => handleUpdateOneTimeExpense(expense.id, 'category', e.target.value)}
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
                onChange={(e) => handleUpdateOneTimeExpense(expense.id, 'date', e.target.value)}
              />
              <button 
                className="remove-btn" 
                onClick={() => deleteOneTimeExpense(expense.id)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
        
        <button 
          className="add-button" 
          onClick={() => addOneTimeExpense({
            name: '',
            amount: 0,
            category: 'Travel',
            date: new Date().toISOString().split('T')[0]
          })} 
          aria-label="Add new one-time expense"
        >
          + Add One-Time Expense
        </button>
      </div>
    </>
  )
}

export default ExpenseSection