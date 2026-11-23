import styles from './disclosure.module.css'
import type { DisclosureProps } from './types'

export function Disclosure({ summary, children }: DisclosureProps) {
  return (
    <details className={styles.disclosure}>
      <summary className={styles.summary}>{summary}</summary>
      <div className={styles.content}>{children}</div>
    </details>
  )
}
