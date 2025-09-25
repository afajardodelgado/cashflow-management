import { useFinancialContext } from '../../context/FinancialContext'
import CashflowChart from './components/CashflowChart'
import ProjectionTable from './components/ProjectionTable'
import { useCashflowCalculations } from '../../hooks/useCashflowCalculations'
import { exportProjectionCSV } from '../../services/export/csv'

const ProjectionPage = () => {
  const {
    startingBalance,
    projectionDays,
    setProjectionDays,
    showTransactionDaysOnly,
    setShowTransactionDaysOnly,
    chartType,
    setChartType
  } = useFinancialContext()

  const { filteredCashflowData, estimatedBalance } = useCashflowCalculations()

  const exportToCSV = () => {
    exportProjectionCSV(filteredCashflowData)
  }

  return (
    <div className="projection-panel">
      <div className="projection-header">
        <h2>Cashflow Projection</h2>
        <button className="download" onClick={exportToCSV}>Export Cashflow CSV</button>
      </div>
      
      <div className="balance-summary mb-md">
        <div className="metric-card">
          <div className="balance-label">Starting Balance</div>
          <div className="balance-amount">${startingBalance.toFixed(2)}</div>
        </div>
        <div className="metric-card">
          {(() => {
            const estimated = estimatedBalance
            const month = estimated.date.getMonth() + 1
            const day = estimated.date.getDate()
            const shortDate = `${month}/${day}`
            const balanceText = estimated.balance < 0 ? 
              `($${Math.abs(estimated.balance).toFixed(2)})` : 
              `$${estimated.balance.toFixed(2)}`
            return (
              <>
                <div className="balance-label">Estimated Balance on {shortDate}</div>
                <div className={`balance-amount ${estimated.balance < 0 ? 'negative' : ''}`}>
                  {balanceText}
                </div>
              </>
            )
          })()} 
        </div>
      </div>

      <div className="projection-controls mb-lg">
        <div className="control-group">
          <label htmlFor="projectionDays">Days to Show:</label>
          <select 
            id="projectionDays"
            value={projectionDays} 
            onChange={(e) => setProjectionDays(parseInt(e.target.value))}
          >
            <option value={15}>Next 15 Days</option>
            <option value={30}>Next 30 Days</option>
            <option value={60}>Next 60 Days</option>
            <option value={90}>Next 90 Days</option>
          </select>
        </div>
        <div className="control-group">
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              checked={showTransactionDaysOnly}
              onChange={(e) => setShowTransactionDaysOnly(e.target.checked)}
            />
            Show Only Transaction Days
          </label>
        </div>
        <div className="control-group">
          <label htmlFor="chartType">Chart Type:</label>
          <select 
            id="chartType"
            value={chartType} 
            onChange={(e) => setChartType(e.target.value)}
          >
            <option value="line">Line Chart</option>
            <option value="bar">Bar Chart</option>
          </select>
        </div>
      </div>
      
      <CashflowChart />
      <ProjectionTable />
    </div>
  )
}

export default ProjectionPage