import { InfoTooltip } from '../ui/info-tooltip/InfoTooltip'
import styles from './key-figures.module.css'
import type { KeyFiguresProps, KeyFigureTone } from './types'

const NOTE_CLASS_NAMES: Record<KeyFigureTone, string> = {
  neutral: styles.note,
  positive: `${styles.note} ${styles.notePositive}`,
  negative: `${styles.note} ${styles.noteNegative}`,
}

export function KeyFigures({ headline, figures }: KeyFiguresProps) {
  return (
    <div className={styles.keyFigures}>
      <section className={styles.headline}>
        <p className={styles.headlineLabel}>
          {headline.label}
          {headline.calculation === undefined ? null : (
            <>
              {' '}
              <InfoTooltip
                label={`Vis utregningen bak ${headline.label.toLowerCase()}`}
                calculation={headline.calculation}
              />
            </>
          )}
        </p>
        <p className={styles.headlineValue}>{headline.value}</p>
        <p className={styles.headlineNote}>{headline.note}</p>
      </section>

      <div className={styles.grid}>
        {figures.map((figure) => (
          <article className={styles.figure} key={figure.label}>
            <p className={styles.label}>
              {figure.label}
              {figure.calculation === undefined ? null : (
                <>
                  {' '}
                  <InfoTooltip
                    label={`Vis utregningen bak ${figure.label.toLowerCase()}`}
                    calculation={figure.calculation}
                  />
                </>
              )}
            </p>
            <p className={styles.value}>{figure.value}</p>
            {figure.note === undefined ? null : (
              <p className={NOTE_CLASS_NAMES[figure.noteTone ?? 'neutral']}>
                {figure.note}
              </p>
            )}
          </article>
        ))}
      </div>
    </div>
  )
}
