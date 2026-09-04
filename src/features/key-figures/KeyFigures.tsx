import './KeyFigures.css'

export type KeyFigureTone = 'neutral' | 'positive' | 'negative'

export interface KeyFigure {
  label: string
  value: string
  note?: string
  noteTone?: KeyFigureTone
}

export interface KeyFigureHeadline {
  label: string
  value: string
  note: string
}

interface KeyFiguresProps {
  headline: KeyFigureHeadline
  figures: KeyFigure[]
}

const NOTE_CLASS_NAMES: Record<KeyFigureTone, string> = {
  neutral: 'key-figures__note',
  positive: 'key-figures__note key-figures__note--positive',
  negative: 'key-figures__note key-figures__note--negative',
}

export function KeyFigures({ headline, figures }: KeyFiguresProps) {
  return (
    <div className="key-figures">
      <section className="key-figures__headline">
        <p className="key-figures__headline-label">{headline.label}</p>
        <p className="key-figures__headline-value">{headline.value}</p>
        <p className="key-figures__headline-note">{headline.note}</p>
      </section>

      <div className="key-figures__grid">
        {figures.map((figure) => (
          <article className="key-figures__figure" key={figure.label}>
            <p className="key-figures__label">{figure.label}</p>
            <p className="key-figures__value">{figure.value}</p>
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
