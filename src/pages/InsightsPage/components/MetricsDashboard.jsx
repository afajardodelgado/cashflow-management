import { useMemo } from 'react'
import { useFinancialContext } from '../../../context/FinancialContext'
import { getFlowBreakdownData } from '../../../services/calculations/analytics'

const MetricsDashboard = () => {
  const { incomes, recurringExpenses, creditCards, oneTimeExpenses, projectionDays } = useFinancialContext()

  const metrics = useMemo(() => {
    const data = getFlowBreakdownData(incomes, recurringExpenses, creditCards, oneTimeExpenses, projectionDays)
    const netCashFlow = data.totalIncome - data.totalExpenses
    const savingsRate = data.totalIncome > 0 ? ((netCashFlow / data.totalIncome) * 100).toFixed(1) : 0
    
    return {
      totalIncome: data.totalIncome,
      totalExpenses: data.totalExpenses,
      netCashFlow,
      savingsRate
    }
  }, [incomes, recurringExpenses, creditCards, oneTimeExpenses, projectionDays])

  return (
    <div className="summary-metrics">
      <div className="metric-box">
        <h3>Total Income</h3>
        <div className="metric-value positive">${metrics.totalIncome.toFixed(0)}</div>
        <div className="metric-period">Next {projectionDays} days</div>
      </div>
      <div className="metric-box">
        <h3>Total Expenses</h3>
        <div className="metric-value negative">${metrics.totalExpenses.toFixed(0)}</div>
        <div className="metric-period">Next {projectionDays} days</div>
      </div>
      <div className="metric-box">
        <h3>Savings Rate</h3>
        <div className={`metric-value ${metrics.savingsRate >= 0 ? 'positive' : 'negative'}`}>
          {metrics.savingsRate}%
        </div>
        <div className="metric-period">Of income saved</div>
      </div>
      <div className="metric-box">
        <h3>Net Cash Flow</h3>
        <div className={`metric-value ${metrics.netCashFlow >= 0 ? 'positive' : 'negative'}`}>
          ${Math.abs(metrics.netCashFlow).toFixed(0)}
        </div>
        <div className="metric-period">{metrics.netCashFlow >= 0 ? 'Surplus' : 'Deficit'}</div>
      </div>
    </div>
  )
}

export default MetricsDashboard