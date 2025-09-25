import { useCashflowCalculations } from '../../../hooks/useCashflowCalculations'
import { formatNegativeCurrency } from '../../../lib/format'

const ProjectionTable = () => {
  const { filteredCashflowData: getFilteredCashflowData } = useCashflowCalculations()

  return (
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
                  {formatNegativeCurrency(day.runningBalance)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProjectionTable