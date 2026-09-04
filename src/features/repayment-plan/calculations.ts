import {
  calculateMonthlyInterestRate,
  calculatePayment,
} from './annuity'
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
  numberOfTerms,
}: LoanParameters): RepaymentPlan {
  const monthlyInterestRate = calculateMonthlyInterestRate(
    annualInterestRatePercent,
  )
  const fixedPayment = calculatePayment(
    monthlyInterestRate,
    numberOfTerms,
    principal,
  )

  const terms: Term[] = []
  let remainingDebt = principal

  for (let termNumber = 1; termNumber <= numberOfTerms; termNumber += 1) {
    const interest = remainingDebt * monthlyInterestRate
    const principalRepayment = fixedPayment - interest
    remainingDebt -= principalRepayment

    terms.push({
      termNumber,
      payment: fixedPayment,
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
  numberOfTerms,
  numberOfInterestOnlyTerms,
}: LoanParameters): RepaymentPlan {
  const monthlyInterestRate = calculateMonthlyInterestRate(
    annualInterestRatePercent,
  )
  const numberOfTermsWithRepayment = numberOfTerms - numberOfInterestOnlyTerms
  const paymentAfterInterestOnlyPeriod = calculatePayment(
    monthlyInterestRate,
    numberOfTermsWithRepayment,
    principal,
  )

  const terms: Term[] = []
  let remainingDebt = principal

  for (let termNumber = 1; termNumber <= numberOfTerms; termNumber += 1) {
    const interest = remainingDebt * monthlyInterestRate
    const isInterestOnly = termNumber <= numberOfInterestOnlyTerms
    const principalRepayment = isInterestOnly
      ? 0
      : paymentAfterInterestOnlyPeriod - interest
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
  const { principal, annualInterestRatePercent, numberOfTerms } = loanParameters
  const numberOfTermsWithRepayment =
    numberOfTerms - loanParameters.numberOfInterestOnlyTerms
  const monthlyInterestRate = calculateMonthlyInterestRate(
    annualInterestRatePercent,
  )

  const planWithoutInterestOnlyPeriod =
    calculatePlanWithoutInterestOnlyPeriod(loanParameters)
  const planWithInterestOnlyPeriod =
    calculatePlanWithInterestOnlyPeriod(loanParameters)

  const paymentWithoutInterestOnlyPeriod = calculatePayment(
    monthlyInterestRate,
    numberOfTerms,
    principal,
  )
  const paymentDuringInterestOnlyPeriod = principal * monthlyInterestRate
  const paymentAfterInterestOnlyPeriod = calculatePayment(
    monthlyInterestRate,
    numberOfTermsWithRepayment,
    principal,
  )

  return {
    planWithoutInterestOnlyPeriod,
    planWithInterestOnlyPeriod,
    paymentWithoutInterestOnlyPeriod,
    paymentDuringInterestOnlyPeriod,
    paymentAfterInterestOnlyPeriod,
    monthlySavingDuringInterestOnlyPeriod:
      paymentWithoutInterestOnlyPeriod - paymentDuringInterestOnlyPeriod,
    monthlyIncreaseAfterInterestOnlyPeriod:
      paymentAfterInterestOnlyPeriod - paymentWithoutInterestOnlyPeriod,
    additionalCostOfInterestOnlyPeriod:
      planWithInterestOnlyPeriod.totalCost -
      planWithoutInterestOnlyPeriod.totalCost,
    numberOfTermsWithRepayment,
  }
}
