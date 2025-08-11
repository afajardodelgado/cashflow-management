// Currency formatter using Intl.NumberFormat
export const formatCurrency = (amount, options = {}) => {
  const defaultOptions = {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }
  
  const formatter = new Intl.NumberFormat('en-US', { ...defaultOptions, ...options })
  return formatter.format(amount)
}

// Date formatter using Intl.DateTimeFormat
export const formatDate = (date, options = {}) => {
  const defaultOptions = {
    month: '2-digit',
    day: '2-digit',
    year: '2-digit'
  }
  
  const formatter = new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options })
  return formatter.format(new Date(date))
}

// Short date formatter for charts
export const formatShortDate = (date) => {
  const d = new Date(date)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

// Currency formatter for charts (no currency symbol)
export const formatChartCurrency = (value) => {
  return `$${value.toLocaleString()}`
}

// Format negative currency with parentheses
export const formatNegativeCurrency = (amount) => {
  if (amount < 0) {
    return `($${Math.abs(amount).toFixed(2)})`
  }
  return `$${amount.toFixed(2)}`
}

// Normalize date to local midnight to avoid DST/timezone drift
export const normalizeDate = (dateInput) => {
  if (!dateInput) return null
  
  let date
  if (typeof dateInput === 'string') {
    // Handle YYYY-MM-DD format specifically
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
      const [year, month, day] = dateInput.split('-').map(Number)
      date = new Date(year, month - 1, day)
    } else {
      date = new Date(dateInput)
    }
  } else {
    date = new Date(dateInput)
  }
  
  // Ensure we have a valid date
  if (isNaN(date.getTime())) return null
  
  // Reset to local midnight to normalize
  date.setHours(0, 0, 0, 0)
  return date
}

// Get epoch day for date comparison (avoids time zone issues)
export const getEpochDay = (dateInput) => {
  const normalized = normalizeDate(dateInput)
  if (!normalized) return null
  return Math.floor(normalized.getTime() / (1000 * 60 * 60 * 24))
}