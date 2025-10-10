import { useState, useEffect } from 'react'
import './App.css'
import { FinancialProvider, useFinancialContext } from './context/FinancialContext'
import SupabaseAuthGuard from './components/SupabaseAuthGuard'
import ShareableLinkModal from './components/ShareableLinkModal'
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
    handleManualSave,
    user
  } = useFinancialContext()

  const [showShareModal, setShowShareModal] = useState(false)

  useAutoSave(2000)

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
            className="share-button"
            onClick={() => setShowShareModal(true)}
            title="Create shareable link"
          >
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            Share
          </button>
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

      <ShareableLinkModal 
        isOpen={showShareModal} 
        onClose={() => setShowShareModal(false)} 
      />
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