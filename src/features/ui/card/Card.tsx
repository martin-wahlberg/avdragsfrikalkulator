import type { ReactNode } from 'react'
import styles from './card.module.css'

interface CardProps {
  title?: string
  description?: string
  action?: ReactNode
  children: ReactNode
}

export function Card({ title, description, action, children }: CardProps) {
  const hasHeader = title !== undefined || action !== undefined

  return (
    <section className={styles.card}>
      {hasHeader ? (
        <header className={styles.header}>
          <div>
            {title === undefined ? null : (
              <h2 className={styles.title}>{title}</h2>
            )}
            {description === undefined ? null : (
              <p className={styles.description}>{description}</p>
            )}
          </div>
          {action}
        </header>
      ) : null}
      {children}
    </section>
  )
}
