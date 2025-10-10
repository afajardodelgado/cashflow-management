/**
 * Validates that a name is not purely numeric
 * @param {string} name - The name to validate
 * @returns {boolean} - True if valid (contains non-numeric characters), false if invalid (purely numeric)
 */
export const isValidName = (name) => {
  if (!name || typeof name !== 'string') {
    return true // Allow empty or non-string (will be handled elsewhere)
  }

  const trimmedName = name.trim()

  // Check if the name is purely numeric (including decimals, commas, etc.)
  // Returns false if it's only numbers and numeric separators
  const isPurelyNumeric = /^[\d,.\s-]+$/.test(trimmedName)

  return !isPurelyNumeric
}

/**
 * Validates email format
 * @param {string} email - The email to validate
 * @returns {boolean} - True if valid email format
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return false
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}

/**
 * Validates password strength
 * @param {string} password - The password to validate
 * @returns {object} - Object with isValid boolean and errors array
 */
export const validatePassword = (password) => {
  const errors = []

  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}
