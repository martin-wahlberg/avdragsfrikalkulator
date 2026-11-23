export interface SimpleLoanFormProps {
  principal: number
  annualInterestRatePercent: number
  numberOfTerms: number
  numberOfInterestOnlyTerms: number
  extendsTermByInterestOnlyPeriod: boolean
  onPrincipalChange: (principal: number) => void
  onAnnualInterestRatePercentChange: (annualInterestRatePercent: number) => void
  onNumberOfTermsChange: (numberOfTerms: number) => void
  onNumberOfInterestOnlyTermsChange: (numberOfInterestOnlyTerms: number) => void
  onExtendsTermByInterestOnlyPeriodChange: (
    extendsTermByInterestOnlyPeriod: boolean,
  ) => void
  onReset: () => void
}
