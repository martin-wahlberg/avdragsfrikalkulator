import { Card } from '../ui/card/Card'
import { NumberField } from '../ui/number-field/NumberField'
import './LoanForm.css'

const MONTHS_PER_YEAR = 12

interface LoanFormProps {
  principal: number
  annualInterestRatePercent: number
  numberOfTerms: number
  numberOfInterestOnlyTerms: number
  onPrincipalChange: (principal: number) => void
  onAnnualInterestRatePercentChange: (annualInterestRatePercent: number) => void
  onNumberOfTermsChange: (numberOfTerms: number) => void
  onNumberOfInterestOnlyTermsChange: (numberOfInterestOnlyTerms: number) => void
  onReset: () => void
}

export function LoanForm({
  principal,
  annualInterestRatePercent,
  numberOfTerms,
  numberOfInterestOnlyTerms,
  onPrincipalChange,
  onAnnualInterestRatePercentChange,
  onNumberOfTermsChange,
  onNumberOfInterestOnlyTermsChange,
  onReset,
}: LoanFormProps) {
  return (
    <Card
      title="Lånet ditt"
      action={
        <button className="loan-form__reset" type="button" onClick={onReset}>
          Tilbakestill
        </button>
      }
    >
      <div className="loan-form__fields">
        <NumberField
          label="Opprinnelig lånebeløp"
          value={principal}
          minimum={100000}
          maximum={15000000}
          step={1000}
          unit="kroner"
          onChange={onPrincipalChange}
        />

        <NumberField
          label="Nominell rente"
          value={annualInterestRatePercent}
          minimum={0}
          maximum={15}
          step={0.1}
          unit="prosent"
          onChange={onAnnualInterestRatePercentChange}
        />

        <NumberField
          label="Løpetid"
          value={numberOfTerms / MONTHS_PER_YEAR}
          minimum={1}
          maximum={40}
          step={1}
          unit="år"
          onChange={(years) => onNumberOfTermsChange(years * MONTHS_PER_YEAR)}
        />

        <NumberField
          label="Avdragsfrihet"
          value={numberOfInterestOnlyTerms / MONTHS_PER_YEAR}
          minimum={0}
          maximum={numberOfTerms / MONTHS_PER_YEAR}
          step={1}
          unit="år"
          helpText={
            numberOfInterestOnlyTerms === 0
              ? 'Ingen avdragsfrihet — de to planene blir like.'
              : undefined
          }
          onChange={(years) =>
            onNumberOfInterestOnlyTermsChange(years * MONTHS_PER_YEAR)
          }
        />
      </div>
    </Card>
  )
}
