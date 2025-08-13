import { useMemo } from 'react'
import { ResponsiveSankey } from '@nivo/sankey'
import ChartErrorBoundary from '../../../components/ChartErrorBoundary'
import { useFinancialContext } from '../../../context/FinancialContext'
import { getFlowBreakdownData, getSankeyData } from '../../../services/calculations/analytics'

const SankeyFlow = () => {
  const { incomes, recurringExpenses, creditCards, oneTimeExpenses, projectionDays } = useFinancialContext()

  const sankeyData = useMemo(() => {
    const flowData = getFlowBreakdownData(incomes, recurringExpenses, creditCards, oneTimeExpenses, projectionDays)
    return getSankeyData(flowData)
  }, [incomes, recurringExpenses, creditCards, oneTimeExpenses, projectionDays])

  if (sankeyData.links.length === 0) {
    return (
      <div className="sankey-placeholder">
        <div className="placeholder-content">
          <h3>No Flow Data Available</h3>
          <p>Add income sources and expenses in the Inputs tab to see the cash flow visualization.</p>
        </div>
      </div>
    )
  }

  return (
    <ChartErrorBoundary>
      <ResponsiveSankey
        data={sankeyData}
        margin={{ top: 40, right: 160, bottom: 40, left: 50 }}
        align="justify"
        colors={{ scheme: 'set2' }}
        nodeOpacity={1}
        nodeHoverOthersOpacity={0.35}
        nodeThickness={18}
        nodeSpacing={24}
        nodeBorderWidth={0}
        linkOpacity={0.5}
        linkHoverOthersOpacity={0.1}
        enableLinkGradient={true}
        labelPosition="outside"
        labelOrientation="vertical"
        labelTextColor={{ from: 'color', modifiers: [['darker', 1]] }}
      />
    </ChartErrorBoundary>
  )
}

export default SankeyFlow