import { useMemo } from 'react'
import { useFinancialContext } from '../../../context/FinancialContext'
import { getFlowBreakdownData } from '../../../services/calculations/analytics'

const BreakdownTable = () => {
  const { incomes, recurringExpenses, creditCards, oneTimeExpenses, projectionDays } = useFinancialContext()

  const flowData = useMemo(() => {
    return getFlowBreakdownData(incomes, recurringExpenses, creditCards, oneTimeExpenses, projectionDays)
  }, [incomes, recurringExpenses, creditCards, oneTimeExpenses, projectionDays])

  return (
    <div className="flow-breakdown">
      <div className="flow-column">
        <h3>Income Sources</h3>
        {Object.entries(flowData.incomeBySource).map(([name, amount]) => {
          const percentage = flowData.totalIncome > 0 ? ((amount / flowData.totalIncome) * 100).toFixed(1) : 0
          return (
            <div key={name} className="flow-item income-item-flow">
              <div className="flow-label">{name}</div>
              <div className="flow-amount">${amount.toFixed(0)} ({percentage}%)</div>
            </div>
          )
        })}
        <div className="flow-total">
          Total Income: ${flowData.totalIncome.toFixed(0)}
        </div>
      </div>
      
      <div className="flow-column">
        <h3>Expense Categories</h3>
        {[
          ...Object.entries(flowData.expensesByCategory).map(([name, amount]) => ({ name, amount, type: 'category' })),
          ...Object.entries(flowData.creditCardExpenses).map(([name, amount]) => ({ name, amount, type: 'credit' })),
          ...Object.entries(flowData.oneTimeExpensesByName).map(([name, amount]) => ({ name, amount, type: 'onetime' }))
        ].map(({ name, amount, type }) => {
          const percentage = flowData.totalExpenses > 0 ? ((amount / flowData.totalExpenses) * 100).toFixed(1) : 0
          return (
            <div key={`${type}-${name}`} className={`flow-item expense-item-flow ${type}`}>
              <div className="flow-label">{name}</div>
              <div className="flow-amount">${amount.toFixed(0)} ({percentage}%)</div>
            </div>
          )
        })}
        <div className="flow-total">
          Total Expenses: ${flowData.totalExpenses.toFixed(0)}
        </div>
      </div>
    </div>
  )
}

export default BreakdownTable