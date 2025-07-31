# Cashflow Management Application

A React-based household cashflow management tool that provides 90-day rolling projections with mobile-responsive design.

## Features

### Core Functionality
- **Multiple Income Sources**: Support for salaries with different pay frequencies (weekly, bi-weekly, monthly)
- **Credit Card Management**: Track total balances with due dates and payment status (auto/manual)
- **Recurring Expenses**: Custom categories for rent, car payments, utilities, etc.
- **One-Time Expenses**: Future expenses like vacations, repairs
- **90-Day Projection**: Daily cashflow visualization with negative balance indicators
- **Data Persistence**: Save/load functionality using localStorage
- **CSV Export**: Export projections with daily columns

### Financial Logic
- **Income**: Positive cashflow additions based on pay schedules
- **Expenses**: Automatic deductions from cashflow
- **Credit Cards**: Default to due date payments, with manual override options
- **Currency**: USD-focused, US-centered application
- **Calculations**: Simple arithmetic operations for cashflow projection

## Design System

### Color Palette
```css
--bg-cream: #FFFFF8      /* Background - Off-white/cream */
--primary-green: #2A623C  /* Primary accent - Dark forest green */
--secondary-gray: #80807C /* Secondary text - Medium gray */
--text-black: #000000     /* Primary text - Pure black */
--white: #FFFFFF          /* Cards and buttons - Pure white */
```

### Typography
- **Font Stack**: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif
- **H1**: 1.75rem, font-weight: 700, line-height: 1.1
- **H2**: 1.25rem, font-weight: 600, line-height: 1.2
- **H3**: 1.1rem, font-weight: 600, line-height: 1.2
- **Body**: line-height: 1.4, margin-bottom: 0.5rem

### Layout & Spacing
- **Philosophy**: 40% more compact than standard layouts
- **Spacing Scale**: 0.25rem to 2rem with consistent increments
- **Main padding**: 1.2rem 2rem
- **Card padding**: 0.75rem
- **Button padding**: 0.25rem 0.75rem

### Components
- **Buttons**: Rounded rectangles with thin borders, hover states
- **Cards**: Subtle borders with rounded corners
- **Navigation**: Clean underlined tabs (140px width)
- **Input Fields**: Compact design (max-width: 240px)
- **Negative Numbers**: Red color with parentheses formatting

## Development Setup

### Prerequisites
- Node.js (Latest LTS recommended)
- npm or yarn

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development Server
The app runs on `http://localhost:5173/` with hot module replacement enabled.

## Project Structure

```
src/
├── App.jsx          # Main application component with tab navigation
├── App.css          # Mobile responsiveness styles
├── index.css        # Design system and base styles
├── main.jsx         # React application entry point
└── assets/          # Static assets
```

## Usage

### Navigation
The application uses a tabbed interface:
- **Inputs**: Configure income, expenses, and starting balance
- **Projection**: View 90-day daily cashflow visualization
- **Export**: Download cashflow data as CSV

### Input Configuration
1. **Starting Balance**: Set initial account balance
2. **Income Sources**: Add multiple salary sources with different pay frequencies
3. **Credit Cards**: Input total balances and due dates
4. **Recurring Expenses**: Monthly bills with custom categories
5. **One-Time Expenses**: Future planned expenses

### Projection View
- Daily cashflow amounts for 90 rolling days
- Red indicators for negative balances (displayed as parentheses)
- Current balance tracking

### Data Management
- Automatic saving to browser localStorage
- CSV export with daily columns
- Data persistence across browser sessions

## Technical Architecture

### State Management
- React useState hooks for component state
- Simple data structures for financial calculations
- Local storage for data persistence

### Responsive Design
- Mobile-first approach
- Flexible navigation tabs
- Responsive input fields and cards
- Optimized for touch interfaces

### Browser Support
- Modern browsers with ES6+ support
- Mobile Safari and Chrome optimized
- No IE support required

## Development Notes

### Code Style
- Functional React components
- ES6+ JavaScript
- CSS custom properties (variables)
- Mobile-responsive design patterns

### Performance
- Vite for fast development builds
- Minimal dependencies
- Efficient re-rendering patterns
- Local data storage only

## Future Enhancements
- Multiple currency support
- Bank account integration
- Advanced reporting features
- Goal setting and tracking
- Multi-user household support
