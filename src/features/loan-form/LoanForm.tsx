import { maximumInterestOnlyTermsFor } from '../repayment-plan/constraints'
import { Card } from '../ui/card/Card'
import { NumberField } from '../ui/number-field/NumberField'
import styles from './loan-form.module.css'
import type { LoanFormProps } from './types'

const MONTHS_PER_YEAR = 12

export function LoanForm({
  principal,
  annualInterestRatePercent,
  interestRateAfterInterestOnlyPeriodPercent,
  numberOfTerms,
  numberOfInterestOnlyTerms,
  onPrincipalChange,
  onAnnualInterestRatePercentChange,
  onInterestRateAfterInterestOnlyPeriodPercentChange,
  onNumberOfTermsChange,
  onNumberOfInterestOnlyTermsChange,
  onReset,
}: LoanFormProps) {
  return (
    <Card
      title="Lånet ditt"
      action={
        <button className={styles.reset} type="button" onClick={onReset}>
          Tilbakestill
        </button>
      }
    >
      <div className={styles.fields}>
        <NumberField
          label="Opprinnelig lånebeløp"
          value={principal}
          minimum={0}
          step={1000}
          unit="kroner"
          onChange={onPrincipalChange}
        />

        <NumberField
          label="Nominell rente"
          value={annualInterestRatePercent}
          minimum={0}
          step={0.1}
          unit="prosent"
          onChange={onAnnualInterestRatePercentChange}
        />

        <NumberField
          label="Rente etter avdragsfri periode"
          value={interestRateAfterInterestOnlyPeriodPercent}
          minimum={0}
          step={0.1}
          unit="prosent"
          helpText={
            numberOfInterestOnlyTerms === 0
              ? 'Gjelder fra første termin når du ikke har avdragsfrihet.'
              : `Gjelder fra termin ${numberOfInterestOnlyTerms + 1} i begge scenarioene.`
          }
          onChange={onInterestRateAfterInterestOnlyPeriodPercentChange}
        />

        <NumberField
          label="Løpetid"
          value={numberOfTerms / MONTHS_PER_YEAR}
          minimum={1 / MONTHS_PER_YEAR}
          step={1}
          unit="år"
          onChange={(years) => onNumberOfTermsChange(years * MONTHS_PER_YEAR)}
        />

        <NumberField
          label="Avdragsfrihet"
          value={numberOfInterestOnlyTerms / MONTHS_PER_YEAR}
          minimum={0}
          maximum={maximumInterestOnlyTermsFor(numberOfTerms) / MONTHS_PER_YEAR}
          step={1}
          unit="år"
          helpText={
            numberOfInterestOnlyTerms === 0
              ? 'Uten avdragsfrie terminer blir de to planene like.'
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
