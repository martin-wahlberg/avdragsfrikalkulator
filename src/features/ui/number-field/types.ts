export interface NumberFieldProps {
  label: string
  value: number
  minimum?: number
  maximum?: number
  step: number
  unit: string
  helpText?: string
  onChange: (value: number) => void
}
