import { describe, expect, it } from 'vitest'
import { buildRouteHref, resolveRouteFromPath } from './resolve-route'

describe('resolveRouteFromPath', () => {
  it('velger den enkle siden på rota', () => {
    expect(resolveRouteFromPath('/')).toBe('calculator')
    expect(resolveRouteFromPath('/avdragsfrikalkulator/')).toBe('calculator')
    expect(resolveRouteFromPath('/avdragsfrikalkulator')).toBe('calculator')
  })

  it('velger den avanserte siden på /advanced', () => {
    expect(resolveRouteFromPath('/advanced')).toBe('advancedCalculator')
    expect(resolveRouteFromPath('/avdragsfrikalkulator/advanced')).toBe(
      'advancedCalculator',
    )
  })

  it('tåler etterfølgende skråstrek på den avanserte siden', () => {
    expect(resolveRouteFromPath('/avdragsfrikalkulator/advanced/')).toBe(
      'advancedCalculator',
    )
  })

  it('faller tilbake til den enkle siden på ukjente stier', () => {
    expect(resolveRouteFromPath('/avdragsfrikalkulator/noe-annet')).toBe(
      'calculator',
    )
  })
})

describe('buildRouteHref', () => {
  it('bygger lenker under prosjektets base', () => {
    expect(buildRouteHref('calculator', '/avdragsfrikalkulator/', '')).toBe(
      '/avdragsfrikalkulator/',
    )
    expect(
      buildRouteHref('advancedCalculator', '/avdragsfrikalkulator/', ''),
    ).toBe('/avdragsfrikalkulator/advanced')
  })

  it('tar med spørringen så lånet følger med', () => {
    expect(
      buildRouteHref('advancedCalculator', '/avdragsfrikalkulator/', '?belop=2'),
    ).toBe('/avdragsfrikalkulator/advanced?belop=2')
  })

  it('tåler base uten etterfølgende skråstrek', () => {
    expect(buildRouteHref('advancedCalculator', '/base', '')).toBe(
      '/base/advanced',
    )
  })
})
