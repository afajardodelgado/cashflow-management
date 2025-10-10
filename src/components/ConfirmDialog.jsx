import React from 'react'
import '../styles/ConfirmDialog.css'

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null

  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-dialog" onClick={e => e.stopPropagation()}>
        <h3 className="confirm-title">{title}</h3>
        <p className="confirm-message">{message}</p>
        <div className="confirm-actions">
          <button 
            className="confirm-button confirm-cancel"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button 
            className="confirm-button confirm-delete"
            onClick={onConfirm}
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
