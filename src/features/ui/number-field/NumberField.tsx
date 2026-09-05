import { useId, useState } from 'react'
import styles from './number-field.module.css'

interface NumberFieldProps {
  label: string
  value: number
  minimum: number
  maximum: number
  step: number
  unit: string
  helpText?: string
  onChange: (value: number) => void
}

export function NumberField({
  label,
  value,
  minimum,
  maximum,
  step,
  unit,
  helpText,
  onChange,
}: NumberFieldProps) {
  const fieldIdentifier = useId()
  const [draftValue, setDraftValue] = useState<string | null>(null)

  function clampToRange(candidate: number): number {
    return Math.min(Math.max(candidate, minimum), maximum)
  }

  function handleChange(rawValue: string) {
    setDraftValue(rawValue)

    if (rawValue === '') {
      return
    }

    const parsedValue = Number(rawValue)

    if (!Number.isNaN(parsedValue)) {
      onChange(parsedValue)
    }
  }

  function handleBlur() {
    setDraftValue(null)
    onChange(clampToRange(value))
  }

  return (
    <div>
      <label className={styles.label} htmlFor={fieldIdentifier}>
        {label}
      </label>

      <div className={styles.control}>
        <input
          className={styles.input}
          id={fieldIdentifier}
          type="number"
          inputMode="decimal"
          value={draftValue === null ? value : draftValue}
          min={minimum}
          max={maximum}
          step={step}
          onChange={(event) => handleChange(event.target.value)}
          onBlur={handleBlur}
        />
        <span className={styles.unit}>{unit}</span>
      </div>

      {helpText === undefined ? null : (
        <p className={styles.helpText}>{helpText}</p>
      )}
    </div>
  )
}
