import { formatTermsAsYearsAndMonths } from '../formatting/formatting'
import { Card } from '../ui/card/Card'
import { Checkbox } from '../ui/checkbox/Checkbox'
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
  effectiveInterestOnlyTerms,
  extendsTermByInterestOnlyPeriod,
  onPrincipalChange,
  onAnnualInterestRatePercentChange,
  onNumberOfTermsChange,
  onNumberOfInterestOnlyTermsChange,
  onExtendsTermByInterestOnlyPeriodChange,
  onReset,
}: SimpleLoanFormProps) {
  const isLimitedByLoanTerm =
    effectiveInterestOnlyTerms < numberOfInterestOnlyTerms
  const interestOnlyHelpText = isLimitedByLoanTerm
    ? `Begrenset til ${formatTermsAsYearsAndMonths(effectiveInterestOnlyTerms)}, fordi minst én termin må betale avdrag.`
    : numberOfInterestOnlyTerms === 0
      ? 'Uten avdragsfrie terminer blir de to planene like.'
      : undefined

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
          step={1}
          unit="år"
          helpText={interestOnlyHelpText}
          onChange={(years) =>
            onNumberOfInterestOnlyTermsChange(years * MONTHS_PER_YEAR)
          }
        />
      </div>

      <div className={styles.toggle}>
        <Checkbox
          label="Legg avdragsfriheten til løpetiden"
          checked={extendsTermByInterestOnlyPeriod}
          helpText={
            extendsTermByInterestOnlyPeriod
              ? `Lånet nedbetales fortsatt over ${numberOfTerms / MONTHS_PER_YEAR} år, men starter først etter den avdragsfrie perioden.`
              : 'Avdragsfriheten spiser av løpetiden, så lånet må nedbetales på færre terminer.'
          }
          onChange={onExtendsTermByInterestOnlyPeriodChange}
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
          label={
            extendsTermByInterestOnlyPeriod ? 'Nedbetalingstid' : 'Løpetid'
          }
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
