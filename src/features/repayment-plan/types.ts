export interface LoanParameters {
  principal: number
  annualInterestRatePercent: number
  numberOfTerms: number
  numberOfInterestOnlyTerms: number
}

export interface Term {
  termNumber: number
  payment: number
  interest: number
  principalRepayment: number
  remainingDebt: number
  isInterestOnly: boolean
}

export interface RepaymentPlan {
  terms: Term[]
  totalCost: number
  totalInterestCost: number
}

export interface RepaymentPlanComparison {
  planWithoutInterestOnlyPeriod: RepaymentPlan
  planWithInterestOnlyPeriod: RepaymentPlan
  paymentWithoutInterestOnlyPeriod: number
  paymentDuringInterestOnlyPeriod: number
  paymentAfterInterestOnlyPeriod: number
  monthlySavingDuringInterestOnlyPeriod: number
  monthlyIncreaseAfterInterestOnlyPeriod: number
  additionalCostOfInterestOnlyPeriod: number
  numberOfTermsWithRepayment: number
}
