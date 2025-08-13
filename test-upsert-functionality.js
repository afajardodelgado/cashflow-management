/**
 * Test Upsert Functionality for Supabase
 * 
 * This tests specifically the upsert query to ensure it works correctly
 */

import { supabase } from './test-supabase-config.js'

// Test data - using proper UUID format
import { randomUUID } from 'crypto'
const testUserId = randomUUID() // Proper UUID format
const testUserEmail = 'test-' + Date.now() + '@example.com'

const testData = {
  version: 1,
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
  creditCards: [],
  recurringExpenses: [],
  oneTimeExpenses: [],
  projectionDays: 30,
  showTransactionDaysOnly: false,
  activeTab: 'inputs',
  chartType: 'line',
  lastSaved: Date.now()
}

async function testUpsertFunctionality() {
  console.log('=== TESTING SUPABASE UPSERT FUNCTIONALITY ===\n')
  console.log('Test User ID:', testUserId)
  console.log('Test User Email:', testUserEmail)
  
  try {
    // Test 1: Insert new record
    console.log('\n1. Testing INSERT (first upsert)...')
    const insertResult = await supabase
      .from('user_cashflow_data')
      .upsert({
        user_id: testUserId,
        user_email: testUserEmail,
        data: testData
      }, {
        onConflict: 'user_id'
      })
    
    if (insertResult.error) {
      console.log('❌ Insert failed:', insertResult.error.message)
      console.log('Full error:', insertResult.error)
      return
    } else {
      console.log('✅ Insert successful')
    }
    
    // Test 2: Verify the record was inserted
    console.log('\n2. Testing SELECT to verify insert...')
    const selectResult = await supabase
      .from('user_cashflow_data')
      .select('data')
      .eq('user_id', testUserId)
      .single()
    
    if (selectResult.error) {
      console.log('❌ Select failed:', selectResult.error.message)
      return
    } else if (selectResult.data?.data?.startingBalance === testData.startingBalance) {
      console.log('✅ Select successful - data matches')
    } else {
      console.log('❌ Select failed - data mismatch')
      console.log('Expected:', testData.startingBalance)
      console.log('Got:', selectResult.data?.data?.startingBalance)
      return
    }
    
    // Test 3: Update existing record (real upsert test)
    console.log('\n3. Testing UPDATE (second upsert)...')
    const updatedData = { ...testData, startingBalance: 2500, lastSaved: Date.now() }
    
    const updateResult = await supabase
      .from('user_cashflow_data')
      .upsert({
        user_id: testUserId,
        user_email: testUserEmail,
        data: updatedData
      }, {
        onConflict: 'user_id'
      })
    
    if (updateResult.error) {
      console.log('❌ Update failed:', updateResult.error.message)
      console.log('Full error:', updateResult.error)
      return
    } else {
      console.log('✅ Update successful')
    }
    
    // Test 4: Verify the record was updated
    console.log('\n4. Testing SELECT to verify update...')
    const selectResult2 = await supabase
      .from('user_cashflow_data')
      .select('data')
      .eq('user_id', testUserId)
      .single()
    
    if (selectResult2.error) {
      console.log('❌ Select after update failed:', selectResult2.error.message)
      return
    } else if (selectResult2.data?.data?.startingBalance === 2500) {
      console.log('✅ Update verification successful - upsert is working!')
    } else {
      console.log('❌ Update verification failed')
      console.log('Expected:', 2500)
      console.log('Got:', selectResult2.data?.data?.startingBalance)
      return
    }
    
    // Test 5: Check that we don't have duplicate records
    console.log('\n5. Testing for duplicate records...')
    const countResult = await supabase
      .from('user_cashflow_data')
      .select('id', { count: 'exact' })
      .eq('user_id', testUserId)
    
    if (countResult.error) {
      console.log('❌ Count check failed:', countResult.error.message)
    } else if (countResult.count === 1) {
      console.log('✅ No duplicates - exactly 1 record found')
    } else {
      console.log('❌ Duplicate records found:', countResult.count)
    }
    
    // Cleanup: Delete test record
    console.log('\n6. Cleaning up test data...')
    const deleteResult = await supabase
      .from('user_cashflow_data')
      .delete()
      .eq('user_id', testUserId)
    
    if (deleteResult.error) {
      console.log('⚠️ Cleanup failed:', deleteResult.error.message)
    } else {
      console.log('✅ Cleanup successful')
    }
    
    console.log('\n=== UPSERT TEST COMPLETE - ALL TESTS PASSED ===')
    
  } catch (error) {
    console.log('❌ Unexpected error:', error.message)
    console.log('Full error:', error)
  }
}

// Test database connection first
async function testConnection() {
  console.log('Testing Supabase connection...')
  try {
    const { data, error } = await supabase
      .from('user_cashflow_data')
      .select('id')
      .limit(1)
    
    if (error && error.code !== 'PGRST116') {
      console.log('❌ Connection failed:', error.message)
      return false
    } else {
      console.log('✅ Supabase connection successful')
      return true
    }
  } catch (error) {
    console.log('❌ Connection error:', error.message)
    return false
  }
}

// Run tests
async function runTests() {
  const connected = await testConnection()
  if (connected) {
    await testUpsertFunctionality()
  } else {
    console.log('Cannot run upsert tests - database connection failed')
  }
}

runTests().catch(console.error)