export interface SegmentedControlOption<Value extends string> {
  value: Value
  label: string
}

export interface SegmentedControlProps<Value extends string> {
  options: readonly SegmentedControlOption<Value>[]
  selectedValue: Value
  ariaLabel: string
  onChange: (value: Value) => void
}
