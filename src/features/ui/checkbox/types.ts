export interface CheckboxProps {
  label: string
  checked: boolean
  helpText?: string
  onChange: (checked: boolean) => void
}
