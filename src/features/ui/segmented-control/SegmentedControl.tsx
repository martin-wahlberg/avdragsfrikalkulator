import styles from './segmented-control.module.css'

export interface SegmentedControlOption<Value extends string> {
  value: Value
  label: string
}

interface SegmentedControlProps<Value extends string> {
  options: readonly SegmentedControlOption<Value>[]
  selectedValue: Value
  ariaLabel: string
  onChange: (value: Value) => void
}

export function SegmentedControl<Value extends string>({
  options,
  selectedValue,
  ariaLabel,
  onChange,
}: SegmentedControlProps<Value>) {
  return (
    <div className={styles.control} role="group" aria-label={ariaLabel}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={styles.segment}
          aria-pressed={option.value === selectedValue}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
