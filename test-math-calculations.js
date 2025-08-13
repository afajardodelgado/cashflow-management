/**
 * Math Calculation Tests for Cashflow App
 * 
 * Tests the core mathematical functions to ensure accuracy
 * Run with: node test-math-calculations.js
 */

import { calculateCashflow, isPaymentDue, getLastBusinessDay } from './src/lib/cashflow.js'
import { normalizeDate, getEpochDay, formatShortDate } from './src/lib/format.js'

// Simple test runner
class TestRunner {
  constructor() {
    this.tests = []
    this.passed = 0
    this.failed = 0
  }

  test(name, testFn) {
    this.tests.push({ name, testFn })
  }

  async run() {
    console.log('\n=== CASHFLOW MATH CALCULATION TESTS ===\n')
    
    for (const { name, testFn } of this.tests) {
      try {
        await testFn()
        console.log(`✅ ${name}`)
        this.passed++
      } catch (error) {
        console.log(`❌ ${name}`)
        console.log(`   Error: ${error.message}`)
        this.failed++
      }
    }
    
    console.log(`\n=== TEST RESULTS ===`)
    console.log(`Passed: ${this.passed}`)
    console.log(`Failed: ${this.failed}`)
    console.log(`Total: ${this.tests.length}`)
    
    if (this.failed > 0) {
      process.exit(1)
    }
  }

  assert(condition, message) {
    if (!condition) {
      throw new Error(message || 'Assertion failed')
    }
  }

  assertEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(message || `Expected ${expected}, got ${actual}`)
    }
  }

  assertDeepEqual(actual, expected, message) {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(message || `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`)
    }
  }
}

const test = new TestRunner()

// Test Date Normalization
test.test('normalizeDate handles YYYY-MM-DD format', () => {
  const date = normalizeDate('2024-01-15')
  test.assertEqual(date.getFullYear(), 2024)
  test.assertEqual(date.getMonth(), 0) // January = 0
  test.assertEqual(date.getDate(), 15)
  test.assertEqual(date.getHours(), 0) // Should be normalized to midnight
})

test.test('normalizeDate handles invalid dates', () => {
  const invalidDate = normalizeDate('invalid-date')
  test.assertEqual(invalidDate, null)
})

test.test('getEpochDay returns consistent values for same date', () => {
  const date1 = '2024-01-15'
  const date2 = new Date(2024, 0, 15)
  test.assertEqual(getEpochDay(date1), getEpochDay(date2))
})

// Test Business Day Calculation
test.test('getLastBusinessDay handles weekends correctly', () => {
  // January 2024: 31st is Wednesday, so last business day should be 31st
  const lastBizDay = getLastBusinessDay(2024, 0) // January 2024
  test.assertEqual(lastBizDay.getDate(), 31)
  
  // February 2024: 29th is Thursday (leap year), so last business day should be 29th
  const lastBizDayFeb = getLastBusinessDay(2024, 1) // February 2024
  test.assertEqual(lastBizDayFeb.getDate(), 29)
})

test.test('getLastBusinessDay skips weekends', () => {
  // June 2024: 30th is Sunday, 29th is Saturday, so last business day should be 28th (Friday)
  const lastBizDay = getLastBusinessDay(2024, 5) // June 2024
  test.assertEqual(lastBizDay.getDate(), 28)
  test.assertEqual(lastBizDay.getDay(), 5) // Friday
})

// Test Payment Due Logic - Weekly
test.test('isPaymentDue - weekly frequency works correctly', () => {
  const startDate = '2024-01-01' // Monday
  
  // Should be due on the start date
  test.assert(isPaymentDue('2024-01-01', startDate, 'weekly'))
  
  // Should be due 7 days later
  test.assert(isPaymentDue('2024-01-08', startDate, 'weekly'))
  
  // Should not be due 6 days later
  test.assert(!isPaymentDue('2024-01-07', startDate, 'weekly'))
  
  // Should not be due before start date
  test.assert(!isPaymentDue('2023-12-31', startDate, 'weekly'))
})

// Test Payment Due Logic - Bi-weekly
test.test('isPaymentDue - bi-weekly frequency works correctly', () => {
  const startDate = '2024-01-01'
  
  // Should be due on start date
  test.assert(isPaymentDue('2024-01-01', startDate, 'bi-weekly'))
  
  // Should be due 14 days later
  test.assert(isPaymentDue('2024-01-15', startDate, 'bi-weekly'))
  
  // Should not be due 7 days later (weekly would be due, bi-weekly shouldn't)
  test.assert(!isPaymentDue('2024-01-08', startDate, 'bi-weekly'))
})

// Test Payment Due Logic - Monthly
test.test('isPaymentDue - monthly frequency works correctly', () => {
  const startDate = '2024-01-15' // 15th of January
  
  // Should be due on start date
  test.assert(isPaymentDue('2024-01-15', startDate, 'monthly'))
  
  // Should be due on 15th of next month
  test.assert(isPaymentDue('2024-02-15', startDate, 'monthly'))
  
  // Should not be due on 14th or 16th
  test.assert(!isPaymentDue('2024-02-14', startDate, 'monthly'))
  test.assert(!isPaymentDue('2024-02-16', startDate, 'monthly'))
})

// Test Payment Due Logic - Monthly Edge Case (Month End)
test.test('isPaymentDue - monthly handles month-end dates correctly', () => {
  const startDate = '2024-01-31' // 31st of January
  
  // February only has 29 days in 2024 (leap year), so should be due on 29th
  test.assert(isPaymentDue('2024-02-29', startDate, 'monthly'))
  
  // Should not be due on 28th
  test.assert(!isPaymentDue('2024-02-28', startDate, 'monthly'))
  
  // March has 31 days, so should be due on 31st
  test.assert(isPaymentDue('2024-03-31', startDate, 'monthly'))
})

// Test Payment Due Logic - 15th and Last Business Day
test.test('isPaymentDue - 15th-and-last frequency works correctly', () => {
  const startDate = '2024-01-01'
  
  // Should be due on 15th of any month after start
  test.assert(isPaymentDue('2024-01-15', startDate, '15th-and-last'))
  test.assert(isPaymentDue('2024-02-15', startDate, '15th-and-last'))
  
  // Should be due on last business day of month
  // January 2024: 31st is Wednesday, so should be due on 31st
  test.assert(isPaymentDue('2024-01-31', startDate, '15th-and-last'))
  
  // Should not be due on other dates
  test.assert(!isPaymentDue('2024-01-16', startDate, '15th-and-last'))
  test.assert(!isPaymentDue('2024-01-30', startDate, '15th-and-last'))
})

// Test Cashflow Calculation - Simple Case
test.test('calculateCashflow - simple income and expense calculation', () => {
  const startingBalance = 1000
  const incomes = [{
    id: '1',
    name: 'Salary',
    amount: 500,
    frequency: 'weekly',
    nextPayDate: '2024-01-01'
  }]
  const creditCards = []
  const recurringExpenses = [{
    id: '1',
    name: 'Rent',
    amount: 200,
    frequency: 'weekly',
    nextDueDate: '2024-01-01'
  }]
  const oneTimeExpenses = []
  
  // Calculate for 7 days
  const result = calculateCashflow(startingBalance, incomes, creditCards, recurringExpenses, oneTimeExpenses, 7)
  
  // Should have 7 days of data
  test.assertEqual(result.length, 7)
  
  // First day should have income and expense
  test.assertEqual(result[0].income, 500)
  test.assertEqual(result[0].expenses, 200)
  test.assertEqual(result[0].netChange, 300)
  test.assertEqual(result[0].runningBalance, 1300) // 1000 + 300
  
  // Second day should have no transactions
  test.assertEqual(result[1].income, 0)
  test.assertEqual(result[1].expenses, 0)
  test.assertEqual(result[1].netChange, 0)
  test.assertEqual(result[1].runningBalance, 1300) // No change
})

// Test Cashflow Calculation - Multiple Income Sources
test.test('calculateCashflow - multiple income sources same day', () => {
  const startingBalance = 1000
  const incomes = [
    { id: '1', name: 'Salary', amount: 500, frequency: 'weekly', nextPayDate: '2024-01-01' },
    { id: '2', name: 'Freelance', amount: 200, frequency: 'weekly', nextPayDate: '2024-01-01' }
  ]
  const creditCards = []
  const recurringExpenses = []
  const oneTimeExpenses = []
  
  const result = calculateCashflow(startingBalance, incomes, creditCards, recurringExpenses, oneTimeExpenses, 7)
  
  // First day should have combined income
  test.assertEqual(result[0].income, 700) // 500 + 200
  test.assertEqual(result[0].runningBalance, 1700) // 1000 + 700
})

// Test Cashflow Calculation - Credit Card Payment
test.test('calculateCashflow - credit card payment on due date', () => {
  const startingBalance = 1000
  const incomes = []
  
  // Use today's date for the due date to ensure it matches
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}` // Local YYYY-MM-DD format
  
  const creditCards = [{
    id: '1',
    name: 'Credit Card',
    balance: 500,
    dueDate: todayStr,
    payDate: '' // Should use due date
  }]
  const recurringExpenses = []
  const oneTimeExpenses = []
  
  const result = calculateCashflow(startingBalance, incomes, creditCards, recurringExpenses, oneTimeExpenses, 3)
  
  // First day should have credit card payment as expense
  test.assertEqual(result[0].expenses, 500)
  test.assertEqual(result[0].runningBalance, 500) // 1000 - 500
})

// Test Cashflow Calculation - One-time Expense
test.test('calculateCashflow - one-time expense on specific date', () => {
  const startingBalance = 1000
  const incomes = []
  const creditCards = []
  const recurringExpenses = []
  
  // Use tomorrow's date for the one-time expense
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}` // Local YYYY-MM-DD format
  
  const oneTimeExpenses = [{
    id: '1',
    name: 'Vacation',
    amount: 300,
    date: tomorrowStr // Tomorrow (second day in projection)
  }]
  
  const result = calculateCashflow(startingBalance, incomes, creditCards, recurringExpenses, oneTimeExpenses, 5)
  
  // The expense should appear on the second day (tomorrow)
  test.assertEqual(result[1].expenses, 300)
  test.assertEqual(result[1].runningBalance, 700) // 1000 - 300
})

// Test Edge Case - Empty Data
test.test('calculateCashflow - handles empty data gracefully', () => {
  const result = calculateCashflow(1000, [], [], [], [], 3)
  
  test.assertEqual(result.length, 3)
  
  // All days should have no transactions but maintain balance
  result.forEach(day => {
    test.assertEqual(day.income, 0)
    test.assertEqual(day.expenses, 0)
    test.assertEqual(day.netChange, 0)
    test.assertEqual(day.runningBalance, 1000)
  })
})

// Test Edge Case - Negative Balance
test.test('calculateCashflow - handles negative balance correctly', () => {
  const startingBalance = 100
  const incomes = []
  const creditCards = []
  const recurringExpenses = [{
    id: '1',
    name: 'Rent',
    amount: 500,
    frequency: 'weekly',
    nextDueDate: '2024-01-01'
  }]
  const oneTimeExpenses = []
  
  const result = calculateCashflow(startingBalance, incomes, creditCards, recurringExpenses, oneTimeExpenses, 2)
  
  // First day should go negative
  test.assertEqual(result[0].expenses, 500)
  test.assertEqual(result[0].runningBalance, -400) // 100 - 500
})

// Test Date Formatting
test.test('formatShortDate formats correctly', () => {
  const date = new Date(2024, 0, 15) // January 15, 2024
  const formatted = formatShortDate(date)
  test.assertEqual(formatted, '1/15')
})

// Test Complex Scenario
test.test('calculateCashflow - complex real-world scenario', () => {
  const startingBalance = 2500
  
  // Use relative dates
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  const dayAfter = new Date(today)
  dayAfter.setDate(today.getDate() + 2)
  const threeDaysOut = new Date(today)
  threeDaysOut.setDate(today.getDate() + 3)
  const fourDaysOut = new Date(today)
  fourDaysOut.setDate(today.getDate() + 4)
  
  // Format dates as local YYYY-MM-DD strings to avoid timezone issues
  const formatLocalDate = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  
  const todayStr = formatLocalDate(today)
  const tomorrowStr = formatLocalDate(tomorrow)
  const dayAfterStr = formatLocalDate(dayAfter)
  const threeDaysOutStr = formatLocalDate(threeDaysOut)
  const fourDaysOutStr = formatLocalDate(fourDaysOut)
  
  const incomes = [
    { id: '1', name: 'Salary', amount: 1000, frequency: 'bi-weekly', nextPayDate: todayStr },
    { id: '2', name: 'Side Gig', amount: 200, frequency: 'weekly', nextPayDate: dayAfterStr }
  ]
  const creditCards = [
    { id: '1', name: 'CC1', balance: 800, dueDate: fourDaysOutStr, payDate: '' }
  ]
  const recurringExpenses = [
    { id: '1', name: 'Rent', amount: 1200, frequency: 'monthly', nextDueDate: todayStr },
    { id: '2', name: 'Groceries', amount: 100, frequency: 'weekly', nextDueDate: tomorrowStr }
  ]
  const oneTimeExpenses = [
    { id: '1', name: 'Car Repair', amount: 500, date: threeDaysOutStr }
  ]
  
  const result = calculateCashflow(startingBalance, incomes, creditCards, recurringExpenses, oneTimeExpenses, 14)
  
  test.assertEqual(result.length, 14)
  
  // Check that all amounts are numbers and balances are calculated correctly
  result.forEach((day, index) => {
    test.assert(typeof day.income === 'number', `Day ${index + 1} income should be number`)
    test.assert(typeof day.expenses === 'number', `Day ${index + 1} expenses should be number`)
    test.assert(typeof day.runningBalance === 'number', `Day ${index + 1} balance should be number`)
    
    // Running balance should be calculated correctly
    const expectedBalance = index === 0 
      ? startingBalance + day.netChange 
      : result[index - 1].runningBalance + day.netChange
    
    test.assertEqual(day.runningBalance, expectedBalance, `Day ${index + 1} balance calculation`)
  })
  
  // Check specific days have expected transactions
  test.assert(result[0].income > 0 || result[0].expenses > 0, 'First day should have transactions') // Today has salary + rent
  test.assert(result[1].expenses > 0, 'Second day should have groceries expense') // Tomorrow has groceries
})

// Run all tests
test.run().catch(console.error)