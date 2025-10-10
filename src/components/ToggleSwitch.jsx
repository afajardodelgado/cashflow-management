import React from 'react'
import '../styles/ToggleSwitch.css'

const ToggleSwitch = ({ id, checked, onChange, label, disabled = false }) => {
  return (
    <div className="toggle-switch-container">
      {label && <span className="toggle-label">{label}</span>}
      <label className="toggle-switch" htmlFor={id}>
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="toggle-input"
        />
        <span className="toggle-slider"></span>
      </label>
    </div>
  )
}

export default ToggleSwitch
