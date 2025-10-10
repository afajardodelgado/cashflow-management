import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getSharedData } from '../services/supabase/shareableLinks'
import InputsPage from './InputsPage'
import ProjectionPage from './ProjectionPage'
import InsightsPage from './InsightsPage'
import { FinancialProvider } from '../context/FinancialContext'

const SharedView = () => {
  const { token } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sharedData, setSharedData] = useState(null)
  const [activeTab, setActiveTab] = useState('inputs')

  useEffect(() => {
    loadSharedData()
  }, [token])

  const loadSharedData = async () => {
    setLoading(true)
    setError(null)

    const result = await getSharedData(token)

    if (result.success) {
      setSharedData(result.data)
    } else {
      setError(result.error || 'Failed to load shared cashflow')
    }

    setLoading(false)
  }

  if (loading) {
    return (
      <div className="shared-view-loading">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <h2>Loading shared cashflow...</h2>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="shared-view-error">
        <div className="error-content">
          <div className="error-icon">⚠️</div>
          <h2>Unable to Load</h2>
          <p>{error}</p>
          <Link to="/" className="back-home-button">
            Go to Home
          </Link>
        </div>
      </div>
    )
  }

  if (!sharedData) {
    return (
      <div className="shared-view-error">
        <div className="error-content">
          <div className="error-icon">❌</div>
          <h2>No Data Found</h2>
          <p>This shared link doesn't contain any cashflow data</p>
          <Link to="/" className="back-home-button">
            Go to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <SharedViewProvider data={sharedData}>
      <div className="app-container shared-view">
        {/* Shared view banner */}
        <div className="shared-banner">
          <div className="shared-banner-content">
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="shared-icon"
            >
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            <span>You're viewing a shared cashflow projection - Full editing access</span>
            <Link to="/" className="create-own-button">
              Create Your Own
            </Link>
          </div>
        </div>

        {/* Tab navigation - All tabs available */}
        <div className="tab-navigation-wrapper">
          <div className="tab-navigation" role="tablist">
            <button 
              role="tab"
              className={`tab-button ${activeTab === 'inputs' ? 'active' : ''}`}
              onClick={() => setActiveTab('inputs')}
            >
              Inputs
            </button>
            <button 
              role="tab"
              className={`tab-button ${activeTab === 'projection' ? 'active' : ''}`}
              onClick={() => setActiveTab('projection')}
            >
              Projection
            </button>
            <button 
              role="tab"
              className={`tab-button ${activeTab === 'insights' ? 'active' : ''}`}
              onClick={() => setActiveTab('insights')}
            >
              Insights
            </button>
          </div>
        </div>

        {/* Tab panels - All tabs available */}
        {activeTab === 'inputs' && (
          <div role="tabpanel" className="main-layout">
            <InputsPage />
            <div className="projection-panel">
              <ProjectionPage />
            </div>
          </div>
        )}

        {activeTab === 'projection' && (
          <div role="tabpanel" className="projection-layout">
            <ProjectionPage />
          </div>
        )}

        {activeTab === 'insights' && (
          <div role="tabpanel">
            <InsightsPage />
          </div>
        )}
      </div>
    </SharedViewProvider>
  )
}

// Provider wrapper for shared view (full editing mode)
const SharedViewProvider = ({ children, data }) => {
  return (
    <FinancialProvider 
      user={null} 
      isGuest={true}
      initialData={data}
      readOnly={false}
    >
      {children}
    </FinancialProvider>
  )
}

export default SharedView
