import { KeyFigures } from '../../features/key-figures/KeyFigures'
import { useSimpleKeyFigures } from '../../features/loan-comparison/use-simple-key-figures'
import { buildSearchFromLoanParameters } from '../../features/repayment-plan/loan-parameters-url'
import { useRepaymentPlan } from '../../features/repayment-plan/use-repayment-plan'
import { buildRouteHref } from '../../features/routing/resolve-route'
import { SimpleLoanForm } from '../../features/simple-loan-form/SimpleLoanForm'
import styles from './calculator-page.module.css'

export function CalculatorPage() {
  const {
    loanParameters,
    comparison,
    setPrincipal,
    setInterestRateForBothPeriods,
    setNumberOfTerms,
    setNumberOfInterestOnlyTerms,
    resetToDefaults,
  } = useRepaymentPlan()

  const keyFigures = useSimpleKeyFigures(loanParameters, comparison)
  const advancedHref = buildRouteHref(
    'advancedCalculator',
    import.meta.env.BASE_URL,
    `?${buildSearchFromLoanParameters(loanParameters)}`,
  )

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Avdragsfrikalkulator</h1>
        <p className={styles.subtitle}>
          Se hva avdragsfrihet koster deg over hele løpetiden.
        </p>
      </header>

      <main className={styles.content}>
        <SimpleLoanForm
          principal={loanParameters.principal}
          annualInterestRatePercent={loanParameters.annualInterestRatePercent}
          numberOfTerms={loanParameters.numberOfTerms}
          numberOfInterestOnlyTerms={loanParameters.numberOfInterestOnlyTerms}
          onPrincipalChange={setPrincipal}
          onAnnualInterestRatePercentChange={setInterestRateForBothPeriods}
          onNumberOfTermsChange={setNumberOfTerms}
          onNumberOfInterestOnlyTermsChange={setNumberOfInterestOnlyTerms}
          onReset={resetToDefaults}
        />

        <KeyFigures
          headline={keyFigures.headline}
          figures={keyFigures.figures}
        />
      </main>

      <footer className={styles.footer}>
        <p>
          Annuitetslån med nominell rente og månedlige terminer. Gebyrer er
          ikke tatt med.
        </p>
        <p>
          <a href={advancedHref}>
            Vil du se nedbetalingsplan, grafer og rentebytte? Åpne den
            avanserte kalkulatoren.
          </a>
        </p>
      </footer>
    </div>
  )
}
