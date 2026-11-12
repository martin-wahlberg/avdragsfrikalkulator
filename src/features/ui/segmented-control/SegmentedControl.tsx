import styles from './segmented-control.module.css'
import type { SegmentedControlProps } from './types'

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
