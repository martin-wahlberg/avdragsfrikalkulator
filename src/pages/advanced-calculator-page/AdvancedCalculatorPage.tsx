import { useState } from 'react'
import { KeyFigures } from '../../features/key-figures/KeyFigures'
import { LoanForm } from '../../features/loan-form/LoanForm'
import { buildSearchFromLoanParameters } from '../../features/repayment-plan/loan-parameters-url'
import { useRepaymentPlan } from '../../features/repayment-plan/use-repayment-plan'
import { RepaymentScheduleTable } from '../../features/repayment-schedule-table/RepaymentScheduleTable'
import { SegmentedControl } from '../../features/ui/segmented-control/SegmentedControl'
import { formatTermsAsYearsAndMonths } from '../../features/formatting/formatting'
import { LoanChartCard } from '../../features/loan-chart-card/LoanChartCard'
import type {
  CostChartView,
  ScheduleGrouping,
} from '../../features/loan-comparison/types'
import { buildRouteHref } from '../../features/routing/resolve-route'
import { useCostChart, useRemainingDebtChart } from '../../features/loan-comparison/use-chart-series'
import { useKeyFigures } from '../../features/loan-comparison/use-key-figures'
import { useScheduleRows } from '../../features/loan-comparison/use-schedule-rows'
import styles from './advanced-calculator-page.module.css'

const COST_VIEW_OPTIONS = [
  { value: 'accumulatedInterest', label: 'Akkumulerte renter' },
  { value: 'payment', label: 'Terminbeløp' },
] as const

const GROUPING_OPTIONS = [
  { value: 'perMonth', label: 'Per måned' },
  { value: 'perYear', label: 'Per år' },
] as const

export function AdvancedCalculatorPage() {
  const {
    loanParameters,
    comparison,
    setPrincipal,
    setAnnualInterestRatePercent,
    setInterestRateAfterInterestOnlyPeriodPercent,
    setNumberOfTerms,
    setNumberOfInterestOnlyTerms,
    setExtendsTermByInterestOnlyPeriod,
    resetToDefaults,
  } = useRepaymentPlan()

  const [costView, setCostView] = useState<CostChartView>('accumulatedInterest')
  const [grouping, setGrouping] = useState<ScheduleGrouping>('perMonth')

  const keyFigures = useKeyFigures(loanParameters, comparison)
  const remainingDebtChart = useRemainingDebtChart(loanParameters, comparison)
  const costChart = useCostChart(loanParameters, comparison, costView)
  const schedule = useScheduleRows(
    comparison.planWithoutInterestOnlyPeriod,
    comparison.planWithInterestOnlyPeriod,
    grouping,
  )

  const simpleHref = buildRouteHref(
    'calculator',
    import.meta.env.BASE_URL,
    `?${buildSearchFromLoanParameters(loanParameters)}`,
  )

  const interestOnlyDescription =
    loanParameters.numberOfInterestOnlyTerms > 0
      ? `Det skraverte feltet er de ${formatTermsAsYearsAndMonths(loanParameters.numberOfInterestOnlyTerms)} med avdragsfrihet.`
      : 'Uten avdragsfrie terminer er de to planene identiske.'

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Avdragsfrikalkulator</h1>
        <p className={styles.subtitle}>
          Sammenlign terminbeløp, restgjeld og samlet rentekostnad med og uten
          avdragsfrihet.
        </p>
      </header>

      <main className={styles.layout}>
        <aside className={styles.sidebar}>
          <LoanForm
            principal={loanParameters.principal}
            annualInterestRatePercent={loanParameters.annualInterestRatePercent}
            interestRateAfterInterestOnlyPeriodPercent={
              loanParameters.interestRateAfterInterestOnlyPeriodPercent
            }
            numberOfTerms={loanParameters.numberOfTerms}
            numberOfInterestOnlyTerms={
              loanParameters.numberOfInterestOnlyTerms
            }
            effectiveInterestOnlyTerms={comparison.effectiveInterestOnlyTerms}
            extendsTermByInterestOnlyPeriod={
              loanParameters.extendsTermByInterestOnlyPeriod
            }
            onPrincipalChange={setPrincipal}
            onAnnualInterestRatePercentChange={setAnnualInterestRatePercent}
            onInterestRateAfterInterestOnlyPeriodPercentChange={
              setInterestRateAfterInterestOnlyPeriodPercent
            }
            onNumberOfTermsChange={setNumberOfTerms}
            onNumberOfInterestOnlyTermsChange={setNumberOfInterestOnlyTerms}
            onExtendsTermByInterestOnlyPeriodChange={
              setExtendsTermByInterestOnlyPeriod
            }
            onReset={resetToDefaults}
          />
        </aside>

        <div className={styles.content}>
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

          <RepaymentScheduleTable
            title="Nedbetalingsplan"
            description="Begge planene side om side. De skraverte cellene er terminene uten avdrag. Beløpene er vist med øre."
            columnLabels={schedule.columnLabels}
            rows={schedule.rows}
            totalRow={schedule.totalRow}
            controls={
              <SegmentedControl
                options={GROUPING_OPTIONS}
                selectedValue={grouping}
                ariaLabel="Velg oppløsning i tabellen"
                onChange={setGrouping}
              />
            }
          />
        </div>
      </main>

      <footer className={styles.footer}>
        <p>
          Annuitetslån med nominell rente og månedlige terminer. Gebyrer og
          renteendringer er ikke tatt med.
        </p>
        <p>
          <a href={simpleHref}>Tilbake til den enkle kalkulatoren</a>
        </p>
      </footer>
    </div>
  )
}
