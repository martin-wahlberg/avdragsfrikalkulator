import { useState } from 'react'
import { KeyFigures } from '../../features/key-figures/KeyFigures'
import { LoanChartCard } from '../../features/loan-chart-card/LoanChartCard'
import { formatTermsAsYearsAndMonths } from '../../features/formatting/formatting'
import type { CostChartView } from '../../features/loan-comparison/types'
import {
  useCostChart,
  useRemainingDebtChart,
} from '../../features/loan-comparison/use-chart-series'
import { useSimpleKeyFigures } from '../../features/loan-comparison/use-simple-key-figures'
import { buildSearchFromLoanParameters } from '../../features/repayment-plan/loan-parameters-url'
import { useRepaymentPlan } from '../../features/repayment-plan/use-repayment-plan'
import { buildRouteHref } from '../../features/routing/resolve-route'
import { SimpleLoanForm } from '../../features/simple-loan-form/SimpleLoanForm'
import { SegmentedControl } from '../../features/ui/segmented-control/SegmentedControl'
import styles from './calculator-page.module.css'

const COST_VIEW_OPTIONS = [
  { value: 'accumulatedInterest', label: 'Akkumulerte renter' },
  { value: 'payment', label: 'Terminbeløp' },
] as const

export function CalculatorPage() {
  const {
    loanParameters,
    comparison,
    setPrincipal,
    setInterestRateForBothPeriods,
    setNumberOfTerms,
    setNumberOfInterestOnlyTerms,
    setExtendsTermByInterestOnlyPeriod,
    resetToDefaults,
  } = useRepaymentPlan()

  const [costView, setCostView] = useState<CostChartView>('accumulatedInterest')

  const keyFigures = useSimpleKeyFigures(loanParameters, comparison)
  const remainingDebtChart = useRemainingDebtChart(loanParameters, comparison)
  const costChart = useCostChart(loanParameters, comparison, costView)

  const interestOnlyDescription =
    loanParameters.numberOfInterestOnlyTerms > 0
      ? `Det skraverte feltet er de ${formatTermsAsYearsAndMonths(loanParameters.numberOfInterestOnlyTerms)} med avdragsfrihet.`
      : 'Uten avdragsfrie terminer er de to planene identiske.'
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
          effectiveInterestOnlyTerms={comparison.effectiveInterestOnlyTerms}
          extendsTermByInterestOnlyPeriod={
            loanParameters.extendsTermByInterestOnlyPeriod
          }
          onPrincipalChange={setPrincipal}
          onAnnualInterestRatePercentChange={setInterestRateForBothPeriods}
          onNumberOfTermsChange={setNumberOfTerms}
          onNumberOfInterestOnlyTermsChange={setNumberOfInterestOnlyTerms}
          onExtendsTermByInterestOnlyPeriodChange={
            setExtendsTermByInterestOnlyPeriod
          }
          onReset={resetToDefaults}
        />

        <KeyFigures
          headline={keyFigures.headline}
          figures={keyFigures.figures}
        />

        <LoanChartCard
          title="Restgjeld gjennom løpetiden"
          description={`Med avdragsfrihet står gjelden stille, og ${loanParameters.extendsTermByInterestOnlyPeriod ? 'nedbetalingen starter først etterpå' : 'må hentes inn igjen på færre terminer'}. ${interestOnlyDescription}`}
          ariaLabel="Linjediagram over restgjeld med og uten avdragsfrihet gjennom hele løpetiden"
          series={remainingDebtChart.series}
          maximumValue={remainingDebtChart.maximumValue}
          shadedPointCount={remainingDebtChart.shadedPointCount}
        />

        <LoanChartCard
          title="Kostnader gjennom løpetiden"
          description={
            costView === 'accumulatedInterest'
              ? 'Summen av alt du har betalt i renter så langt. Avstanden mellom linjene på slutten er merkostnaden ved avdragsfrihet.'
              : 'Hva du betaler hver måned. Med avdragsfrihet betaler du mindre i starten og mer resten av løpetiden.'
          }
          ariaLabel={
            costView === 'accumulatedInterest'
              ? 'Linjediagram over akkumulerte renter med og uten avdragsfrihet'
              : 'Linjediagram over terminbeløp med og uten avdragsfrihet'
          }
          series={costChart.series}
          maximumValue={costChart.maximumValue}
          shadedPointCount={costChart.shadedPointCount}
          action={
            <SegmentedControl
              options={COST_VIEW_OPTIONS}
              selectedValue={costView}
              ariaLabel="Velg hva kostnadsgrafen viser"
              onChange={setCostView}
            />
          }
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
