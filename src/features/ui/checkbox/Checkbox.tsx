import { useId } from 'react'
import styles from './checkbox.module.css'
import type { CheckboxProps } from './types'

export function Checkbox({
  label,
  checked,
  helpText,
  onChange,
}: CheckboxProps) {
  const fieldIdentifier = useId()

  return (
    <div>
      <div className={styles.row}>
        <input
          className={styles.input}
          id={fieldIdentifier}
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
        />
        <label className={styles.label} htmlFor={fieldIdentifier}>
          {label}
        </label>
      </div>

      {helpText === undefined ? null : (
        <p className={styles.helpText}>{helpText}</p>
      )}
    </div>
  )
}
