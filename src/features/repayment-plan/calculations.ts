import { calculateMonthlyInterestRate, calculatePayment } from './annuity'
import { findEqualPaymentInterestRatePercent } from './equal-payment-rate'
import type {
  LoanParameters,
  RepaymentPlan,
  RepaymentPlanComparison,
  Term,
} from './types'

function summarizeTerms(terms: Term[]): RepaymentPlan {
  let totalCost = 0
  let totalInterestCost = 0

  for (const term of terms) {
    totalCost += term.payment
    totalInterestCost += term.interest
  }

  return { terms, totalCost, totalInterestCost }
}

export function calculatePlanWithoutInterestOnlyPeriod({
  principal,
  annualInterestRatePercent,
  interestRateAfterInterestOnlyPeriodPercent,
  numberOfTerms,
  numberOfInterestOnlyTerms,
}: LoanParameters): RepaymentPlan {
  const rateBeforeChange = calculateMonthlyInterestRate(
    annualInterestRatePercent,
  )
  const rateAfterChange = calculateMonthlyInterestRate(
    interestRateAfterInterestOnlyPeriodPercent,
  )
  const paymentBeforeChange = calculatePayment(
    rateBeforeChange,
    numberOfTerms,
    principal,
  )

  const terms: Term[] = []
  let remainingDebt = principal

  for (
    let termNumber = 1;
    termNumber <= numberOfInterestOnlyTerms;
    termNumber += 1
  ) {
    const interest = remainingDebt * rateBeforeChange
    const principalRepayment = paymentBeforeChange - interest
    remainingDebt -= principalRepayment

    terms.push({
      termNumber,
      payment: paymentBeforeChange,
      interest,
      principalRepayment,
      remainingDebt,
      isInterestOnly: false,
    })
  }

  const paymentAfterChange = calculatePayment(
    rateAfterChange,
    numberOfTerms - numberOfInterestOnlyTerms,
    remainingDebt,
  )

  for (
    let termNumber = numberOfInterestOnlyTerms + 1;
    termNumber <= numberOfTerms;
    termNumber += 1
  ) {
    const interest = remainingDebt * rateAfterChange
    const principalRepayment = paymentAfterChange - interest
    remainingDebt -= principalRepayment

    terms.push({
      termNumber,
      payment: paymentAfterChange,
      interest,
      principalRepayment,
      remainingDebt,
      isInterestOnly: false,
    })
  }

  return summarizeTerms(terms)
}

export function calculatePlanWithInterestOnlyPeriod({
  principal,
  annualInterestRatePercent,
  interestRateAfterInterestOnlyPeriodPercent,
  numberOfTerms,
  numberOfInterestOnlyTerms,
}: LoanParameters): RepaymentPlan {
  const rateBeforeChange = calculateMonthlyInterestRate(
    annualInterestRatePercent,
  )
  const rateAfterChange = calculateMonthlyInterestRate(
    interestRateAfterInterestOnlyPeriodPercent,
  )
  const paymentAfterChange = calculatePayment(
    rateAfterChange,
    numberOfTerms - numberOfInterestOnlyTerms,
    principal,
  )

  const terms: Term[] = []
  let remainingDebt = principal

  for (let termNumber = 1; termNumber <= numberOfTerms; termNumber += 1) {
    const isInterestOnly = termNumber <= numberOfInterestOnlyTerms
    const interest =
      remainingDebt * (isInterestOnly ? rateBeforeChange : rateAfterChange)
    const principalRepayment = isInterestOnly
      ? 0
      : paymentAfterChange - interest
    remainingDebt -= principalRepayment

    terms.push({
      termNumber,
      payment: interest + principalRepayment,
      interest,
      principalRepayment,
      remainingDebt,
      isInterestOnly,
    })
  }

  return summarizeTerms(terms)
}

export function compareRepaymentPlans(
  loanParameters: LoanParameters,
): RepaymentPlanComparison {
  const {
    principal,
    annualInterestRatePercent,
    interestRateAfterInterestOnlyPeriodPercent,
    numberOfTerms,
    numberOfInterestOnlyTerms,
  } = loanParameters

  const numberOfTermsWithRepayment = numberOfTerms - numberOfInterestOnlyTerms
  const rateBeforeChange = calculateMonthlyInterestRate(
    annualInterestRatePercent,
  )
  const rateAfterChange = calculateMonthlyInterestRate(
    interestRateAfterInterestOnlyPeriodPercent,
  )

  const planWithoutInterestOnlyPeriod =
    calculatePlanWithoutInterestOnlyPeriod(loanParameters)
  const planWithInterestOnlyPeriod =
    calculatePlanWithInterestOnlyPeriod(loanParameters)

  const paymentWithoutInterestOnlyPeriod = calculatePayment(
    rateBeforeChange,
    numberOfTerms,
    principal,
  )
  const paymentDuringInterestOnlyPeriod = principal * rateBeforeChange
  const paymentAfterInterestOnlyPeriod = calculatePayment(
    rateAfterChange,
    numberOfTermsWithRepayment,
    principal,
  )

  const debtWhenRateChanges =
    numberOfInterestOnlyTerms === 0
      ? principal
      : planWithoutInterestOnlyPeriod.terms[numberOfInterestOnlyTerms - 1]
          .remainingDebt
  const paymentAfterRateChangeWithoutInterestOnlyPeriod = calculatePayment(
    rateAfterChange,
    numberOfTermsWithRepayment,
    debtWhenRateChanges,
  )

  return {
    planWithoutInterestOnlyPeriod,
    planWithInterestOnlyPeriod,
    paymentWithoutInterestOnlyPeriod,
    paymentDuringInterestOnlyPeriod,
    paymentAfterInterestOnlyPeriod,
    paymentAfterRateChangeWithoutInterestOnlyPeriod,
    monthlySavingDuringInterestOnlyPeriod:
      paymentWithoutInterestOnlyPeriod - paymentDuringInterestOnlyPeriod,
    monthlyIncreaseAfterInterestOnlyPeriod:
      paymentAfterInterestOnlyPeriod -
      paymentAfterRateChangeWithoutInterestOnlyPeriod,
    additionalCostOfInterestOnlyPeriod:
      planWithInterestOnlyPeriod.totalCost -
      planWithoutInterestOnlyPeriod.totalCost,
    numberOfTermsWithRepayment,
    equalPaymentInterestRatePercent: findEqualPaymentInterestRatePercent(
      loanParameters,
    ),
  }
}
