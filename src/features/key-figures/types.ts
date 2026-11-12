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

export interface KeyFiguresProps {
  headline: KeyFigureHeadline
  figures: KeyFigure[]
}
