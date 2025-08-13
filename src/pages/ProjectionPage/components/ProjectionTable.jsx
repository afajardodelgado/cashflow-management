import { useMemo } from 'react'
import { useFinancialContext } from '../../../context/FinancialContext'
import { calculateCashflow } from '../../../services/calculations/cashflow'

const ProjectionTable = () => {
  const { 
    startingBalance, 
    incomes, 
    creditCards, 
    recurringExpenses, 
    oneTimeExpenses, 
    projectionDays,
    showTransactionDaysOnly
  } = useFinancialContext()

  const getCashflowData = useMemo(() => {
    return calculateCashflow(startingBalance, incomes, creditCards, recurringExpenses, oneTimeExpenses, projectionDays)
  }, [startingBalance, incomes, creditCards, recurringExpenses, oneTimeExpenses, projectionDays])

  const getFilteredCashflowData = useMemo(() => {
    if (showTransactionDaysOnly) {
      return getCashflowData.filter(day => day.income > 0 || day.expenses > 0)
    }
    return getCashflowData
  }, [getCashflowData, showTransactionDaysOnly])

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
                  ${Math.abs(day.runningBalance).toFixed(2)}
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