import { maximumInterestOnlyTermsFor } from '../repayment-plan/constraints'
import { Card } from '../ui/card/Card'
import { Disclosure } from '../ui/disclosure/Disclosure'
import { NumberField } from '../ui/number-field/NumberField'
import styles from './simple-loan-form.module.css'
import type { SimpleLoanFormProps } from './types'

const MONTHS_PER_YEAR = 12

export function SimpleLoanForm({
  principal,
  annualInterestRatePercent,
  numberOfTerms,
  numberOfInterestOnlyTerms,
  onPrincipalChange,
  onAnnualInterestRatePercentChange,
  onNumberOfTermsChange,
  onNumberOfInterestOnlyTermsChange,
  onReset,
}: SimpleLoanFormProps) {
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
          label="Lånebeløp"
          value={principal}
          minimum={0}
          step={1000}
          unit="kroner"
          onChange={onPrincipalChange}
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

      <Disclosure summary="Innstillinger">
        <NumberField
          label="Nominell rente"
          value={annualInterestRatePercent}
          minimum={0}
          step={0.1}
          unit="prosent"
          onChange={onAnnualInterestRatePercentChange}
        />

        <NumberField
          label="Løpetid"
          value={numberOfTerms / MONTHS_PER_YEAR}
          minimum={1 / MONTHS_PER_YEAR}
          step={1}
          unit="år"
          onChange={(years) => onNumberOfTermsChange(years * MONTHS_PER_YEAR)}
        />
      </Disclosure>
    </Card>
  )
}
