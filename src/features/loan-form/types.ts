export interface LoanFormProps {
  principal: number
  annualInterestRatePercent: number
  interestRateAfterInterestOnlyPeriodPercent: number
  numberOfTerms: number
  numberOfInterestOnlyTerms: number
  onPrincipalChange: (principal: number) => void
  onAnnualInterestRatePercentChange: (annualInterestRatePercent: number) => void
  onInterestRateAfterInterestOnlyPeriodPercentChange: (
    interestRateAfterInterestOnlyPeriodPercent: number,
  ) => void
  onNumberOfTermsChange: (numberOfTerms: number) => void
  onNumberOfInterestOnlyTermsChange: (numberOfInterestOnlyTerms: number) => void
  onReset: () => void
}
