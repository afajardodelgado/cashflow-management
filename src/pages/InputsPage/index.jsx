import SettingsSection from './components/SettingsSection'
import IncomeSection from './components/IncomeSection'
import CreditCardSection from './components/CreditCardSection'
import ExpenseSection from './components/ExpenseSection'

const InputsPage = () => {
  return (
    <div className="inputs-panel">
      <h2>Inputs</h2>
      <SettingsSection />
      <IncomeSection />
      <CreditCardSection />
      <ExpenseSection />
    </div>
  )
}

export default InputsPage