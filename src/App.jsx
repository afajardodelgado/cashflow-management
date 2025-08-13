import { useState, useEffect } from 'react'
import './App.css'
import { FinancialProvider, useFinancialContext } from './context/FinancialContext'
import SupabaseAuthGuard from './components/SupabaseAuthGuard'
import InputsPage from './pages/InputsPage'
import ProjectionPage from './pages/ProjectionPage'
import InsightsPage from './pages/InsightsPage'
import { useAutoSave } from './hooks/useAutoSave'

function CashflowApp() {
  const {
    activeTab,
    setActiveTab,
    projectionDays,
    saveStatus,
    handleManualSave
  } = useFinancialContext()

  const [currentTaglineIndex, setCurrentTaglineIndex] = useState(0)

  useAutoSave(2000)

  const taglines = [
    "No judgement, no API integration, no Plaid",
    "We won't remind you how much you spent last summer",
    "I don't care if 6 months ago you overdid it in St. Tropez",
    "Don't care how many table services Plaid will remind you you have done 9 years ago",
    "That vintage wine collection? Not our business.",
    "We don't care about your art gallery splurges.",
    "We won't mention the boat you bought drunk.",
    "Those designer shoes from last spring? Forgotten.",
    "We don't judge your DoorDash addiction.",
    "Fresh start, fresh cash flow.",
    "We're not your financial therapist.",
    "Clean slate, dirty money welcome.",
    "No receipts, no regrets, no reminders.",
    "Your financial past can stay in therapy.",
    "We don't do financial archaeology.",
    "No transaction shaming since never.",
    "We won't connect to your mistakes.",
    "Your bank statements are safe from us.",
    "No access to your financial trauma.",
    "Overdid it in St. Tropez in 2017? We're not Plaid, we don't care.",
    "Blew your savings in St. Tropez? We're not your bank app.",
    "That St. Tropez summer of 2018? Not our circus, not our spreadsheet.",
    "St. Tropez bottle service bills? We don't keep receipts.",
    "Spent rent money in St. Tropez? We're not here to judge.",
    "Your St. Tropez yacht week disaster? Ancient history.",
    "Maxed out your cards in Mykonos? We're not Plaid, we don't remember.",
    "Went broke in Ibiza? We're not your banking app.",
    "That Coachella weekend that cost 3 months rent? We won't remind you.",
    "Tulum ate your emergency fund? We don't do financial autopsies.",
    "Your Miami boat party receipts? We don't sync with shame.",
    "Aspen ski trip broke the bank? We're not Mint, we don't mention it.",
    "That Cloud Nine champagne tab in Aspen? We won't bring it up.",
    "Spent your bonus in Dubai? We're not keeping score.",
    "Blew through savings in the Hamptons? We don't track regrets.",
    "Casa de Campo golf week emptied your account? We won't mention it.",
    "That Mayfair shopping spree? We're not your financial conscience.",
    "Loro Piana summer walks cost more than most cars? We don't care.",
    "Aspen powder days emptied your account? We won't remind you.",
    "That Aspen weekend cost more than your car? We're not Plaid, we don't judge.",
    "Spent Christmas money on Aspen lift tickets? Ancient history.",
    "Aspen après-ski bills broke the bank? We don't keep receipts.",
    "Your Aspen lodge weekend? We won't bring it up.",
    "Your Bagatelle brunch bills? We don't keep tabs.",
    "Dropped your rent money at Bagatelle? We're not your conscience.",
    "That Bagatelle champagne parade from 2018? We won't mention it.",
    "Seaspice ate your emergency fund? We don't do financial autopsies.",
    "That Seaspice dinner cost more than your mortgage? We won't remind you.",
    "Blew your savings on Seaspice weekends? We're not keeping track.",
    "Your Seaspice yacht party receipts? Not our problem.",
    "Medium Cool bottle service 2 months ago? We're not your transaction history.",
    "That Soho House weekend destroyed your budget? We don't care.",
    "Art Basel spending spree? We won't bring it up.",
    "That designer handbag impulse buy? We're not Plaid, we don't care.",
    "Invested in that friend's startup? We're not your transaction history.",
    "Splurged on that watch collection? We're not Plaid, we're not counting."
  ]

  const getRandomTaglineIndex = () => {
    return Math.floor(Math.random() * taglines.length)
  }

  useEffect(() => {
    setCurrentTaglineIndex(getRandomTaglineIndex())
  }, [])

  useEffect(() => {
    setCurrentTaglineIndex(getRandomTaglineIndex())
  }, [activeTab])

  useEffect(() => {
    setCurrentTaglineIndex(getRandomTaglineIndex())
  }, [projectionDays])

  const handleTabKeyDown = (event, tabName) => {
    const tabs = ['inputs', 'projection', 'insights', 'export-pdf']
    const currentIndex = tabs.indexOf(activeTab)
    
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault()
        const prevIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1
        setActiveTab(tabs[prevIndex])
        break
      case 'ArrowRight':
        event.preventDefault()
        const nextIndex = currentIndex === tabs.length - 1 ? 0 : currentIndex + 1
        setActiveTab(tabs[nextIndex])
        break
      case 'Home':
        event.preventDefault()
        setActiveTab(tabs[0])
        break
      case 'End':
        event.preventDefault()
        setActiveTab(tabs[tabs.length - 1])
        break
    }
  }

  return (
    <div className="app-container">
      <div className="tab-navigation-wrapper">
        <div className="tab-navigation" role="tablist" aria-label="Cashflow management sections">
          <button 
            role="tab"
            id="tab-inputs"
            aria-controls="panel-inputs"
            aria-selected={activeTab === 'inputs'}
            tabIndex={activeTab === 'inputs' ? 0 : -1}
            className={`tab-button ${activeTab === 'inputs' ? 'active' : ''}`}
            onClick={() => setActiveTab('inputs')}
            onKeyDown={(e) => handleTabKeyDown(e, 'inputs')}
          >
            Inputs
          </button>
          <button 
            role="tab"
            id="tab-projection"
            aria-controls="panel-projection"
            aria-selected={activeTab === 'projection'}
            tabIndex={activeTab === 'projection' ? 0 : -1}
            className={`tab-button ${activeTab === 'projection' ? 'active' : ''}`}
            onClick={() => setActiveTab('projection')}
            onKeyDown={(e) => handleTabKeyDown(e, 'projection')}
          >
            Projection
          </button>
          <button 
            role="tab"
            id="tab-insights"
            aria-controls="panel-insights"
            aria-selected={activeTab === 'insights'}
            tabIndex={activeTab === 'insights' ? 0 : -1}
            className={`tab-button ${activeTab === 'insights' ? 'active' : ''}`}
            onClick={() => setActiveTab('insights')}
            onKeyDown={(e) => handleTabKeyDown(e, 'insights')}
          >
            Insights
          </button>
          <button 
            role="tab"
            id="tab-export-pdf"
            aria-controls="panel-export-pdf"
            aria-selected={activeTab === 'export-pdf'}
            tabIndex={activeTab === 'export-pdf' ? 0 : -1}
            className={`tab-button ${activeTab === 'export-pdf' ? 'active' : ''}`}
            onClick={() => setActiveTab('export-pdf')}
            onKeyDown={(e) => handleTabKeyDown(e, 'export-pdf')}
          >
            Export to PDF
          </button>
        </div>
        
        <div className="save-section">
          <button 
            className={`save-button ${saveStatus.isLoading ? 'loading' : ''} ${saveStatus.isSuccess ? 'success' : ''}`}
            onClick={handleManualSave}
            disabled={saveStatus.isLoading}
          >
            {saveStatus.isLoading ? 'Saving...' : 'Save'}
          </button>
          {saveStatus.message && (
            <div className={`save-status ${saveStatus.isSuccess ? 'success' : 'error'}`}>
              {saveStatus.message}
            </div>
          )}
        </div>
      </div>
      
      {activeTab === 'inputs' && (
        <div role="tabpanel" id="panel-inputs" aria-labelledby="tab-inputs" className="main-layout">
          <InputsPage />
          <div className="projection-panel">
            <ProjectionPage />
          </div>
        </div>
      )}
      
      {activeTab === 'projection' && (
        <div role="tabpanel" id="panel-projection" aria-labelledby="tab-projection" className="projection-layout">
          <ProjectionPage />
        </div>
      )}
      
      {activeTab === 'insights' && (
        <div role="tabpanel" id="panel-insights" aria-labelledby="tab-insights">
          <InsightsPage />
        </div>
      )}

      {activeTab === 'export-pdf' && (
        <div role="tabpanel" id="panel-export-pdf" aria-labelledby="tab-export-pdf" className="export-pdf-layout">
          <div className="export-pdf-container">
            <h2>Export to PDF</h2>
            <div className="export-pdf-content">
              <p>PDF export functionality coming soon!</p>
              <p>For now, you can use the CSV export feature in the Projection tab.</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="tagline-footer">
        <div className="tagline-subtitle">
          It's about the next {projectionDays} days, judgement free cashflow
        </div>
        <div className="tagline-main">
          {taglines[currentTaglineIndex]}
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <SupabaseAuthGuard>
      {({ user, isGuest }) => (
        <FinancialProvider user={user} isGuest={isGuest}>
          <CashflowApp />
        </FinancialProvider>
      )}
    </SupabaseAuthGuard>
  )
}

export default App