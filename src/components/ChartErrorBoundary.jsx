import { Component } from 'react'

class ChartErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Chart error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="sankey-placeholder">
          <div className="placeholder-content">
            <h3>Visualization Unavailable</h3>
            <p>There was an error loading the chart. Please check your data inputs.</p>
            {this.props.showError && (
              <details style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#666' }}>
                <summary>Error details</summary>
                <pre style={{ fontSize: '0.7rem', overflow: 'auto' }}>
                  {this.state.error?.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ChartErrorBoundary