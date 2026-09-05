import { useState } from 'react'
import { KeyFigures } from '../../features/key-figures/KeyFigures'
import { LoanForm } from '../../features/loan-form/LoanForm'
import { useRepaymentPlan } from '../../features/repayment-plan/use-repayment-plan'
import { RepaymentScheduleTable } from '../../features/repayment-schedule-table/RepaymentScheduleTable'
import { Card } from '../../features/ui/card/Card'
import { LineChart } from '../../features/ui/line-chart/LineChart'
import { SegmentedControl } from '../../features/ui/segmented-control/SegmentedControl'
import {
  formatCompactNumber,
  formatCurrency,
  formatTermsAsYearsAndMonths,
} from '../../features/formatting/formatting'
import { useCostChart, useRemainingDebtChart } from '../../features/loan-comparison/use-chart-series'
import type { CostChartView } from '../../features/loan-comparison/use-chart-series'
import { useKeyFigures } from '../../features/loan-comparison/use-key-figures'
import { useScheduleRows } from '../../features/loan-comparison/use-schedule-rows'
import type { ScheduleGrouping } from '../../features/loan-comparison/use-schedule-rows'
import styles from './calculator-page.module.css'

const MONTHS_PER_TICK = 60

const COST_VIEW_OPTIONS = [
  { value: 'accumulatedInterest', label: 'Akkumulerte renter' },
  { value: 'payment', label: 'Terminbeløp' },
] as const

const GROUPING_OPTIONS = [
  { value: 'perMonth', label: 'Per måned' },
  { value: 'perYear', label: 'Per år' },
] as const

function formatYearTick(pointIndex: number): string {
  return `${pointIndex / 12} år`
}

function formatTermLabel(pointIndex: number): string {
  return `Etter termin ${pointIndex}`
}

export function CalculatorPage() {
  const {
    loanParameters,
    comparison,
    setPrincipal,
    setAnnualInterestRatePercent,
    setInterestRateAfterInterestOnlyPeriodPercent,
    setNumberOfTerms,
    setNumberOfInterestOnlyTerms,
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
            onPrincipalChange={setPrincipal}
            onAnnualInterestRatePercentChange={setAnnualInterestRatePercent}
            onInterestRateAfterInterestOnlyPeriodPercentChange={
              setInterestRateAfterInterestOnlyPeriodPercent
            }
            onNumberOfTermsChange={setNumberOfTerms}
            onNumberOfInterestOnlyTermsChange={setNumberOfInterestOnlyTerms}
            onReset={resetToDefaults}
          />
        </aside>

        <div className={styles.content}>
          <KeyFigures
            headline={keyFigures.headline}
            figures={keyFigures.figures}
          />

          <Card
            title="Restgjeld gjennom løpetiden"
            description={`Med avdragsfrihet står gjelden stille, og må hentes inn igjen på færre terminer. ${interestOnlyDescription}`}
          >
            <LineChart
              series={remainingDebtChart.series}
              maximumValue={remainingDebtChart.maximumValue}
              shadedPointCount={remainingDebtChart.shadedPointCount}
              pointsBetweenTicks={MONTHS_PER_TICK}
              formatValue={formatCurrency}
              formatAxisValue={formatCompactNumber}
              formatTickLabel={formatYearTick}
              formatPointLabel={formatTermLabel}
              ariaLabel="Linjediagram over restgjeld med og uten avdragsfrihet gjennom hele løpetiden"
            />
          </Card>

          <Card
            title="Kostnader gjennom løpetiden"
            description={
              costView === 'accumulatedInterest'
                ? 'Summen av alt du har betalt i renter så langt. Avstanden mellom linjene på slutten er merkostnaden ved avdragsfrihet.'
                : 'Hva du betaler hver måned. Med avdragsfrihet betaler du mindre i starten og mer resten av løpetiden.'
            }
            action={
              <SegmentedControl
                options={COST_VIEW_OPTIONS}
                selectedValue={costView}
                ariaLabel="Velg hva kostnadsgrafen viser"
                onChange={setCostView}
              />
            }
          >
            <LineChart
              series={costChart.series}
              maximumValue={costChart.maximumValue}
              shadedPointCount={costChart.shadedPointCount}
              pointsBetweenTicks={MONTHS_PER_TICK}
              formatValue={formatCurrency}
              formatAxisValue={formatCompactNumber}
              formatTickLabel={formatYearTick}
              formatPointLabel={formatTermLabel}
              ariaLabel={
                costView === 'accumulatedInterest'
                  ? 'Linjediagram over akkumulerte renter med og uten avdragsfrihet'
                  : 'Linjediagram over terminbeløp med og uten avdragsfrihet'
              }
            />
          </Card>

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
      </footer>
    </div>
  )
}
