# Cashflow Management Application - Context for Claude

## Application Overview
This is a React-based household cashflow management application that provides 90-day rolling financial projections with a mobile-responsive design. The app operates entirely in the browser with optional Supabase authentication for data persistence.

## Core Purpose
- **Primary Goal**: Help users visualize and plan their personal cashflow over the next 90 days
- **Key Philosophy**: "Judgment-free" financial planning focused on forward-looking projections, not historical transaction analysis
- **Target Users**: Individuals and households needing simple, visual cashflow management without complex banking integrations

## Application Architecture

### Technology Stack
- **Frontend**: React 19.1.0 with Vite build system
- **State Management**: React Context API (`FinancialContext`)
- **Authentication**: Supabase (optional, supports guest mode)
- **Data Storage**: Supabase for authenticated users, localStorage for guest users
- **Charting**: Recharts for line charts, Nivo Sankey for flow diagrams
- **Email**: EmailJS for notifications

### Project Structure
```
src/
├── App.jsx                    # Main app with tab navigation
├── App.css                   # Mobile responsive styles
├── index.css                 # Design system and base styles
├── main.jsx                  # React entry point
├── components/               # Reusable UI components
│   ├── ChartErrorBoundary.jsx
│   ├── SupabaseAuthGuard.jsx
│   └── SupabaseAuthModal.jsx
├── context/
│   └── FinancialContext.jsx  # Global state management
├── hooks/                    # Custom React hooks
├── lib/                      # Core business logic
│   ├── analysis.js           # Financial analysis calculations
│   ├── cashflow.js           # Cashflow projection engine
│   ├── csv.js                # CSV export functionality
│   ├── format.js             # Date/currency formatting
│   ├── storage.js            # localStorage utilities
│   └── supabase*.js          # Supabase integration
├── pages/                    # Main application pages
│   ├── InputsPage/           # Data entry forms
│   ├── ProjectionPage/       # Charts and tables
│   └── InsightsPage/         # Analytics and breakdowns
└── services/                 # External service integrations
    ├── calculations/         # Financial calculation services
    ├── export/               # Data export services
    └── supabase/             # Database operations
```

## Core Features & Functionality

### 1. Input Management
- **Starting Balance**: Initial account balance
- **Income Sources**: Multiple salaries with configurable pay frequencies:
  - Weekly, bi-weekly, monthly, 15th-and-last business day
- **Credit Cards**: Balance tracking with due dates (auto-pay vs manual payment options)
- **Recurring Expenses**: Monthly bills with custom categories
- **One-Time Expenses**: Future planned expenses with specific dates

### 2. Financial Projection Engine (`src/lib/cashflow.js`)
- **Core Function**: `calculateCashflow()` processes 90-day rolling projections
- **Date Logic**: Sophisticated payment scheduling with business day handling
- **Calculation Flow**:
  1. Iterate through each day in projection period
  2. Calculate daily income based on pay schedules
  3. Calculate daily expenses (recurring + one-time + credit cards)
  4. Compute net change and running balance
  5. Track negative balance periods

### 3. User Interface (Tab-Based Navigation)
- **Inputs Tab**: All data entry forms with live projection preview
- **Projection Tab**: Full-screen visualization with charts and detailed tables
- **Insights Tab**: Advanced analytics with summary metrics and Sankey diagrams
- **Export PDF Tab**: Placeholder for future PDF export functionality

### 4. Data Visualization
- **Line Charts**: Daily balance progression using Recharts
- **Sankey Diagrams**: Income-to-expense flow visualization using Nivo
- **Data Tables**: Detailed daily breakdown with negative balance highlighting
- **Summary Metrics**: Total income, expenses, savings rate, net cashflow

### 5. Data Persistence
- **Authenticated Users**: Automatic save to Supabase with conflict resolution
- **Guest Users**: localStorage with manual save/load functionality
- **Export Options**: CSV export with daily columns

## Key Business Logic

### Financial Calculations
- **Income Processing**: Multi-frequency payroll calculation with proper date handling
- **Expense Tracking**: Recurring and one-time expense scheduling
- **Credit Card Logic**: Flexible due date vs. custom payment date handling
- **Balance Projection**: Running balance calculation with negative balance detection

### Date Handling
- **Normalization**: All dates normalized to midnight for consistent comparison
- **Business Days**: Last business day calculation for month-end payroll
- **Pay Frequencies**: Complex logic for bi-weekly, monthly, and custom schedules

### State Management
- **Global Context**: `FinancialContext` manages all financial data
- **Auto-Save**: 2-second debounced auto-save functionality
- **Data Validation**: Input validation and error handling throughout

## Design System

### Color Palette
- **Background**: `#FFFFF8` (cream/off-white)
- **Primary**: `#2A623C` (dark forest green)
- **Secondary**: `#80807C` (medium gray)
- **Text**: `#000000` (pure black)
- **Cards**: `#FFFFFF` (pure white)

### Typography & Spacing
- **Philosophy**: 40% more compact than standard layouts
- **Font Stack**: Apple system fonts with fallbacks
- **Responsive**: Mobile-first approach with flexible components

## Authentication & Security
- **Supabase Integration**: Optional authentication with email/password
- **Guest Mode**: Full functionality without account creation
- **Data Privacy**: No transaction history access, no banking integrations
- **Security**: No sensitive data logging, secure credential handling

## Testing Strategy
- **Test Suites**: Comprehensive testing with custom Node.js test runner
  - `npm run test:math`: Mathematical calculation validation
  - `npm run test:save`: Data persistence functionality
  - `npm run test:supabase`: Authentication and database operations
  - `npm run test:upsert`: Data synchronization logic

## Unique Characteristics

### Humor & Personality
- **Taglines**: Extensive collection of humorous taglines emphasizing "judgment-free" financial planning
- **Anti-Plaid Messaging**: Deliberately contrasts with traditional banking apps that show transaction history
- **Luxury References**: Playful references to expensive lifestyle choices (St. Tropez, Aspen, etc.)

### Financial Philosophy
- **Forward-Looking**: Focus on future projections, not past transactions
- **Simplicity**: No complex categorization or detailed transaction tracking
- **Privacy**: No access to banking data or transaction history
- **Practical**: 90-day horizon for actionable financial planning

## Development Commands
- `npm run dev`: Start development server (Vite)
- `npm run build`: Production build
- `npm test`: Run all test suites
- `npm run lint`: Code linting with ESLint

## Design Standards & UI/UX Guidelines

This file contains comprehensive specifications for:
- Grid and Layout (Desktop & Mobile)
- Typography (Pretendard font family)
- Components (Buttons, Inputs, Navigation, etc.)
- Colors and spacing
- Common micro-experiences (Login, Sign Up, etc.)

**Before implementing any UI/UX features, LLMs MUST review the design standards file to ensure compliance.**

### 🚫 CRITICAL RULE: NO EMOJIS IN APPLICATION

**NEVER use emojis in any UI/UX-facing code:**
- ❌ No emojis in HTML
- ❌ No emojis in JavaScript strings shown to users
- ❌ No emojis in CSS content
- ❌ No emojis in user-facing text
- ❌ No emojis in buttons, labels, headings, or any visible content
- ✅ Emojis are ONLY allowed in: code comments, commit messages, and this documentation file

**If you see emojis in any UI/UX code, DELETE them immediately.**

## Git Workflow - Branch, Merge, and Clean Protocol

**⚠️ NO PULL REQUESTS**

This project operates with a **branch → merge to main → delete branch** workflow. There is no code review process via Pull Requests at this stage.

### 🔴 IMPORTANT: When to Trigger Git Workflow

**DO NOT** automatically run git commands. **ONLY** execute the git workflow when the user explicitly indicates we're at a good stopping point, such as:
- "OK we are at a good checkpoint"
- "OK let's merge"
- "Let's commit this"
- "Push this up"
- Any similar phrase indicating it's time to commit and merge

### 🔴 IMPORTANT: Execute Git Commands ONE AT A TIME

**NEVER** run multiple git commands in a single batch. Execute **ONE command at a time** and wait for confirmation before proceeding to the next. This allows for:
- Verification at each step
- Error handling between commands
- User visibility into the process
- Ability to stop if issues arise

### Standard Git Workflow

When working on new features or changes:

1. **Create feature branch**: `git checkout -b feature-name`
2. **Make changes and commit**: Work on your feature branch
3. **WAIT for user signal** (e.g., "OK let's merge", "good checkpoint")
4. **Execute git commands ONE AT A TIME:**
   - Step 1: `git add .`
   - Step 2: `git commit -m "descriptive message"`
   - Step 3: `git checkout main`
   - Step 4: `git merge feature-name`
   - Step 5: `git push origin main`
   - Step 6: `git branch -d feature-name`

**Command Reference (execute ONE at a time):**
```bash
# Step 1: Stage changes
git add .

# Step 2: Commit with message
git commit -m "descriptive message"

# Step 3: Switch to main
git checkout main

# Step 4: Merge feature branch
git merge feature-name

# Step 5: Push to main
git push origin main

# Step 6: Delete local branch
git branch -d feature-name
```

**Never create Pull Requests.** All code goes directly to main after local verification and branch cleanup.

## Context for Development
When working on this codebase:
1. **Maintain the humor**: The taglines and personality are core to the app's identity
2. **Preserve simplicity**: Avoid over-complicating the financial logic
3. **Mobile-first**: Always consider mobile responsiveness
4. **Test thoroughly**: Use the existing test suites for mathematical validation
5. **Follow existing patterns**: Use the established Context API patterns and component structure
6. **Respect the philosophy**: Keep the focus on forward-looking, judgment-free financial planning
7. **NO EMOJIS**: Never use emojis in any user-facing code (HTML, JS, CSS, text)