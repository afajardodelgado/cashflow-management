import { useState } from 'react'
import { createShareableLink } from '../services/supabase/shareableLinks'
import { useFinancialContext } from '../context/FinancialContext'

const ShareableLinkModal = ({ isOpen, onClose }) => {
  const { user, isGuest, getCurrentState } = useFinancialContext()
  const [isLoading, setIsLoading] = useState(false)
  const [shareUrl, setShareUrl] = useState(null)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)

  const handleExportToLink = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const currentState = getCurrentState()
      const userId = user?.userId || null
      const result = await createShareableLink(userId, currentState, 30, isGuest)
      
      if (result.success) {
        setShareUrl(result.shareUrl)
      } else {
        setError(result.error || 'Failed to create shareable link')
      }
    } catch (err) {
      setError('An unexpected error occurred')
      console.error('Error creating link:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyLink = async () => {
    if (!shareUrl) return
    
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy link:', err)
      setError('Failed to copy to clipboard')
    }
  }

  const handleClose = () => {
    setShareUrl(null)
    setError(null)
    setCopied(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content shareable-link-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close-button" onClick={handleClose} aria-label="Close modal">
          ×
        </button>
        
        <h2 className="modal-title">Shareable link</h2>
        
        {!shareUrl ? (
          <>
            <p className="modal-description">Create a link with full editing access.</p>
            
            {isGuest && (
              <div className="modal-info">
                <p>💡 Guest links expire after 30 days. Sign in to manage your links.</p>
              </div>
            )}

            {error && (
              <div className="modal-error">
                <p>{error}</p>
              </div>
            )}
            
            <button 
              className="export-link-button"
              onClick={handleExportToLink}
              disabled={isLoading}
            >
              <svg 
                className="button-icon" 
                width="20" 
                height="20" 
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
              {isLoading ? 'Creating...' : 'Export to Link'}
            </button>
          </>
        ) : (
          <>
            <p className="modal-description">Your shareable link is ready!</p>
            
            <div className="share-url-container">
              <input 
                type="text" 
                value={shareUrl} 
                readOnly 
                className="share-url-input"
                onClick={e => e.target.select()}
              />
            </div>
            
            <div className="modal-actions">
              <button 
                className="copy-link-button"
                onClick={handleCopyLink}
              >
                <svg 
                  className="button-icon" 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  {copied ? (
                    <path d="M20 6L9 17l-5-5" />
                  ) : (
                    <>
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </>
                  )}
                </svg>
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
              
              <button 
                className="done-button"
                onClick={handleClose}
              >
                Done
              </button>
            </div>
            
            <p className="modal-note">
              This link will expire in 30 days and provides full editing access to your current cashflow projection.
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export default ShareableLinkModal
