import { useFinancialContext } from '../../../context/FinancialContext'
import { isValidName } from '../../../lib/validation'

const CreditCardSection = () => {
  const { creditCards, addCreditCard, updateCreditCard, deleteCreditCard } = useFinancialContext()

  const handleUpdateCreditCard = (id, field, value) => {
    // Validate name field - reject purely numeric values
    if (field === 'name' && !isValidName(value)) {
      return // Don't update if name is purely numeric
    }
    updateCreditCard(id, { [field]: value })
  }

  return (
    <div className="card">
      <h3>Credit Cards</h3>
      <p>Track credit card balances and due dates</p>
      
      {creditCards.map(card => (
        <div key={card.id} className="income-item mb-md">
          <div className="income-grid mb-sm">
            <div className="input-group">
              <label htmlFor={`card-name-${card.id}`}>Card Name:</label>
              <input 
                id={`card-name-${card.id}`}
                type="text" 
                placeholder="e.g., Chase Sapphire"
                value={card.name}
                onChange={(e) => handleUpdateCreditCard(card.id, 'name', e.target.value)}
              />
            </div>
            <div className="input-group">
              <label htmlFor={`card-balance-${card.id}`}>Balance:</label>
              <input 
                id={`card-balance-${card.id}`}
                type="number" 
                placeholder="0.00"
                value={card.balance || ''}
                onChange={(e) => handleUpdateCreditCard(card.id, 'balance', parseFloat(e.target.value) || 0)}
              />
            </div>
            <button 
              className="remove-btn" 
              onClick={() => deleteCreditCard(card.id)}
            >
              Remove
            </button>
            <div className="input-group">
              <label htmlFor={`card-due-${card.id}`}>Due Date:</label>
              <input 
                id={`card-due-${card.id}`}
                type="date" 
                value={card.dueDate}
                onChange={(e) => handleUpdateCreditCard(card.id, 'dueDate', e.target.value)}
              />
            </div>
            <div className="input-group">
              <label htmlFor={`card-pay-${card.id}`}>Pay Date:</label>
              <input 
                id={`card-pay-${card.id}`}
                type="date" 
                value={card.payDate}
                onChange={(e) => handleUpdateCreditCard(card.id, 'payDate', e.target.value)}
                placeholder="Optional - uses due date if empty"
              />
            </div>
          </div>
          {card.dueDate && card.payDate && new Date(card.payDate) > new Date(card.dueDate) && (
            <div className="alert-danger">
              Warning: Pay date is after due date - this may incur late fees!
            </div>
          )}
        </div>
      ))}
      
      <button 
        className="add-button" 
        onClick={() => addCreditCard({
          name: '',
          balance: 0,
          dueDate: new Date().toISOString().split('T')[0],
          payDate: ''
        })} 
        aria-label="Add new credit card"
      >
        + Add Credit Card
      </button>
    </div>
  )
}

export default CreditCardSection