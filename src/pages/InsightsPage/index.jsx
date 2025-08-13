import { useFinancialContext } from '../../context/FinancialContext'
import MetricsDashboard from './components/MetricsDashboard'
import SankeyFlow from './components/SankeyFlow'
import BreakdownTable from './components/BreakdownTable'

const InsightsPage = () => {
  const { projectionDays } = useFinancialContext()

  return (
    <div className="insights-layout">
      <MetricsDashboard />
      
      <div className="sankey-section">
        <div className="sankey-container">
          <h2>Cash Flow Visualization</h2>
          <p>Income sources flowing to expenses for the next {projectionDays} days</p>
          <div className="sankey-chart">
            <SankeyFlow />
          </div>
        </div>
      </div>
      
      <div className="flow-breakdown-section">
        <div className="flow-breakdown-container">
          <h2>Income vs Expenses Breakdown</h2>
          <p>Detailed breakdown for the next {projectionDays} days</p>
          <BreakdownTable />
        </div>
      </div>
    </div>
  )
}

export default InsightsPage