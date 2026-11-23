import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import styles from './info-tooltip.module.css'
import type { InfoTooltipProps } from './types'

const VIEWPORT_MARGIN = 8

export function InfoTooltip({ label, calculation }: InfoTooltipProps) {
  const [isHighlighted, setIsHighlighted] = useState(false)
  const [isPinnedOpen, setIsPinnedOpen] = useState(false)
  const [horizontalCorrection, setHorizontalCorrection] = useState(0)
  const wrapperElement = useRef<HTMLSpanElement | null>(null)
  const tooltipElement = useRef<HTMLSpanElement | null>(null)
  const tooltipIdentifier = useId()
  const isVisible = isHighlighted || isPinnedOpen

  function hide() {
    setIsHighlighted(false)
    setIsPinnedOpen(false)
    setHorizontalCorrection(0)
  }

  useLayoutEffect(() => {
    const element = tooltipElement.current

    if (element === null) {
      return
    }

    const rectangle = element.getBoundingClientRect()
    const overflowLeft = VIEWPORT_MARGIN - rectangle.left
    const overflowRight =
      rectangle.right - (document.documentElement.clientWidth - VIEWPORT_MARGIN)

    if (overflowLeft > 0) {
      setHorizontalCorrection(overflowLeft)
    } else if (overflowRight > 0) {
      setHorizontalCorrection(-overflowRight)
    }
  }, [isVisible])

  useEffect(() => {
    if (!isPinnedOpen) {
      return
    }

    function closeWhenPointerLandsOutside(event: PointerEvent) {
      const wrapper = wrapperElement.current
      const target = event.target

      if (
        wrapper !== null &&
        target instanceof Node &&
        !wrapper.contains(target)
      ) {
        setIsHighlighted(false)
        setIsPinnedOpen(false)
        setHorizontalCorrection(0)
      }
    }

    document.addEventListener('pointerdown', closeWhenPointerLandsOutside)

    return () =>
      document.removeEventListener('pointerdown', closeWhenPointerLandsOutside)
  }, [isPinnedOpen])

  return (
    <span
      className={styles.wrapper}
      onMouseEnter={() => setIsHighlighted(true)}
      onMouseLeave={() => setIsHighlighted(false)}
      ref={wrapperElement}
    >
      <button
        aria-describedby={isVisible ? tooltipIdentifier : undefined}
        aria-expanded={isPinnedOpen}
        aria-label={label}
        className={styles.trigger}
        onBlur={() => {
          if (!isPinnedOpen) {
            hide()
          }
        }}
        onClick={() => {
          if (isPinnedOpen) {
            hide()
          } else {
            setIsPinnedOpen(true)
          }
        }}
        onFocus={() => setIsHighlighted(true)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            hide()
          }
        }}
        type="button"
      >
        i
      </button>

      {isVisible ? (
        <span
          className={styles.tooltip}
          id={tooltipIdentifier}
          ref={tooltipElement}
          role="tooltip"
          style={{
            transform: `translateX(calc(-50% + ${horizontalCorrection}px))`,
          }}
        >
          {calculation}
        </span>
      ) : null}
    </span>
  )
}
