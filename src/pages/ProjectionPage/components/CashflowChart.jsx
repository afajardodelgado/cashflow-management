import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import ChartErrorBoundary from '../../../components/ChartErrorBoundary'
import { useFinancialContext } from '../../../context/FinancialContext'
import { useCashflowCalculations } from '../../../hooks/useCashflowCalculations'
import { formatChartCurrency } from '../../../lib/format'

const CashflowChart = () => {
  const { 
    projectionDays,
    chartType
  } = useFinancialContext()

  const { chartData: getChartData } = useCashflowCalculations()

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const actualExpenses = Math.abs(data.expenses)
      return (
        <div className="chart-tooltip">
          <p className="tooltip-date">{`${data.shortDate}: ${data.date}`}</p>
          <p className="tooltip-balance">
            Balance: <span className={data.balance < 0 ? 'negative' : 'positive'}>
              ${data.balance < 0 ? '(' + Math.abs(data.balance).toFixed(2) + ')' : data.balance.toFixed(2)}
            </span>
          </p>
          <p className="tooltip-income">Income: ${data.income.toFixed(2)}</p>
          <p className="tooltip-expenses">Expenses: ${actualExpenses.toFixed(2)}</p>
          <p className="tooltip-net">Net: ${data.netChange.toFixed(2)}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="cashflow-graph mb-lg">
      <h3>Balance Trend</h3>
      <div className="chart-container">
        <ChartErrorBoundary>
          <ResponsiveContainer width="100%" height={300}>
            {chartType === 'line' ? (
              <LineChart data={getChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                <XAxis 
                  dataKey="shortDate" 
                  tick={{ fontSize: 12 }}
                  interval={projectionDays <= 30 ? 1 : projectionDays <= 60 ? 6 : 6}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={formatChartCurrency}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={0} stroke="#DC2626" strokeDasharray="2 2" />
                <Line 
                  type="monotone" 
                  dataKey="balance" 
                  stroke="#2A623C" 
                  strokeWidth={2}
                  dot={{ fill: '#2A623C', strokeWidth: 1, r: 3 }}
                  activeDot={{ r: 5, fill: '#2A623C' }}
                />
              </LineChart>
            ) : (
              <BarChart data={getChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                <XAxis 
                  dataKey="shortDate" 
                  tick={{ fontSize: 12 }}
                  interval={projectionDays <= 30 ? 1 : projectionDays <= 60 ? 6 : 6}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={formatChartCurrency}
                  domain={['dataMin', 'dataMax']}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={0} stroke="#374151" strokeWidth={2} />
                <Bar 
                  dataKey="income" 
                  fill="#2A623C"
                  opacity={0.8}
                  name="Income"
                />
                <Bar 
                  dataKey="expenses" 
                  fill="#DC2626"
                  opacity={0.8}
                  name="Expenses"
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </ChartErrorBoundary>
      </div>
    </div>
  )
}

export default CashflowChart