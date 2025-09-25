#!/usr/bin/env node

/**
 * Test Runner for Cashflow App
 * Runs all test files in the tests directory
 */

import { spawn } from 'child_process'
import { promises as fs } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
}

async function runTest(testFile) {
  return new Promise((resolve) => {
    console.log(`${colors.cyan}Running ${testFile}...${colors.reset}`)
    
    const child = spawn('node', [testFile], {
      stdio: 'inherit',
      cwd: __dirname
    })
    
    child.on('close', (code) => {
      if (code === 0) {
        console.log(`${colors.green}✓ ${testFile} passed${colors.reset}\n`)
        resolve({ file: testFile, passed: true })
      } else {
        console.log(`${colors.red}✗ ${testFile} failed${colors.reset}\n`)
        resolve({ file: testFile, passed: false })
      }
    })
  })
}

async function main() {
  console.log(`${colors.blue}╔════════════════════════════════════════════╗${colors.reset}`)
  console.log(`${colors.blue}║     CASHFLOW APP TEST SUITE               ║${colors.reset}`)
  console.log(`${colors.blue}╚════════════════════════════════════════════╝${colors.reset}\n`)
  
  try {
    // Get all test files
    const files = await fs.readdir(__dirname)
    let testFiles = files.filter(f => f.startsWith('test-') && f.endsWith('.js'))

    const hasSupabaseEnv = Boolean(process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY)
    if (!hasSupabaseEnv) {
      const skipped = ['test-supabase-config.js', 'test-upsert-functionality.js']
      testFiles = testFiles.filter(f => !skipped.includes(f))
      console.log(`${colors.yellow}Supabase env not found. Skipping: ${skipped.join(', ')}${colors.reset}`)
    }
    
    if (testFiles.length === 0) {
      console.log(`${colors.yellow}No test files found${colors.reset}`)
      process.exit(0)
    }
    
    console.log(`Found ${testFiles.length} test file(s)\n`)
    
    // Run tests sequentially
    const results = []
    for (const testFile of testFiles) {
      const result = await runTest(testFile)
      results.push(result)
    }
    
    // Summary
    console.log(`${colors.blue}╔════════════════════════════════════════════╗${colors.reset}`)
    console.log(`${colors.blue}║     TEST SUMMARY                           ║${colors.reset}`)
    console.log(`${colors.blue}╚════════════════════════════════════════════╝${colors.reset}\n`)
    
    const passed = results.filter(r => r.passed).length
    const failed = results.filter(r => !r.passed).length
    
    console.log(`${colors.green}Passed: ${passed}${colors.reset}`)
    console.log(`${colors.red}Failed: ${failed}${colors.reset}`)
    console.log(`Total: ${results.length}\n`)
    
    if (failed > 0) {
      console.log(`${colors.red}Some tests failed!${colors.reset}`)
      process.exit(1)
    } else {
      console.log(`${colors.green}All tests passed!${colors.reset}`)
      process.exit(0)
    }
  } catch (error) {
    console.error(`${colors.red}Error running tests:${colors.reset}`, error)
    process.exit(1)
  }
}

main()