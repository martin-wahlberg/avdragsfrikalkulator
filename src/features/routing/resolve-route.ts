import type { RouteName } from './types'

const ADVANCED_SEGMENT = 'advanced'

export function resolveRouteFromPath(pathname: string): RouteName {
  const lastSegment = pathname.split('/').filter(Boolean).at(-1)

  return lastSegment === ADVANCED_SEGMENT ? 'advancedCalculator' : 'calculator'
}

/**
 * Lenker beholder spørringen, slik at lånet du ser på følger med når du
 * bytter mellom den enkle og den avanserte siden.
 */
export function buildRouteHref(
  route: RouteName,
  basePath: string,
  search: string,
): string {
  const pathWithTrailingSlash = basePath.endsWith('/')
    ? basePath
    : `${basePath}/`
  const path =
    route === 'advancedCalculator'
      ? `${pathWithTrailingSlash}${ADVANCED_SEGMENT}`
      : pathWithTrailingSlash

  return `${path}${search}`
}
