import type { ReactNode } from 'react'
import './Card.css'

interface CardProps {
  title?: string
  description?: string
  action?: ReactNode
  children: ReactNode
}

export function Card({ title, description, action, children }: CardProps) {
  const hasHeader = title !== undefined || action !== undefined

  return (
    <section className="card">
      {hasHeader ? (
        <header className="card__header">
          <div>
            {title === undefined ? null : (
              <h2 className="card__title">{title}</h2>
            )}
            {description === undefined ? null : (
              <p className="card__description">{description}</p>
            )}
          </div>
          {action}
        </header>
      ) : null}
      {children}
    </section>
  )
}
