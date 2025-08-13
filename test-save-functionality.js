/**
 * Test Save/Load Functionality
 * 
 * This tests the Supabase save and load functionality
 * Note: This requires Supabase to be configured and running
 */

import { saveUserState, loadUserState } from './src/lib/supabaseStorage.js'

// Test data structure
const testData = {
  startingBalance: 1500,
  incomes: [
    {
      id: 'test-income-1',
      name: 'Test Salary',
      amount: 2000,
      frequency: 'monthly',
      nextPayDate: '2025-08-15'
    }
  ],
  creditCards: [
    {
      id: 'test-cc-1',
      name: 'Test Credit Card',
      balance: 500,
      dueDate: '2025-08-20',
      payDate: ''
    }
  ],
  recurringExpenses: [
    {
      id: 'test-expense-1',
      name: 'Test Rent',
      amount: 800,
      category: 'Housing',
      frequency: 'monthly',
      nextDueDate: '2025-08-01'
    }
  ],
  oneTimeExpenses: [
    {
      id: 'test-onetime-1',
      name: 'Test Vacation',
      amount: 1000,
      category: 'Travel',
      date: '2025-08-25'
    }
  ],
  projectionDays: 60,
  showTransactionDaysOnly: false,
  activeTab: 'projection',
  chartType: 'bar'
}

async function testSaveLoad() {
  console.log('=== TESTING SAVE/LOAD FUNCTIONALITY ===\n')
  
  // Test with guest mode (should use localStorage)
  console.log('1. Testing Guest Mode (localStorage)...')
  try {
    const guestSaveResult = await saveUserState(null, null, testData)
    console.log('Guest save result:', guestSaveResult)
    
    const guestLoadResult = await loadUserState(null, null)
    console.log('Guest load result keys:', guestLoadResult ? Object.keys(guestLoadResult) : 'null')
    
    if (guestLoadResult && guestLoadResult.startingBalance === testData.startingBalance) {
      console.log('✅ Guest mode save/load working correctly')
    } else {
      console.log('❌ Guest mode save/load failed')
      console.log('Expected startingBalance:', testData.startingBalance)
      console.log('Got startingBalance:', guestLoadResult?.startingBalance)
    }
  } catch (error) {
    console.log('❌ Guest mode error:', error.message)
  }
  
  console.log('\n2. Testing User Mode (Supabase)...')
  
  // Test with a fake user ID (this will likely fail without proper auth)
  const testUserId = 'test-user-123'
  const testUserEmail = 'test@example.com'
  
  try {
    console.log('Attempting to save user data...')
    const userSaveResult = await saveUserState(testUserId, testUserEmail, testData)
    console.log('User save result:', userSaveResult)
    
    if (userSaveResult.success) {
      console.log('✅ User save successful, testing load...')
      
      const userLoadResult = await loadUserState(testUserId, testUserEmail)
      console.log('User load result keys:', userLoadResult ? Object.keys(userLoadResult) : 'null')
      
      if (userLoadResult && userLoadResult.startingBalance === testData.startingBalance) {
        console.log('✅ User mode save/load working correctly')
        
        // Test upsert by saving again with different data
        console.log('\n3. Testing Upsert (update existing record)...')
        const updatedData = { ...testData, startingBalance: 2500 }
        const updateResult = await saveUserState(testUserId, testUserEmail, updatedData)
        console.log('Update save result:', updateResult)
        
        const updatedLoadResult = await loadUserState(testUserId, testUserEmail)
        if (updatedLoadResult && updatedLoadResult.startingBalance === 2500) {
          console.log('✅ Upsert functionality working correctly')
        } else {
          console.log('❌ Upsert failed - expected 2500, got:', updatedLoadResult?.startingBalance)
        }
      } else {
        console.log('❌ User mode load failed')
        console.log('Expected startingBalance:', testData.startingBalance)
        console.log('Got startingBalance:', userLoadResult?.startingBalance)
      }
    } else {
      console.log('❌ User save failed:', userSaveResult.message)
      console.log('This is expected if Supabase is not configured or user is not authenticated')
    }
  } catch (error) {
    console.log('❌ User mode error:', error.message)
    console.log('This is expected if Supabase is not configured or user is not authenticated')
  }
  
  console.log('\n=== SAVE/LOAD TEST COMPLETE ===')
}

// Run the test
testSaveLoad().catch(console.error)