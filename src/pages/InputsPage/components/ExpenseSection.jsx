import { useState } from 'react'
import { useFinancialContext } from '../../../context/FinancialContext'
import { isValidName } from '../../../lib/validation'
import ToggleSwitch from '../../../components/ToggleSwitch'
import ConfirmDialog from '../../../components/ConfirmDialog'

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

  const [confirmDeleteRecurring, setConfirmDeleteRecurring] = useState(null)
  const [confirmDeleteOneTime, setConfirmDeleteOneTime] = useState(null)

  const handleUpdateRecurringExpense = (id, field, value) => {
    // Validate name field - reject purely numeric values
    if (field === 'name' && !isValidName(value)) {
      return // Don't update if name is purely numeric
    }
    updateRecurringExpense(id, { [field]: value })
  }

  const handleUpdateOneTimeExpense = (id, field, value) => {
    // Validate name field - reject purely numeric values
    if (field === 'name' && !isValidName(value)) {
      return // Don't update if name is purely numeric
    }
    updateOneTimeExpense(id, { [field]: value })
  }

  const handleDeleteRecurringClick = (expense) => {
    setConfirmDeleteRecurring(expense)
  }

  const handleConfirmDeleteRecurring = () => {
    if (confirmDeleteRecurring) {
      deleteRecurringExpense(confirmDeleteRecurring.id)
      setConfirmDeleteRecurring(null)
    }
  }

  const handleCancelDeleteRecurring = () => {
    setConfirmDeleteRecurring(null)
  }

  const handleDeleteOneTimeClick = (expense) => {
    setConfirmDeleteOneTime(expense)
  }

  const handleConfirmDeleteOneTime = () => {
    if (confirmDeleteOneTime) {
      deleteOneTimeExpense(confirmDeleteOneTime.id)
      setConfirmDeleteOneTime(null)
    }
  }

  const handleCancelDeleteOneTime = () => {
    setConfirmDeleteOneTime(null)
  }

  return (
    <>
      <div className="card">
        <h3>Recurring Expenses</h3>
        <p>Monthly bills like rent, car payments, utilities</p>
        
        {recurringExpenses.map(expense => (
          <div key={expense.id} className="income-item mb-md">
            <div className="income-grid mb-sm">
              <div className="input-group">
                <label htmlFor={`rec-name-${expense.id}`}>Expense Name:</label>
                <input 
                  id={`rec-name-${expense.id}`}
                  type="text" 
                  placeholder="e.g., Rent, Car Payment"
                  value={expense.name}
                  onChange={(e) => handleUpdateRecurringExpense(expense.id, 'name', e.target.value)}
                />
              </div>
              <div className="input-group">
                <label htmlFor={`rec-amount-${expense.id}`}>Amount:</label>
                <input 
                  id={`rec-amount-${expense.id}`}
                  type="number" 
                  placeholder="0.00"
                  value={expense.amount || ''}
                  onChange={(e) => handleUpdateRecurringExpense(expense.id, 'amount', parseFloat(e.target.value) || 0)}
                />
              </div>
              <button 
                className="remove-btn" 
                onClick={() => handleDeleteRecurringClick(expense)}
              >
                Remove
              </button>
              <div className="input-group">
                <label htmlFor={`rec-category-${expense.id}`}>Category</label>
                <select 
                  id={`rec-category-${expense.id}`}
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
              </div>
              <div className="input-group">
                <label htmlFor={`rec-frequency-${expense.id}`}>Frequency</label>
                <select 
                  id={`rec-frequency-${expense.id}`}
                  value={expense.frequency} 
                  onChange={(e) => handleUpdateRecurringExpense(expense.id, 'frequency', e.target.value)}
                >
                  <option value="weekly">Weekly</option>
                  <option value="bi-weekly">Bi-weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="15th-and-last">15th and Last of Month</option>
                </select>
              </div>
              <div className="input-group">
                <label htmlFor={`rec-date-${expense.id}`}>Date</label>
                <input 
                  id={`rec-date-${expense.id}`}
                  type="date" 
                  value={expense.nextDueDate}
                  onChange={(e) => handleUpdateRecurringExpense(expense.id, 'nextDueDate', e.target.value)}
                />
              </div>
            </div>
            <div className="toggle-wrapper">
              <ToggleSwitch
                id={`rec-active-${expense.id}`}
                checked={expense.isActive !== false}
                onChange={(e) => handleUpdateRecurringExpense(expense.id, 'isActive', e.target.checked)}
                label="Active"
              />
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
            <div className="income-grid mb-sm">
              <div className="input-group">
                <label htmlFor={`ot-name-${expense.id}`}>Expense Name:</label>
                <input 
                  id={`ot-name-${expense.id}`}
                  type="text" 
                  placeholder="e.g., Vacation, Car Repair"
                  value={expense.name}
                  onChange={(e) => handleUpdateOneTimeExpense(expense.id, 'name', e.target.value)}
                />
              </div>
              <div className="input-group">
                <label htmlFor={`ot-amount-${expense.id}`}>Amount:</label>
                <input 
                  id={`ot-amount-${expense.id}`}
                  type="number" 
                  placeholder="0.00"
                  value={expense.amount || ''}
                  onChange={(e) => handleUpdateOneTimeExpense(expense.id, 'amount', parseFloat(e.target.value) || 0)}
                />
              </div>
              <button 
                className="remove-btn" 
                onClick={() => handleDeleteOneTimeClick(expense)}
              >
                Remove
              </button>
              <div className="input-group">
                <label htmlFor={`ot-category-${expense.id}`}>Category</label>
                <select 
                  id={`ot-category-${expense.id}`}
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
              </div>
              <div className="input-group">
                <label htmlFor={`ot-date-${expense.id}`}>Date</label>
                <input 
                  id={`ot-date-${expense.id}`}
                  type="date" 
                  value={expense.date}
                  onChange={(e) => handleUpdateOneTimeExpense(expense.id, 'date', e.target.value)}
                />
              </div>
            </div>
            <div className="toggle-wrapper">
              <ToggleSwitch
                id={`ot-active-${expense.id}`}
                checked={expense.isActive !== false}
                onChange={(e) => handleUpdateOneTimeExpense(expense.id, 'isActive', e.target.checked)}
                label="Active"
              />
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

      <ConfirmDialog
        isOpen={confirmDeleteRecurring !== null}
        title="Confirm Removal"
        message={`Are you sure you want to remove "${confirmDeleteRecurring?.name || 'this recurring expense'}"?`}
        onConfirm={handleConfirmDeleteRecurring}
        onCancel={handleCancelDeleteRecurring}
      />

      <ConfirmDialog
        isOpen={confirmDeleteOneTime !== null}
        title="Confirm Removal"
        message={`Are you sure you want to remove "${confirmDeleteOneTime?.name || 'this one-time expense'}"?`}
        onConfirm={handleConfirmDeleteOneTime}
        onCancel={handleCancelDeleteOneTime}
      />
    </>
  )
}

export default ExpenseSection